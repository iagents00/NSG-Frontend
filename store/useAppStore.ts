import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'user' | 'consultant' | 'psychologist' | 'manager' | 'patient' | 'admin';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date;
}

interface AppState {
  currentRole: Role;
  theme: 'light' | 'dark' | 'neon' | 'system';
  isSidebarOpen: boolean;
  isContextCached: boolean;
  conversations: Record<Role, Message[]>;
  userId: string;
  userLocation: {
    latitude: number;
    longitude: number;
    timezone: string;
    city?: string;
    country?: string;
  } | null;
  userProfile: {
    id: string;
    email: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    role: Role;
    telegram_id?: number | null;
  } | null;

  setRole: (role: Role) => void;
  setTheme: (theme: 'light' | 'dark' | 'neon' | 'system') => void;
  toggleSidebar: () => void;
  setContextCached: (cached: boolean) => void;
  addMessage: (role: Role, message: Message) => void;
  setMessages: (role: Role, messages: Message[]) => void;
  setUserId: (id: string) => void;
  setUserLocation: (location: AppState['userLocation']) => void;
  setUserProfile: (profile: AppState['userProfile']) => void;
  strategyPreferences: StrategyPreferences | null;
  setStrategyPreferences: (prefs: StrategyPreferences) => void;
}

export interface StrategyPreferences {
    entregable: string;
    learningStyle: string;
    depth: string;
    context: string;
    strength: string;
    friction: string;
    numerology: boolean;
    birthDate?: string;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentRole: 'consultant',
      theme: 'light',
      isSidebarOpen: true,
      isContextCached: false,
      conversations: {
        user: [],
        consultant: [],
        psychologist: [],
        manager: [],
        patient: [],
        admin: [],
      },
      userId: '',
      userLocation: null,
      userProfile: null,
      strategyPreferences: null,

      setRole: (role) => set({ currentRole: role }),
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setContextCached: (cached) => set({ isContextCached: cached }),
      addMessage: (role, message) => set((state) => ({
        conversations: {
          ...state.conversations,
          [role]: [...state.conversations[role], message]
        }
      })),
      setMessages: (role, messages) => set((state) => ({
        conversations: {
          ...state.conversations,
          [role]: messages
        }
      })),
      setUserId: (id) => set({ userId: id }),
      setUserLocation: (location) => set({ userLocation: location }),
      setUserProfile: (profile) => set({ userProfile: profile }),
      setStrategyPreferences: (prefs) => set({ strategyPreferences: prefs }),
    }),
    {
      name: 'nsg-storage',
      partialize: (state) => ({
        currentRole: state.currentRole,
        theme: state.theme,
        conversations: state.conversations,
        userId: state.userId,
        userLocation: state.userLocation,
        userProfile: state.userProfile,
        strategyPreferences: state.strategyPreferences
      }),
    }
  )
);
