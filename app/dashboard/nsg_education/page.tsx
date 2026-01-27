"use client";

import { useState } from "react";
import OnboardingLayout from "@/components/education/onboarding/OnboardingLayout";
import ContentLibrary from "@/components/education/library/ContentLibrary";
import ActionPlanView from "@/components/education/plan/ActionPlanView";
import DiagnosticForm from "@/components/education/diagnostic/DiagnosticForm";
import ProposalView from "@/components/education/diagnostic/ProposalView";
import { GraduationCap, BookOpen, Layers, Zap } from "lucide-react";
import clsx from "clsx";

type EducationView = 'onboarding' | 'library' | 'plans' | 'diagnostic';

import StrategyWidget from "@/components/education/onboarding/StrategyWidget";

export default function NSGEducationPage() {
    const [currentView, setCurrentView] = useState<EducationView>('library'); // Changed default to library
    
    // Strategy Widget State
    const [isStrategyOpen, setIsStrategyOpen] = useState(false);
    const [isStrategyMinimized, setIsStrategyMinimized] = useState(false);
    const [isStrategyCompleted, setIsStrategyCompleted] = useState(false);

    // Initial load: Open strategy if not completed (simulated)
    useState(() => {
        // Here we would check DB if onboarding is done
        setIsStrategyOpen(true);
    });

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
                onComplete={() => setIsStrategyCompleted(true)}
                onReset={() => setIsStrategyCompleted(false)}
            />
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
                    Alternar Vista (Demo): {showResult ? "Ver Formulario" : "Ver Resultado"}
                 </button>
             </div>
             {showResult ? <ProposalView /> : <DiagnosticForm />}
        </div>
    )
}
