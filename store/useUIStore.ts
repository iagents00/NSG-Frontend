import { create } from 'zustand';

interface UIState {
  // ... existing states (Sidebar, AI, PatientFiles)
  isSidebarOpen: boolean;
  isAIOpen: boolean;
  isPatientFilesOpen: boolean;
  
  // NEW: Calendar Day Detail Logic
  isDayDetailOpen: boolean;
  selectedCalendarDate: string | null;

  // NEW: AI Tab State
  activeAIMode: string;
  
  // Actions
  toggleSidebar: () => void;
  toggleAI: () => void;
  openAI: () => void;
  togglePatientFiles: () => void;
  openDayDetail: (date: string) => void;
  closeDayDetail: () => void;
  setAIMode: (mode: string) => void;
  closeAll: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,
  isAIOpen: false,
  isPatientFilesOpen: false,
  
  // Calendar Defaults
  isDayDetailOpen: false,
  selectedCalendarDate: null,

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleAI: () => set((state) => ({ isAIOpen: !state.isAIOpen })),
  openAI: () => set({ isAIOpen: true }), // Explicit open
  togglePatientFiles: () => set((state) => ({ isPatientFilesOpen: !state.isPatientFilesOpen })),
  
  openDayDetail: (date) => set({ isDayDetailOpen: true, selectedCalendarDate: date }),
  closeDayDetail: () => set({ isDayDetailOpen: false, selectedCalendarDate: null }),

  // AI Tab State
  activeAIMode: 'standard',
  setAIMode: (mode: string) => set({ activeAIMode: mode }),

  closeAll: () => set({ 
    isSidebarOpen: false, 
    isAIOpen: false, 
    isPatientFilesOpen: false,
    isDayDetailOpen: false
  }),
}));
