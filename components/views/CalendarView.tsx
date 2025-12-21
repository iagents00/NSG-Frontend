"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, LogOut, RefreshCw } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useToast } from "@/components/ui/ToastProvider";
import clsx from "clsx";

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

interface CalendarEvent {
    id: string;
    summary: string;
    start: {
        dateTime?: string;
        date?: string;
    };
}

export default function CalendarView() {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const { openDayDetail } = useUIStore();
  const { showToast } = useToast();
  
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const jwtToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // 1. Verificar conexión inicial
  useEffect(() => {
    const checkConnection = async () => {
        if (!jwtToken) return;
        try {
            const res = await fetch('https://nsg-backend.onrender.com/google/calendar/events', {
                headers: { 'Authorization': jwtToken }
            });
            if (res.ok) {
                setIsConnected(true);
                const data = await res.json();
                setEvents(data);
            }
        } catch (error) {
            console.error("Error checking calendar connection:", error);
        }
    };
    checkConnection();
  }, [jwtToken]);

  const fetchEvents = async () => {
    if (!jwtToken) return;
    setIsLoading(true);
    try {
        const res = await fetch('https://nsg-backend.onrender.com/google/calendar/events', {
            headers: { 'Authorization': jwtToken }
        });
        if (res.ok) {
            const data = await res.json();
            setEvents(data);
            showToast('Calendario actualizado', 'success');
        }
    } catch (error) {
        showToast('Error al obtener eventos', 'error');
        console.error(error);
    } finally {
        setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (isConnected) {
        // Desconectar
        try {
            const res = await fetch('https://nsg-backend.onrender.com/google/calendar', {
                method: 'DELETE',
                headers: { 'Authorization': jwtToken || '' }
            });
            if (res.ok) {
                setIsConnected(false);
                setEvents([]);
                showToast('Google Calendar desconectado', 'info');
            }
        } catch (error) {
            showToast('Error al desconectar', 'error');
            console.error(error);
        }
        return;
    }

    // Conectar
    try {
        const res = await fetch('https://nsg-backend.onrender.com/google/auth', {
            headers: { 'Authorization': jwtToken || '' }
        });
        const data = await res.json();
        if (data.url) {
            window.open(data.url, '_blank');
        }
    } catch (error) {
        showToast('Error al iniciar autenticación', 'error');
        console.error(error);
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
    return events.filter(event => {
        const eventDateStr = event.start.dateTime || event.start.date;
        if (!eventDateStr) return false;
        const eventDate = new Date(eventDateStr);
        return eventDate.getDate() === day && 
               eventDate.getMonth() === currentMonthIndex && 
               eventDate.getFullYear() === currentYear;
    });
  };

  return (
    <div className="h-full flex flex-col animate-fade-in-up">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div><h3 className="font-display font-bold text-3xl text-navy-900">{MONTHS[currentMonthIndex]} {currentYear}</h3></div>
        <div className="flex gap-2">
          <button onClick={() => changeMonth(-1)} className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 active:scale-95 transition cursor-pointer"><ChevronLeft className="w-4 h-4 text-slate-600" /></button>
          <button onClick={() => changeMonth(1)} className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 active:scale-95 transition cursor-pointer"><ChevronRight className="w-4 h-4 text-slate-600" /></button>
          
          <button 
            onClick={handleConnect} 
            className={clsx(
                "px-4 text-xs font-bold rounded-lg border active:scale-95 transition flex items-center gap-2 cursor-pointer shadow-sm",
                isConnected 
                    ? "bg-white text-red-600 border-red-100 hover:bg-red-50" 
                    : "bg-white text-navy-900 border-slate-200 hover:bg-slate-50"
            )}
          >
            {isConnected ? (
                <>
                    <LogOut className="w-3.5 h-3.5" />
                    Desconectar <span className="hidden sm:inline">Calendar</span>
                </>
            ) : (
                <>
                    <div className="w-4 h-4 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                    </div>
                    Conectar <span className="hidden sm:inline">Calendar</span>
                </>
            )}
          </button>

          {isConnected && (
            <button 
                onClick={fetchEvents}
                disabled={isLoading}
                className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 active:scale-95 transition cursor-pointer disabled:opacity-50"
            >
                <RefreshCw className={clsx("w-4 h-4 text-slate-600", isLoading && "animate-spin")} />
            </button>
          )}

          <button onClick={() => showToast('Nuevo Evento','info')} className="px-4 bg-blue-600 text-white text-xs font-bold rounded-lg active:scale-95 transition hover:bg-blue-500 flex items-center gap-1 cursor-pointer shadow-lg shadow-blue-200"><Plus className="w-3 h-3" /> Evento</button>
        </div>
      </div>
      <div className="bg-white rounded-4xl shadow-card border border-slate-200 overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="grid grid-cols-7 bg-slate-50/50 border-b border-slate-200 py-3 shrink-0">
          {DAYS.map((d, i) => <div key={i} className="text-center text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 flex-1 bg-white overflow-y-auto custom-scroll">
          {daysArray.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isToday = day === new Date().getDate() && currentMonthIndex === new Date().getMonth() && currentYear === new Date().getFullYear();
            return (
              <div key={day} onClick={() => openDayDetail(`${day} ${MONTHS[currentMonthIndex]}`)} className={clsx("calendar-cell group cursor-pointer border-r border-b border-slate-50 p-2 min-h-[120px] flex flex-col gap-1 transition-colors hover:bg-slate-50", isToday && "bg-blue-50/30")}>
                <span className={clsx("text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1", isToday ? "text-white bg-blue-600 shadow-md" : "text-slate-400")}>{day}</span>
                
                <div className="flex flex-col gap-1 overflow-hidden">
                    {dayEvents.map(event => (
                        <div key={event.id} className="event-pill event-strategy bg-blue-50 text-blue-700 text-[0.6rem] px-2 py-1 rounded border-l-2 border-blue-500 font-bold truncate shadow-sm animate-fade-in-up">
                            {event.summary}
                        </div>
                    ))}
                    {!isConnected && day === 12 && <div className="event-pill event-strategy bg-slate-50 text-slate-600 text-[0.6rem] px-2 py-1 rounded border-l-2 border-slate-400 font-bold truncate opacity-50">Board Meeting (Ejemplo)</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
