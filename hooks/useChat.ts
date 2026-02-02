import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppStore } from '@/store/useAppStore';

interface UseChatProps {
    field?: string;
}

export function useChat({ field = 'BS Intelligence' }: UseChatProps = {}) {
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { userId } = useAppStore();

    const createNewChat = useCallback(() => {
        const newId = uuidv4();
        setCurrentChatId(newId);
        return newId;
    }, []);

    const sendMessage = useCallback(async (
        message: string, 
        mode: 'pulse' | 'compare' | 'fusion', 
        attachments: any[] = [],
        model?: string
    ) => {
        setIsLoading(true);
        try {
            // 1. Ensure Chat ID exists
            let activeChatId = currentChatId;
            if (!activeChatId) {
                activeChatId = createNewChat();
            }

            // 2. Get Auth Token
            const token = typeof window !== 'undefined' ? localStorage.getItem('nsg-token') : null;
            if (!token) {
                throw new Error('User not authenticated');
            }

            // 3. Construct Payload
            const payload = {
                chatId: activeChatId,
                userId: userId, // From global store/auth context
                field: field,
                mode: mode,
                aiModel: model, // Optional, for Pulse mode
                message: message,
                attachments: attachments.map(att => ({
                    name: att.name,
                    url: att.url,
                    type: att.type
                }))
            };

            // 4. Send to N8N Proxy (with Authorization Header)
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            
            // Check logical success from AI Brain
            if (!data.ok) {
                 throw new Error(data.message || "Error en el cerebro AI");
            }

            return data;

        } catch (error) {
            console.error("SendMessage Error:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [currentChatId, createNewChat, userId, field]);

    return {
        currentChatId,
        createNewChat,
        sendMessage,
        isLoading
    };
}
