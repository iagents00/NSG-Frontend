"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { SkeletonCalendarHeatmap } from "./SkeletonCalendarHeatmap";

interface HeatmapData {
    date: string;
    count: number;
    protocols: string[];
}

interface CalendarHeatmapProps {
    data: HeatmapData[];
    isLoading?: boolean;
}

export default function CalendarHeatmap({
    data,
    isLoading = false,
}: CalendarHeatmapProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const { weeks, monthName, emptyStart } = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const monthName = firstDay.toLocaleDateString("es-ES", {
            month: "long",
            year: "numeric",
        });

        // Get day of week (0 = Sunday, 1 = Monday, etc.)
        const startDayOfWeek = firstDay.getDay();
        const emptyStart = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Monday = 0

        const daysInMonth = lastDay.getDate();

        // Create array of all dates
        const dates: (Date | null)[] = [];

        // Add empty cells for days before month starts
        for (let i = 0; i < emptyStart; i++) {
            dates.push(null);
        }

        // Add all days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            dates.push(new Date(year, month, i));
        }

        // Group into weeks
        const weeks: (Date | null)[][] = [];
        while (dates.length > 0) {
            weeks.push(dates.splice(0, 7));
        }

        return { weeks, monthName, emptyStart };
    }, [currentMonth]);

    const getIntensity = (date: Date | null): number => {
        if (!date) return 0;

        const dateStr = date.toISOString().split("T")[0];
        const dayData = data.find((d) => d.date === dateStr);

        return dayData?.count || 0;
    };

    const getIntensityColor = (intensity: number): string => {
        if (intensity === 0) return "bg-slate-100 border-slate-200";
        if (intensity === 1) return "bg-blue-200 border-blue-300";
        if (intensity === 2) return "bg-blue-400 border-blue-500";
        return "bg-blue-600 border-blue-700"; // 3 protocols
    };

    const getDayData = (date: Date | null) => {
        if (!date) return null;
        const dateStr = date.toISOString().split("T")[0];
        return data.find((d) => d.date === dateStr);
    };

    const goToPreviousMonth = () => {
        setCurrentMonth(
            new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth() - 1,
                1,
            ),
        );
    };

    const goToNextMonth = () => {
        const today = new Date();
        const nextMonth = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth() + 1,
            1,
        );

        // Don't allow going beyond current month
        if (nextMonth <= today) {
            setCurrentMonth(nextMonth);
        }
    };

    const isCurrentMonthOrFuture = () => {
        const today = new Date();
        const nextMonth = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth() + 1,
            1,
        );
        return nextMonth > today;
    };

    if (isLoading) {
        return <SkeletonCalendarHeatmap />;
    }

    return (
        <div className="bg-white p-6 sm:p-8 rounded-4xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h4 className="font-display font-bold text-lg sm:text-xl text-navy-950 capitalize">
                    {monthName}
                </h4>

                <div className="flex items-center gap-2">
                    <button
                        onClick={goToPreviousMonth}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-navy-950"
                        aria-label="Mes anterior"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={goToNextMonth}
                        disabled={isCurrentMonthOrFuture()}
                        className={clsx(
                            "p-2 rounded-lg transition-colors",
                            isCurrentMonthOrFuture()
                                ? "text-slate-300 cursor-not-allowed"
                                : "hover:bg-slate-100 text-slate-600 hover:text-navy-950",
                        )}
                        aria-label="Mes siguiente"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
                {["L", "M", "X", "J", "V", "S", "D"].map((day, i) => (
                    <div
                        key={i}
                        className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 pb-2"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="space-y-2">
                {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="grid grid-cols-7 gap-2">
                        {week.map((date, dayIndex) => {
                            const intensity = getIntensity(date);
                            const dayData = getDayData(date);
                            const isToday =
                                date &&
                                date.toDateString() ===
                                    new Date().toDateString();

                            return (
                                <div key={dayIndex} className="relative group">
                                    <div
                                        className={clsx(
                                            "aspect-square rounded-lg border-2 transition-all duration-300 flex items-center justify-center relative overflow-hidden",
                                            date
                                                ? getIntensityColor(intensity)
                                                : "bg-transparent border-transparent",
                                            date &&
                                                "hover:scale-110 hover:shadow-md cursor-pointer",
                                            isToday &&
                                                "ring-2 ring-blue-500 ring-offset-2",
                                        )}
                                    >
                                        {date && (
                                            <span
                                                className={clsx(
                                                    "text-xs font-bold transition-colors",
                                                    intensity === 0
                                                        ? "text-slate-400"
                                                        : intensity < 3
                                                          ? "text-slate-700"
                                                          : "text-white",
                                                )}
                                            >
                                                {date.getDate()}
                                            </span>
                                        )}
                                    </div>

                                    {/* Tooltip */}
                                    {date && dayData && (
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                            <div className="bg-navy-950 text-white p-3 rounded-xl shadow-2xl whitespace-nowrap text-xs">
                                                <p className="font-bold mb-2">
                                                    {date.toLocaleDateString(
                                                        "es-ES",
                                                        {
                                                            weekday: "long",
                                                            day: "numeric",
                                                            month: "long",
                                                        },
                                                    )}
                                                </p>
                                                <div className="space-y-1">
                                                    <p className="text-blue-200">
                                                        {dayData.count}{" "}
                                                        {dayData.count === 1
                                                            ? "objetivo completado"
                                                            : "objetivos completados"}
                                                    </p>
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {dayData.protocols.includes(
                                                            "morning_clarity",
                                                        ) && (
                                                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-bold">
                                                                Mañana
                                                            </span>
                                                        )}
                                                        {dayData.protocols.includes(
                                                            "power_check",
                                                        ) && (
                                                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[10px] font-bold">
                                                                Mediodía
                                                            </span>
                                                        )}
                                                        {dayData.protocols.includes(
                                                            "next_day_planning",
                                                        ) && (
                                                            <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-[10px] font-bold">
                                                                Noche
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* Tooltip Arrow */}
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                                                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-navy-950"></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Menos
                    </span>
                    <div className="flex items-center gap-1">
                        {[0, 1, 2, 3].map((level) => (
                            <div
                                key={level}
                                className={clsx(
                                    "w-5 h-5 rounded border-2",
                                    getIntensityColor(level),
                                )}
                            />
                        ))}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Más
                    </span>
                </div>

                <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Días al 100%
                    </p>
                    <p className="font-bold text-lg text-blue-600">
                        {data.filter((d) => d.count === 3).length}
                    </p>
                </div>
            </div>
        </div>
    );
}
