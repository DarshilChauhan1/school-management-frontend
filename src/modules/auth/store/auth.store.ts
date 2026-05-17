import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthUser } from "../api/auth.types";

interface MfaChallenge {
  ticket: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  mfa: MfaChallenge | null;
}

interface AuthActions {
  setAuth: (user: AuthUser, token: string) => void;
  setUser: (user: AuthUser) => void;
  setToken: (token: string | null) => void;
  clearAuth: () => void;
  setHydrated: (hydrated: boolean) => void;
  setMfaChallenge: (mfa: MfaChallenge | null) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,
      mfa: null,

      setAuth: (user, token) =>
        set({ user, token, isAuthenticated: true, mfa: null }),
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token, isAuthenticated: Boolean(token) }),
      clearAuth: () =>
        set({ user: null, token: null, isAuthenticated: false, mfa: null }),
      setHydrated: (isHydrated) => set({ isHydrated }),
      setMfaChallenge: (mfa) => set({ mfa }),
    }),
    {
      name: "school-management-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
