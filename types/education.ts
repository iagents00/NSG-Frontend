export type EducationRole = "system" | "user";

export interface Message {
    id: string;
    role: EducationRole;
    content: string;
    type?: "text" | "options" | "input" | "report";
    options?: string[];
    timestamp?: Date;
}

export type ContentStatus = "pending" | "processing" | "ready" | "error";
export type ContentType =
    | "video"
    | "audio"
    | "pdf"
    | "image"
    | "text"
    | "document";

export interface EducationContent {
    id: string;
    title: string;
    originalUrl?: string;
    type: ContentType;
    source_type?: ContentType;
    status: ContentStatus;
    thumbnailUrl?: string;
    summary?: string;
    createdAt: string;
    updatedAt?: string;
    fullData?: Record<string, any>;
    question_process?: {
        completed: boolean;
        question_blocks: QuestionBlock[];
    };
}

interface QuestionBlock {
    block: string;
    intent: string;
    questions: Array<{
        id: string;
        question: string;
        type: string;
        options?: string[];
    }>;
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
    status: "active" | "completed";
    context: UserContext;
}
