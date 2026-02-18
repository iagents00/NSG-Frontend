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
        <div className="w-full max-w-2xl mx-auto py-6 md:py-12">
            {/* Progress Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                     <h2 className="text-2xl font-display font-bold text-navy-900">Diagnóstico Inteligente</h2>
                     <p className="text-slate-400 text-sm">IA + n8n Analysis</p>
                </div>
                <div className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {step} / 10
                </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-3xl md:rounded-4xl p-6 md:p-8 shadow-2xl shadow-blue-900/5 border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
                    <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${step * 10}%` }}></div>
                </div>

                <div className="min-h-[200px] flex flex-col justify-center">
                    <h3 className="text-xl font-medium text-navy-800 mb-8 leading-relaxed">
                        ¿Cómo describirías tu proceso actual de gestión de tareas y delegación?
                    </h3>
                    
                    <div className="space-y-3">
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
            className="w-full text-left px-6 py-4 rounded-xl border border-slate-200 text-slate-600 hover:border-blue-500 hover:bg-blue-50/50 hover:text-blue-700 font-medium transition-all group flex items-center justify-between active:scale-[0.98]"
        >
            {label}
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
        </button>
    )
}
