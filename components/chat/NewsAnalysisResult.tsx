"use client";
import { BrainCircuit, Zap, ArrowRight, Play } from "lucide-react";

interface NewsAnalysisResultProps {
  tag?: string;
  roleContext?: string;
}

export default function NewsAnalysisResult({ tag, roleContext }: NewsAnalysisResultProps) {
  return (
    <div className="flex gap-4 animate-fade-in-up justify-start w-full group">
      {/* Icon Avatar */}
      <div className="w-9 h-9 bg-navy-950 rounded-2xl flex items-center justify-center shrink-0 shadow-lg text-white mt-auto mb-1 group-hover:scale-110 transition-transform">
        <BrainCircuit className="w-4 h-4" />
      </div>

      {/* Main Card */}
      <div className="bg-white p-0 rounded-[2rem] rounded-tl-none text-base text-slate-700 max-w-[92%] shadow-sovereign border border-slate-100 overflow-hidden">
        {/* Card Header */}
        <div className="bg-slate-50/80 p-5 border-b border-slate-100 flex justify-between items-center">
          <span className="text-[0.6rem] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded border border-blue-100">
            NSG Intelligence Report
          </span>
          <span className="text-[0.6rem] font-bold text-slate-400 uppercase">
            {tag || "GENERAL"}
          </span>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-6">
          
          {/* Context Section */}
          <div>
            <h4 className="font-display font-bold text-lg text-navy-900 mb-2">Análisis de Contexto</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              He cruzado esta noticia con tu perfil actual. <strong>{roleContext}</strong>. Esta información es crítica para tu objetivo de Q4.
            </p>
          </div>

          {/* Opportunity Highlight */}
          <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
            <h5 className="font-bold text-indigo-900 text-sm flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4" /> Oportunidad Detectada
            </h5>
            <p className="text-sm text-indigo-800 font-medium">
              Puedes apalancar esta tendencia para reducir la fricción operativa un 15% si aplicas la metodología inversa sugerida.
            </p>
          </div>

          {/* Action Protocol */}
          <div>
            <h4 className="font-bold text-navy-900 text-sm mb-3">Protocolo de Acción Inmediata</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                <p className="text-sm text-slate-600">Revisar métricas actuales afectadas por esta regulación/tendencia.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                <p className="text-sm text-slate-600">Agendar sesión de &quot;Deep Dive&quot; con el equipo técnico mañana a las 10 AM.</p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button className="w-full py-3 bg-navy-900 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-2 active:scale-95 cursor-pointer">
            <Play className="w-4 h-4" /> Ejecutar Plan de Acción
          </button>
        </div>
      </div>
    </div>
  );
}