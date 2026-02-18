"use client";

import { EducationContent } from "@/types/education";
import {
    ArrowLeft,
    Brain,
    Loader2,
    Target,
    Zap,
    ListChecks,
    ChevronRight,
    Trophy,
    Lightbulb,
    CheckCircle2,
} from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { useState, useEffect, useCallback, useRef } from "react";
import { educationService } from "@/lib/education";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface ContentDetailProps {
    item: EducationContent;
    onBack: () => void;
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

interface GeneratedContent {
    question_process_generated?: {
        title?: string;
        summary?: string;
        key_insights?: Array<{ icon: string; text: string }>;
        strategic_analysis?: {
            alignment: string;
            friction_bypass: string;
        };
        action_plan?: Array<{
            task: string;
            impact: string;
            time: string;
        }>;
    };
}

export default function ContentDetail({ item, onBack }: ContentDetailProps) {
    const { showToast } = useToast();
    const [currentItem, setCurrentItem] = useState<EducationContent>(item);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [direction, setDirection] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [generatedData, setGeneratedData] = useState<GeneratedContent | null>(
        null,
    );
    const hasTriggeredRef = useRef<boolean>(false);

    const qProcess =
        currentItem.question_process || currentItem.fullData?.question_process;

    const isCompleted = qProcess?.completed === true || !!generatedData;
    const blocks: QuestionBlock[] = (qProcess?.question_blocks ||
        []) as QuestionBlock[];

    const allQuestions = Array.isArray(blocks)
        ? blocks.flatMap((b) =>
              (b.questions || []).map((q) => ({
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
            if (
                !isCompleted &&
                allQuestions.length === 0 &&
                !hasTriggeredRef.current
            ) {
                hasTriggeredRef.current = true;

                try {
                    const fullData = currentItem.fullData as any;

                    const res = await fetch(
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

                    if (res.ok) {
                        const responseText = await res.text();
                        let raw;
                        try {
                            raw = responseText ? JSON.parse(responseText) : {};
                        } catch {
                            raw = {};
                        }

                        // Normalize n8n array response [ { ... } ]
                        const data = Array.isArray(raw) ? raw[0] : raw;

                        if (data && data.question_process) {
                            setCurrentItem((prev) => ({
                                ...prev,
                                question_process: data.question_process,
                            }));
                            showToast(
                                "Protocolo de preguntas generado",
                                "success",
                            );
                        }
                    }

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
        showToast,
    ]);

    // Fetch generated content if already completed
    useEffect(() => {
        if (qProcess?.completed === true && !generatedData && !isRefreshing) {
            const fetchGenerated = async () => {
                try {
                    const data = await educationService.getGeneratedContent(
                        currentItem.id,
                    );
                    setGeneratedData(data);
                } catch (error) {
                    console.error("Error fetching generated content:", error);
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

    const handleBackBtn = () => {
        if (currentStep > 0) {
            setDirection(-1);
            setCurrentStep((prev) => prev - 1);
        }
    };

    // Render Analysis Cards
    const renderAnalysis = () => {
        const data = (generatedData?.question_process_generated ||
            currentItem.fullData) as GeneratedContent["question_process_generated"];
        if (!data) return null;

        const containerVariants = {
            hidden: { opacity: 0 },
            visible: {
                opacity: 1,
                transition: {
                    staggerChildren: 0.15,
                },
            },
        };

        const itemVariants = {
            hidden: { y: 20, opacity: 0 },
            visible: { y: 0, opacity: 1 },
        };

        return (
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-4xl mx-auto space-y-8 pb-12"
            >
                {/* Header Card */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-2xl shadow-blue-500/5 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Trophy className="w-32 h-32 text-navy-900" />
                    </div>
                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-2xl md:text-3xl font-black text-navy-900 tracking-tight prose prose-p:my-0 prose-strong:text-navy-900">
                                <ReactMarkdown>Análisis Estratégico</ReactMarkdown>
                            </div>
                        </div>
                        <div className="text-slate-500 text-lg font-medium leading-relaxed max-w-2xl prose prose-p:my-0 prose-strong:text-slate-700">
                            <ReactMarkdown>
                                {data.summary ||
                                    "He procesado este recurso bajo tu arquitectura de pensamiento. Aquí tienes el horizonte de ejecución."}
                            </ReactMarkdown>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Key insights */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-white rounded-4xl p-8 border border-slate-100 shadow-xl shadow-blue-500/5 space-y-6"
                    >
                        <div className="flex items-center gap-3 text-blue-600">
                            <Lightbulb className="w-6 h-6" />
                            <div className="font-bold text-lg uppercase tracking-wider prose prose-p:my-0 prose-strong:text-blue-600">
                                <ReactMarkdown>Key Insights</ReactMarkdown>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {(data.key_insights || []).map(
                                (
                                    insight: { icon?: string; text: string },
                                    i: number,
                                ) => (
                                    <div
                                        key={i}
                                        className="flex gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 group hover:bg-white hover:shadow-md transition-all"
                                    >
                                        <span className="text-xl shrink-0">
                                            {insight.icon || "💡"}
                                        </span>
                                        <div className="text-sm font-medium text-slate-700 leading-relaxed prose prose-p:my-0 prose-strong:text-slate-900">
                                            <ReactMarkdown>{insight.text}</ReactMarkdown>
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    </motion.div>

                    {/* Strategic Alignment */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-navy-900 rounded-4xl p-8 text-white shadow-xl shadow-navy-900/10 space-y-6 relative overflow-hidden"
                    >
                        <div className="absolute -bottom-8 -right-8 opacity-10">
                            <Brain className="w-40 h-40 text-white" />
                        </div>
                        <div className="flex items-center gap-3 text-blue-400 relative z-10">
                            <Target className="w-6 h-6" />
                            <div className="font-bold text-lg uppercase tracking-wider prose prose-p:my-0 prose-strong:text-blue-400">
                                <ReactMarkdown>Alineación</ReactMarkdown>
                            </div>
                        </div>
                        <div className="space-y-6 relative z-10">
                            <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                                    Objetivo
                                </span>
                                <div className="text-sm leading-relaxed text-slate-200 prose prose-p:my-0 prose-strong:text-white prose-invert">
                                    <ReactMarkdown>
                                        {data.strategic_analysis?.alignment || ''}
                                    </ReactMarkdown>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                                    Bypass de Fricción
                                </span>
                                <div className="text-sm leading-relaxed text-slate-200 prose prose-p:my-0 prose-strong:text-white prose-invert">
                                    <ReactMarkdown>
                                        {data.strategic_analysis?.friction_bypass || ''}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Action Plan */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white rounded-4xl p-8 md:p-10 border border-slate-100 shadow-xl shadow-blue-500/5 space-y-8"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-emerald-600">
                            <ListChecks className="w-6 h-6" />
                            <div className="font-bold text-lg uppercase tracking-wider prose prose-p:my-0 prose-strong:text-emerald-600">
                                <ReactMarkdown>Plan de Acción</ReactMarkdown>
                            </div>
                        </div>
                        <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full uppercase">
                            Próximos Pasos
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {(data.action_plan || []).map(
                            (
                                step: {
                                    task: string;
                                    impact: string;
                                    time: string;
                                },
                                i: number,
                            ) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-6 p-6 bg-slate-50/50 rounded-2xl group hover:bg-emerald-50/30 transition-all border border-transparent hover:border-emerald-100"
                                >
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-navy-900 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-navy-900 prose prose-p:my-0 prose-strong:text-navy-900">
                                            <ReactMarkdown>{step.task}</ReactMarkdown>
                                        </div>
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
            </motion.div>
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
                            <div className="font-bold text-navy-900 leading-none prose prose-p:my-0 prose-strong:text-navy-900">
                                <ReactMarkdown>
                                    {generatedData?.question_process_generated
                                        ?.title ||
                                        currentItem.title ||
                                        (currentItem.fullData as any)?.title ||
                                        "Recurso de Inteligencia"}
                                </ReactMarkdown>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1.5">
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
                    <div className="max-w-xl mx-auto space-y-10">
                        {/* Improved Progress Header */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                                        Protocolo de Análisis
                                    </span>
                                    <h4 className="font-bold text-navy-950">
                                        Etapa {currentStep + 1} de{" "}
                                        {allQuestions.length}
                                    </h4>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-navy-300">
                                        {Math.round(
                                            ((currentStep + 1) /
                                                allQuestions.length) *
                                                100,
                                        )}
                                        %
                                    </span>
                                </div>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                <motion.div
                                    className="h-full bg-linear-to-r from-blue-600 to-indigo-500 transition-all rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: `${((currentStep + 1) / allQuestions.length) * 100}%`,
                                    }}
                                    transition={{
                                        duration: 0.8,
                                        ease: "circOut",
                                    }}
                                />
                            </div>
                        </div>

                        <div className="relative pt-4 min-h-[400px]">
                            <AnimatePresence mode="wait" custom={direction}>
                                <motion.div
                                    key={currentStep}
                                    initial={{
                                        x: direction > 0 ? 20 : -20,
                                        opacity: 0,
                                    }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{
                                        x: direction > 0 ? -20 : 20,
                                        opacity: 0,
                                    }}
                                    transition={{
                                        type: "spring",
                                        damping: 25,
                                        stiffness: 200,
                                    }}
                                    className="w-full"
                                >
                                    <div className="bg-white rounded-4xl p-8 md:p-12 border border-slate-100 shadow-2xl shadow-blue-500/5 space-y-10 border-t-8 border-t-blue-600">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-600" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    {
                                                        allQuestions[
                                                            currentStep
                                                        ].blockTitle
                                                    }
                                                </span>
                                            </div>
                                            <h4 className="text-3xl font-bold text-navy-900 leading-tight tracking-tight">
                                                {
                                                    allQuestions[currentStep]
                                                        .question
                                                }
                                            </h4>
                                        </div>

                                        {/* Input Section */}
                                        <div className="flex-1 min-h-[200px] flex flex-col justify-center">
                                            {allQuestions[currentStep]
                                                .options &&
                                            allQuestions[currentStep].options!
                                                .length > 0 ? (
                                                <div className="grid grid-cols-1 gap-4">
                                                    {(
                                                        allQuestions[
                                                            currentStep
                                                        ].options || []
                                                    ).map((opt: string) => (
                                                        <motion.button
                                                            key={opt}
                                                            whileHover={{
                                                                x: 5,
                                                            }}
                                                            whileTap={{
                                                                scale: 0.98,
                                                            }}
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
                                                                "w-full p-5 border-2 rounded-2xl text-left font-bold transition-all flex items-center justify-between group",
                                                                answers[
                                                                    allQuestions[
                                                                        currentStep
                                                                    ].id ||
                                                                        `q-${currentStep}`
                                                                ] === opt
                                                                    ? "bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-500/20"
                                                                    : "bg-slate-50 border-slate-100 text-navy-900 hover:border-blue-300 hover:bg-white",
                                                            )}
                                                        >
                                                            <span className="text-lg">
                                                                {opt}
                                                            </span>
                                                            <CheckCircle2
                                                                className={clsx(
                                                                    "w-6 h-6 transition-all",
                                                                    answers[
                                                                        allQuestions[
                                                                            currentStep
                                                                        ].id ||
                                                                            `q-${currentStep}`
                                                                    ] === opt
                                                                        ? "opacity-100"
                                                                        : "opacity-0 group-hover:opacity-20",
                                                                )}
                                                            />
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            ) : allQuestions[currentStep]
                                                  .type === "boolean" ? (
                                                <div className="grid grid-cols-2 gap-6">
                                                    {["Sí", "No"].map((opt) => (
                                                        <motion.button
                                                            key={opt}
                                                            whileHover={{
                                                                y: -5,
                                                            }}
                                                            whileTap={{
                                                                scale: 0.95,
                                                            }}
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
                                                                "p-10 border-2 rounded-4xl font-black text-3xl transition-all shadow-sm",
                                                                answers[
                                                                    allQuestions[
                                                                        currentStep
                                                                    ].id ||
                                                                        `q-${currentStep}`
                                                                ] === opt
                                                                    ? "bg-blue-600 text-white border-blue-600 shadow-2xl shadow-blue-500/30"
                                                                    : "bg-slate-50 border-slate-100 text-navy-900 hover:border-blue-300 hover:bg-white",
                                                            )}
                                                        >
                                                            {opt}
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <textarea
                                                    placeholder="Describe tu respuesta técnica aquí..."
                                                    className="w-full flex-1 p-8 bg-slate-50 border-2 border-slate-100 rounded-4xl text-navy-900 text-lg font-medium focus:border-blue-600 focus:bg-white outline-none transition-all resize-none shadow-inner min-h-[180px]"
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

                                        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                            <button
                                                onClick={handleBackBtn}
                                                disabled={currentStep === 0}
                                                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-navy-900 disabled:opacity-0 transition-colors"
                                            >
                                                <ArrowLeft className="w-5 h-5" />
                                                Atrás
                                            </button>

                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() =>
                                                    handleNext(
                                                        allQuestions.length,
                                                    )
                                                }
                                                disabled={
                                                    isSubmitting ||
                                                    (allQuestions[currentStep]
                                                        .type !== "text" &&
                                                        !answers[
                                                            allQuestions[
                                                                currentStep
                                                            ].id ||
                                                                `q-${currentStep}`
                                                        ])
                                                }
                                                className={clsx(
                                                    "px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed",
                                                    isSubmitting
                                                        ? "bg-slate-100 text-slate-400"
                                                        : "bg-navy-900 text-white shadow-navy-900/20 hover:bg-blue-600",
                                                )}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 animate-spin" />{" "}
                                                        Procesando...
                                                    </>
                                                ) : (
                                                    <>
                                                        {currentStep ===
                                                        allQuestions.length - 1
                                                            ? "Finalizar Protocolo"
                                                            : "Continuar"}
                                                        <ChevronRight className="w-5 h-5" />
                                                    </>
                                                )}
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 space-y-8">
                        <div className="relative">
                            <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center border border-slate-100 shadow-xl">
                                <Zap className="w-12 h-12 text-blue-600 animate-pulse" />
                            </div>
                            <div className="absolute -inset-4 bg-blue-500/10 blur-3xl rounded-full -z-10 animate-pulse"></div>
                        </div>
                        <div className="text-center space-y-4">
                            <h3 className="text-3xl font-black text-navy-950 font-display tracking-tight">
                                Sincronizando Inteligencia...
                            </h3>
                            <p className="text-slate-500 text-lg font-medium max-w-sm mx-auto leading-relaxed">
                                Estamos extrayendo los horizontes estratégicos
                                de este recurso para tu arquitectura.
                            </p>
                            <div className="flex justify-center gap-1">
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ opacity: [0.2, 1, 0.2] }}
                                        transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                            delay: i * 0.2,
                                        }}
                                        className="w-2 h-2 rounded-full bg-blue-600"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
