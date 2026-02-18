"use client";

import { useState, useEffect } from "react";
import ContentLibrary from "@/components/education/library/ContentLibrary";
import DiagnosticForm from "@/components/education/diagnostic/DiagnosticForm";
import ProposalView from "@/components/education/diagnostic/ProposalView";
import { GraduationCap, BookOpen, Layers, Zap, LucideIcon } from "lucide-react";
import clsx from "clsx";
import StrategyWidget from "@/components/education/onboarding/StrategyWidget";
import { educationService } from "@/lib/education";

type EducationView = "onboarding" | "library" | "diagnostic";

export default function IEducationPage() {
    const [currentView, setCurrentView] = useState<EducationView>("library"); // Changed default to library

    // Strategy Widget State
    const [isStrategyOpen, setIsStrategyOpen] = useState(false);
    const [isStrategyMinimized, setIsStrategyMinimized] = useState(false);
    const [isStrategyCompleted, setIsStrategyCompleted] = useState(false);

    // Check onboarding status on mount - ALWAYS from database (NO CACHE)
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const status = await educationService.getOnboardingStatus();
                setIsStrategyCompleted(status.onboarding_completed);

                // Si no ha completado el onboarding, abrir el widget automáticamente
                // Si ya lo completó, mantenerlo abierto pero minimizado (Dynamic Island)
                setIsStrategyOpen(true);
                if (status.onboarding_completed) {
                    setIsStrategyMinimized(true);
                } else {
                    setIsStrategyMinimized(false);
                }
            } catch (error) {
                console.error(
                    "Error al verificar estado de onboarding:",
                    error,
                );
                // Fallback: abrir widget por si acaso
                setIsStrategyOpen(true);
            }
        };

        checkStatus();
    }, []);

    // Navigation for Demo Purposes (Removed 'Estrategia' from main views, moved to button action)
    const NAV_ITEMS: { id: EducationView; label: string; icon: LucideIcon }[] = [
        { id: "library", label: "Biblioteca", icon: BookOpen },
        { id: "diagnostic", label: "Diagnóstico IA", icon: Zap },
    ];

    const handleOpenStrategy = () => {
        setIsStrategyOpen(true);
        setIsStrategyMinimized(false);
    };

    const handleOnboardingComplete = () => {
        setIsStrategyCompleted(true);
    };

    return (
        <div className="h-full flex flex-col p-4 md:p-6 gap-4 md:gap-6 relative overflow-hidden">
            {/* Top Navigation Bar */}
            <div
                className={clsx(
                    "sticky top-0 z-[60] flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-white rounded-2xl p-2 px-4 shadow-sm border border-slate-100 shrink-0 gap-2 sm:gap-0 transition-all duration-500",
                    !isStrategyCompleted &&
                        "opacity-50 pointer-events-none grayscale",
                )}
            >
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0 -mx-2 px-2 sm:mx-0 sm:px-0">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            disabled={!isStrategyCompleted}
                            onClick={() => setCurrentView(item.id)}
                            className={clsx(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                                currentView === item.id
                                    ? "bg-navy-900 text-white shadow-md shadow-navy-900/20"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-navy-900",
                            )}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </button>
                    ))}

                    {/* Strategy Trigger Button */}
                    <button
                        onClick={handleOpenStrategy}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ml-2",
                            isStrategyOpen && !isStrategyMinimized
                                ? "bg-amber-100 text-amber-700"
                                : "text-slate-500 hover:bg-slate-50 hover:text-navy-900",
                        )}
                    >
                        <GraduationCap className="w-4 h-4" />
                        Estrategia
                    </button>
                </div>

                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
                    I Education Module v1.0
                </div>
            </div>

            {/* Main Content Area */}
            <div
                className={clsx(
                    "flex-1 transition-all duration-700 relative overflow-y-auto no-scrollbar",
                    !isStrategyCompleted &&
                        "blur-md pointer-events-none scale-[0.98] select-none opacity-40",
                )}
            >
                {currentView === "library" && (
                    <div className="bg-slate-50/50 rounded-4xl border border-white/50 shadow-inner overflow-hidden">
                        <ContentLibrary />
                    </div>
                )}

                {currentView === "diagnostic" && (
                    <div className="h-full bg-slate-50/50 rounded-4xl border border-white/50 shadow-inner p-8">
                        <div className="mb-4 flex gap-4">
                            <DiagnosticWrapper />
                        </div>
                    </div>
                )}

                {/* Overlay Message when locked */}
                {!isStrategyCompleted && (
                    <div className="absolute inset-x-0 top-1/4 z-10 flex items-center justify-center p-6 text-center">
                        <div className="max-w-md bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/40">
                            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <GraduationCap className="w-8 h-8 text-amber-500" />
                            </div>
                            <h3 className="text-xl font-display font-bold text-navy-950 mb-3">
                                Protocolo Requerido
                            </h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Por favor complete su{" "}
                                <strong>Protocolo Estratégico</strong> para
                                desbloquear las herramientas cognitivas y planes
                                de acción personalizados.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* STRATEGY WIDGET OVERLAY */}
            <StrategyWidget
                isOpen={isStrategyOpen}
                isMinimized={isStrategyMinimized}
                isCompleted={isStrategyCompleted}
                onClose={() => setIsStrategyOpen(false)}
                onMinimize={() => setIsStrategyMinimized(true)}
                onMaximize={() => setIsStrategyMinimized(false)}
                onComplete={handleOnboardingComplete}
                onReset={() => setIsStrategyCompleted(false)}
            />
        </div>
    );
}

// ─── HELPER COMPONENTS ──────────────────────────────────────────────

function DiagnosticWrapper() {
    const [showResult, setShowResult] = useState(false);
    return (
        <div className="w-full">
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setShowResult(!showResult)}
                    className="text-xs text-blue-500 underline"
                >
                    {showResult ? "Ver Formulario" : "Ver Resultado Demo"}
                </button>
            </div>
            {showResult ? (
                <ProposalView />
            ) : (
                <DiagnosticForm onComplete={() => setShowResult(true)} />
            )}
        </div>
    );
}
