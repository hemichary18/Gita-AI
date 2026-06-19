import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export type Gender = 'male' | 'female';
export type AppTab = 'home' | 'chat' | 'library';

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  gender: Gender;
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  currentTab: AppTab;
  isInitialized: boolean;
  login: (user: UserProfile) => void;
  logout: () => Promise<void>;
  setTab: (tab: AppTab) => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  currentTab: 'home',
  isInitialized: false,

  // Temporary synchronous login for UI updates right after signup
  login: (user) => set({ isAuthenticated: true, user }),

  logout: async () => {
    await supabase.auth.signOut();
    set({ isAuthenticated: false, user: null, currentTab: 'home' });
  },

  setTab: (tab) => set({ currentTab: tab }),

  initAuth: () => {
    // 1. Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        set({ 
          isAuthenticated: true, 
          user: {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || 'Parth',
            gender: session.user.user_metadata?.gender || 'male',
          },
          isInitialized: true
        });
      } else {
        set({ isInitialized: true });
      }
    });

    // 2. Listen for auth changes (login, logout, token refresh)
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        set({ 
          isAuthenticated: true, 
          user: {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || 'Parth',
            gender: session.user.user_metadata?.gender || 'male',
          }
        });
      } else {
        set({ isAuthenticated: false, user: null });
      }
    });
  }
}));

