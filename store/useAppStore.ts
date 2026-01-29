import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

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

  // Chat History
  chatSessions: Record<string, ChatSession>;
  currentSessionId: string | null;
  createChatSession: (model?: string, mode?: string) => string;
  deleteChatSession: (id: string) => void;
  setCurrentSessionId: (id: string | null) => void;
  updateChatSession: (id: string, updates: Partial<ChatSession>) => void;
  addMessageToSession: (sessionId: string, message: Message) => void;
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

export interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    createdAt: number;
    updatedAt: number;
    model: string; 
    mode?: string;
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

      // Chat History Implementation
      chatSessions: {},
      currentSessionId: null,

      createChatSession: (model = 'Claude', mode = 'standard') => {
        const id = uuidv4();
        const newSession: ChatSession = {
            id,
            title: 'New Chat',
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            model,
            mode
        };
        set((state) => ({
            chatSessions: { ...state.chatSessions, [id]: newSession },
            currentSessionId: id
        }));
        return id;
      },

      deleteChatSession: (id) => set((state) => {
        const newSessions = { ...state.chatSessions };
        delete newSessions[id];
        return { 
            chatSessions: newSessions,
            currentSessionId: state.currentSessionId === id ? null : state.currentSessionId
        };
      }),

      setCurrentSessionId: (id) => set({ currentSessionId: id }),

      updateChatSession: (id, updates) => set((state) => {
          const session = state.chatSessions[id];
          if (!session) return {};
          return {
              chatSessions: {
                  ...state.chatSessions,
                  [id]: { ...session, ...updates, updatedAt: Date.now() }
              }
          };
      }),

      addMessageToSession: (sessionId, message) => set((state) => {
          const session = state.chatSessions[sessionId];
          if (!session) return {};
          
          // Generate Title if it's the first user message and title is "New Chat"
          let newTitle = session.title;
          if (session.messages.length === 0 && message.role === 'user') {
              newTitle = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '');
          }

          return {
              chatSessions: {
                  ...state.chatSessions,
                  [sessionId]: {
                      ...session,
                      messages: [...session.messages, message],
                      title: newTitle,
                      updatedAt: Date.now()
                  }
              }
          };
      }),
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
        strategyPreferences: state.strategyPreferences,
        chatSessions: state.chatSessions,
        currentSessionId: state.currentSessionId
      }),
    }
  )
);
