'use client';

import ComingSoon from '@/components/ComingSoon';
import { useAppStore } from '@/store/useAppStore';
import { Users, UserCircle } from 'lucide-react';

export default function Patients() {
  const { currentRole } = useAppStore();

  // Admin puede acceder a la interfaz completa
  if (currentRole === 'admin') {
    return (
      <div className="flex-1 overflow-y-auto custom-scroll safe-bottom-scroll scroll-smooth w-full animate-fade-in-up flex flex-col items-center bg-white text-slate-900">
        <div className="w-full px-2 xs:px-4 lg:px-12 py-8 max-w-[1700px]">
          {/* Header */}
          <div className="mb-8 p-6 bg-white/60 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-linear-to-br from-teal-600 to-teal-700 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-bold tracking-[0.2em] text-teal-600 uppercase">
                Patient Management
              </span>
            </div>
            <h1 className="text-4xl font-bold text-navy-950 tracking-tight font-display mb-2">
              Gestión de Pacientes
            </h1>
            <p className="text-slate-600 font-medium text-lg">
              Sistema de Expedientes Clínicos
            </p>
          </div>

          {/* Content Placeholder */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <UserCircle className="w-4 h-4 text-teal-600" />
                  <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                    Paciente {i}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-navy-950 mb-2">
                  Expediente Clínico {i}
                </h3>
                <p className="text-slate-600 text-sm">
                  Sistema de gestión de expedientes clínicos estará disponible en esta sección.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Otros roles ven ComingSoon
  return (
    <ComingSoon
      title="Gestión de Pacientes"
      subtitle="Sistema de Expedientes Clínicos en construcción"
      estimatedDate="Q2 2026"
    />
  );
}
