'use client';

import ComingSoon from '@/components/ComingSoon';
import { useAppStore } from '@/store/useAppStore';
import { Activity, Brain } from 'lucide-react';

export default function ClinicalRadar() {
  const { currentRole } = useAppStore();

  // Admin puede acceder a la interfaz completa
  if (currentRole === 'admin') {
    return (
      <div className="flex-1 overflow-y-auto custom-scroll safe-bottom-scroll scroll-smooth w-full animate-fade-in-up flex flex-col items-center bg-white text-slate-900">
        <div className="w-full px-2 xs:px-4 lg:px-12 py-8 max-w-[1700px]">
          {/* Header */}
          <div className="mb-8 p-6 bg-white/60 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-linear-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-bold tracking-[0.2em] text-purple-600 uppercase">
                Clinical Insights
              </span>
            </div>
            <h1 className="text-4xl font-bold text-navy-950 tracking-tight font-display mb-2">
              Análisis Multiaxial
            </h1>
            <p className="text-slate-600 font-medium text-lg">
              Sistema de Evaluación Clínica Integral
            </p>
          </div>

          {/* Content Placeholder */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                    Evaluación {i}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-navy-950 mb-2">
                  Análisis Clínico {i}
                </h3>
                <p className="text-slate-600 text-sm">
                  Herramientas de evaluación multiaxial estarán disponibles en esta sección.
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
      title="Análisis Multiaxial"
      subtitle="Sistema de Evaluación Clínica Integral próximamente"
      estimatedDate="Q2 2026"
    />
  );
}
