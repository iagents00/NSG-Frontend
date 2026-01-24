export type EducationRole = 'system' | 'user';

export interface Message {
  id: string;
  role: EducationRole;
  content: string;
  type?: 'text' | 'options' | 'input';
  options?: string[];
  timestamp: Date;
}

export interface UserContext {
    goals90Days?: string;
    timeAvailable?: string;
    preferredFormat?: string; // 'video', 'text', 'audio'
    missionStatement?: string;
}

export interface OnboardingSession {
  userId: string;
  currentStep: number;
  totalSteps: number;
  history: Message[];
  status: 'active' | 'completed';
  context: UserContext;
}

export type ContentStatus = 'pending' | 'processing' | 'ready' | 'error';
export type ContentType = 'video' | 'article' | 'pdf' | 'image';

export interface EducationContent {
  id: string;
  title: string;
  originalUrl?: string;
  type: ContentType;
  status: ContentStatus;
  thumbnailUrl?: string;
  summary?: string;
  createdAt: string;
}

export interface ActionPlan {
  id: string;
  contentId: string;
  contextApplication: string; // "What this means for you"
  actionToday: string[];
  planWeekly: { task: string; done: boolean }[];
  kpis: string[];
  createdAt: string;
}
