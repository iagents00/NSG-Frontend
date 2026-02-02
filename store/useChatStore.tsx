import { create } from 'zustand';
import { useAppStore } from './useAppStore'; // To access currentRole
import { useUIStore } from './useUIStore';   // To open the modal

export interface Message {
  id: string;
  role: 'user' | 'ai';
  type: 'text' | 'analysis'; // Support different message types
  content: string; // Or specialized data for analysis
  metadata?: {
    title?: string;
    tag?: string;
    roleContext?: string;
  };
}

interface ChatState {
  messages: Message[];
  isProcessing: boolean;
  addMessage: (msg: Message) => void;
  runNewsAnalysis: (title: string, tag: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isProcessing: false,

  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),

  runNewsAnalysis: (title, tag) => {
    const { toggleAI, isAIOpen } = useUIStore.getState();
    const { currentRole } = useAppStore.getState();

    // 1. Open the Chat Modal if closed
    if (!isAIOpen) toggleAI();

    // 2. Add User Intent Message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      type: 'text',
      content: `Analizar impacto de: "${title}"`
    };
    
    set((state) => ({ 
      messages: [...state.messages, userMsg],
      isProcessing: true 
    }));

    // 3. Determine Context based on Role
    let roleContext = "Aplicación Clínica & Desarrollo Profesional.";
    if (currentRole === 'manager') roleContext = "Impacto en Estrategia Corporativa & Ventaja Competitiva.";
    else if (currentRole === 'patient') roleContext = "Optimización de Bienestar Personal & Rutinas.";

    // 4. Simulate AI Delay & Response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        type: 'analysis', // Special type for your card
        content: "Analysis Complete",
        metadata: {
          title,
          tag,
          roleContext
        }
      };

      set((state) => ({
        isProcessing: false,
        messages: [...state.messages, aiResponse]
      }));
    }, 2500);
  }
}));
