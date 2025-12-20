"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useToast } from "@/components/ui/ToastProvider";
import FathomTokenModal from "@/components/features/FathomTokenModal";
import { 
  Layers, Calendar, Play, FileCheck, FileText, Cpu, 
  PenTool, ArrowUpRight, CheckSquare, ListTodo, PlusCircle,
  Folder, ArrowLeft, MoreHorizontal, Loader2,
  Zap, Activity, ChevronRight, CheckCircle, Trash2
} from "lucide-react";
import clsx from "clsx";

// --- Types ---
interface TranscriptItem {
  speakerName: string;
  time: string;
  text: string;
  isUser?: boolean;
}

interface ActionStep {
  id: number;
  text: string;
  subtext: string;
}

interface AIInfo {
  contextEngine?: {
    painPoint: string;
    opportunity: string;
    tool: string;
    description: string;
  };
  methodology?: {
    description: string;
  };
  strategy?: {
    description: string;
  };
  actionPlan?: ActionStep[];
}

interface MeetingFolder {
  id: string;
  title: string;
  description: string;
  date: string;     // Formatted DD-MM-YYYY
  timeStr: string;  // Formatted HH:mm
  shareUrl: string;
  type: string;
  insights: number;
  transcripts?: TranscriptItem[];
  aiInfo?: AIInfo;
}

export default function NSGHorizon() {
  const { userId } = useAppStore();
  const { showToast } = useToast();
  
  // State
  const [folders, setFolders] = useState<MeetingFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<MeetingFolder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [showFathomModal, setShowFathomModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const [fathomToken, setFathomToken] = useState<string | null>(null);

  // Check initial connection
  useEffect(() => {
     if (typeof window !== 'undefined') {
        const token = localStorage.getItem('fathom_token');
        if (token) {
            setFathomToken(token);
            setIsConnected(true);
        }
     }
  }, []);

  const handleConnectFathom = (token: string) => {
      localStorage.setItem('fathom_token', token);
      setFathomToken(token);
      setIsConnected(true);
      setShowFathomModal(false);
      showToast('Fathom conectado exitosamente', 'success');
  };

  const handleDisconnectFathom = () => {
      localStorage.removeItem('fathom_token');
      setFathomToken(null);
      setIsConnected(false);
      showToast('Fathom desconectado', 'info');
  };

  // Fetch Data on Mount
  useEffect(() => {
    const fetchHorizonData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/nsg-horizon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userId || 'user_guest' })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("NSG Horizon API Error:", response.status, errorText);
            throw new Error(`Failed to fetch data: ${response.status} ${errorText}`);
        }

        const jsonResponse = await response.json();
        
        // Helper to format date and time
        const formatDateTime = (isoString: string) => {
            if (!isoString) return { date: 'N/A', time: 'N/A' };
            try {
                const dateObj = new Date(isoString);
                // DD-MM-YYYY
                const day = String(dateObj.getDate()).padStart(2, '0');
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const year = dateObj.getFullYear();
                
                // HH:mm
                const hours = String(dateObj.getHours()).padStart(2, '0');
                const minutes = String(dateObj.getMinutes()).padStart(2, '0');

                return {
                    date: `${day}-${month}-${year}`,
                    time: `${hours}:${minutes}`
                };
            } catch (e) {
                return { date: isoString, time: '' };
            }
        };

        // Parse logic based on user structure: [0: { meetings: [...] }]
        let meetingsArray: any[] = [];
        
        // Check if root is array and has meetings in first element
        if (Array.isArray(jsonResponse) && jsonResponse.length > 0 && jsonResponse[0].meetings) {
            meetingsArray = jsonResponse[0].meetings;
        } 
        // Fallback or other structures
        else if (jsonResponse.data && Array.isArray(jsonResponse.data)) {
            meetingsArray = jsonResponse.data;
        }

        const mappedFolders: MeetingFolder[] = meetingsArray.map((item: any, index: number) => {
            // Handle structure where item itself might be the meeting or it wraps meeting_data
            const mData = item.meeting_data || item; 
            const tList = item.transcription_list || [];

            const formatted = formatDateTime(mData.created_at);

            return {
                id: mData.recording_id || `meeting-${index}`,
                title: mData.title || mData.meeting_title || "Nueva Sesión",
                description: mData.default_summary || "Sesión registrada.",
                date: formatted.date,
                timeStr: formatted.time,
                shareUrl: mData.share_url || "#",
                type: "Reunión", // Could derive from other fields if available
                insights: 0, // Placeholder or calculate
                
                // Map Transcripts
                transcripts: Array.isArray(tList) ? tList.map((t: any) => ({
                    speakerName: t.speaker?.display_name || "Desconocido",
                    time: t.timestamp || "",
                    text: t.text || "",
                    // Robust check: Look at root OR inside speaker object
                    isUser: !!(t.matched_calendar_invitee_email || t.speaker?.matched_calendar_invitee_email)
                })) : [],

                // Map AI Info (Optional)
                aiInfo: undefined 
            };
        });

        setFolders(mappedFolders);

      } catch (error) {
        console.error("Error loading Horizon data:", error);
        showToast("Error cargando datos de Horizon", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHorizonData();
  }, [userId, showToast]);

  // Reset checked items when folder changes
  useEffect(() => {
    setCheckedItems([]);
  }, [selectedFolder]);

  const toggleItem = (id: number) => {
    setCheckedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
    showToast("Estado actualizado", "success");
  };

  if (isLoading) {
      return (
          <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <p className="text-slate-500 font-medium">Cargando NSG Horizon...</p>
              </div>
          </div>
      );
  }

  // --- VIEW: FOLDERS LIST ---
  if (!selectedFolder) {
    return (
      <div className="flex flex-col h-full gap-8 animate-fade-in-up pb-8">
        
        {/* HERO: JOIN FATHOM (Visual Only) */}
        <div className="w-full bg-linear-to-r from-navy-900 via-navy-800 to-blue-900 rounded-[2.5rem] p-8 sm:p-12 text-white relative overflow-hidden shadow-xl border border-navy-700/50">
           {/* Decorational Elements */}
           <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-2xl text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold uppercase tracking-wider">
                  <Zap className="w-3 h-3 fill-current" />
                  Potenciado por AI
                </div>
                <h2 className="text-3xl sm:text-4xl font-display font-bold leading-tight">
                  Conecta tus reuniones con <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-200 to-white">Fathom</span>
                </h2>
                <p className="text-blue-100/80 text-lg leading-relaxed max-w-xl mx-auto md:mx-0">
                  Sincroniza automáticamente tus grabaciones, transcribimos y analizamos cada detalle para generar insights estratégicos al instante.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">

                   {isConnected && fathomToken ? (
                       <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-1.5 pr-4 rounded-2xl border border-white/20">
                            <div className="bg-emerald-500/20 text-emerald-300 p-2 rounded-xl">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">Token Activo</span>
                                <span className="text-sm font-mono text-white font-bold max-w-[120px] truncate">
                                    {fathomToken}
                                </span>
                            </div>
                            <button 
                                onClick={handleDisconnectFathom}
                                className="ml-2 p-2 hover:bg-white/10 rounded-lg text-red-300 hover:text-red-200 transition cursor-pointer"
                                title="Desconectar y eliminar token"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                       </div>
                   ) : (
                       <button 
                         onClick={() => setShowFathomModal(true)}
                         className="px-8 py-4 rounded-2xl font-bold transition transform hover:-translate-y-0.5 shadow-lg flex items-center gap-3 group bg-white text-navy-900 hover:bg-blue-50 shadow-black/10 cursor-pointer"
                       >
                         <div className="w-6 h-6 bg-linear-to-tr from-orange-400 to-pink-500 rounded-lg flex items-center justify-center text-white">
                            <Activity className="w-4 h-4" />
                         </div>
                         
                         Conectar Fathom
                         
                         <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
                       </button>
                   )}

                   <button className="px-6 py-4 bg-navy-800/50 text-white border border-white/10 rounded-2xl font-medium hover:bg-navy-800 transition cursor-pointer">
                      Saber más
                   </button>
                </div>
              </div>
              
              {/* Visual Element / Illustration */}
              <div className="hidden md:flex relative">
                <div className="w-64 h-48 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4 transform rotate-3 shadow-2xl">
                   <div className="flex gap-2 mb-4">
                     <div className="w-2 h-2 rounded-full bg-red-400"></div>
                     <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                     <div className="w-2 h-2 rounded-full bg-green-400"></div>
                   </div>
                   <div className="space-y-3">
                     <div className="h-2 w-3/4 bg-white/20 rounded"></div>
                     <div className="h-2 w-1/2 bg-white/20 rounded"></div>
                     <div className="h-24 w-full bg-white/10 rounded-xl mt-4 border border-white/5 flex items-center justify-center">
                        <Activity className="w-8 h-8 text-white/30" />
                     </div>
                   </div>
                </div>
              </div>
           </div>
        </div>

        {/* FOLDERS GRID */}
        <div className="flex flex-col gap-6 flex-1 min-h-0">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                <Folder className="w-5 h-5 text-blue-600" />
                Mis Carpetas de Sesiones
              </h3>
              <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition">
                  <Layers className="w-5 h-5" />
                </button>
                <button className="p-2 text-slate-400 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition">
                  <ListTodo className="w-5 h-5" />
                </button>
              </div>
           </div>

           {folders.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-[2rem]">
                   <Folder className="w-12 h-12 mb-4 opacity-50" />
                   <p>No hay carpetas de sesiones disponibles.</p>
               </div>
           ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-4">
              {folders.map((folder) => (
                <div 
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder)}
                  className="bg-white rounded-[2rem] p-6 border border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                      <Folder className="w-6 h-6 fill-current" />
                    </div>
                    <button className="text-slate-300 hover:text-navy-900 transition">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <h4 className="font-bold text-navy-900 text-lg mb-2 group-hover:text-blue-600 transition">
                    {folder.title}
                  </h4>
                  
                  <p className="text-sm text-slate-500 mb-6 line-clamp-2 flex-1">
                    {folder.description}
                  </p>
                  
                  <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                     <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                        <span className="flex items-center gap-1.5">
                           <Calendar className="w-3.5 h-3.5" />
                           {folder.date}
                        </span>
                        <span className="flex items-center gap-1.5 text-blue-400">
                           {folder.timeStr}
                        </span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wide border border-emerald-100">
                           {folder.insights} Insights
                        </div>
                        <div className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-wide border border-slate-100 truncate max-w-[120px]">
                           {folder.type}
                        </div>
                     </div>
                  </div>
                </div>
              ))}
              
              {/* New Folder Button */}
              <button className="bg-slate-50 rounded-4xl p-6 border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 group min-h-[260px]">
                 <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-500 transition-colors">
                    <PlusCircle className="w-7 h-7" />
                 </div>
                 <span className="font-bold text-slate-500 group-hover:text-blue-600">Crear Nueva Carpeta</span>
              </button>
            </div>
           )}
        </div>
        <FathomTokenModal 
            isOpen={showFathomModal} 
            onClose={() => setShowFathomModal(false)} 
            onConnect={handleConnectFathom}
        />
      </div>
    );
  }

  // --- VIEW: FOLDER DETAIL (Dynamic Data) ---
  return (
    <div className="flex flex-col h-full gap-6 animate-fade-in-up">
      
      {/* 1. HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedFolder(null)}
            className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-navy-900 transition shrink-0"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="w-px h-10 bg-slate-200 mx-2 hidden sm:block"></div>

          <div className="w-14 h-14 bg-navy-950 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg hidden sm:flex">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-display font-bold text-2xl text-navy-900">{selectedFolder.title}</h3>
            <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
              <Calendar className="w-3 h-3" /> {selectedFolder.date} • <span className="text-blue-600 font-bold">{selectedFolder.type}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-3 w-full lg:w-auto mt-2 lg:mt-0">
          <a 
            href={selectedFolder.shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => showToast('Abriendo sesión...', 'info')} 
            className="flex-1 lg:flex-none px-6 py-3 bg-slate-50 text-navy-900 font-bold rounded-xl hover:bg-slate-100 transition border border-slate-200 flex items-center justify-center gap-2 cursor-pointer no-underline"
          >
            <Play className="w-4 h-4" /> <span className="hidden sm:inline">Ver</span> Sesión
          </a>
          <button 
            onClick={() => showToast('Exportando PDF...', 'success')} 
            className="flex-1 lg:flex-none px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileCheck className="w-4 h-4" /> <span className="hidden sm:inline">Exportar</span> PDF
          </button>
        </div>
      </div>

      {/* 2. MAIN GRID */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
{/* LEFT COLUMN: TRANSCRIPTION */}
        <div className="lg:col-span-5 flex flex-col h-full min-h-[500px]">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center shrink-0 bg-white">
              <h4 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" /> 
                Transcripción de la Sesión
              </h4>
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-bold bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-100 uppercase tracking-wide">
                    Completado
                 </span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scroll p-6 space-y-6 bg-white">
               {selectedFolder.transcripts?.map((item, index) => {
                  const isMe = item.isUser;
                  
                  const safeColors = [
                     "bg-[#1976d2]", // Blue 700
                     "bg-[#388e3c]", // Green 700
                     "bg-[#f57c00]", // Orange 700
                     "bg-[#d32f2f]", // Red 700
                     "bg-[#7b1fa2]", // Purple 700
                     "bg-[#00796b]", // Teal 700
                     "bg-[#512da8]", // Deep Purple 700
                     "bg-[#c2185b]", // Pink 700
                     "bg-[#455a64]", // Blue Grey 700
                     "bg-[#afb42b]", // Lime 800
                  ];
                  
                  const getSpeakerColor = (name: string) => {
                    let hash = 0;
                    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
                    return safeColors[Math.abs(hash) % safeColors.length];
                  };
                  const avatarColor = getSpeakerColor(item.speakerName);

                  return (
                    <div key={index} className={`flex w-full gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'} mb-4 animate-fade-in-up`}>
                        {/* Avatar */}
                        <div className={`
                            w-9 h-9 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 
                            select-none text-white shadow-sm ring-2 ring-white
                            ${isMe ? 'bg-blue-600' : avatarColor}
                        `}>
                            {item.speakerName.substring(0, 1).toUpperCase()}
                        </div>
                        
                        {/* Content Bubble */}
                        <div className={`
                           group relative max-w-[75%] px-5 py-4 shadow-sm hover:shadow-md transition-shadow duration-200
                           ${isMe 
                                ? 'bg-blue-600 text-white rounded-2xl items-end' 
                                : 'bg-white text-slate-800 rounded-2xl border border-slate-100 items-start'
                           }
                        `}>
                            {/* Header: Name */}
                            {!isMe && (
                                <div className="mb-1">
                                    <span className={`text-xs font-bold ${isMe ? 'text-blue-100' : 'text-slate-900'}`}>
                                        {item.speakerName}
                                    </span>
                                </div>
                            )}

                            {/* Text Content */}
                            <p className={`
                                text-[15px] leading-relaxed whitespace-pre-wrap font-normal
                                ${isMe ? 'text-white' : 'text-slate-700'}
                            `}>
                                {item.text}
                            </p>
                            
                            {/* Time Stamp (Bottom Right) */}
                            <div className={`
                                text-[10px] mt-2 flex
                                ${isMe ? 'text-blue-100 justify-end opacity-80' : 'text-slate-400 justify-end'}
                            `}>
                                {item.time}
                            </div>
                        </div>
                    </div>
                  );
              })}
              
              {!selectedFolder.transcripts?.length && (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4 mt-8">
                      <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
                          <FileText className="w-8 h-8 text-slate-300 opacity-50" />
                      </div>
                      <div className="text-center">
                          <p className="text-sm font-bold text-slate-500">Aún no hay transcripciones</p>
                          <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Las sesiones aparecen aquí.</p>
                      </div>
                  </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CONTEXT & ACTIONS */}
        <div className="lg:col-span-7 flex flex-col gap-6 h-full overflow-y-auto custom-scroll pr-1 pb-4">
          
          {/* Context Engine Card */}
          {selectedFolder.aiInfo?.contextEngine && (
            <div className="bg-navy-950 text-white p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl shrink-0">
                <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-blue-600/30 rounded-full blur-[80px] pointer-events-none"></div>
                
                <div className="relative z-10">
                <h4 className="font-display font-bold text-xl mb-4 flex items-center gap-3">
                    <div className="p-1.5 bg-blue-500 rounded-lg"><Cpu className="w-4 h-4 text-white" /></div> NSG Context Engine
                </h4>
                <p className="text-blue-100 text-sm mb-6 max-w-lg">
                    {selectedFolder.aiInfo.contextEngine.description}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                    <p className="text-[0.6rem] font-bold text-blue-300 uppercase mb-1">Punto de Dolor</p>
                    <p className="text-sm font-bold">{selectedFolder.aiInfo.contextEngine.painPoint}</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                    <p className="text-[0.6rem] font-bold text-emerald-300 uppercase mb-1">Oportunidad</p>
                    <p className="text-sm font-bold">{selectedFolder.aiInfo.contextEngine.opportunity}</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                    <p className="text-[0.6rem] font-bold text-purple-300 uppercase mb-1">Herramienta</p>
                    <p className="text-sm font-bold">{selectedFolder.aiInfo.contextEngine.tool}</p>
                    </div>
                </div>
                </div>
            </div>
          )}

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
            {/* Metodología */}
            {selectedFolder.aiInfo?.methodology && (
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition group">
                <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                    <PenTool className="w-6 h-6" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-purple-600 transition" />
                </div>
                <h5 className="font-bold text-navy-900 text-lg mb-2">Metodología Sugerida</h5>
                <p className="text-sm text-slate-500 mb-4 line-clamp-3">
                    {selectedFolder.aiInfo.methodology.description}
                </p>
                <button className="w-full py-2.5 bg-slate-50 text-purple-700 font-bold text-xs rounded-xl hover:bg-purple-100 transition cursor-pointer">
                    Ver Guía de Implementación
                </button>
                </div>
            )}
            
            {/* Estrategia Táctica */}
            {selectedFolder.aiInfo?.strategy && (
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition group">
                <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                    <CheckSquare className="w-6 h-6" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 transition" />
                </div>
                <h5 className="font-bold text-navy-900 text-lg mb-2">Estrategia Táctica</h5>
                <p className="text-sm text-slate-500 mb-4 line-clamp-3">
                    {selectedFolder.aiInfo.strategy.description}
                </p>
                <button className="w-full py-2.5 bg-slate-50 text-emerald-700 font-bold text-xs rounded-xl hover:bg-emerald-100 transition cursor-pointer">
                    Añadir a Calendario
                </button>
                </div>
            )}
          </div>
          {/* Action Plan Checklist */}
          {selectedFolder.aiInfo?.actionPlan && selectedFolder.aiInfo.actionPlan.length > 0 && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-card flex-1">
                <h4 className="font-bold text-navy-900 text-xl mb-6 flex items-center gap-3">
                <ListTodo className="w-6 h-6 text-blue-600" /> Plan de Acción Inmediata
                </h4>
                
                <div className="space-y-4">
                {selectedFolder.aiInfo.actionPlan.map((step) => (
                    <div 
                        key={step.id}
                        className={clsx(
                        "flex items-start gap-4 p-4 rounded-2xl border transition cursor-pointer group",
                        checkedItems.includes(step.id) ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-100 hover:bg-white hover:shadow-sm"
                        )}
                        onClick={() => toggleItem(step.id)}
                    >
                        <div className={clsx(
                        "mt-1 w-5 h-5 rounded-full border-2 transition flex items-center justify-center",
                        checkedItems.includes(step.id) ? "border-emerald-500 bg-emerald-500" : "border-slate-300 bg-white group-hover:border-blue-500"
                        )}>
                        {checkedItems.includes(step.id) && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                        <div>
                        <p className={clsx("font-bold text-sm", checkedItems.includes(step.id) ? "text-emerald-900" : "text-navy-900")}>
                            {step.text}
                        </p>
                        <p className={clsx("text-xs mt-1", checkedItems.includes(step.id) ? "text-emerald-700" : "text-slate-500")}>
                            {step.subtext}
                        </p>
                        </div>
                    </div>
                ))}
                </div>

                <button 
                onClick={() => showToast('Personalizando...', 'info')} 
                className="w-full mt-6 py-3 bg-navy-900 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                <PlusCircle className="w-4 h-4" /> Personalizar más acciones con AI
                </button>
            </div>
          )}
        </div>
      </div>
      <FathomTokenModal 
        isOpen={showFathomModal} 
        onClose={() => setShowFathomModal(false)} 
        onConnect={handleConnectFathom}
      />
    </div>
  );
}