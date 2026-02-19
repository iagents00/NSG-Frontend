"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
    Target,
    ArrowRight,
    CheckCircle,
    Circle,
    Lock,
    RefreshCw,
    BarChart3,
    TrendingUp,
    Activity,
    Plus,
    BrainCircuit,
    MessageCircle,
    Clock,
    ChevronRight,
    X,
    Calendar,
    ArrowUpRight,
    ChevronLeft,
    Maximize2,
    Check,
    FileText,
    GripVertical,
} from "lucide-react";
import {
    motion,
    AnimatePresence,
    Reorder,
    useDragControls,
} from "framer-motion";
import clsx from "clsx";
import { useToast } from "@/components/ui/ToastProvider";
import confetti from "canvas-confetti";
import { useAppStore } from "@/store/useAppStore";
import api from "@/lib/api";

// Import new metrics components
import MetricsPanel from "@/components/copilot/MetricsPanel";
import CalendarHeatmap from "@/components/copilot/CalendarHeatmap";
import CompletionChart from "@/components/copilot/CompletionChart";
import AddActionModal from "@/components/copilot/AddActionModal";
import StreakCounter from "@/components/copilot/StreakCounter";
import { Banner } from "@/components/ui/Banner";

// --- SISTEMA DE DISEÑO ULTRA-PREMIUM ---
const cn = (...classes: (string | boolean | undefined)[]) =>
    classes.filter(Boolean).join(" ");

// Constantes de Diseño "Apple Glass" Refinado
const GLASS_PANEL = `bg-white/80 backdrop-blur-2xl border border-white/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-[1.8rem]`;
const BTN_PRIMARY =
    "bg-[#007AFF] hover:bg-[#0071E3] text-white shadow-[0_8px_20px_rgba(0,122,255,0.25)] transition-all duration-400 rounded-2xl font-semibold tracking-tight active:scale-[0.97]";
const INPUT_GLASS =
    "bg-white/40 hover:bg-white/60 focus:bg-white/90 border border-white/60 focus:border-[#007AFF]/30 transition-all duration-300 rounded-xl outline-none shadow-sm";

// Checkbox estilo "Sky Crystal" (Dopamina Visual)
const CHECKBOX_BASE =
    "min-w-[26px] h-[26px] rounded-full flex items-center justify-center transition-all duration-500 shadow-sm border border-slate-200";
const CHECKBOX_UNCHECKED =
    "bg-white/50 hover:bg-white hover:border-cyan-300 hover:shadow-[0_0_10px_rgba(103,232,249,0.3)]";
const CHECKBOX_CHECKED =
    "bg-linear-to-tr from-cyan-400 to-blue-500 border-transparent text-white shadow-[0_0_20px_rgba(6,182,212,0.6)] scale-110 rotate-[360deg]";

const ImpactBadge = ({ level }: { level: string }) => {
    const colors: Record<string, string> = {
        Alto: "bg-blue-50 text-blue-600 border-blue-100",
        Medio: "bg-slate-50 text-slate-500 border-slate-100",
        Bajo: "bg-slate-50 text-slate-400 border-slate-100",
    };
    return (
        <span
            className={cn(
                "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border shadow-sm",
                colors[level] || colors.Bajo,
            )}
        >
            {level}
        </span>
    );
};

const AgentStatusPill = ({ state }: { state: string }) => {
    const states: Record<
        string,
        { icon: typeof BrainCircuit; label: string; color: string }
    > = {
        detected: {
            icon: BrainCircuit,
            label: "Detectado",
            color: "text-slate-400",
        },
        pinged: {
            icon: MessageCircle,
            label: "Notificado",
            color: "text-blue-500",
        },
        waiting_evidence: {
            icon: Clock,
            label: "Esperando",
            color: "text-amber-500",
        },
        verified: {
            icon: Check,
            label: "Verificado",
            color: "text-emerald-500",
        },
    };
    const config = states[state] || states.detected;
    const Icon = config.icon;

    return (
        <div
            className={cn(
                "flex items-center gap-1 text-[11px] font-medium",
                config.color,
            )}
        >
            <Icon className="w-3.5 h-3.5" />
            {config.label}
        </div>
    );
};

const PrioritySelector = ({
    current,
    onChange,
}: {
    current: string;
    onChange: (val: string) => void;
}) => {
    const options = ["Bajo", "Medio", "Alto"];

    return (
        <div className="flex bg-slate-100/80 p-1 rounded-xl">
            {options.map((opt) => {
                const isActive = current === opt;
                return (
                    <button
                        key={opt}
                        onClick={() => onChange(opt)}
                        className={cn(
                            "flex-1 py-2 text-xs font-bold uppercase tracking-wide rounded-lg transition-all duration-300",
                            isActive
                                ? "bg-white text-blue-600 shadow-sm scale-[1.02]"
                                : "text-slate-400 hover:text-slate-600",
                        )}
                    >
                        {opt}
                    </button>
                );
            })}
        </div>
    );
};

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

// CopilotTask is a union of protocols, strategies, and custom actions
// which have overlapping but not identical fields
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CopilotTask = Record<string, any> & {
    id: string;
    title: string;
};

interface ReorderItemProps {
    task: CopilotTask;
    setSelectedTask: (task: CopilotTask | null) => void;
    handleTaskToggle: (id: string) => void;
}

const ReorderItem = ({
    task,
    setSelectedTask,
    handleTaskToggle,
}: ReorderItemProps) => {
    const controls = useDragControls();

    return (
        <Reorder.Item
            key={task.id}
            layoutId={`task-${task.id}`}
            value={task}
            dragListener={false}
            dragControls={controls}
            whileDrag={{
                scale: 1.02,
                boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
                backgroundColor: "rgba(255,255,255,0.95)",
            }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
                GLASS_PANEL,
                "p-5 cursor-pointer group transition-all duration-300 border-l-0 relative overflow-hidden",
                task.completed ? "opacity-60 grayscale-[0.3]" : "",
            )}
            onClick={() => setSelectedTask(task)}
        >
            <div className="flex items-start gap-5 relative z-10">
                <div className="flex flex-col items-center gap-3">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (task.type === "protocol")
                                handleTaskToggle(task.id_real);
                        }}
                        className={cn(
                            CHECKBOX_BASE,
                            task.completed
                                ? CHECKBOX_CHECKED
                                : CHECKBOX_UNCHECKED,
                        )}
                    >
                        <Check
                            className={cn(
                                "w-3.5 h-3.5 stroke-[3.5] drop-shadow-md",
                                task.completed ? "opacity-100" : "opacity-0",
                            )}
                        />
                    </button>
                    <div
                        onPointerDown={(e) => controls.start(e)}
                        className="text-slate-200 group-hover:text-slate-400 transition-colors cursor-grab active:cursor-grabbing p-1 -m-1"
                    >
                        <GripVertical className="w-4 h-4" />
                    </div>
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                    <div className="mb-3 space-y-1">
                        <h4
                            className={cn(
                                "text-[17px] font-semibold bg-transparent border-none outline-none w-full p-0 m-0 focus:ring-0 truncate transition-colors font-display tracking-tight",
                                task.completed
                                    ? "text-[#86868B] line-through decoration-slate-300"
                                    : "text-[#1D1D1F]",
                            )}
                        >
                            {task.title}
                        </h4>
                        <p
                            className={cn(
                                "text-[14px] bg-transparent border-none outline-none w-full p-0 m-0 focus:ring-0 truncate transition-colors",
                                task.completed
                                    ? "text-slate-300"
                                    : "text-[#86868B]",
                            )}
                        >
                            {task.description}
                        </p>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                        {!task.completed && (
                            <div className="flex items-center gap-1.5 pr-3 border-r border-slate-200/60">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    Score
                                </span>
                                <span className="text-xs font-bold text-[#007AFF]">
                                    {task.score}
                                </span>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <ImpactBadge level={task.impact} />
                            <span className="text-xs text-[#86868B] font-medium px-2">
                                {task.area}
                            </span>
                        </div>

                        <div className="ml-auto flex items-center gap-2">
                            {!task.completed && (
                                <AgentStatusPill state={task.agentState} />
                            )}
                            <div className="p-1 rounded-full text-slate-300 group-hover:bg-slate-100 group-hover:text-blue-500 transition-colors">
                                <ArrowUpRight className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Reorder.Item>
    );
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
    disabled?: boolean;
    onToggle: (id: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function TimelineItem({
    id,
    time,
    title,
    color,
    desc,
    locked,
    isChecked,
    disabled = false,
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
            onClick={() => !locked && !disabled && onToggle(id)}
            className={clsx(
                "flex gap-3 xs:gap-4 sm:gap-6 relative group transition-all duration-500 select-none",
                locked || disabled
                    ? "opacity-40 cursor-not-allowed"
                    : "cursor-pointer",
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
                    "flex-1 p-5 rounded-3xl border transition-all duration-500 ease-out relative overflow-hidden",
                    isChecked
                        ? `${style.active.bg} ${style.active.border} shadow-sm`
                        : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md",
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
                                "font-display font-bold text-lg tracking-tight transition-all duration-700",
                                isChecked ? style.active.text : "text-navy-950",
                            )}
                        >
                            {title}
                        </h4>
                        <div
                            className={clsx(
                                "text-[10px] font-bold uppercase tracking-widest",
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
                        "text-sm font-medium leading-relaxed transition-all duration-500 relative z-10",
                        isChecked ? "text-slate-500/70" : "text-slate-500/90",
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
        <div className="transition-all duration-500 group overflow-hidden relative flex flex-col h-full">
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
                                    "p-5 rounded-3xl border border-slate-200 bg-white transition-all duration-500 flex flex-col gap-3 group/action hover:shadow-md hover:border-slate-300 relative overflow-hidden animate-fade-in",
                                )}
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <div className="flex justify-between items-start relative z-10">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={clsx(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    style.numBg,
                                                )}
                                            ></div>
                                            <div
                                                className={clsx(
                                                    "text-[10px] font-bold uppercase tracking-widest",
                                                    style.accent,
                                                )}
                                            >
                                                {label}
                                            </div>
                                        </div>
                                        <h5
                                            className={clsx(
                                                "font-display font-bold text-lg tracking-tight transition-colors",
                                                style.text,
                                            )}
                                        >
                                            {title}
                                        </h5>
                                    </div>
                                    <div
                                        className={clsx(
                                            "w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold text-white text-[10px]",
                                            style.numBg,
                                        )}
                                    >
                                        {i + 1}
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-slate-500/90 leading-relaxed pr-2 relative z-10 transition-colors group-hover/action:text-slate-600">
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

// MOCK_DOCS removed — this section should be backed by real data or hidden

// --- MAIN COMPONENT ---
export default function ICopilot() {
    const { showToast } = useToast();
    const { userId, userProfile } = useAppStore();
    const telegramId = userProfile?.telegram_id || null;
    const [isConnected, setIsConnected] = useState(false);
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

    const [searchQuery] = useState("");
    const [filter, setFilter] = useState("all");
    const [selectedTask, setSelectedTask] = useState<CopilotTask | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [customActions, setCustomActions] = useState<CopilotTask[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const weekDays = useMemo(() => {
        const base = new Date(selectedDate);
        const day = base.getDay();
        const diff = base.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(base.setDate(diff));

        const labels = ["L", "M", "X", "J", "V", "S", "D"];
        return labels.map((label, i) => {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            return {
                day: label,
                date: d.getDate(),
                fullDate: d,
                active: d.toDateString() === selectedDate.toDateString(),
            };
        });
    }, [selectedDate]);

    const changeWeek = (direction: number) => {
        const next = new Date(selectedDate);
        next.setDate(selectedDate.getDate() + direction * 7);
        setSelectedDate(next);
    };
    const [orderedTasks, setOrderedTasks] = useState<CopilotTask[]>([]);
    const calendarRef = useRef<HTMLInputElement>(null);

    const [tasks, setTasks] = useState([
        {
            id: "1",
            time: "Morning",
            title: "Morning Clarity",
            status: "Pendiente",
            color: "emerald" as const,
            desc: "Inicializa la secuencia estratégica diaria. Define vectores de alta prioridad y establece bloqueos de enfoque profundo para maximizar el rendimiento cognitivo matutino.",
            locked: false,
            isChecked: false,
        },
        {
            id: "2",
            time: "Noon",
            title: "Power Check",
            status: "Pendiente",
            color: "blue" as const,
            desc: "Recalibración táctica de mediodía. Analiza el progreso de KPIs, realinea prioridades críticas y optimiza los niveles de energía para la ejecución sostenida.",
            locked: false,
            isChecked: false,
        },
        {
            id: "3",
            time: "Night",
            title: "Next-Day Design",
            status: "Pendiente",
            color: "indigo" as const,
            desc: "Protocolo de cierre y proyección. Sintetiza los logros del ciclo actual y estructura la arquitectura de ejecución para garantizar el éxito del ciclo siguiente.",
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
                const streaksResponse = await api.get(`/copilot/streaks`);
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
                    `/copilot/metrics?period=month`,
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
                    `/copilot/heatmap?months=1`,
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
                    `/copilot/history?startDate=${startDate}&endDate=${endDate}`,
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
            const response = await api.get(`/copilot/today`);
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
        if (userId) {
            fetchStrategies();
            fetchTodayCompletions();
            fetchAllMetrics();
        }
    }, [userId, fetchStrategies, fetchTodayCompletions, fetchAllMetrics]);

    // Handle window focus to refresh data
    useEffect(() => {
        const handleFocus = () => {
            if (userId) {
                fetchStrategies();
                fetchTodayCompletions();
                fetchAllMetrics();
            }
        };
        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, [userId, fetchStrategies, fetchTodayCompletions, fetchAllMetrics]);

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
            showToast(
                "La desvinculación se realiza desde Configuración",
                "info",
            );
            return;
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

    const handleTaskToggle = async (id: string) => {
        // Soporte para acciones personalizadas (local only for now)
        if (id.startsWith("custom-")) {
            const currentAction = customActions.find((a) => a.id_real === id);
            if (!currentAction) return;

            const updated = customActions.map((a) =>
                a.id_real === id ? { ...a, isChecked: !a.isChecked } : a,
            );
            setCustomActions(updated);

            if (!currentAction.isChecked) {
                playSound("check");
                showToast("Acción completada", "success");
            }
            return;
        }

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
        const updatedTasks = tasks.map((t) => {
            if (t.id === id) {
                return { ...t, isChecked: !t.isChecked };
            }
            return t;
        });

        // Check if all tasks are completed after this toggle
        // We only trigger if the user is checking a box (old state was unchecked) AND all result in true
        const isChecking = !task.isChecked;
        const allCompleted = updatedTasks.every((t) => t.isChecked);

        if (isChecking && allCompleted) {
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

        setTasks(updatedTasks);

        try {
            // Call backend to toggle completion
            const response = await api.post("/copilot/toggle", {
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

                // Play sound only when checking
                if (isChecked) {
                    playSound("check");
                }

                // Show toast with streak info from toggle response (per-protocol)
                const streak = response.data.streak;
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

                // Re-fetch overall streaks and metrics to keep global data accurate
                // (toggle returns per-protocol streak, not overall)
                fetchAllMetrics();
            }
        } catch (error) {
            // Rollback local state on error
            setTasks(originalTasks);
            console.error("Error toggling protocol:", error);
            showToast("Error al guardar. Inténtalo de nuevo.", "error");
        }
    };

    const filteredTasks = useMemo(() => {
        const protocols = tasks.map((t) => ({
            id: `protocol-${t.id}`,
            id_real: t.id,
            title: t.title,
            description: t.desc,
            impact: "Alto",
            score: 10,
            area: "Protocolo",
            completed: t.isChecked,
            type: "protocol",
            agentState: t.isChecked ? "verified" : "waiting_evidence",
            agentLog: [{ time: "Hoy", event: "Protocolo diario detectado" }],
        }));

        const stratItems = strategies.map((s) => ({
            id: `strategy-${s._id}`,
            id_real: s._id,
            title: s.meta_detectada,
            description: s.accion_1,
            impact: "Medio",
            score: 8.5,
            area: "Estrategia",
            completed: false,
            type: "strategy",
            agentState: "detected",
            agentLog: [
                { time: "T0", event: "Análisis de contexto completado" },
                { time: "T1", event: "Estrategia detectada por el Agente I" },
            ],
        }));

        const combinedCustom = customActions.map((c) => ({
            ...c,
            completed: c.completed || false,
            type: "custom",
            agentState: "waiting_evidence",
            agentLog: [{ time: "Ahora", event: "Acción personalizada creada" }],
        }));

        const all: CopilotTask[] = [
            ...protocols,
            ...stratItems,
            ...combinedCustom,
        ];

        return all
            .filter((t: CopilotTask) => {
                if (filter === "high") return t.impact === "Alto";
                if (filter === "quality") {
                    return [
                        "Morning Clarity",
                        "Power Check",
                        "Next-Day Design",
                    ].includes(t.title);
                }
                return true;
            })
            .filter((t: CopilotTask) =>
                t.title.toLowerCase().includes(searchQuery.toLowerCase()),
            )
            .sort((a: CopilotTask, b: CopilotTask) => {
                // Completed items go to the bottom
                if (a.completed !== b.completed) return a.completed ? 1 : -1;
                // Within same completion status, sort by score descending
                return (b.score || 0) - (a.score || 0);
            });
    }, [tasks, strategies, customActions, filter, searchQuery]);

    useEffect(() => {
        setOrderedTasks(filteredTasks);
    }, [filteredTasks]);

    const handleSelectDay = (date: Date) => {
        setSelectedDate(date);
    };

    const handleImpactChange = (newImpact: string) => {
        if (!selectedTask) return;
        setSelectedTask((prev: CopilotTask | null) =>
            prev ? { ...prev, impact: newImpact } : prev,
        );
    };

    const handleAddTask = () => {
        setIsAddModalOpen(true);
    };

    const handleSaveNewAction = (newActionData: {
        title: string;
        description: string;
        impact: string;
    }) => {
        const actionId = `custom-${Date.now()}`;
        const newAction = {
            id: actionId,
            id_real: actionId,
            title: newActionData.title,
            desc: newActionData.description, // using desc to match tasks structure
            impact: newActionData.impact,
            score: 7.5,
            area: "Acción",
            isChecked: false,
            color: "blue" as const,
        };
        setCustomActions((prev) => [...prev, newAction]);
        setIsAddModalOpen(false);
        showToast("Nueva acción añadida con éxito", "success");
    };

    return (
        <>
            <div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8 min-h-full flex flex-col animate-fade-in-up pb-12 md:pb-16 relative overflow-x-hidden">
                {/* Fondo Ambiental Sutil (Aurora) */}
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <div className="absolute top-[-20%] left-[20%] w-[70%] h-[70%] bg-blue-100/30 rounded-full blur-[120px]" />
                    <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] bg-cyan-100/30 rounded-full blur-[100px]" />
                </div>

                {/* 1. HERO BANNER - Dashboard Optimized Size */}
                <Banner
                    onClick={() => syncObjectives(true)}
                    badge="PROTOCOLO FUNDAMENTAL: I CLARITY"
                    title="I Copilot"
                    titleSuffix="PRO"
                    description={
                        <>
                            Sistema Inteligente de Alto Rendimiento. Ejecuta tu{" "}
                            <span className="text-white font-bold tracking-tight">
                                Protocolo Clarity
                            </span>{" "}
                            diario para mantener enfoque absoluto y sincroniza
                            tus objetivos estratégicos en tiempo real.
                        </>
                    }
                />

                {/* 2. INTEGRATION BAR - Matches toolbar row in image */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8 bg-white/80 backdrop-blur-md px-6 py-4 rounded-3xl border border-slate-200/60 shadow-sm transition-all hover:bg-white">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2.5 px-3.5 py-2 bg-slate-100 rounded-xl border border-slate-200">
                            <Activity className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Sincronización de Ecosistema
                            </span>
                        </div>

                        <button
                            onClick={() => syncObjectives(true)}
                            className="group flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:text-blue-600 transition-all active:scale-95"
                            disabled={isLoadingTelegramData}
                        >
                            <RefreshCw
                                className={clsx(
                                    "w-3.5 h-3.5",
                                    isLoadingTelegramData && "animate-spin",
                                )}
                            />
                            <span className="text-[10px] font-bold uppercase tracking-wide">
                                Refrescar
                            </span>
                        </button>
                    </div>

                    {/* Integration Hub - Right Side Actions */}
                    <div className="flex items-center gap-3">
                        {/* Telegram */}
                        <button
                            onClick={() => handleConnect("Telegram")}
                            className={clsx(
                                "group flex items-center gap-3 px-4 py-2 border rounded-2xl transition-all duration-300",
                                telegramId
                                    ? "bg-emerald-50 border-emerald-100"
                                    : "bg-white border-slate-200 hover:border-blue-400 hover:bg-slate-50",
                            )}
                        >
                            <div className="w-6 h-6 flex items-center justify-center bg-[#0088cc]/10 rounded-lg text-[#0088cc]">
                                <svg
                                    viewBox="0 0 24 24"
                                    className="w-3.5 h-3.5 fill-current"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M11.944 0C5.352 0 0 5.352 0 11.944c0 6.592 5.352 11.944 11.944 11.944c6.592 0 11.944-5.352 11.944-11.944C23.888 5.352 18.536 0 11.944 0zm5.66 8.16l-1.928 9.096c-.144.644-.528.804-1.068.5l-2.936-2.164l-1.416 1.364c-.156.156-.288.288-.588.288l.212-3.04l5.524-4.992c.24-.212-.052-.332-.372-.12l-6.828 4.3l-2.948-.92c-.64-.2-.652-.64.132-.948l11.524-4.44c.532-.2.996.12.804.976z" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-0.5">
                                    Telegram
                                </p>
                                <p className="text-[11px] font-bold text-navy-900 leading-none">
                                    {telegramId
                                        ? `@${telegramData?.username || "Conectado"}`
                                        : "Vincular"}
                                </p>
                            </div>
                        </button>

                        {/* Google Calendar */}
                        <button
                            onClick={() => handleConnect("Calendar")}
                            className={clsx(
                                "group flex items-center gap-3 px-4 py-2 border rounded-2xl transition-all duration-300",
                                isConnected
                                    ? "bg-emerald-50 border-emerald-100"
                                    : "bg-white border-slate-200 hover:border-red-400 hover:bg-slate-50",
                            )}
                        >
                            <div className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-lg">
                                <svg
                                    viewBox="0 0 24 24"
                                    className="w-3.5 h-3.5"
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
                            </div>
                            <div className="text-left">
                                <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-0.5">
                                    Calendar
                                </p>
                                <p className="text-[11px] font-bold text-navy-900 leading-none">
                                    {isConnected ? "Conectado" : "Vincular"}
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
                    <>
                        {/* FULL WIDTH PROGRESS BAR (MOMENTUM) */}
                        <div className="w-full">
                            <div
                                className={cn(
                                    GLASS_PANEL,
                                    "p-8 relative overflow-hidden w-full shadow-[0_10px_40px_-10px_rgba(0,122,255,0.15)]",
                                )}
                            >
                                {/* Brillito de fondo */}
                                <div className="absolute -top-24 -right-24 w-64 h-64 bg-linear-to-br from-cyan-300/20 to-blue-500/20 rounded-full blur-3xl" />

                                <div className="flex justify-between items-end mb-5 relative z-10">
                                    <div>
                                        <h2 className="text-2xl font-bold tracking-tight text-[#1D1D1F] mb-1 flex items-center gap-2">
                                            Progreso Diario
                                        </h2>
                                        <p className="text-[#86868B] font-medium text-sm">
                                            Tu momentum se construye acción a
                                            acción.
                                        </p>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-[#1D1D1F] tracking-tighter">
                                            {Math.round(progress)}
                                        </span>
                                        <span className="text-lg font-medium text-[#86868B]">
                                            %
                                        </span>
                                    </div>
                                </div>

                                <div className="h-5 w-full bg-[#E5E5EA]/70 rounded-full overflow-hidden p-[3px] shadow-inner relative z-10">
                                    <motion.div
                                        layout
                                        className="h-full bg-linear-to-r from-cyan-400 via-[#007AFF] to-[#5856D6] rounded-full shadow-[0_0_20px_rgba(0,122,255,0.3)] relative"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 35,
                                            damping: 15,
                                        }}
                                    >
                                        <div
                                            className="absolute inset-0 w-full h-full bg-white/25 animate-shimmer"
                                            style={{
                                                backgroundImage:
                                                    "linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)",
                                            }}
                                        />
                                    </motion.div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-12 pb-12">
                            {/* LEFT: MAIN TASK LIST */}
                            <div className="lg:col-span-8 space-y-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">
                                        Lista de Acción Inteligente
                                    </h3>

                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <button
                                                onClick={() =>
                                                    calendarRef.current?.showPicker?.() ||
                                                    calendarRef.current?.click()
                                                }
                                                className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/40 border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:bg-white/80 hover:scale-105 hover:shadow-[0_8px_24px_rgba(0,122,255,0.12)] transition-all duration-500 text-slate-500 hover:text-[#007AFF] group relative overflow-hidden"
                                            >
                                                <div className="absolute inset-0 bg-linear-to-br from-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <Calendar className="w-5 h-5 group-active:scale-95 transition-transform relative z-10" />
                                            </button>
                                            <input
                                                ref={calendarRef}
                                                type="date"
                                                className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        const newDate =
                                                            new Date(
                                                                e.target.value,
                                                            );
                                                        setSelectedDate(
                                                            newDate,
                                                        );
                                                        showToast(
                                                            `Fecha: ${newDate.toLocaleDateString()}`,
                                                            "info",
                                                        );
                                                    }
                                                }}
                                            />
                                        </div>

                                        <div className="flex items-center gap-1 bg-white/30 backdrop-blur-md p-1 rounded-full border border-white/40 ring-1 ring-white/10">
                                            <button
                                                onClick={() => changeWeek(-1)}
                                                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-white/60 hover:text-blue-500 transition-all"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>

                                            {weekDays.map((d, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() =>
                                                        handleSelectDay(
                                                            d.fullDate,
                                                        )
                                                    }
                                                    className={cn(
                                                        "w-8 h-8 rounded-full flex flex-col items-center justify-center transition-all duration-300 relative group",
                                                        d.active
                                                            ? "bg-[#1D1D1F] text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] scale-105 z-10"
                                                            : "text-[#86868B] hover:bg-white/60 hover:text-black",
                                                    )}
                                                >
                                                    <span className="text-[7px] font-black leading-none mb-0.5 opacity-50 group-hover:opacity-100">
                                                        {d.day}
                                                    </span>
                                                    <span className="text-[11px] font-bold leading-none">
                                                        {d.date}
                                                    </span>
                                                    {d.active && (
                                                        <motion.div
                                                            layoutId="day-glow"
                                                            className="absolute -bottom-1 w-1 h-1 bg-blue-400 rounded-full shadow-[0_0_8px_#60A5FA]"
                                                        />
                                                    )}
                                                </button>
                                            ))}

                                            <button
                                                onClick={() => changeWeek(1)}
                                                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-white/60 hover:text-blue-500 transition-all"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pb-2">
                                    <div className="flex gap-2">
                                        {["high", "all", "quality"].map((f) => (
                                            <button
                                                key={f}
                                                onClick={() => setFilter(f)}
                                                className={cn(
                                                    "px-4 py-1.5 rounded-full text-[13px] font-medium transition-all capitalize border",
                                                    filter === f
                                                        ? "bg-white border-blue-200 text-blue-600 shadow-sm"
                                                        : "bg-transparent border-transparent text-[#86868B] hover:bg-white/50",
                                                )}
                                            >
                                                {f === "all"
                                                    ? "Todas"
                                                    : f === "high"
                                                      ? "Alto Impacto"
                                                      : "Protocolo de Calidad"}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={handleAddTask}
                                        className={cn(
                                            BTN_PRIMARY,
                                            "px-5 py-2 text-[13px] flex items-center gap-2 shadow-lg hover:shadow-blue-500/25",
                                        )}
                                    >
                                        <Plus className="w-4 h-4 stroke-3" />
                                        <span className="font-bold">
                                            Añadir Acción
                                        </span>
                                    </button>
                                </div>

                                <Reorder.Group
                                    axis="y"
                                    values={orderedTasks}
                                    onReorder={setOrderedTasks}
                                    className="space-y-4 pb-24"
                                >
                                    <AnimatePresence mode="popLayout">
                                        {orderedTasks.map((task) => (
                                            <ReorderItem
                                                key={task.id}
                                                task={task}
                                                setSelectedTask={
                                                    setSelectedTask
                                                }
                                                handleTaskToggle={
                                                    handleTaskToggle
                                                }
                                            />
                                        ))}
                                    </AnimatePresence>
                                </Reorder.Group>
                            </div>

                            {/* RIGHT: WIDGETS */}
                            <div className="lg:col-span-4 space-y-6">
                                {/* Lista de Documentos Importantes */}
                                <div
                                    className={cn(
                                        GLASS_PANEL,
                                        "p-6 bg-white/60 min-h-[300px] flex flex-col",
                                    )}
                                >
                                    <h4 className="text-sm font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-[#007AFF]" />
                                        Lista de Documentos Importantes
                                    </h4>
                                    <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1 flex items-center justify-center">
                                        <div className="text-center py-8">
                                            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                            <p className="text-xs font-medium text-slate-400">
                                                Sin documentos pendientes
                                            </p>
                                            <p className="text-[10px] text-slate-300 mt-1">
                                                Los documentos relevantes
                                                aparecerán aquí
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Protocolo de Acción */}
                                <div
                                    className={cn(
                                        GLASS_PANEL,
                                        "p-6 bg-white/60 flex flex-col",
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-sm font-semibold text-[#1D1D1F] flex items-center gap-2">
                                            <Target className="w-4 h-4 text-[#5856D6]" />
                                            Protocolo de Acción
                                        </h4>
                                        <button
                                            onClick={() => fetchStrategies()}
                                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                                        >
                                            <RefreshCw
                                                className={cn(
                                                    "w-3.5 h-3.5",
                                                    isLoadingStrategies &&
                                                        "animate-spin",
                                                )}
                                            />
                                        </button>
                                    </div>

                                    <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                                        {strategies.length > 0 ? (
                                            strategies.map((s) => {
                                                const normalizedStrategy = {
                                                    id: `strategy-${s._id}`,
                                                    id_real: s._id,
                                                    title: s.meta_detectada,
                                                    description: s.accion_1,
                                                    impact: "Medio",
                                                    score: 8.5,
                                                    area: "Estrategia",
                                                    completed: false,
                                                    type: "strategy",
                                                    agentState: "detected",
                                                    agentLog: [
                                                        {
                                                            time: "T0",
                                                            event: "Análisis de contexto completado",
                                                        },
                                                        {
                                                            time: "T1",
                                                            event: "Estrategia detectada por el Agente I",
                                                        },
                                                    ],
                                                };
                                                return (
                                                    <div
                                                        key={s._id}
                                                        onClick={() =>
                                                            setSelectedTask(
                                                                normalizedStrategy,
                                                            )
                                                        }
                                                        className="scale-95 origin-top opacity-90 hover:opacity-100 hover:scale-100 transition-all cursor-pointer"
                                                    >
                                                        <StrategyCard
                                                            strategy={s}
                                                        />
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                                <Target className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                                <p className="text-[10px] text-slate-400 font-medium">
                                                    Sin protocolos activos
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="space-y-4 xs:space-y-6 mb-8 xs:mb-12 animate-fade-in pb-4">
                        <div className="bg-white/50 backdrop-blur-sm p-5 sm:p-6 rounded-[2.5rem] border border-slate-200/60 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-display font-bold text-xl text-navy-950">
                                        Análisis de Rendimiento
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium">
                                        Estadísticas detalladas sobre tu
                                        constancia y ejecución de objetivos.
                                    </p>
                                </div>
                            </div>

                            {/* Streak Counter Component */}
                            <StreakCounter
                                current={streakData?.current || 0}
                                longest={streakData?.longest || 0}
                                isLoading={isLoadingMetrics}
                            />
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
                            <CompletionChart
                                data={chartData}
                                period="week"
                                isLoading={isLoadingMetrics}
                            />
                            <CalendarHeatmap
                                data={heatmapData}
                                isLoading={isLoadingMetrics}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* ACTION DRAWER (COMPLETE ACTIVITY DETAIL) */}
            <AnimatePresence>
                {selectedTask && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-[#000000]/15 backdrop-blur-[20px] z-9998"
                            onClick={() => setSelectedTask(null)}
                            style={{
                                position: "fixed",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                            }}
                        />
                        <motion.div
                            initial={{ x: "100%", opacity: 0.5 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: "100%", opacity: 0.5 }}
                            transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 40,
                            }}
                            className={cn(
                                "fixed top-0 right-0 h-full w-full sm:w-[550px] md:w-[650px] lg:w-[720px] z-9999 shadow-[-20px_0_60px_rgba(0,0,0,0.1)] flex flex-col",
                                "bg-white/80 backdrop-blur-[45px] border-l border-white/40 ring-1 ring-white/20",
                            )}
                        >
                            {/* Subtle inner gloss line */}
                            <div className="absolute inset-y-0 left-0 w-px bg-white/50 z-20" />

                            <div className="flex-1 flex flex-col p-8 xs:p-12 overflow-y-auto custom-scrollbar relative z-10">
                                {/* Drawer Header */}
                                <div className="flex items-center justify-between mb-12 shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-[#007AFF]/10 flex items-center justify-center border border-[#007AFF]/20">
                                            <Maximize2 className="w-5 h-5 text-[#007AFF]" />
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-[0.2em] text-[#007AFF]/80">
                                            Propiedades de Acción
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setSelectedTask(null)}
                                        className="w-10 h-10 flex items-center justify-center bg-white/40 hover:bg-white/80 rounded-full transition-all duration-300 group shadow-sm border border-white/60"
                                    >
                                        <X className="w-5 h-5 text-slate-500 group-hover:text-black group-hover:scale-110 transition-transform" />
                                    </button>
                                </div>

                                {/* Drawer Content Body */}
                                <div className="space-y-12">
                                    {/* Title & Desc */}
                                    <div className="space-y-6">
                                        <textarea
                                            value={selectedTask.title}
                                            onChange={(e) =>
                                                setSelectedTask({
                                                    ...selectedTask,
                                                    title: e.target.value,
                                                })
                                            }
                                            className="text-4xl xs:text-5xl font-bold text-[#1D1D1F] bg-transparent outline-none w-full placeholder:text-slate-200 resize-none h-auto overflow-hidden leading-[1.1] tracking-[-0.03em] border-none focus:ring-0 p-0"
                                            placeholder="Nombre de la acción..."
                                            rows={2}
                                        />
                                        <div className="h-[2px] w-20 bg-[#007AFF]/30 rounded-full" />
                                        <textarea
                                            value={
                                                selectedTask.description ||
                                                selectedTask.desc
                                            }
                                            onChange={(e) =>
                                                setSelectedTask({
                                                    ...selectedTask,
                                                    description: e.target.value,
                                                })
                                            }
                                            className="text-xl xs:text-2xl text-[#86868B] bg-transparent outline-none w-full placeholder:text-slate-300 resize-none min-h-[60px] border-none focus:ring-0 p-0 font-medium leading-relaxed"
                                            placeholder="Añadir descripción estratégica..."
                                        />
                                    </div>

                                    {/* Priority & Properties Grid */}
                                    <div className="bg-white/50 rounded-2xl p-5 border border-white/60 space-y-5">
                                        {/* Priority Selector (Interactive) */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-[#86868B] uppercase tracking-wide">
                                                Nivel de Impacto
                                            </label>
                                            <PrioritySelector
                                                current={selectedTask.impact}
                                                onChange={handleImpactChange}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-[#86868B] uppercase tracking-wide">
                                                    Área
                                                </label>
                                                <div className="relative">
                                                    <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <input
                                                        value={
                                                            selectedTask.area
                                                        }
                                                        onChange={(e) =>
                                                            setSelectedTask({
                                                                ...selectedTask,
                                                                area: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        className={cn(
                                                            INPUT_GLASS,
                                                            "w-full py-2.5 pl-9 text-sm font-medium text-[#1D1D1F]",
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-[#86868B] uppercase tracking-wide">
                                                    Fecha Límite
                                                </label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <input
                                                        value={
                                                            selectedTask.date ||
                                                            new Date()
                                                                .toISOString()
                                                                .split("T")[0]
                                                        }
                                                        onChange={(e) =>
                                                            setSelectedTask({
                                                                ...selectedTask,
                                                                date: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        className={cn(
                                                            INPUT_GLASS,
                                                            "w-full py-2.5 pl-9 text-sm font-medium text-[#1D1D1F]",
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Agent Activity Timeline */}
                                    <div className="bg-[#F5F5F7]/50 rounded-3xl p-6 border border-white/50">
                                        <h4 className="text-sm font-semibold text-[#1D1D1F] mb-6 flex items-center gap-2">
                                            <BrainCircuit className="w-4 h-4 text-[#007AFF]" />
                                            Actividad del Agente
                                        </h4>

                                        <div className="relative pl-4 space-y-8 border-l-2 border-[#E5E5EA] ml-1">
                                            {selectedTask.agentLog?.map(
                                                (
                                                    log: {
                                                        time: string;
                                                        event: string;
                                                    },
                                                    idx: number,
                                                ) => (
                                                    <div
                                                        key={idx}
                                                        className="relative"
                                                    >
                                                        <div className="absolute -left-[21px] top-1.5 w-3 h-3 bg-white border-[3px] border-[#007AFF] rounded-full shadow-sm" />
                                                        <p className="text-[11px] text-[#86868B] font-mono mb-1">
                                                            {log.time}
                                                        </p>
                                                        <p className="text-sm text-[#1D1D1F] font-medium">
                                                            {log.event}
                                                        </p>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div className="space-y-2 pb-6">
                                        <label className="text-xs font-bold text-[#86868B] uppercase tracking-wide">
                                            Notas Personales
                                        </label>
                                        <textarea
                                            className={cn(
                                                INPUT_GLASS,
                                                "w-full p-6 min-h-[180px] text-[15px] text-[#1D1D1F] resize-none leading-relaxed bg-white/60",
                                            )}
                                            placeholder="Escribe tus notas aquí..."
                                        />
                                    </div>
                                </div>

                                {/* Footer - Fixed at bottom */}
                                <div className="mt-12 pt-8 border-t border-white/40 flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={() => setSelectedTask(null)}
                                        className={cn(
                                            BTN_PRIMARY,
                                            "px-10 py-5 w-full shadow-2xl text-xl rounded-4xl",
                                        )}
                                    >
                                        Guardar Propiedades
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <AddActionModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleSaveNewAction}
            />
        </>
    );
}
