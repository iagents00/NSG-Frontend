"use client";

import React, { useState, useEffect } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Brain,
    Target,
    TrendingUp,
    Users,
    Zap,
    Shield,
} from "lucide-react";
import clsx from "clsx";
import BrandAtom from "@/components/ui/BrandAtom";

// Slides del proyecto
const slides = [
    {
        id: 1,
        icon: Brain,
        title: "NSG Intelligence",
        subtitle: "Neural Strategic Gateway",
        description:
            "Infraestructura de inteligencia artificial de grado institucional. Procesa vectores de datos masivos para generar reconocimiento estratégico autónomo y soporte a la decisión de alta precisión.",
        gradient: "from-blue-400 to-cyan-400",
    },
    {
        id: 2,
        icon: Target,
        title: "Clarity Protocol",
        subtitle: "Ejecución Diaria de Alto Rendimiento",
        description:
            "Protocolo de precisión operativa y alineación estratégica. Sincroniza la ejecución táctica diaria con los objetivos macro-estratégicos mediante algoritmos adaptativos.",
        gradient: "from-emerald-400 to-teal-400",
    },
    {
        id: 3,
        icon: TrendingUp,
        title: "Horizon Planning",
        subtitle: "Arquitectura del Futuro",
        description:
            "Arquitectura de planificación predictiva basada en redes neuronales. Sintetiza el diálogo ejecutivo en hojas de ruta deterministas y proyecciones de escenarios futuros.",
        gradient: "from-blue-500 to-cyan-500",
    },
    {
        id: 4,
        icon: Users,
        title: "Ecosystem Integration",
        subtitle: "Sincronización Total",
        description:
            "Integración perfecta con Telegram, Google Calendar, Fathom Analytics y más, centralizando tu ecosistema digital en un solo lugar.",
        gradient: "from-cyan-400 to-teal-400",
    },
    {
        id: 5,
        icon: Zap,
        title: "Real-Time Analytics",
        subtitle: "Métricas de Alto Impacto",
        description:
            "Dashboard ejecutivo con visualizaciones premium que revelan patrones, tendencias y oportunidades de optimización continua.",
        gradient: "from-amber-400 to-orange-400",
    },
    {
        id: 6,
        icon: Shield,
        title: "Enterprise Security",
        subtitle: "Protección de Nivel Corporativo",
        description:
            "Arquitectura segura con autenticación robusta, encriptación end-to-end y cumplimiento de estándares internacionales de privacidad.",
        gradient: "from-slate-400 to-slate-300",
    },
];

export default function ProjectSlider() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Auto-play functionality - 3 seconds
    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 3000); // Change slide every 3 seconds

        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
        setIsAutoPlaying(false);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setIsAutoPlaying(false);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
        setIsAutoPlaying(false);
    };

    const current = slides[currentSlide];
    const Icon = current.icon;

    return (
        <div className="relative w-full min-h-[220px] sm:min-h-[280px] overflow-hidden bg-linear-to-r from-navy-950 via-navy-900 to-navy-950 px-5 py-5 sm:px-8 sm:py-10 rounded-3xl border border-navy-800/50 shadow-xl group/slider transition-all duration-700 hover:shadow-2xl select-none antialiased">
            {/* Content Container */}
            <div className="relative h-full flex flex-col items-center justify-between z-10">
                <div className="flex-1 flex flex-col items-center justify-center w-full">
                    {/* Icon */}
                    <div className="mb-4 relative">
                        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg transition-all duration-700 group-hover/slider:scale-110">
                            <Icon
                                className="w-7 h-7 sm:w-8 sm:h-8 text-white/80"
                                strokeWidth={1.5}
                            />
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="text-center max-w-3xl space-y-2">
                        <div className="space-y-1.5">
                            <h2
                                className={clsx(
                                    "font-display font-bold text-2xl sm:text-3xl lg:text-3xl tracking-tight text-white transition-all duration-700",
                                )}
                            >
                                {current.title}
                            </h2>
                            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                                {current.subtitle}
                            </p>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto px-4">
                            {current.description}
                        </p>
                    </div>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center gap-2 mt-6 sm:mt-8 mb-2">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={clsx(
                                "h-1 sm:h-1.5 rounded-full transition-all duration-500 hover:scale-110",
                                index === currentSlide
                                    ? "w-6 sm:w-10 bg-linear-to-r " +
                                          current.gradient
                                    : "w-1.5 bg-slate-700 hover:bg-slate-600",
                            )}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            {/* Navigation Buttons */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all duration-300 opacity-0 group-hover/slider:opacity-100 z-20"
                aria-label="Previous slide"
            >
                <ChevronLeft className="w-5 h-5 text-white/80" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all duration-300 opacity-0 group-hover/slider:opacity-100 z-20"
                aria-label="Next slide"
            >
                <ChevronRight className="w-5 h-5 text-white/80" />
            </button>

            {/* Slide Counter */}
            <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-sm">
                <span className="text-[10px] font-bold text-slate-300 tracking-wider">
                    {String(currentSlide + 1).padStart(2, "0")} /{" "}
                    {String(slides.length).padStart(2, "0")}
                </span>
            </div>

            {/* Brand Badge - Moved to Top-Left for symmetry */}
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-sm group-hover/slider:border-white/20 transition-all">
                <BrandAtom className="w-3 h-3" variant="colored" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-300 transition-colors">
                    NSG Platform
                </span>
            </div>
        </div>
    );
}
