/* eslint-disable */
"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowRight, X, Maximize2, Minimize2, CheckCircle2, RefreshCw, Mic } from "lucide-react";
import clsx from "clsx";
import BrandAtom from "@/components/ui/BrandAtom";
import ContextHUD from "./ContextHUD";
import { useAppStore, StrategyPreferences } from "@/store/useAppStore";
import { educationService } from "@/lib/education";

interface StrategyWidgetProps {
    isOpen: boolean;
    isMinimized: boolean;
    onClose: () => void;
    onMinimize: () => void;
    onMaximize: () => void;
    isCompleted?: boolean;
    onComplete?: () => void;
    onReset?: () => void;
}

interface Message {
    id: string;
    role: 'system' | 'user';
    content: string;
    type?: 'text' | 'options' | 'confirmation';
    title?: string;
    options?: string[];
}

export default function StrategyWidget({ 
    isOpen, 
    isMinimized, 
    onClose, 
    onMinimize, 
    onMaximize,
    isCompleted,
    onComplete,
    onReset
}: StrategyWidgetProps) {
    const setStrategyPreferences = useAppStore(state => state.setStrategyPreferences);

    // CHAT STATE
    const [currentStep, setCurrentStep] = useState(1);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'system',
            content: '¡Excelente! Para poder brindarte una experiencia educativa superior, necesitamos hacer una breve consulta:',
            type: 'text',
        }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // LOGIC STATE
    const [answers, setAnswers] = useState<Partial<StrategyPreferences>>({});
    const [awaitingCustomInput, setAwaitingCustomInput] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
        // Auto-start Q1 after intro
        if (messages.length === 1 && currentStep === 1) {
             const timer = setTimeout(() => {
                setMessages(prev => {
                    // Prevent duplicate Q1 from Strict Mode double-invocation
                    if (prev.some(m => m.id === 'q1')) return prev;
                    
                    return [...prev, {
                        id: 'q1',
                        role: 'system',
                        content: '1/5 — Entregable preferido (output). ¿Qué quieres recibir después de cada video?',
                        type: 'options',
                        options: ['A) Acciones (3–5 pasos)', 'B) Resumen ejecutivo', 'C) Plantilla/guía', 'D) Guión (ventas/enseñanza)', 'E) Otro (escribir/🎙️)']
                    }];
                });
             }, 1000);
             return () => clearTimeout(timer);
        }
    }, [messages.length, currentStep, isOpen]);

    // Handle initial state if completed
    useEffect(() => {
        if (isCompleted && messages.length === 1) {
             setMessages([{
                 id: 'completed',
                 role: 'system',
                 content: 'Estrategia completada y guardada. ¿Deseas recalibrar tus objetivos?',
                 type: 'confirmation'
             }]);
        }
    }, [isCompleted]);

    const handleSend = (text: string) => {
        if (!text.trim()) return;

        // User Message
        const newMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
        setMessages(prev => [...prev, newMsg]);
        setInput("");
        setIsTyping(true);

        // Simulation of n8n processing time 
        setTimeout(() => {
            setIsTyping(false);
            
            // LOGIC MACHINE
            // Map current step to preference key
            let currentKey: keyof StrategyPreferences | null = null;
            if (currentStep === 1) currentKey = 'entregable';
            if (currentStep === 2) currentKey = 'learningStyle';
            if (currentStep === 3) currentKey = 'depth';
            if (currentStep === 4) currentKey = 'context';
            if (currentStep === 5) currentKey = 'strength';
            if (currentStep === 5.5) currentKey = 'friction';
            
            // Check if User selected "Other" or is providing Custom Input
            const isOther = text.toLowerCase().includes("otro") || text.includes("E)");
            
            // 1. If currently awaiting custom input, this text IS the answer.
            if (awaitingCustomInput) {
                setAnswers(prev => ({ ...prev, [awaitingCustomInput]: text }));
                setAwaitingCustomInput(null); // Clear flag
                // PROCEED TO NEXT STEP (fall through to step logic below)
            }
            // 2. If user selected "Other", switch to awaiting mode and PAUSE transition
            else if (isOther && currentKey) {
                setAwaitingCustomInput(currentKey);
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'system',
                    content: "Entendido. Por favor describe tu preferencia (puedes escribir o usar el micrófono 🎙️).",
                    type: 'text'
                }]);
                return; // STOP HERE, wait for next input
            }
            // 3. Normal Selection
            else if (currentKey) {
                 setAnswers(prev => ({ ...prev, [currentKey]: text }));
                 // PROCEED TO NEXT STEP
            }


            let nextStep = currentStep;
            let systemResponse: Message[] = [];

            // Q1 -> Q2
            if (currentStep === 1) {
                nextStep = 2;
                systemResponse.push({
                     id: Date.now().toString(),
                     role: 'system',
                     content: "2/5 — Cómo aprendes mejor. Si tuvieras que aprender algo complejo hoy, ¿qué te funciona MÁS?",
                     type: 'options',
                     options: ["A) Verlo claro (esquema)", "B) Escucharlo (podcast)", "C) Leerlo (guía)", "D) Hacerlo (ejercicio)", "E) Otro (escribir/🎙️)"]
                });
            } 
            // Q2 -> Q3
            else if (currentStep === 2) {
                nextStep = 3;
                systemResponse.push({
                     id: Date.now().toString(),
                     role: 'system',
                     content: "3/5 — Profundidad y ritmo. ¿Qué tan profundo lo quieres por defecto?",
                     type: 'options',
                     options: ["A) Flash (1–2 min)", "B) Práctico (5 min)", "C) Pro (10–15 min)", "D) Depende del video", "E) Otro (escribir/🎙️)"]
                });
            }
            // Q3 -> Q4
            else if (currentStep === 3) {
                nextStep = 4;
                systemResponse.push({
                     id: Date.now().toString(),
                     role: 'system',
                     content: "4/5 — Contexto de aplicación. ¿Dónde quieres aplicar lo aprendido la mayoría de las veces?",
                     type: 'options',
                     options: ["A) Negocio/ventas", "B) Operación/equipo", "C) Crecimiento personal", "D) Estudio/certificación", "E) Otro (escribir/🎙️)"]
                });
            }
            // Q4 -> Q5 (Part 1: Strength)
            else if (currentStep === 4) {
                nextStep = 5;
                systemResponse.push({
                     id: Date.now().toString(),
                     role: 'system',
                     content: "5/5 — Calibración NSG (fortaleza + fricción). Primero, elige 1 fortaleza natural:",
                     type: 'options',
                     options: ["A) Enfoque y ejecución", "B) Comunicación e influencia", "C) Estrategia y visión", "D) Orden y sistemas", "E) Otro"]
                });
            }
            // Q5 Part 1 -> Q5 Part 2 (Friction)
            else if (currentStep === 5) {
                nextStep = 5.5; // Intermediate step
                systemResponse.push({
                     id: Date.now().toString(),
                     role: 'system',
                     content: "Ahora, elige 1 fricción típica:",
                     type: 'options',
                     options: ["Me disperso (cambio idea)", "Me cuesta empezar", "Me falta estructura", "Entiendo pero no aplico", "Otro"]
                });
            }
            // Q5 Part 2 -> Numerology Check
            else if (currentStep === 5.5) {
                nextStep = 6;
                systemResponse.push({
                     id: Date.now().toString(),
                     role: 'system',
                     title: "Aniagrama Básico Educativo",
                     content: "Proporciónanos tu **fecha de nacimiento** para ayudarte a estudiar de forma más inteligente considerando tus fortalezas:",
                     type: 'options',
                     options: ["Continuar", "Saltar"]
                });
            }
            // Numerology Yes -> Ask Date OR No -> Finish
            else if (currentStep === 6) {
                const wantsNumerology = text.toLowerCase().includes('continuar');
                setAnswers(prev => ({ ...prev, numerology: wantsNumerology }));

                if (wantsNumerology) {
                    nextStep = 7;
                    systemResponse.push({
                         id: Date.now().toString(),
                         role: 'system',
                         content: "Por favor escribe tu fecha (DD/MM/AAAA):",
                         type: 'text'
                    });
                } else {
                    nextStep = 8; // Done
                    systemResponse.push({
                         id: Date.now().toString(),
                         role: 'system',
                         content: "Excelente. He capturado tu modelo operativo. ¿Confirmas para generar tu estrategia?",
                         type: 'confirmation'
                    });
                }
            }
            // Date -> Finish
            else if (currentStep === 7) {
                 setAnswers(prev => ({ ...prev, birthDate: text }));
                 nextStep = 8;
                 systemResponse.push({
                     id: Date.now().toString(),
                     role: 'system',
                     content: "Excelente. He capturado tu modelo operativo. ¿Confirmas para generar tu estrategia?",
                     type: 'confirmation'
                });
            }

            setMessages(prev => [...prev, ...systemResponse]);
            setCurrentStep(nextStep);
        }, 800);
    };

    const handleConfirm = async () => {
        // SAVE STRATEGY
        setStrategyPreferences(answers as StrategyPreferences);
        await educationService.savePreferences(answers as StrategyPreferences);

        // Trigger completion
        const successMsg: Message = {
            id: 'success',
            role: 'system',
            content: "¡Estrategia generada! Minimizando asistente...",
            type: 'text'
        };
        setMessages(prev => [...prev, successMsg]);
        
        setTimeout(() => {
            onComplete?.();
            onMinimize();
        }, 1500);
    };

    const handleRestart = () => {
        setCurrentStep(1);
        setMessages([{
            id: '1',
            role: 'system',
            content: 'Reiniciando sistema... listo para calibrar.',
            type: 'text',
        }]);
        // Auto-start Q1 again
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: 'q1',
                role: 'system',
                content: '1/5 — Entregable preferido (output). ¿Qué quieres recibir después de cada video?',
                type: 'options',
                options: ['A) Acciones (3–5 pasos)', 'B) Resumen ejecutivo', 'C) Plantilla/guía', 'D) Guión (ventas/enseñanza)', 'E) Otro (escribir/🎙️)']
            }]);
        }, 1000);
        onReset?.();
    };

    const handleMicClick = () => {
        if (isRecording) {
            setIsRecording(false);
            return;
        }

        setIsRecording(true);
        // Simulate recording delay
        setTimeout(() => {
            setIsRecording(false);
            setInput(prev => prev + (prev ? " " : "") + "[Texto transcrito de voz...]");
        }, 2500);
    };

    if (!isOpen) return null;

    // MINIMIZED STATE (Dynamic Island Style)
    if (isMinimized) {
        return (
            <div 
                onClick={onMaximize}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 md:left-auto md:right-8 md:translate-x-0 z-50 animate-fade-in-up cursor-pointer group"
            >
                <div className="bg-slate-900 text-white rounded-full p-2 pl-6 pr-2 flex items-center gap-6 shadow-[0_24px_48px_-12px_rgba(15,23,42,0.6)] border border-white/10 hover:scale-[1.02] transition-all duration-300 ring-4 ring-slate-900/5 backdrop-blur-xl">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider leading-none mb-0.5">Estrategia</span>
                        <span className="text-sm font-bold leading-none tracking-tight">Activa</span>
                    </div>
                    <div className="bg-white/10 p-2.5 rounded-full group-hover:bg-white group-hover:text-slate-900 transition-colors">
                         <Maximize2 className="w-4 h-4" />
                    </div>
                </div>
            </div>
        )
    }

    // EXPANDED / MODAL STATE
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center md:pl-80 bg-slate-200/40 backdrop-blur-md p-0 md:p-6 animate-fade-in">
             <div className="w-full md:max-w-6xl h-full md:h-[90vh] bg-white/80 backdrop-blur-2xl md:rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] flex overflow-hidden border border-white/40 ring-1 ring-white/60 relative transition-all mx-auto">
                 
                 {/* Sidebar (Context HUD) */}
                 <div className="w-96 border-r border-slate-100/50 bg-slate-50/30 p-8 hidden lg:block backdrop-blur-sm shrink-0">
                     <ContextHUD currentStep={currentStep} answers={answers} />
                 </div>

                 {/* Main Chat Area */}
                 <div className="flex-1 flex flex-col relative bg-transparent w-full">
                      {/* Close / Minimize Controls */}
                      <div className="absolute top-6 right-6 z-10 flex gap-2">
                          <button onClick={onMinimize} className="p-2.5 hover:bg-slate-100/50 rounded-full transition-colors text-slate-400 hover:text-slate-900 backdrop-blur-sm cursor-pointer">
                               <Minimize2 className="w-4 h-4" />
                          </button>
                          <button onClick={onClose} className="p-2.5 hover:bg-red-50/50 rounded-full transition-colors text-slate-400 hover:text-red-500 backdrop-blur-sm cursor-pointer">
                               <X className="w-4 h-4" />
                          </button>
                      </div>

                      {/* Header */}
                      <div className="px-6 md:px-10 pt-8 md:pt-10 pb-4 md:pb-6 pr-20 md:pr-32">
                          <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 leading-tight tracking-tight">
                              Estrategia
                          </h2>
                          <div className="flex items-center gap-2 mt-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              <p className="text-slate-500 text-xs md:text-sm font-medium">NSG Intelligence Assistant</p>
                          </div>
                      </div>

                      {/* Messages Flow */}
                      <div className="flex-1 overflow-y-auto px-4 md:px-10 py-4 space-y-6 md:space-y-8 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
                            {messages.map((msg, idx) => (
                                <div
                                    key={msg.id}
                                    className={clsx(
                                        "flex w-full animate-fade-in-up",
                                        msg.role === 'user' ? "justify-end" : "justify-start"
                                    )}
                                >
                                    {msg.role === 'system' && (
                                        <div className="w-8 h-8 mr-5 mt-1 shrink-0 rounded-full overflow-hidden shadow-sm">
                                             <BrandAtom className="w-full h-full" />
                                        </div>
                                    )}

                                    <div className="max-w-[90%] md:max-w-[75%] flex flex-col gap-3">
                                        <div className={clsx(
                                            "p-6 text-[15px] leading-relaxed relative shadow-sm",
                                            msg.role === 'user' 
                                                ? "bg-slate-900 text-white rounded-[1.5rem] rounded-tr-md shadow-slate-900/10" 
                                                : "bg-white/60 text-slate-700 rounded-[1.5rem] rounded-tl-md border border-white/50 backdrop-blur-md"
                                        )}>
                                            {(() => {
                                                const formatContent = (text: string) => text.split('**').map((part, i) => 
                                                    i % 2 === 1 ? <strong key={i} className="font-bold text-slate-900">{part}</strong> : part
                                                );

                                                if (msg.title) {
                                                    return (
                                                        <div className="flex flex-col gap-2">
                                                            <span className="text-sm font-bold text-blue-400 uppercase tracking-widest leading-relaxed">
                                                                {msg.title}
                                                            </span>
                                                            <p className="font-medium text-slate-800 text-[15px]">
                                                                {formatContent(msg.content)}
                                                            </p>
                                                        </div>
                                                    );
                                                }

                                                const stepMatch = msg.role === 'system' ? msg.content.match(/^(\d+\/\d+ — [^.]+)(\.?\s*)(.*)/) : null;
                                                if (stepMatch) {
                                                    return (
                                                        <div className="flex flex-col gap-2">
                                                            <span className="text-xs font-bold text-blue-500 uppercase tracking-widest leading-relaxed">
                                                                {stepMatch[1]}
                                                            </span>
                                                            <p className="font-medium text-slate-800 text-[15px]">
                                                                {formatContent(stepMatch[3])}
                                                            </p>
                                                        </div>
                                                    );
                                                }
                                                return <p className="font-medium">{formatContent(msg.content)}</p>;
                                            })()}
                                        </div>

                                        {/* OPTIONS */}
                                        {msg.role === 'system' && msg.type === 'options' && msg.options && (
                                            <div className="flex flex-wrap gap-2.5 animate-fade-in pl-2">
                                                {msg.options.map((opt, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => handleSend(opt)}
                                                        className="px-5 py-2.5 bg-white border border-slate-200/60 hover:border-slate-300 hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-sm font-semibold rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:-translate-y-0.5 duration-300 cursor-pointer"
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* CONFIRMATION */}
                                        {msg.role === 'system' && msg.type === 'confirmation' && (
                                             <div className="flex gap-3 animate-fade-in pl-2 mt-2">
                                                 <button 
                                                    onClick={handleConfirm}
                                                    className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white hover:bg-emerald-400 rounded-xl font-bold text-sm shadow-[0_4px_12px_rgba(16,185,129,0.3)] transition-all hover:scale-105 active:scale-95 duration-300 cursor-pointer"
                                                 >
                                                     <CheckCircle2 className="w-4 h-4" />
                                                     Confirmar y Guardar
                                                 </button>
                                                 <button 
                                                    onClick={handleRestart}
                                                    className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-bold text-sm transition-all shadow-sm cursor-pointer"
                                                 >
                                                     <RefreshCw className="w-4 h-4" />
                                                     Reiniciar
                                                 </button>
                                             </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex justify-start w-full animate-fade-in pl-14">
                                        <div className="bg-white/40 px-5 py-4 rounded-full rounded-bl-none flex items-center gap-2 border border-white/40 backdrop-blur-sm">
                                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                                        </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                      </div>

                      {/* Input Area */}
                      <div className="p-4 md:p-8 pt-2 md:pt-4 bg-gradient-to-t from-white/80 via-white/40 to-transparent">
                         <div className={clsx(
                             "relative flex items-center gap-2 bg-white/80 backdrop-blur-xl rounded-full p-2 pl-6 pr-2 border transition-all shadow-[0_8px_32px_rgba(0,0,0,0.05)]",
                             isRecording ? "border-red-200 ring-4 ring-red-500/5" : "border-white/50 focus-within:border-blue-200 focus-within:ring-4 focus-within:ring-blue-500/5 hover:border-slate-200"
                         )}>
                             <input
                                 type="text"
                                 value={input}
                                 onChange={(e) => setInput(e.target.value)}
                                 onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                                 placeholder={isRecording ? "Escuchando..." : "Escribe tu respuesta..."}
                                 disabled={isRecording}
                                 className="w-full bg-transparent py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium text-base disabled:text-slate-400"
                             />
                             
                             <button 
                                onClick={handleMicClick}
                                className={clsx(
                                    "p-3 rounded-full transition-all duration-300 cursor-pointer",
                                    isRecording ? "text-red-500 bg-red-50 animate-pulse" : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                                )}
                             >
                                <Mic className="w-5 h-5" />
                             </button>

                             <button 
                                 onClick={() => handleSend(input)}
                                 disabled={!input.trim() || isRecording}
                                 className="p-3 bg-slate-900 text-white rounded-full hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg shadow-slate-900/20 cursor-pointer"
                             >
                                 <ArrowRight className="w-5 h-5" />
                             </button>
                         </div>
                         <p className="text-center text-[10px] text-slate-400 mt-4 font-medium tracking-wide">
                             Presiona Enter para enviar o usa el micrófono para hablar
                         </p>
                      </div>
                 </div>
             </div>
        </div>
    )
}
