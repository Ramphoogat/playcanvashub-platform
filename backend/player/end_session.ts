import { api, APIError } from "encore.dev/api";
import db from "../db";

export interface EndSessionRequest {
  sessionId: string;
}

export interface EndSessionResponse {
  success: boolean;
}

// Ends a player session and records duration.
export const endSession = api<EndSessionRequest, EndSessionResponse>(
  { expose: true, method: "POST", path: "/player/end" },
  async (req) => {
    const result = await db.exec`
      UPDATE player_sessions 
      SET 
        ended_at = NOW(),
        duration_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))::INTEGER
      WHERE id = ${req.sessionId} AND ended_at IS NULL
    `;

    return {
      success: true,
    };
  }
);
