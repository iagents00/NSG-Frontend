"use client";

import { useState, useEffect } from "react";
import ContentLibrary from "@/components/education/library/ContentLibrary";
import ActionPlanView from "@/components/education/plan/ActionPlanView";
import DiagnosticForm from "@/components/education/diagnostic/DiagnosticForm";
import ProposalView from "@/components/education/diagnostic/ProposalView";
import { GraduationCap, BookOpen, Layers, Zap } from "lucide-react";
import clsx from "clsx";
import StrategyWidget from "@/components/education/onboarding/StrategyWidget";
import { educationService } from "@/lib/education";
import { useAppStore } from "@/store/useAppStore";

type EducationView = "onboarding" | "library" | "plans" | "diagnostic";

export default function NSGEducationPage() {
    const [currentView, setCurrentView] = useState<EducationView>('library'); // Changed default to library
    
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
        // Here we would check DB if onboarding is done
        setIsStrategyOpen(true);
    }, []);

    // Navigation for Demo Purposes (Removed 'Estrategia' from main views, moved to button action)
    const NAV_ITEMS: { id: EducationView; label: string; icon: any }[] = [
        { id: 'library', label: 'Biblioteca', icon: BookOpen },
        { id: 'plans', label: 'Mis Planes', icon: Layers },
        { id: 'diagnostic', label: 'Diagnóstico IA', icon: Zap },
    ];

    const handleOpenStrategy = () => {
        setIsStrategyOpen(true);
        setIsStrategyMinimized(false);
    };

    const handleOnboardingComplete = () => {
        setIsStrategyCompleted(true);
    };

    return (
        <div className="h-full flex flex-col p-4 md:p-6 gap-4 md:gap-6 relative">
            {/* Top Navigation Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-white rounded-2xl p-2 px-4 shadow-sm border border-slate-100 shrink-0 gap-2 sm:gap-0">
                 <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0 -mx-2 px-2 sm:mx-0 sm:px-0">
                     {NAV_ITEMS.map((item) => (
                         <button
                            key={item.id}
                            onClick={() => setCurrentView(item.id)}
                            className={clsx(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                                currentView === item.id 
                                    ? "bg-navy-900 text-white shadow-md shadow-navy-900/20" 
                                    : "text-slate-500 hover:bg-slate-50 hover:text-navy-900"
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
                                : "text-slate-500 hover:bg-slate-50 hover:text-navy-900"
                        )}
                     >
                         <GraduationCap className="w-4 h-4" />
                         Estrategia
                     </button>
                 </div>
                 
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
                     NSG Education Module v1.0
                 </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden transition-all duration-500">
                {currentView === 'library' && (
                    <div className="h-full bg-slate-50/50 rounded-4xl border border-white/50 shadow-inner overflow-hidden">
                        <ContentLibrary />
                    </div>
                )}
                {/* Defaulting Plans as main view when user lands (home) */}
                {currentView === 'plans' && <ActionPlanView />}
                {currentView === 'diagnostic' && (
                     <div className="h-full bg-slate-50/50 rounded-4xl border border-white/50 shadow-inner p-8 overflow-y-auto">
                        <div className="mb-4 flex gap-4">
                             <DiagnosticWrapper /> 
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
            {showResult ? <ProposalView /> : <DiagnosticForm onComplete={() => setShowResult(true)} />}
        </div>
    );
}

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



