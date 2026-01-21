"use client";

import { Target, TrendingUp, Award, Calendar } from "lucide-react";
import clsx from "clsx";
import { useMemo } from "react";
import { SkeletonStatCard } from "@/components/ui/Skeleton";

interface MetricsData {
    totalCompletions: number;
    byProtocol: {
        morning_clarity: number;
        power_check: number;
        next_day_planning: number;
    };
    completionRate: number;
    activeDays: number;
    perfectDays: number;
    period: "week" | "month";
}

interface MetricsPanelProps {
    metrics: MetricsData;
    isLoading?: boolean;
}

export default function MetricsPanel({
    metrics,
    isLoading = false,
}: MetricsPanelProps) {
    const totalDays = metrics.period === "week" ? 7 : 30;

    const productivityScore = useMemo(() => {
        // Calculate productivity score (0-100)
        const completionWeight = (metrics.completionRate / 100) * 40; // 40% weight
        const perfectDaysWeight = (metrics.perfectDays / totalDays) * 100 * 30; // 30% weight
        const totalCompletionsWeight =
            Math.min((metrics.totalCompletions / (totalDays * 3)) * 100, 100) *
            30; // 30% weight

        return Math.round(
            completionWeight + perfectDaysWeight + totalCompletionsWeight,
        );
    }, [metrics, totalDays]);

    const getScoreColor = (score: number) => {
        if (score >= 80)
            return {
                bg: "bg-emerald-50",
                text: "text-emerald-600",
                border: "border-emerald-200",
                ring: "ring-emerald-500",
            };
        if (score >= 60)
            return {
                bg: "bg-blue-50",
                text: "text-blue-600",
                border: "border-blue-200",
                ring: "ring-blue-500",
            };
        if (score >= 40)
            return {
                bg: "bg-orange-50",
                text: "text-orange-600",
                border: "border-orange-200",
                ring: "ring-orange-500",
            };
        return {
            bg: "bg-slate-50",
            text: "text-slate-600",
            border: "border-slate-200",
            ring: "ring-slate-500",
        };
    };

    const scoreColors = getScoreColor(productivityScore);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <SkeletonStatCard key={i} />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Productivity Score */}
            <div
                className={clsx(
                    "p-6 rounded-4xl border-2 relative overflow-hidden group hover:shadow-lg transition-all duration-500",
                    scoreColors.bg,
                    scoreColors.border,
                )}
            >
                <div
                    className={clsx(
                        "absolute -right-8 -top-8 w-24 h-24 rounded-full opacity-20 blur-2xl group-hover:scale-150 transition-transform duration-700",
                        scoreColors.text,
                    )}
                    style={{ background: `currentColor` }}
                ></div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                        <div
                            className={clsx(
                                "w-10 h-10 rounded-xl flex items-center justify-center",
                                scoreColors.bg,
                                scoreColors.text,
                            )}
                        >
                            <Target className="w-5 h-5" />
                        </div>
                        <div
                            className={clsx(
                                "px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider",
                                scoreColors.bg,
                                scoreColors.text,
                            )}
                        >
                            Score
                        </div>
                    </div>

                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                        Tu Nivel de Enfoque
                    </p>
                    <div className="flex items-baseline gap-2">
                        <span
                            className={clsx(
                                "font-display font-bold text-4xl",
                                scoreColors.text,
                            )}
                        >
                            {productivityScore}
                        </span>
                        <span className="text-sm font-bold text-slate-400">
                            /100
                        </span>
                    </div>

                    {/* Progress Ring */}
                    <div className="mt-4">
                        <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
                            <div
                                className={clsx(
                                    "h-full rounded-full transition-all duration-1000",
                                    scoreColors.text.replace("text-", "bg-"),
                                )}
                                style={{ width: `${productivityScore}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Completion Rate */}
            <div className="bg-white p-6 rounded-4xl border-2 border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-500 relative overflow-hidden group">
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-blue-100 rounded-full opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700"></div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div className="px-2 py-1 bg-blue-50 rounded-full text-[9px] font-black uppercase tracking-wider text-blue-600">
                            Rate
                        </div>
                    </div>

                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                        Efectividad Semanal
                    </p>
                    <div className="flex items-baseline gap-2">
                        <span className="font-display font-bold text-4xl text-blue-600">
                            {metrics.completionRate.toFixed(0)}
                        </span>
                        <span className="text-sm font-bold text-slate-400">
                            %
                        </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-2 font-medium">
                        {metrics.activeDays} de {totalDays} días activos
                    </p>
                </div>
            </div>

            {/* Perfect Days */}
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-500 relative overflow-hidden group">
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-emerald-100 rounded-full opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700"></div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                            <Award className="w-5 h-5" />
                        </div>
                        <div className="px-2 py-1 bg-emerald-50 rounded-full text-[9px] font-black uppercase tracking-wider text-emerald-600">
                            Perfect
                        </div>
                    </div>

                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                        Días al 100%
                    </p>
                    <div className="flex items-baseline gap-2">
                        <span className="font-display font-bold text-4xl text-emerald-600">
                            {metrics.perfectDays}
                        </span>
                        <span className="text-sm font-bold text-slate-400">
                            días
                        </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-2 font-medium">
                        Los 3 protocolos completados
                    </p>
                </div>
            </div>

            {/* By Protocol */}
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-500 relative overflow-hidden group">
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-indigo-100 rounded-full opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700"></div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div className="px-2 py-1 bg-indigo-50 rounded-full text-[9px] font-black uppercase tracking-wider text-indigo-600">
                            Total
                        </div>
                    </div>

                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
                        Total de Logros
                    </p>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-xs font-medium text-slate-600">
                                    Morning
                                </span>
                            </div>
                            <span className="font-bold text-sm text-navy-950">
                                {metrics.byProtocol.morning_clarity}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span className="text-xs font-medium text-slate-600">
                                    Power
                                </span>
                            </div>
                            <span className="font-bold text-sm text-navy-950">
                                {metrics.byProtocol.power_check}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                <span className="text-xs font-medium text-slate-600">
                                    Next Day
                                </span>
                            </div>
                            <span className="font-bold text-sm text-navy-950">
                                {metrics.byProtocol.next_day_planning}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
