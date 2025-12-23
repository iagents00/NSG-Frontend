"use client";

import { useState, useEffect } from "react";
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
  Calendar
} from "lucide-react";
import clsx from "clsx";
import { useToast } from "@/components/ui/ToastProvider";
import JarvisAssistant from "@/components/features/JarvisAssistant";
import { useAppStore } from "@/store/useAppStore";
import { authService } from "@/lib/auth";

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

function TimelineItem({ time, title, color, desc, locked, defaultActive }: Omit<TimelineItemProps, 'status'>) {
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
  const { userId } = useAppStore();
  const [isConnected, setIsConnected] = useState(false);
  const [telegramId, setTelegramId] = useState<number | null>(null);
  const [telegramData, setTelegramData] = useState<any>(null);
  const [isLoadingTelegramData, setIsLoadingTelegramData] = useState(false);

  // Fetch user data to check telegram connection status
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authService.verifySession();
        if (data?.user?.telegram_id) {
          setTelegramId(data.user.telegram_id);
        }
      } catch (error) {
        console.error("NSGClarity: Failed to fetch user session", error);
      }
    };
    fetchUser();
  }, []);

  // Fetch Telegram user data when telegramId is available
  useEffect(() => {
    const fetchTelegramData = async () => {
      if (!telegramId) return;
      
      setIsLoadingTelegramData(true);
      try {
        const jwtToken = localStorage.getItem('token');
        if (!jwtToken) return;

        const response = await fetch(`https://nsg-backend.onrender.com/telegram/${telegramId}`, {
          method: 'GET',
          headers: {
            'Authorization': jwtToken,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const telegramUserData = await response.json();
          setTelegramData(telegramUserData);
        } else {
          console.error('Failed to fetch telegram data:', response.status);
        }
      } catch (error) {
        console.error('Error fetching telegram data:', error);
      } finally {
        setIsLoadingTelegramData(false);
      }
    };

    fetchTelegramData();
  }, [telegramId]);

  const handleConnect = (platform: string) => {
    if (platform === "Telegram") {
      if (telegramId) {
        showToast("Telegram ya está conectado", "info");
        return;
      }
      
      showToast("Abriendo Telegram para vinculación segura...", "info");
      
      // Senior Implementation: Using the 'start' parameter for deep linking.
      // This sends the platform userId to your bot automatically when the user clicks 'Start'.
      // The bot will receive: /start user_12345
      // This is the most secure and frictionless way to link accounts.
      const telegramBotUrl = `https://t.me/nsg_preguntasyrespuestas_bot?start=${userId}`;
      
      // Delay slightly so the user sees the toast
      setTimeout(() => {
        window.open(telegramBotUrl, "_blank");
      }, 800);
      
      return;
    }

    showToast(`Conectando con ${platform}...`, "success");
    // For demo purposes, connecting either one unlocks the view
    setTimeout(() => setIsConnected(true), 1500);
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col animate-fade-in-up pb-10">
      
      {/* 0. JARVIS ASSISTANT */}
      <JarvisAssistant />

      {/* 1. Header Section - Optimized for Symmetry */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-navy-950 rounded-2xl flex items-center justify-center shadow-lg">
              <Target className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-display font-bold text-3xl lg:text-5xl text-navy-900 tracking-tight leading-none">
                NSG Clarity
              </h3>
              <p className="text-[0.7rem] font-bold text-blue-600 uppercase tracking-widest mt-1.5 ml-0.5">
                Strategic Alignment Protocol
              </p>
            </div>
          </div>
          <p className="text-slate-500 max-w-xl text-lg leading-relaxed font-medium mt-4">
            Sincronización neuronal activa. Tu ecosistema de productividad circadiana conectado en tiempo real.
          </p>
        </div>

        {/* Integration Hub - Always visible, triggers content reveal */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto pt-2">
            {/* Telegram Button */}
            <button 
              onClick={() => handleConnect("Telegram")}
              disabled={telegramId !== null}
              className={clsx(
                "flex-1 sm:flex-none group relative flex items-center gap-4 px-6 py-4 bg-white border rounded-[2rem] shadow-sm transition-all duration-500 min-w-[200px]",
                telegramId ? "border-emerald-100 bg-emerald-50/30 cursor-not-allowed opacity-75" : "border-slate-200 hover:shadow-md hover:border-blue-200 cursor-pointer"
              )}
            >
              <div className={clsx(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                telegramId ? "bg-emerald-500 text-white" : "bg-[#0088cc]/10 text-[#0088cc] group-hover:bg-[#0088cc] group-hover:text-white"
              )}>
                  {telegramId ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.944 0C5.352 0 0 5.352 0 11.944c0 6.592 5.352 11.944 11.944 11.944c6.592 0 11.944-5.352 11.944-11.944C23.888 5.352 18.536 0 11.944 0zm5.66 8.16l-1.928 9.096c-.144.644-.528.804-1.068.5l-2.936-2.164l-1.416 1.364c-.156.156-.288.288-.588.288l.212-3.04l5.524-4.992c.24-.212-.052-.332-.372-.12l-6.828 4.3l-2.948-.92c-.64-.2-.652-.64.132-.948l11.524-4.44c.532-.2.996.12.804.976z"/>
                    </svg>
                  )}
              </div>
              <div className="text-left">
                <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Status</p>
                <p className="text-sm font-bold text-navy-900">{telegramId ? "Telegram Conectado" : "Conectar Telegram"}</p>
              </div>
            </button>

            {/* Google Calendar Button */}
            <button 
              onClick={() => handleConnect("Calendar")}
              className={clsx(
                "flex-1 sm:flex-none group relative flex items-center gap-4 px-6 py-4 bg-white border rounded-[2rem] shadow-sm transition-all duration-500 cursor-pointer min-w-[200px]",
                isConnected ? "border-emerald-100 bg-emerald-50/30" : "border-slate-200 hover:shadow-md hover:border-emerald-200"
              )}
            >
              <div className={clsx(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                isConnected ? "bg-emerald-500 text-white" : "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white"
              )}>
                  <Calendar className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Agenda</p>
                <p className="text-sm font-bold text-navy-900">{isConnected ? "Calendar Enlazado" : "Conectar Calendar"}</p>
              </div>
            </button>
        </div>
      </div>

      {/* MAIN CONTENT: Decoupled for visualization */}
      <div className="animate-fade-in space-y-10">
        
        {/* Next Session Banner */}
        <div className="bg-navy-950 rounded-[2.5rem] p-8 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-emerald-600/10 opacity-50 animate-pulse-slow"></div>
          
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 rounded-full border-2 border-blue-500/30 flex items-center justify-center shrink-0">
              <div className="w-16 h-16 border-2 border-t-blue-400 border-transparent rounded-full animate-spin-slow absolute inset-0"></div>
              <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_20px_white]"></div>
            </div>
            <div>
              <p className="text-xs font-bold text-blue-300 uppercase tracking-[0.2em] mb-1">Pulse active</p>
              <h4 className="text-2xl font-display font-bold">Protocolo de Sincronización en Curso</h4>
            </div>
          </div>

          <div className="relative z-10 text-center md:text-right bg-white/5 backdrop-blur-md px-8 py-4 rounded-3xl border border-white/10">
            <p className="text-[0.65rem] font-bold text-blue-300 uppercase tracking-widest mb-1">Próxima Sesión</p>
            <div className="flex items-baseline justify-center md:justify-end gap-2">
              <span className="text-4xl font-display font-bold">08:00</span>
              <span className="text-sm font-bold text-blue-400">PM</span>
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
              color="emerald" 
              desc={telegramData?.daily_checking_in?.morning || "Definición de intención estratégica. Foco en Q3."} 
              defaultActive={true}
            />
            <TimelineItem 
              time="01:00 PM" 
              title="Power Check" 
              color="blue" 
              desc={telegramData?.daily_checking_in?.noon || "Recalibración de medio día (7 min)."} 
              defaultActive={false}
            />
            <TimelineItem 
              time="08:00 PM" 
              title="Next Day Planning" 
              color="slate" 
              desc={telegramData?.daily_checking_in?.night || "Diseño del éxito para mañana."} 
              locked={true}
            />
          </div>

          {/* Right Column: Sync History & Updates (Span 5) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Clarity Updates */}
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

              {/* Sync History */}
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
                      <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-100 z-0"></div>
                      
                      <div className="relative z-10">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-sm transition group ml-2 hover:translate-x-1 cursor-default">
                            <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <p className="text-xs font-bold text-blue-600">08:05 AM</p>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed font-medium">
                            &quot;Objetivo principal: Cerrar el acuerdo con TechCorp antes de las 4pm.&quot;
                            </p>
                        </div>
                      </div>

                      <div className="relative z-10">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-sm transition group ml-2 hover:translate-x-1 cursor-default">
                            <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                            <p className="text-xs font-bold text-slate-400">Ayer 08:30 PM</p>
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed">
                            &quot;Planificación completada. 3 tareas prioritarias asignadas.&quot;
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
    </div>
  );
}