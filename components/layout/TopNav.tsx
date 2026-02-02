"use client";
import { useUIStore } from "@/store/useUIStore";
import { useAppStore } from "@/store/useAppStore";
import { CONTEXT } from "@/data/context";
import { Menu, Bell, FileText } from "lucide-react";
import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import BrandAtom from "@/components/ui/BrandAtom";

export default function TopNav() {
    const { toggleSidebar, openAI, setAIMode } = useUIStore();
    const { currentRole, userProfile } = useAppStore();
    const pathname = usePathname();
    const [showNotifs, setShowNotifs] = useState(false);

    // Derive telegram status from profile in store
    const hasTelegram = !!userProfile?.telegram_id;

    // Derive the dynamic title and subtitle
    const { title, subtitle } = useMemo(() => {
        // Default fallback
        const defaults = { title: "Dashboard", subtitle: "Resumen Ejecutivo" };

        if (!currentRole || !pathname) return defaults;

        const roleKey = currentRole || "paciente";
        const config = CONTEXT[roleKey];

        // Assume path is /dashboard/[viewId]
        const segments = pathname.split("/").filter(Boolean);
        const currentViewId = segments[1]; // index 0 is 'dashboard'

        if (!currentViewId) return defaults;

        const activeItem = config?.menu.find(
            (item) => item.id === currentViewId,
        );

        if (activeItem) {
            return {
                title: activeItem.label,
                subtitle: activeItem.subtitle || defaults.subtitle,
            };
        }

        return defaults;
    }, [currentRole, pathname]);

    return (
        <header className="h-20 lg:h-24 bg-white flex items-center justify-between px-4 sm:px-6 lg:px-10 sticky top-0 z-40 shrink-0 shadow-sm transition-all duration-300">
            <div className="flex items-center gap-4">
                <button
                    className="lg:hidden p-2 -ml-1 text-navy-900 hover:bg-slate-100 rounded-lg transition shrink-0 cursor-pointer"
                    onClick={toggleSidebar}
                >
                    <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <div className="overflow-hidden">
                    <div className="flex items-center gap-3 mb-0.5">
                        <h2 className="font-display text-lg sm:text-xl lg:text-xl font-bold text-navy-950 truncate tracking-tight">
                            {title}
                        </h2>
                        {/* Role Badge */}
                        {currentRole && (
                            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-wider border border-blue-100">
                                {CONTEXT[currentRole]?.roleDesc || "System Admin"}
                            </span>
                        )}
                    </div>
                    <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest hidden md:block pl-0.5">
                        {subtitle}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 shrink-0">
                {/* Notification Bell - Hidden on very small screens if space is tight */}
                <div className="relative hidden xs:block">
                    <button
                        onClick={() => setShowNotifs(!showNotifs)}
                        className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-full bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-navy-900 transition relative border border-slate-200 shadow-sm"
                    >
                        <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
                    </button>

                    {showNotifs && (
                        <div className="absolute right-0 top-14 w-72 sm:w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-sovereign border border-slate-100 p-3 sm:p-4 animate-fade-in-up origin-top-right z-50">
                            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                                <h4 className="font-bold text-navy-900 text-[0.7rem] sm:text-sm">
                                    Notificaciones
                                </h4>
                                <span className="text-[0.55rem] font-bold text-blue-600 cursor-pointer">
                                    Marcar leídas
                                </span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex gap-2 sm:gap-3 p-2 sm:p-3 bg-slate-50/50 rounded-xl">
                                    <div className="p-1.5 sm:p-2 bg-blue-100 text-blue-600 rounded-lg h-fit shrink-0">
                                        <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[0.65rem] sm:text-xs font-bold text-navy-900 truncate">
                                            Nuevo Reporte
                                        </p>
                                        <p className="text-[0.6rem] sm:text-[0.65rem] text-slate-500 mt-0.5 truncate">
                                            Post-Consulta lista para revisión.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* BS Intelligence AI Trigger Button */}
                <div className="relative group/intel">
                    <button
                        onClick={() => {
                            if (hasTelegram) {
                                setAIMode("nsg_intelligence");
                                openAI();
                            }
                        }}
                        disabled={!hasTelegram}
                        className={`group flex items-center justify-center gap-2 sm:gap-3 px-3 sm:pl-4 sm:pr-6 py-2 sm:py-2.5 rounded-full text-[0.7rem] sm:text-xs font-bold shadow-2xl transition-all border relative overflow-hidden shrink-0 ${
                            hasTelegram
                                ? "bg-navy-950 text-white border-navy-800 hover:bg-navy-900 cursor-pointer"
                                : "bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed opacity-60"
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 relative shrink-0">
                                <BrandAtom className="w-full h-full text-blue-300" variant="colored" />
                            </div>
                            <span className="tracking-tight uppercase text-[10px] sm:text-[11px] font-black">BS Intelligence</span>
                        </div>
                    </button>

                    {/* Tooltip when disabled */}
                    {!hasTelegram && (
                        <div className="absolute top-full mt-2 right-0 w-64 opacity-0 group-hover/intel:opacity-100 transition-opacity pointer-events-none z-50">
                            <div className="bg-navy-950 text-white text-[0.65rem] px-3 py-2 rounded-xl shadow-xl border border-navy-800">
                                <p className="font-bold mb-1">
                                    🔒 Telegram Requerido
                                </p>
                                <p className="text-slate-300">
                                    Conecta tu cuenta de Telegram en
                                    Configuración para activar BS Intelligence.
                                </p>
                                <div className="absolute top-0 right-4 transform -translate-y-1/2 rotate-45 w-2 h-2 bg-navy-950 border-l border-t border-navy-800"></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
