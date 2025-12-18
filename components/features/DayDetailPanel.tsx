"use client";
import { useUIStore } from "@/store/useUIStore";
import { X, Plus } from "lucide-react";
import clsx from "clsx";

export default function DayDetailPanel() {
  const { isDayDetailOpen, selectedCalendarDate, closeDayDetail } = useUIStore();

  return (
    <>
      {/* Backdrop */}
      <div 
        className={clsx(
          "fixed inset-0 bg-navy-950/20 z-[105] backdrop-blur-sm transition-opacity duration-300",
          isDayDetailOpen ? "opacity-100 block" : "opacity-0 hidden pointer-events-none"
        )}
        onClick={closeDayDetail}
      />

      {/* Slide Over Panel */}
      <div className={clsx(
        "fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-[110] border-l border-slate-200 flex flex-col h-full",
        isDayDetailOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <div>
            <h3 className="font-display font-bold text-2xl text-navy-900">Agenda Diaria</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">{selectedCalendarDate}, 2024</p>
          </div>
          <button onClick={closeDayDetail} className="p-2 hover:bg-slate-200 rounded-full transition cursor-pointer">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto custom-scroll space-y-8 safe-bottom-scroll">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cronograma</h4>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">2 Eventos</span>
            </div>
            
            <div className="space-y-4">
              {/* Event Card */}
              <div className="flex gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <div className="flex flex-col items-center justify-center px-2 border-r border-slate-100">
                  <span className="text-xs font-bold text-slate-400">09:00</span>
                  <span className="text-xs font-bold text-slate-400">AM</span>
                </div>
                <div>
                  <h4 className="font-bold text-navy-900 text-sm">Revisión Trimestral</h4>
                  <p className="text-xs text-slate-500 mt-1">Estrategia • Virtual</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Notas & Objetivos</h4>
            <textarea 
              className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none transition" 
              placeholder="Escribe notas estratégicas para este día..."
            ></textarea>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-white shrink-0 safe-bottom-scroll">
          <button className="w-full py-4 bg-navy-900 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg cursor-pointer">
            <Plus className="w-4 h-4" /> Añadir Nuevo Evento
          </button>
        </div>
      </div>
    </>
  );
}