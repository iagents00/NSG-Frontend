"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useToast } from "@/components/ui/ToastProvider";
import clsx from "clsx";

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export default function CalendarView() {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(10); // Nov
  const { openDayDetail } = useUIStore();
  const { showToast } = useToast();

  const changeMonth = (delta: number) => {
    setCurrentMonthIndex((prev) => (prev + delta + 12) % 12);
  };

  // Mock days array to match legacy "30 days loop"
  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="h-full flex flex-col animate-fade-in-up">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div><h3 className="font-display font-bold text-3xl text-navy-900">{MONTHS[currentMonthIndex]} 2024</h3></div>
        <div className="flex gap-2">
          <button onClick={() => changeMonth(-1)} className="p-2 bg-white rounded-lg border hover:bg-slate-50 active:scale-95 transition cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={() => changeMonth(1)} className="p-2 bg-white rounded-lg border hover:bg-slate-50 active:scale-95 transition cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
          <button onClick={() => showToast('Nuevo Evento','info')} className="px-4 bg-blue-600 text-white text-xs font-bold rounded-lg active:scale-95 transition hover:bg-blue-500 flex items-center gap-1 cursor-pointer"><Plus className="w-3 h-3" /> Evento</button>
        </div>
      </div>
      <div className="bg-white rounded-[2rem] shadow-card border border-slate-200 overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="grid grid-cols-7 bg-slate-50/50 border-b border-slate-200 py-3 shrink-0">
          {DAYS.map((d, i) => <div key={i} className="text-center text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 flex-1 bg-white overflow-y-auto custom-scroll">
          {days.map((day) => {
            const hasEvent = [2, 5, 12, 15].includes(day);
            const isToday = day === 13;
            return (
              <div key={day} onClick={() => openDayDetail(`${day} ${MONTHS[currentMonthIndex]}`)} className={clsx("calendar-cell group cursor-pointer border-r border-b border-slate-50 p-2 min-h-[100px] flex flex-col gap-1 transition-colors hover:bg-slate-50", isToday && "bg-blue-50/30")}>
                <span className={clsx("text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1", isToday ? "text-white bg-blue-600 shadow-md" : "text-slate-400")}>{day}</span>
                {day === 12 && <div className="event-pill event-strategy bg-blue-50 text-blue-700 text-[0.65rem] px-2 py-1 rounded border-l-2 border-blue-500 font-bold truncate shadow-sm">Board Meeting</div>}
                {hasEvent && day !== 12 && <div className="event-pill event-strategy bg-blue-50 text-blue-700 text-[0.65rem] px-2 py-1 rounded border-l-2 border-blue-500 font-bold truncate shadow-sm">Reunión</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}