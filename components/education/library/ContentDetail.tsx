"use client";

import { EducationContent } from "@/types/education";
import {
    ArrowLeft,
    Sparkles,
    Brain,
    Loader2,
    Target,
    Zap,
    ListChecks,
    ChevronRight,
    Trophy,
    Lightbulb,
} from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { useState, useEffect, useCallback, useRef } from "react";
import { educationService } from "@/lib/education";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

interface ContentDetailProps {
    item: EducationContent;
    onBack: () => void;
}

export default function ContentDetail({ item, onBack }: ContentDetailProps) {
    const { showToast } = useToast();
    const [currentItem, setCurrentItem] = useState<EducationContent>(item);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [direction, setDirection] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [generatedData, setGeneratedData] = useState<any>(null);
    const hasTriggeredRef = useRef<boolean>(false);

    const qProcess =
        (currentItem as any)?.question_process ||
        (currentItem.fullData as any)?.question_process;
    const isCompleted = qProcess?.completed === true || !!generatedData;
    const blocks = qProcess?.question_blocks || [];
    const allQuestions = Array.isArray(blocks)
        ? blocks.flatMap((b: any) =>
              (b.questions || []).map((q: any) => ({
                  ...q,
                  blockTitle: b.block,
                  blockIntent: b.intent,
              })),
          )
        : [];

    const refreshContent = useCallback(async () => {
        try {
            setIsRefreshing(true);
            const updated = await educationService.getContent(currentItem.id);
            if (updated) {
                setCurrentItem(updated);
            }
        } catch (error) {
            console.error("Error refreshing content:", error);
        } finally {
            setIsRefreshing(false);
        }
    }, [currentItem.id]);

    const handleFinishAnswers = async () => {
        try {
            setIsSubmitting(true);
            await educationService.saveAnswers(currentItem.id, answers);
            showToast(
                "Respuestas enviadas. Generando análisis final...",
                "success",
            );

            // La petición await educationService.saveAnswers ahora espera el success de n8n
            // Ahora traemos el recurso de la tabla education_content_generated
            const finalData = await educationService.getGeneratedContent(
                currentItem.id,
            );
            setGeneratedData(finalData);
            showToast("Análisis completado exitosamente", "success");
            await refreshContent();
        } catch (error) {
            console.error("Error saving answers:", error);
            showToast(
                "No se pudo generar el análisis. Intenta de nuevo.",
                "error",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Webhook Trigger Logic
    useEffect(() => {
        const triggerWebhook = async () => {
            // Only trigger if no questions AND not completed AND not already triggered in this session
            if (
                !isCompleted &&
                allQuestions.length === 0 &&
                !hasTriggeredRef.current
            ) {
                hasTriggeredRef.current = true;

                try {
                    console.log(
                        `[ContentDetail] Triggering webhook for item: ${currentItem.id}`,
                    );
                    const fullData = currentItem.fullData as any;

                    await fetch(
                        `/api/nsg-education/content/${currentItem.id}/questions`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                action: "start_questions",
                                telegramId: fullData?.telegram_id,
                            }),
                        },
                    );

                    // Start polling after a short delay
                    setTimeout(refreshContent, 3000);
                } catch (error) {
                    console.error("Error triggering webhook:", error);
                }
            }
        };

        triggerWebhook();
    }, [
        isCompleted,
        allQuestions.length,
        currentItem.id,
        currentItem.fullData,
        refreshContent,
    ]);

    // Fetch generated content if already completed
    useEffect(() => {
        if (qProcess?.completed === true && !generatedData && !isRefreshing) {
            const fetchGenerated = async () => {
                try {
                    console.log(
                        `[ContentDetail] Fetching existing generated content for: ${currentItem.id}`,
                    );
                    const data = await educationService.getGeneratedContent(
                        currentItem.id,
                    );
                    setGeneratedData(data);
                } catch (error) {
                    console.error("Error fetching generated content:", error);
                    // No mostramos toast de error aquí para no molestar si el registro aún no existe
                    // pero el flag está en true (posible desincronización base de datos)
                }
            };
            fetchGenerated();
        }
    }, [qProcess?.completed, currentItem.id, generatedData, isRefreshing]);

    // Long polling if still processing
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (!isCompleted && allQuestions.length === 0) {
            interval = setInterval(refreshContent, 5000);
        }
        return () => clearInterval(interval);
    }, [isCompleted, allQuestions.length, refreshContent]);

    const handleNext = (total: number) => {
        if (currentStep < total - 1) {
            setDirection(1);
            setCurrentStep((prev) => prev + 1);
        } else {
            handleFinishAnswers();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setDirection(-1);
            setCurrentStep((prev) => prev - 1);
        }
    };

    // Render Analysis Cards
    const renderAnalysis = () => {
        const data = (generatedData?.question_process_generated ||
            currentItem.fullData) as any;
        if (!data) return null;

        return (
            <div className="max-w-4xl mx-auto space-y-8 pb-12">
                {/* Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-2xl shadow-blue-500/5 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Trophy className="w-32 h-32 text-navy-900" />
                    </div>
                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-black text-navy-900 tracking-tight">
                                Análisis Estratégico
                            </h3>
                        </div>
                        <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-2xl">
                            {data.summary ||
                                "He procesado este recurso bajo tu arquitectura de pensamiento. Aquí tienes el horizonte de ejecución."}
                        </p>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Key insights */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-4xl p-8 border border-slate-100 shadow-xl shadow-blue-500/5 space-y-6"
                    >
                        <div className="flex items-center gap-3 text-blue-600">
                            <Lightbulb className="w-6 h-6" />
                            <h4 className="font-bold text-lg uppercase tracking-wider">
                                Key Insights
                            </h4>
                        </div>
                        <div className="space-y-4">
                            {(data.key_insights || []).map(
                                (insight: any, i: number) => (
                                    <div
                                        key={i}
                                        className="flex gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 group hover:bg-white hover:shadow-md transition-all"
                                    >
                                        <span className="text-xl shrink-0">
                                            {insight.icon || "💡"}
                                        </span>
                                        <p className="text-sm font-medium text-slate-700 leading-relaxed">
                                            {insight.text}
                                        </p>
                                    </div>
                                ),
                            )}
                        </div>
                    </motion.div>

                    {/* Strategic Alignment */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-navy-900 rounded-4xl p-8 text-white shadow-xl shadow-navy-900/10 space-y-6 relative overflow-hidden"
                    >
                        <div className="absolute -bottom-8 -right-8 opacity-10">
                            <Brain className="w-40 h-40 text-white" />
                        </div>
                        <div className="flex items-center gap-3 text-blue-400 relative z-10">
                            <Target className="w-6 h-6" />
                            <h4 className="font-bold text-lg uppercase tracking-wider">
                                Alineación
                            </h4>
                        </div>
                        <div className="space-y-6 relative z-10">
                            <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                                    Objetivo
                                </span>
                                <p className="text-sm leading-relaxed text-slate-200">
                                    {data.strategic_analysis?.alignment}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                                    Bypass de Fricción
                                </span>
                                <p className="text-sm leading-relaxed text-slate-200">
                                    {data.strategic_analysis?.friction_bypass}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Action Plan */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-4xl p-8 md:p-10 border border-slate-100 shadow-xl shadow-blue-500/5 space-y-8"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-emerald-600">
                            <ListChecks className="w-6 h-6" />
                            <h4 className="font-bold text-lg uppercase tracking-wider">
                                Plan de Acción
                            </h4>
                        </div>
                        <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full uppercase">
                            Próximos Pasos
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {(data.action_plan || []).map(
                            (step: any, i: number) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-6 p-6 bg-slate-50/50 rounded-2xl group hover:bg-emerald-50/30 transition-all border border-transparent hover:border-emerald-100"
                                >
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-navy-900 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-navy-900">
                                            {step.task}
                                        </p>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span
                                                className={clsx(
                                                    "text-[9px] font-black uppercase tracking-widest",
                                                    step.impact === "High"
                                                        ? "text-red-500"
                                                        : "text-amber-500",
                                                )}
                                            >
                                                Impacto {step.impact}
                                            </span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                {step.time}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                                </div>
                            ),
                        )}
                    </div>
                </motion.div>
            </div>
        );
    };

    return (
        <div className="flex flex-col min-h-full bg-slate-50/50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 sticky top-0 z-50">
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
                                {generatedData?.question_process_generated
                                    ?.title ||
                                    currentItem.title ||
                                    (currentItem.fullData as any)?.title ||
                                    "Recurso de Inteligencia"}
                            </h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3 text-blue-500" />
                                {isCompleted
                                    ? "Análisis Estratégico Finalizado"
                                    : "Agente de Inteligencia Estratégica"}
                            </p>
                        </div>
                    </div>
                    {isRefreshing && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold animate-pulse">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Sincronizando...
                        </div>
                    )}
                </div>
            </header>

            <main className="flex-1 p-4 md:p-8">
                {isCompleted ? (
                    renderAnalysis()
                ) : allQuestions.length > 0 ? (
                    <div className="max-w-xl mx-auto space-y-6">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                                <span>Progreso</span>
                                <span className="text-blue-600">
                                    {currentStep + 1} / {allQuestions.length}
                                </span>
                            </div>
                            <div className="h-1 w-full bg-white rounded-full overflow-hidden border border-slate-100/50">
                                <motion.div
                                    className="h-full bg-blue-600 transition-all"
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: `${((currentStep + 1) / allQuestions.length) * 100}%`,
                                    }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </div>

                        <div className="relative pt-4 min-h-[400px]">
                            <AnimatePresence mode="wait" custom={direction}>
                                <motion.div
                                    key={currentStep}
                                    className="w-full"
                                    layout
                                >
                                    <div className="bg-white rounded-4xl p-8 md:p-12 border border-slate-100 shadow-xl shadow-blue-500/5 space-y-8">
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em]">
                                                {
                                                    allQuestions[currentStep]
                                                        .blockTitle
                                                }
                                            </span>
                                            <h4 className="text-2xl font-bold text-navy-900 leading-tight">
                                                {
                                                    allQuestions[currentStep]
                                                        .question
                                                }
                                            </h4>
                                        </div>

                                        {/* Input Section - Robust rendering */}
                                        <div className="flex-1 min-h-[220px] py-4 flex flex-col">
                                            {/* Debug Label */}
                                            <div className="mb-2 text-[10px] text-blue-500/40 font-black uppercase tracking-widest">
                                                Modo:{" "}
                                                {allQuestions[currentStep]
                                                    .type || "desconocido"}
                                            </div>

                                            {allQuestions[currentStep].options
                                                ?.length > 0 ? (
                                                <div className="grid grid-cols-1 gap-3">
                                                    {(
                                                        allQuestions[
                                                            currentStep
                                                        ].options || []
                                                    ).map((opt: string) => (
                                                        <button
                                                            key={opt}
                                                            onClick={() =>
                                                                setAnswers({
                                                                    ...answers,
                                                                    [allQuestions[
                                                                        currentStep
                                                                    ].id ||
                                                                    `q-${currentStep}`]:
                                                                        opt,
                                                                })
                                                            }
                                                            className={clsx(
                                                                "w-full p-4 border-2 rounded-2xl text-left font-bold text-sm transition-all",
                                                                answers[
                                                                    allQuestions[
                                                                        currentStep
                                                                    ].id ||
                                                                        `q-${currentStep}`
                                                                ] === opt
                                                                    ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200"
                                                                    : "bg-slate-50 border-slate-200 text-navy-900 hover:border-blue-300",
                                                            )}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : allQuestions[currentStep]
                                                  .type === "boolean" ? (
                                                <div className="grid grid-cols-2 gap-4">
                                                    {["Sí", "No"].map((opt) => (
                                                        <button
                                                            key={opt}
                                                            onClick={() =>
                                                                setAnswers({
                                                                    ...answers,
                                                                    [allQuestions[
                                                                        currentStep
                                                                    ].id ||
                                                                    `q-${currentStep}`]:
                                                                        opt,
                                                                })
                                                            }
                                                            className={clsx(
                                                                "p-8 border-2 rounded-3xl font-black text-xl transition-all",
                                                                answers[
                                                                    allQuestions[
                                                                        currentStep
                                                                    ].id ||
                                                                        `q-${currentStep}`
                                                                ] === opt
                                                                    ? "bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-200"
                                                                    : "bg-slate-50 border-slate-200 text-navy-900 hover:border-blue-300",
                                                            )}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <textarea
                                                    placeholder="Escribe tu respuesta aquí..."
                                                    className="w-full flex-1 p-6 bg-white border-2 border-slate-300 rounded-4xl text-navy-900 text-base font-medium focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all resize-none shadow-sm min-h-[160px]"
                                                    value={
                                                        answers[
                                                            allQuestions[
                                                                currentStep
                                                            ].id ||
                                                                `q-${currentStep}`
                                                        ] || ""
                                                    }
                                                    onChange={(e) =>
                                                        setAnswers({
                                                            ...answers,
                                                            [allQuestions[
                                                                currentStep
                                                            ].id ||
                                                            `q-${currentStep}`]:
                                                                e.target.value,
                                                        })
                                                    }
                                                />
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between pt-4">
                                            <button
                                                onClick={handleBack}
                                                disabled={currentStep === 0}
                                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-navy-900 disabled:opacity-0"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                Atrás
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleNext(
                                                        allQuestions.length,
                                                    )
                                                }
                                                disabled={isSubmitting}
                                                className="px-8 py-4 bg-navy-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-navy-900/10 hover:bg-blue-600 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Guardando...
                                                    </>
                                                ) : (
                                                    <>
                                                        {currentStep ===
                                                        allQuestions.length - 1
                                                            ? "Finalizar"
                                                            : "Siguiente"}
                                                        <ChevronRight className="w-4 h-4" />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 space-y-8">
                        <div className="relative">
                            <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center border border-blue-100">
                                <Zap className="w-10 h-10 text-blue-600 animate-pulse" />
                            </div>
                            <div className="absolute -inset-4 bg-blue-500/10 blur-2xl rounded-full -z-10 animate-pulse"></div>
                        </div>
                        <div className="text-center space-y-3">
                            <h3 className="text-2xl font-black text-navy-900 font-display">
                                Sincronizando Inteligencia...
                            </h3>
                            <p className="text-slate-400 text-sm font-medium max-w-xs mx-auto">
                                Estamos extrayendo los horizontes estratégicos
                                de este recurso para tu arquitectura.
                            </p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
