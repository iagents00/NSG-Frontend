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

export default function NSGEducationPage() {
    const [currentView, setCurrentView] = useState<EducationView>('onboarding');

    // Navigation for Demo Purposes
    const NAV_ITEMS: { id: EducationView; label: string; icon: any }[] = [
        { id: 'onboarding', label: 'Estrategia', icon: GraduationCap },
        { id: 'library', label: 'Biblioteca', icon: BookOpen },
        { id: 'plans', label: 'Mis Planes', icon: Layers },
        { id: 'diagnostic', label: 'Diagnóstico IA', icon: Zap },
    ];

    return (
        <div className="h-full flex flex-col p-6 gap-6">
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between bg-white rounded-2xl p-2 px-4 shadow-sm border border-slate-100 shrink-0">
                 <div className="flex items-center gap-1">
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
                 </div>
                 
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
                     NSG Education Module v1.0
                 </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden transition-all duration-500">
                {currentView === 'onboarding' && <OnboardingLayout />}
                {currentView === 'library' && (
                    <div className="h-full bg-slate-50/50 rounded-4xl border border-white/50 shadow-inner overflow-hidden">
                        <ContentLibrary />
                    </div>
                )}
                {currentView === 'plans' && <ActionPlanView />}
                {/* For Diagnostic, we toggle between form and result for demo */}
                {currentView === 'diagnostic' && (
                     <div className="h-full bg-slate-50/50 rounded-4xl border border-white/50 shadow-inner p-8 overflow-y-auto">
                        {/* Simple toggle for demo */}
                        <div className="mb-4 flex gap-4">
                             <DiagnosticWrapper /> 
                        </div>
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
                    Alternar Vista (Demo): {showResult ? "Ver Formulario" : "Ver Resultado"}
                 </button>
             </div>
             {showResult ? <ProposalView /> : <DiagnosticForm />}
        </div>
    )
}
