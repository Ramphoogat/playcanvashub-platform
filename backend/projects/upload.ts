import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { projectBucket } from "../storage";
import db from "../db";
import * as crypto from "crypto";

export interface StartUploadRequest {
  projectId: string;
  filename: string;
  size: number;
}

export interface StartUploadResponse {
  uploadId: string;
  uploadUrl: string;
}

export interface CompleteUploadRequest {
  uploadId: string;
  projectId: string;
}

export interface CompleteUploadResponse {
  versionId: string;
  status: string;
}

// Starts a file upload for a project version.
export const startUpload = api<StartUploadRequest, StartUploadResponse>(
  { auth: true, expose: true, method: "POST", path: "/projects/:projectId/upload/start" },
  async (req) => {
    const auth = getAuthData()!;
    
    // Verify project ownership
    const project = await db.queryRow`
      SELECT id FROM projects 
      WHERE id = ${req.projectId} AND user_id = ${auth.userID}
    `;
    
    if (!project) {
      throw APIError.notFound("Project not found");
    }

    // Validate file size (50MB limit)
    if (req.size > 50 * 1024 * 1024) {
      throw APIError.invalidArgument("File size exceeds 50MB limit");
    }

    // Validate file type
    if (!req.filename.endsWith('.zip')) {
      throw APIError.invalidArgument("Only ZIP files are supported");
    }

    const uploadId = crypto.randomUUID();
    const storageKey = `uploads/${auth.userID}/${req.projectId}/${uploadId}/${req.filename}`;

    // Generate presigned upload URL
    const uploadUrl = await projectBucket.signedUploadUrl(storageKey, {
      ttl: 3600, // 1 hour
    });

    return {
      uploadId,
      uploadUrl: uploadUrl.url,
    };
  }
);

// Completes a file upload and starts processing.
export const completeUpload = api<CompleteUploadRequest, CompleteUploadResponse>(
  { auth: true, expose: true, method: "POST", path: "/projects/:projectId/upload/complete" },
  async (req) => {
    const auth = getAuthData()!;
    
    // Verify project ownership
    const project = await db.queryRow`
      SELECT id FROM projects 
      WHERE id = ${req.projectId} AND user_id = ${auth.userID}
    `;
    
    if (!project) {
      throw APIError.notFound("Project not found");
    }

    const storageKey = `uploads/${auth.userID}/${req.projectId}/${req.uploadId}`;

    // Create new version record
    const version = await db.queryRow`
      INSERT INTO versions (project_id, storage_key, manifest_json, size_bytes, status)
      VALUES (${req.projectId}, ${storageKey}, '{}', 0, 'processing')
      RETURNING id, status
    `;

    if (!version) {
      throw APIError.internal("Failed to create version");
    }

    // TODO: Start background processing job
    // This would extract ZIP, validate files, generate manifest, etc.

    return {
      versionId: version.id.toString(),
      status: version.status,
    };
  }
);
