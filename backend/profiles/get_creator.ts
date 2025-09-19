import { api, APIError } from "encore.dev/api";
import db from "../db";

export interface GetCreatorRequest {
  username: string;
}

export interface CreatorProfile {
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  links: Record<string, string>;
  joinedAt: string;
  projectCount: number;
  totalPlays: number;
}

// Gets a creator's public profile by username.
export const getCreator = api<GetCreatorRequest, CreatorProfile>(
  { expose: true, method: "GET", path: "/creators/:username" },
  async (req) => {
    const profile = await db.queryRow`
      SELECT 
        u.username, u.display_name, u.avatar_url, u.created_at,
        p.bio, p.links_json,
        COALESCE(proj_stats.project_count, 0) as project_count,
        COALESCE(play_stats.total_plays, 0) as total_plays
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      LEFT JOIN (
        SELECT user_id, COUNT(*) as project_count
        FROM projects
        WHERE status = 'published'
        GROUP BY user_id
      ) proj_stats ON proj_stats.user_id = u.id
      LEFT JOIN (
        SELECT pr.user_id, COUNT(ps.id) as total_plays
        FROM projects pr
        LEFT JOIN player_sessions ps ON ps.project_id = pr.id
        WHERE pr.status = 'published'
        GROUP BY pr.user_id
      ) play_stats ON play_stats.user_id = u.id
      WHERE u.username = ${req.username}
    `;

    if (!profile) {
      throw APIError.notFound("Creator not found");
    }

    return {
      username: profile.username,
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url,
      bio: profile.bio,
      links: profile.links_json || {},
      joinedAt: profile.created_at.toISOString(),
      projectCount: parseInt(profile.project_count || "0"),
      totalPlays: parseInt(profile.total_plays || "0"),
    };
  }
);
