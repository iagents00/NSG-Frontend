import { create } from 'zustand';

interface UIState {
  // ... existing states (Sidebar, AI, PatientFiles)
  isSidebarOpen: boolean;
  isAIOpen: boolean;
  isPatientFilesOpen: boolean;
  
  // NEW: Calendar Day Detail Logic
  isDayDetailOpen: boolean;
  selectedCalendarDate: string | null;
  
  // Actions
  toggleSidebar: () => void;
  toggleAI: () => void;
  togglePatientFiles: () => void;
  openDayDetail: (date: string) => void;
  closeDayDetail: () => void;
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
  togglePatientFiles: () => set((state) => ({ isPatientFilesOpen: !state.isPatientFilesOpen })),
  
  openDayDetail: (date) => set({ isDayDetailOpen: true, selectedCalendarDate: date }),
  closeDayDetail: () => set({ isDayDetailOpen: false, selectedCalendarDate: null }),

  closeAll: () => set({ 
    isSidebarOpen: false, 
    isAIOpen: false, 
    isPatientFilesOpen: false,
    isDayDetailOpen: false
  }),
}));