import { api, Query } from "encore.dev/api";
import db from "../db";

export interface ListCreatorProjectsRequest {
  username: string;
  limit?: Query<number>;
  offset?: Query<number>;
}

export interface CreatorProject {
  id: string;
  slug: string;
  title: string;
  description?: string;
  tags: string[];
  genre?: string;
  thumbUrl?: string;
  createdAt: string;
  plays: number;
}

export interface ListCreatorProjectsResponse {
  projects: CreatorProject[];
  total: number;
}

// Lists published projects by a specific creator.
export const listCreatorProjects = api<ListCreatorProjectsRequest, ListCreatorProjectsResponse>(
  { expose: true, method: "GET", path: "/creators/:username/projects" },
  async (req) => {
    const limit = Math.min(req.limit || 20, 100);
    const offset = req.offset || 0;

    const projects = await db.queryAll`
      SELECT 
        p.id, p.slug, p.title, p.description, p.tags, p.genre, p.thumb_url, p.created_at,
        COALESCE(stats.play_count, 0) as play_count
      FROM projects p
      JOIN users u ON u.id = p.user_id
      LEFT JOIN (
        SELECT project_id, COUNT(*) as play_count
        FROM player_sessions
        GROUP BY project_id
      ) stats ON stats.project_id = p.id
      WHERE u.username = ${req.username} AND p.status = 'published'
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const totalResult = await db.queryRow`
      SELECT COUNT(*) as count 
      FROM projects p
      JOIN users u ON u.id = p.user_id
      WHERE u.username = ${req.username} AND p.status = 'published'
    `;

    return {
      projects: projects.map(p => ({
        id: p.id.toString(),
        slug: p.slug,
        title: p.title,
        description: p.description,
        tags: p.tags || [],
        genre: p.genre,
        thumbUrl: p.thumb_url,
        createdAt: p.created_at.toISOString(),
        plays: parseInt(p.play_count || "0"),
      })),
      total: parseInt(totalResult?.count || "0"),
    };
  }
);
