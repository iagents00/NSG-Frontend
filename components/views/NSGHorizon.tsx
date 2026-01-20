"use client";

import { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import api from "@/lib/api";
import { useToast } from "@/components/ui/ToastProvider";
import FathomTokenModal from "@/components/features/FathomTokenModal";
import {
    Activity,
    ChevronRight,
    CheckCircle,
    Trash2,
    X,
    Search,
    ChevronDown,
    ChevronUp,
    Mic,
    Music,
    UploadCloud,
    Headphones,
    Clock,
    DownloadCloud,
    FolderOpen,
    Timer,
    FileText,
    Cpu,
    Folder,
    ArrowLeft,
    Loader2,
    Layers,
    Calendar,
    Play,
    FileCheck,
    FileType,
    ListTodo,
} from "lucide-react";
import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AtomEffect from "@/components/ui/AtomEffect";
import BrandAtom from "@/components/ui/BrandAtom";
import { SkeletonCard } from "@/components/ui/Skeleton";

// --- Types ---
interface TranscriptItem {
    speakerName: string;
    time: string;
    text: string;
    isUser?: boolean;
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
    date: string; // Formatted DD-MM-YYYY
    timeStr: string; // Formatted HH:mm
    shareUrl: string;
    type: string;
    insights: number;
    transcripts?: TranscriptItem[];
    aiInfo?: AIInfo;
    source?: "fathom" | "manual"; // Distinguished source
}

interface ManualRecording {
    id: string;
    title: string;
    fullContent?: string;
    date: string;
    type: string;
    size: string;
}

export default function NSGHorizon() {
    const { userId } = useAppStore();
    const { showToast } = useToast();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // State
    const [folders, setFolders] = useState<MeetingFolder[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<MeetingFolder | null>(
        null,
    );
    const [isFathomLoading, setIsFathomLoading] = useState(false);
    const [checkedItems, setCheckedItems] = useState<number[]>([]);
    const [showFathomModal, setShowFathomModal] = useState(false);

    // Initialize from localStorage for instant feedback
    const [isConnected, setIsConnected] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("fathom_connected") === "true";
        }
        return false;
    });

    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const [fathomToken, setFathomToken] = useState<string | null>(null);
    const [showTranscription, setShowTranscription] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [activeTab, setActiveTab] = useState<"fathom" | "manual">("manual");
    const [manualInputType, setManualInputType] = useState<"audio" | "text">(
        "text",
    );
    const [manualTextContent, setManualTextContent] = useState("");
    const [manualRecordings, setManualRecordings] = useState<ManualRecording[]>(
        [],
    ); // New state for audio files
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Check initial connection from backend
    useEffect(() => {
        const checkFathomConnection = async () => {
            try {
                const response = await api.get("/fathom/status");

                if (response.status === 200) {
                    if (response.data.connected) {
                        setIsConnected(true);
                        setFathomToken("***");
                        localStorage.setItem("fathom_connected", "true");
                    } else {
                        // If server says disconnected but local said connected, fix it
                        if (
                            localStorage.getItem("fathom_connected") === "true"
                        ) {
                            setIsConnected(false);
                            localStorage.removeItem("fathom_connected");
                        }
                    }
                }
            } catch (error) {
                console.error("Error checking Fathom connection:", error);
                // Don't necessarily disconnect on error, could be network blip,
                // but if it persists the user will see error elsewhere
            }
        };

        checkFathomConnection();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleConnectFathom = () => {
        // Token is already saved in backend by the modal
        setFathomToken("***"); // Don't store actual token
        setIsConnected(true);
        setShowFathomModal(false);
        showToast("Fathom conectado exitosamente", "success");
    };

    const handleDisconnectFathom = async () => {
        // Confirmation dialog
        if (
            !confirm(
                "¿Estás seguro de que deseas desvincular Fathom Analytics? Se eliminarán todos los datos sincronizados.",
            )
        ) {
            return;
        }

        try {
            const response = await api.delete("/fathom/token");

            if (response.status === 200 || response.status === 204) {
                setFathomToken(null);
                setIsConnected(false);
                localStorage.removeItem("fathom_connected"); // Clear Cache
                setFolders([]); // Limpiar las sesiones de la interfaz
                setSelectedFolder(null); // Cerrar la vista de detalle si estaba abierta
                showToast("Fathom desconectado y datos limpiados", "info");
            } else {
                showToast("Error desconectando Fathom", "error");
            }
        } catch (error) {
            console.error("Error disconnecting Fathom:", error);
            showToast("Error desconectando Fathom", "error");
        }
    };

    // Fetch Data on Mount
    useEffect(() => {
        const fetchHorizonData = async () => {
            // Si no estamos conectados, no intentamos cargar datos de Fathom
            if (!isConnected) {
                setIsFathomLoading(false);
                setFolders([]);
                return;
            }

            try {
                setIsFathomLoading(true);
                const response = await api.get("/fathom/meetings");

                if (response.status !== 200) {
                    throw new Error(`Failed to fetch data: ${response.status}`);
                }

                const jsonResponse = response.data;

                // Helper to format date and time
                const formatDateTime = (isoString: string) => {
                    if (!isoString) return { date: "N/A", time: "N/A" };
                    try {
                        const dateObj = new Date(isoString);
                        // DD-MM-YYYY
                        const day = String(dateObj.getDate()).padStart(2, "0");
                        const month = String(dateObj.getMonth() + 1).padStart(
                            2,
                            "0",
                        );
                        const year = dateObj.getFullYear();

                        // HH:mm
                        const hours = String(dateObj.getHours()).padStart(
                            2,
                            "0",
                        );
                        const minutes = String(dateObj.getMinutes()).padStart(
                            2,
                            "0",
                        );

                        return {
                            date: `${day}-${month}-${year}`,
                            time: `${hours}:${minutes}`,
                        };
                    } catch (error) {
                        console.error("Date formatting error:", error);
                        return { date: isoString, time: "" };
                    }
                };

                // Parse logic based on user structure: [0: { meetings: [...] }]
                let meetingsArray: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any

                // Check if root is array and has meetings in first element
                if (
                    Array.isArray(jsonResponse) &&
                    jsonResponse.length > 0 &&
                    jsonResponse[0].meetings
                ) {
                    meetingsArray = jsonResponse[0].meetings;
                }
                // Fallback or other structures
                else if (
                    jsonResponse.data &&
                    Array.isArray(jsonResponse.data)
                ) {
                    meetingsArray = jsonResponse.data;
                }

                const mappedFolders: MeetingFolder[] = meetingsArray.map(
                    (item: any, index: number) => {
                        // eslint-disable-line @typescript-eslint/no-explicit-any
                        // Handle structure where item itself might be the meeting or it wraps meeting_data
                        const mData = item.meeting_data || item;
                        const tList = item.transcription_list || [];

                        const formatted = formatDateTime(mData.created_at);

                        return {
                            id: mData.recording_id || `meeting-${index}`,
                            title:
                                mData.title ||
                                mData.meeting_title ||
                                "Nueva Sesión",
                            description:
                                mData.default_summary || "Sesión registrada.",
                            date: formatted.date,
                            timeStr: formatted.time,
                            shareUrl: mData.share_url || "#",
                            type: "Reunión", // Could derive from other fields if available
                            insights: 0, // Placeholder or calculate

                            // Map Transcripts
                            transcripts: Array.isArray(tList)
                                ? tList.map((t: any) => ({
                                      // eslint-disable-line @typescript-eslint/no-explicit-any
                                      speakerName:
                                          t.speaker?.display_name ||
                                          "Desconocido",
                                      time: t.timestamp || "",
                                      text: t.text || "",
                                      // Robust check: Look at root OR inside speaker object
                                      isUser: !!(
                                          t.matched_calendar_invitee_email ||
                                          t.speaker
                                              ?.matched_calendar_invitee_email
                                      ),
                                  }))
                                : [],

                            // Map AI Info (Attempt to retrieve from backend)
                            aiInfo: item.ai_analysis || undefined,
                        };
                    },
                );

                setFolders(mappedFolders);
            } catch (error) {
                console.error("Error fetching horizon data:", error);
                showToast("Error cargando datos de Horizon", "error");
            } finally {
                setIsFathomLoading(false);
            }
        };

        fetchHorizonData();
    }, [userId, isConnected, showToast]);

    // Fetch Manual Transcriptions
    useEffect(() => {
        const fetchTranscriptions = async () => {
            if (!userId) return;

            try {
                const response = await api.get(
                    `/transcriptions/transcription/user/${userId}`,
                );
                if (response.status === 200) {
                    const mapped = response.data.map((t: any) => ({
                        // eslint-disable-line @typescript-eslint/no-explicit-any
                        id: t._id,
                        title:
                            t.content.length > 30
                                ? t.content.substring(0, 30) + "..."
                                : t.content,
                        fullContent: t.content, // Store full content for detail view
                        date: new Date(t.createdAt).toLocaleDateString(),
                        type: t.type || "text",
                        size: (t.content.length / 1000).toFixed(1) + "k chars",
                    }));
                    // Set ONLY the data from user_transcriptions
                    setManualRecordings(mapped);
                }
            } catch (e) {
                console.error("Error fetching transcriptions:", e);
            }
        };

        fetchTranscriptions();
    }, [userId, activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleGenerateAnalysis = async () => {
        if (!selectedFolder || isAnalyzing) return;

        try {
            setIsAnalyzing(true);
            showToast(
                "Generando análisis profundo. Esto puede tardar unos segundos...",
                "info",
            );

            let response;
            if (selectedFolder.source === "manual") {
                response = await api.post("/transcriptions/generate-analysis", {
                    transcription_id: selectedFolder.id,
                });
            } else {
                response = await api.post("/fathom/generate-analysis", {
                    recording_id: selectedFolder.id,
                });
            }

            if (response.status !== 200 && response.status !== 201) {
                throw new Error(`Error en el servidor: ${response.status}`);
            }

            const data = response.data;

            if (data.success) {
                showToast(
                    "¡Análisis generado con éxito! Cargando resultados...",
                    "success",
                );

                // Forzar una recarga del análisis ahora que sabemos que existe
                let analysisResponse;
                if (selectedFolder.source === "manual") {
                    analysisResponse = await api.get(
                        `/transcriptions/analysis/${selectedFolder.id}`,
                    );
                } else {
                    analysisResponse = await api.get(
                        `/fathom/analysis/${selectedFolder.id}`,
                    );
                }

                if (analysisResponse.status === 200) {
                    const analysisData = analysisResponse.data;
                    if (analysisData.success && analysisData.analysis) {
                        const updatedFolder = {
                            ...selectedFolder,
                            aiInfo:
                                analysisData.analysis.ai_analysis ||
                                analysisData.analysis,
                        };
                        setSelectedFolder(updatedFolder);
                        setFolders((prev) =>
                            prev.map((f) =>
                                f.id === updatedFolder.id ? updatedFolder : f,
                            ),
                        );
                    }
                }
            }
        } catch (error) {
            console.error("Error generating analysis:", error);
            showToast(
                "Error al generar el análisis. Inténtalo de nuevo.",
                "error",
            );
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
                let response;
                if (selectedFolder.source === "manual") {
                    response = await api.get(
                        `/transcriptions/analysis/${selectedFolder.id}`,
                    );
                } else {
                    response = await api.get(
                        `/fathom/analysis/${selectedFolder.id}`,
                    );
                }

                if (response.status === 200) {
                    const data = response.data;
                    if (data.success) {
                        if (data.analysis && !selectedFolder.aiInfo) {
                            const updatedFolder: MeetingFolder = {
                                ...selectedFolder,
                                aiInfo:
                                    data.analysis.ai_analysis || data.analysis,
                            };
                            setSelectedFolder(updatedFolder);
                            setFolders((prev) =>
                                prev.map((f) =>
                                    f.id === updatedFolder.id
                                        ? updatedFolder
                                        : f,
                                ),
                            );
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
    }, [selectedFolder?.id, selectedFolder?.source]); // eslint-disable-line react-hooks/exhaustive-deps

    // Scroll to top when folder changes
    useEffect(() => {
        if (selectedFolder) {
            window.scrollTo(0, 0);
            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTop = 0;
            }
        }
    }, [selectedFolder?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    const toggleItem = async (id: number) => {
        if (!selectedFolder) return;

        const newCheckedItems = checkedItems.includes(id)
            ? checkedItems.filter((i) => i !== id)
            : [...checkedItems, id];

        setCheckedItems(newCheckedItems);

        // Save to backend
        try {
            if (selectedFolder.source === "manual") {
                await api.put(
                    `/transcriptions/analysis/${selectedFolder.id}/steps`,
                    {
                        checked_steps: newCheckedItems,
                    },
                );
            } else {
                await api.put(`/fathom/analysis/${selectedFolder.id}/steps`, {
                    checked_steps: newCheckedItems,
                });
            }
            showToast("Progreso guardado", "success");
        } catch (error) {
            console.error("Error saving progress:", error);
        }
    };

    // --- VIEW: LIST (Fathom or Manual) ---
    if (!selectedFolder) {
        const lastSync = new Date().toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
        });

        return (
            <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-fade-in-up pb-10 px-2 xs:px-4 sm:px-6">
                {/* Dark Header Banner - Clarity Style */}
                <div className="relative overflow-hidden bg-linear-to-r from-navy-950 via-navy-900 to-navy-950 px-4 py-5 xs:px-5 sm:px-8 sm:py-6 rounded-2xl xs:rounded-3xl border border-navy-800/50 shadow-xl">
                    <div className="relative z-10">
                        <h2 className="font-display font-bold text-2xl lg:text-3xl tracking-tight">
                            <span className="text-white">Diseño de </span>
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-500">
                                NSG Horizon
                            </span>
                        </h2>
                        <p className="text-slate-300 text-sm mt-2 max-w-3xl leading-relaxed">
                            Planificación neuronal activa diseñada para la
                            precisión máxima y el alto rendimiento continuo.
                            Protocolo de proyección estratégica ejecutándose.
                        </p>
                    </div>
                </div>

                {/* TAB NAVIGATION - Clarity Style */}
                <div className="flex p-1 bg-slate-50 rounded-xl w-full max-w-md shadow-inner border border-slate-100">
                    <button
                        onClick={() => setActiveTab("fathom")}
                        className={clsx(
                            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                            activeTab === "fathom"
                                ? "bg-white text-blue-600 shadow-sm scale-105"
                                : "text-slate-400 hover:text-gray-700 hover:bg-white/50",
                        )}
                    >
                        <Activity className="w-3.5 h-3.5" />
                        Fathom Sync
                    </button>
                    <button
                        onClick={() => setActiveTab("manual")}
                        className={clsx(
                            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                            activeTab === "manual"
                                ? "bg-white text-blue-600 shadow-sm scale-105"
                                : "text-slate-400 hover:text-gray-700 hover:bg-white/50",
                        )}
                    >
                        <Mic className="w-3.5 h-3.5" />
                        Neural Studio
                    </button>
                </div>

                {activeTab === "fathom" ? (
                    /* FATHOM TAB CONTENT */
                    <div className="flex flex-col gap-8 animate-fade-in">
                        {/* HERO: JOIN FATHOM - Compact */}
                        {!isConnected && (
                            <div className="w-full bg-linear-to-r from-navy-900 via-navy-800 to-blue-900 rounded-3xl xs:rounded-4xl p-5 xs:p-8 sm:p-10 text-white relative overflow-hidden shadow-xl border border-navy-700/50">
                                {/* Decorational Elements */}
                                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="space-y-4 max-w-2xl text-center md:text-left">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
                                            <Activity className="w-3 h-3 fill-current" />
                                            Potenciado por AI
                                        </div>
                                        <h2 className="text-3xl sm:text-4xl font-display font-bold leading-tight">
                                            Conecta tus reuniones con{" "}
                                            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-200 to-white">
                                                Fathom
                                            </span>
                                        </h2>
                                        <p className="text-blue-100/80 text-base leading-relaxed max-w-xl mx-auto md:mx-0">
                                            Sincroniza automáticamente tus
                                            grabaciones. Analizamos cada detalle
                                            para generar insights estratégicos
                                            al instante.
                                        </p>
                                        <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                            <button
                                                onClick={() =>
                                                    setShowFathomModal(true)
                                                }
                                                className="px-8 py-4 rounded-2xl font-bold transition transform hover:-translate-y-0.5 shadow-lg flex items-center gap-3 group bg-white text-navy-900 hover:bg-blue-50 shadow-black/10 cursor-pointer"
                                            >
                                                <div className="w-6 h-6 bg-linear-to-tr from-orange-400 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                                                    <Activity className="w-4 h-4" />
                                                </div>
                                                Conectar Fathom
                                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
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
                        )}

                        {/* Connection Status Banner */}
                        {isConnected && fathomToken && (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 xs:p-5 bg-emerald-50 border border-emerald-200 rounded-2xl xs:rounded-3xl shadow-sm transition-all">
                                <div className="flex items-center gap-3 xs:gap-4 w-full sm:w-auto">
                                    <div className="w-10 h-10 xs:w-12 xs:h-12 bg-emerald-500 rounded-xl xs:rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200/50 shrink-0">
                                        <CheckCircle className="w-5 h-5 xs:w-6 xs:h-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm xs:text-base font-bold text-emerald-900 leading-tight">
                                            Conectado a Fathom Analytics
                                        </p>
                                        <p className="text-[11px] xs:text-sm text-emerald-600 leading-relaxed mt-0.5">
                                            Sincronización activa • Actualizado:{" "}
                                            {lastSync}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleDisconnectFathom}
                                    className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-white border border-red-200 rounded-xl text-red-600 text-xs xs:text-sm font-bold hover:bg-red-50 transition flex items-center justify-center gap-2 shadow-sm shrink-0 active:scale-95"
                                    title="Desconectar y eliminar API key"
                                >
                                    <Trash2 className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                                    Desconectar
                                </button>
                            </div>
                        )}

                        {/* FATHOM FOLDERS GRID */}
                        <div className="flex flex-col gap-4 flex-1 min-h-0">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                                    <Folder className="w-4 h-4 text-blue-600" />
                                    Sesiones Sincronizadas
                                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold">
                                        {folders.length}
                                    </span>
                                </h3>
                            </div>

                            {isFathomLoading ? (
                                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 xs:gap-4">
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <SkeletonCard key={i} />
                                    ))}
                                </div>
                            ) : folders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/30">
                                    <Folder className="w-12 h-12 mb-3 opacity-30" />
                                    <p className="font-bold text-base text-slate-600 mb-1">
                                        No hay grabaciones disponibles
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Conecta Fathom para sincronizar tus
                                        reuniones
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 xs:gap-4 pb-20">
                                    {folders.map((folder, index) => {
                                        const hasAnalysis = !!folder.aiInfo;
                                        const animationDelay = `${index * 50}ms`;

                                        return (
                                            <div
                                                key={folder.id}
                                                onClick={() =>
                                                    setSelectedFolder(folder)
                                                }
                                                style={{ animationDelay }}
                                                className="bg-white rounded-2xl xs:rounded-3xl p-4 xs:p-5 sm:p-6 border border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer group flex flex-col h-full animate-fade-in-up relative overflow-hidden min-h-[170px]"
                                            >
                                                {/* Status Badge */}
                                                {hasAnalysis && (
                                                    <div className="absolute top-3 xs:top-4 right-3 xs:right-4">
                                                        <div className="px-1.5 xs:px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[9px] xs:text-[10px] font-black uppercase flex items-center gap-1">
                                                            <BrandAtom
                                                                className="w-2.5 h-2.5 xs:w-3 xs:h-3"
                                                                variant="colored"
                                                            />
                                                            AI
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex justify-between items-start mb-3 xs:mb-4">
                                                    <div className="w-12 h-12 xs:w-14 xs:h-14 rounded-2xl bg-linear-to-br from-blue-50 to-indigo-50 text-blue-600 flex items-center justify-center group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition-all duration-300 shadow-md group-hover:shadow-lg group-hover:scale-110">
                                                        <Headphones className="w-6 h-6 xs:w-7 xs:h-7" />
                                                    </div>
                                                </div>

                                                <h4 className="font-bold text-navy-900 text-base xs:text-lg mb-2 group-hover:text-blue-600 transition line-clamp-2">
                                                    {folder.title}
                                                </h4>

                                                <p className="text-xs xs:text-sm text-slate-500 mb-3 xs:mb-4 line-clamp-2 flex-1 font-medium leading-relaxed">
                                                    {folder.description}
                                                </p>

                                                <div className="pt-3 xs:pt-4 border-t border-slate-100 space-y-2 xs:space-y-3">
                                                    {/* Progress indicator */}
                                                    {hasAnalysis && (
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-linear-to-r from-blue-500 to-indigo-600 rounded-full"
                                                                    style={{
                                                                        width: "75%",
                                                                    }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-[9px] xs:text-[10px] font-bold text-slate-500">
                                                                75%
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between text-[10px] xs:text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                        <span className="flex items-center gap-1 xs:gap-1.5">
                                                            <Calendar className="w-3 h-3 xs:w-3.5 xs:h-3.5" />
                                                            {folder.date}
                                                        </span>
                                                        <span className="flex items-center gap-1 xs:gap-1.5 text-blue-600 font-bold">
                                                            <Clock className="w-3 h-3 xs:w-3.5 xs:h-3.5" />
                                                            {folder.timeStr}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Hover indicator */}
                                                <div className="absolute bottom-0 left-0 h-1 w-0 bg-linear-to-r from-blue-500 via-blue-600 to-blue-700 group-hover:w-full transition-all duration-700 ease-in-out rounded-b-3xl"></div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* NEURAL STUDIO TAB CONTENT */
                    <div className="flex flex-col gap-6 animate-fade-in">
                        {/* Step-by-Step Guide */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                                        1
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-navy-900 mb-1">
                                            Selecciona Tipo
                                        </h4>
                                        <p className="text-xs text-slate-500">
                                            Audio o transcripción de texto
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                                        2
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-navy-900 mb-1">
                                            Sube tu Contenido
                                        </h4>
                                        <p className="text-xs text-slate-500">
                                            Haz clic o arrastra archivos
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                                        3
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-navy-900 mb-1">
                                            Recibe Análisis
                                        </h4>
                                        <p className="text-xs text-slate-500">
                                            Insights estratégicos al instante
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Upload Area */}
                        <div className="bg-white rounded-3xl p-4 xs:p-6 sm:p-8 border border-slate-200 shadow-sm">
                            <div className="flex flex-col lg:flex-row gap-8">
                                {/* Left: Instructions & Mode */}
                                <div className="flex-1 space-y-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100">
                                                <Mic className="w-4 h-4 text-blue-600" />
                                                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                                                    Neural Studio
                                                </span>
                                            </div>
                                        </div>

                                        <h3 className="text-2xl font-display font-bold text-navy-900 mb-2">
                                            Análisis Manual de Contenido
                                        </h3>
                                        <p className="text-slate-600 leading-relaxed">
                                            Procesa tus grabaciones de audio o
                                            transcripciones de texto para
                                            obtener insights estratégicos
                                            impulsados por IA.
                                        </p>
                                    </div>

                                    {/* MODE SWITCHER - More Prominent */}
                                    <div>
                                        <label className="text-sm font-bold text-slate-700 mb-3 block">
                                            Paso 1: Selecciona el tipo de
                                            contenido
                                        </label>
                                        <div className="flex p-1.5 bg-slate-50 rounded-xl border border-slate-200">
                                            <button
                                                onClick={() =>
                                                    setManualInputType("audio")
                                                }
                                                className={clsx(
                                                    "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold transition-all",
                                                    manualInputType === "audio"
                                                        ? "bg-white text-blue-600 shadow-md"
                                                        : "text-slate-500 hover:text-slate-700",
                                                )}
                                            >
                                                <Mic className="w-4 h-4" />
                                                Archivo de Audio
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setManualInputType("text")
                                                }
                                                className={clsx(
                                                    "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold transition-all",
                                                    manualInputType === "text"
                                                        ? "bg-white text-blue-600 shadow-md"
                                                        : "text-slate-500 hover:text-slate-700",
                                                )}
                                            >
                                                <FileText className="w-4 h-4" />
                                                Transcripción de Texto
                                            </button>
                                        </div>
                                    </div>

                                    {/* File Type Info */}
                                    <div className="flex flex-wrap gap-2">
                                        {manualInputType === "audio" ? (
                                            <>
                                                <div className="px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                                                    <p className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                                                        <FolderOpen className="w-3.5 h-3.5" />
                                                        Formatos: MP3, WAV, M4A
                                                    </p>
                                                </div>
                                                <div className="px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                                                    <p className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                                                        <Timer className="w-3.5 h-3.5" />
                                                        Duración: Hasta 2 horas
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                                                    <p className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                                                        <FileType className="w-3.5 h-3.5" />
                                                        Sin límite de caracteres
                                                    </p>
                                                </div>
                                                <div className="px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                                                    <p className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                                                        <Activity className="w-3.5 h-3.5" />
                                                        Análisis instantáneo
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Right: Upload Area */}
                                <div className="lg:w-[450px]">
                                    <label className="text-sm font-bold text-slate-700 mb-3 block">
                                        Paso 2:{" "}
                                        {manualInputType === "audio"
                                            ? "Sube tu archivo de audio"
                                            : "Escribe o pega tu texto"}
                                    </label>

                                    {manualInputType === "audio" ? (
                                        <div
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                            className={clsx(
                                                "relative border-3 border-dashed rounded-2xl p-12 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-4 text-center min-h-[340px]",
                                                selectedFile
                                                    ? "bg-blue-50 border-blue-500 shadow-lg"
                                                    : "bg-slate-50 border-slate-300 hover:border-blue-400 hover:bg-blue-50/30 hover:shadow-xl",
                                            )}
                                        >
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept="audio/*"
                                                onChange={(e) =>
                                                    setSelectedFile(
                                                        e.target.files?.[0] ||
                                                            null,
                                                    )
                                                }
                                            />

                                            {selectedFile ? (
                                                <>
                                                    <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                                        <Headphones className="w-10 h-10" />
                                                    </div>
                                                    <div>
                                                        <p className="text-navy-900 font-bold text-lg mb-1">
                                                            {selectedFile.name}
                                                        </p>
                                                        <p className="text-blue-600 text-sm font-bold flex items-center gap-1.5">
                                                            <CheckCircle className="w-4 h-4" />
                                                            Listo para analizar
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-3 mt-4">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedFile(
                                                                    null,
                                                                );
                                                            }}
                                                            className="px-6 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-slate-700 text-sm font-bold hover:bg-slate-50 transition"
                                                        >
                                                            Cambiar archivo
                                                        </button>
                                                        <button
                                                            onClick={async (
                                                                e,
                                                            ) => {
                                                                e.stopPropagation();
                                                                if (
                                                                    !selectedFile
                                                                )
                                                                    return;

                                                                setIsUploading(
                                                                    true,
                                                                );
                                                                try {
                                                                    const formData =
                                                                        new FormData();
                                                                    formData.append(
                                                                        "audio",
                                                                        selectedFile,
                                                                    );
                                                                    formData.append(
                                                                        "userId",
                                                                        userId ||
                                                                            "",
                                                                    );
                                                                    formData.append(
                                                                        "fileName",
                                                                        selectedFile.name,
                                                                    );

                                                                    // Llamamos a nuestro backend en lugar de a n8n directamente
                                                                    const response =
                                                                        await api.post(
                                                                            "/transcriptions/proxy-audio-analysis",
                                                                            formData,
                                                                            {
                                                                                headers:
                                                                                    {
                                                                                        "Content-Type":
                                                                                            "multipart/form-data",
                                                                                    },
                                                                            },
                                                                        );

                                                                    if (
                                                                        response
                                                                            .data
                                                                            .success
                                                                    ) {
                                                                        const savedDoc =
                                                                            response
                                                                                .data
                                                                                .data;
                                                                        setManualRecordings(
                                                                            (
                                                                                prev,
                                                                            ) => [
                                                                                {
                                                                                    id: savedDoc._id,
                                                                                    title:
                                                                                        savedDoc.content.substring(
                                                                                            0,
                                                                                            30,
                                                                                        ) +
                                                                                        "...",
                                                                                    fullContent:
                                                                                        savedDoc.content,
                                                                                    date: new Date(
                                                                                        savedDoc.createdAt,
                                                                                    ).toLocaleDateString(),
                                                                                    type: "audio",
                                                                                    size:
                                                                                        (
                                                                                            savedDoc
                                                                                                .content
                                                                                                .length /
                                                                                            1000
                                                                                        ).toFixed(
                                                                                            1,
                                                                                        ) +
                                                                                        "k chars",
                                                                                },
                                                                                ...prev,
                                                                            ],
                                                                        );

                                                                        showToast(
                                                                            "¡Análisis completado y guardado!",
                                                                            "success",
                                                                        );
                                                                        setSelectedFile(
                                                                            null,
                                                                        );
                                                                    }
                                                                } catch (error) {
                                                                    console.error(
                                                                        "Error enviando audio a n8n:",
                                                                        error,
                                                                    );
                                                                    showToast(
                                                                        "Error al enviar el audio para análisis",
                                                                        "error",
                                                                    );
                                                                } finally {
                                                                    setIsUploading(
                                                                        false,
                                                                    );
                                                                }
                                                            }}
                                                            disabled={
                                                                isUploading ||
                                                                !selectedFile
                                                            }
                                                            className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50"
                                                        >
                                                            {isUploading
                                                                ? "Procesando..."
                                                                : "Comenzar Análisis"}
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-20 h-20 bg-white rounded-4xl flex items-center justify-center text-blue-600 shadow-xl border border-slate-100 group-hover/drop:scale-110 group-hover/drop:rotate-6 transition-all duration-500">
                                                        <UploadCloud className="w-10 h-10" />
                                                    </div>
                                                    <div>
                                                        <p className="text-navy-950 font-bold text-xl">
                                                            Suelta tu audio aquí
                                                        </p>
                                                        <p className="text-slate-400 text-sm mt-1">
                                                            O haz clic para
                                                            explorar tus
                                                            archivos
                                                        </p>
                                                    </div>
                                                    <div className="h-1.5 w-1/2 bg-slate-100 rounded-full overflow-hidden mt-4 relative">
                                                        <AtomEffect className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 opacity-30" />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-4">
                                            <div className="relative group/text">
                                                <textarea
                                                    value={manualTextContent}
                                                    onChange={(e) =>
                                                        setManualTextContent(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Pega aquí el texto de la transcripción..."
                                                    className="w-full h-[220px] p-6 bg-slate-50 border-2 border-slate-100 rounded-4xl focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all resize-none text-navy-950 font-medium placeholder:text-slate-400"
                                                />
                                                <div className="absolute top-4 right-4 opacity-0 group-focus-within/text:opacity-100 transition-opacity">
                                                    <div className="px-2 py-1 bg-blue-600 text-white text-[8px] font-black uppercase rounded shadow-lg">
                                                        Analizador Activo
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    if (
                                                        !manualTextContent.trim()
                                                    ) {
                                                        showToast(
                                                            "Por favor ingresa algún texto",
                                                            "error",
                                                        );
                                                        return;
                                                    }

                                                    if (!userId) {
                                                        showToast(
                                                            "Debes iniciar sesión para guardar transcripciones",
                                                            "error",
                                                        );
                                                        return;
                                                    }

                                                    setIsUploading(true);
                                                    try {
                                                        const response =
                                                            await api.post(
                                                                "/transcriptions/transcription",
                                                                {
                                                                    userId,
                                                                    content:
                                                                        manualTextContent,
                                                                    type: "text",
                                                                },
                                                            );

                                                        if (
                                                            response.status ===
                                                            201
                                                        ) {
                                                            const savedT =
                                                                response.data;
                                                            setManualRecordings(
                                                                (prev) => [
                                                                    {
                                                                        id: savedT._id,
                                                                        title:
                                                                            savedT.content.substring(
                                                                                0,
                                                                                30,
                                                                            ) +
                                                                            "...",
                                                                        date: new Date(
                                                                            savedT.createdAt,
                                                                        ).toLocaleDateString(),
                                                                        type: "text",
                                                                        size:
                                                                            (
                                                                                savedT
                                                                                    .content
                                                                                    .length /
                                                                                1000
                                                                            ).toFixed(
                                                                                1,
                                                                            ) +
                                                                            "k chars",
                                                                    },
                                                                    ...prev,
                                                                ],
                                                            );
                                                            setManualTextContent(
                                                                "",
                                                            );
                                                            showToast(
                                                                "Transcripción guardada exitosamente",
                                                                "success",
                                                            );
                                                        }
                                                    } catch (error) {
                                                        console.error(
                                                            "Error saving transcription:",
                                                            error,
                                                        );
                                                        showToast(
                                                            "Error al procesar la transcripción",
                                                            "error",
                                                        );
                                                    } finally {
                                                        setIsUploading(false);
                                                    }
                                                }}
                                                disabled={
                                                    !manualTextContent.trim() ||
                                                    isUploading
                                                }
                                                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50 disabled:bg-slate-300 disabled:shadow-none flex items-center justify-center gap-3"
                                            >
                                                {isUploading ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        Sintetizando Insights...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Activity className="w-5 h-5" />
                                                        Procesar Transcripción
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* GALLERY LIST */}
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                                    <Layers className="w-5 h-5 text-blue-600" />
                                    Biblioteca de Análisis Manual
                                </h3>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {manualRecordings.length} Elementos
                                </span>
                            </div>

                            {manualRecordings.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-4xl text-slate-400">
                                    <BrandAtom
                                        className="w-12 h-12 mb-4 opacity-30"
                                        variant="colored"
                                    />
                                    <p className="font-medium">
                                        Tu biblioteca está vacía.
                                    </p>
                                    <p className="text-xs">
                                        Sube un audio o pega una transcripción
                                        para comenzar.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {manualRecordings.map((rec) => (
                                        <div
                                            key={rec.id}
                                            onClick={() => {
                                                // Map manual recording to MeetingFolder structure to reuse the Detail View
                                                const manualFolder: MeetingFolder =
                                                    {
                                                        id: rec.id,
                                                        title: "Análisis Manual", // Or rec.title if it wasn't truncated
                                                        description: rec.title, // Use the content snippet as description
                                                        date: rec.date,
                                                        timeStr: "N/A",
                                                        shareUrl: "#",
                                                        type: "Manual",
                                                        insights: 0,
                                                        source: "manual",
                                                        transcripts: [
                                                            {
                                                                speakerName:
                                                                    "Texto Original",
                                                                time: "",
                                                                text:
                                                                    rec.fullContent ||
                                                                    rec.title,
                                                            },
                                                        ],
                                                    };
                                                setSelectedFolder(manualFolder);
                                            }}
                                            className="bg-white p-6 rounded-4xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer"
                                        >
                                            <div className="flex items-center gap-4 mb-4">
                                                <div
                                                    className={clsx(
                                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                                                        rec.type === "audio"
                                                            ? "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                                                            : "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
                                                    )}
                                                >
                                                    {rec.type === "audio" ? (
                                                        <Music className="w-6 h-6" />
                                                    ) : (
                                                        <FileText className="w-6 h-6" />
                                                    )}
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <h4 className="font-bold text-navy-950 truncate">
                                                        {rec.title}
                                                    </h4>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        {rec.date}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-1 bg-slate-50 rounded text-[9px] font-bold text-slate-500 uppercase">
                                                        {rec.size}
                                                    </span>
                                                    <span
                                                        className={clsx(
                                                            "px-2 py-1 rounded text-[9px] font-bold uppercase",
                                                            rec.type === "audio"
                                                                ? "bg-blue-50 text-blue-700"
                                                                : "bg-emerald-50 text-emerald-700",
                                                        )}
                                                    >
                                                        {rec.type}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            if (
                                                                window.confirm(
                                                                    "¿Estás seguro de que deseas eliminar este análisis?",
                                                                )
                                                            ) {
                                                                try {
                                                                    const response =
                                                                        await api.delete(
                                                                            `/transcriptions/transcription/${rec.id}`,
                                                                        );
                                                                    if (
                                                                        response.status ===
                                                                        200
                                                                    ) {
                                                                        setManualRecordings(
                                                                            (
                                                                                prev,
                                                                            ) =>
                                                                                prev.filter(
                                                                                    (
                                                                                        r,
                                                                                    ) =>
                                                                                        r.id !==
                                                                                        rec.id,
                                                                                ),
                                                                        );
                                                                        showToast(
                                                                            "Análisis eliminado correctamente",
                                                                            "success",
                                                                        );
                                                                    }
                                                                } catch (error) {
                                                                    showToast(
                                                                        "Error al eliminar el análisis",
                                                                        "error",
                                                                    );
                                                                }
                                                            }
                                                        }}
                                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-navy-900 transition-colors" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- VIEW: FOLDER DETAIL (Dynamic Data) ---
    return (
        <div
            ref={scrollContainerRef}
            className="flex flex-col h-full gap-4 xs:gap-6 animate-fade-in-up overflow-y-auto px-2 xs:px-4 sm:px-0"
        >
            {/* 1. HEADER */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 xs:p-5 sm:p-6 rounded-2xl sm:rounded-4xl border border-slate-200 shadow-sm shrink-0">
                <div className="flex items-center gap-3 sm:gap-4 w-full lg:w-auto">
                    <button
                        onClick={() => setSelectedFolder(null)}
                        className="w-10 h-10 sm:w-14 sm:h-14 bg-slate-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-navy-900 transition shrink-0"
                    >
                        <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>

                    <div className="w-px h-8 sm:h-10 bg-slate-200 mx-1 sm:mx-2 hidden xs:block"></div>

                    <div className="w-14 h-14 bg-slate-50 rounded-2xl hidden sm:flex items-center justify-center text-slate-900 shrink-0 shadow-lg">
                        <Layers className="w-7 h-7" />
                    </div>
                    <div className="overflow-hidden">
                        <h3 className="font-display font-bold text-lg sm:text-2xl text-navy-900 truncate">
                            {selectedFolder.title}
                        </h3>
                        <p className="text-[0.65rem] sm:text-sm text-slate-500 font-medium flex items-center gap-2 truncate">
                            <Calendar className="w-3 h-3 shrink-0" />{" "}
                            {selectedFolder.date} •{" "}
                            <span className="text-blue-600 font-bold shrink-0">
                                {selectedFolder.type}
                            </span>
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap xs:flex-row gap-2 sm:gap-3 w-full lg:w-auto mt-2 lg:mt-0">
                    <button
                        onClick={() => setShowTranscription(true)}
                        className="px-3 sm:px-6 py-2.5 sm:py-3 bg-slate-50 text-navy-900 text-xs sm:text-sm font-bold rounded-xl hover:bg-slate-100 transition border border-slate-200 flex items-center justify-center gap-2 cursor-pointer no-underline"
                    >
                        <FileText className="w-5 h-5 sm:w-6" />{" "}
                        <span className="hidden md:inline">Ver</span> Transc.
                    </button>
                    <button
                        onClick={() => {
                            if (!selectedFolder.aiInfo) return;
                            const info = selectedFolder.aiInfo;
                            const report =
                                `REPORTE ESTRATÉGICO: ${selectedFolder.title}\n\n` +
                                `FACTOR 1: ${info.punto_de_dolor?.titulo}\n${info.punto_de_dolor?.descripcion}\n\n` +
                                `FACTOR 2: ${info.oportunidad?.titulo}\n${info.oportunidad?.descripcion}\n\n` +
                                `FACTOR 3: ${info.herramienta?.nombre}\n${info.herramienta?.descripcion}`;
                            navigator.clipboard.writeText(report);
                            showToast(
                                "Reporte copiado al portapapeles",
                                "success",
                            );
                        }}
                        disabled={!selectedFolder.aiInfo}
                        className="px-3 sm:px-6 py-2.5 sm:py-3 bg-white text-navy-900 text-xs sm:text-sm font-bold rounded-xl hover:bg-slate-50 transition border border-slate-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        <BrandAtom
                            className="w-4 h-4 text-blue-500"
                            variant="colored"
                        />{" "}
                        <span className="hidden md:inline">Copiar</span> Reporte
                    </button>
                    <a
                        href={selectedFolder.shareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => showToast("Abriendo sesión...", "info")}
                        className="px-3 sm:px-6 py-2.5 sm:py-3 bg-slate-50 text-navy-900 text-xs sm:text-sm font-bold rounded-xl hover:bg-slate-100 transition border border-slate-200 flex items-center justify-center gap-2 cursor-pointer no-underline"
                    >
                        <Play className="w-4 h-4" />{" "}
                        <span className="hidden md:inline">Ver</span> Sesión
                    </a>
                    <button
                        onClick={() => {
                            const text = selectedFolder.transcripts
                                ?.map(
                                    (t) =>
                                        `[${t.time}] ${t.speakerName}: ${t.text}`,
                                )
                                .join("\n");
                            const blob = new Blob([text || ""], {
                                type: "text/plain",
                            });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `Transcripcion_${selectedFolder.title}.txt`;
                            a.click();
                            showToast("Iniciando descarga...", "info");
                        }}
                        className="px-3 sm:px-6 py-2.5 sm:py-3 bg-slate-50 text-navy-900 text-xs sm:text-sm font-bold rounded-xl hover:bg-slate-100 transition border border-slate-200 flex items-center justify-center gap-2 cursor-pointer no-underline"
                    >
                        <DownloadCloud className="w-4 h-4" />{" "}
                        <span className="hidden md:inline">Bajar</span> TXT
                    </button>
                    <button
                        onClick={() =>
                            showToast("Exportando PDF...", "success")
                        }
                        className="flex-1 xs:flex-none px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <FileCheck className="w-4 h-4" />{" "}
                        <span className="hidden md:inline">Exportar</span> PDF
                    </button>
                </div>
            </div>

            {/* 2. MAIN GRID */}
            {/* 2. MAIN LAYOUT: VERTICAL STACK */}
            <div className="flex-1 flex flex-col gap-10 min-h-0 pb-12">
                {/* TOP SECTION: CONTEXT & ACTIONS (Was Right Column) */}
                <div className="flex flex-col gap-6 xs:gap-8 shrink-0">
                    {/* 1. MAIN CONTEXT ENGINE CARD */}
                    <div className="bg-navy-950 text-white rounded-[2.5rem] relative overflow-hidden shadow-2xl shrink-0 animate-fade-in-up border border-white/5">
                        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
                        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
                        <div className="absolute left-0 bottom-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-[80px] pointer-events-none"></div>

                        <div className="relative z-10 p-6 sm:p-10">
                            {/* Header */}
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30 shadow-lg shadow-blue-900/40">
                                    <Cpu className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="font-display font-bold text-xl text-white tracking-tight">
                                        NSG Context Engine
                                    </h4>
                                    <p className="text-[10px] font-black text-blue-400/80 uppercase tracking-[0.2em]">
                                        Neural Strategy Analysis
                                    </p>
                                </div>
                            </div>

                            {/* Summary Box */}
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-3xl mb-8 relative group hover:bg-white/[0.07] transition-all duration-300">
                                <div className="absolute top-0 right-0 p-4 opacity-20">
                                    <BrandAtom
                                        className="w-5 h-5 text-blue-400"
                                        variant="colored"
                                    />
                                </div>
                                <div className="relative">
                                    <div
                                        className={clsx(
                                            "prose prose-invert prose-sm max-w-none transition-all duration-500 ease-in-out overflow-hidden",
                                            !isSummaryExpanded
                                                ? "max-h-24"
                                                : "max-h-[1000px]",
                                        )}
                                    >
                                        <div className="text-slate-200 leading-relaxed font-medium italic">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                            >
                                                {selectedFolder.description ||
                                                    "Sin descripción disponible."}
                                            </ReactMarkdown>
                                        </div>
                                    </div>

                                    {selectedFolder.description &&
                                        selectedFolder.description.length >
                                            200 && (
                                            <button
                                                onClick={() =>
                                                    setIsSummaryExpanded(
                                                        !isSummaryExpanded,
                                                    )
                                                }
                                                className="mt-4 flex items-center gap-2 text-[10px] font-black text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest"
                                            >
                                                {isSummaryExpanded ? (
                                                    <>
                                                        Ver menos{" "}
                                                        <ChevronUp className="w-4 h-4" />
                                                    </>
                                                ) : (
                                                    <>
                                                        Desplegar resumen{" "}
                                                        <ChevronDown className="w-4 h-4" />
                                                    </>
                                                )}
                                            </button>
                                        )}
                                </div>
                            </div>

                            {/* Quick Insights Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-rose-500/10 p-5 rounded-2xl border border-rose-500/20 backdrop-blur-sm group hover:bg-rose-500/15 transition-all">
                                    <p className="text-[10px] font-black text-rose-400 uppercase mb-2 tracking-widest">
                                        Factor 1
                                    </p>
                                    <p className="text-sm font-bold text-white leading-snug">
                                        {selectedFolder.aiInfo?.punto_de_dolor
                                            ?.titulo || "Analizando..."}
                                    </p>
                                </div>
                                <div className="bg-emerald-500/10 p-5 rounded-2xl border border-emerald-500/20 backdrop-blur-sm group hover:bg-emerald-500/15 transition-all">
                                    <p className="text-[10px] font-black text-emerald-400 uppercase mb-2 tracking-widest">
                                        Factor 2
                                    </p>
                                    <p className="text-sm font-bold text-white leading-snug">
                                        {selectedFolder.aiInfo?.oportunidad
                                            ?.titulo || "Analizando..."}
                                    </p>
                                </div>
                                <div className="bg-indigo-500/10 p-5 rounded-2xl border border-indigo-500/20 backdrop-blur-sm group hover:bg-indigo-500/15 transition-all">
                                    <p className="text-[10px] font-black text-indigo-400 uppercase mb-2 tracking-widest">
                                        Factor 3
                                    </p>
                                    <p className="text-sm font-bold text-white leading-snug">
                                        {selectedFolder.aiInfo?.herramienta
                                            ?.nombre || "Analizando..."}
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
                                <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden animate-fade-in-up">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-rose-50 rounded-full blur-3xl -mr-24 -mt-24 opacity-60"></div>
                                    <div className="flex items-center gap-5 mb-6 relative z-10">
                                        <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 shadow-inner">
                                            <Activity className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-navy-900 text-xl">
                                                Análisis del Factor 1
                                            </h5>
                                            <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">
                                                Detección de Fricción
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-base text-slate-700 leading-relaxed mb-8 relative z-10 font-medium">
                                        {
                                            selectedFolder.aiInfo.punto_de_dolor
                                                .descripcion
                                        }
                                    </p>
                                    <div className="flex flex-wrap gap-2 relative z-10">
                                        {selectedFolder.aiInfo.punto_de_dolor.emociones_probables.map(
                                            (emo, i) => (
                                                <span
                                                    key={i}
                                                    className="text-xs bg-rose-50 px-4 py-1.5 rounded-full text-rose-700 font-bold uppercase tracking-widest border border-rose-100/50"
                                                >
                                                    #{emo}
                                                </span>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* 2. OPPORTUNITY */}
                            {selectedFolder.aiInfo.oportunidad && (
                                <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden animate-fade-in-up delay-75">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-full blur-3xl -mr-24 -mt-24 opacity-60"></div>
                                    <div className="flex items-center gap-5 mb-6 relative z-10">
                                        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
                                            <Activity className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-navy-900 text-xl">
                                                Nuevo Factor 2 Estratégico
                                            </h5>
                                            <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">
                                                Potencial de Transformación
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-base text-slate-700 leading-relaxed mb-8 relative z-10 font-medium">
                                        {
                                            selectedFolder.aiInfo.oportunidad
                                                .descripcion
                                        }
                                    </p>
                                    <div className="p-6 bg-emerald-50/50 rounded-4xl border border-emerald-100 relative z-10 flex gap-4 items-center">
                                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                                            <BrandAtom
                                                className="w-6 h-6 text-emerald-500"
                                                variant="colored"
                                            />
                                        </div>
                                        <p className="text-sm text-emerald-900 italic font-bold leading-relaxed">
                                            &quot;
                                            {
                                                selectedFolder.aiInfo
                                                    .oportunidad.nuevo_enfoque
                                            }
                                            &quot;
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* 3. ACTION HERO (Full Focus) */}
                            {selectedFolder.aiInfo.herramienta && (
                                <div className="flex flex-col bg-white p-6 sm:p-10 rounded-[3rem] border-2 border-blue-100 shadow-2xl shadow-blue-50/50 relative overflow-hidden group animate-fade-in-up delay-150">
                                    <div className="absolute -top-12 -right-12 w-80 h-80 bg-blue-50 rounded-full blur-[100px] opacity-40 group-hover:bg-blue-100 transition-colors"></div>

                                    <div className="flex items-start justify-between mb-10 relative z-10">
                                        <div className="flex items-center gap-6">
                                            <div className="w-20 h-20 bg-blue-600 rounded-4xl flex items-center justify-center text-white shadow-2xl shadow-blue-200">
                                                <ListTodo className="w-10 h-10" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-navy-900 text-3xl leading-tight">
                                                    {
                                                        selectedFolder.aiInfo
                                                            .herramienta.nombre
                                                    }
                                                </h4>
                                                <p className="text-base text-slate-500 font-medium mt-1">
                                                    Hoja de Ruta de
                                                    Implementación
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-lg text-slate-600 mb-12 relative z-10 leading-relaxed font-medium max-w-4xl">
                                        {
                                            selectedFolder.aiInfo.herramienta
                                                .descripcion
                                        }
                                    </p>

                                    <div className="flex flex-col gap-6 mb-12 relative z-10 pl-4">
                                        {/* Vertical connecting line */}
                                        <div className="absolute left-10 top-10 bottom-10 w-0.5 bg-blue-100 hidden sm:block"></div>

                                        {selectedFolder.aiInfo.herramienta.pasos_practicos.map(
                                            (step, idx) => (
                                                <div
                                                    key={idx}
                                                    className={clsx(
                                                        "flex items-start gap-6 p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer relative z-10",
                                                        checkedItems.includes(
                                                            idx,
                                                        )
                                                            ? "bg-emerald-50 border-emerald-200 shadow-sm"
                                                            : "bg-slate-50 border-slate-50 hover:bg-white hover:border-blue-200 hover:shadow-xl",
                                                    )}
                                                    onClick={() =>
                                                        toggleItem(idx)
                                                    }
                                                >
                                                    {/* Step Number Circle */}
                                                    <div
                                                        className={clsx(
                                                            "w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center font-bold text-lg shadow-sm transition-all",
                                                            checkedItems.includes(
                                                                idx,
                                                            )
                                                                ? "bg-emerald-500 text-slate-900"
                                                                : "bg-white text-blue-600 border border-blue-100",
                                                        )}
                                                    >
                                                        {idx + 1}
                                                    </div>

                                                    <div className="flex-1 pt-1">
                                                        <p
                                                            className={clsx(
                                                                "text-lg font-bold leading-tight mb-1",
                                                                checkedItems.includes(
                                                                    idx,
                                                                )
                                                                    ? "text-emerald-900"
                                                                    : "text-navy-900",
                                                            )}
                                                        >
                                                            {step}
                                                        </p>
                                                        <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">
                                                            Paso en ejecución
                                                        </p>
                                                    </div>

                                                    <div
                                                        className={clsx(
                                                            "w-8 h-8 rounded-full border-2 shrink-0 flex items-center justify-center transition-all mt-2",
                                                            checkedItems.includes(
                                                                idx,
                                                            )
                                                                ? "bg-emerald-100 border-emerald-500 text-emerald-600"
                                                                : "bg-white border-slate-200 text-transparent",
                                                        )}
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>

                                    <div className="p-8 bg-slate-50 rounded-[2.5rem] text-slate-900 shadow-2xl relative z-10 flex items-center gap-8 border border-slate-200 overflow-hidden">
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl"></div>
                                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 relative z-10">
                                            <BrandAtom
                                                className="w-8 h-8 text-blue-300"
                                                variant="colored"
                                            />
                                        </div>
                                        <div className="relative z-10">
                                            <p className="text-xs font-bold text-blue-300 uppercase tracking-[0.3em] mb-2">
                                                Recomendación Estratégica NSG
                                            </p>
                                            <p className="text-lg font-medium leading-relaxed italic opacity-90 pr-10">
                                                &quot;
                                                {
                                                    selectedFolder.aiInfo
                                                        .herramienta
                                                        .recomendacion_de_uso
                                                }
                                                &quot;
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
                                <BrandAtom
                                    className="w-10 h-10 text-blue-400"
                                    variant="colored"
                                />
                            </div>
                            <div className="max-w-md">
                                <h5 className="text-2xl font-bold text-navy-900 mb-2">
                                    Análisis Profundo en Proceso
                                </h5>
                                <p className="text-slate-500 leading-relaxed font-medium">
                                    Generando estrategias tácticas,
                                    identificación de factores clave y planes de
                                    acción personalizados con nuestro Context
                                    Engine...
                                </p>
                            </div>
                            <button
                                onClick={handleGenerateAnalysis}
                                disabled={isAnalyzing}
                                className={clsx(
                                    "mt-2 px-10 py-4 bg-white border border-slate-200 rounded-2xl text-lg font-bold text-blue-600 transition-all shadow-xl hover:-translate-y-1",
                                    isAnalyzing
                                        ? "opacity-70 cursor-wait bg-slate-50"
                                        : "hover:bg-blue-50 cursor-pointer hover:shadow-blue-100/50",
                                )}
                            >
                                {isAnalyzing ? (
                                    <div className="flex items-center gap-3">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Generando Análisis Maestro...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <Activity className="w-5 h-5 fill-current" />
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
                <div className="fixed inset-0 z-100 flex justify-end animate-in fade-in duration-300">
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
                                    <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    Transcripción de la Sesión
                                </h4>
                                <p className="text-xs text-slate-400 mt-1 font-medium">
                                    Registro detallado de la conversación
                                </p>
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
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Content Swiper / Scroll area */}
                        <div className="flex-1 overflow-y-auto custom-scroll p-8 space-y-8 bg-slate-50/20">
                            {selectedFolder.transcripts
                                ?.filter(
                                    (i) =>
                                        i.text
                                            .toLowerCase()
                                            .includes(
                                                searchQuery.toLowerCase(),
                                            ) ||
                                        i.speakerName
                                            .toLowerCase()
                                            .includes(
                                                searchQuery.toLowerCase(),
                                            ),
                                )
                                .map((item, index) => {
                                    const isMe = item.isUser;
                                    const safeColors = [
                                        "bg-[#1976d2]",
                                        "bg-[#388e3c]",
                                        "bg-[#f57c00]",
                                        "bg-[#d32f2f]",
                                        "bg-[#7b1fa2]",
                                        "bg-[#00796b]",
                                        "bg-[#512da8]",
                                        "bg-[#c2185b]",
                                    ];
                                    const getSpeakerColor = (name: string) => {
                                        let hash = 0;
                                        for (let i = 0; i < name.length; i++)
                                            hash =
                                                name.charCodeAt(i) +
                                                ((hash << 5) - hash);
                                        return safeColors[
                                            Math.abs(hash) % safeColors.length
                                        ];
                                    };
                                    const avatarColor = getSpeakerColor(
                                        item.speakerName,
                                    );

                                    return (
                                        <div
                                            key={index}
                                            className={`flex w-full gap-4 ${isMe ? "flex-row-reverse" : "flex-row"} mb-4 animate-fade-in-up`}
                                        >
                                            <div
                                                className={`
                            w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 
                            select-none text-slate-900 shadow-md
                            ${isMe ? "bg-white" : avatarColor}
                        `}
                                            >
                                                {item.speakerName
                                                    .substring(0, 1)
                                                    .toUpperCase()}
                                            </div>

                                            <div
                                                className={`
                           group relative max-w-[85%] px-5 py-4 shadow-sm transition-all duration-300
                           ${
                               isMe
                                   ? "bg-white text-slate-900 rounded-2xl rounded-tr-none"
                                   : "bg-white text-slate-800 rounded-2xl rounded-tl-none border border-slate-200"
                           }
                        `}
                                            >
                                                {!isMe && (
                                                    <div className="mb-2 flex items-center justify-between gap-4 border-b border-slate-100 pb-1.5 grayscale opacity-70">
                                                        <span className="text-[10px] font-bold text-navy-900 uppercase tracking-wider">
                                                            {item.speakerName}
                                                        </span>
                                                        <span className="text-[9px] text-slate-400 font-medium">
                                                            {item.time}
                                                        </span>
                                                    </div>
                                                )}
                                                <p
                                                    className={`
                                text-sm leading-relaxed whitespace-pre-wrap font-medium
                                ${isMe ? "text-blue-50" : "text-slate-600"}
                            `}
                                                >
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
                                    <p className="text-sm font-bold text-slate-500">
                                        Sin transcripción disponible
                                    </p>
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
