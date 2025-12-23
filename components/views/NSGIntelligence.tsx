"use client";

import React from 'react';

import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";
import { 
  ArrowRight,
  Newspaper,
  Activity,
  Telescope,
  LayoutGrid
} from "lucide-react";
import JarvisAssistant from "@/components/features/JarvisAssistant";

export default function NSGIntelligence() {
  const { currentRole } = useAppStore();
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-7xl mx-auto px-4 animate-fade-in-up">
      
      {/* 2. Jarvis Assistant Hero */}
      <div className="w-full max-w-7xl mb-12 relative z-20">
         <JarvisAssistant />
      </div>

      {/* 3. Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        
        {/* NSG News */}
        <ModuleCard 
          title="NSG News"
          description="Monitoreo de noticias y tendencias en tiempo real."
          icon={Newspaper}
          color="text-blue-500"
          delay="delay-0"
          onClick={() => router.push('/dashboard/nsg_news')}
        />

        {/* NSG Clarity */}
        <ModuleCard 
          title="NSG Clarity"
          description="Análisis profundo y visualización de datos."
          icon={Activity}
          color="text-indigo-500"
          delay="delay-75"
          onClick={() => router.push('/dashboard/nsg_clarity')}
        />

        {/* NSG Horizon */}
        <ModuleCard 
          title="NSG Horizon"
          description="Planificación estratégica y proyecciones futuras."
          icon={Telescope}
          color="text-violet-500"
          delay="delay-150"
          onClick={() => router.push('/dashboard/nsg_horizon')}
        />

        {/* Metrics/Other */}
        <ModuleCard 
          title="Métricas"
          description="Visión general de KPIs y rendimiento operativo."
          icon={LayoutGrid}
          color="text-emerald-500"
          delay="delay-200"
          onClick={() => router.push('/dashboard/metrics')}
        />

      </div>
    </div>
  );
}

// Sub-component for Module Cards
interface ModuleCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  delay?: string;
  onClick: () => void;
}

function ModuleCard({ title, description, icon: Icon, color, delay = "", onClick }: ModuleCardProps) {
  return (
    <button 
      onClick={onClick}
      className={`text-left bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-200 p-6 rounded-4xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 group flex flex-col justify-between h-56 cursor-pointer ${delay}`}
    >
      <div>
        <div className={`mb-4 ${color} bg-white p-3 rounded-2xl w-fit shadow-sm group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="font-display font-bold text-xl text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed font-medium">
          {description}
        </p>
      </div>
      
      <div className="flex justify-end opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
      </div>
    </button>
  );
}