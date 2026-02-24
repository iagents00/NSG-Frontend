"use client";

import { FileText, Zap, Calendar, Download } from "lucide-react";
import React from "react";

export default function ProposalView() {
    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 md:mb-8 px-4 md:px-6">
                 <h2 className="text-xl md:text-2xl font-display font-semibold tracking-tight text-navy-900">Tu Propuesta Estratégica</h2>
                 <button className="flex items-center gap-2 text-sm font-semibold tracking-tight text-navy-900 bg-white border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <Download className="w-4 h-4" /> Exportar PDF
                 </button>
            </div>

            {/* 3-Column Layout */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 md:px-6 pb-8 overflow-y-auto">
                {/* Column 1: Procesos */}
                <ColumnCard 
                    title="Análisis de Procesos" 
                    icon={<FileText className="w-5 h-5 text-purple-500" />}
                    color="bg-purple-500/5 border-purple-100"
                >
                    <div className="space-y-4">
                        <FindingItem title="Cuello de Botella" desc="La revisión manual de leads consume 12h/semana." severity="high" />
                        <FindingItem title="Fuga de Información" desc="No hay centralización de documentos entre equipos." severity="medium" />
                    </div>
                </ColumnCard>

                {/* Column 2: Automatizaciones */}
                 <ColumnCard 
                    title="Automatizaciones (n8n)" 
                    icon={<Zap className="w-5 h-5 text-blue-500" />}
                    color="bg-blue-500/5 border-blue-100"
                >
                    <div className="space-y-3">
                        <AutoItem title="Lead Scoring Bot" tool="OpenAI + n8n" timeSaved="5h/sem" />
                        <AutoItem title="Content Repurposing" tool="Youtube -> Blog" timeSaved="3h/item" />
                        <AutoItem title="Auto-Onboarding" tool="Email Seq" timeSaved="2h/cliente" />
                    </div>
                </ColumnCard>

                {/* Column 3: Roadmap */}
                 <ColumnCard 
                    title="Plan 30/60/90" 
                    icon={<Calendar className="w-5 h-5 text-emerald-500" />}
                    color="bg-emerald-500/5 border-emerald-100"
                >
                    <div className="space-y-6">
                        <RoadmapItem day="30" focus="Estabilizar" task="Implementar CRM y definir SOPs base." />
                        <RoadmapItem day="60" focus="Optimizar" task="Lanzar primeras 2 automatizaciones." />
                        <RoadmapItem day="90" focus="Escalar" task="Contratar VA para gestión de sistema." />
                    </div>
                </ColumnCard>
            </div>
        </div>
    )
}

interface ColumnCardProps {
    title: string;
    icon: React.ReactNode;
    color: string;
    children: React.ReactNode;
}

function ColumnCard({ title, icon, color, children }: ColumnCardProps) {
    return (
        <div className={`rounded-3xl border ${color} p-6 flex flex-col h-full bg-white/50 backdrop-blur-sm`}>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                    {icon}
                </div>
                <h3 className="font-semibold tracking-tight text-navy-900">{title}</h3>
            </div>
            <div className="flex-1">
                {children}
            </div>
        </div>
    )
}

interface FindingItemProps {
    title: string;
    desc: string;
    severity: 'high' | 'medium' | 'low';
}

function FindingItem({ title, desc, severity }: FindingItemProps) {
    return (
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-navy-800 text-sm">{title}</h4>
                <div className={`w-2 h-2 rounded-full ${severity === 'high' ? 'bg-red-500' : 'bg-amber-500'}`} />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
        </div>
    )
}

interface AutoItemProps {
    title: string;
    tool: string;
    timeSaved: string;
}

function AutoItem({ title, tool, timeSaved }: AutoItemProps) {
    return (
        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
            <div>
                <h4 className="font-bold text-navy-800 text-xs">{title}</h4>
                <p className="text-[10px] text-slate-400">{tool}</p>
            </div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{timeSaved}</span>
        </div>
    )
}

interface RoadmapItemProps {
    day: string;
    focus: string;
    task: string;
}

function RoadmapItem({ day, focus, task }: RoadmapItemProps) {
    return (
        <div className="relative pl-4 border-l-2 border-slate-100">
            <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 bg-white border-2 border-emerald-500 rounded-full" />
            <div className="mb-1 flex items-baseline gap-2">
                <span className="text-xl font-display font-semibold tracking-tight text-navy-900">Day {day}</span>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{focus}</span>
            </div>
            <p className="text-xs text-slate-500">{task}</p>
        </div>
    )
}
