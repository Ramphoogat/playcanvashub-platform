import { api, APIError, Cookie } from "encore.dev/api";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import db from "../db";
import { generateAccessToken, generateRefreshToken, hashToken } from "./tokens";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    displayName: string;
    username: string;
    role: string;
    emailVerified: boolean;
  };
  session: Cookie<"session">;
}

// Authenticates a user and creates a session.
export const login = api<LoginRequest, LoginResponse>(
  { expose: true, method: "POST", path: "/auth/login" },
  async (req) => {
    // Find user by email
    const user = await db.queryRow`
      SELECT id, email, password_hash, display_name, username, role, email_verified_at
      FROM users 
      WHERE email = ${req.email}
    `;

    if (!user) {
      throw APIError.unauthenticated("Invalid email or password");
    }

    // Verify password
    const isValid = await bcrypt.compare(req.password, user.password_hash);
    if (!isValid) {
      throw APIError.unauthenticated("Invalid email or password");
    }

    // Generate tokens
    const userId = user.id.toString();
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);
    const clientId = crypto.randomUUID();

    // Store refresh token
    const refreshTokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await db.exec`
      INSERT INTO sessions (user_id, client_id, refresh_token_hash, expires_at)
      VALUES (${user.id}, ${clientId}, ${refreshTokenHash}, ${expiresAt})
    `;

    return {
      user: {
        id: userId,
        email: user.email,
        displayName: user.display_name,
        username: user.username,
        role: user.role,
        emailVerified: !!user.email_verified_at,
      },
      session: {
        value: accessToken,
        expires: expiresAt,
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
      },
    };
  }
);
