import { Gateway, Header, Cookie, APIError } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import { verifyAccessToken } from "./tokens";
import db from "../db";

interface AuthParams {
  authorization?: Header<"Authorization">;
  session?: Cookie<"session">;
}

export interface AuthData {
  userID: string;
  email: string;
  displayName: string;
  username: string;
  role: string;
  emailVerified: boolean;
  avatarUrl?: string;
}

export const auth = authHandler<AuthParams, AuthData>(
  async (params) => {
    const token = params.authorization?.replace("Bearer ", "") ?? params.session?.value;
    if (!token) {
      throw APIError.unauthenticated("missing authentication token");
    }

    try {
      const payload = verifyAccessToken(token);
      const user = await db.queryRow`
        SELECT id, email, email_verified_at, display_name, username, role, avatar_url 
        FROM users 
        WHERE id = ${payload.sub}
      `;

      if (!user) {
        throw APIError.unauthenticated("user not found");
      }

      return {
        userID: user.id.toString(),
        email: user.email,
        displayName: user.display_name,
        username: user.username,
        role: user.role,
        emailVerified: !!user.email_verified_at,
        avatarUrl: user.avatar_url,
      };
    } catch (err) {
      throw APIError.unauthenticated("invalid token", err as Error);
    }
  }
);

export const gw = new Gateway({ authHandler: auth });
