"use client";

import { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useToast } from "@/components/ui/ToastProvider";
import FathomTokenModal from "@/components/features/FathomTokenModal";
import {
  Layers, Calendar, Play, FileCheck, FileText, Cpu,
  PenTool, ArrowUpRight, CheckSquare, ListTodo, PlusCircle,
  Folder, ArrowLeft, MoreHorizontal, Loader2,
  Zap, Activity, ChevronRight, CheckCircle, Trash2, Sparkles, X, Search, ChevronDown, ChevronUp
} from "lucide-react";
import clsx from "clsx";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
  punto_de_dolor?: {
    titulo: string;
    descripcion: string;
    evidencia_de_la_conversacion: string[];
    emociones_probables: string[];
  };
  oportunidad?: {
    titulo: string;
    descripcion: string;
    nuevo_enfoque: string;
  };
  herramienta?: {
    nombre: string;
    descripcion: string;
    pasos_practicos: string[];
    recomendacion_de_uso: string;
  };
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // State
  const [folders, setFolders] = useState<MeetingFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<MeetingFolder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [showFathomModal, setShowFathomModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [fathomToken, setFathomToken] = useState<string | null>(null);
  const [showTranscription, setShowTranscription] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  // Check initial connection from backend
  useEffect(() => {
    const checkFathomConnection = async () => {
      try {
        const jwtToken = localStorage.getItem('token');
        if (!jwtToken) return;

        const response = await fetch('https://nsg-backend.onrender.com/fathom/status', {
          headers: {
            'Authorization': jwtToken
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.connected) {
            setIsConnected(true);
            setFathomToken('***'); // Don't store actual token in frontend
          }
        }
      } catch (error) {
        console.error('Error checking Fathom connection:', error);
      }
    };

    checkFathomConnection();
  }, []);

  const handleConnectFathom = (token: string) => {
    // Token is already saved in backend by the modal
    setFathomToken('***'); // Don't store actual token
    setIsConnected(true);
    setShowFathomModal(false);
    showToast('Fathom conectado exitosamente', 'success');
  };

  const handleDisconnectFathom = async () => {
    try {
      const jwtToken = localStorage.getItem('token');
      if (!jwtToken) return;

      const response = await fetch('https://nsg-backend.onrender.com/fathom/token', {
        method: 'DELETE',
        headers: {
          'Authorization': jwtToken
        }
      });

      if (response.ok) {
        setFathomToken(null);
        setIsConnected(false);
        setFolders([]); // Limpiar las sesiones de la interfaz
        setSelectedFolder(null); // Cerrar la vista de detalle si estaba abierta
        showToast('Fathom desconectado y datos limpiados', 'info');
      } else {
        showToast('Error desconectando Fathom', 'error');
      }
    } catch (error) {
      console.error('Error disconnecting Fathom:', error);
      showToast('Error desconectando Fathom', 'error');
    }
  };

  // Fetch Data on Mount
  useEffect(() => {
    const fetchHorizonData = async () => {
      // Si no estamos conectados, no intentamos cargar datos de Fathom
      if (!isConnected) {
        setIsLoading(false);
        setFolders([]);
        return;
      }

      try {
        setIsLoading(true);
        const jwtToken = localStorage.getItem('token');
        const response = await fetch('https://nsg-backend.onrender.com/fathom/meetings', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': jwtToken || ''
          }
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

            // Map AI Info (Attempt to retrieve from backend)
            aiInfo: item.ai_analysis || undefined
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
  }, [userId, isConnected]);

  const handleGenerateAnalysis = async () => {
    if (!selectedFolder || isAnalyzing) return;

    try {
      setIsAnalyzing(true);
      const jwtToken = localStorage.getItem('token');

      showToast("Generando análisis profundo. Esto puede tardar unos segundos...", "info");

      const response = await fetch('https://nsg-backend.onrender.com/fathom/generate-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': jwtToken || ''
        },
        body: JSON.stringify({
          recording_id: selectedFolder.id
        })
      });

      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        showToast("¡Análisis generado con éxito! Cargando resultados...", "success");

        // Forzar una recarga del análisis ahora que sabemos que existe
        const analysisResponse = await fetch(`https://nsg-backend.onrender.com/fathom/analysis/${selectedFolder.id}`, {
          method: 'GET',
          headers: {
            'Authorization': jwtToken || ''
          }
        });

        if (analysisResponse.ok) {
          const analysisData = await analysisResponse.json();
          if (analysisData.success && analysisData.analysis) {
            const updatedFolder = {
              ...selectedFolder,
              aiInfo: analysisData.analysis.ai_analysis || analysisData.analysis
            };
            setSelectedFolder(updatedFolder);
            setFolders(prev => prev.map(f => f.id === updatedFolder.id ? updatedFolder : f));
          }
        }
      }

    } catch (error) {
      console.error("Error generando análisis:", error);
      showToast("Error al generar el análisis. Inténtalo de nuevo.", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Reset checked items and check for existing analysis when folder changes
  useEffect(() => {
    setCheckedItems([]);

    const checkExistingAnalysis = async () => {
      if (!selectedFolder) return;

      try {
        const jwtToken = localStorage.getItem('token');
        const response = await fetch(`https://nsg-backend.onrender.com/fathom/analysis/${selectedFolder.id}`, {
          method: 'GET',
          headers: {
            'Authorization': jwtToken || ''
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            if (data.analysis && !selectedFolder.aiInfo) {
              const updatedFolder: MeetingFolder = {
                ...selectedFolder,
                aiInfo: data.analysis.ai_analysis || data.analysis
              };
              setSelectedFolder(updatedFolder);
              setFolders(prev => prev.map(f => f.id === updatedFolder.id ? updatedFolder : f));
            }
            if (data.checked_steps) {
              setCheckedItems(data.checked_steps);
            }
          }
        }
      } catch (error) {
        console.error("Error checking existing analysis:", error);
      }
    };

    checkExistingAnalysis();
  }, [selectedFolder?.id]);

  // Scroll to top when folder changes
  useEffect(() => {
    if (selectedFolder) {
      window.scrollTo(0, 0);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [selectedFolder?.id]);

  const toggleItem = async (id: number) => {
    if (!selectedFolder) return;

    const newCheckedItems = checkedItems.includes(id)
      ? checkedItems.filter(i => i !== id)
      : [...checkedItems, id];

    setCheckedItems(newCheckedItems);

    // Save to backend
    try {
      const jwtToken = localStorage.getItem('token');
      await fetch(`https://nsg-backend.onrender.com/fathom/analysis/${selectedFolder.id}/steps`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': jwtToken || ''
        },
        body: JSON.stringify({ checked_steps: newCheckedItems })
      });
      showToast("Progreso guardado", "success");
    } catch (error) {
      console.error("Error saving steps:", error);
    }
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-600 text-xs font-bold uppercase tracking-wider">
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
                      <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Conectado</span>
                      <span className="text-sm text-slate-900 font-bold">
                        Fathom Analytics
                      </span>
                    </div>
                    <button
                      onClick={handleDisconnectFathom}
                      className="ml-2 p-2 hover:bg-white/10 rounded-lg text-red-300 hover:text-red-200 transition cursor-pointer"
                      title="Desconectar y eliminar API key"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowFathomModal(true)}
                    className="px-8 py-4 rounded-2xl font-bold transition transform hover:-translate-y-0.5 shadow-lg flex items-center gap-3 group bg-white text-navy-900 hover:bg-blue-50 shadow-black/10 cursor-pointer"
                  >
                    <div className="w-6 h-6 bg-linear-to-tr from-orange-400 to-pink-500 rounded-lg flex items-center justify-center text-slate-900">
                      <Activity className="w-4 h-4" />
                    </div>

                    Conectar Fathom

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
                  </button>
                )}

                <button className="px-6 py-4 bg-navy-800/50 text-slate-900 border border-slate-200 rounded-2xl font-medium hover:bg-navy-800 transition cursor-pointer">
                  Saber más
                </button>
              </div>
            </div>

            {/* Visual Element / Illustration */}
            <div className="hidden md:flex relative">
              <div className="w-64 h-48 bg-white/5 backdrop-blur-md rounded-2xl border border-slate-200 p-4 transform rotate-3 shadow-2xl">
                <div className="flex gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-2 w-3/4 bg-white/20 rounded"></div>
                  <div className="h-2 w-1/2 bg-white/20 rounded"></div>
                  <div className="h-24 w-full bg-white/10 rounded-xl mt-4 border border-white/5 flex items-center justify-center">
                    <Activity className="w-8 h-8 text-slate-900/30" />
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
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-slate-900 transition-colors duration-300">
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
      </div>
    );
  }

  // --- VIEW: FOLDER DETAIL (Dynamic Data) ---
  return (
    <div
      ref={scrollContainerRef}
      className="flex flex-col h-full gap-6 animate-fade-in-up overflow-y-auto"
    >

      {/* 1. HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-slate-200 shadow-sm shrink-0 mx-4 sm:mx-0">
        <div className="flex items-center gap-3 sm:gap-4 w-full lg:w-auto">
          <button
            onClick={() => setSelectedFolder(null)}
            className="w-10 h-10 sm:w-14 sm:h-14 bg-slate-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-navy-900 transition shrink-0"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <div className="w-px h-8 sm:h-10 bg-slate-200 mx-1 sm:mx-2 hidden xs:block"></div>

<<<<<<< HEAD
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 shrink-0 shadow-lg hidden sm:flex">
            <Layers className="w-7 h-7" />
=======
          <div className="w-10 h-10 sm:w-14 sm:h-14 bg-navy-950 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg hidden sm:flex">
            <Layers className="w-5 h-5 sm:w-7 sm:h-7" />
>>>>>>> 7d4c4a9281d0a9e316e4ad28626e24b2ae4a5e84
          </div>
          <div className="overflow-hidden">
            <h3 className="font-display font-bold text-lg sm:text-2xl text-navy-900 truncate">{selectedFolder.title}</h3>
            <p className="text-[0.65rem] sm:text-sm text-slate-500 font-medium flex items-center gap-2 truncate">
              <Calendar className="w-3 h-3 shrink-0" /> {selectedFolder.date} • <span className="text-blue-600 font-bold shrink-0">{selectedFolder.type}</span>
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 xs:flex xs:flex-row gap-2 sm:gap-3 w-full lg:w-auto mt-2 lg:mt-0">
          <button
            onClick={() => setShowTranscription(true)}
            className="px-3 sm:px-6 py-2.5 sm:py-3 bg-slate-50 text-navy-900 text-xs sm:text-sm font-bold rounded-xl hover:bg-slate-100 transition border border-slate-200 flex items-center justify-center gap-2 cursor-pointer no-underline"
          >
            <FileText className="w-3.5 h-3.5 sm:w-4 h-4" /> <span className="hidden md:inline">Ver</span> Transc.
          </button>
          <a
            href={selectedFolder.shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => showToast('Abriendo sesión...', 'info')}
            className="px-3 sm:px-6 py-2.5 sm:py-3 bg-slate-50 text-navy-900 text-xs sm:text-sm font-bold rounded-xl hover:bg-slate-100 transition border border-slate-200 flex items-center justify-center gap-2 cursor-pointer no-underline"
          >
            <Play className="w-3.5 h-3.5 sm:w-4 h-4" /> <span className="hidden md:inline">Ver</span> Sesión
          </a>
          <button
            onClick={() => showToast('Exportando PDF...', 'success')}
<<<<<<< HEAD
            className="flex-1 lg:flex-none px-6 py-3 bg-blue-600 text-slate-900 font-bold rounded-xl hover:bg-blue-500 transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2 cursor-pointer"
=======
            className="col-span-2 xs:flex-1 lg:flex-none px-3 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-blue-500 transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2 cursor-pointer"
>>>>>>> 7d4c4a9281d0a9e316e4ad28626e24b2ae4a5e84
          >
            <FileCheck className="w-3.5 h-3.5 sm:w-4 h-4" /> <span className="hidden md:inline">Exportar</span> PDF
          </button>
        </div>
      </div>

      {/* 2. MAIN GRID */}
      {/* 2. MAIN LAYOUT: VERTICAL STACK */}
      <div className="flex-1 flex flex-col gap-10 min-h-0 pb-12">

        {/* TOP SECTION: CONTEXT & ACTIONS (Was Right Column) */}
        <div className="flex flex-col gap-8 shrink-0">

          {/* 1. MAIN CONTEXT ENGINE CARD (Merged with Summary) */}
          <div className="bg-navy-950 text-white p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl shrink-0 animate-fade-in-up">
            <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 w-64 h-64 bg-blue-600/30 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="relative z-10 text-center sm:text-left">
              <div className="bg-slate-50 p-8 rounded-[2.5rem] text-slate-900 relative overflow-hidden border border-slate-200 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-xl">
                    <Cpu className="w-5 h-5 text-blue-300" />
                  </div>
                  <h4 className="font-bold text-lg text-blue-100 uppercase tracking-widest">NSG Context Engine</h4>
                </div>

                <div className="relative">
                  <div className={clsx(
                    "prose prose-invert prose-sm max-w-none transition-all duration-500 ease-in-out overflow-hidden relative",
                    !isSummaryExpanded ? "max-h-24" : "max-h-[1000px]"
                  )}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {selectedFolder.description || "Sin descripción disponible."}
                    </ReactMarkdown>

                    {!isSummaryExpanded && selectedFolder.description && selectedFolder.description.length > 200 && (
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-navy-950 to-transparent pointer-events-none"></div>
                    )}
                  </div>

                  {selectedFolder.description && selectedFolder.description.length > 200 && (
                    <button
                      onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                      className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest group"
                    >
                      {isSummaryExpanded ? (
                        <>Ver menos <ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" /></>
                      ) : (
                        <>Desplegar resumen <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" /></>
                      )}
                    </button>
                  )}
                </div>
              </div>     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/10 p-4 rounded-xl border border-slate-200 backdrop-blur-sm">
                  <p className="text-[0.6rem] font-bold text-blue-300 uppercase mb-1">Punto de Dolor</p>
                  <p className="text-sm font-bold truncate">
                    {selectedFolder.aiInfo?.punto_de_dolor?.titulo || "Analizando..."}
                  </p>
                </div>
                <div className="bg-white/10 p-4 rounded-xl border border-slate-200 backdrop-blur-sm">
                  <p className="text-[0.6rem] font-bold text-emerald-300 uppercase mb-1">Oportunidad</p>
                  <p className="text-sm font-bold truncate">
                    {selectedFolder.aiInfo?.oportunidad?.titulo || "Analizando..."}
                  </p>
                </div>
                <div className="bg-white/10 p-4 rounded-xl border border-slate-200 backdrop-blur-sm">
                  <p className="text-[0.6rem] font-bold text-purple-300 uppercase mb-1">Herramienta</p>
                  <p className="text-sm font-bold truncate">
                    {selectedFolder.aiInfo?.herramienta?.nombre || "Analizando..."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Analysis Section: Focused Vertical Stack */}
          {selectedFolder.aiInfo ? (
            <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">

              {/* 1. PAIN POINT */}
              {selectedFolder.aiInfo.punto_de_dolor && (
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden animate-fade-in-up">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-rose-50 rounded-full blur-3xl -mr-24 -mt-24 opacity-60"></div>
                  <div className="flex items-center gap-5 mb-6 relative z-10">
                    <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 shadow-inner">
                      <Activity className="w-7 h-7" />
                    </div>
                    <div>
                      <h5 className="font-bold text-navy-900 text-xl">Análisis del Punto de Dolor</h5>
                      <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Detección de Fricción</p>
                    </div>
                  </div>
                  <p className="text-base text-slate-700 leading-relaxed mb-8 relative z-10 font-medium">
                    {selectedFolder.aiInfo.punto_de_dolor.descripcion}
                  </p>
                  <div className="flex flex-wrap gap-2 relative z-10">
                    {selectedFolder.aiInfo.punto_de_dolor.emociones_probables.map((emo, i) => (
                      <span key={i} className="text-xs bg-rose-50 px-4 py-1.5 rounded-full text-rose-700 font-bold uppercase tracking-widest border border-rose-100/50">
                        #{emo}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. OPPORTUNITY */}
              {selectedFolder.aiInfo.oportunidad && (
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden animate-fade-in-up delay-75">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-full blur-3xl -mr-24 -mt-24 opacity-60"></div>
                  <div className="flex items-center gap-5 mb-6 relative z-10">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
                      <Zap className="w-7 h-7" />
                    </div>
                    <div>
                      <h5 className="font-bold text-navy-900 text-xl">Nueva Oportunidad Estratégica</h5>
                      <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Potencial de Transformación</p>
                    </div>
                  </div>
                  <p className="text-base text-slate-700 leading-relaxed mb-8 relative z-10 font-medium">
                    {selectedFolder.aiInfo.oportunidad.descripcion}
                  </p>
                  <div className="p-6 bg-emerald-50/50 rounded-[2rem] border border-emerald-100 relative z-10 flex gap-4 items-center">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                      <Sparkles className="w-6 h-6 text-emerald-500" />
                    </div>
                    <p className="text-sm text-emerald-900 italic font-bold leading-relaxed">
                      "{selectedFolder.aiInfo.oportunidad.nuevo_enfoque}"
                    </p>
                  </div>
                </div>
              )}

              {/* 3. ACTION HERO (Full Focus) */}
              {selectedFolder.aiInfo.herramienta && (
                <div className="flex flex-col bg-white p-10 rounded-[3rem] border-2 border-blue-100 shadow-2xl shadow-blue-50/50 relative overflow-hidden group animate-fade-in-up delay-150">
                  <div className="absolute -top-12 -right-12 w-80 h-80 bg-blue-50 rounded-full blur-[100px] opacity-40 group-hover:bg-blue-100 transition-colors"></div>

                  <div className="flex items-start justify-between mb-10 relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-slate-900 shadow-2xl shadow-blue-200">
                        <ListTodo className="w-10 h-10" />
                      </div>
                      <div>
                        <h4 className="font-bold text-navy-900 text-3xl leading-tight">
                          {selectedFolder.aiInfo.herramienta.nombre}
                        </h4>
                        <p className="text-base text-slate-500 font-medium mt-1">Hoja de Ruta de Implementación</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-lg text-slate-600 mb-12 relative z-10 leading-relaxed font-medium max-w-4xl">
                    {selectedFolder.aiInfo.herramienta.descripcion}
                  </p>

                  <div className="flex flex-col gap-6 mb-12 relative z-10 pl-4">
                    {/* Vertical connecting line */}
                    <div className="absolute left-10 top-10 bottom-10 w-0.5 bg-blue-100 hidden sm:block"></div>

                    {selectedFolder.aiInfo.herramienta.pasos_practicos.map((step, idx) => (
                      <div
                        key={idx}
                        className={clsx(
                          "flex items-start gap-6 p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer relative z-10",
                          checkedItems.includes(idx)
                            ? "bg-emerald-50 border-emerald-200 shadow-sm"
                            : "bg-slate-50 border-slate-50 hover:bg-white hover:border-blue-200 hover:shadow-xl"
                        )}
                        onClick={() => toggleItem(idx)}
                      >
                        {/* Step Number Circle */}
                        <div className={clsx(
                          "w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center font-bold text-lg shadow-sm transition-all",
                          checkedItems.includes(idx) ? "bg-emerald-500 text-slate-900" : "bg-white text-blue-600 border border-blue-100"
                        )}>
                          {idx + 1}
                        </div>

                        <div className="flex-1 pt-1">
                          <p className={clsx("text-lg font-bold leading-tight mb-1", checkedItems.includes(idx) ? "text-emerald-900" : "text-navy-900")}>
                            {step}
                          </p>
                          <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Paso en ejecución</p>
                        </div>

                        <div className={clsx(
                          "w-8 h-8 rounded-full border-2 shrink-0 flex items-center justify-center transition-all mt-2",
                          checkedItems.includes(idx) ? "bg-emerald-100 border-emerald-500 text-emerald-600" : "bg-white border-slate-200 text-transparent"
                        )}>
                          <CheckCircle className="w-5 h-5" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-8 bg-slate-50 rounded-[2.5rem] text-slate-900 shadow-2xl relative z-10 flex items-center gap-8 border border-slate-200 overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl"></div>
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 relative z-10">
                      <Sparkles className="w-8 h-8 text-blue-300" />
                    </div>
                    <div className="relative z-10">
                      <p className="text-xs font-bold text-blue-300 uppercase tracking-[0.3em] mb-2">Recomendación Estratégica NSG</p>
                      <p className="text-lg font-medium leading-relaxed italic opacity-90 pr-10">
                        "{selectedFolder.aiInfo.herramienta.recomendacion_de_uso}"
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            // WAITING FOR API RESPONSE STATE
            <div className="w-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/50 gap-6 text-center shadow-inner">
              <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center animate-pulse">
                <Sparkles className="w-10 h-10 text-blue-400" />
              </div>
              <div className="max-w-md">
                <h5 className="text-2xl font-bold text-navy-900 mb-2">Análisis Profundo en Proceso</h5>
                <p className="text-slate-500 leading-relaxed font-medium">
                  Generando estrategias tácticas, identificación de puntos de dolor y planes de acción personalizados con nuestro Context Engine...
                </p>
              </div>
              <button
                onClick={handleGenerateAnalysis}
                disabled={isAnalyzing}
                className={clsx(
                  "mt-2 px-10 py-4 bg-white border border-slate-200 rounded-2xl text-lg font-bold text-blue-600 transition-all shadow-xl hover:-translate-y-1",
                  isAnalyzing ? "opacity-70 cursor-wait bg-slate-50" : "hover:bg-blue-50 cursor-pointer hover:shadow-blue-100/50"
                )}
              >
                {isAnalyzing ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generando Análisis Maestro...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 fill-current" />
                    Generar Análisis Ahora
                  </div>
                )}
              </button>
            </div>
          )}
        </div>

      </div>

      {/* --- TRANSCRIPTION SIDE DRAWER --- */}
      {showTranscription && (
        <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-300">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-50/40 backdrop-blur-sm"
            onClick={() => setShowTranscription(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center shrink-0 bg-white shadow-sm">
              <div>
                <h4 className="font-display font-bold text-xl text-navy-900 flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><FileText className="w-6 h-6" /></div>
                  Transcripción de la Sesión
                </h4>
                <p className="text-xs text-slate-400 mt-1 font-medium">Registro detallado de la conversación</p>
              </div>
              <button
                onClick={() => setShowTranscription(false)}
                className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-navy-900 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Smart Search Bar */}
            <div className="px-8 py-4 bg-slate-50 border-b border-slate-100 relative z-10">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Buscar en la conversación..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Content Swiper / Scroll area */}
            <div className="flex-1 overflow-y-auto custom-scroll p-8 space-y-8 bg-slate-50/20">
              {selectedFolder.transcripts?.filter(i =>
                i.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                i.speakerName.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((item, index) => {
                const isMe = item.isUser;
                const safeColors = [
                  "bg-[#1976d2]", "bg-[#388e3c]", "bg-[#f57c00]", "bg-[#d32f2f]",
                  "bg-[#7b1fa2]", "bg-[#00796b]", "bg-[#512da8]", "bg-[#c2185b]"
                ];
                const getSpeakerColor = (name: string) => {
                  let hash = 0;
                  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
                  return safeColors[Math.abs(hash) % safeColors.length];
                };
                const avatarColor = getSpeakerColor(item.speakerName);

                return (
                  <div key={index} className={`flex w-full gap-4 ${isMe ? 'flex-row-reverse' : 'flex-row'} mb-4 animate-fade-in-up`}>
                    <div className={`
                            w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 
                            select-none text-slate-900 shadow-md
                            ${isMe ? 'bg-white' : avatarColor}
                        `}>
                      {item.speakerName.substring(0, 1).toUpperCase()}
                    </div>

                    <div className={`
                           group relative max-w-[85%] px-5 py-4 shadow-sm transition-all duration-300
                           ${isMe
                        ? 'bg-white text-slate-900 rounded-2xl rounded-tr-none'
                        : 'bg-white text-slate-800 rounded-2xl rounded-tl-none border border-slate-200'
                      }
                        `}>
                      {!isMe && (
                        <div className="mb-2 flex items-center justify-between gap-4 border-b border-slate-100 pb-1.5 grayscale opacity-70">
                          <span className="text-[10px] font-bold text-navy-900 uppercase tracking-wider">
                            {item.speakerName}
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium">{item.time}</span>
                        </div>
                      )}
                      <p className={`
                                text-sm leading-relaxed whitespace-pre-wrap font-medium
                                ${isMe ? 'text-blue-50' : 'text-slate-600'}
                            `}>
                        {item.text}
                      </p>
                      {isMe && (
                        <div className="text-[9px] mt-2 flex justify-end text-blue-300/60 font-medium italic">
                          {item.time}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {!selectedFolder.transcripts?.length && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-6 mt-12 opacity-60">
                  <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                    <FileText className="w-10 h-10 text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-500">Sin transcripción disponible</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-white text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                Análisis impulsado por NSG Context Engine
              </p>
            </div>
          </div>
        </div>
      )}

      <FathomTokenModal
        isOpen={showFathomModal}
        onClose={() => setShowFathomModal(false)}
        onConnect={handleConnectFathom}
      />
    </div>
  );
}
