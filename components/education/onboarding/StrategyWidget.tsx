/* eslint-disable */
"use client";

import { useState, useEffect, useRef } from "react";
import {
    X,
    Minimize2,
    RefreshCw,
    CheckCircle2,
    ArrowRight,
    Mic,
    Maximize2,
} from "lucide-react";
import ContextHUD from "./ContextHUD";
import { useAppStore, StrategyPreferences } from "@/store/useAppStore";
import { educationService } from "@/lib/education";
import clsx from "clsx";
import BrandAtom from "@/components/ui/BrandAtom";
import { AnimatePresence, motion } from "framer-motion";

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
    role: "system" | "user";
    content: string;
    type?: "text" | "options" | "confirmation";
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
    onReset,
}: StrategyWidgetProps) {
    const setStrategyPreferences = useAppStore(
        (state) => state.setStrategyPreferences,
    );

    // CHAT STATE
    const [currentStep, setCurrentStep] = useState(1);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "system",
            content:
                "¡Hola! Vamos a personalizar tu experiencia de aprendizaje con unas preguntas rápidas:",
            type: "text",
        },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // LOGIC STATE
    const [answers, setAnswers] = useState<Partial<StrategyPreferences>>({});
    const [awaitingCustomInput, setAwaitingCustomInput] = useState<
        keyof StrategyPreferences | null
    >(null);

    // Ref for input auto-focus
    const inputRef = useRef<HTMLInputElement>(null);

    // Load existing preferences when widget opens (for recalibration)
    // Only if user has previously completed onboarding
    useEffect(() => {
        if (isOpen && !isMinimized && isCompleted) {
            const loadExistingPreferences = async () => {
                try {
                    const prefs = await educationService.getPreferences();
                    console.log(
                        "📥 Preferencias existentes cargadas para edición:",
                        prefs,
                    );
                    setAnswers(prefs); // Pre-fill answers with existing data
                } catch (error) {
                    console.log(
                        "⚠️ Error cargando preferencias para edición:",
                        error,
                    );
                    // If error, user can still complete normally
                }
            };
            loadExistingPreferences();
        }
    }, [isOpen, isMinimized, isCompleted]);

    // Auto-focus input when awaiting custom input
    useEffect(() => {
        if (awaitingCustomInput && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }, [awaitingCustomInput]);
    const [isRecording, setIsRecording] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
        // Auto-start Q1 after intro
        // ONLY if we are starting fresh (currentStep 1, messages length 1, and NOT completed)
        if (!isCompleted && messages.length === 1 && currentStep === 1) {
            const timer = setTimeout(() => {
                setMessages((prev) => {
                    // Prevent duplicate Q1 from Strict Mode double-invocation
                    if (prev.some((m) => m.id === "q1")) return prev;

                    return [
                        ...prev,
                        {
                            id: "q1",
                            role: "system",
                            content:
                                "1/5 — Formato Preferido. ¿Cómo prefieres recibir la información?",
                            type: "options",
                            options: [
                                "A) Plan de acción paso a paso",
                                "B) Resumen corto y directo",
                                "C) Guía completa y detallada",
                                "D) Guión para presentar o vender",
                                "E) Otro (Especificar/🎙️)",
                            ],
                        },
                    ];
                });
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [messages.length, currentStep, isOpen, isCompleted]);

    // Handle initial state if completed
    useEffect(() => {
        if (isCompleted && messages.length === 1) {
            setMessages([
                {
                    id: "completed",
                    role: "system",
                    content:
                        "Tu configuración ya está lista. ¿Quieres ajustar algo?",
                    type: "confirmation",
                },
            ]);
        }
    }, [isCompleted, messages.length, currentStep]);

    const handleSend = (text: string) => {
        if (!text.trim()) return;

        // User Message
        const newMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: text,
        };
        setMessages((prev) => [...prev, newMsg]);
        setInput("");
        setIsTyping(true);

        // Simulation of n8n processing time
        setTimeout(() => {
            setIsTyping(false);

            // LOGIC MACHINE
            // Map current step to preference key
            let currentKey: keyof StrategyPreferences | null = null;
            if (currentStep === 1) currentKey = "entregable";
            if (currentStep === 2) currentKey = "learningStyle";
            if (currentStep === 3) currentKey = "depth";
            if (currentStep === 4) currentKey = "context";
            if (currentStep === 5) currentKey = "strength";
            if (currentStep === 5.5) currentKey = "friction";

            // Check if User selected "Other" or is providing Custom Input
            const isOther =
                text.toLowerCase().includes("otro") || text.includes("E)");

            // 1. If currently awaiting custom input, this text IS the answer.
            if (awaitingCustomInput) {
                setAnswers((prev) => ({
                    ...prev,
                    [awaitingCustomInput]: text,
                }));
                setAwaitingCustomInput(null); // Clear flag
                // PROCEED TO NEXT STEP (fall through to step logic below)
            }
            // 2. If user selected "Other", switch to awaiting mode WITHOUT intermediate message
            else if (isOther && currentKey) {
                setAwaitingCustomInput(currentKey);
                setMessages((prev) => [
                    ...prev,
                    {
                        id: Date.now().toString(),
                        role: "system",
                        content:
                            "Entendido. Escribe tu preferencia (o usa el micrófono 🎙️).",
                        type: "text",
                    },
                ]);
                return; // STOP HERE, wait for next input
            }
            // 3. Normal Selection
            else if (currentKey) {
                setAnswers((prev) => ({ ...prev, [currentKey]: text }));
                // PROCEED TO NEXT STEP
            }

            let nextStep = currentStep;
            let systemResponse: Message[] = [];

            // Q1 -> Q2
            if (currentStep === 1) {
                nextStep = 2;
                systemResponse.push({
                    id: Date.now().toString(),
                    role: "system",
                    content:
                        "2/5 — Estilo de Aprendizaje. ¿Cómo aprendes mejor?",
                    type: "options",
                    options: [
                        "A) Viendo (imágenes, esquemas, videos)",
                        "B) Escuchando (podcasts, audios)",
                        "C) Leyendo (textos, documentos)",
                        "D) Practicando (ejercicios, casos reales)",
                        "E) Otro",
                    ],
                });
            }
            // Q2 -> Q3
            else if (currentStep === 2) {
                nextStep = 3;
                systemResponse.push({
                    id: Date.now().toString(),
                    role: "system",
                    content:
                        "3/5 — Tiempo y Detalle. ¿Cuánto tiempo quieres dedicar a cada tema?",
                    type: "options",
                    options: [
                        "A) Rapidito (1–2 minutos, solo lo esencial)",
                        "B) Normal (5 minutos, buen resumen)",
                        "C) A fondo (10–15 minutos, bien detallado)",
                        "D) Flexible (depende del tema)",
                        "E) Otro",
                    ],
                });
            }
            // Q3 -> Q4
            else if (currentStep === 3) {
                nextStep = 4;
                systemResponse.push({
                    id: Date.now().toString(),
                    role: "system",
                    content:
                        "4/5 — Área de Aplicación. ¿En qué área vas a usar lo que aprendas?",
                    type: "options",
                    options: [
                        "A) Ventas y negociación",
                        "B) Gestión de equipos o proyectos",
                        "C) Crecimiento personal",
                        "D) Estudios o certificaciones",
                        "E) Otro",
                    ],
                });
            }
            // Q4 -> Q5 (Part 1: Strength)
            else if (currentStep === 4) {
                nextStep = 5;
                systemResponse.push({
                    id: Date.now().toString(),
                    role: "system",
                    content:
                        "5/5 — Tu Perfil. ¿Cuál es tu mayor fortaleza?",
                    type: "options",
                    options: [
                        "A) Soy enfocado y ejecuto rápido",
                        "B) Soy bueno comunicando e influyendo",
                        "C) Tengo buena visión a largo plazo",
                        "D) Soy organizado y metódico",
                        "E) Otro",
                    ],
                });
            }
            // Q5 Part 1 -> Q5 Part 2 (Friction)
            else if (currentStep === 5) {
                nextStep = 5.5; // Intermediate step
                systemResponse.push({
                    id: Date.now().toString(),
                    role: "system",
                    content: "¿Cuál es tu mayor reto al aprender algo nuevo?",
                    type: "options",
                    options: [
                        "Me distraigo fácilmente",
                        "Me cuesta empezar",
                        "Me falta organización",
                        "Entiendo la teoría pero no la aplico",
                        "Otro",
                    ],
                });
            }
            // Q5 Part 2 -> Numerology Check
            else if (currentStep === 5.5) {
                nextStep = 6;
                systemResponse.push({
                    id: Date.now().toString(),
                    role: "system",
                    title: "Personalización Extra",
                    content:
                        "Para personalizar aún más tu experiencia, ¿te gustaría compartir tu fecha de nacimiento?",
                    type: "options",
                    options: ["Sí, adelante", "Prefiero no"],
                });
            }
            // Numerology Yes -> Ask Date OR No -> Finish
            else if (currentStep === 6) {
                const wantsNumerology = text
                    .toLowerCase()
                    .includes("sí");
                setAnswers((prev) => ({
                    ...prev,
                    numerology: wantsNumerology,
                }));

                if (wantsNumerology) {
                    nextStep = 7;
                    systemResponse.push({
                        id: Date.now().toString(),
                        role: "system",
                        content: "Escribe tu fecha de nacimiento (DD/MM/AAAA):",
                        type: "text",
                    });
                } else {
                    nextStep = 8; // Done
                    systemResponse.push({
                        id: Date.now().toString(),
                        role: "system",
                        content:
                            "¡Perfecto! Todo listo. ¿Confirmamos tu configuración?",
                        type: "confirmation",
                    });
                }
            }
            // Date -> Finish
            else if (currentStep === 7) {
                setAnswers((prev) => ({ ...prev, birthDate: text }));
                nextStep = 8;
                systemResponse.push({
                    id: Date.now().toString(),
                    role: "system",
                    content:
                        "¡Perfecto! Todo listo. ¿Confirmamos tu configuración?",
                    type: "confirmation",
                });
            }

            setMessages((prev) => [...prev, ...systemResponse]);
            setCurrentStep(nextStep);
        }, 800);
    };

    const handleConfirm = async () => {
        try {
            // Validate all required fields are present
            const finalPrefs = answers as StrategyPreferences;
            const requiredFields = {
                entregable: "Entregable preferido",
                learningStyle: "Estilo de aprendizaje",
                depth: "Profundidad",
                context: "Contexto de aplicación",
                strength: "Fortaleza natural",
                friction: "Fricción típica",
            };

            const missingFields = Object.entries(requiredFields)
                .filter(
                    ([key]) => !finalPrefs[key as keyof StrategyPreferences],
                )
                .map(([, label]) => label);

            if (missingFields.length > 0) {
                const errorMsg: Message = {
                    id: "validation-error",
                    role: "system",
                    content: `⚠️ Por favor completa todas las preguntas antes de confirmar. Faltan: ${missingFields.join(", ")}`,
                    type: "text",
                };
                setMessages((prev) => [...prev, errorMsg]);
                return; // Stop here
            }

            // SAVE STRATEGY to both local store and backend
            setStrategyPreferences(finalPrefs);

            // Show saving state
            const savingMsg: Message = {
                id: "saving",
                role: "system",
                content: "Registrando protocolo...",
                type: "text",
            };
            setMessages((prev) => [...prev, savingMsg]);

            // Save to backend (will throw if fails)
            await educationService.savePreferences(finalPrefs);

            // Success feedback
            const successMsg: Message = {
                id: "success",
                role: "system",
                content: "¡Protocolo Activado! Minimizando interfaz...",
                type: "text",
            };
            setMessages((prev) =>
                prev.filter((m) => m.id !== "saving").concat(successMsg),
            );

            setTimeout(() => {
                onComplete?.();
                onMinimize();
            }, 1500);
        } catch (error) {
            console.error("Failed to save preferences", error);

            // Error feedback
            const errorMsg: Message = {
                id: "error",
                role: "system",
                content:
                    "Hubo un error al guardar. Tus preferencias se guardaron localmente. Puedes continuar usando la aplicación.",
                type: "text",
            };
            setMessages((prev) =>
                prev.filter((m) => m.id !== "saving").concat(errorMsg),
            );

            // Still allow to continue (local preferences saved)
            setTimeout(() => {
                onComplete?.();
                onMinimize();
            }, 2500);
        }
    };

    const handleRestart = async () => {
        try {
            // Call backend to reset onboarding
            await educationService.resetOnboarding();
        } catch (error) {
            console.error("Failed to reset onboarding on backend", error);
            // Continue anyway with local reset
        }

        // Reset local state
        setCurrentStep(1);
        setAnswers({});
        setMessages([
            {
                id: "1",
                role: "system",
                content: "Reiniciando configuración...",
                type: "text",
            },
        ]);
        // Auto-start Q1 again
        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                {
                    id: "q1",
                    role: "system",
                    content:
                        "1/5 — Formato Preferido. ¿Cómo prefieres recibir la información?",
                    type: "options",
                    options: [
                        "A) Plan de acción paso a paso",
                        "B) Resumen corto y directo",
                        "C) Guía completa y detallada",
                        "D) Guión para presentar o vender",
                        "E) Otro (Especificar/🎙️)",
                    ],
                },
            ]);
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
            setInput(
                (prev) =>
                    prev + (prev ? " " : "") + "[Transcripción de voz...]",
            );
        }, 2500);
    };

    return (
        <AnimatePresence mode="wait">
            {isOpen && isMinimized && (
                <motion.div
                    key="minimized"
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{
                        type: "spring",
                        stiffness: 100,
                        damping: 20,
                        mass: 0.8,
                    }}
                    onClick={onMaximize}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 md:left-auto md:right-8 md:translate-x-0 z-70 cursor-pointer group"
                >
                    <div className="bg-navy-950 text-white rounded-full p-2 pl-6 pr-2 flex items-center gap-6 shadow-sovereign border border-white/10 hover:scale-[1.02] transition-all duration-300 ring-1 ring-white/10 backdrop-blur-xl">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase font-semibold text-blue-300 tracking-wider leading-none mb-0.5">
                                Protocolo
                            </span>
                            <span className="text-sm font-bold leading-none tracking-tight">
                                Activo
                            </span>
                        </div>
                        <div className="bg-white/10 p-2.5 rounded-full group-hover:bg-blue-500 group-hover:text-white transition-colors">
                            <Maximize2 className="w-4 h-4" />
                        </div>
                    </div>
                </motion.div>
            )}

            {isOpen && !isMinimized && (
                <motion.div
                    key="maximized"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{
                        type: "spring",
                        stiffness: 100,
                        damping: 20,
                        mass: 0.8,
                    }}
                    className="fixed inset-0 z-70 flex items-center justify-center md:pl-80 bg-slate-900/20 backdrop-blur-sm p-0 md:p-6"
                >
                    <div className="w-full md:max-w-6xl h-full md:h-[90vh] bg-white/90 backdrop-blur-2xl md:rounded-[2.5rem] shadow-sovereign flex overflow-hidden border border-white/40 ring-1 ring-white/60 relative transition-all mx-auto">
                        {/* Sidebar (Context HUD) */}
                        <div className="w-96 border-r border-slate-100/50 bg-slate-50/50 p-8 hidden lg:block backdrop-blur-sm shrink-0">
                            <ContextHUD
                                currentStep={currentStep}
                                answers={answers}
                            />
                        </div>

                        {/* Main Chat Area */}
                        <div className="flex-1 flex flex-col relative bg-transparent w-full">
                            {/* Close / Minimize Controls */}
                            {isCompleted && (
                                <div className="absolute top-6 right-6 z-10 flex gap-2">
                                    <button
                                        onClick={onMinimize}
                                        className="p-2.5 hover:bg-slate-100/50 rounded-full transition-colors text-slate-400 hover:text-navy-900 backdrop-blur-sm cursor-pointer border border-transparent hover:border-slate-200"
                                    >
                                        <Minimize2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="p-2.5 hover:bg-red-50/50 rounded-full transition-colors text-slate-400 hover:text-red-500 backdrop-blur-sm cursor-pointer border border-transparent hover:border-red-100"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {/* Header */}
                            <div className="px-6 md:px-10 pt-8 md:pt-10 pb-4 md:pb-6 pr-20 md:pr-32 border-b border-slate-100/50">
                                <h2 className="text-2xl md:text-3xl font-display font-semibold text-navy-950 leading-tight tracking-tight">
                                    Protocolo Estratégico
                                </h2>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <p className="text-slate-500 text-xs md:text-sm font-medium tracking-wide uppercase">
                                        NSG Diplomatic Intelligence
                                    </p>
                                </div>
                            </div>

                            {/* Messages Flow */}
                            <div
                                className="flex-1 overflow-y-auto px-4 md:px-10 py-4 space-y-6 md:space-y-8 scroll-smooth"
                                style={{ scrollbarWidth: "none" }}
                            >
                                {messages.map((msg, idx) => (
                                    <div
                                        key={msg.id}
                                        className={clsx(
                                            "flex w-full animate-fade-in-up",
                                            msg.role === "user"
                                                ? "justify-end"
                                                : "justify-start",
                                        )}
                                    >
                                        {msg.role === "system" && (
                                            <div className="w-8 h-8 mr-5 mt-1 shrink-0 rounded-full overflow-hidden shadow-sm bg-navy-900 border border-navy-800">
                                                <BrandAtom className="w-full h-full p-1 text-white" />
                                            </div>
                                        )}

                                        <div className="max-w-[90%] md:max-w-[75%] flex flex-col gap-3">
                                            <div
                                                className={clsx(
                                                    "p-6 text-[15px] leading-relaxed relative shadow-md",
                                                    msg.role === "user"
                                                        ? "bg-navy-900 text-white rounded-3xl rounded-tr-md shadow-navy-900/20"
                                                        : "bg-white text-slate-700 rounded-3xl rounded-tl-md border border-slate-200/50",
                                                )}
                                            >
                                                {(() => {
                                                    const formatContent = (
                                                        text: string,
                                                    ) =>
                                                        text
                                                            .split("**")
                                                            .map((part, i) =>
                                                                i % 2 === 1 ? (
                                                                    <strong
                                                                        key={i}
                                                                        className="font-bold text-navy-900"
                                                                    >
                                                                        {part}
                                                                    </strong>
                                                                ) : (
                                                                    part
                                                                ),
                                                            );

                                                    if (msg.title) {
                                                        return (
                                                            <div className="flex flex-col gap-2">
                                                                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest leading-relaxed">
                                                                    {msg.title}
                                                                </span>
                                                                <p className="font-medium text-slate-800 text-[15px]">
                                                                    {formatContent(
                                                                        msg.content,
                                                                    )}
                                                                </p>
                                                            </div>
                                                        );
                                                    }

                                                    const stepMatch =
                                                        msg.role === "system"
                                                            ? msg.content.match(
                                                                  /^(\d+\/\d+ — [^.]+)(\.?\s*)(.*)/,
                                                              )
                                                            : null;
                                                    if (stepMatch) {
                                                        return (
                                                            <div className="flex flex-col gap-2">
                                                                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest leading-relaxed">
                                                                    {stepMatch[1]}
                                                                </span>
                                                                <p className="font-medium text-slate-800 text-[15px]">
                                                                    {formatContent(
                                                                        stepMatch[3],
                                                                    )}
                                                                </p>
                                                            </div>
                                                        );
                                                    }
                                                    return (
                                                        <p className="font-medium">
                                                            {formatContent(
                                                                msg.content,
                                                            )}
                                                        </p>
                                                    );
                                                })()}
                                            </div>

                                            {/* OPTIONS */}
                                            {msg.role === "system" &&
                                                msg.type === "options" &&
                                                msg.options && (
                                                    <div className="flex flex-wrap gap-2.5 animate-fade-in pl-2">
                                                        {msg.options.map(
                                                            (opt, i) => (
                                                                <button
                                                                    key={i}
                                                                    onClick={() =>
                                                                        handleSend(opt)
                                                                    }
                                                                    className="px-5 py-2.5 bg-white border border-slate-200 hover:border-navy-900 hover:bg-slate-50 text-slate-700 hover:text-navy-900 text-xs font-bold uppercase tracking-wide rounded-lg shadow-sm transition-all hover:-translate-y-0.5 duration-300 cursor-pointer text-left"
                                                                >
                                                                    {opt}
                                                                </button>
                                                            ),
                                                        )}
                                                    </div>
                                                )}

                                            {/* CONFIRMATION */}
                                            {msg.role === "system" &&
                                                msg.type === "confirmation" && (
                                                    <div className="flex gap-3 animate-fade-in pl-2 mt-2">
                                                        <button
                                                            onClick={
                                                                handleConfirm
                                                            }
                                                            className="flex items-center gap-2 px-6 py-3 bg-navy-900 text-white hover:bg-navy-800 rounded-xl font-bold text-sm shadow-lg shadow-navy-900/30 transition-all hover:scale-105 active:scale-95 duration-300 cursor-pointer"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" />
                                                            Confirmar Protocolo
                                                        </button>
                                                        <button
                                                            onClick={
                                                                handleRestart
                                                            }
                                                            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-500 hover:text-navy-900 hover:bg-slate-50 rounded-xl font-bold text-sm transition-all shadow-sm cursor-pointer"
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
                                            <div
                                                className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                                                style={{
                                                    animationDelay: "0s",
                                                }}
                                            ></div>
                                            <div
                                                className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                                                style={{
                                                    animationDelay: "0.15s",
                                                }}
                                            ></div>
                                            <div
                                                className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                                                style={{
                                                    animationDelay: "0.3s",
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 md:p-8 pt-2 md:pt-4 bg-linear-to-t from-white/90 via-white/50 to-transparent">
                                <div
                                    className={clsx(
                                        "relative flex items-center gap-2 bg-white/90 backdrop-blur-xl rounded-full p-2 pl-6 pr-2 border transition-all shadow-lg shadow-slate-200/50",
                                        isRecording
                                            ? "border-red-200 ring-4 ring-red-500/5"
                                            : "border-slate-200 hover:border-navy-900/30 focus-within:border-navy-900/50 focus-within:ring-4 focus-within:ring-navy-900/5",
                                    )}
                                >
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) =>
                                            setInput(e.target.value)
                                        }
                                        onKeyDown={(e) =>
                                            e.key === "Enter" &&
                                            handleSend(input)
                                        }
                                        placeholder={
                                            isRecording
                                                ? "Escuchando..."
                                                : "Escriba su respuesta..."
                                        }
                                        disabled={isRecording}
                                        className="w-full bg-transparent py-3 text-navy-900 placeholder:text-slate-400 focus:outline-none font-medium text-base disabled:text-slate-400"
                                    />

                                    <button
                                        onClick={handleMicClick}
                                        className={clsx(
                                            "p-3 rounded-full transition-all duration-300 cursor-pointer",
                                            isRecording
                                                ? "text-red-500 bg-red-50 animate-pulse"
                                                : "text-slate-400 hover:text-navy-900 hover:bg-slate-100",
                                        )}
                                    >
                                        <Mic className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={() => handleSend(input)}
                                        disabled={!input.trim() || isRecording}
                                        className="p-3 bg-navy-900 text-white rounded-full hover:bg-navy-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg shadow-navy-900/20 cursor-pointer"
                                    >
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                                <p className="text-center text-[10px] text-slate-400 mt-4 font-medium tracking-wide uppercase">
                                    Sistema Seguro de Inteligencia NSG v2.0
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
