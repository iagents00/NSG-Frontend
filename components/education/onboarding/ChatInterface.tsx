/* eslint-disable */
"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";
import BrandAtom from "@/components/ui/BrandAtom";

interface ChatInterfaceProps {
    onStepChange: (step: number) => void;
    currentStep: number;
}

interface Message {
    id: string;
    role: 'system' | 'user';
    content: string;
    type?: 'text' | 'options';
    options?: string[];
}

export default function ChatInterface({ onStepChange, currentStep }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'system',
            content: 'Bienvenido a NSG Education. Soy tu estratega personal. Para comenzar, ¿cuál es tu objetivo principal para este trimestre?',
            type: 'options',
            options: ['Escalar mi Negocio', 'Optimizar mi Salud', 'Claridad Mental', 'Liderazgo']
        }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = (text: string) => {
        if (!text.trim()) return;

        // User Message
        const newMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
        setMessages(prev => [...prev, newMsg]);
        setInput("");
        setIsTyping(true);

        // Simulation of n8n processing time (randomized natural feeling)
        setTimeout(() => {
            setIsTyping(false);
            const nextStep = currentStep + 1;
            
            // Dynamic responses based on step (Mocking n8n logic for UI demo)
            let systemResponse: Message = {
                 id: (Date.now() + 1).toString(),
                 role: 'system',
                 content: 'Entendido. ¿Cuánto tiempo real puedes dedicar a la semana a este objetivo?',
                 type: 'text'
            };

            if (nextStep === 2) {
                 systemResponse.content = "Perfecto. ¿Cuánto tiempo a la semana puedes invertir en esto?";
                 systemResponse.options = ["1-2 horas", "4-5 horas", "Full time"];
                 systemResponse.type = 'options';
            } else if (nextStep === 3) {
                 systemResponse.content = "¿Prefieres contenido en video, texto o audio para aprender?";
                 systemResponse.options = ["Video", "Texto / Lectura", "Audio / Podcast"];
                 systemResponse.type = 'options';
            } else {
                 systemResponse.content = "Gracias. Siguiente pregunta: Describe tu mayor obstáculo actual.";
                 systemResponse.type = 'text';
            }

            setMessages(prev => [...prev, systemResponse]);
            onStepChange(nextStep);
        }, 1200);
    };

    return (
        <div className="flex flex-col h-full relative">
             {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
                {messages.map((msg, idx) => (
                    <div
                        key={msg.id}
                        className={clsx(
                            "flex w-full animate-fade-in-up",
                            msg.role === 'user' ? "justify-end" : "justify-start"
                        )}
                        style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                        {/* Avatar for System */}
                        {msg.role === 'system' && (
                            <div className="w-8 h-8 mr-3 mt-1 shrink-0">
                                <BrandAtom className="w-full h-full" />
                            </div>
                        )}

                        <div className={clsx(
                            "max-w-[75%] p-5 text-[15px] leading-relaxed relative group transition-all duration-300",
                            msg.role === 'user' 
                                ? "bg-blue-600 text-white rounded-3xl rounded-br-md shadow-lg shadow-blue-600/20" 
                                : "bg-white/60 backdrop-blur-md border border-white/40 text-slate-700 rounded-3xl rounded-bl-md shadow-sm"
                        )}>
                            <p>{msg.content}</p>

                            {/* Options Buttons */}
                            {msg.role === 'system' && msg.type === 'options' && msg.options && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {msg.options.map((opt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSend(opt)}
                                            className="px-4 py-2 bg-white/50 border border-blue-100 hover:border-blue-400 text-blue-600 text-sm font-semibold rounded-xl hover:bg-blue-50 transition-all hover:-translate-y-0.5 shadow-sm"
                                        >
                                            <span className="opacity-40 text-xs mr-2 font-black">{(i + 10).toString(36).toUpperCase()}</span>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isTyping && (
                   <div className="flex justify-start w-full animate-fade-in pl-11">
                        <div className="bg-white/40 backdrop-blur-sm border border-white/30 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-1.5 shadow-sm">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                        </div>
                   </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Premium Input Area */}
            <div className="p-6 pt-2">
                <div className="relative flex items-center gap-2 bg-white rounded-3xl p-2 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-slate-100/50 hover:ring-blue-100 transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:shadow-[0_8px_40px_rgba(59,130,246,0.1)]">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                        placeholder="Escribe tu respuesta..."
                        className="w-full bg-transparent pl-5 pr-14 py-3 text-navy-900 placeholder:text-slate-400 focus:outline-none font-medium text-base"
                    />
                    <button 
                        onClick={() => handleSend(input)}
                        disabled={!input.trim()}
                        className="absolute right-2 p-2.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-blue-500/30"
                    >
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
                <div className="mt-3 text-center">
                    <p className="text-[10px] text-slate-400 font-medium opacity-60">Presiona Enter para enviar</p>
                </div>
            </div>
        </div>
    );
}
