"use client";
import React from 'react';
import { Search, FileText, Headphones, Book, Layout } from "lucide-react";

export default function Library() {
  return (
    <div className="h-full flex flex-col animate-fade-in-up pb-10">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h3 className="font-display font-bold text-2xl text-navy-900">Biblioteca de Recursos</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar artículo..." 
            className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto custom-scroll pb-6">
        <ResourceCard title="Ansiedad Cognitiva" desc="Protocolo TCC estándar." icon={FileText} color="blue" />
        <ResourceCard title="Meditación Guiada" desc="Audio MP3 - 15 min." icon={Headphones} color="purple" />
        <ResourceCard title="Lectura: Hábitos" desc="PDF - Atomic Habits." icon={Book} color="emerald" />
        <ResourceCard title="Journal Template" desc="Plantilla Notion." icon={Layout} color="orange" />
      </div>
    </div>
  );
}

interface ResourceCardProps {
  title: string;
  desc: string;
  icon: React.ElementType;
  color: 'blue' | 'purple' | 'emerald' | 'orange';
}

function ResourceCard({ title, desc, icon: Icon, color }: ResourceCardProps) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 hover:border-blue-200",
    purple: "bg-purple-50 text-purple-600 hover:border-purple-200",
    emerald: "bg-emerald-50 text-emerald-600 hover:border-emerald-200",
    orange: "bg-orange-50 text-orange-600 hover:border-orange-200"
  };

  return (
    <div className={`bg-white p-6 rounded-[2rem] border border-slate-200 hover:shadow-lg transition cursor-pointer group flex items-center gap-4 hover:-translate-y-1 ${colors[color].split(' ')[2]}`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${colors[color].split(' ').slice(0,2).join(' ')}`}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <h4 className={`font-bold text-navy-900 text-lg transition ${colors[color].split(' ')[1].replace('text','group-hover:text')}`}>{title}</h4>
        <p className="text-xs text-slate-500 mt-1">{desc}</p>
      </div>
    </div>
  );
}