"use client";

import { useState } from "react";
import ChatInterface from "./ChatInterface";
import ContextHUD from "@/components/education/onboarding/ContextHUD";

export default function OnboardingLayout() {
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 12;

    return (
        <div className="relative w-full h-full overflow-hidden rounded-4xl bg-slate-100/30 border border-slate-200/50">
            {/* Dynamic Background Mesh (Subtle) */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[100px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-400/10 rounded-full blur-[100px] animate-pulse-slow delay-1000"></div>
            </div>

            <div className="flex h-full p-2 xs:p-4 sm:p-6 gap-4 sm:gap-6">
                {/* Main Glass Container - Chat */}
                <div className="flex-1 relative flex flex-col bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl shadow-blue-910/5 rounded-4xl overflow-hidden transition-all duration-300">
                    {/* Header */}
                    <div className="h-20 flex items-center justify-between px-8 border-b border-white/10 bg-white/20 backdrop-blur-md z-10">
                        <div className="flex flex-col">
                            <h2 className="text-xl font-display font-bold text-navy-900 tracking-tight">
                                Inicia tu entrevista
                            </h2>
                            <span className="text-xs font-medium text-slate-500 tracking-wide uppercase">
                                NSG Intelligence • Strategic Onboarding
                            </span>
                        </div>

                        {/* Progress Pill */}
                        <div className="flex items-center gap-3 bg-white/30 border border-white/20 px-4 py-1.5 rounded-full backdrop-blur-md">
                            <span className="text-xs font-bold text-navy-700">
                                Paso {currentStep}
                            </span>
                            <div className="w-16 h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                                    style={{
                                        width: `${(currentStep / totalSteps) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden relative">
                        <ChatInterface
                            onStepChange={setCurrentStep}
                            currentStep={currentStep}
                        />
                    </div>
                </div>

                {/* Right HUD - Context */}
                <div className="hidden lg:block w-80 shrink-0">
                    <ContextHUD currentStep={currentStep} />
                </div>
            </div>
        </div>
    );
}
