import { secret } from "encore.dev/config";
import * as crypto from "crypto";

const jwtSecret = secret("JWTSecret");

interface JWTPayload {
  sub: string;
  iat: number;
  exp: number;
  type: "access" | "refresh";
}

export function generateAccessToken(userId: string): string {
  const payload: JWTPayload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 15 * 60, // 15 minutes
    type: "access",
  };

  return createJWT(payload);
}

export function generateRefreshToken(userId: string): string {
  const payload: JWTPayload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
    type: "refresh",
  };

  return createJWT(payload);
}

export function verifyAccessToken(token: string): JWTPayload {
  const payload = verifyJWT(token);
  if (payload.type !== "access") {
    throw new Error("Invalid token type");
  }
  return payload;
}

export function verifyRefreshToken(token: string): JWTPayload {
  const payload = verifyJWT(token);
  if (payload.type !== "refresh") {
    throw new Error("Invalid token type");
  }
  return payload;
}

function createJWT(payload: JWTPayload): string {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(payload));
  
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac("sha256", jwtSecret())
    .update(data)
    .digest("base64url");
  
  return `${data}.${signature}`;
}

function verifyJWT(token: string): JWTPayload {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const data = `${encodedHeader}.${encodedPayload}`;
  
  const expectedSignature = crypto
    .createHmac("sha256", jwtSecret())
    .update(data)
    .digest("base64url");
  
  if (signature !== expectedSignature) {
    throw new Error("Invalid JWT signature");
  }

  const payload = JSON.parse(base64urlDecode(encodedPayload)) as JWTPayload;
  
  if (payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("JWT expired");
  }

  return payload;
}

function base64urlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function base64urlDecode(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return Buffer.from(padded, "base64").toString();
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
