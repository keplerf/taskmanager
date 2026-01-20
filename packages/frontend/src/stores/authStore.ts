import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState } from '../types';

const SESSION_DURATION_MS = 5 * 60 * 60 * 1000; // 5 hours in milliseconds

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      sessionExpiresAt: null,

      setAuth: (user, accessToken) =>
        set({
          user,
          accessToken,
          isAuthenticated: true,
          sessionExpiresAt: Date.now() + SESSION_DURATION_MS,
        }),

      setAccessToken: (accessToken) =>
        set({
          accessToken,
          sessionExpiresAt: Date.now() + SESSION_DURATION_MS,
        }),

      logout: () => {
        localStorage.removeItem('refreshToken');
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          sessionExpiresAt: null,
        });
      },

      isSessionValid: () => {
        const { sessionExpiresAt, accessToken } = get();
        if (!accessToken || !sessionExpiresAt) return false;
        return Date.now() < sessionExpiresAt;
      },

      checkAndRestoreSession: () => {
        const { accessToken, sessionExpiresAt, user } = get();

        // If no token or user, session is invalid
        if (!accessToken || !user) {
          get().logout();
          return false;
        }

        // If session expired, logout
        if (sessionExpiresAt && Date.now() >= sessionExpiresAt) {
          get().logout();
          return false;
        }

        // Session is valid, ensure isAuthenticated is true
        if (!get().isAuthenticated) {
          set({ isAuthenticated: true });
        }

        return true;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        sessionExpiresAt: state.sessionExpiresAt,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
