import api from "./api";
import { Message, EducationContent } from "@/types/education";
import { StrategyPreferences } from "@/store/useAppStore";

// ==========================================
// Types
// ==========================================

export interface ChatResponse {
    message: Message;
    // Optional: if the backend decides to trigger a client-side action or state update
    nextStep?: number;
    isCompleted?: boolean;
}

// ==========================================
// Education Service
// ==========================================

export const educationService = {
    /**
     * Gets a single content item by ID
     */
    async getContent(id: string): Promise<EducationContent> {
        const response = await api.get(`/education/content/${id}`);
        return response.data.data;
    },

    /**
     * Sends a message to the AI for the Onboarding Strategy flow.
     * @param messages History of messages
     * @param userContext Current collected preferences
     * @returns AI response message
     */
    async strategyChat(
        messages: Message[],
        userContext: Partial<StrategyPreferences>
    ): Promise<ChatResponse> {
        try {
            // FALLBACK: Mock Logic (simulating backend latency)
            await new Promise(resolve => setTimeout(resolve, 1500));

            throw new Error("Backend not available yet, using local logic");

        } catch (error) {
            console.warn("Education Service: using local fallback", error);
            throw error; // Let component handle or provide default
        }
    },

    /**
     * Sends a message to the AI for the Library Content Chat.
     * @param contentId The ID of the content being discussed
     * @param message The user's message
     * @param history Previous messages
     * @param preferences User's strategy preferences
     */
    async contentChat(
        contentId: string,
        message: string,
        history: any[],
        preferences: any
    ): Promise<Message> {
        try {
            const response = await api.post<{ message: Message; }>(`/education/content/${contentId}/chat`, {
                message,
                history,
                preferences
            });
            return response.data.message;
        } catch (error) {
            console.warn("Education Service: Fallback to mock", error);

            // MOCK RESPONSE
            await new Promise(r => setTimeout(r, 1500));

            return {
                id: Date.now().toString(),
                role: 'system',
                content: `Entendido. He analizado tu pregunta sobre el recurso ID: ${contentId}. (Modo Demo: Backend no conectado)`,
                type: 'text',
                timestamp: new Date()
            } as Message;
        }
    },

    /**
     * Saves the final strategy preferences to the backend
     */
    async savePreferences(prefs: StrategyPreferences): Promise<void> {
        // Map camelCase to snake_case for backend
        const backendPrefs = {
            entregable: prefs.entregable,
            learning_style: prefs.learningStyle,
            depth: prefs.depth,
            context: prefs.context,
            strength: prefs.strength,
            friction: prefs.friction,
            numerology_enabled: prefs.numerology || false,
            birth_date: prefs.birthDate || null
        };

        console.log("📤 Enviando preferencias al backend:", {
            frontend: prefs,
            backend: backendPrefs
        });

        try {
            await api.post("/education/preferences", backendPrefs);
            console.log("✅ Preferencias guardadas exitosamente");
        } catch (error) {
            console.warn("❌ Failed to sync preferences to backend", error);
            throw error; // Throw so UI can show error
        }
    },

    /**
     * Gets onboarding status from backend
     */
    async getOnboardingStatus(): Promise<{ onboarding_completed: boolean; completed_at?: string; }> {
        try {
            const response = await api.get("/education/onboarding/status");
            return response.data;
        } catch (error: any) {
            // If 404, onboarding not completed
            if (error.response?.status === 404) {
                return { onboarding_completed: false };
            }
            throw error;
        }
    },

    /**
     * Gets user preferences from backend
     */
    async getPreferences(): Promise<StrategyPreferences> {
        try {
            const response = await api.get("/education/preferences");
            const data = response.data.preferences;

            // Map snake_case to camelCase
            return {
                entregable: data.entregable,
                learningStyle: data.learning_style,
                depth: data.depth,
                context: data.context,
                strength: data.strength,
                friction: data.friction,
                numerology: data.numerology_enabled,
                birthDate: data.birth_date
            };
        } catch (error) {
            console.warn("Failed to get preferences from backend", error);
            throw error;
        }
    },

    /**
     * Resets onboarding status
     */
    async resetOnboarding(): Promise<void> {
        try {
            await api.post("/education/onboarding/reset");
            console.log("✅ Onboarding reseteado exitosamente");
        } catch (error) {
            console.warn("❌ Failed to reset onboarding", error);
            throw error;
        }
    },

    /**
     * Saves user answers for a content item
     */
    async saveAnswers(contentId: string, answers: Record<string, string>): Promise<void> {
        await api.post(`/education/content/${contentId}/answers`, { answers });
    },

    /**
     * Gets the final generated analysis from the backend
     */
    async getGeneratedContent(contentId: string): Promise<any> {
        const response = await api.get(`/education/content/${contentId}/generated`);
        return response.data.data;
    }
};
