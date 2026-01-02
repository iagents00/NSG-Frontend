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
  Trophy,
  Calendar,
  LogOut
} from "lucide-react";
import clsx from "clsx";
import { useToast } from "@/components/ui/ToastProvider";
import confetti from "canvas-confetti";
import { useAppStore } from "@/store/useAppStore";
import { authService } from "@/lib/auth";

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
function CompletionProgress({ progress }: { progress: number; }) {
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
function UpdateCard({ title, date, type }: { title: string, date: string, type: string; }) {
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
  const { userId } = useAppStore();
  const [isConnected, setIsConnected] = useState(false);
  const [telegramId, setTelegramId] = useState<number | null>(null);
  const [telegramData, setTelegramData] = useState<any>(null);
  const [isLoadingTelegramData, setIsLoadingTelegramData] = useState(false);

  // Fetch user data to check telegram connection status
  // Fetch user data to check telegram connection status - w/ Focus Refresh
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authService.verifySession();
        // Backend returns user: { telegram_id: ... }
        if (data?.user?.telegram_id) {
          setTelegramId(data.user.telegram_id);
        }
      } catch (error) {
        console.error("NSGClarity: Failed to fetch user session", error);
      }
    };

    fetchUser();

    // Re-check on window focus (e.g. user coming back from Telegram tab)
    const onFocus = () => fetchUser();
    window.addEventListener('focus', onFocus);

    return () => window.removeEventListener('focus', onFocus);
  }, []);

  // Sync Objectives from Telegram
  const syncObjectives = async (isManual = false) => {
    if (!telegramId) {
      if (isManual) showToast("Conecta Telegram primero", "error");
      return;
    }

    setIsLoadingTelegramData(true);
    if (isManual) showToast("Sincronizando con Telegram...", "info");

    try {
      const jwtToken = localStorage.getItem('token');
      if (!jwtToken) return;

      const response = await fetch(`https://nsg-backend.onrender.com/telegram/user/${telegramId}`, {
        method: 'GET',
        headers: {
          'Authorization': jwtToken,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log("📊 DATOS DE TELEGRAM RECIBIDOS:", data);
        setTelegramData(data);

        if (isManual) showToast("Objetivos actualizados", "success");
      } else {
        console.error('Failed to fetch telegram data:', response.status);
        if (isManual) showToast("Error al sincronizar datos", "error");
      }
    } catch (error) {
      console.error('Error fetching telegram data:', error);
      if (isManual) showToast("Error de conexión", "error");
    } finally {
      setIsLoadingTelegramData(false);
    }
  };

  // Fetch Telegram user data when telegramId is available
  useEffect(() => {
    if (telegramId) {
      syncObjectives(false);
    }
  }, [telegramId]);

  // Update tasks when telegramData changesw
  useEffect(() => {
    if (telegramData) {
      setTasks(prev => prev.map(task => {
        if (task.time === "08:00 AM" && telegramData.checkin_morning) {
          return { ...task, desc: telegramData.checkin_morning };
        }
        if (task.time === "01:00 PM" && telegramData.checkin_noon) {
          return { ...task, desc: telegramData.checkin_noon };
        }
        if (task.time === "08:00 PM" && telegramData.checkin_night) {
          return { ...task, desc: telegramData.checkin_night };
        }
        return task;
      }));
    }
  }, [telegramData]);

  // Check Google Calendar connection status on mount
  useEffect(() => {
    const checkGoogleConnection = async () => {
      const jwtToken = localStorage.getItem('token');
      if (!jwtToken) return;
      try {
        const res = await fetch('https://nsg-backend.onrender.com/google/calendar/events', {
          headers: { 'Authorization': jwtToken }
        });
        if (res.ok) {
          setIsConnected(true);
        }
      } catch (error) {
        console.error("Error checking calendar connection:", error);
      }
    };
    checkGoogleConnection();
  }, []);

  const handleConnect = async (platform: string) => {
    if (platform === "Telegram") {
      if (telegramId) {
        showToast("Telegram ya está conectado", "info");
        return;
      }

      showToast("Abriendo Telegram para vinculación segura...", "info");

      // Senior Implementation: Using the 'start' parameter for deep linking.
      // This sends the platform userId to your bot automatically when the user clicks 'Start'.
      // The bot will receive: /start user_12345
      const telegramBotUrl = `https://t.me/nsg_preguntasyrespuestas_bot?start=${userId}`;

      setTimeout(() => {
        window.open(telegramBotUrl, "_blank");
      }, 800);

      return;
    }

    if (platform === "Calendar") {
      const jwtToken = localStorage.getItem('token');

      if (isConnected) {
        // Disconnect Logic
        try {
          const res = await fetch('https://nsg-backend.onrender.com/google/calendar', {
            method: 'DELETE',
            headers: { 'Authorization': jwtToken || '' }
          });
          if (res.ok) {
            setIsConnected(false);
            showToast('Google Calendar desconectado', 'info');
          }
        } catch (error) {
          showToast('Error al desconectar', 'error');
          console.error(error);
        }
        return;
      }

      // Connect Logic
      try {
        const res = await fetch('https://nsg-backend.onrender.com/google/auth', {
          headers: { 'Authorization': jwtToken || '' }
        });
        const data = await res.json();
        if (data.url) {
          window.open(data.url, '_blank');
        }
      } catch (error) {
        showToast('Error al iniciar autenticación', 'error');
        console.error(error);
      }
      return;
    }
  };

  // Tasks State
  const [tasks, setTasks] = useState([
    {
      id: "1",
      time: "08:00 AM",
      title: "Morning Clarity",
      status: "Completado",
      color: "emerald" as const,
      desc: telegramData?.daily_checking_in?.morning || "Definición de intención estratégica.",
      locked: false,
      isChecked: true
    },
    {
      id: "2",
      time: "01:00 PM",
      title: "Power Check",
      status: "Pendiente",
      color: "blue" as const,
      desc: telegramData?.daily_checking_in?.noon || "Recalibración de medio día.",
      locked: false,
      isChecked: false
    },
    {
      id: "3",
      time: "08:00 PM",
      title: "Next Day Planning",
      status: "Bloqueado",
      color: "violet" as const, // UPDATED: More attractive 'violet'
      desc: telegramData?.daily_checking_in?.night || "Diseño del éxito para mañana.",
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
      {/* 1. Header Section */}
      <div className="mb-6 sm:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 sm:gap-8 px-4 sm:px-0">
        <div className="flex-1 w-full">
          <div
            onClick={() => syncObjectives(true)}
            className="flex flex-row items-center gap-3 sm:gap-4 mb-3 cursor-pointer group/header hover:opacity-80 transition-opacity"
            title="Clic para sincronizar objetivos"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-navy-950 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg transform transition group-hover/header:rotate-12 hover:shadow-blue-900/20 shrink-0">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="overflow-hidden">
              <h3 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-navy-900 tracking-tight leading-none truncate">
                NSG Clarity
              </h3>
              <p className="text-[0.55rem] sm:text-[0.65rem] font-bold text-blue-600 uppercase tracking-widest mt-1 truncate">
                Strategic Alignment Protocol
              </p>
            </div>
          </div>
          <p className="text-slate-500 max-w-md text-xs sm:text-sm lg:text-base leading-relaxed font-medium mt-2">
            Sincronización neuronal activa. Tu ecosistema de productividad circadiana conectado en tiempo real.
          </p>
        </div>

        {/* Integration Hub - Connected State */}
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
            <div className="text-left overflow-hidden">
              <p className={clsx(
                "text-[0.5rem] sm:text-[0.55rem] font-bold uppercase tracking-widest leading-none mb-0.5 transition-colors truncate",
                telegramId ? "text-emerald-600/70" : "text-slate-400"
              )}>
                {telegramData?.name ? telegramData.name : "Status"}
              </p>
              <div className="flex items-center gap-1.5 overflow-hidden">
                <p className={clsx(
                  "text-xs font-bold transition-colors truncate",
                  telegramId ? "text-emerald-900" : "text-navy-900"
                )}>
                  {telegramId ? (telegramData?.username ? `@${telegramData.username}` : "Activo") : "Conectar Telegram"}
                </p>
                {telegramId && <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>}
              </div>
            </div>
          </button>

          {/* Google Calendar Button */}
          <button
            onClick={() => handleConnect("Calendar")}
            className={clsx(
              "w-full sm:w-auto group relative flex items-center gap-3 px-4 sm:px-5 py-2 sm:py-2.5 border rounded-2xl sm:rounded-[2rem] transition-all duration-500 cursor-pointer shadow-sm",
              isConnected
                ? "bg-white border-blue-200 hover:border-red-200"
                : "bg-white border-slate-200 hover:shadow-md hover:border-blue-200"
            )}
          >
            <div className={clsx(
              "w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm border relative shrink-0",
              isConnected ? "bg-white border-blue-100 group-hover:border-red-100" : "bg-white border-slate-100 group-hover:border-blue-200"
            )}>
              <div className={clsx(
                "w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center transition-opacity duration-300",
                isConnected ? "group-hover:opacity-20" : ""
              )}>
                <svg viewBox="0 0 24 24" className="w-full h-full"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /><path d="M1 1h22v22H1z" fill="none" /></svg>
              </div>
              {isConnected && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <LogOut className="w-4 h-4 text-red-500" />
                </div>
              )}
            </div>

            <div className="text-left overflow-hidden">
              <p className={clsx(
                "text-[0.5rem] sm:text-[0.55rem] font-bold uppercase tracking-widest leading-none mb-0.5 transition-colors truncate",
                isConnected ? "text-blue-500/80 group-hover:text-red-400" : "text-slate-400"
              )}>Google</p>

              <div className="relative h-4 w-28 overflow-hidden">
                <p className={clsx(
                  "text-xs font-bold whitespace-nowrap transition-all duration-300 absolute top-0 left-0 truncate",
                  isConnected
                    ? "text-blue-900 group-hover:-translate-y-full group-hover:opacity-0"
                    : "text-navy-900"
                )}>
                  {isConnected ? "Sincronizado" : "Conectar Calendar"}
                </p>
                {isConnected && (
                  <p className="text-xs font-bold text-red-600 absolute top-0 left-0 whitespace-nowrap translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    Desconectar
                  </p>
                )}
              </div>
            </div>
          </button>
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