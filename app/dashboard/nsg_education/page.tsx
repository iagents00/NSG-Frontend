"use client";

import { useState } from "react";
import OnboardingLayout from "@/components/education/onboarding/OnboardingLayout";
import ContentLibrary from "@/components/education/library/ContentLibrary";
import ActionPlanView from "@/components/education/plan/ActionPlanView";
import DiagnosticForm from "@/components/education/diagnostic/DiagnosticForm";
import ProposalView from "@/components/education/diagnostic/ProposalView";
import { GraduationCap, BookOpen, Layers, Zap } from "lucide-react";
import clsx from "clsx";

type EducationView = "onboarding" | "library" | "plans" | "diagnostic";

export default function NSGEducationPage() {
    const [currentView, setCurrentView] = useState<EducationView>("onboarding");

    // Navigation for Demo Purposes
    const NAV_ITEMS: {
        id: EducationView;
        label: string;
        icon: React.ElementType;
    }[] = [
        { id: "onboarding", label: "Estrategia", icon: GraduationCap },
        { id: "library", label: "Biblioteca", icon: BookOpen },
        { id: "plans", label: "Mis Planes", icon: Layers },
        { id: "diagnostic", label: "Diagnóstico IA", icon: Zap },
    ];

    return (
        <div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8 h-full flex flex-col animate-fade-in-up pb-12 md:pb-16">
            {/* 1. HERO BANNER */}
            <div className="relative overflow-hidden bg-linear-to-br from-navy-950 via-slate-900 to-navy-950 px-5 py-6 sm:px-8 sm:py-8 rounded-4xl border border-white/5 shadow-2xl group transition-all duration-700 hover:shadow-indigo-500/10 mb-6 shrink-0">
                <div className="relative z-10">
                    <h2 className="font-display font-bold text-2xl lg:text-3xl tracking-tight mb-2">
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-blue-400">
                            Centro de Formación Estratégica
                        </span>
                    </h2>
                    <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
                        Potencia tus habilidades y conocimientos con planes de
                        aprendizaje personalizados e inteligencia aplicada a tu
                        crecimiento profesional.
                    </p>
                </div>

                {/* Background Accent */}
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-blue-500/10 transition-all duration-1000"></div>
            </div>

            {/* 2. TAB NAVIGATION */}
            <div className="flex p-1.5 bg-slate-100/50 backdrop-blur-md rounded-2xl w-full sm:w-fit mb-6 border border-slate-200/50 self-center shrink-0">
                {NAV_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setCurrentView(item.id)}
                        className={clsx(
                            "flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex-1 sm:flex-none whitespace-nowrap",
                            currentView === item.id
                                ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200"
                                : "text-slate-500 hover:text-slate-700 hover:bg-white/50",
                        )}
                    >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                    </button>
                ))}
            </div>

            {/* 3. MAIN CONTENT AREA */}
            <div className="flex-1 overflow-hidden transition-all duration-500 flex flex-col">
                {currentView === "onboarding" && <OnboardingLayout />}
                {currentView === "library" && (
                    <div className="h-full bg-white/40 backdrop-blur-sm rounded-4xl border border-slate-200/50 shadow-sm overflow-hidden flex flex-col">
                        <ContentLibrary />
                    </div>
                )}
                {currentView === "plans" && <ActionPlanView />}
                {currentView === "diagnostic" && (
                    <div className="h-full bg-white/40 backdrop-blur-sm rounded-4xl border border-slate-200/50 shadow-sm p-4 xs:p-8 overflow-y-auto custom-scroll">
                        <DiagnosticWrapper />
                    </div>
                )}
            </div>
        </div>
    );
}

// Wrapper to switch between form and proposal in Diagnostic view
function DiagnosticWrapper() {
    const [showResult, setShowResult] = useState(false);

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setShowResult(!showResult)}
                    className="text-xs text-blue-500 underline"
                >
                    Alternar Vista (Demo):{" "}
                    {showResult ? "Ver Formulario" : "Ver Resultado"}
                </button>
            </div>
            {showResult ? <ProposalView /> : <DiagnosticForm />}
        </div>
    );
}
