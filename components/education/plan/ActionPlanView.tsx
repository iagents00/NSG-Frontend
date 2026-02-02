"use client";

import {
    CheckCircle2,
    TrendingUp,
    Calendar,
    Download,
    Share2,
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { Banner } from "@/components/ui/Banner";

export default function ActionPlanView() {
    return (
        <div className="flex flex-col h-full bg-slate-50/50 rounded-4xl overflow-y-auto p-4 md:p-8 lg:px-20 lg:py-12">
            {/* 1. HERO BANNER - Dashboard Optimized Style */}
            <Banner
                badge="Directiva Operativa Q4"
                title="Plan de Acción"
                description={
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-bold text-blue-400/80 uppercase tracking-widest">
                                Información Clave
                            </h3>
                            <ul className="space-y-2">
                                {[
                                    "Enfocar el 80% en High-Ticket.",
                                    "Delegar operaciones antes de Nov.",
                                    "Sistema de referidos automatizado.",
                                ].map((item, i) => (
                                    <li
                                        key={i}
                                        className="flex items-start gap-2 text-slate-300 text-sm"
                                    >
                                        <div className="w-1 h-1 rounded-full bg-blue-500 mt-2 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/5">
                            <p className="text-slate-400 text-xs leading-relaxed italic">
                                "La eficiencia estratégica exige la eliminación
                                sistemática de la fricción operativa."
                            </p>
                        </div>
                    </div>
                }
            />

            {/* Action Section */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Immediate Actions */}
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <h3 className="text-xl font-bold text-navy-900 mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            Protocolos Inmediatos
                        </h3>
                        <div className="space-y-3">
                            <TaskItem text="Redactar script de solicitud de referidos para Top 10 Clientes." />
                            <TaskItem text="Bloquear 2 horas en calendario para Deep Work (Ventas)." />
                            <TaskItem text="Implementar plugin CRM para trazabilidad de leads." />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-navy-900 mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-500" />
                            Cronograma de Despliegue
                        </h3>
                        <div className="bg-white rounded-2xl border border-slate-200 p-1 divide-y divide-slate-100">
                            <WeekItem
                                day="Lunes"
                                task="Auditoría de procesos actuales."
                            />
                            <WeekItem
                                day="Miércoles"
                                task="Lanzamiento de campaña mail."
                            />
                            <WeekItem
                                day="Viernes"
                                task="Revisión de métricas y ajuste."
                            />
                        </div>
                    </div>
                </div>

                {/* KPIs & Sidebar */}
                <div className="space-y-6">
                    <div className="bg-navy-900 text-white rounded-3xl p-6 shadow-2xl shadow-navy-900/20">
                        <div className="flex items-center gap-2 mb-6 opacity-80">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">
                                Vectores de Rendimiento
                            </span>
                        </div>
                        <div className="space-y-6">
                            <KPIItem
                                label="Nuevos Leads"
                                value="+15"
                                trend="+20%"
                            />
                            <KPIItem
                                label="Tasa de Cierre"
                                value="35%"
                                trend="+5%"
                            />
                            <KPIItem
                                label="Horas Liberadas"
                                value="3.5h"
                                trend="On Track"
                                color="text-emerald-400"
                            />
                        </div>
                    </div>

                    <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 hover:-translate-y-1 active:scale-95 group">
                        <Download className="w-4 h-4 group-hover:animate-bounce" />
                        Guardar Directiva
                    </button>

                    <button className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-navy-900 font-bold py-3 rounded-2xl border border-slate-200 transition-all">
                        <Share2 className="w-4 h-4" />
                        Compartir
                    </button>
                </div>
            </div>
        </div>
    );
}

function TaskItem({ text }: { text: string }) {
    const [checked, setChecked] = useState(false); // Mock state for visual

    return (
        <div className="group flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer">
            <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-blue-500 flex items-center justify-center transition-colors">
                {/* interactions would go here */}
            </div>
            <span className="text-slate-700 font-medium group-hover:text-navy-900">
                {text}
            </span>
        </div>
    );
}

function WeekItem({ day, task }: { day: string; task: string }) {
    return (
        <div className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
            <span className="w-20 text-xs font-bold text-slate-400 uppercase">
                {day}
            </span>
            <span className="text-navy-800 font-medium">{task}</span>
        </div>
    );
}

interface KPIItemProps {
    label: string;
    value: string;
    trend: string;
    color?: string;
}

function KPIItem({
    label,
    value,
    trend,
    color = "text-blue-400",
}: KPIItemProps) {
    return (
        <div>
            <div className="flex justify-between items-end mb-1">
                <span className="text-3xl font-display font-bold">{value}</span>
                <span
                    className={clsx(
                        "text-xs font-bold bg-white/10 px-2 py-1 rounded",
                        color,
                    )}
                >
                    {trend}
                </span>
            </div>
            <p className="text-xs font-medium text-slate-400">{label}</p>
        </div>
    );
}
