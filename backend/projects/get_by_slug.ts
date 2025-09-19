import { api, APIError } from "encore.dev/api";
import db from "../db";

export interface GetProjectRequest {
  slug: string;
}

export interface ProjectDetail {
  id: string;
  slug: string;
  title: string;
  description?: string;
  tags: string[];
  genre?: string;
  thumbUrl?: string;
  creator: {
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  createdAt: string;
  plays: number;
  manifestUrl: string;
}

// Gets a published project by its slug.
export const getBySlug = api<GetProjectRequest, ProjectDetail>(
  { expose: true, method: "GET", path: "/projects/:slug" },
  async (req) => {
    const project = await db.queryRow`
      SELECT 
        p.id, p.slug, p.title, p.description, p.tags, p.genre, p.thumb_url, p.created_at,
        u.username, u.display_name, u.avatar_url,
        v.manifest_json, v.storage_key,
        COALESCE(stats.play_count, 0) as play_count
      FROM projects p
      JOIN users u ON u.id = p.user_id
      LEFT JOIN versions v ON v.id = p.latest_version_id
      LEFT JOIN (
        SELECT project_id, COUNT(*) as play_count
        FROM player_sessions
        GROUP BY project_id
      ) stats ON stats.project_id = p.id
      WHERE p.slug = ${req.slug} AND p.status = 'published'
    `;

    if (!project) {
      throw APIError.notFound("Project not found");
    }

    return {
      id: project.id.toString(),
      slug: project.slug,
      title: project.title,
      description: project.description,
      tags: project.tags || [],
      genre: project.genre,
      thumbUrl: project.thumb_url,
      creator: {
        username: project.username,
        displayName: project.display_name,
        avatarUrl: project.avatar_url,
      },
      createdAt: project.created_at.toISOString(),
      plays: parseInt(project.play_count || "0"),
      manifestUrl: `/api/projects/${project.id}/manifest`,
    };
  }
);
