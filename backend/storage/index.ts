import { Bucket } from "encore.dev/storage/objects";

// Main bucket for storing project files and assets
export const projectBucket = new Bucket("playcanvas-projects", {
  public: true,
  versioned: true,
});

// Bucket for user avatars and thumbnails
export const assetBucket = new Bucket("playcanvas-assets", {
  public: true,
  versioned: false,
});
