"use client";

import { useState, useEffect } from "react";
import ContentLibrary from "@/components/education/library/ContentLibrary";
import {
    GraduationCap,
    BookOpen,
    Layers,
    Zap,
    ArrowLeft,
    ArrowRight,
} from "lucide-react";
import clsx from "clsx";
import StrategyWidget from "@/components/education/onboarding/StrategyWidget";
import { educationService } from "@/lib/education";
import { useAppStore } from "@/store/useAppStore";

type EducationView = "dashboard" | "library";

export default function NSGEducationPage() {
    const [currentView, setCurrentView] = useState<EducationView>("dashboard");

    // Onboarding State
    const [isLoadingOnboarding, setIsLoadingOnboarding] = useState(true);
    const [onboardingCompleted, setOnboardingCompleted] = useState(false);

    // Strategy Widget State
    const [isStrategyOpen, setIsStrategyOpen] = useState(false);
    const [isStrategyMinimized, setIsStrategyMinimized] = useState(false);
    const [isStrategyCompleted, setIsStrategyCompleted] = useState(false);

    // Get strategy preferences from store (only for display, NOT for auth)
    const strategyPreferences = useAppStore(
        (state) => state.strategyPreferences,
    );

    // Check onboarding status on mount - ALWAYS from database (NO CACHE)
    useEffect(() => {
        const checkOnboardingStatus = async () => {
            console.log(
                "🔍 Verificando status de onboarding DIRECTAMENTE desde BD...",
            );

            try {
                // ALWAYS fetch from backend - NO CACHE EVER
                const status = await educationService.getOnboardingStatus();

                console.log("📊 Status desde MongoDB:", {
                    completed: status.onboarding_completed,
                    completed_at: status.completed_at,
                });

                setOnboardingCompleted(status.onboarding_completed);
                setIsStrategyCompleted(status.onboarding_completed);

                // If not completed, force open strategy widget
                if (!status.onboarding_completed) {
                    console.log(
                        "🚫 Onboarding NO completado en BD - Bloqueando acceso",
                    );
                    setIsStrategyOpen(true);
                } else {
                    console.log(
                        "✅ Onboarding completado en BD - Acceso permitido",
                    );
                }
            } catch (error) {
                console.error("❌ Error al verificar onboarding:", error);

                // On error, BLOCK access by default (secure by default)
                setOnboardingCompleted(false);
                setIsStrategyOpen(true);

                console.log(
                    "🚫 Error en backend - Bloqueando acceso por seguridad",
                );
            } finally {
                setIsLoadingOnboarding(false);
            }
        };

        checkOnboardingStatus();
    }, []); // Only on mount - will re-run on every page visit

    // Handle onboarding completion - RE-VERIFY with database
    const handleOnboardingComplete = async () => {
        console.log("✅ Onboarding completado - Re-verificando con BD...");

        // Re-check with database to ensure it was saved
        try {
            const status = await educationService.getOnboardingStatus();

            if (status.onboarding_completed) {
                setOnboardingCompleted(true);
                setIsStrategyCompleted(true);
                setCurrentView("dashboard");
                console.log("✅ Confirmado desde BD - Acceso desbloqueado");

                // Reload the page to ensure all components have the latest data from DB
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            } else {
                console.error(
                    "❌ BD indica que onboarding NO completado - manteniendo bloqueo",
                );
                alert(
                    "Error: No se pudo verificar la finalización del onboarding. Por favor intenta de nuevo.",
                );
            }
        } catch (error) {
            console.error("❌ Error al verificar completación:", error);
            alert("Error de conexión. Por favor intenta de nuevo.");
        }
    };

    // Loading state
    if (isLoadingOnboarding) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-slate-200 border-t-navy-900 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 font-medium">
                        Cargando Education...
                    </p>
                </div>
            </div>
        );
    }

    // Onboarding Gate: Strategy Widget is the star
    if (!onboardingCompleted) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-50/50 relative">
                {/* Subtle background message - not the focus */}
                <div className="absolute inset-0 flex items-end justify-center pb-12 px-6 pointer-events-none">
                    <div className="max-w-sm text-center">
                        <p className="text-xs text-slate-400 mb-2">
                            NSG Education
                        </p>
                        <p className="text-sm text-slate-500">
                            Completa tu calibración para acceder a la biblioteca
                        </p>
                    </div>
                </div>

                {/* STRATEGY WIDGET - THIS IS THE MAIN FOCUS */}
                <StrategyWidget
                    isOpen={true} // Always open
                    isMinimized={false} // Never minimized
                    isCompleted={isStrategyCompleted}
                    onClose={() => {}} // Disabled - cannot close
                    onMinimize={() => {}} // Disabled - cannot minimize
                    onMaximize={() => setIsStrategyMinimized(false)}
                    onComplete={handleOnboardingComplete}
                    onReset={() => setIsStrategyCompleted(false)}
                />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-4 md:p-8 gap-6 md:gap-8 relative bg-[#f8fafc] overflow-y-auto no-scrollbar">
            {/* 1. HERO SECTION: Profile Highlight */}
            {currentView === "dashboard" && (
                <div className="animate-fade-in-up">
                    {/* STRATEGY SUMMARY CARD - Optimized size */}
                    <div className="relative group overflow-hidden bg-[#0f172a] rounded-3xl p-6 md:p-10 shadow-[0_20px_50px_rgba(15,23,42,0.15)] text-white mb-8">
                        {/* Recalibrate Button - Integrated into banner (top right) */}
                        {/* Recalibrate Button - Standout design */}
                        <div className="absolute top-6 right-6 md:top-8 md:right-8 z-20">
                            <button
                                onClick={async () => {
                                    try {
                                        const prefs =
                                            await educationService.getPreferences();
                                        console.log(
                                            "📋 Cargando preferencias existentes:",
                                            prefs,
                                        );
                                    } catch (error) {
                                        console.error(
                                            "Error cargando preferencias",
                                            error,
                                        );
                                    }
                                    setIsStrategyCompleted(false);
                                    setIsStrategyOpen(true);
                                    setIsStrategyMinimized(false);
                                }}
                                className="flex items-center gap-2.5 px-5 py-2.5 bg-white text-slate-900 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-[0_10px_25px_-5px_rgba(255,255,255,0.2)] hover:bg-slate-50 hover:-translate-y-0.5 transition-all duration-300 active:scale-95 border border-white"
                            >
                                <GraduationCap className="w-4 h-4 text-blue-600" />
                                Recalibrar Estrategia
                            </button>
                        </div>
                        {/* Background Accents */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] -mr-32 -mt-32"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 blur-[80px] -ml-32 -mb-32"></div>

                        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 pt-12 md:pt-4">
                            <div className="max-w-md">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-blue-300 mb-3">
                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                                    Estrategia Activa
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold mb-1 leading-tight">
                                    NSG Education
                                </h2>
                                <p className="text-blue-400/80 text-sm font-medium mb-4">
                                    Tu inteligencia operativa, potenciada.
                                </p>
                                <p className="text-slate-400 text-base leading-relaxed">
                                    Potenciando tu enfoque en{" "}
                                    <span className="text-white font-semibold">
                                        {strategyPreferences?.context ||
                                            "Negocios"}
                                    </span>{" "}
                                    con entregables de{" "}
                                    <span className="text-white font-semibold">
                                        {strategyPreferences?.entregable
                                            ?.split(")")?.[1]
                                            ?.trim() || "Acción inmediata"}
                                    </span>
                                    .
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-4 md:gap-6">
                                <StrategyPill
                                    icon={Layers}
                                    label="Estilo"
                                    value={
                                        strategyPreferences?.learningStyle
                                            ?.split(")")?.[1]
                                            ?.trim() || "Visual"
                                    }
                                />
                                <StrategyPill
                                    icon={Zap}
                                    label="Profundidad"
                                    value={
                                        strategyPreferences?.depth
                                            ?.split(")")?.[1]
                                            ?.trim() || "Práctico"
                                    }
                                />
                                <StrategyPill
                                    icon={GraduationCap}
                                    label="Frecuencia"
                                    value="Diaria"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 2. ACTION GRID - SOLO BIBLIOTECA */}
                    <div className="grid grid-cols-1 gap-6 mb-12 max-w-2xl">
                        <ActionCard
                            title="Biblioteca Inteligente"
                            subtitle="Contenido curado por IA para tu perfil"
                            description="Acceso instantáneo a videos, artículos y recursos estratégicos adaptados a tu estilo de aprendizaje y contexto de negocio."
                            icon={BookOpen}
                            accentColor="bg-blue-600"
                            onClick={() => setCurrentView("library")}
                        />
                    </div>

                    {/* 3. COMING SOON SECTION */}
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-slate-400" />
                            Próximamente
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                            <ComingSoonCard
                                title="Rutas de Aprendizaje"
                                description="Planes personalizados de acción"
                                icon={Layers}
                            />
                            <ComingSoonCard
                                title="Diagnóstico IA"
                                description="Evaluaciones inteligentes de progreso"
                                icon={Zap}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* SUB-VIEW: LIBRARY */}
            {currentView === "library" && (
                <div className="flex-1 flex flex-col gap-6 animate-fade-in">
                    {/* Sub-view Navigation */}
                    <div className="flex items-center justify-between bg-[#f8fafc]/80 backdrop-blur-md sticky top-0 z-20 pb-4">
                        <button
                            onClick={() => setCurrentView("dashboard")}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-navy-900 font-bold transition-all group shadow-sm"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Volver al Dashboard
                        </button>
                        <h2 className="text-2xl font-black text-slate-900 capitalize tracking-tight">
                            Biblioteca
                        </h2>
                        <div className="w-32"></div>
                    </div>

                    <div className="flex-1 overflow-visible">
                        <div className="h-full bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden min-h-[600px]">
                            <ContentLibrary />
                        </div>
                    </div>
                </div>
            )}

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

function StrategyPill({
    icon: Icon,
    label,
    value,
}: {
    icon: any;
    label: string;
    value: string;
}) {
    return (
        <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none ml-1">
                {label}
            </span>
            <div className="flex items-center gap-3 px-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-default group">
                <Icon className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold text-white whitespace-nowrap">
                    {value}
                </span>
            </div>
        </div>
    );
}

function ActionCard({
    title,
    subtitle,
    description,
    icon: Icon,
    accentColor,
    onClick,
}: {
    title: string;
    subtitle: string;
    description: string;
    icon: any;
    accentColor: string;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="group relative flex flex-col text-left bg-white rounded-[28px] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:border-slate-300 transition-all duration-500 hover:-translate-y-2 overflow-hidden active:scale-[0.98]"
        >
            <div
                className={clsx(
                    "w-16 h-16 rounded-[20px] flex items-center justify-center mb-6 text-white shadow-lg transition-transform group-hover:rotate-6 duration-500",
                    accentColor,
                )}
            >
                <Icon className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
                {title}
            </h3>
            <div className="flex items-center gap-2 mb-6">
                <span className="text-base font-bold text-slate-400">
                    {subtitle}
                </span>
            </div>

            <p className="text-slate-600 text-base leading-relaxed pr-4 mb-6">
                {description}
            </p>

            <div className="mt-auto flex items-center gap-2 text-navy-900 font-bold text-base group-hover:translate-x-1 transition-transform">
                Acceder ahora <ArrowRight className="w-5 h-5" />
            </div>

            {/* Gradient decoration */}
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50"></div>
        </button>
    );
}

function ComingSoonCard({
    title,
    description,
    icon: Icon,
}: {
    title: string;
    description: string;
    icon: any;
}) {
    return (
        <div className="relative flex flex-col text-left bg-white/50 rounded-[24px] p-6 border border-slate-200 border-dashed opacity-60 cursor-not-allowed">
            <div className="absolute top-4 right-4 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-wider">
                Próximamente
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">{title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
                {description}
            </p>
        </div>
    );
}
