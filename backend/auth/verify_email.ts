import { api, APIError } from "encore.dev/api";
import db from "../db";
import { hashToken } from "./tokens";

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyEmailResponse {
  message: string;
}

// Verifies a user's email address using a verification token.
export const verifyEmail = api<VerifyEmailRequest, VerifyEmailResponse>(
  { expose: true, method: "POST", path: "/auth/verify-email" },
  async (req) => {
    const tokenHash = hashToken(req.token);
    
    // Find valid token
    const tokenRecord = await db.queryRow`
      SELECT user_id, expires_at, used_at
      FROM email_verification_tokens
      WHERE token_hash = ${tokenHash}
    `;

    if (!tokenRecord) {
      throw APIError.invalidArgument("Invalid verification token");
    }

    if (tokenRecord.used_at) {
      throw APIError.invalidArgument("Verification token already used");
    }

    if (new Date() > tokenRecord.expires_at) {
      throw APIError.invalidArgument("Verification token expired");
    }

    // Mark token as used and verify email
    await db.exec`
      UPDATE email_verification_tokens 
      SET used_at = NOW() 
      WHERE token_hash = ${tokenHash}
    `;

    await db.exec`
      UPDATE users 
      SET email_verified_at = NOW() 
      WHERE id = ${tokenRecord.user_id}
    `;

    return {
      message: "Email verified successfully",
    };
  }
);
