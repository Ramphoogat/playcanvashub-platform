// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

// Player Configuration  
export const PLAYER_ORIGIN = import.meta.env.VITE_PLAYER_ORIGIN || 'http://play.localhost:3000';

// Clerk Configuration (for OAuth)
// TODO: Set this to your Clerk publishable key, which can be found in the Clerk dashboard.
export const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";

// File Upload Configuration
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const ALLOWED_FILE_TYPES = ['.zip'];

// Ad Configuration
export const AD_CONFIG = {
  // Minimum time between interstitial ads (seconds)
  interstitialCooldown: 180, // 3 minutes
  // Minimum time between rewarded ads (seconds)  
  rewardedCooldown: 60, // 1 minute
  // Maximum ads per session
  maxAdsPerSession: 10,
  // Enable/disable ads globally
  enabled: true,
};
