import { api, APIError, Header } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface StartSessionRequest {
  slug: string;
  userAgent?: Header<"User-Agent">;
  xForwardedFor?: Header<"X-Forwarded-For">;
}

export interface StartSessionResponse {
  sessionId: string;
  projectId: string;
  manifestUrl: string;
}

// Starts a new player session for a project.
export const startSession = api<StartSessionRequest, StartSessionResponse>(
  { expose: true, method: "POST", path: "/player/start/:slug" },
  async (req) => {
    // Get project by slug
    const project = await db.queryRow`
      SELECT p.id, p.title, v.storage_key, v.manifest_json
      FROM projects p
      LEFT JOIN versions v ON v.id = p.latest_version_id
      WHERE p.slug = ${req.slug} AND p.status = 'published'
    `;

    if (!project) {
      throw APIError.notFound("Project not found");
    }

    if (!project.storage_key) {
      throw APIError.invalidArgument("Project has no published version");
    }

    // Get user ID if authenticated
    let userId = null;
    try {
      const auth = getAuthData();
      userId = auth?.userID || null;
    } catch {
      // Not authenticated, continue as anonymous
    }

    // Extract IP address
    const ipAddress = req.xForwardedFor?.split(',')[0]?.trim() || '127.0.0.1';

    // Create player session
    const session = await db.queryRow`
      INSERT INTO player_sessions (project_id, user_id, ip_address, user_agent)
      VALUES (${project.id}, ${userId}, ${ipAddress}, ${req.userAgent})
      RETURNING id
    `;

    if (!session) {
      throw APIError.internal("Failed to create player session");
    }

    return {
      sessionId: session.id.toString(),
      projectId: project.id.toString(),
      manifestUrl: `/api/player/manifest/${project.id}`,
    };
  }
);
