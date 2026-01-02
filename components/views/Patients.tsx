"use client";
import { UserPlus } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

const PATIENTS = [
  { name: "Javier M.", diagnosis: "Ansiedad G.", status: "Activo", color: "blue" },
  { name: "Ana R.", diagnosis: "Depresión Leve", status: "Revisión", color: "emerald" },
  { name: "Carlos D.", diagnosis: "Estrés Laboral", status: "Pausado", color: "orange" },
  { name: "Luisa P.", diagnosis: "TDAH Adulto", status: "Activo", color: "blue" },
];

export default function Patients() {
  const { showToast } = useToast();

  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-display font-bold text-2xl text-navy-900">Gestión de Pacientes</h3>
        <button 
          onClick={() => showToast('Añadir paciente...', 'info')} 
          className="bg-blue-600 text-slate-900 px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-blue-500 transition flex items-center gap-2 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> Nuevo Ingreso
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto custom-scroll pb-6">
        {PATIENTS.map((p, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col gap-4 hover:shadow-md transition hover:-translate-y-1 group">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                {p.name.substring(0, 2)}
              </div>
              <span className={`text-[0.6rem] font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${colorMap[p.color]}`}>
                {p.status}
              </span>
            </div>
            <div>
              <h4 className="font-bold text-navy-900 text-lg">{p.name}</h4>
              <p className="text-sm text-slate-500">{p.diagnosis}</p>
            </div>
            <button className="w-full py-2 bg-slate-50 text-slate-600 font-bold text-xs rounded-xl hover:bg-white hover:text-slate-900 transition cursor-pointer">
              Ver Expediente
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
