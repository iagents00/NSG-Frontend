"use client";

import { Crown, Clock, Zap, Target } from "lucide-react";
import { useEffect, useState } from "react";
import clsx from "clsx";

interface ContextHUDProps {
    currentStep: number;
}

export default function ContextHUD({ currentStep }: ContextHUDProps) {
    const [goals, setGoals] = useState<string>("Detecting...");
    const [time, setTime] = useState<string>("--");
    const [format, setFormat] = useState<string>("--");

    // Simulate real-time data extraction based on steps
    useEffect(() => {
        if (currentStep > 2) setGoals("Aumentar Ingresos Q4");
        if (currentStep > 4) setTime("4h / semana");
        if (currentStep > 6) setFormat("Video + Audio");
    }, [currentStep]);

    return (
        <div className="h-full flex flex-col gap-4">
            {/* Main HUD Card */}
            <div className="flex-1 bg-white/40 backdrop-blur-xl border border-white/20 shadow-2xl shadow-blue-900/5 rounded-4xl p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Target className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider">Live Context</h3>
                </div>

                <div className="space-y-6">
                    <HUDItem 
                        icon={<Crown className="w-4 h-4" />}
                        label="Primary Goal"
                        value={goals}
                        isActive={currentStep > 2}
                    />
                     <HUDItem 
                        icon={<Clock className="w-4 h-4" />}
                        label="Time Available"
                        value={time}
                        isActive={currentStep > 4}
                        delay={100}
                    />
                     <HUDItem 
                        icon={<Zap className="w-4 h-4" />}
                        label="Format"
                        value={format}
                        isActive={currentStep > 6}
                        delay={200}
                    />
                </div>

                <div className="mt-auto pt-6 border-t border-white/10">
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                        AI Analysis active. Context is being built in real-time to generate your strategic plan.
                    </p>
                </div>
            </div>

            {/* Micro Widget */}
            <div className="h-32 bg-linear-to-br from-blue-600 to-blue-700 rounded-4xl p-6 text-white shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Zap className="w-16 h-16" />
                </div>
                <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Status</p>
                <div className="text-2xl font-display font-bold">
                    {currentStep < 12 ? "Building..." : "Ready"}
                </div>
                <div className="mt-2 w-full h-1 bg-white/20 rounded-full overflow-hidden">
                     <div className="h-full bg-white/80 animate-pulse" style={{ width: '60%'}}></div>
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
            "group transition-all duration-500",
            isActive ? "opacity-100 translate-x-0" : "opacity-50 translate-x-2 grayscale"
        )}>
            <div className="flex items-center gap-2 text-slate-400 mb-1">
                {icon}
                <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
            </div>
            <div className={clsx(
                "text-lg font-semibold text-navy-900 transition-all pl-6 relative",
                isActive && "text-blue-600"
            )}>
                {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                )}
                {value}
            </div>
        </div>
    )
}
