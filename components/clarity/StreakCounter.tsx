"use client";

import { useEffect, useState } from "react";
import { Flame, Trophy } from "lucide-react";
import clsx from "clsx";
import confetti from "canvas-confetti";
import { SkeletonStreakCounter } from "./SkeletonStreakCounter";

interface StreakCounterProps {
    current: number;
    longest: number;
    isLoading?: boolean;
}

export default function StreakCounter({ current, longest, isLoading = false }: StreakCounterProps) {
    const [prevCurrent, setPrevCurrent] = useState(current);
    const [showMilestone, setShowMilestone] = useState(false);

    // Milestones at 7, 14, 30, 60, 90 days
    const milestones = [7, 14, 30, 60, 90];
    const nextMilestone = milestones.find(m => m > current) || null;

    useEffect(() => {
        // Check if streak increased
        if (current > prevCurrent) {
            // New record
            if (current > longest) {
                confetti({ particleCount: 200, spread: 120, origin: { y: 0.5 } });
            }

            // Hit a milestone
            if (milestones.includes(current)) {
                setShowMilestone(true);
                confetti({
                    particleCount: 150,
                    spread: 100,
                    origin: { y: 0.6 },
                    colors: ['#FF6B35', '#F7931E', '#FDC830']
                });

                setTimeout(() => setShowMilestone(false), 4000);
            }
        }

        setPrevCurrent(current);
    }, [current, prevCurrent, longest]);

    if (isLoading) {
        return <SkeletonStreakCounter />;
    }

    return (
        <div className="relative">
            {/* Milestone Achievement Banner */}
            {showMilestone && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 animate-bounce-in">
                    <div className="bg-linear-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 whitespace-nowrap">
                        <Trophy className="w-5 h-5" />
                        <span className="font-bold text-sm">¡Hito de {current} días alcanzado!</span>
                    </div>
                </div>
            )}

            <div className="bg-linear-to-br from-orange-50 via-red-50 to-orange-50 p-6 sm:p-8 rounded-3xl border border-orange-200/50 shadow-lg relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                {/* Decorative Background */}
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-orange-300/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-red-300/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>

                <div className="relative z-10 flex items-center justify-between gap-6">
                    {/* Flame Icon + Current Streak */}
                    <div className="flex items-center gap-4">
                        <div className={clsx(
                            "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center transition-all duration-500 relative",
                            current > 0 ? "bg-linear-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/30 scale-100" : "bg-slate-200 scale-90"
                        )}>
                            {current > 0 && (
                                <div className="absolute inset-0 bg-orange-400 rounded-2xl animate-ping opacity-20"></div>
                            )}
                            <Flame className={clsx(
                                "w-8 h-8 sm:w-10 sm:h-10 relative z-10 transition-colors",
                                current > 0 ? "text-white" : "text-slate-400"
                            )} />
                        </div>

                        <div>
                            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                                Racha Actual
                            </p>
                            <div className="flex items-baseline gap-2">
                                <span className={clsx(
                                    "font-display font-bold transition-all duration-500",
                                    current > 0 ? "text-4xl sm:text-5xl text-orange-600" : "text-3xl sm:text-4xl text-slate-400"
                                )}>
                                    {current}
                                </span>
                                <span className="text-sm sm:text-base font-bold text-slate-400">
                                    {current === 1 ? "día" : "días"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="hidden sm:block w-px h-16 bg-linear-to-b from-transparent via-orange-300/50 to-transparent"></div>

                    {/* Record + Next Milestone */}
                    <div className="text-right">
                        <div className="mb-3">
                            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                                Tu Récord
                            </p>
                            <div className="flex items-center justify-end gap-1.5">
                                <Trophy className="w-4 h-4 text-amber-500" />
                                <span className="font-bold text-lg sm:text-2xl text-amber-600">
                                    {longest}
                                </span>
                                <span className="text-xs text-slate-400 font-medium">días</span>
                            </div>
                        </div>

                        {nextMilestone && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/60 backdrop-blur-sm rounded-full border border-orange-200">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-orange-600">
                                    Próximo hito: {nextMilestone} días
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress to Next Milestone */}
                {nextMilestone && (
                    <div className="mt-4 relative">
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                Progreso al siguiente hito
                            </span>
                            <span className="text-xs font-bold text-orange-600">
                                {Math.round((current / nextMilestone) * 100)}%
                            </span>
                        </div>
                        <div className="h-2 bg-white/50 rounded-full overflow-hidden shadow-inner">
                            <div
                                className="h-full bg-linear-to-r from-orange-500 to-red-500 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                                style={{ width: `${Math.min((current / nextMilestone) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
