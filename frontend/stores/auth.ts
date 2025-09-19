import { create } from 'zustand';
import backend from '~backend/client';
import type { UserInfo } from '~backend/auth/me';

interface AuthState {
  user: UserInfo | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, displayName: string, username: string) => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    try {
      const response = await backend.auth.login({ email, password });
      set({ user: response.user, isAuthenticated: true });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      // TODO: Implement logout endpoint
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear state anyway
      set({ user: null, isAuthenticated: false });
    }
  },

  signup: async (email: string, password: string, displayName: string, username: string) => {
    try {
      await backend.auth.signup({ email, password, displayName, username });
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  },

  initializeAuth: async () => {
    try {
      const user = await backend.auth.me();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
