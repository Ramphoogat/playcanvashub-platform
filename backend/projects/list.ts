import { api, Query } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface ListProjectsRequest {
  limit?: Query<number>;
  offset?: Query<number>;
  status?: Query<string>;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  description?: string;
  tags: string[];
  genre?: string;
  thumbUrl?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListProjectsResponse {
  projects: Project[];
  total: number;
}

// Lists projects for the authenticated user.
export const list = api<ListProjectsRequest, ListProjectsResponse>(
  { auth: true, expose: true, method: "GET", path: "/projects" },
  async (req) => {
    const auth = getAuthData()!;
    const limit = Math.min(req.limit || 20, 100);
    const offset = req.offset || 0;
    
    let whereClause = `WHERE user_id = ${auth.userID}`;
    if (req.status) {
      whereClause += ` AND status = ${req.status}`;
    }

    const projects = await db.queryAll`
      SELECT id, slug, title, description, tags, genre, thumb_url, status, created_at, updated_at
      FROM projects 
      ${whereClause}
      ORDER BY updated_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const totalResult = await db.queryRow`
      SELECT COUNT(*) as count FROM projects ${whereClause}
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
        status: p.status,
        createdAt: p.created_at.toISOString(),
        updatedAt: p.updated_at.toISOString(),
      })),
      total: parseInt(totalResult?.count || "0"),
    };
  }
);
