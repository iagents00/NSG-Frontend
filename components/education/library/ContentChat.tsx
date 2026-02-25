"use client";

import { EducationContent, Message } from "@/types/education";
import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Loader2 } from "lucide-react";
import { educationService } from "@/lib/education";
import { useAppStore } from "@/store/useAppStore";
import clsx from "clsx";

interface ContentChatProps {
    item: EducationContent;
    onBack?: () => void;
    onInteract?: () => void;
    onUpdate?: (item: EducationContent) => void;
}

export default function ContentChat({
    item,
    onInteract,
    onUpdate,
}: ContentChatProps) {
    const { strategyPreferences } = useAppStore();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "system",
            content: `Hola. He procesado tu recurso "${item.title}". ¿En qué puedo ayudarte hoy con esta información?`,
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Call onInteract if messages length changes and it's > 1
    useEffect(() => {
        if (messages.length > 1 && onInteract) {
            onInteract();
        }
    }, [messages.length, onInteract]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const hasTriggeredWebhook = useRef<string | null>(null);

    useEffect(() => {
        const triggerQuestions = async () => {
            const fullData = item.fullData as any;
            const isCompleted = fullData?.question_process?.completed;

            // Guard: Only trigger if not completed AND we haven't triggered it for THIS item.id yet
            if (
                isCompleted === false &&
                hasTriggeredWebhook.current !== item.id
            ) {
                hasTriggeredWebhook.current = item.id;

                try {
                    console.log(
                        `[ContentChat] Disparando webhook de preguntas para: ${item.id}`,
                    );
                    const result = await educationService.startQuestions(
                        item.id,
                        fullData?.telegram_id,
                    );

                    if (
                        result.status === "success" ||
                        result.success === true
                    ) {
                        console.log(
                            "[ContentChat] Webhook exitoso, actualizando datos del recurso...",
                        );
                        // Traer datos actualizados del backend
                        const updated = await educationService.getContent(
                            item.id,
                        );
                        if (updated && onUpdate) {
                            onUpdate(updated);
                            console.log(
                                "[ContentChat] Parent notified with updated content",
                            );
                        }
                    }
                } catch (error) {
                    console.error("Error triggering n8n questions:", error);
                }
            }
        };

        triggerQuestions();
    }, [item.id, onUpdate]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsTyping(true);

        try {
            const response = await educationService.contentChat(
                item.id,
                input,
                messages,
                strategyPreferences,
            );
            setMessages((prev) => [...prev, response]);
        } catch (error) {
            console.error("Chat error:", error);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={clsx(
                            "flex gap-4 max-w-[85%] animate-fade-in",
                            msg.role === "user"
                                ? "ml-auto flex-row-reverse"
                                : "mr-auto",
                        )}
                    >
                        <div
                            className={clsx(
                                "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                                msg.role === "user"
                                    ? "bg-navy-900 text-white"
                                    : "bg-blue-600 text-white",
                            )}
                        >
                            {msg.role === "user" ? (
                                <User className="w-5 h-5" />
                            ) : (
                                <Bot className="w-5 h-5" />
                            )}
                        </div>
                        <div
                            className={clsx(
                                "p-5 rounded-[2rem] text-sm leading-relaxed tracking-wide",
                                msg.role === "user"
                                    ? "bg-blue-600 text-white rounded-tr-none shadow-xl shadow-blue-100/50"
                                    : "bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100",
                            )}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex gap-4 mr-auto animate-pulse">
                        <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                            <Bot className="w-5 h-5" />
                        </div>
                        <div className="bg-slate-50 border border-slate-100 p-5 rounded-[2rem] rounded-tl-none flex items-center gap-2">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 md:p-8 border-t border-slate-100 bg-white/80 backdrop-blur-xl">
                <div className="max-w-4xl mx-auto relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-0 group-focus-within:opacity-10 transition duration-1000"></div>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Consulta estratégica sobre este recurso..."
                        className="relative w-full bg-slate-50 border border-slate-200 rounded-[2rem] px-8 py-5 pr-16 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all placeholder:text-slate-400"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-navy-900 text-white rounded-2xl hover:bg-navy-800 disabled:opacity-30 disabled:grayscale transition-all shadow-lg hover:shadow-navy-900/20 active:scale-95"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-center mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                    Impulsado por NSG Intelligence Core
                </p>
            </div>
        </div>
    );
}
