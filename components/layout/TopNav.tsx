"use client";
import { useUIStore } from "@/store/useUIStore";
import { useAppStore } from "@/store/useAppStore";
import { CONTEXT } from "@/data/context";
import { Menu, Bell, FileText } from "lucide-react";
import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";

export default function TopNav() {
  const { toggleSidebar, toggleAI } = useUIStore();
  const { currentRole } = useAppStore();
  const pathname = usePathname();
  const [showNotifs, setShowNotifs] = useState(false);

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

    const activeItem = config?.menu.find((item) => item.id === currentViewId);

    if (activeItem) {
      return {
        title: activeItem.label,
        subtitle: activeItem.subtitle || defaults.subtitle,
      };
    }

    return defaults;
  }, [currentRole, pathname]);

  return (
<<<<<<< HEAD
    <header className="h-20 lg:h-24 bg-white border-b border-slate-200/60 flex items-center justify-between px-4 sm:px-6 lg:px-10 sticky top-0 z-40 shrink-0 shadow-sm transition-all duration-300">
      <div className="flex items-center gap-4">
=======
    <header className="h-16 lg:h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-4 sm:px-6 lg:px-10 sticky top-0 z-40 shrink-0 shadow-sm transition-all duration-300">
      <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
>>>>>>> 7d4c4a9281d0a9e316e4ad28626e24b2ae4a5e84
        <button
          className="lg:hidden p-2 -ml-1 text-navy-900 hover:bg-slate-100 rounded-lg transition shrink-0"
          onClick={toggleSidebar}
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <div className="overflow-hidden">
          <h2 className="font-display text-sm sm:text-base lg:text-xl font-bold text-navy-900 truncate tracking-tight">
            {title}
          </h2>
          <p className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest mt-0.5 hidden md:block">
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

        {/* AI Trigger Button */}
        <button
          onClick={toggleAI}
          className="group flex items-center justify-center gap-2 sm:gap-3 bg-navy-950 text-white px-3 sm:pl-4 sm:pr-6 py-2 sm:py-2.5 rounded-full text-[0.7rem] sm:text-xs font-bold shadow-2xl hover:bg-navy-900 transition-all border border-navy-800 relative overflow-hidden shrink-0"
        >
          <div className="w-4 h-4 sm:w-5 sm:h-5 relative shrink-0 atom-container">
            <div className="w-full h-full atom-breathe">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full text-blue-300 transition-colors"
                fill="none"
                strokeWidth="4"
              >
                <circle cx="50" cy="50" r="42" stroke="currentColor" />
                <circle cx="50" cy="50" r="42" stroke="currentColor" style={{ transform: 'rotate(60deg) scaleY(0.4)' }} />
                <circle cx="50" cy="50" r="42" stroke="currentColor" style={{ transform: 'rotate(120deg) scaleY(0.4)' }} />
                <circle cx="50" cy="50" r="14" fill="white" />
              </svg>
            </div>
          </div>
          <span className="hidden xs:inline tracking-tight">
            NSG Intelligence
          </span>
          <span className="xs:hidden">IA</span>
        </button>
      </div>
    </header>
  );
}
