import { api, Query } from "encore.dev/api";
import db from "../db";

export interface GalleryRequest {
  limit?: Query<number>;
  offset?: Query<number>;
  search?: Query<string>;
  tags?: Query<string>;
  genre?: Query<string>;
  sort?: Query<string>;
}

export interface GalleryProject {
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
}

export interface GalleryResponse {
  projects: GalleryProject[];
  total: number;
}

// Lists published projects in the public gallery.
export const gallery = api<GalleryRequest, GalleryResponse>(
  { expose: true, method: "GET", path: "/gallery" },
  async (req) => {
    const limit = Math.min(req.limit || 20, 100);
    const offset = req.offset || 0;
    
    let whereConditions = ["p.status = 'published'"];
    let orderBy = "p.created_at DESC";

    if (req.search) {
      whereConditions.push(`(p.title ILIKE '%${req.search}%' OR p.description ILIKE '%${req.search}%')`);
    }

    if (req.tags) {
      const tags = req.tags.split(',').map(t => t.trim());
      whereConditions.push(`p.tags && ${tags}`);
    }

    if (req.genre) {
      whereConditions.push(`p.genre = '${req.genre}'`);
    }

    if (req.sort === 'popular') {
      orderBy = "play_count DESC, p.created_at DESC";
    } else if (req.sort === 'trending') {
      // Simple trending: popular in last 7 days
      orderBy = "recent_plays DESC, p.created_at DESC";
    }

    const whereClause = whereConditions.join(' AND ');

    const projects = await db.queryAll`
      SELECT 
        p.id, p.slug, p.title, p.description, p.tags, p.genre, p.thumb_url, p.created_at,
        u.username, u.display_name, u.avatar_url,
        COALESCE(stats.play_count, 0) as play_count,
        COALESCE(recent_stats.recent_plays, 0) as recent_plays
      FROM projects p
      JOIN users u ON u.id = p.user_id
      LEFT JOIN (
        SELECT project_id, COUNT(*) as play_count
        FROM player_sessions
        GROUP BY project_id
      ) stats ON stats.project_id = p.id
      LEFT JOIN (
        SELECT project_id, COUNT(*) as recent_plays
        FROM player_sessions
        WHERE started_at > NOW() - INTERVAL '7 days'
        GROUP BY project_id
      ) recent_stats ON recent_stats.project_id = p.id
      WHERE ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ${limit} OFFSET ${offset}
    `;

    const totalResult = await db.queryRow`
      SELECT COUNT(*) as count FROM projects p WHERE ${whereClause}
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
        creator: {
          username: p.username,
          displayName: p.display_name,
          avatarUrl: p.avatar_url,
        },
        createdAt: p.created_at.toISOString(),
        plays: parseInt(p.play_count || "0"),
      })),
      total: parseInt(totalResult?.count || "0"),
    };
  }
);
