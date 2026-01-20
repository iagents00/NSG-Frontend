"use client";

import { useState, useEffect, useRef } from "react";
import {
    Target,
    ArrowRight,
    CheckCircle,
    Circle,
    Lock,
    RefreshCw,
    Trophy,
    BarChart3,
    TrendingUp,
    Activity,
    Flame,
} from "lucide-react";
import clsx from "clsx";
import { useToast } from "@/components/ui/ToastProvider";
import confetti from "canvas-confetti";
import { useAppStore } from "@/store/useAppStore";
import { authService } from "@/lib/auth";
import api from "@/lib/api";

// Import new metrics components
import MetricsPanel from "@/components/clarity/MetricsPanel";
import CalendarHeatmap from "@/components/clarity/CalendarHeatmap";
import CompletionChart from "@/components/clarity/CompletionChart";

// --- AUDIO ENGINE ---
let _audioCtx: AudioContext | null = null;
const getAudioContext = () => {
    if (!_audioCtx) {
        const AudioContext =
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) _audioCtx = new AudioContext();
    }
    return _audioCtx;
};

const playSound = (type: "check" | "success") => {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    masterGain.gain.setValueAtTime(0.5, now);

    if (type === "check") {
        const osc1 = ctx.createOscillator();
        const env1 = ctx.createGain();
        osc1.connect(env1);
        env1.connect(masterGain);
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(880, now);
        osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.05);
        env1.gain.setValueAtTime(0, now);
        env1.gain.linearRampToValueAtTime(0.6, now + 0.01);
        env1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc1.start(now);
        osc1.stop(now + 0.3);
    } else {
        const freqs = [523.25, 659.25, 783.99, 987.77, 1174.66];
        freqs.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const oscGain = ctx.createGain();
            osc.connect(oscGain);
            oscGain.connect(masterGain);
            osc.type = i % 2 === 0 ? "sine" : "triangle";
            const start = now + i * 0.06;
            osc.frequency.setValueAtTime(freq, start);
            oscGain.gain.setValueAtTime(0, start);
            oscGain.gain.linearRampToValueAtTime(
                0.3 / freqs.length,
                start + 0.05,
            );
            oscGain.gain.exponentialRampToValueAtTime(0.01, start + 0.8);
            osc.start(start);
            osc.stop(start + 0.8);
        });
    }
};

// --- SUB-COMPONENTS ---
// --- Types ---
interface Strategy {
    _id: string;
    meta_detectada: string;
    accion_1: string;
    accion_2: string;
    accion_3: string;
}

interface MetricsData {
    totalCompletions: number;
    byProtocol: {
        morning_clarity: number;
        power_check: number;
        next_day_planning: number;
    };
    completionRate: number;
    completion_rate?: number; // Map both to avoid breakages
    activeDays: number;
    perfectDays: number;
    period: "week" | "month";
}

interface ActionStyle {
    active: {
        bg: string;
        border: string;
        text: string;
        accent: string;
        dot: string;
        iconBg: string;
        bar: string;
    };
    inactive: {
        border: string;
        dotBorder: string;
    };
}

interface StrategyStyle {
    bg: string;
    border: string;
    text: string;
    accent: string;
    numBg: string;
}

interface StreakData {
    current: number;
    longest: number;
    last_completion_date: string;
}

interface HistoryItem {
    date: string;
    morning_clarity: number;
    power_check: number;
    next_day_planning: number;
}

interface TimelineItemProps {
    id: string;
    time: string;
    title: string;
    color: "emerald" | "blue" | "indigo";
    desc: string;
    locked: boolean;
    isChecked: boolean;
    onToggle: (id: string) => void;
}

function TimelineItem({
    id,
    time,
    title,
    color,
    desc,
    locked,
    isChecked,
    onToggle,
}: TimelineItemProps) {
    const styles: Record<string, ActionStyle> = {
        emerald: {
            active: {
                bg: "bg-emerald-50/50",
                border: "border-emerald-500/30",
                text: "text-emerald-900",
                accent: "text-emerald-600",
                dot: "bg-emerald-500",
                iconBg: "bg-emerald-500/10",
                bar: "bg-emerald-500",
            },
            inactive: {
                border: "border-slate-200",
                dotBorder: "border-slate-200",
            },
        },
        blue: {
            active: {
                bg: "bg-blue-50/50",
                border: "border-blue-500/30",
                text: "text-blue-900",
                accent: "text-blue-600",
                dot: "bg-blue-500",
                iconBg: "bg-blue-500/10",
                bar: "bg-blue-500",
            },
            inactive: {
                border: "border-slate-200",
                dotBorder: "border-slate-200",
            },
        },
        indigo: {
            active: {
                bg: "bg-indigo-50/50",
                border: "border-indigo-500/30",
                text: "text-indigo-900",
                accent: "text-indigo-600",
                dot: "bg-indigo-500",
                iconBg: "bg-indigo-500/10",
                bar: "bg-indigo-500",
            },
            inactive: {
                border: "border-slate-200",
                dotBorder: "border-slate-200",
            },
        },
    };
    const style = styles[color] || styles.blue;

    return (
        <div
            onClick={() => !locked && onToggle(id)}
            className={clsx(
                "flex gap-3 xs:gap-4 sm:gap-6 relative group cursor-pointer transition-all duration-500 select-none",
                locked && "opacity-40 pointer-events-none",
            )}
        >
            <div className="flex flex-col items-center shrink-0 w-10 xs:w-12">
                <span className="text-[9px] xs:text-[10px] font-bold text-slate-400 mb-1.5 xs:mb-2 tracking-tighter uppercase font-mono">
                    {time}
                </span>
                <div
                    className={clsx(
                        "w-3.5 h-3.5 xs:w-4 xs:h-4 rounded-full border-2 z-10 transition-all duration-700 flex items-center justify-center",
                        isChecked
                            ? `${style.active.dot} border-white scale-110 shadow-lg`
                            : `bg-white ${style.inactive.dotBorder} group-hover:scale-110`,
                    )}
                >
                    {isChecked && (
                        <CheckCircle className="w-2 h-2 xs:w-2.5 xs:h-2.5 text-white" />
                    )}
                </div>
                <div className="w-0.5 h-full bg-slate-100/60 -mt-2 relative overflow-hidden rounded-full">
                    {isChecked && (
                        <div
                            className={clsx(
                                "absolute top-0 left-0 w-full h-full animate-grow-down origin-top",
                                style.active.bar,
                            )}
                        ></div>
                    )}
                </div>
            </div>
            <div
                className={clsx(
                    "flex-1 p-4 xs:p-5 rounded-3xl xs:rounded-4xl border transition-all duration-500 ease-out relative overflow-hidden",
                    isChecked
                        ? `${style.active.bg} ${style.active.border} shadow-xl shadow-slate-200/50 translate-x-1`
                        : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xl hover:shadow-slate-200/40",
                )}
            >
                {isChecked && (
                    <div
                        className={clsx(
                            "absolute -right-16 xs:-right-20 -top-16 xs:-top-20 w-32 xs:w-40 h-32 xs:h-40 rounded-full blur-[50px] xs:blur-[60px] opacity-20",
                            style.active.dot,
                        )}
                    ></div>
                )}
                <div className="flex justify-between items-start mb-2 xs:mb-3 relative z-10">
                    <div className="space-y-0.5">
                        <h4
                            className={clsx(
                                "font-display font-bold text-base xs:text-lg lg:text-xl tracking-tight transition-all duration-700",
                                isChecked ? style.active.text : "text-navy-950",
                            )}
                        >
                            {title}
                        </h4>
                        <div
                            className={clsx(
                                "text-[8px] xs:text-[9px] font-bold uppercase tracking-[0.15em] xs:tracking-[0.2em]",
                                isChecked
                                    ? style.active.accent
                                    : "text-slate-400",
                            )}
                        >
                            {isChecked
                                ? "Módulo Completado"
                                : "Protocolo Pendiente"}
                        </div>
                    </div>
                    <div
                        className={clsx(
                            "w-8 h-8 xs:w-10 xs:h-10 rounded-lg xs:rounded-xl flex items-center justify-center transition-all duration-500",
                            isChecked
                                ? `${style.active.iconBg} rotate-0`
                                : "bg-slate-50 rotate-6",
                        )}
                    >
                        {locked ? (
                            <Lock className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-slate-300" />
                        ) : isChecked ? (
                            <CheckCircle
                                className={clsx(
                                    "w-4 h-4 xs:w-5 xs:h-5",
                                    style.active.accent,
                                )}
                            />
                        ) : (
                            <Circle className="w-4 h-4 xs:w-5 xs:h-5 text-slate-200 group-hover:text-slate-400 transition-colors" />
                        )}
                    </div>
                </div>
                <p
                    className={clsx(
                        "text-xs xs:text-sm leading-relaxed transition-all duration-500 relative z-10",
                        isChecked
                            ? "text-slate-600/80 font-medium"
                            : "text-slate-500 font-medium",
                    )}
                >
                    {desc}
                </p>
                {!isChecked && (
                    <div className="mt-3 xs:mt-4 flex items-center gap-1.5 xs:gap-2 text-blue-600 text-[8px] xs:text-[9px] font-bold uppercase tracking-wider xs:tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-1 group-hover:translate-y-0">
                        Activar protocolo{" "}
                        <ArrowRight className="w-2 h-2 xs:w-2.5 xs:h-2.5" />
                    </div>
                )}
            </div>
        </div>
    );
}

function StrategyCard({ strategy }: { strategy: Strategy }) {
    const parseAction = (text: string, index: number) => {
        const keywords = [
            { kw: "Quick Win", label: "Ejecución Inmediata", color: "emerald" },
            { kw: "Optimización", label: "Mejora de Procesos", color: "blue" },
            {
                kw: "Transformación",
                label: "Cambio Estructural",
                color: "indigo",
            },
        ];

        const found = keywords.find((k) =>
            text.toLowerCase().includes(k.kw.toLowerCase()),
        );

        if (found) {
            const parts = text.split(new RegExp(`${found.kw}[:\\s-]*`, "i"));
            const description =
                parts.length > 1 ? parts[1].trim() : parts[0].trim();
            return {
                title: found.kw,
                label: found.label,
                description,
                color: found.color,
            };
        }

        return {
            title: `Acción Táctica ${index + 1}`,
            label: "Estrategia de Ejecución",
            description: text,
            color: "blue",
        };
    };

    return (
        <div className="bg-white p-6 xs:p-8 rounded-[2.5rem] lg:rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/60 transition-all duration-500 group overflow-hidden relative flex flex-col h-full">
            {/* Meta Title */}
            <div className="mb-8 relative z-10 pt-1 pr-12">
                <h4 className="font-display font-bold text-sm lg:text-base tracking-tight text-navy-950 mb-1.5 leading-tight transition-all duration-500 group-hover:text-blue-700">
                    {strategy.meta_detectada}
                </h4>
                <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Objetivo Estratégico Detectado
                </div>
            </div>

            {/* Actions Grid */}
            <div className="space-y-5 relative z-10 flex-1">
                {[strategy.accion_1, strategy.accion_2, strategy.accion_3].map(
                    (action, i) => {
                        if (!action) return null;
                        const { title, label, description, color } =
                            parseAction(action, i);

                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const styles: any = {
                            emerald: {
                                bg: "bg-emerald-50/40",
                                border: "border-emerald-500/10",
                                text: "text-emerald-900",
                                accent: "text-emerald-600",
                                numBg: "bg-emerald-500",
                            },
                            blue: {
                                bg: "bg-blue-50/40",
                                border: "border-blue-500/10",
                                text: "text-blue-900",
                                accent: "text-blue-600",
                                numBg: "bg-blue-500",
                            },
                            indigo: {
                                bg: "bg-indigo-50/40",
                                border: "border-indigo-500/10",
                                text: "text-indigo-900",
                                accent: "text-indigo-600",
                                numBg: "bg-indigo-500",
                            },
                        };
                        const style = (styles[color] ||
                            styles.blue) as StrategyStyle;

                        return (
                            <div
                                key={i}
                                className={clsx(
                                    "p-5 rounded-3xl border transition-all duration-500 hover:shadow-xl hover:shadow-slate-200/50 hover:scale-[1.02] flex flex-col gap-3 group/action",
                                    style.bg,
                                    style.border,
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="space-y-0.5">
                                        <div
                                            className={clsx(
                                                "text-[8px] font-black uppercase tracking-[0.2em]",
                                                style.accent,
                                            )}
                                        >
                                            {label}
                                        </div>
                                        <h5
                                            className={clsx(
                                                "font-display font-bold text-base transition-colors",
                                                style.text,
                                            )}
                                        >
                                            {title}
                                        </h5>
                                    </div>
                                    <div
                                        className={clsx(
                                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/5 transition-all duration-500 group-hover/action:scale-110 font-bold text-white text-xs",
                                            style.numBg,
                                        )}
                                    >
                                        {i + 1}
                                    </div>
                                </div>
                                <p className="text-[12px] font-medium text-slate-500 leading-relaxed pr-2">
                                    {description}
                                </p>
                            </div>
                        );
                    },
                )}
            </div>
        </div>
    );
}

import { useCallback } from "react";

// --- MAIN COMPONENT ---
export default function NSGClarity() {
    const { showToast } = useToast();
    const { userId } = useAppStore();
    const [isConnected, setIsConnected] = useState(false);
    const [telegramId, setTelegramId] = useState<number | null>(null);
    const [telegramData, setTelegramData] = useState<{
        username?: string;
    } | null>(null);
    const [isLoadingTelegramData, setIsLoadingTelegramData] = useState(false);
    const [strategies, setStrategies] = useState<Strategy[]>([]);
    const [isLoadingStrategies, setIsLoadingStrategies] = useState(false);

    // Metrics states
    const [streakData, setStreakData] = useState<StreakData | null>(null);
    const [metricsData, setMetricsData] = useState<MetricsData | null>(null);
    const [heatmapData, setHeatmapData] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
    const [chartData, setChartData] = useState<HistoryItem[]>([]);
    const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
    const [activeTab, setActiveTab] = useState<"execution" | "analysis">(
        "execution",
    ); // Toggle for execution/metrics view

    const [tasks, setTasks] = useState([
        {
            id: "1",
            time: "Morning",
            title: "Morning Clarity",
            status: "Pendiente",
            color: "emerald" as const,
            desc: "Establecimiento de la intención estratégica. Sincronización con la Hoja de Alineación y blindaje de prioridades para una ejecución de alto impacto.",
            locked: false,
            isChecked: false,
        },
        {
            id: "2",
            time: "Noon",
            title: "Power Check",
            status: "Pendiente",
            color: "blue" as const,
            desc: "Sincronización táctica y control de flujo. Evaluación de hitos alcanzados y recalibración de energía para asegurar un cierre de jornada resolutivo.",
            locked: false,
            isChecked: false,
        },
        {
            id: "3",
            time: "Night",
            title: "Next Day Planning",
            status: "Pendiente",
            color: "indigo" as const,
            desc: "Arquitectura del éxito anticipado. Auditoría de resultados daily, optimización de la Hoja de Alineación y diseño proactivo de la jornada de mañana.",
            locked: false,
            isChecked: false,
        },
    ]);

    const fetchStrategies = useCallback(async () => {
        setIsLoadingStrategies(true);
        try {
            const response = await api.get(`/strategies/get`);
            if (response.status === 200) {
                setStrategies(response.data);
            }
        } catch (error) {
            // For new users without strategies, this is expected - don't log as error
            if (
                (error as any).response?.status === 404 || // eslint-disable-line @typescript-eslint/no-explicit-any
                (error as any).response?.status === 401 // eslint-disable-line @typescript-eslint/no-explicit-any
            ) {
                console.log(
                    "[INFO] No strategies found for user (expected for new users)",
                );
                setStrategies([]);
            } else {
                console.error("Error fetching strategies:", error);
            }
        } finally {
            setIsLoadingStrategies(false);
        }
    }, [setStrategies, setIsLoadingStrategies]);

    const syncObjectives = useCallback(
        async (isManual = false) => {
            if (!telegramId) return;
            setIsLoadingTelegramData(true);
            try {
                const response = await api.get(`/telegram/user/${telegramId}`);
                if (response.status === 200) {
                    setTelegramData(response.data);
                    if (isManual)
                        showToast("Objetivos sincronizados", "success");
                }
            } catch (error) {
                console.error("Error syncing objectives:", error);
            } finally {
                setIsLoadingTelegramData(false);
            }
        },
        [telegramId, setTelegramData, setIsLoadingTelegramData, showToast],
    );

    // Fetch all metrics data
    const fetchAllMetrics = useCallback(async () => {
        if (!userId) return;

        setIsLoadingMetrics(true);
        try {
            // Fetch streaks
            try {
                const streaksResponse = await api.get(
                    `/clarity/streaks/${userId}`,
                );
                if (streaksResponse.status === 200) {
                    setStreakData(streaksResponse.data.streaks);
                }
            } catch (error) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if ((error as any).response?.status === 404) {
                    console.log(
                        "[INFO] No streak data found (expected for new users)",
                    );
                    setStreakData(null);
                }
            }

            // Fetch metrics (monthly)
            try {
                const metricsResponse = await api.get(
                    `/clarity/metrics/${userId}?period=month`,
                );
                if (metricsResponse.status === 200) {
                    setMetricsData(metricsResponse.data.metrics);
                }
            } catch (error) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if ((error as any).response?.status === 404) {
                    console.log(
                        "[INFO] No metrics data found (expected for new users)",
                    );
                    setMetricsData(null);
                }
            }

            // Fetch heatmap data
            try {
                const heatmapResponse = await api.get(
                    `/clarity/heatmap/${userId}?months=1`,
                );
                if (heatmapResponse.status === 200) {
                    setHeatmapData(heatmapResponse.data.heatmap);
                }
            } catch (error) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if ((error as any).response?.status === 404) {
                    console.log(
                        "[INFO] No heatmap data found (expected for new users)",
                    );
                    setHeatmapData([]);
                }
            }

            // Fetch history for chart (last 7 days)
            try {
                const today = new Date();
                const sevenDaysAgo = new Date(
                    today.getTime() - 7 * 24 * 60 * 60 * 1000,
                );
                const startDate = sevenDaysAgo.toISOString().split("T")[0];
                const endDate = today.toISOString().split("T")[0];

                const historyResponse = await api.get(
                    `/clarity/history/${userId}?startDate=${startDate}&endDate=${endDate}`,
                );
                if (historyResponse.status === 200) {
                    // Transform data for chart
                    const completions = historyResponse.data.completions;
                    const chartMap: Record<string, HistoryItem> = {};

                    // Initialize all 7 days
                    for (let i = 0; i < 7; i++) {
                        const date = new Date(
                            sevenDaysAgo.getTime() + i * 24 * 60 * 60 * 1000,
                        );
                        const dateStr = date.toISOString().split("T")[0];
                        chartMap[dateStr] = {
                            date: dateStr,
                            morning_clarity: 0,
                            power_check: 0,
                            next_day_planning: 0,
                        };
                    }

                    // Fill in completions
                    completions.forEach(
                        (c: { date: string; protocol: string }) => {
                            if (chartMap[c.date]) {
                                const protocolKey = c.protocol as
                                    | "morning_clarity"
                                    | "power_check"
                                    | "next_day_planning";
                                chartMap[c.date][protocolKey] = 1;
                            }
                        },
                    );

                    setChartData(Object.values(chartMap));
                }
            } catch (error) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if ((error as any).response?.status === 404) {
                    console.log(
                        "[INFO] No history data found (expected for new users)",
                    );
                    setChartData([]);
                }
            }
        } catch (error) {
            console.error("Error fetching metrics:", error);
        } finally {
            setIsLoadingMetrics(false);
        }
    }, [
        userId,
        setStreakData,
        setMetricsData,
        setHeatmapData,
        setChartData,
        setIsLoadingMetrics,
    ]);

    // Check today's completions
    const fetchTodayCompletions = useCallback(async () => {
        if (!userId) return;

        try {
            const response = await api.get(`/clarity/today/${userId}`);
            if (response.status === 200) {
                const completed = response.data.completed;

                // Update tasks based on what's completed today
                setTasks((prev) =>
                    prev.map((t) => {
                        let isChecked = false;
                        if (t.id === "1") isChecked = completed.morning_clarity;
                        if (t.id === "2") isChecked = completed.power_check;
                        if (t.id === "3")
                            isChecked = completed.next_day_planning;
                        return { ...t, isChecked };
                    }),
                );
            }
        } catch (error) {
            // For new users, no completions is expected
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((error as any).response?.status === 404) {
                console.log(
                    "[INFO] No completions data found (expected for new users)",
                );
            } else {
                console.error("Error fetching today completions:", error);
            }
        }
    }, [userId, setTasks]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await authService.verifySession();
                if (data?.user) {
                    if (data.user.telegram_id)
                        setTelegramId(data.user.telegram_id);
                    if (data.user.id) {
                        useAppStore.getState().setUserId(data.user.id);
                        fetchStrategies();
                        fetchTodayCompletions(); // Load today's completions
                        fetchAllMetrics(); // Load metrics data
                    }
                }
            } catch (error) {
                console.error("Error fetching user session:", error);
            }
        };
        fetchUser();
        window.addEventListener("focus", fetchUser);
        return () => window.removeEventListener("focus", fetchUser);
    }, [fetchAllMetrics, fetchStrategies, fetchTodayCompletions]);

    useEffect(() => {
        if (telegramId) syncObjectives();
        // No llamamos a fetchStrategies aquí porque ya se llama en el useEffect de fetchUser
        // o al montar el componente si ya hay una sesión.
    }, [telegramId, syncObjectives]);

    useEffect(() => {
        const checkGoogle = async () => {
            try {
                const res = await api.get("/google/calendar/events");
                if (res.status === 200) setIsConnected(true);
            } catch (error) {
                console.error(
                    "Error checking Google Calendar association:",
                    error,
                );
            }
        };
        checkGoogle();
    }, []);

    const handleConnect = async (p: string) => {
        if (p === "Telegram") {
            if (telegramId) return;
            showToast("Abriendo Telegram...", "info");
            setTimeout(
                () =>
                    window.open(
                        `https://t.me/nsg_preguntasyrespuestas_bot?start=${userId}`,
                        "_blank",
                    ),
                800,
            );
            return;
        }
        if (isConnected) {
            try {
                const res = await api.delete("/google/calendar");
                if (res.status === 200) {
                    setIsConnected(false);
                    showToast("Google Calendar desconectado", "info");
                }
            } catch {
                showToast("Error", "error");
            }
        } else {
            try {
                const res = await api.get("/google/auth");
                if (res.data?.url) window.open(res.data.url, "_blank");
            } catch {
                showToast("Error", "error");
            }
        }
    };

    const progress =
        (tasks.filter((t) => t.isChecked).length / tasks.length) * 100;
    const prevProgressRef = useRef(progress);

    useEffect(() => {
        if (progress === 100 && prevProgressRef.current < 100) {
            setTimeout(() => {
                playSound("success");
                confetti({
                    particleCount: 150,
                    spread: 100,
                    origin: { y: 0.6 },
                });
                showToast(
                    "¡Excelente! Has completado todos los objetivos.",
                    "success",
                );
            }, 300);
        }
        prevProgressRef.current = progress;
    }, [progress, showToast]);

    const handleTaskToggle = async (id: string) => {
        const task = tasks.find((t) => t.id === id);
        if (!task || !userId) return;

        // Map task ID to protocol name
        const protocolMap: { [key: string]: string } = {
            "1": "morning_clarity",
            "2": "power_check",
            "3": "next_day_planning",
        };

        const protocol = protocolMap[id];
        if (!protocol) return;

        // Optimistically update local state
        const originalTasks = [...tasks];
        setTasks((prev) =>
            prev.map((t) => {
                if (t.id === id) {
                    return { ...t, isChecked: !t.isChecked };
                }
                return t;
            }),
        );

        try {
            // Call backend to toggle completion
            const response = await api.post("/clarity/toggle", {
                userId,
                protocol,
                metadata: {
                    deviceType: /Mobile/.test(navigator.userAgent)
                        ? "mobile"
                        : "desktop",
                    completionTime: 0,
                },
            });

            if (response.status === 201 || response.status === 200) {
                const isChecked = response.data.isChecked;
                const streak = response.data.streak;

                // Update streak data immediately from response
                if (streak) {
                    setStreakData(streak);
                }

                // Play sound only when checking
                if (isChecked) {
                    playSound("check");
                }

                // Show toast with streak info
                const message = isChecked
                    ? "Módulo completado!"
                    : "Módulo desmarcado";

                if (streak && isChecked) {
                    showToast(
                        `${message} Racha: ${streak.current} días`,
                        "success",
                    );
                } else {
                    showToast(message, isChecked ? "success" : "info");
                }

                // Refresh metrics (important for Rendimiento)
                fetchAllMetrics();
            }
        } catch (error) {
            // Rollback local state on error
            setTasks(originalTasks);
            console.error("Error toggling protocol:", error);
            showToast("Error al guardar. Inténtalo de nuevo.", "error");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8 h-full flex flex-col animate-fade-in-up pb-12 md:pb-16">
            {/* 1. HERO BANNER */}
            <div
                onClick={() => syncObjectives(true)}
                className="relative overflow-hidden bg-linear-to-r from-navy-950 via-navy-900 to-navy-950 px-5 py-6 sm:px-8 sm:py-6 rounded-3xl border border-navy-800/50 shadow-xl cursor-pointer group transition-all duration-700 hover:shadow-2xl mb-5 shrink-0"
                title="Clic para sincronizar objetivos"
            >
                <div className="relative z-10">
                    <h2 className="font-display font-bold text-2xl lg:text-3xl tracking-tight mb-2">
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-emerald-400">
                            Claridad y Eficiencia con IA
                        </span>
                    </h2>
                    <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
                        Sincronización neuronal activa diseñada para la
                        precisión máxima y el alto rendimiento continuo.
                        Protocolo de alineación estratégica ejecutándose.
                    </p>
                </div>
            </div>

            {/* 2. INTEGRATION BAR */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 lg:gap-4 mb-6 bg-white/50 backdrop-blur-sm p-2.5 xs:p-4 rounded-xl xs:rounded-2xl border border-slate-200/60 shadow-sm transition-all hover:bg-white/60">
                <div className="flex items-center justify-between w-full lg:w-auto gap-2">
                    <div
                        className={clsx(
                            "flex items-center gap-2 px-2 xs:px-3 py-1 xs:py-1.5 bg-slate-100 rounded-lg border border-slate-200",
                        )}
                    >
                        <Activity className="w-3 xs:w-3.5 h-3 xs:h-3.5 text-blue-600" />
                        <span className="text-[9px] xs:text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Sincronización de Ecosistema
                        </span>
                    </div>
                    <button
                        onClick={() => syncObjectives(true)}
                        className="group flex items-center gap-1.5 px-2 xs:px-2.5 py-1 xs:py-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95 lg:hidden"
                        disabled={isLoadingTelegramData}
                    >
                        <RefreshCw
                            className={clsx(
                                "w-3 xs:w-3.5 h-3 xs:h-3.5",
                                isLoadingTelegramData && "animate-spin",
                            )}
                        />
                        <span className="text-[9px] xs:text-[10px] font-semibold uppercase tracking-wide">
                            Refrescar@
                        </span>
                    </button>
                    {/* Desktop Refresh Button */}
                    <button
                        onClick={() => syncObjectives(true)}
                        className="group hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95"
                        disabled={isLoadingTelegramData}
                    >
                        <RefreshCw
                            className={clsx(
                                "w-3.5 h-3.5",
                                isLoadingTelegramData && "animate-spin",
                            )}
                        />
                        <span className="text-[10px] font-semibold uppercase tracking-wide">
                            Refrescar
                        </span>
                    </button>
                </div>

                {/* Integration Hub */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 w-full lg:w-auto">
                    {/* Telegram Button */}
                    <button
                        onClick={() => handleConnect("Telegram")}
                        disabled={telegramId !== null}
                        className={clsx(
                            "group relative flex items-center gap-2 xs:gap-3 px-3 xs:px-4 sm:px-5 py-2.5 border rounded-2xl xs:rounded-3xl sm:rounded-4xl transition-all duration-500 min-h-[44px] flex-1 sm:flex-none",
                            telegramId
                                ? "bg-emerald-50/60 border-emerald-200 shadow-sm cursor-default"
                                : "bg-white border-slate-300 hover:shadow-md hover:border-[#0088cc] cursor-pointer shadow-sm hover:bg-[#0088cc]/5",
                        )}
                    >
                        <div
                            className={clsx(
                                "w-8 h-8 xs:w-9 xs:h-9 rounded-lg xs:rounded-xl flex items-center justify-center transition-all duration-300 relative overflow-hidden shrink-0",
                                telegramId
                                    ? "bg-white ring-2 ring-emerald-200 shadow-sm text-[#0088cc]"
                                    : "bg-[#0088cc]/10 text-[#0088cc] group-hover:bg-[#0088cc] group-hover:text-white group-hover:ring-2 group-hover:ring-[#0088cc]/30",
                            )}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                className="w-4 h-4 fill-current relative z-10"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M11.944 0C5.352 0 0 5.352 0 11.944c0 6.592 5.352 11.944 11.944 11.944c6.592 0 11.944-5.352 11.944-11.944C23.888 5.352 18.536 0 11.944 0zm5.66 8.16l-1.928 9.096c-.144.644-.528.804-1.068.5l-2.936-2.164l-1.416 1.364c-.156.156-.288.288-.588.288l.212-3.04l5.524-4.992c.24-.212-.052-.332-.372-.12l-6.828 4.3l-2.948-.92c-.64-.2-.652-.64.132-.948l11.524-4.44c.532-.2.996.12.804.976z" />
                            </svg>
                            {telegramId && (
                                <div className="absolute inset-0 bg-emerald-500/5 animate-pulse"></div>
                            )}
                        </div>
                        <div className="text-left">
                            <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500 leading-none mb-1">
                                Telegram
                            </p>
                            <p className="text-xs font-bold leading-none text-navy-900">
                                {telegramId
                                    ? telegramData?.username
                                        ? `@${telegramData.username}`
                                        : "Conectado"
                                    : "Vincular"}
                            </p>
                        </div>
                    </button>

                    {/* Calendar Button */}
                    <button
                        onClick={() => handleConnect("Calendar")}
                        className={clsx(
                            "group relative flex items-center gap-2 xs:gap-3 px-3 xs:px-4 sm:px-5 py-2.5 border rounded-2xl xs:rounded-3xl sm:rounded-4xl transition-all duration-500 min-h-[44px] flex-1 sm:flex-none",
                            isConnected
                                ? "bg-emerald-50/60 border-emerald-200 shadow-sm cursor-default"
                                : "bg-white border-slate-300 hover:shadow-md hover:border-blue-400 cursor-pointer shadow-sm hover:bg-blue-50/30",
                        )}
                    >
                        <div
                            className={clsx(
                                "w-8 h-8 xs:w-9 xs:h-9 rounded-lg xs:rounded-xl flex items-center justify-center transition-all duration-300 relative overflow-hidden shrink-0",
                                isConnected
                                    ? "bg-white ring-2 ring-emerald-200 shadow-sm"
                                    : "bg-slate-50 group-hover:bg-white group-hover:ring-2 group-hover:ring-blue-200",
                            )}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                className="w-4 h-4 fill-current"
                            >
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            {isConnected && (
                                <div className="absolute inset-0 bg-emerald-500/5 animate-pulse"></div>
                            )}
                        </div>
                        <div className="text-left">
                            <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500 leading-none mb-1">
                                Calendar
                            </p>
                            <p className="text-xs font-bold leading-none text-navy-900">
                                {isConnected ? "Sincronizado" : "Vincular"}
                            </p>
                        </div>
                    </button>
                </div>
            </div>

            {/* 3. TAB NAVIGATION */}
            <div className="flex p-1.5 bg-slate-100/50 backdrop-blur-md rounded-2xl w-full sm:w-fit mb-6 border border-slate-200/50 self-center">
                <button
                    onClick={() => setActiveTab("execution")}
                    className={clsx(
                        "flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex-1 sm:flex-none whitespace-nowrap",
                        activeTab === "execution"
                            ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                            : "text-slate-500 hover:text-slate-700 hover:bg-white/50",
                    )}
                >
                    <Activity className="w-4 h-4" />
                    Protocolos Diarios
                </button>
                <button
                    onClick={() => setActiveTab("analysis")}
                    className={clsx(
                        "flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex-1 sm:flex-none whitespace-nowrap",
                        activeTab === "analysis"
                            ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                            : "text-slate-500 hover:text-slate-700 hover:bg-white/50",
                    )}
                >
                    <BarChart3 className="w-4 h-4" />
                    Rendimiento
                </button>
            </div>

            {activeTab === "execution" ? (
                /* 4. MAIN GRID (Daily Progress & Actions) */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xs:gap-8 mb-6 animate-fade-in-up">
                    {/* Left Column: Daily Progress */}
                    <div className="lg:col-span-7 flex flex-col gap-6 p-5 xs:p-6 sm:p-8 bg-slate-50/40 backdrop-blur-sm rounded-[2.5rem] lg:rounded-[3.5rem] border border-slate-200/50 shadow-sm relative overflow-hidden group/left">
                        <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl opacity-0 group-hover/left:opacity-100 transition-opacity duration-1000"></div>

                        <div className="flex items-center justify-between px-2 relative z-10">
                            <h4 className="font-bold text-navy-950 text-xl flex items-center gap-3">
                                <div className="p-2.5 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-500/20 group-hover/left:scale-110 transition-transform duration-500">
                                    <Activity className="w-5 h-5 transition-transform group-hover/left:rotate-12" />
                                </div>
                                Progreso Diario
                            </h4>
                        </div>

                        <div className="space-y-8 relative z-10">
                            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden transition-all hover:shadow-md hover:border-emerald-200/50">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50/30 rounded-full blur-3xl -mr-16 -mt-16 opacity-40"></div>

                                <div className="w-full animate-fade-in group relative z-10">
                                    <div className="flex justify-between items-end mb-4">
                                        <div className="space-y-0.5">
                                            <span className="text-[10px] font-black font-mono text-emerald-600 uppercase tracking-widest block">
                                                Misión Actual
                                            </span>
                                            <span className="text-xs font-bold text-slate-400">
                                                Eficiencia Neuronal Activa
                                            </span>
                                        </div>
                                        <span
                                            className={clsx(
                                                "text-xs font-bold px-3 py-1 rounded-full transition-all duration-500",
                                                progress === 100
                                                    ? "bg-emerald-100 text-emerald-600 scale-110"
                                                    : "bg-blue-50 text-blue-600",
                                            )}
                                        >
                                            {Math.round(progress)}%
                                        </span>
                                    </div>
                                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner relative border border-slate-200/50 backdrop-blur-sm">
                                        <div
                                            className={clsx(
                                                "h-full transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] relative overflow-hidden",
                                                progress === 100
                                                    ? "bg-emerald-500"
                                                    : "bg-blue-600",
                                            )}
                                        />
                                    </div>
                                </div>

                                {progress === 100 && (
                                    <div className="flex items-center gap-3 text-emerald-600 text-xs font-bold animate-fade-in bg-emerald-50/80 backdrop-blur-sm w-full p-4 rounded-2xl border border-emerald-100 mt-5 relative z-10">
                                        <div className="p-2 bg-white rounded-xl shadow-sm">
                                            <Trophy className="w-4 h-4 text-emerald-500" />
                                        </div>
                                        <span className="flex-1">
                                            ¡Misión Cumplida! Has completado tu
                                            ciclo de claridad estratégica.
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6 pt-2">
                                {tasks.map((t) => (
                                    <TimelineItem
                                        key={t.id}
                                        id={t.id}
                                        time={t.time}
                                        title={t.title}
                                        color={t.color}
                                        desc={t.desc}
                                        locked={t.locked}
                                        isChecked={t.isChecked}
                                        onToggle={handleTaskToggle}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Action Protocols */}
                    <div className="lg:col-span-5 flex flex-col gap-6 p-5 xs:p-6 sm:p-8 bg-blue-50/30 backdrop-blur-sm rounded-[2.5rem] lg:rounded-[3.5rem] border border-blue-100/50 shadow-sm relative overflow-hidden group/right">
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl opacity-0 group-hover/right:opacity-100 transition-opacity duration-1000"></div>

                        <div className="flex items-center justify-between px-2 relative z-10">
                            <h4 className="font-bold text-navy-950 text-xl flex items-center gap-3">
                                <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-600/20 group-hover/right:scale-110 transition-transform duration-500">
                                    <Target className="w-5 h-5 transition-transform group-hover/right:rotate-12" />
                                </div>
                                Protocolo de Acción
                                <button
                                    onClick={() => fetchStrategies()}
                                    className="p-1.5 rounded-lg hover:bg-white hover:text-blue-600 transition active:scale-95 disabled:opacity-50 ml-1 cursor-pointer"
                                    title="Actualizar protocolos"
                                    disabled={isLoadingStrategies}
                                >
                                    <RefreshCw
                                        className={clsx(
                                            "w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500",
                                            isLoadingStrategies &&
                                                "animate-spin",
                                        )}
                                    />
                                </button>
                            </h4>
                        </div>

                        <div className="flex-1 flex flex-col space-y-6 relative z-10">
                            <div className="flex-1 flex flex-col space-y-6 pr-1 custom-scroll min-h-0">
                                {strategies.length > 0 ? (
                                    strategies.map((strategy) => (
                                        <StrategyCard
                                            key={strategy._id}
                                            strategy={strategy}
                                        />
                                    ))
                                ) : (
                                    <div className="bg-white/60 backdrop-blur-sm p-10 rounded-[2.5rem] border border-dashed border-slate-200 text-center shadow-sm">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner ring-1 ring-slate-100">
                                            <Target className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <h5 className="text-navy-900 font-bold mb-2">
                                            Sin estrategias activas
                                        </h5>
                                        <p className="text-slate-400 font-medium text-[13px] mb-8 max-w-[250px] mx-auto leading-relaxed">
                                            Analiza una noticia o reunión para
                                            generar protocolos de acción
                                            inmediata.
                                        </p>
                                        <button
                                            onClick={() => fetchStrategies()}
                                            className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2 cursor-pointer border-none"
                                        >
                                            <RefreshCw className="w-3.5 h-3.5" />
                                            Actualizar Sistema
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* 5. METRICS SECTION (Analysis Tab) */
                <div className="space-y-4 xs:space-y-6 mb-6 xs:mb-8 animate-fade-in">
                    <div className="bg-white/50 backdrop-blur-sm p-5 sm:p-6 rounded-[2.5rem] border border-slate-200/60 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-display font-bold text-xl text-navy-950">
                                    Insights Operativos
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">
                                    Auditoría de rendimiento basada en la
                                    ejecución de protocolos IA
                                </p>
                            </div>
                        </div>

                        {/* Strategic Stats Micro-Cards */}
                        <div className="flex items-center gap-2 xs:gap-3">
                            {/* Streak Mini-Card */}
                            <div className="flex-1 sm:flex-none flex items-center gap-3 px-4 py-2.5 bg-linear-to-br from-orange-500/10 to-red-500/5 rounded-2xl border border-orange-200/50 shadow-sm group/streak transition-all hover:shadow-md hover:scale-[1.02]">
                                <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover/streak:animate-pulse">
                                    <Flame className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-orange-600 uppercase tracking-widest leading-none mb-1">
                                        Racha Actual
                                    </p>
                                    <p className="text-sm font-bold text-navy-950">
                                        {streakData?.current || 0} Días
                                    </p>
                                </div>
                            </div>

                            {/* Efficiency Mini-Card */}
                            <div className="flex-1 sm:flex-none flex items-center gap-3 px-4 py-2.5 bg-linear-to-br from-blue-500/10 to-indigo-500/5 rounded-2xl border border-blue-200/50 shadow-sm group/eff transition-all hover:shadow-md hover:scale-[1.02]">
                                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                                    <TrendingUp className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">
                                        Eficiencia Global
                                    </p>
                                    <p className="text-sm font-bold text-navy-950">
                                        {metricsData?.completion_rate ||
                                            metricsData?.completionRate ||
                                            0}
                                        %
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Metrics Panels Grid */}
                    {metricsData && (
                        <MetricsPanel
                            metrics={metricsData}
                            isLoading={isLoadingMetrics}
                        />
                    )}

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-6">
                        {/* Completion Chart */}
                        <CompletionChart
                            data={chartData}
                            period="week"
                            isLoading={isLoadingMetrics}
                        />

                        {/* Calendar Heatmap */}
                        <CalendarHeatmap
                            data={heatmapData}
                            isLoading={isLoadingMetrics}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
