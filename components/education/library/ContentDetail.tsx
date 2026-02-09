"use client";

import { EducationContent } from "@/types/education";
import { ArrowLeft, Sparkles, MessageSquare, Brain, Loader2 } from "lucide-react";
import ContentChat from "./ContentChat";
import { useState } from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

interface ContentDetailProps {
    item: EducationContent;
    onBack: () => void;
}

export default function ContentDetail({ item, onBack }: ContentDetailProps) {
    const [currentItem, setCurrentItem] = useState<EducationContent>(item);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [direction, setDirection] = useState(0); // 1 for next, -1 for back

    const handleNext = (total: number) => {
        if (currentStep < total - 1) {
            setDirection(1);
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setDirection(-1);
            setCurrentStep(prev => prev - 1);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            {/* Header */}
            <header className="bg-white border-b border-slate-100 p-4 sticky top-0 z-50">
                <div className="max-w-full mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-500 hover:text-navy-900"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h2 className="font-bold text-navy-900 leading-none">
                                {currentItem.title}
                            </h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3 text-blue-500" />
                                Agente de Inteligencia Estratégica
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content: Focused Question Stepper */}
            <main className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
                <div className="flex-1 relative overflow-y-auto">
                    <div className="min-h-full flex items-center justify-center p-4 md:p-8">
                        <div className="w-full max-w-xl space-y-6">
                            {(() => {
                                let qProcess = (currentItem as any)?.question_process || (currentItem.fullData as any)?.question_process;
                                if (Array.isArray(qProcess)) qProcess = qProcess[0];

                                const blocks = qProcess?.question_blocks || [];
                                const allQuestions = blocks.flatMap((b: any) =>
                                    b.questions.map((q: any) => ({ ...q, blockTitle: b.block, blockIntent: b.intent }))
                                );

                                if (!allQuestions.length) {
                                    return (
                                        <div className="flex flex-col items-center justify-center py-20 space-y-6">
                                            <div className="relative">
                                                <div className="w-16 h-16 bg-white rounded-2xl shadow-xl shadow-blue-500/5 border border-slate-100 flex items-center justify-center mx-auto animate-bounce-slow">
                                                    <Brain className="w-8 h-8 text-blue-600" />
                                                </div>
                                            </div>
                                            <div className="text-center space-y-2">
                                                <p className="text-navy-900 font-bold text-lg font-display">Analizando Horizonte...</p>
                                                <p className="text-slate-400 text-xs font-medium">Preparando preguntas clave...</p>
                                            </div>
                                        </div>
                                    );
                                }

                                const currentQ = allQuestions[currentStep];
                                const progress = ((currentStep + 1) / allQuestions.length) * 100;

                                if (!currentQ) {
                                    return (
                                        <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-slate-100 shadow-2xl shadow-blue-500/10 text-center space-y-6">
                                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                                                <Sparkles className="w-10 h-10 text-blue-600" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-2xl font-black text-navy-900">¡Completado!</h3>
                                                <p className="text-slate-500 text-sm font-medium">Análisis estratégico finalizado con éxito.</p>
                                            </div>
                                            <button
                                                onClick={() => setCurrentStep(0)}
                                                className="w-full sm:w-auto px-8 py-3.5 bg-navy-900 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-all active:scale-95"
                                            >
                                                Revisar Respuestas
                                            </button>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="space-y-6">
                                        {/* Progress Bar - More Compact */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                                                <span>Progreso</span>
                                                <span className="text-blue-600">{currentStep + 1} / {allQuestions.length}</span>
                                            </div>
                                            <div className="h-1 w-full bg-white rounded-full overflow-hidden border border-slate-100/50">
                                                <motion.div
                                                    className="h-full bg-blue-600 transition-all"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress}%` }}
                                                    transition={{ duration: 0.5 }}
                                                />
                                            </div>
                                        </div>

                                        {/* Question Card - Smaller & Optimized with Stack Animation */}
                                        <div className="relative pt-4 min-h-[400px] flex items-start justify-center">
                                            <AnimatePresence mode="wait" custom={direction}>
                                                <motion.div
                                                    key={currentStep}
                                                    custom={direction}
                                                    variants={{
                                                        initial: (dir) => ({
                                                            y: dir > 0 ? 100 : -100,
                                                            opacity: 0,
                                                            scale: 0.9,
                                                            zIndex: 0
                                                        }),
                                                        animate: {
                                                            y: 0,
                                                            opacity: 1,
                                                            scale: 1,
                                                            zIndex: 10,
                                                            transition: {
                                                                type: "spring",
                                                                stiffness: 300,
                                                                damping: 30
                                                            }
                                                        },
                                                        exit: (dir) => ({
                                                            y: dir > 0 ? -50 : 50,
                                                            opacity: 0,
                                                            scale: 0.9,
                                                            zIndex: 0,
                                                            transition: { duration: 0.3 }
                                                        })
                                                    }}
                                                    initial="initial"
                                                    animate="animate"
                                                    exit="exit"
                                                    className="w-full"
                                                >
                                                    <div className="relative">
                                                        {/* Stack Effect background decoration */}
                                                        <div className="absolute inset-x-3 -bottom-2 h-16 bg-white/40 border border-slate-100 rounded-[1.5rem] -z-10"></div>
                                                        <div className="absolute inset-x-6 -bottom-4 h-16 bg-white/20 border border-slate-50 rounded-[1.5rem] -z-20"></div>

                                                        <div className="bg-white rounded-[1.5rem] p-6 md:p-10 border border-slate-100 shadow-xl shadow-blue-500/5 space-y-8 relative overflow-hidden">
                                                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                                                <span className="text-5xl font-display font-black text-navy-900">{currentQ.id}</span>
                                                            </div>

                                                            <div className="space-y-6 relative z-10">
                                                                <div className="space-y-1.5">
                                                                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em]">{currentQ.blockTitle}</span>
                                                                    <h4 className="text-xl md:text-2xl font-bold text-navy-900 leading-tight">
                                                                        {currentQ.question}
                                                                    </h4>
                                                                </div>

                                                                {currentQ.type === "choice" ? (
                                                                    <div className="grid grid-cols-1 gap-2">
                                                                        {["Opción A", "Opción B", "Opción C"].map((opt) => (
                                                                            <button key={opt} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-left font-bold text-sm text-navy-900 hover:border-blue-300 hover:bg-blue-50/30 transition-all active:scale-[0.98]">
                                                                                {opt}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <textarea
                                                                        placeholder="Escribe tu respuesta..."
                                                                        className="w-full p-5 bg-slate-50/50 border border-slate-100 rounded-2xl text-navy-900 text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all min-h-[120px] resize-none"
                                                                        value={answers[currentQ.id] || ""}
                                                                        onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
                                                                    />
                                                                )}
                                                            </div>

                                                            <div className="flex items-center justify-between pt-2">
                                                                <button
                                                                    onClick={handleBack}
                                                                    disabled={currentStep === 0}
                                                                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-navy-900 disabled:opacity-0 transition-all"
                                                                >
                                                                    <ArrowLeft className="w-3.5 h-3.5" />
                                                                    Atrás
                                                                </button>

                                                                <button
                                                                    onClick={() => handleNext(allQuestions.length)}
                                                                    className="px-6 py-3 bg-navy-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.15em] shadow-lg shadow-navy-900/10 hover:bg-blue-600 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2"
                                                                >
                                                                    {currentStep === allQuestions.length - 1 ? 'Finalizar' : 'Siguiente'}
                                                                    <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
