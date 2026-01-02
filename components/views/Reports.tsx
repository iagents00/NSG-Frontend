"use client";
import React from 'react';
import { FileText, Table, Shield, Presentation, DownloadCloud } from "lucide-react";

export default function Reports() {
  return (
    <div className="h-full animate-fade-in-up pb-10 px-4 sm:px-0">
      <h3 className="font-display font-bold text-xl sm:text-2xl text-navy-900 mb-6">Reportes & Data</h3>
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        <ReportCard name="Q3 Financials" meta="PDF • 2.4MB" icon={FileText} color="red" />
        <ReportCard name="User Growth" meta="XLS • 1.1MB" icon={Table} color="emerald" />
        <ReportCard name="Risk Analysis" meta="PDF • 5.2MB" icon={Shield} color="blue" />
        <ReportCard name="Team Performance" meta="PPT • 8.5MB" icon={Presentation} color="orange" />
      </div>

      <h3 className="font-display font-bold text-xl sm:text-2xl text-navy-900 mb-6 mt-12">Mis Entregables</h3>
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <FileCard title="Plan de Acción Q4" type="Estrategia Personal" ext="PDF" size="2.1 MB" />
        <FileCard title="Rutina de Sueño" type="Wellness" ext="PDF" size="0.8 MB" />
        <FileCard title="Reporte Progreso" type="Mensual" ext="DOCX" size="1.5 MB" />
      </div>
    </div>
  );
}

interface ReportCardProps {
  name: string;
  meta: string;
  icon: React.ElementType;
  color: 'red' | 'emerald' | 'blue' | 'orange';
}

function ReportCard({ name, meta, icon: Icon, color }: ReportCardProps) {
  const colors: Record<string, string> = {
    red: "bg-red-50 text-red-600 hover:bg-red-100",
    emerald: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
    blue: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    orange: "bg-orange-50 text-orange-600 hover:bg-orange-100"
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 hover:shadow-md transition cursor-pointer flex flex-col items-center text-center gap-4 group hover:-translate-y-1">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition ${colors[color].split(' ')[0]} ${colors[color].split(' ')[1]}`}>
        <Icon className="w-8 h-8" />
      </div>
      <div>
        <h4 className="font-bold text-navy-900">{name}</h4>
        <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-wide">{meta}</p>
      </div>
      <button className={`text-xs font-bold px-4 py-2 rounded-lg transition w-full cursor-pointer ${colors[color]}`}>
        Descargar
      </button>
    </div>
  );
}

interface FileCardProps {
  title: string;
  type: string;
  ext: string;
  size: string;
}

function FileCard({ title, type, ext, size }: FileCardProps) {
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
        <DownloadCloud className="w-4 h-4 text-blue-500" />
      </div>
    </div>
  );
}