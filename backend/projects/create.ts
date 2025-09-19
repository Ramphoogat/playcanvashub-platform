import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface CreateProjectRequest {
  title: string;
}

export interface CreateProjectResponse {
  id: string;
  slug: string;
  title: string;
  status: string;
}

// Creates a new project for the authenticated user.
export const create = api<CreateProjectRequest, CreateProjectResponse>(
  { auth: true, expose: true, method: "POST", path: "/projects" },
  async (req) => {
    const auth = getAuthData()!;
    
    if (!req.title || req.title.trim().length === 0) {
      throw APIError.invalidArgument("Title is required");
    }

    if (req.title.length > 200) {
      throw APIError.invalidArgument("Title must be 200 characters or less");
    }

    // Generate slug from title
    const slug = generateSlug(req.title);
    
    // Check if slug already exists
    const existingProject = await db.queryRow`
      SELECT id FROM projects WHERE slug = ${slug}
    `;
    
    if (existingProject) {
      throw APIError.alreadyExists("A project with this title already exists");
    }

    // Create project
    const project = await db.queryRow`
      INSERT INTO projects (user_id, slug, title)
      VALUES (${auth.userID}, ${slug}, ${req.title})
      RETURNING id, slug, title, status
    `;

    if (!project) {
      throw APIError.internal("Failed to create project");
    }

    return {
      id: project.id.toString(),
      slug: project.slug,
      title: project.title,
      status: project.status,
    };
  }
);

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .substring(0, 50);
}
