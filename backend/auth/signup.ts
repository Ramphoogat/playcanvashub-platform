import { api, APIError } from "encore.dev/api";
import * as bcrypt from "bcrypt";
import db from "../db";
import { generateSecureToken, hashToken } from "./tokens";
import { sendVerificationEmail } from "./email";

export interface SignupRequest {
  email: string;
  password: string;
  displayName: string;
  username: string;
}

export interface SignupResponse {
  message: string;
}

// Creates a new user account and sends email verification.
export const signup = api<SignupRequest, SignupResponse>(
  { expose: true, method: "POST", path: "/auth/signup" },
  async (req) => {
    // Validate input
    if (!req.email || !req.email.includes("@")) {
      throw APIError.invalidArgument("Invalid email address");
    }
    
    if (req.password.length < 8) {
      throw APIError.invalidArgument("Password must be at least 8 characters");
    }
    
    if (!req.username || req.username.length < 3) {
      throw APIError.invalidArgument("Username must be at least 3 characters");
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(req.username)) {
      throw APIError.invalidArgument("Username can only contain letters, numbers, hyphens and underscores");
    }

    // Check if email or username already exists
    const existingUser = await db.queryRow`
      SELECT id FROM users 
      WHERE email = ${req.email} OR username = ${req.username}
    `;
    
    if (existingUser) {
      throw APIError.alreadyExists("Email or username already exists");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(req.password, 12);

    // Create user
    const user = await db.queryRow`
      INSERT INTO users (email, password_hash, display_name, username)
      VALUES (${req.email}, ${passwordHash}, ${req.displayName}, ${req.username})
      RETURNING id
    `;

    if (!user) {
      throw APIError.internal("Failed to create user");
    }

    // Create profile
    await db.exec`
      INSERT INTO profiles (user_id)
      VALUES (${user.id})
    `;

    // Generate verification token
    const token = generateSecureToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.exec`
      INSERT INTO email_verification_tokens (user_id, token_hash, expires_at)
      VALUES (${user.id}, ${tokenHash}, ${expiresAt})
    `;

    // Send verification email
    await sendVerificationEmail(req.email, token);

    return {
      message: "Account created successfully. Please check your email to verify your account.",
    };
  }
);
