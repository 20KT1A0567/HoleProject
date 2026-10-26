import { create } from "zustand";
import { SESSION_CLEARED_EVENT, SESSION_UPDATED_EVENT, clearStoredSession, readStoredSession, writeStoredSession } from "../lib/session";
import { logoutCustomerSession } from "../services/storefrontApi";
import type { CustomerProfile, CustomerSession } from "../types/storefront";

interface AuthStore {
  session: CustomerSession | null;
  profile: CustomerProfile | null;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  setSession: (session: CustomerSession) => void;
  updateProfile: (profile: CustomerProfile) => void;
  hydrateFromStorage: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  session: readStoredSession(),
  profile: null,
  isAuthModalOpen: false,

  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),

  setSession: (session) => {
    writeStoredSession(session);
    set({
      session,
      isAuthModalOpen: false,
    });
  },

  updateProfile: (profile) =>
    set((state) => {
      const nextSession = state.session
        ? {
            ...state.session,
            name: profile.name || state.session.name,
            email: profile.email || state.session.email,
            walletBalance: profile.walletBalance ?? state.session.walletBalance,
          }
        : state.session;

      if (nextSession) {
        writeStoredSession(nextSession);
      }

      return {
        profile,
        session: nextSession,
      };
    }),

  hydrateFromStorage: () => {
    set({
      session: readStoredSession(),
    });
  },

  logout: async () => {
    const refreshToken = get().session?.refreshToken;
    clearStoredSession();
    set({
      session: null,
      profile: null,
      isAuthModalOpen: false,
    });
    await logoutCustomerSession(refreshToken);
  },
}));

if (typeof window !== "undefined") {
  window.addEventListener(SESSION_CLEARED_EVENT, () => {
    useAuthStore.setState({
      session: null,
      profile: null,
    });
  });

  window.addEventListener(SESSION_UPDATED_EVENT, () => {
    useAuthStore.setState({
      session: readStoredSession(),
    });
  });
}
