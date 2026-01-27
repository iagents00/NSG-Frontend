
import api from "./api";
import { Message, EducationContent, AnalysisDocument } from "@/types/education";
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

export interface ReportResponse {
    document: AnalysisDocument;
}

// ==========================================
// Education Service
// ==========================================

export const educationService = {
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
            // EXPERIMENTAL: Connect to actual backend
            // const response = await api.post<ChatResponse>("/education/strategy/chat", { messages, userContext });
            // return response.data;
            
            // FALLBACK: Mock Logic (simulating backend latency)
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // This is where we would normally call the backend. 
            // For now, we simulate the "Next Question" logic that was previously in the component.
            // But to truly "connect" it, we structure it so switching to real API is just uncommenting above.
            
            // Note: The component currently handles the step logic heavily. 
            // We will return a generic response if the component falls back to this service.
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
        history: Message[],
        preferences: StrategyPreferences | null
    ): Promise<Message> {
        try {
            const response = await api.post<{ message: Message }>(`/education/content/${contentId}/chat`, {
                message,
                history,
                preferences
            });
            return response.data.message;
        } catch (error) {
             console.warn("Education Service: Fallback to mock", error);
             
             // MOCK RESPONSE
             await new Promise(r => setTimeout(r, 1500));
             
             // Simple echo/logic for demonstration if backend fails
             return {
                 id: Date.now().toString(),
                 role: 'system',
                 content: "Entendido. Estoy procesando tu solicitud con base en tu perfil estratégico. (Modo Demo: Backend no conectado)",
                 type: 'text',
                 timestamp: new Date()
             } as Message;
        }
    },

    /**
     * Generates a full report for a specific piece of content
     */
    async generateReport(
        contentId: string,
        preferences: StrategyPreferences | null
    ): Promise<AnalysisDocument> {
        try {
            const response = await api.post<ReportResponse>(`/education/content/${contentId}/report`, { preferences });
            return response.data.document;
        } catch (error) {
            console.warn("Education Service: Fallback report", error);
            await new Promise(r => setTimeout(r, 2000));
            
            // Mock Report
            return {
                id: Date.now().toString(),
                title: "Reporte Generado (Offline)",
                summary: "Este es un reporte generado localmente porque no se pudo conectar con el servidor de IA.",
                example: "Implementación local de prueba.",
                steps: ["Verificar conexión", "Reintentar", "Contactar soporte si persiste"],
                kpi: "Latencia 0ms",
                date: new Date().toISOString()
            };
        }
    },

    /**
     * Saves the final strategy preferences to the backend
     */
    async savePreferences(prefs: StrategyPreferences): Promise<void> {
        try {
            await api.post("/education/preferences", prefs);
        } catch (error) {
            console.warn("Failed to sync preferences to backend", error);
            // We don't throw here because we want the app to continue using local state
        }
    }
};
