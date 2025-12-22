"use client";
import { Zap } from "lucide-react";
import { NewsCard } from "@/components/ui/NewsCard";
import { useChatStore } from "@/store/useChatStore";

export default function NSGNews() {
  const runNewsAnalysis = useChatStore((state) => state.runNewsAnalysis);

  const handleAnalyze = (title: string, tag: string) => {
    runNewsAnalysis(title, tag);
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4 shrink-0">
        <div>
          <h3 className="font-display font-bold text-3xl lg:text-4xl text-navy-900">NSG Hyper-News</h3>
          <p className="text-slate-500 mt-2 text-base lg:text-lg">Inteligencia de mercado curada algorítmicamente para acelerar tus objetivos.</p>
        </div>
        <span className="text-sm font-bold bg-blue-50 text-blue-600 px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-2 w-full sm:w-auto justify-center shadow-sm">
          <Zap className="w-4 h-4" /> Precision Filter Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10 flex-1 overflow-y-auto custom-scroll">
        <NewsCard source="TechCrunch" title="AI en Salud Mental" tag="Tendencia" color="blue" description="Nuevos algoritmos predictivos reducen recaídas un 30%." time="15m" onAnalyze={handleAnalyze} />
        <NewsCard source="Harvard Business" title="Liderazgo Adaptativo" tag="Estrategia" color="purple" description="Cómo los CEOs gestionan la incertidumbre en 2025." time="1h" onAnalyze={handleAnalyze} />
        <NewsCard source="NSG Internal" title="Benchmark Q3" tag="Reporte" color="emerald" description="Tu rendimiento supera al promedio del sector en un 12%." time="2h" onAnalyze={handleAnalyze} />
        <NewsCard source="Global Markets" title="Fusiones Tech" tag="M&A" color="orange" description="Oportunidades emergentes en el sector SaaS LATAM." time="4h" onAnalyze={handleAnalyze} />
        <NewsCard source="BioHack Daily" title="Ritmos Circadianos" tag="Wellness" color="sky" description="Optimización del sueño para alto rendimiento ejecutivo." time="5h" onAnalyze={handleAnalyze} />
      </div>
    </div>
  );
}