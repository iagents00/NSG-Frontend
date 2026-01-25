"use client";

import ComingSoon from "@/components/ComingSoon";
import { useAppStore } from "@/store/useAppStore";
import { Newspaper, TrendingUp } from "lucide-react";

export default function NSGNews() {
    const { currentRole } = useAppStore();

    // Admin puede acceder a la interfaz completa
    if (currentRole === "admin") {
        return (
            <div className="flex-1 overflow-y-auto custom-scroll safe-bottom-scroll scroll-smooth w-full animate-fade-in-up flex flex-col items-center bg-white text-slate-900">
                <div className="w-full px-2 xs:px-4 lg:px-12 py-8 max-w-[1700px]">
                    {/* Hero Banner (Clarity Style) */}
                    <div className="relative overflow-hidden bg-linear-to-br from-navy-950 via-slate-900 to-navy-950 px-5 py-6 sm:px-8 sm:py-8 rounded-4xl border border-white/5 shadow-2xl group transition-all duration-700 hover:shadow-emerald-500/10 mb-8 shrink-0">
                        <div className="relative z-10">
                            <h2 className="font-display font-bold text-2xl lg:text-3xl tracking-tight mb-2">
                                <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-blue-400">
                                    NSG News Intelligence
                                </span>
                            </h2>
                            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
                                Sistema de Inteligencia de Noticias Globales.
                                Mantente al día con análisis estratégicos de
                                noticias y tendencias globales en tiempo real.
                            </p>
                        </div>

                        {/* Background Accent */}
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-blue-500/10 transition-all duration-1000"></div>
                    </div>

                    {/* Content Placeholder */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all"
                            >
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
                                    Contenido de la noticia estará disponible
                                    cuando se integre el feed de noticias.
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
