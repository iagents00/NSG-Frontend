"use client";

import React from "react";
import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Cpu, Lock, Zap } from "lucide-react";
import BrandAtom from "@/components/ui/BrandAtom";
import JarvisAssistant from "@/components/features/JarvisAssistant";
import { CONTEXT, RoleType } from "@/data/context";

export default function NSGIntelligence() {
    const { currentRole } = useAppStore();
    const router = useRouter();

    // Get current user's menu items
    const roleKey = (currentRole as RoleType) || "consultant"; // Default fallback
    const roleData = CONTEXT[roleKey] || CONTEXT.consultant;

    // Filter out the current view (Intelligence) to avoid redundancy in the grid
    const modules = roleData.menu.filter(
        (item) => item.id !== "nsg_intelligence",
    );

    // Lista de secciones bloqueadas con "Próximamente"
    const comingSoonSections = [
        "nsg_news",
        "clinical_radar",
        "patients",
        "library",
    ];

    return (
        <div className="flex-1 overflow-y-auto custom-scroll safe-bottom-scroll scroll-smooth w-full animate-fade-in-up flex flex-col items-center bg-white text-slate-900 selection:bg-blue-100">
            {/* Jarvis Assistant - Compact */}
            <div className="w-full relative z-20 mb-6 pt-6 px-2 xs:px-4 lg:px-12">
                <div className="relative mx-auto max-w-3xl">
                    <JarvisAssistant />
                </div>
            </div>

            <div className="w-full px-2 xs:px-4 lg:px-12 pb-24 max-w-[1700px] relative z-10">
                {/* Enhanced Section Header */}
                <div className="mb-8 xs:mb-12 relative">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 p-4 xs:p-6 sm:p-8 bg-white/60 backdrop-blur-sm rounded-2xl xs:rounded-3xl border border-slate-200/60 shadow-sm">
                        <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                                    <Cpu className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-[10px] font-bold tracking-[0.2em] text-blue-600 uppercase">
                                    Command Center
                                </span>
                            </div>
                            <h2 className="text-3xl xs:text-4xl lg:text-5xl font-bold text-navy-950 tracking-tight font-display">
                                Operative Modules
                            </h2>
                            <p className="text-slate-600 font-medium text-base xs:text-lg max-w-2xl">
                                Selecciona un vector neuronal para iniciar el
                                protocolo de ejecución.
                            </p>
                        </div>

                        {/* Access Level Badge */}
                        <div className="flex items-center gap-3 px-4 py-2.5 xs:px-6 xs:py-3 bg-emerald-50 rounded-xl xs:rounded-2xl border border-emerald-200 self-start md:self-auto">
                            <div className="flex flex-col items-end">
                                <p className="text-[9px] uppercase tracking-widest text-emerald-600 font-bold mb-1">
                                    Access Level
                                </p>
                                <span className="text-xs xs:text-sm font-bold text-emerald-700">
                                    {roleData.roleDesc}
                                </span>
                            </div>
                            <div className="w-2.5 h-2.5 xs:w-3 xs:h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-200 animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Enhanced Modules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xs:gap-6 w-full">
                    {modules.map((item, index) => {
                        const isComingSoon = comingSoonSections.includes(
                            item.id,
                        );
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

                {/* Footer Info */}
                <div className="mt-12 xs:mt-16 pt-8 border-t border-slate-200">
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
                  : "bg-white border-slate-200 text-slate-400 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-blue-600 group-hover:border-transparent group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-200"
          }
        `}
                >
                    <Icon strokeWidth={1.5} className="w-8 h-8" />
                </div>

                {!isComingSoon && (
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 bg-white group-hover:bg-blue-600 group-hover:border-transparent transition-all duration-500 group-hover:rotate-[-45deg] shadow-sm">
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
                    <div className="absolute -bottom-2 left-0 h-1 w-0 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 group-hover:width-full transition-all duration-700 ease-in-out rounded-full" />
                )}
            </div>
        </button>
    );
}
