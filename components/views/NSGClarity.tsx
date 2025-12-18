"use client";

import { useState } from "react";
import { 
  Target, 
  MessageCircle, 
  ArrowRight, 
  CheckCircle, 
  Circle, 
  Lock,
  Zap,
  RefreshCw,
  Bell
} from "lucide-react";
import clsx from "clsx";
import { useToast } from "@/components/ui/ToastProvider";

// --- SUB-COMPONENT: Timeline Item ---
interface TimelineItemProps {
  time: string;
  title: string;
  status: string;
  color: "emerald" | "blue" | "slate";
  desc: string;
  locked?: boolean;
  defaultActive?: boolean;
}

function TimelineItem({ time, title, status, color, desc, locked, defaultActive }: TimelineItemProps) {
  const [isActive, setIsActive] = useState(defaultActive || false);
  const { showToast } = useToast();

  const handleToggle = () => {
    if (locked) return;
    setIsActive(!isActive);
    showToast(isActive ? "Tarea desmarcada" : "Tarea completada", "success");
  };

  const colorStyles = {
    emerald: { bg: "bg-emerald-500", border: "border-emerald-500", ring: "ring-emerald-500/10", text: "text-emerald-500" },
    blue: { bg: "bg-blue-500", border: "border-blue-500", ring: "ring-blue-500/10", text: "text-blue-500" },
    slate: { bg: "bg-slate-500", border: "border-slate-500", ring: "ring-slate-500/10", text: "text-slate-500" },
  };

  const activeColor = colorStyles[color];

  return (
    <div 
      onClick={handleToggle}
      className={clsx(
        "flex gap-6 relative group cursor-pointer transition-opacity duration-300",
        locked ? "opacity-50 pointer-events-none" : "opacity-100"
      )}
    >
      {/* Timeline Line & Dot */}
      <div className="flex flex-col items-center">
        <span className="text-xs font-bold text-slate-400 mb-2">{time}</span>
        <div className={clsx(
          "w-4 h-4 rounded-full border-4 z-10 shadow-sm transition-all duration-300 group-hover:scale-110",
          isActive ? `${activeColor.bg} border-white` : `bg-white border-${color}-200`
        )} />
        <div className="w-0.5 h-full bg-slate-100 -mt-2"></div>
      </div>

      {/* Card Content */}
      <div className={clsx(
        "flex-1 bg-white p-6 rounded-3xl border shadow-sm relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md",
        isActive ? `${activeColor.border} ring-4 ${activeColor.ring}` : `border-${color}-200`
      )}>
        {isActive && <div className={clsx("absolute top-0 left-0 w-1.5 h-full", activeColor.bg)}></div>}
        
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-lg text-navy-900">{title}</h4>
          {locked ? (
            <Lock className="w-4 h-4 text-slate-400" />
          ) : isActive ? (
            <CheckCircle className={clsx("w-4 h-4", activeColor.text)} />
          ) : (
            <Circle className={clsx("w-4 h-4", activeColor.text)} />
          )}
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: Update Card ---
function UpdateCard({ title, date, type }: { title: string, date: string, type: string }) {
    return (
        <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-sm transition cursor-pointer group">
            <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-sm text-blue-500 group-hover:text-blue-600 group-hover:scale-110 transition-transform">
                {type === 'alert' ? <Bell className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
            </div>
            <div>
                <h5 className="font-bold text-navy-900 text-sm leading-tight">{title}</h5>
                <p className="text-xs text-slate-500 mt-1">{date}</p>
            </div>
        </div>
    );
}

// --- MAIN COMPONENT ---
export default function NSGClarity() {
  const { showToast } = useToast();

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col animate-fade-in-up pb-10">
      
      {/* 1. Header Section */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-navy-950 rounded-2xl flex items-center justify-center shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-display font-bold text-3xl lg:text-4xl text-navy-900 tracking-tight leading-none">
                NSG Clarity
              </h3>
              <p className="text-[0.65rem] font-bold text-blue-600 uppercase tracking-widest mt-1">
                Strategic Alignment Protocol
              </p>
            </div>
          </div>
          <p className="text-slate-500 max-w-md text-sm lg:text-base leading-relaxed font-medium mt-2">
            Sincronización neuronal activa. Tu ecosistema de productividad circadiana conectado en tiempo real.
          </p>
        </div>

        {/* Next Session Card */}
        <div className="w-full md:w-auto">
          <div className="bg-navy-950 rounded-2xl p-5 text-white shadow-2xl flex items-center gap-6 min-w-[280px] relative overflow-hidden group hover:scale-[1.02] transition">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-50 animate-pulse-slow"></div>
            <div className="relative z-10 text-right flex-1">
              <p className="text-[0.6rem] font-bold text-blue-300 uppercase tracking-widest mb-0.5">
                Próxima Sesión
              </p>
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-3xl font-display font-bold">08:00</span>
                <span className="text-xs font-bold text-blue-400">PM</span>
              </div>
            </div>
            <div className="relative z-10 w-12 h-12 rounded-full border-2 border-blue-500/30 flex items-center justify-center shrink-0">
              <div className="w-12 h-12 border-2 border-t-blue-400 border-transparent rounded-full animate-spin-slow absolute inset-0"></div>
              <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_15px_white]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Timeline (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <TimelineItem 
            time="08:00 AM" 
            title="Morning Clarity" 
            status="Completado" 
            color="emerald" 
            desc="Definición de intención estratégica. Foco en Q3." 
            defaultActive={true}
          />
          <TimelineItem 
            time="01:00 PM" 
            title="Power Check" 
            status="Pendiente" 
            color="blue" 
            desc="Recalibración de medio día (7 min)." 
            defaultActive={false}
          />
          <TimelineItem 
            time="08:00 PM" 
            title="Next Day Planning" 
            status="Bloqueado" 
            color="slate" 
            desc="Diseño del éxito para mañana." 
            locked={true}
          />
        </div>

        {/* Right Column: Sync History & Updates (Span 5) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* NEW SECTION: Clarity Updates */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-navy-900 text-lg flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500 fill-current" /> System Updates
                    </h4>
                    <span className="text-[0.65rem] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded">v2.4 Live</span>
                </div>
                <div className="space-y-3">
                    <UpdateCard title="Nuevo Algoritmo de Priorización" date="Hace 2 horas" type="update" />
                    <UpdateCard title="Alerta: Desviación de Objetivo Q4" date="Ayer, 10:00 AM" type="alert" />
                </div>
                <button 
                    onClick={() => showToast("Buscando actualizaciones...", "info")}
                    className="w-full mt-4 py-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                    <RefreshCw className="w-3 h-3" /> Verificar Sincronización
                </button>
            </div>

            {/* Existing Sync History */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-card flex-1">
                <div className="flex items-center justify-between mb-6">
                    <h4 className="font-bold text-navy-900 text-lg flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                        <MessageCircle className="w-5 h-5" />
                    </div>
                    Sync History
                    </h4>
                    <span className="text-[0.65rem] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">
                    Telegram
                    </span>
                </div>

                <div className="space-y-4 relative">
                    {/* Timeline Line */}
                    <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-100 z-0"></div>
                    
                    {/* History Item 1 */}
                    <div className="relative z-10">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-sm transition group ml-2 hover:translate-x-1 cursor-default">
                        <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <p className="text-xs font-bold text-blue-600">08:05 AM</p>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                        "Objetivo principal: Cerrar el acuerdo con TechCorp antes de las 4pm."
                        </p>
                    </div>
                    </div>

                    {/* History Item 2 */}
                    <div className="relative z-10">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-sm transition group ml-2 hover:translate-x-1 cursor-default">
                        <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                        <p className="text-xs font-bold text-slate-400">Ayer 08:30 PM</p>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed">
                        "Planificación completada. 3 tareas prioritarias asignadas."
                        </p>
                    </div>
                    </div>
                </div>

                <button 
                    onClick={() => showToast("Historial completo no disponible en demo", "info")}
                    className="w-full mt-8 py-3.5 text-xs font-bold text-slate-600 hover:text-white border border-slate-200 hover:border-navy-900 hover:bg-navy-900 rounded-xl transition-all duration-300 shadow-sm flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                    Ver Historial Completo <ArrowRight className="w-3 h-3" />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}