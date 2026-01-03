"use client";
import { FileText, DownloadCloud } from "lucide-react";

export default function Deliverables() {
  return (
    <div className="h-full flex flex-col animate-fade-in-up pb-10">
      <h3 className="font-display font-bold text-2xl text-navy-900 mb-6">Mis Entregables</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
         <FileCard title="Plan de Acción Q4" type="Estrategia Personal" ext="PDF" size="2.1 MB" />
         <FileCard title="Rutina de Sueño" type="Wellness" ext="PDF" size="0.8 MB" />
         <FileCard title="Reporte Progreso" type="Mensual" ext="DOCX" size="1.5 MB" />
      </div>
    </div>
  );
}

function FileCard({ title, type, ext, size }: { title: string, type: string, ext: string, size: string }) {
    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 hover:border-blue-200 transition group cursor-pointer hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-navy-900">{title}</h4>
                    <p className="text-xs text-slate-500">{type}</p>
                </div>
            </div>
            <div className="flex justify-between items-center border-t border-slate-50 pt-3">
                <span className="text-xs font-bold text-slate-400">{ext} • {size}</span>
                <DownloadCloud className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
            </div>
        </div>
    )
}
