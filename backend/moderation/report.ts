import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface ReportRequest {
  projectId: string;
  reason: string;
  details?: string;
}

export interface ReportResponse {
  reportId: string;
  message: string;
}

// Reports a project for policy violations.
export const report = api<ReportRequest, ReportResponse>(
  { expose: true, method: "POST", path: "/moderation/report" },
  async (req) => {
    if (!req.reason || req.reason.trim().length === 0) {
      throw APIError.invalidArgument("Reason is required");
    }

    // Validate project exists
    const project = await db.queryRow`
      SELECT id FROM projects WHERE id = ${req.projectId} AND status = 'published'
    `;

    if (!project) {
      throw APIError.notFound("Project not found");
    }

    // Get reporter ID if authenticated
    let reporterId = null;
    try {
      const auth = getAuthData();
      reporterId = auth?.userID || null;
    } catch {
      // Anonymous report
    }

    // Check for duplicate reports from same user
    if (reporterId) {
      const existingReport = await db.queryRow`
        SELECT id FROM reports 
        WHERE project_id = ${req.projectId} AND reporter_id = ${reporterId} AND status = 'open'
      `;

      if (existingReport) {
        throw APIError.alreadyExists("You have already reported this project");
      }
    }

    // Create report
    const report = await db.queryRow`
      INSERT INTO reports (reporter_id, project_id, reason, details)
      VALUES (${reporterId}, ${req.projectId}, ${req.reason}, ${req.details})
      RETURNING id
    `;

    if (!report) {
      throw APIError.internal("Failed to create report");
    }

    return {
      reportId: report.id.toString(),
      message: "Report submitted successfully. Our moderation team will review it.",
    };
  }
);
