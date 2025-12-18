"use client";

import { useUIStore } from "@/store/useUIStore";
import { X, Search, Plus } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";

// Mock Data (Replace with real API data later)
const PATIENTS = [
  { id: 1, initials: "JM", name: "Javier M.", lastSession: "Hoy", active: true, color: "bg-blue-600 text-white" },
  { id: 2, initials: "AR", name: "Ana R.", lastSession: "Ayer", active: false, color: "bg-emerald-100 text-emerald-700" },
  { id: 3, initials: "CD", name: "Carlos D.", lastSession: "10 Nov", active: false, color: "bg-purple-100 text-purple-700" },
];

export default function PatientFilesPanel() {
  // Access global state
  const { isPatientFilesOpen, togglePatientFiles } = useUIStore();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter Logic
  const filteredPatients = PATIENTS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* 1. Backdrop (Click to close) */}
      <div 
        className={clsx(
          "fixed inset-0 bg-navy-950/40 z-[130] backdrop-blur-sm transition-opacity duration-300",
          isPatientFilesOpen ? "opacity-100 block" : "opacity-0 hidden pointer-events-none"
        )}
        onClick={togglePatientFiles}
      />

      {/* 2. Slide-over Drawer */}
      <div 
        id="files-drawer"
        className={clsx(
          "fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl flex flex-col z-[131] transform transition-transform duration-300 h-full",
          isPatientFilesOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <div>
            <h3 className="font-display font-bold text-2xl text-navy-900">Biblioteca de Expedientes</h3>
            <p className="text-sm text-slate-500">Gestión centralizada de historiales clínicos.</p>
          </div>
          <button onClick={togglePatientFiles} className="p-2 hover:bg-slate-200 rounded-full transition cursor-pointer">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-slate-100 bg-white shrink-0">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar paciente por nombre o ID..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* List Container */}
        <div className="flex-1 overflow-y-auto custom-scroll p-6 space-y-3 safe-bottom-scroll">
          {filteredPatients.map((patient) => (
            <div 
              key={patient.id}
              className={clsx(
                "flex items-center justify-between p-4 bg-white border rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer group relative overflow-hidden",
                patient.active ? "border-blue-200" : "border-slate-100 hover:border-blue-200"
              )}
            >
              {patient.active && <div className="absolute left-0 top-0 w-1 h-full bg-blue-500"></div>}
              
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-sm ${patient.color}`}>
                  {patient.initials}
                </div>
                <div>
                  <h4 className="font-bold text-navy-900">{patient.name}</h4>
                  <p className="text-xs text-slate-500">Última sesión: {patient.lastSession}</p>
                </div>
              </div>
              
              <button className={clsx(
                "px-4 py-2 text-xs font-bold rounded-lg transition group-hover:bg-blue-600 group-hover:text-white cursor-pointer",
                patient.active ? "bg-slate-50 text-blue-600" : "bg-slate-50 text-slate-600"
              )}>
                {patient.active ? "Ver Activo" : "Abrir"}
              </button>
            </div>
          ))}
        </div>

        {/* Footer Action */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0 safe-bottom-scroll">
          <button className="w-full py-3 bg-navy-900 text-white rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg cursor-pointer">
            <Plus className="w-4 h-4" /> Nuevo Expediente
          </button>
        </div>
      </div>
    </>
  );
}