"use client";

import React, { useState, useEffect } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Brain,
    Target,
    TrendingUp,
    Users,
    Activity,
    Shield,
} from "lucide-react";
import clsx from "clsx";
import BrandAtom from "@/components/ui/BrandAtom";

// Slides del proyecto
const slides = [
    {
        id: 1,
        icon: Brain,
        title: "BS Intelligence",
        subtitle: "Neural Strategic Gateway",
        description:
            "Infraestructura de inteligencia artificial de grado institucional. Procesa vectores de datos masivos para generar reconocimiento estratégico.",
        gradient: "from-blue-400 to-cyan-400",
        badge: "NSG SYSTEM OS - CORE",
    },
    {
        id: 2,
        icon: Target,
        title: "Clarity Protocol",
        subtitle: "Ejecución Diaria de Alto Rendimiento",
        description:
            "Protocolo de precisión operativa y alineación estratégica. Sincroniza la ejecución táctica diaria con los objetivos macro-estratégicos.",
        gradient: "from-emerald-400 to-teal-400",
        badge: "NSG SYSTEM OS - EXECUTION",
    },
    {
        id: 3,
        icon: TrendingUp,
        title: "Horizon Planning",
        subtitle: "Arquitectura del Futuro",
        description:
            "Arquitectura de planificación predictiva basada en redes neuronales. Sintetiza el diálogo ejecutivo en hojas de ruta deterministas.",
        gradient: "from-blue-500 to-cyan-500",
        badge: "NSG SYSTEM OS - STRATEGY",
    },
    {
        id: 4,
        icon: Users,
        title: "Ecosystem Integration",
        subtitle: "Sincronización Total",
        description:
            "Integración perfecta con Telegram, Google Calendar, para centralizar tu ecosistema digital operativo en un solo lugar.",
        gradient: "from-cyan-400 to-teal-400",
        badge: "NSG SYSTEM OS - CONNECT",
    },
    {
        id: 5,
        icon: Activity,
        title: "Real-Time Analytics",
        subtitle: "Métricas de Alto Impacto",
        description:
            "Dashboard ejecutivo con visualizaciones premium que revelan patrones, tendencias y oportunidades de optimización continua.",
        gradient: "from-amber-400 to-orange-400",
        badge: "NSG SYSTEM OS - ENTERPRISE",
    },
    {
        id: 6,
        icon: Shield,
        title: "Enterprise Security",
        subtitle: "Protección de Nivel Corporativo",
        description:
            "Arquitectura segura con autenticación robusta, encriptación end-to-end y cumplimiento de estándares internacionales.",
        gradient: "from-slate-400 to-slate-300",
        badge: "NSG SYSTEM OS - SECURITY",
    },
];

interface ProjectSliderProps {
    onSlideChange?: (index: number) => void;
}

export default function ProjectSlider({ onSlideChange }: ProjectSliderProps) {
    // Start with index 0 (BS Intelligence)
    const [currentSlide, setCurrentSlide] = useState(0); 
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Auto-play functionality - 5 seconds
    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000); 

        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    useEffect(() => {
        if (onSlideChange) {
            onSlideChange(currentSlide);
        }
    }, [currentSlide, onSlideChange]);

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
        <div className="relative w-full min-h-[420px] bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100/60 overflow-hidden group/slider transition-all duration-700 flex flex-col items-center justify-center p-8 xs:p-10 relative">
            
            {/* Background Decor - Very subtle blur */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-slate-50 rounded-full blur-[100px] opacity-60 pointer-events-none" />

            {/* Navigation Buttons - Left/Right */}
            <button
                onClick={prevSlide}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-slate-100 shadow-lg shadow-slate-200/50 flex items-center justify-center hover:bg-slate-50 hover:scale-105 transition-all duration-300 z-30 group-hover/slider:opacity-100 opacity-60 md:opacity-0"
                aria-label="Previous slide"
            >
                <ChevronLeft className="w-5 h-5 text-slate-400" />
            </button>

            <button
                onClick={nextSlide}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-slate-100 shadow-lg shadow-slate-200/50 flex items-center justify-center hover:bg-slate-50 hover:scale-105 transition-all duration-300 z-30 group-hover/slider:opacity-100 opacity-60 md:opacity-0"
                aria-label="Next slide"
            >
                <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>

            {/* Content Container */}
            <div className="relative z-20 flex flex-col items-center text-center max-w-4xl mx-auto space-y-6 animate-fade-in">
                
                {/* 1. Icon & Badge */}
                <div className="flex flex-col items-center gap-4">
                    {/* Icon Circle */}
                    <div className="w-20 h-20 rounded-full bg-white shadow-[0_10px_30px_-5px_rgba(59,130,246,0.15)] flex items-center justify-center border border-blue-50/50 relative">
                        <div className="absolute inset-0 bg-blue-50/30 rounded-full animate-pulse-slow" />
                        <Icon strokeWidth={1.5} className="w-9 h-9 text-blue-600" />
                    </div>

                    {/* Badge */}
                    <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] border border-slate-100">
                        {current.badge}
                    </span>
                </div>

                {/* 2. Main Typography */}
                <div className="space-y-3">
                    <h2 className="text-4xl md:text-5xl lg:text-5xl font-bold tracking-tighter text-navy-950">
                        {current.title}
                    </h2>
                    <p className="text-base md:text-lg text-slate-400 font-medium tracking-tight">
                        {current.subtitle}
                    </p>
                </div>

                {/* 3. Description with Blue Vertical Line */}
                <div className="relative pl-6 py-1 max-w-xl mx-auto text-left border-l-4 border-blue-200">
                    <p className="text-slate-500 leading-relaxed text-sm md:text-base">
                        {current.description}
                    </p>
                </div>

                {/* 4. CTA and Pagination */}
                <div className="flex flex-col md:flex-row items-center gap-6 pt-2">
                    <button className="px-6 py-3 bg-navy-950 text-white rounded-xl font-bold text-xs tracking-wide shadow-xl shadow-navy-900/10 hover:shadow-navy-900/20 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 group/btn">
                        Explorar Módulo
                        <ChevronRight className="w-3.5 h-3.5 text-white/50 group-hover/btn:translate-x-1 transition-transform" />
                    </button>

                    {/* Pagination Dots */}
                    <div className="flex items-center gap-1.5">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={clsx(
                                    "transition-all duration-500 rounded-full",
                                    index === currentSlide
                                        ? "w-6 h-1 bg-blue-600"
                                        : "w-1 h-1 bg-slate-200 hover:bg-slate-300"
                                )}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
