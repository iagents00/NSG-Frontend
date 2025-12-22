"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Target, 
  MessageCircle, 
  ArrowRight, 
  CheckCircle, 
  Circle, 
  Lock,
  Zap,
  RefreshCw,
  Bell,
  Trophy
} from "lucide-react";
import clsx from "clsx";
import { useToast } from "@/components/ui/ToastProvider";
import JarvisAssistant from "@/components/features/JarvisAssistant";
import confetti from "canvas-confetti";

// --- AUDIO ENGINE: HIGH DOPAMINE ---
// We use a singleton pattern for the context but handle state carefully
let _audioCtx: AudioContext | null = null;

const getAudioContext = () => {
    if (!_audioCtx) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
            _audioCtx = new AudioContext();
        }
    }
    return _audioCtx;
};

const playSound = (type: 'check' | 'success') => {
  const ctx = getAudioContext();
  if (!ctx) return;

  // CRITICAL: Always resume context on user action
  if (ctx.state === 'suspended') {
      ctx.resume().catch(e => console.error("Audio resume failed", e));
  }

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  
  // Master volume to prevent clipping
  masterGain.gain.setValueAtTime(0.5, now);

  if (type === 'check') {
      // "CRYSTAL POP" - A high, clean, satisfying sound
      // 1. Main Tone (Bell-like)
      const osc1 = ctx.createOscillator();
      const env1 = ctx.createGain();
      osc1.connect(env1);
      env1.connect(masterGain);
      
      osc1.type = 'sine';
      // Pitch jump: A standard UI "positive" interval (Perfect 5th jump feels successful)
      osc1.frequency.setValueAtTime(880, now); // A5
      osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.05); // A6 (Quick jump)
      
      env1.gain.setValueAtTime(0, now);
      env1.gain.linearRampToValueAtTime(0.6, now + 0.01); // Instant attack
      env1.gain.exponentialRampToValueAtTime(0.01, now + 0.3); // Clear decay

      osc1.start(now);
      osc1.stop(now + 0.3);

      // 2. The "Sparkle" (High overtone)
      const osc2 = ctx.createOscillator();
      const env2 = ctx.createGain();
      osc2.connect(env2);
      env2.connect(masterGain);
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(2637, now); // E7 (High harmonizer)
      
      env2.gain.setValueAtTime(0, now);
      env2.gain.linearRampToValueAtTime(0.1, now + 0.02);
      env2.gain.exponentialRampToValueAtTime(0.01, now + 0.15); // Short sparkle

      osc2.start(now);
      osc2.stop(now + 0.15);

  } else if (type === 'success') {
      // "GRAND VICTORY" - C Major 9th Chord Arpeggio
      // Notes: C5, E5, G5, B5, D6
      const freqs = [523.25, 659.25, 783.99, 987.77, 1174.66];
      
      freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.connect(oscGain);
          oscGain.connect(masterGain);
          
          osc.type = i % 2 === 0 ? 'sine' : 'triangle'; // Mix waves for warmth
          
          const start = now + (i * 0.06); // Fast arpeggio
          const dur = 0.8;

          osc.frequency.setValueAtTime(freq, start);
          
          oscGain.gain.setValueAtTime(0, start);
          oscGain.gain.linearRampToValueAtTime(0.3 / freqs.length, start + 0.05);
          oscGain.gain.exponentialRampToValueAtTime(0.01, start + dur);

          osc.start(start);
          osc.stop(start + dur);
      });
      
      // Bass Root Note for Impact
      const bass = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bass.connect(bassGain);
      bassGain.connect(masterGain);
      bass.type = 'sine';
      bass.frequency.setValueAtTime(261.63, now); // Middle C4
      
      bassGain.gain.setValueAtTime(0, now);
      bassGain.gain.linearRampToValueAtTime(0.3, now + 0.1); // Swell
      bassGain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
      
      bass.start(now);
      bass.stop(now + 1.2);
  }
};


// --- SUB-COMPONENT: Progress Bar ---
function CompletionProgress({ progress }: { progress: number }) {
  return (
    <div className="w-full mb-8 animate-fade-in group">
      <div className="flex justify-between items-end mb-2">
        <label className="text-sm font-bold text-navy-900 group-hover:text-blue-600 transition-colors">Progreso Diario</label>
        <span className={clsx(
          "text-xs font-bold px-3 py-1 rounded-full transition-all duration-500",
          progress === 100 ? "bg-emerald-100 text-emerald-600 scale-110" : "bg-blue-50 text-blue-600"
        )}>
          {Math.round(progress)}%
        </span>
      </div>
      <div className="h-5 bg-slate-100/80 rounded-full overflow-hidden shadow-inner relative border border-slate-200/50 backdrop-blur-sm">
        <div 
          className={clsx(
            "h-full transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] relative",
            progress === 100 ? "bg-gradient-to-r from-emerald-400 to-emerald-500" : "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
          )}
          style={{ width: `${progress}%` }}
        >
          {/* Shimmer Effect */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
          
          {/* Particles/Sparkles Hint (CSS only) */}
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-[2px]"></div>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: Timeline Item ---
interface TimelineItemProps {
  id: string;
  time: string;
  title: string;
  status: string;
  color: "emerald" | "blue" | "slate" | "violet";
  desc: string;
  locked?: boolean;
  isChecked: boolean;
  onToggle: (id: string) => void;
}

function TimelineItem({ id, time, title, status, color, desc, locked, isChecked, onToggle }: TimelineItemProps) {
  
  const handleToggle = () => {
    if (locked) return;
    onToggle(id);
  };

  // FULLY DEFINED STYLES to avoid dynamic string interpolation issues with Tailwind
  const colorStyles = {
    emerald: { 
        active: {
            bg: "bg-emerald-50", 
            border: "border-emerald-500", 
            text: "text-emerald-700",
            icon: "text-emerald-500",
            ring: "ring-emerald-500/20",
            dot: "bg-emerald-500",
            bar: "bg-emerald-500",
        },
        inactive: {
            border: "border-emerald-200",
            hoverBorder: "hover:border-emerald-300",
            dotBorder: "border-emerald-200",
            dotHover: "group-hover:border-emerald-400"
        }
    },
    blue: { 
        active: {
            bg: "bg-blue-50", 
            border: "border-blue-500", 
            text: "text-blue-700",
            icon: "text-blue-500",
            ring: "ring-blue-500/20",
            dot: "bg-blue-500",
            bar: "bg-blue-500",
        },
        inactive: {
            border: "border-blue-200",
            hoverBorder: "hover:border-blue-300",
            dotBorder: "border-blue-200",
            dotHover: "group-hover:border-blue-400"
        }
    },
    slate: { 
        active: {
            bg: "bg-slate-50", 
            border: "border-slate-500", 
            text: "text-slate-700",
            icon: "text-slate-500",
            ring: "ring-slate-500/20",
            dot: "bg-slate-500",
            bar: "bg-slate-500",
        },
        inactive: {
            border: "border-slate-200",
            hoverBorder: "hover:border-slate-300",
            dotBorder: "border-slate-200",
            dotHover: "group-hover:border-slate-400"
        }
    },
    violet: { 
        active: {
            bg: "bg-violet-50", 
            border: "border-violet-500", 
            text: "text-violet-700",
            icon: "text-violet-500",
            ring: "ring-violet-500/20",
            dot: "bg-violet-500",
            bar: "bg-violet-500",
        },
        inactive: {
            border: "border-violet-200",
            hoverBorder: "hover:border-violet-300",
            dotBorder: "border-violet-200",
            dotHover: "group-hover:border-violet-400"
        }
    },
  };

  const style = colorStyles[color];

  return (
    <div 
      onClick={handleToggle}
      className={clsx(
        "flex gap-6 relative group cursor-pointer transition-all duration-300 select-none",
        locked ? "opacity-50 pointer-events-none grayscale" : "opacity-100 hover:scale-[1.01]"
      )}
    >
      {/* Timeline Line & Dot */}
      <div className="flex flex-col items-center">
        <span className="text-xs font-bold text-slate-400 mb-2 font-mono">{time}</span>
        <div className={clsx(
          "w-4 h-4 rounded-full border-4 z-10 shadow-sm transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          isChecked ? `${style.active.dot} border-white scale-125 shadow-md` : `bg-white ${style.inactive.dotBorder} ${style.inactive.dotHover}`
        )} />
        {/* Animated Line */}
        <div className="w-0.5 h-full bg-slate-100 -mt-2 relative overflow-hidden">
             {isChecked && <div className={clsx("absolute top-0 left-0 w-full h-full animate-grow-down origin-top transition-colors duration-700", style.active.bar)}></div>}
        </div>
      </div>

      {/* Card Content */}
      <div className={clsx(
        "flex-1 p-6 rounded-3xl border shadow-sm relative overflow-hidden transition-all duration-700 ease-out",
        isChecked 
            ? `${style.active.bg} ${style.active.border} ring-4 ${style.active.ring} shadow-md` 
            : `bg-white ${style.inactive.border} ${style.inactive.hoverBorder} hover:shadow-md`
      )}>
        {/* Background Flash Effect when checking */}
        {isChecked && (
            <div className={clsx(
                "absolute inset-0 bg-white opacity-0 animate-[flash_0.6s_ease-out_forwards]"
            )}></div>
        )}
        
        {/* Decorative Side Bar */}
        <div className={clsx(
            "absolute top-0 left-0 w-1.5 h-full transition-all duration-700", 
            isChecked ? style.active.bar : "bg-transparent"
        )}></div>
        
        <div className="flex justify-between items-start mb-2 relative z-10">
          <h4 className={clsx(
              "font-bold text-lg transition-all duration-700",
              isChecked ? style.active.text : "text-navy-900"
            )}>
              {title}
          </h4>
          
          <div className="transform transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110">
            {locked ? (
                <Lock className="w-4 h-4 text-slate-400" />
            ) : isChecked ? (
                <div className="relative">
                    <CheckCircle className={clsx("w-6 h-6 transition-all duration-500 rotate-0", style.active.icon)} />
                    <div className={clsx("absolute inset-0 rounded-full animate-ping opacity-20", style.active.dot)}></div>
                </div>
            ) : (
                <Circle className={clsx("w-6 h-6 text-slate-300 transition-colors duration-300 group-hover:text-blue-400")} />
            )}
          </div>
        </div>
        
        <div className="relative z-10">
            <p className={clsx(
                "text-sm leading-relaxed transition-colors duration-500", 
                isChecked ? "text-slate-500" : "text-slate-600"
            )}>
                {desc}
            </p>
        </div>
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
                <h5 className="font-bold text-navy-900 text-sm leading-tight group-hover:text-blue-700 transition-colors">{title}</h5>
                <p className="text-xs text-slate-500 mt-1">{date}</p>
            </div>
        </div>
    );
}

// --- MAIN COMPONENT ---
export default function NSGClarity() {
  const { showToast } = useToast();
  
  // Tasks State
  const [tasks, setTasks] = useState([
    {
      id: "1",
      time: "08:00 AM",
      title: "Morning Clarity",
      status: "Completado",
      color: "emerald" as const,
      desc: "Definición de intención estratégica.",
      locked: false,
      isChecked: true
    },
    {
      id: "2",
      time: "01:00 PM",
      title: "Power Check",
      status: "Pendiente",
      color: "blue" as const,
      desc: "Recalibración de medio día.",
      locked: false,
      isChecked: false
    },
    {
      id: "3",
      time: "08:00 PM",
      title: "Next Day Planning",
      status: "Bloqueado",
      color: "violet" as const, // UPDATED: More attractive 'violet'
      desc: "Diseño del éxito para mañana.",
      locked: false, 
      isChecked: false
    }
  ]);

  const [hasCelebrated, setHasCelebrated] = useState(false);

  // Calculate Progress
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.isChecked).length;
  const progress = (completedTasks / totalTasks) * 100;

  // Handle Celebration w/ Confetti & Sound
  const prevProgressRef = useRef(progress);

  useEffect(() => {
    // Attempt to initialize audio on first user interaction or mount if possible
    getAudioContext(); 
    
    // Only trigger if we JUST reached 100% (rising edge)
    if (progress === 100 && prevProgressRef.current < 100) {
      setTimeout(() => {
          playSound('success');
          
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'],
            disableForReducedMotion: true,
            zIndex: 9999,
          });

          setTimeout(() => {
             confetti({
                particleCount: 100,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#10b981', '#3b82f6']
             });
             confetti({
                particleCount: 100,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#10b981', '#3b82f6']
             });
          }, 400);

          showToast("¡Excelente! Has completado todos los objetivos.", "success");
      }, 300);
    }
    
    prevProgressRef.current = progress;
  }, [progress, showToast]);

  const handleTaskToggle = (id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const newState = !task.isChecked;
        // Dopamine sound effect
        if (newState) {
          playSound('check');
        }
        return { ...task, isChecked: newState };
      }
      return task;
    }));
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col animate-fade-in-up pb-10">
        <style jsx>{`
            @keyframes flash {
                0% { opacity: 0.5; }
                100% { opacity: 0; }
            }
        `}</style>
      
      {/* 0. JARVIS ASSISTANT */}
      <JarvisAssistant />

      {/* 1. Header Section */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-navy-950 rounded-2xl flex items-center justify-center shadow-lg transform transition hover:scale-105 hover:shadow-blue-900/20">
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
          <div className="bg-navy-950 rounded-2xl p-5 text-white shadow-2xl flex items-center gap-6 min-w-[280px] relative overflow-hidden group hover:scale-[1.02] transition cursor-pointer">
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
            <div className="relative z-10 w-12 h-12 rounded-full border-2 border-blue-500/30 flex items-center justify-center shrink-0 group-hover:border-blue-400 transition-colors">
              <div className="w-12 h-12 border-2 border-t-blue-400 border-transparent rounded-full animate-spin-slow absolute inset-0"></div>
              <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_15px_white]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Timeline (Span 7) */}
        <div className="lg:col-span-7">
          
          {/* Progress Bar Container */}
          <div className="mb-6 p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
             {/* Decorative Background */}
             <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50/50 rounded-full blur-3xl -mr-16 -mt-16 opacity-70"></div>
             
             <CompletionProgress progress={progress} />
             
             {progress === 100 && (
               <div className="flex items-center gap-3 text-emerald-600 text-sm font-bold animate-fade-in bg-emerald-50 w-full p-3 rounded-xl border border-emerald-100">
                 <div className="p-1.5 bg-white rounded-lg shadow-sm">
                    <Trophy className="w-4 h-4 text-emerald-500" />
                 </div>
                 <span>¡Misión Cumplida! Has completado tu ciclo de claridad.</span>
               </div>
             )}
          </div>

          <div className="space-y-6">
            {tasks.map((task) => (
              <TimelineItem 
                key={task.id}
                {...task}
                onToggle={handleTaskToggle}
              />
            ))}
          </div>
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
                    className="w-full mt-4 py-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
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