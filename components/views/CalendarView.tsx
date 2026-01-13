"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, LogOut, RefreshCw, Search, Calendar } from "lucide-react";
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

  const jwtToken = typeof window !== 'undefined' ? localStorage.getItem('nsg-token') : null;

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

  // Get today's events
  const getTodayEvents = () => {
    const today = new Date();
    return events.filter(event => {
      const eventDateStr = event.start.dateTime || event.start.date;
      if (!eventDateStr) return false;
      const eventDate = new Date(eventDateStr);
      return eventDate.getDate() === today.getDate() &&
        eventDate.getMonth() === today.getMonth() &&
        eventDate.getFullYear() === today.getFullYear();
    });
  };

  const todayEvents = getTodayEvents();

  return (
    <div className="h-full flex flex-col animate-fade-in-up px-3 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
        <div>
          <h3 className="font-display font-bold text-2xl sm:text-3xl text-navy-900">
            {MONTHS[currentMonthIndex]} {currentYear}
          </h3>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          <div className="flex gap-1 shrink-0">
            <button onClick={() => changeMonth(-1)} className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 active:scale-95 transition cursor-pointer"><ChevronLeft className="w-4 h-4 text-slate-600" /></button>
            <button onClick={() => changeMonth(1)} className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 active:scale-95 transition cursor-pointer"><ChevronRight className="w-4 h-4 text-slate-600" /></button>
          </div>

          <button
            onClick={handleConnect}
            className={clsx(
              "px-3 sm:px-4 py-2 text-[0.65rem] sm:text-xs font-bold rounded-lg border active:scale-95 transition flex items-center gap-2 cursor-pointer shadow-sm shrink-0",
              isConnected
                ? "bg-white text-red-600 border-red-100 hover:bg-red-50"
                : "bg-white text-navy-900 border-slate-200 hover:bg-slate-50"
            )}
          >
            {isConnected ? (
              <>
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Desconectar</span><span className="xs:hidden">Off</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5 text-blue-500" />
                <span className="hidden xs:inline">Conectar</span><span className="xs:hidden">On</span>
              </>
            )}
          </button>

          {isConnected && (
            <button
              onClick={fetchEvents}
              disabled={isLoading}
              className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 active:scale-95 transition cursor-pointer disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={clsx("w-4 h-4 text-slate-600", isLoading && "animate-spin")} />
            </button>
          )}

          <button onClick={() => showToast('Nuevo Evento', 'info')} className="px-3 sm:px-4 py-2 bg-blue-600 text-white text-[0.65rem] sm:text-xs font-bold rounded-lg active:scale-95 transition hover:bg-blue-500 flex items-center gap-1 cursor-pointer shadow-lg shadow-blue-200 shrink-0"><Plus className="w-3 h-3" /> <span className="hidden xs:inline">Evento</span></button>
        </div>
      </div>

      {/* Today's Events Panel */}
      {isConnected && todayEvents.length > 0 && (
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 mb-4 shrink-0 animate-fade-in-up">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-blue-900 flex items-center gap-2 text-sm sm:text-base">
              <Calendar className="w-4 h-4" />
              Eventos de Hoy ({todayEvents.length})
            </h4>
            <span className="text-xs text-blue-600 font-medium">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto custom-scroll">
            {todayEvents.map(event => (
              <div key={event.id} className="text-xs sm:text-sm bg-white p-3 rounded-xl border border-blue-100 hover:border-blue-300 transition flex items-center gap-2 group">
                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></div>
                <span className="font-medium text-navy-900 flex-1">{event.summary}</span>
                {event.start.dateTime && (
                  <span className="text-xs text-slate-500 font-medium">
                    {new Date(event.start.dateTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-4xl shadow-card border border-slate-200 overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="grid grid-cols-7 bg-slate-50/50 border-b border-slate-200 py-3 shrink-0">
          {DAYS.map((d, i) => <div key={i} className="text-center text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 flex-1 bg-white overflow-y-auto custom-scroll">
          {daysArray.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isToday = day === new Date().getDate() && currentMonthIndex === new Date().getMonth() && currentYear === new Date().getFullYear();
            return (
              <div key={day} onClick={() => openDayDetail(`${day} ${MONTHS[currentMonthIndex]}`)} className={clsx("calendar-cell group cursor-pointer border-r border-b border-slate-50 p-1 sm:p-2 min-h-[80px] sm:min-h-[120px] flex flex-col gap-1 transition-colors hover:bg-slate-50", isToday && "bg-blue-50/30")}>
                <span className={clsx("text-[0.65rem] sm:text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full mb-0.5 sm:mb-1", isToday ? "text-white bg-blue-600 shadow-md" : "text-slate-400")}>{day}</span>

                <div className="flex flex-col gap-0.5 sm:gap-1 overflow-hidden">
                  {dayEvents.map(event => (
                    <div key={event.id} className="event-pill event-strategy bg-blue-50 text-blue-700 text-[0.5rem] sm:text-[0.6rem] px-1 sm:px-2 py-0.5 sm:py-1 rounded border-l-2 border-blue-500 font-bold truncate shadow-sm animate-fade-in-up">
                      {event.summary}
                    </div>
                  ))}
                  {!isConnected && day === 12 && <div className="event-pill event-strategy bg-slate-50 text-slate-600 text-[0.5rem] sm:text-[0.6rem] px-1 sm:px-2 py-0.5 sm:py-1 rounded border-l-2 border-slate-400 font-bold truncate opacity-50">Board Meeting</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
