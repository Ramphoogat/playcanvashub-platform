import { api, APIError } from "encore.dev/api";
import db from "../db";

export interface AdRequest {
  sessionId: string;
  type: 'interstitial' | 'rewarded';
  placement: string;
}

export interface AdResponse {
  status: 'shown' | 'skipped' | 'failed';
  rewarded?: boolean;
}

// Requests an ad to be shown during gameplay.
export const requestAd = api<AdRequest, AdResponse>(
  { expose: true, method: "POST", path: "/player/ads/request" },
  async (req) => {
    // Validate session
    const session = await db.queryRow`
      SELECT id, project_id FROM player_sessions 
      WHERE id = ${req.sessionId} AND ended_at IS NULL
    `;

    if (!session) {
      throw APIError.notFound("Invalid or expired session");
    }

    // For now, use mock ad service
    const adResult = await mockAdService(req.type, req.placement);

    // Record ad event
    await db.exec`
      INSERT INTO ad_events (session_id, project_id, type, placement, status, revenue_micro)
      VALUES (${req.sessionId}, ${session.project_id}, ${req.type}, ${req.placement}, ${adResult.status}, ${adResult.revenueMicro})
    `;

    return {
      status: adResult.status,
      rewarded: adResult.rewarded,
    };
  }
);

interface MockAdResult {
  status: 'shown' | 'skipped' | 'failed';
  rewarded: boolean;
  revenueMicro: number | null;
}

async function mockAdService(type: string, placement: string): Promise<MockAdResult> {
  // Mock ad service - in production, integrate with real ad networks
  const random = Math.random();
  
  if (random < 0.1) {
    // 10% failure rate
    return { status: 'failed', rewarded: false, revenueMicro: null };
  }
  
  if (type === 'interstitial') {
    if (random < 0.3) {
      // 30% skip rate for interstitials
      return { status: 'skipped', rewarded: false, revenueMicro: null };
    }
    return { status: 'shown', rewarded: false, revenueMicro: 500 }; // $0.0005
  }
  
  if (type === 'rewarded') {
    if (random < 0.05) {
      // 5% skip rate for rewarded (user cancels)
      return { status: 'skipped', rewarded: false, revenueMicro: null };
    }
    return { status: 'shown', rewarded: true, revenueMicro: 2000 }; // $0.002
  }
  
  return { status: 'failed', rewarded: false, revenueMicro: null };
}
