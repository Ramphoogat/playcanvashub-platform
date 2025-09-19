import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";

export interface UserInfo {
  id: string;
  email: string;
  displayName: string;
  username: string;
  role: string;
  emailVerified: boolean;
  avatar_url?: string;
}

// Gets the current authenticated user's information.
export const me = api<void, UserInfo>(
  { auth: true, expose: true, method: "GET", path: "/auth/me" },
  async () => {
    const auth = getAuthData()!;
    return {
      id: auth.userID,
      email: auth.email,
      displayName: auth.displayName,
      username: auth.username,
      role: auth.role,
      emailVerified: auth.emailVerified,
      avatar_url: auth.avatarUrl,
    };
  }
);
