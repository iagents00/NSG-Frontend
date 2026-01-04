"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
  Trophy,
  Calendar,
  LogOut
} from "lucide-react";
import clsx from "clsx";
import { useToast } from "@/components/ui/ToastProvider";
import confetti from "canvas-confetti";
import { useAppStore } from "@/store/useAppStore";
import { authService } from "@/lib/auth";
import api from "@/lib/api";

// --- AUDIO ENGINE ---
let _audioCtx: AudioContext | null = null;
const getAudioContext = () => {
  if (!_audioCtx) {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) _audioCtx = new AudioContext();
  }
  return _audioCtx;
};

const playSound = (type: 'check' | 'success') => {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();
  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  masterGain.gain.setValueAtTime(0.5, now);

  if (type === 'check') {
    const osc1 = ctx.createOscillator();
    const env1 = ctx.createGain();
    osc1.connect(env1); env1.connect(masterGain);
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.05);
    env1.gain.setValueAtTime(0, now);
    env1.gain.linearRampToValueAtTime(0.6, now + 0.01);
    env1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc1.start(now); osc1.stop(now + 0.3);
  } else {
    const freqs = [523.25, 659.25, 783.99, 987.77, 1174.66];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.connect(oscGain); oscGain.connect(masterGain);
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      const start = now + (i * 0.06);
      osc.frequency.setValueAtTime(freq, start);
      oscGain.gain.setValueAtTime(0, start);
      oscGain.gain.linearRampToValueAtTime(0.3 / freqs.length, start + 0.05);
      oscGain.gain.exponentialRampToValueAtTime(0.01, start + 0.8);
      osc.start(start); osc.stop(start + 0.8);
    });
  }
};

// --- SUB-COMPONENTS ---
function CompletionProgress({ progress }: { progress: number; }) {
  return (
    <div className="w-full mb-4 animate-fade-in group">
      <div className="flex justify-between items-end mb-2">
        <label className="text-sm font-bold text-navy-900 group-hover:text-blue-600 transition-colors">Progreso Diario</label>
        <span className={clsx(
          "text-xs font-bold px-3 py-1 rounded-full transition-all duration-500",
          progress === 100 ? "bg-emerald-100 text-emerald-600 scale-110" : "bg-blue-50 text-blue-600"
        )}>
          {Math.round(progress)}%
        </span>
      </div>
      <div className="h-4 bg-slate-100/80 rounded-full overflow-hidden shadow-inner relative border border-slate-200/50 backdrop-blur-sm">
        <div
          className={clsx(
            "h-full transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] relative",
            progress === 100 ? "bg-emerald-500" : "bg-blue-600"
          )}
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ id, time, title, status, color, desc, locked, isChecked, onToggle }: any) {
  const styles: any = {
    emerald: { active: { bg: "bg-emerald-50/50", border: "border-emerald-500/30", text: "text-emerald-900", accent: "text-emerald-600", dot: "bg-emerald-500", iconBg: "bg-emerald-500/10", bar: "bg-emerald-500" }, inactive: { border: "border-slate-200", dotBorder: "border-slate-200" } },
    blue: { active: { bg: "bg-blue-50/50", border: "border-blue-500/30", text: "text-blue-900", accent: "text-blue-600", dot: "bg-blue-500", iconBg: "bg-blue-500/10", bar: "bg-blue-500" }, inactive: { border: "border-slate-200", dotBorder: "border-slate-200" } },
    violet: { active: { bg: "bg-violet-50/50", border: "border-violet-500/30", text: "text-violet-900", accent: "text-violet-600", dot: "bg-violet-500", iconBg: "bg-violet-500/10", bar: "bg-violet-500" }, inactive: { border: "border-slate-200", dotBorder: "border-slate-200" } }
  };
  const style = styles[color] || styles.blue;

  return (
    <div onClick={() => !locked && onToggle(id)} className={clsx("flex gap-6 relative group cursor-pointer transition-all duration-500 select-none", locked && "opacity-40 pointer-events-none")}>
      <div className="flex flex-col items-center shrink-0 w-12">
        <span className="text-[10px] font-bold text-slate-400 mb-2 tracking-tighter uppercase font-mono">{time}</span>
        <div className={clsx("w-4 h-4 rounded-full border-2 z-10 transition-all duration-700 flex items-center justify-center", isChecked ? `${style.active.dot} border-white scale-110 shadow-lg` : `bg-white ${style.inactive.dotBorder} group-hover:scale-110`)}>
          {isChecked && <CheckCircle className="w-2.5 h-2.5 text-white" />}
        </div>
        <div className="w-0.5 h-full bg-slate-100/60 -mt-2 relative overflow-hidden rounded-full">
          {isChecked && <div className={clsx("absolute top-0 left-0 w-full h-full animate-grow-down origin-top", style.active.bar)}></div>}
        </div>
      </div>
      <div className={clsx("flex-1 p-5 rounded-[2rem] border transition-all duration-500 ease-out relative overflow-hidden", isChecked ? `${style.active.bg} ${style.active.border} shadow-xl shadow-slate-200/50 translate-x-1` : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xl hover:shadow-slate-200/40")}>
        {isChecked && <div className={clsx("absolute -right-20 -top-20 w-40 h-40 rounded-full blur-[60px] opacity-20", style.active.dot)}></div>}
        <div className="flex justify-between items-start mb-3 relative z-10">
          <div className="space-y-0.5">
            <h4 className={clsx("font-display font-bold text-lg lg:text-xl tracking-tight transition-all duration-700", isChecked ? style.active.text : "text-navy-950")}>{title}</h4>
            <div className={clsx("text-[9px] font-bold uppercase tracking-[0.2em]", isChecked ? style.active.accent : "text-slate-400")}>{isChecked ? "Módulo Completado" : "Protocolo Pendiente"}</div>
          </div>
          <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500", isChecked ? `${style.active.iconBg} rotate-0` : "bg-slate-50 rotate-6")}>
            {locked ? <Lock className="w-4 h-4 text-slate-300" /> : isChecked ? <CheckCircle className={clsx("w-5 h-5", style.active.accent)} /> : <Circle className="w-5 h-5 text-slate-200 group-hover:text-slate-400 transition-colors" />}
          </div>
        </div>
        <p className={clsx("text-sm leading-relaxed transition-all duration-500 relative z-10", isChecked ? "text-slate-600/80 font-medium" : "text-slate-500 font-medium")}>{desc}</p>
        {!isChecked && <div className="mt-4 flex items-center gap-2 text-blue-600 text-[9px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-1 group-hover:translate-y-0">Activar protocolo <ArrowRight className="w-2.5 h-2.5" /></div>}
      </div>
    </div>
  );
}

function StrategyCard({ strategy }: { strategy: any; }) {
  return (
    <div className="bg-white p-7 rounded-4xl border border-slate-200 shadow-xl shadow-slate-200/50 transition-all duration-500 group overflow-hidden relative flex flex-col h-full">

      {/* Meta Title (Styled like Morning Clarity) */}
      <div className="mb-7 relative z-10 pt-2 pr-20">
        <h4 className="font-display font-bold text-lg lg:text-xl tracking-tight text-gray-700 mb-1 leading-tight transition-all duration-500">
          {strategy.meta_detectada}
        </h4>
        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Objetivo Estratégico Detectado</div>
      </div>

      {/* Actions Grid */}
      <div className="space-y-4 relative z-10 flex-1">
        {[strategy.accion_1, strategy.accion_2, strategy.accion_3].map((action, i) => (
          action && (
            <div key={i} className="flex gap-4 items-start p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-white hover:scale-[1.01] hover:shadow-lg hover:shadow-blue-900/5 transition-all duration-300 cursor-pointer">
              <div className="shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <span className="text-sm font-bold text-white leading-none">{i + 1}</span>
              </div>
              <p className="text-[15px] font-medium text-slate-500 leading-relaxed">{action}</p>
            </div>
          )
        ))}
      </div>

      {/* Footer IA details */}
      <div className="mt-8 pt-5 border-t border-slate-100 flex justify-between items-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
        <span>Protocolo IA v4.0</span>
        <div className="flex gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
        </div>
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function NSGClarity() {
  const { showToast } = useToast();
  const { userId } = useAppStore();
  const [isConnected, setIsConnected] = useState(false);
  const [telegramId, setTelegramId] = useState<number | null>(null);
  const [telegramData, setTelegramData] = useState<any>(null);
  const [isLoadingTelegramData, setIsLoadingTelegramData] = useState(false);
  const [strategies, setStrategies] = useState<any[]>([]);
  const [isLoadingStrategies, setIsLoadingStrategies] = useState(false);

  const fetchStrategies = async () => {
    setIsLoadingStrategies(true);
    try {
      const response = await api.get(`/strategies/get`);
      if (response.status === 200) {
        setStrategies(response.data);
      }
    } catch (e) {
      console.error("Error fetching strategies:", e);
    } finally {
      setIsLoadingStrategies(false);
    }
  };

  const syncObjectives = async (isManual = false) => {
    if (!telegramId) return;
    setIsLoadingTelegramData(true);
    try {
      const response = await api.get(`/telegram/user/${telegramId}`);
      if (response.status === 200) {
        setTelegramData(response.data);
        if (isManual) showToast("Objetivos sincronizados", "success");
      }
    } catch (e) { } finally { setIsLoadingTelegramData(false); }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authService.verifySession();
        if (data?.user) {
          if (data.user.telegram_id) setTelegramId(data.user.telegram_id);
          if (data.user.id) {
            useAppStore.getState().setUserId(data.user.id);
          }
          fetchStrategies();
        }
      } catch (e) { }
    };
    fetchUser();
    window.addEventListener('focus', fetchUser);
    return () => window.removeEventListener('focus', fetchUser);
  }, []);

  useEffect(() => {
    if (telegramId) syncObjectives();
    // No llamamos a fetchStrategies aquí porque ya se llama en el useEffect de fetchUser
    // o al montar el componente si ya hay una sesión.
  }, [telegramId]);

  useEffect(() => {
    const checkGoogle = async () => {
      try {
        const res = await api.get('/google/calendar/events');
        if (res.status === 200) setIsConnected(true);
      } catch (e) { }
    };
    checkGoogle();
  }, []);

  const handleConnect = async (p: string) => {
    if (p === "Telegram") {
      if (telegramId) return;
      showToast("Abriendo Telegram...", "info");
      setTimeout(() => window.open(`https://t.me/nsg_preguntasyrespuestas_bot?start=${userId}`, "_blank"), 800);
      return;
    }
    if (isConnected) {
      try {
        const res = await api.delete('/google/calendar');
        if (res.status === 200) { setIsConnected(false); showToast('Google Calendar desconectado', 'info'); }
      } catch (e) { showToast('Error', 'error'); }
    } else {
      try {
        const res = await api.get('/google/auth');
        if (res.data?.url) window.open(res.data.url, '_blank');
      } catch (e) { showToast('Error', 'error'); }
    }
  };

  const [tasks, setTasks] = useState([
    { id: "1", time: "08:00 AM", title: "Morning Clarity", status: "Completado", color: "emerald", desc: "Establecimiento de la intención estratégica. Sincronización con la Hoja de Alineación y blindaje de prioridades para una ejecución de alto impacto.", locked: false, isChecked: true },
    { id: "2", time: "01:00 PM", title: "Power Check", status: "Pendiente", color: "blue", desc: "Sincronización táctica y control de flujo. Evaluación de hitos alcanzados y recalibración de energía para asegurar un cierre de jornada resolutivo.", locked: false, isChecked: false },
    { id: "3", time: "08:00 PM", title: "Next Day Planning", status: "Bloqueado", color: "violet", desc: "Arquitectura del éxito anticipado. Auditoría de resultados daily, optimización de la Hoja de Alineación y diseño proactivo de la jornada de mañana.", locked: false, isChecked: false }
  ]);

  const progress = (tasks.filter(t => t.isChecked).length / tasks.length) * 100;
  const prevProgressRef = useRef(progress);

  useEffect(() => {
    if (progress === 100 && prevProgressRef.current < 100) {
      setTimeout(() => {
        playSound('success');
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
        showToast("¡Excelente! Has completado todos los objetivos.", "success");
      }, 300);
    }
    prevProgressRef.current = progress;
  }, [progress, showToast]);

  const handleTaskToggle = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        if (!t.isChecked) playSound('check');
        return { ...t, isChecked: !t.isChecked };
      }
      return t;
    }));
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col animate-fade-in-up pb-24">
      {/* 1. HERO BANNER */}
      <div 
        onClick={() => syncObjectives(true)}
        className="w-full relative group cursor-pointer mb-6 shrink-0"
        title="Clic para sincronizar objetivos"
      >
        <div className="relative w-full h-[180px] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 transition-all duration-700 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
          <div className="absolute inset-0 bg-linear-to-br from-navy-950 via-navy-900 to-blue-950"></div>
          <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"></div>
          <div className="absolute inset-0 bg-linear-to-t from-navy-950 via-transparent to-transparent"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] group-hover:bg-blue-500/30 transition-all duration-700"></div>
          <div className="absolute inset-0 flex flex-col justify-center p-8 sm:px-12">
            <div className="overflow-hidden mb-3">
              <span className="inline-block px-3 py-1 bg-blue-500/20 backdrop-blur-xl border border-blue-400/30 text-blue-200 text-[0.6rem] font-bold uppercase tracking-[0.25em] rounded-lg">Protocolo de Alineación • Sistema Activo</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-medium text-white mb-4 leading-tight tracking-tight">Diseño de <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-emerald-400 font-bold">Claridad Estratégica.</span></h2>
            <p className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed font-medium max-w-2xl translate-y-1">Sincronización neuronal activa diseñada para la precisión máxima y el alto rendimiento continuo. Protocolo de alineación estratégica ejecutándose.</p>
          </div>
        </div>
      </div>

      {/* 2. INTEGRATION BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/60 shadow-sm transition-all hover:bg-white/60">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
          <Zap className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sincronización de Ecosistema</span>
        </div>
        
        {/* Integration Hub */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full md:w-auto">
          {/* Telegram Button */}
          <button
            onClick={() => handleConnect("Telegram")}
            disabled={telegramId !== null}
            className={clsx(
              "w-full sm:w-auto group relative flex items-center gap-3 px-4 sm:px-5 py-2 sm:py-2.5 border rounded-2xl sm:rounded-[2rem] transition-all duration-500",
              telegramId
                ? "bg-emerald-50/60 border-emerald-200 shadow-sm cursor-default"
                : "bg-white border-slate-200 hover:shadow-md hover:border-blue-300 cursor-pointer shadow-sm"
            )}
          >
            <div className={clsx(
              "w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 relative overflow-hidden shrink-0",
              telegramId
                ? "bg-white text-emerald-500 shadow-sm ring-1 ring-emerald-100"
                : "bg-[#0088cc]/5 text-[#0088cc] group-hover:bg-[#0088cc] group-hover:text-white"
            )}>
              {telegramId && <div className="absolute inset-0 bg-emerald-100/50 animate-pulse"></div>}
              <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 fill-current relative z-10" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.944 0C5.352 0 0 5.352 0 11.944c0 6.592 5.352 11.944 11.944 11.944c6.592 0 11.944-5.352 11.944-11.944C23.888 5.352 18.536 0 11.944 0zm5.66 8.16l-1.928 9.096c-.144.644-.528.804-1.068.5l-2.936-2.164l-1.416 1.364c-.156.156-.288.288-.588.288l.212-3.04l5.524-4.992c.24-.212-.052-.332-.372-.12l-6.828 4.3l-2.948-.92c-.64-.2-.652-.64.132-.948l11.524-4.44c.532-.2.996.12.804.976z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 leading-none mb-1">Telegram</p>
              <p className="text-xs font-bold leading-none">{telegramId ? (telegramData?.username ? `@${telegramData.username}` : "Conectado") : "Vincular"}</p>
            </div>
          </button>
          
          {/* Calendar Button */}
          <button onClick={() => handleConnect("Calendar")} className={clsx("w-full sm:w-auto flex items-center gap-3 px-4 py-2 rounded-xl border transition-all duration-300 shadow-sm active:scale-95", isConnected ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-slate-50")}>
            <div className="w-6 h-6 bg-white border border-slate-100 rounded-lg flex items-center justify-center p-1 relative overflow-hidden">
              <svg viewBox="0 0 24 24" className="w-full h-full"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
              {isConnected && <div className="absolute inset-0 bg-blue-500/5 animate-pulse"></div>}
            </div>
            <div className="text-left">
              <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 leading-none mb-1">Calendar</p>
              <p className="text-xs font-bold leading-none">{isConnected ? "Sincronizado" : "Vincular"}</p>
            </div>
          </button>
          
          <button onClick={() => syncObjectives(true)} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-blue-600 hover:bg-white hover:border-blue-200 transition-all shadow-sm active:scale-95">
            <RefreshCw className={clsx("w-4 h-4", isLoadingTelegramData && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* 3. MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <div className="mb-6 p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50/50 rounded-full blur-3xl -mr-16 -mt-16 opacity-70"></div>
            <CompletionProgress progress={progress} />
            {progress === 100 && (
              <div className="flex items-center gap-3 text-emerald-600 text-sm font-bold animate-fade-in bg-emerald-50 w-full p-3 rounded-xl border border-emerald-100 mt-4">
                <div className="p-1.5 bg-white rounded-lg shadow-sm"><Trophy className="w-4 h-4 text-emerald-500" /></div>
                <span>¡Misión Cumplida! Has completado tu ciclo de claridad.</span>
              </div>
            )}
          </div>
          <div className="space-y-6">
            {tasks.map((t) => <TimelineItem key={t.id} {...t} onToggle={handleTaskToggle} />)}
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col">
          <div className="flex flex-col gap-6 flex-1">
            <div className="flex items-center justify-between px-2">
              <h4 className="font-bold text-navy-950 text-xl flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-600/20">
                  <Target className="w-5 h-5" />
                </div>
                Protocolo de Acción
                <button
                  onClick={() => fetchStrategies()}
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition active:scale-95 disabled:opacity-50 ml-2"
                  disabled={isLoadingStrategies}
                >
                  <RefreshCw className={clsx("w-3.5 h-3.5 text-slate-400", isLoadingStrategies && "animate-spin")} />
                </button>
              </h4>
            </div>

            <div className="flex-1 flex flex-col space-y-6 pr-2 custom-scroll pb-10 min-h-0">
              {strategies.length > 0 ? (
                strategies.map((strategy) => (
                  <StrategyCard key={strategy._id} strategy={strategy} />
                ))
              ) : (
                <div className="bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-300 p-12 text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Target className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-400 font-medium italic">No se han detectado estrategias aún.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
