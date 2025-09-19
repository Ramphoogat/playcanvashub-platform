import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface PublishProjectRequest {
  projectId: string;
  versionId: string;
  title: string;
  description?: string;
  tags?: string[];
  genre?: string;
  thumbUrl?: string;
}

export interface PublishProjectResponse {
  success: boolean;
  slug: string;
}

// Publishes a project version making it publicly available.
export const publish = api<PublishProjectRequest, PublishProjectResponse>(
  { auth: true, expose: true, method: "POST", path: "/projects/:projectId/publish" },
  async (req) => {
    const auth = getAuthData()!;
    
    // Check if user has verified email
    if (!auth.emailVerified) {
      throw APIError.permissionDenied("Email verification required to publish projects");
    }

    // Verify project ownership and version
    const project = await db.queryRow`
      SELECT p.id, p.slug, v.id as version_id, v.status as version_status
      FROM projects p
      LEFT JOIN versions v ON v.id = ${req.versionId} AND v.project_id = p.id
      WHERE p.id = ${req.projectId} AND p.user_id = ${auth.userID}
    `;
    
    if (!project) {
      throw APIError.notFound("Project not found");
    }

    if (!project.version_id) {
      throw APIError.notFound("Version not found");
    }

    if (project.version_status !== 'ready') {
      throw APIError.invalidArgument("Version is not ready for publishing");
    }

    // Update project metadata and publish
    await db.exec`
      UPDATE projects 
      SET 
        title = ${req.title},
        description = ${req.description || null},
        tags = ${req.tags || []},
        genre = ${req.genre || null},
        thumb_url = ${req.thumbUrl || null},
        latest_version_id = ${req.versionId},
        status = 'published',
        updated_at = NOW()
      WHERE id = ${req.projectId}
    `;

    return {
      success: true,
      slug: project.slug,
    };
  }
);
