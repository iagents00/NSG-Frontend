'use client';

import ComingSoon from '@/components/ComingSoon';
import { useAppStore } from '@/store/useAppStore';
import { BookOpen, FileText } from 'lucide-react';

export default function Library() {
  const { currentRole } = useAppStore();

  // Admin puede acceder a la interfaz completa
  if (currentRole === 'admin') {
    return (
      <div className="flex-1 overflow-y-auto custom-scroll safe-bottom-scroll scroll-smooth w-full animate-fade-in-up flex flex-col items-center bg-white text-slate-900">
        <div className="w-full px-2 xs:px-4 lg:px-12 py-8 max-w-[1700px]">
          {/* Header */}
          <div className="mb-8 p-6 bg-white/60 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-linear-to-br from-orange-600 to-orange-700 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-bold tracking-[0.2em] text-orange-600 uppercase">
                Knowledge Base
              </span>
            </div>
            <h1 className="text-4xl font-bold text-navy-950 tracking-tight font-display mb-2">
              Biblioteca de Recursos
            </h1>
            <p className="text-slate-600 font-medium text-lg">
              Centro de Documentación y Recursos
            </p>
          </div>

          {/* Content Placeholder */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                    Recurso {i}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-navy-950 mb-2">
                  Documento {i}
                </h3>
                <p className="text-slate-600 text-sm">
                  Contenido de la biblioteca estará disponible cuando se integre el sistema de gestión documental.
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
      title="Biblioteca de Recursos"
      subtitle="Centro de Documentación y Recursos próximamente"
      estimatedDate="Q3 2026"
    />
  );
}
