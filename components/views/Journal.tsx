"use client";
import { Image, Mic } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

export default function Journal() {
  const { showToast } = useToast();

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col animate-fade-in-up pb-10">
      {/* Editor */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex-1 flex flex-col mb-6 min-h-[300px]">
        <textarea 
          className="flex-1 w-full resize-none focus:outline-none text-lg text-slate-700 placeholder-slate-300 p-2 bg-transparent" 
          placeholder="¿Qué tienes en mente hoy? Escribe libremente..." 
        />
        <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-4">
          <div className="flex gap-2 text-slate-400">
            <button className="p-2 hover:bg-slate-50 rounded-lg transition cursor-pointer"><Image className="w-5 h-5" /></button>
            <button className="p-2 hover:bg-slate-50 rounded-lg transition cursor-pointer"><Mic className="w-5 h-5" /></button>
          </div>
          <button 
            onClick={() => showToast('Entrada guardada', 'success')} 
            className="bg-white text-slate-900 px-6 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition cursor-pointer"
          >
            Guardar Entrada
          </button>
        </div>
      </div>

      {/* History */}
      <h3 className="font-bold text-navy-900 mb-4 px-2">Entradas Anteriores</h3>
      <div className="space-y-3 pb-6">
        <JournalEntry title="Reflexión Semanal" preview="Me sentí más enfocado durante..." time="Hoy, 10:00 AM" />
        <JournalEntry title="Notas de Sesión" preview="Importante recordar la técnica de..." time="Ayer, 4:30 PM" />
      </div>
    </div>
  );
}

function JournalEntry({ title, preview, time }: { title: string, preview: string, time: string }) {
  return (
    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-sm transition cursor-pointer group">
      <div className="flex justify-between mb-1">
        <h4 className="font-bold text-navy-900 text-sm group-hover:text-blue-600 transition">{title}</h4>
        <span className="text-xs text-slate-400">{time}</span>
      </div>
      <p className="text-xs text-slate-500 line-clamp-1">{preview}</p>
    </div>
  );
}
