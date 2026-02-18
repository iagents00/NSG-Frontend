"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

export default function DiagnosticForm({ onComplete }: { onComplete?: () => void }) {
    const [step, setStep] = useState(1);

    const handleNext = () => {
        if (step < 10) {
            setStep(s => s + 1);
        } else if (onComplete) {
            onComplete();
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto py-6 md:py-12">
            {/* Progress Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                     <h2 className="text-2xl font-display font-bold text-navy-950 tracking-tight">Diagnóstico Inteligente</h2>
                     <p className="text-slate-500 text-sm font-medium">Arquitectura de Procesos & Modelado IA</p>
                </div>
                <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 uppercase tracking-widest">
                    {step} / 10
                </div>
            </div>

            {/* Question Card */}
            <div className="bg-white/90 backdrop-blur-xl rounded-4xl p-6 md:p-10 shadow-sovereign border border-slate-200/60 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
                    <div className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)] transition-all duration-500" style={{ width: `${step * 10}%` }}></div>
                </div>

                <div className="min-h-[220px] flex flex-col justify-center">
                    <h3 className="text-2xl font-display font-bold text-navy-900 mb-10 leading-tight tracking-tight">
                        ¿Cómo describirías tu proceso actual de gestión de tareas y delegación?
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-3">
                        <OptionButton label="Totalmente manual (Yo hago todo)" onClick={handleNext} />
                        <OptionButton label="Uso herramientas pero es caótico" onClick={handleNext} />
                        <OptionButton label="Tengo equipo pero falta sistema" onClick={handleNext} />
                        <OptionButton label="Sistematizado y automatizado" onClick={handleNext} />
                    </div>
                </div>
            </div>
        </div>
    )
}

function OptionButton({ label, onClick }: { label: string, onClick: () => void }) {
    return (
        <button 
            onClick={onClick}
            className="w-full text-left px-6 py-5 rounded-2xl border border-slate-200/60 text-navy-900 hover:border-blue-400 hover:bg-white hover:shadow-lg hover:shadow-blue-500/5 font-bold transition-all group flex items-center justify-between active:scale-[0.98] bg-slate-50/50"
        >
            <span className="text-base">{label}</span>
            <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0 text-blue-600" />
        </button>
    )
}
