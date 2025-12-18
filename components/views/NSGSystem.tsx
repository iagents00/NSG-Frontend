"use client";

import React from 'react';
import { useAppStore } from "@/store/useAppStore";
import { useUIStore } from "@/store/useUIStore";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  Mic, 
  Search, 
  ArrowRight,
  Newspaper,
  Activity,
  Telescope,
  LayoutGrid
} from "lucide-react";
import { RoleType } from "@/data/context";
import BrandAtom from "@/components/ui/BrandAtom";

export default function NSGSystem() {
  const { currentRole } = useAppStore();
  const { toggleAI } = useUIStore();
  const router = useRouter();

  // Handler for AI Buttons
  const handleAITrigger = (mode: string) => {
    toggleAI(); 
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-7xl mx-auto px-4 animate-fade-in-up">
      
      {/* 1. Header Section */}
      <div className="text-center mb-12 mt-10">
        <h1 className="text-5xl md:text-6xl font-medium tracking-tight text-slate-800 mb-4 font-display">
          NSG Intelligence
        </h1>
        <p className="text-xl text-slate-500 font-light">
          Más inteligencia en cada decisión
        </p>
      </div>

      {/* 2. Search / Input Section */}
      <div className="w-full max-w-3xl mb-24 relative group z-20">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
        <div className="relative bg-white rounded-full shadow-lg border border-slate-100 flex items-center p-2 pl-6 h-16 transition-all hover:shadow-xl">
            <input 
              type="text" 
              placeholder="Describe tu idea..." 
              className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400 text-lg font-medium"
              onClick={() => toggleAI()}
            />
            
            <div className="flex items-center gap-2 pr-2">
                <button 
                  onClick={() => handleAITrigger('standard')}
                  className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors cursor-pointer"
                  aria-label="Usar micrófono"
                >
                    <Mic className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleAITrigger('research')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-full font-medium shadow-md hover:shadow-lg hover:brightness-105 transition-all flex items-center gap-2 cursor-pointer"
                >
                    <BrandAtom className="w-5 h-5 grayscale brightness-200" />
                    <span className="hidden sm:inline">Generar</span>
                </button>
            </div>
        </div>
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