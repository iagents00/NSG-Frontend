'use client';

import ComingSoon from '@/components/ComingSoon';
import { useAppStore } from '@/store/useAppStore';
import { Newspaper, TrendingUp } from 'lucide-react';

export default function NSGNews() {
  const { currentRole } = useAppStore();

  // Admin puede acceder a la interfaz completa
  if (currentRole === 'admin') {
    return (
      <div className="flex-1 overflow-y-auto custom-scroll safe-bottom-scroll scroll-smooth w-full animate-fade-in-up flex flex-col items-center bg-white text-slate-900">
        <div className="w-full px-2 xs:px-4 lg:px-12 py-8 max-w-[1700px]">
          {/* Header */}
          <div className="mb-8 p-6 bg-white/60 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-linear-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg">
                <Newspaper className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-bold tracking-[0.2em] text-emerald-600 uppercase">
                Intelligence Feed
              </span>
            </div>
            <h1 className="text-4xl font-bold text-navy-950 tracking-tight font-display mb-2">
              NSG News
            </h1>
            <p className="text-slate-600 font-medium text-lg">
              Sistema de Inteligencia de Noticias Globales
            </p>
          </div>

          {/* Content Placeholder */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                    Global Insight
                  </span>
                </div>
                <h3 className="text-lg font-bold text-navy-950 mb-2">
                  Noticia de Ejemplo {i}
                </h3>
                <p className="text-slate-600 text-sm">
                  Contenido de la noticia estará disponible cuando se integre el feed de noticias.
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
      title="NSG News"
      subtitle="Sistema de Inteligencia de Noticias Globales en desarrollo"
      estimatedDate="Q2 2026"
    />
  );
}