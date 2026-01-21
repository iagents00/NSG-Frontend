"use client";

import { useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { Calendar } from "lucide-react";
import { SkeletonChart } from "@/components/ui/Skeleton";

interface CompletionChartProps {
    data: Array<{
        date: string;
        morning_clarity: number;
        power_check: number;
        next_day_planning: number;
    }>;
    period?: "week" | "month";
    isLoading?: boolean;
}

export default function CompletionChart({
    data,
    period = "week",
    isLoading = false,
}: CompletionChartProps) {
    const formatDate = (dateStr: string, period: "week" | "month") => {
        const date = new Date(dateStr);
        if (period === "week") {
            // Return day name: Lun, Mar, Mié, etc.
            return date
                .toLocaleDateString("es-ES", { weekday: "short" })
                .toUpperCase();
        } else {
            // Return day number: 1, 2, 3, etc.
            return date.getDate().toString();
        }
    };

    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];

        return data.map((item) => ({
            ...item,
            name: formatDate(item.date, period),
            total:
                item.morning_clarity +
                item.power_check +
                item.next_day_planning,
        }));
    }, [data, period]);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const total = payload.reduce(
                (sum: number, entry: any) => sum + entry.value,
                0,
            );
            return (
                <div className="bg-white p-4 rounded-xl shadow-2xl border border-slate-200">
                    <p className="font-bold text-navy-950 mb-2">
                        {payload[0].payload.date}
                    </p>
                    <div className="space-y-1">
                        {payload.map((entry: any) => (
                            <div
                                key={entry.name}
                                className="flex items-center justify-between gap-4 text-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-sm"
                                        style={{ backgroundColor: entry.color }}
                                    ></div>
                                    <span className="text-slate-600 font-medium capitalize">
                                        {entry.name.replace(/_/g, " ")}
                                    </span>
                                </div>
                                <span className="font-bold text-navy-950">
                                    {entry.value}
                                </span>
                            </div>
                        ))}
                        <div className="pt-2 mt-2 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-slate-500 font-bold text-xs uppercase">
                                Total
                            </span>
                            <span className="font-bold text-blue-600">
                                {total}
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    if (isLoading) {
        return <SkeletonChart />;
    }

    if (!chartData || chartData.length === 0) {
        return (
            <div className="bg-white p-8 sm:p-12 rounded-4xl border-2 border-dashed border-slate-200 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">
                    No hay datos suficientes para mostrar
                </p>
                <p className="text-slate-400 text-sm mt-1">
                    Completa protocolos para ver tu progreso
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h4 className="font-display font-bold text-lg sm:text-xl text-navy-950 flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        Tu Constancia en los Hábitos
                    </h4>
                    <p className="text-sm text-slate-500 mt-1">
                        Seguimiento de cumplimiento:{" "}
                        {period === "week"
                            ? "Última semana"
                            : "Últimos 30 días"}
                    </p>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#E2E8F0"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="name"
                        stroke="#94A3B8"
                        style={{ fontSize: "12px", fontWeight: "600" }}
                        tickLine={false}
                    />
                    <YAxis
                        stroke="#94A3B8"
                        style={{ fontSize: "12px", fontWeight: "600" }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: "#F1F5F9", opacity: 0.3 }}
                    />
                    <Legend
                        wrapperStyle={{ paddingTop: "20px" }}
                        iconType="circle"
                        formatter={(value) => (
                            <span className="text-sm font-medium text-slate-600 capitalize">
                                {value.replace(/_/g, " ")}
                            </span>
                        )}
                    />
                    <Bar
                        dataKey="morning_clarity"
                        name="Mañana"
                        fill="#10B981"
                        radius={[8, 8, 0, 0]}
                        maxBarSize={40}
                    />
                    <Bar
                        dataKey="power_check"
                        name="Mediodía"
                        fill="#3B82F6"
                        radius={[8, 8, 0, 0]}
                        maxBarSize={40}
                    />
                    <Bar
                        dataKey="next_day_planning"
                        name="Noche"
                        fill="#8B5CF6"
                        radius={[8, 8, 0, 0]}
                        maxBarSize={40}
                    />
                </BarChart>
            </ResponsiveContainer>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            Mañana
                        </p>
                    </div>
                    <p className="font-bold text-lg text-navy-950">
                        {chartData.reduce(
                            (sum, d) => sum + d.morning_clarity,
                            0,
                        )}
                    </p>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            Mediodía
                        </p>
                    </div>
                    <p className="font-bold text-lg text-navy-950">
                        {chartData.reduce((sum, d) => sum + d.power_check, 0)}
                    </p>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            Noche
                        </p>
                    </div>
                    <p className="font-bold text-lg text-navy-950">
                        {chartData.reduce(
                            (sum, d) => sum + d.next_day_planning,
                            0,
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}
