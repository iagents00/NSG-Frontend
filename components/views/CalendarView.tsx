"use client";
import { useState, useEffect } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    LogOut,
    RefreshCw,
    Calendar,
    Activity,
    ExternalLink,
} from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useToast } from "@/components/ui/ToastProvider";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import clsx from "clsx";

const MONTHS = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
];
const DAYS = ["L", "M", "M", "J", "V", "S", "D"];

interface CalendarEvent {
    id: string;
    summary: string;
    start: {
        dateTime?: string;
        date?: string;
    };
}

export default function CalendarView() {
    const [currentMonthIndex, setCurrentMonthIndex] = useState(
        new Date().getMonth(),
    );
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const { openDayDetail } = useUIStore();
    const { showToast } = useToast();

    const [isConnected, setIsConnected] = useState(false);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // 1. Verificar conexión inicial
    useEffect(() => {
        const checkConnection = async () => {
            try {
                const res = await api.get("/google/calendar/events");
                if (res.status === 200) {
                    setIsConnected(true);
                    setEvents(res.data);
                }
            } catch (error) {
                console.error("Error checking connection:", error);
                // Not connected or error, ignore
            }
        };
        checkConnection();
    }, []);

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const res = await api.get("/google/calendar/events");
            if (res.status === 200) {
                setEvents(res.data);
                showToast("Calendario actualizado", "success");
            }
        } catch (error) {
            console.error("Error fetching events:", error);
            showToast("Error al obtener eventos", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleConnect = async () => {
        if (isConnected) {
            // Desconectar
            try {
                const res = await api.delete("/google/calendar");
                if (res.status === 200) {
                    setIsConnected(false);
                    setEvents([]);
                    showToast("Google Calendar desconectado", "info");
                }
            } catch (error) {
                console.error("Error disconnecting:", error);
                showToast("Error al desconectar", "error");
            }
            return;
        }

        // Conectar
        try {
            const res = await api.get("/google/auth");
            if (res.data?.url) {
                window.open(res.data.url, "_blank");
            }
        } catch (error) {
            console.error("Error starting authentication:", error);
            showToast("Error al iniciar autenticación", "error");
        }
    };

    const changeMonth = (delta: number) => {
        let newMonth = currentMonthIndex + delta;
        let newYear = currentYear;
        if (newMonth < 0) {
            newMonth = 11;
            newYear--;
        } else if (newMonth > 11) {
            newMonth = 0;
            newYear++;
        }
        setCurrentMonthIndex(newMonth);
        setCurrentYear(newYear);
    };

    // Logic to get days of the month
    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const totalDays = getDaysInMonth(currentMonthIndex, currentYear);
    const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

    // Map events to days
    const getEventsForDay = (day: number) => {
        return events.filter((event) => {
            const eventDateStr = event.start.dateTime || event.start.date;
            if (!eventDateStr) return false;
            const eventDate = new Date(eventDateStr);
            return (
                eventDate.getDate() === day &&
                eventDate.getMonth() === currentMonthIndex &&
                eventDate.getFullYear() === currentYear
            );
        });
    };

    // Get today's events
    const getTodayEvents = () => {
        const today = new Date();
        return events.filter((event) => {
            const eventDateStr = event.start.dateTime || event.start.date;
            if (!eventDateStr) return false;
            const eventDate = new Date(eventDateStr);
            return (
                eventDate.getDate() === today.getDate() &&
                eventDate.getMonth() === today.getMonth() &&
                eventDate.getFullYear() === today.getFullYear()
            );
        });
    };

    const todayEvents = getTodayEvents();

    return (
        <div className="h-full flex flex-col px-1 xs:px-2 sm:px-0 gap-4 sm:gap-6">
            {/* 1. HEADER SECTION */}
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 sm:gap-6 shrink-0 bg-white/40 backdrop-blur-md p-4 sm:p-6 rounded-4xl sm:rounded-[2.5rem] border border-white/60 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 shrink-0">
                        <Activity className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="font-display font-bold text-2xl sm:text-3xl text-navy-900 tracking-tight">
                            {MONTHS[currentMonthIndex]} {currentYear}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">
                            Agenda Maestra • Gestión Estratégica
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto relative z-10">
                    <div className="flex bg-slate-100/80 p-1 rounded-xl items-center shadow-inner justify-between sm:justify-start">
                        <button
                            onClick={() => changeMonth(-1)}
                            className="p-1.5 xs:p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all active:scale-90 cursor-pointer text-slate-600"
                        >
                            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <div className="px-3 xs:px-4 text-[9px] xs:text-[10px] font-black text-slate-500 uppercase tracking-widest border-x border-slate-200/50 mx-1">
                            Hoy
                        </div>
                        <button
                            onClick={() => changeMonth(1)}
                            className="p-1.5 xs:p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all active:scale-90 cursor-pointer text-slate-600"
                        >
                            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                    </div>

                    <div className="h-6 w-px bg-slate-200/50 mx-1 hidden lg:block"></div>

                    <div className="flex gap-2 items-center">
                        <button
                            onClick={handleConnect}
                            className={clsx(
                                "flex-1 sm:flex-none justify-center px-3 sm:px-4 py-2 xs:py-2.5 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-xl active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-sm border",
                                isConnected
                                    ? "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100/50"
                                    : "bg-white text-navy-900 border-slate-200 hover:bg-slate-50",
                            )}
                        >
                            {isConnected ? (
                                <>
                                    <LogOut className="w-3.5 h-3.5" />
                                    <span className="xs:inline">
                                        Desconectar
                                    </span>
                                </>
                            ) : (
                                <>
                                    <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                                    <span className="xs:inline">Conectar</span>
                                </>
                            )}
                        </button>

                        {isConnected && (
                            <button
                                onClick={fetchEvents}
                                disabled={isLoading}
                                className="p-2 xs:p-2.5 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                                title="Sincronizar"
                            >
                                <RefreshCw
                                    className={clsx(
                                        "w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600",
                                        isLoading && "animate-spin",
                                    )}
                                />
                            </button>
                        )}

                        <button
                            disabled
                            className="flex-1 sm:flex-none justify-center px-3 sm:px-5 py-2 xs:py-2.5 bg-slate-50 text-slate-300 text-[10px] sm:text-xs font-bold rounded-xl flex items-center gap-2 cursor-not-allowed border border-slate-200"
                            title="Función disponible próximamente"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">
                                Próximamente
                            </span>
                            <span className="sm:hidden">Plus</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. TODAY'S HIGHLIGHTS */}
            <AnimatePresence mode="wait">
                {isConnected && todayEvents.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-navy-950 p-6 rounded-4xl mb-2 relative overflow-hidden shadow-2xl border border-white/10"
                    >
                        <div className="absolute inset-0 bg-blue-600/10 mix-blend-overlay"></div>
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
                                    <Activity className="w-7 h-7 text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-xl flex items-center gap-2">
                                        Insights para el día de hoy
                                        <span className="text-[10px] font-black bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full uppercase tracking-widest border border-blue-400/30">
                                            Neural Match
                                        </span>
                                    </h4>
                                    <p className="text-slate-400 text-sm mt-0.5 flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date().toLocaleDateString(
                                            "es-ES",
                                            {
                                                weekday: "long",
                                                day: "numeric",
                                                month: "long",
                                            },
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 custom-scroll">
                                {todayEvents.map((event) => (
                                    <motion.div
                                        key={event.id}
                                        whileHover={{ scale: 1.02 }}
                                        className="flex-none min-w-[200px] bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]"></div>
                                            <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">
                                                {event.start.dateTime
                                                    ? new Date(
                                                          event.start.dateTime,
                                                      ).toLocaleTimeString(
                                                          "es-ES",
                                                          {
                                                              hour: "2-digit",
                                                              minute: "2-digit",
                                                          },
                                                      )
                                                    : "Todo el día"}
                                            </span>
                                        </div>
                                        <p className="font-bold text-white text-sm line-clamp-1">
                                            {event.summary}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 3. CALENDAR GRID CONTAINER */}
            <div className="bg-white/70 backdrop-blur-xl rounded-4xl sm:rounded-[2.5rem] shadow-sovereign border border-white/60 overflow-hidden flex-1 flex flex-col min-h-0 relative">
                <div className="grid grid-cols-7 bg-slate-50/50 border-b border-slate-100 py-3 sm:py-4 shrink-0 px-1 sm:px-4">
                    {DAYS.map((d, i) => (
                        <div key={i} className="text-center">
                            <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest sm:tracking-widest">
                                {d}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 flex-1 bg-transparent overflow-y-auto custom-scroll p-1 xs:p-2 sm:p-4 gap-1 sm:gap-4 lg:gap-6">
                    {daysArray.map((day) => {
                        const dayEvents = getEventsForDay(day);
                        const isToday =
                            day === new Date().getDate() &&
                            currentMonthIndex === new Date().getMonth() &&
                            currentYear === new Date().getFullYear();

                        return (
                            <motion.div
                                key={day}
                                whileHover={{ scale: 1.01 }}
                                onClick={() =>
                                    openDayDetail(
                                        `${day} ${MONTHS[currentMonthIndex]}`,
                                    )
                                }
                                className={clsx(
                                    "relative group cursor-pointer rounded-2xl sm:rounded-3xl p-1.5 xs:p-2.5 sm:p-5 min-h-[70px] xs:min-h-[90px] sm:min-h-[160px] flex flex-col gap-1.5 xs:gap-3 transition-all duration-300",
                                    "border border-slate-100 bg-white/50 hover:bg-white hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-100",
                                    isToday &&
                                        "bg-blue-600/5 border-blue-200/50 ring-2 ring-blue-500/10",
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <span
                                        className={clsx(
                                            "text-xs sm:text-sm font-display font-bold w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg xs:rounded-xl sm:rounded-2xl transition-all",
                                            isToday
                                                ? "text-white bg-blue-600 shadow-md sm:shadow-lg shadow-blue-200 ring-2 sm:ring-4 ring-blue-100"
                                                : "text-navy-950 group-hover:text-blue-600 group-hover:bg-blue-50",
                                        )}
                                    >
                                        {day}
                                    </span>

                                    {dayEvents.length > 0 && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse group-hover:scale-125 transition-transform"></div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1 sm:gap-2 overflow-hidden flex-1">
                                    {dayEvents.slice(0, 2).map((event) => (
                                        <div
                                            key={event.id}
                                            className="bg-white/80 backdrop-blur-sm px-1.5 xs:px-3 py-1 sm:py-1.5 rounded-lg xs:rounded-xl border border-blue-50 hover:border-blue-200 text-navy-800 text-[8px] sm:text-[10px] font-bold truncate transition-all flex items-center gap-1 sm:gap-2 group/pill shadow-sm"
                                        >
                                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                                            <span className="truncate">
                                                {event.summary}
                                            </span>
                                        </div>
                                    ))}
                                    {dayEvents.length > 2 && (
                                        <div className="text-[7px] sm:text-[10px] font-black text-blue-500/60 pl-1 sm:pl-2 uppercase tracking-tight">
                                            + {dayEvents.length - 2}
                                        </div>
                                    )}

                                    {/* Empty state decoration */}
                                    {dayEvents.length === 0 && (
                                        <div className="flex-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="p-2 bg-slate-50 rounded-xl">
                                                <Plus className="w-4 h-4 text-slate-300" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
