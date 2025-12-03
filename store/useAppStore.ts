import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'consultant' | 'psychologist' | 'sales' | 'manager';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date;
}

interface AppState {
  currentRole: Role;
  theme: 'light' | 'dark' | 'neon';
  isSidebarOpen: boolean;
  isContextCached: boolean;
  conversations: Record<Role, Message[]>;
  
  setRole: (role: Role) => void;
  setTheme: (theme: 'light' | 'dark' | 'neon') => void;
  toggleSidebar: () => void;
  setContextCached: (cached: boolean) => void;
  addMessage: (role: Role, message: Message) => void;
  setMessages: (role: Role, messages: Message[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentRole: 'consultant',
      theme: 'light',
      isSidebarOpen: true,
      isContextCached: false,
      conversations: {
        consultant: [],
        psychologist: [],
        sales: [],
        manager: [],
      },

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
    }),
    {
      name: 'nsg-storage',
      partialize: (state) => ({ 
        currentRole: state.currentRole, 
        theme: state.theme,
        conversations: state.conversations 
      }),
    }
  )
);
