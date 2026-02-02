"use client";

import React from "react";
import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock } from "lucide-react";
import BrandAtom from "@/components/ui/BrandAtom";
import ProjectSlider from "@/components/features/ProjectSlider";
import { CONTEXT, RoleType } from "@/data/context";

export default function BSIntelligence() {
    const { currentRole } = useAppStore();
    const router = useRouter();

    // Get current user's menu items
    const roleKey = (currentRole as RoleType) || "consultant"; // Default fallback
    const roleData = CONTEXT[roleKey] || CONTEXT.consultant;

    // Filter out the current view (Intelligence) to avoid redundancy in the grid
    const modules = roleData.menu.filter(
        (item) => item.id !== "nsg_intelligence",
    );

    // Lista de secciones bloqueadas con "Próximamente" (solo para roles que no son admin)
    const comingSoonSections = ["clinical_radar", "patients", "library"];

    return (
        <div className="flex-1 overflow-y-auto custom-scroll safe-bottom-scroll scroll-smooth w-full animate-fade-in-up flex flex-col items-center bg-slate-50/50 text-slate-900 selection:bg-blue-100">
            {/* Main Container */}
            <div className="w-full max-w-[1700px] px-6 lg:px-12 py-8 flex flex-col gap-8">
                
                {/* 2. Hero Slider */}
                <div className="w-full relative z-20 mt-6 lg:mt-8">
                    <ProjectSlider />
                </div>

                {/* 3. Section Title / Divider */}
                <div className="w-full text-center py-8 md:py-12 space-y-4">
                     <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/80 border border-blue-100 text-blue-600 text-[9px] font-black uppercase tracking-widest backdrop-blur-sm">
                        <BrandAtom className="w-3 h-3" variant="colored" />
                        Neural Orchestrator Active
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-navy-950">
                            Sistemas de Inteligencia <span className="text-blue-600">BS</span>
                        </h2>
                        <p className="text-slate-500 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                            Accede a tu red personalizada de herramientas tácticas y análisis profundo diseñados para maximizar tu impacto operativo.
                        </p>
                    </div>
                </div>

                {/* 4. Modules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full pb-24 relative z-10">
                    {modules.map((item, index) => {
                        // Admin puede acceder a todas las secciones
                        const isComingSoon =
                            currentRole !== "admin" &&
                            comingSoonSections.includes(item.id);
                        return (
                            <ModuleCard
                                key={item.id}
                                title={item.label}
                                description={item.subtitle}
                                icon={item.icon}
                                onClick={() =>
                                    router.push(`/dashboard/${item.id}`)
                                }
                                index={index}
                                isComingSoon={isComingSoon}
                            />
                        );
                    })}
                </div>
            </div>
            
             {/* Footer Info - Moved inside container or kept at bottom? The original had it inside, but let's keep it here for flow */}
             <div className="w-full max-w-[1700px] px-6 lg:px-12 pb-8">
                <div className="pt-8 border-t border-slate-200">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                        <div className="flex items-center gap-2 text-slate-500">
                            <BrandAtom className="w-4 h-4" variant="colored" />
                            <span className="text-xs xs:text-sm font-medium">
                                Potenciado por inteligencia artificial avanzada
                            </span>
                        </div>
                        <div className="text-[10px] xs:text-xs text-slate-400 font-medium">
                            Sistema actualizado • v1.0.0-BETA
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface ModuleCardProps {
    title: string;
    description: string;
    icon: React.ElementType;
    onClick: () => void;
    index: number;
    isComingSoon?: boolean;
}

function ModuleCard({
    title,
    description,
    icon: Icon,
    onClick,
    index,
    isComingSoon = false,
}: ModuleCardProps) {
    // Staggered animation delay
    const animationDelay = `${index * 50}ms`;

    return (
        <button
            onClick={isComingSoon ? undefined : onClick}
            style={{ animationDelay }}
            className={`
        relative group text-left h-[260px] xs:h-[320px] w-full bg-white rounded-2xl xs:rounded-3xl border border-slate-200 
        shadow-sm transition-all duration-500 cubic-bezier(0.25,1,0.5,1) 
        overflow-hidden p-5 xs:p-8 flex flex-col justify-between animate-fade-in-up fill-mode-backwards 
        will-change-transform
        ${
            isComingSoon
                ? "opacity-60 cursor-not-allowed"
                : "hover:border-blue-300 hover:shadow-[0_20px_50px_-10px_rgba(59,130,246,0.2)] hover:scale-[1.02] cursor-pointer"
        }
      `}
        >
            {/* Coming Soon Badge */}
            {isComingSoon && (
                <div className="absolute top-3 right-3 xs:top-4 xs:right-4 z-20">
                    <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                        <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        Próximamente
                    </span>
                </div>
            )}

            {/* Background Gradient Mesh */}
            {!isComingSoon && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                    <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0%,transparent_50%)] animate-spin-process" />
                </div>
            )}

            {/* Decorative Corner Blob */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-100/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

            {/* Top Row: Icon */}
            <div className="relative z-10 w-full flex justify-between items-start">
                <div
                    className={`
          w-16 h-16 rounded-2xl border flex items-center justify-center 
          transition-all duration-500 shadow-md
          ${
              isComingSoon
                  ? "bg-slate-100 border-slate-200 text-slate-400"
                  : "bg-white border-slate-200 text-slate-400 group-hover:bg-linear-to-br group-hover:from-blue-500 group-hover:to-blue-600 group-hover:border-transparent group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-200"
          }
        `}
                >
                    <Icon strokeWidth={1.5} className="w-8 h-8" />
                </div>

                {!isComingSoon && (
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 bg-white group-hover:bg-blue-600 group-hover:border-transparent transition-all duration-500 group-hover:-rotate-45 shadow-sm">
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                )}
            </div>

            {/* Bottom Row: Content */}
            <div className="relative z-10 w-full mt-auto">
                <h3
                    className={`
          text-2xl font-bold tracking-tight mb-3 transition-colors duration-300
          ${
              isComingSoon
                  ? "text-slate-400"
                  : "text-navy-950 group-hover:text-blue-600"
          }
        `}
                >
                    {title}
                </h3>
                <p
                    className={`
          text-[15px] font-medium leading-relaxed transition-colors line-clamp-2 pr-4
          ${
              isComingSoon
                  ? "text-slate-400"
                  : "text-slate-500 group-hover:text-slate-700"
          }
        `}
                >
                    {description}
                </p>

                {/* Active Indicator Line */}
                {!isComingSoon && (
                    <div className="absolute -bottom-2 left-0 h-1 w-0 bg-linear-to-r from-blue-500 via-blue-600 to-blue-700 group-hover:width-full transition-all duration-700 ease-in-out rounded-full" />
                )}
            </div>
        </button>
    );
}
