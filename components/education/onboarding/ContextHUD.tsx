"use client";

import { Crown, Clock, Activity, Target } from "lucide-react";
import { useEffect, useState } from "react";
import clsx from "clsx";

import { StrategyPreferences } from "@/store/useAppStore";

interface ContextHUDProps {
    currentStep: number;
    answers?: Partial<StrategyPreferences>;
}

export default function ContextHUD({ currentStep, answers }: ContextHUDProps) {
    const [goals, setGoals] = useState<string>("Detectando...");
    const [time, setTime] = useState<string>("--");
    const [format, setFormat] = useState<string>("--");

    // Simulate real-time data extraction based on steps
    useEffect(() => {
        if (answers?.entregable && currentStep > 1) setGoals(answers.entregable);
        if (answers?.learningStyle && currentStep > 2) setTime(answers.learningStyle);
        if (answers?.context && currentStep > 4) setFormat(answers.context);
    }, [currentStep, answers]);

    return (
        <div className="h-full flex flex-col gap-6">
            {/* Main HUD Card */}
            <div className="flex-1 bg-white/60 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden group">
                <div className="absolute inset-0 bg-linear-to-b from-white/50 to-transparent pointer-events-none" />
                
                <div className="flex items-center gap-4 mb-10 relative z-10">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/20 ring-1 ring-black/5">
                        <Target className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 tracking-tight leading-none">Contexto Activo</h3>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">Live Analytics</p>
                    </div>
                </div>

                <div className="space-y-8 relative z-10">
                    {/* Connecting Line */}
                    <div className="absolute left-[1.15rem] top-4 bottom-4 w-px bg-slate-200/50 -z-10" />

                     <HUDItem 
                        icon={<Crown className="w-4 h-4" />}
                        label="Entregable"
                        value={goals}
                        isActive={currentStep > 1}
                    />
                     <HUDItem 
                        icon={<Clock className="w-4 h-4" />}
                        label="Estilo de Aprendizaje"
                        value={time}
                        isActive={currentStep > 2}
                        delay={100}
                    />
                     <HUDItem 
                        icon={<Activity className="w-4 h-4" />}
                        label="Enfoque Principal"
                        value={format}
                        isActive={currentStep > 3}
                        delay={200}
                    />
                </div>

                <div className="mt-auto pt-8 border-t border-slate-100/50 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed tracking-wide">
                            Análisis en tiempo real activo
                        </p>
                    </div>
                </div>
            </div>

            {/* Micro Widget - Status */}
            <div className="h-36 bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-[0_20px_40px_-12px_rgba(15,23,42,0.4)] relative overflow-hidden group transition-transform duration-500 hover:scale-[1.02]">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-colors" />
                
                <div className="absolute top-8 right-8 text-blue-500/20 group-hover:text-blue-500/40 transition-colors duration-500">
                    <Activity className="w-12 h-12" />
                </div>

                <div className="flex flex-col justify-between h-full relative z-10">
                    <p className="text-blue-200/60 text-[10px] font-bold uppercase tracking-widest mb-1">Estado del Sistema</p>
                    
                    <div>
                        <div className="text-3xl font-display font-medium tracking-tight mb-4">
                            {currentStep < 8 ? "Calibrando..." : "Listo"}
                        </div>
                        
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                             <div 
                                className="h-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)] transition-all duration-1000 ease-out rounded-full" 
                                style={{ width: `${Math.min((currentStep / 7) * 100, 100)}%`}}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface HUDItemProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    isActive: boolean;
    delay?: number;
}

function HUDItem({ icon, label, value, isActive, delay = 0 }: HUDItemProps) {
    return (
        <div className={clsx(
            "group flex items-start gap-4 transition-all duration-700 ease-out",
            isActive ? "opacity-100 translate-x-0" : "opacity-40 translate-x-4 grayscale"
        )} style={{ transitionDelay: `${delay}ms` }}>
            
            <div className={clsx(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-500 shadow-sm",
                isActive 
                    ? "bg-white border-blue-100 text-blue-600 shadow-blue-500/10 ring-2 ring-blue-500/5" 
                    : "bg-slate-50 border-slate-100 text-slate-300"
            )}>
                {icon}
            </div>

            <div className="pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">{label}</span>
                <div className={clsx(
                    "text-base font-medium text-slate-900 transition-all font-display tracking-tight",
                    isActive && "text-slate-900"
                )}>
                    {value}
                </div>
            </div>
        </div>
    )
}
