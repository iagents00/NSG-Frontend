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

     const roleKey = currentRole || 'paciente';
     const config = CONTEXT[roleKey];
     
     // Assume path is /dashboard/[viewId]
     const segments = pathname.split('/').filter(Boolean);
     const currentViewId = segments[1]; // index 0 is 'dashboard'

     if (!currentViewId) return defaults;

     const activeItem = config?.menu.find(item => item.id === currentViewId);

     if (activeItem) {
        return { 
           title: activeItem.label, 
           // @ts-ignore - Subtitle added recently to context
           subtitle: activeItem.subtitle || defaults.subtitle 
        };
     }

     return defaults;
  }, [currentRole, pathname]);

  return (
    <header className="h-20 lg:h-24 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-4 sm:px-6 lg:px-10 sticky top-0 z-40 shrink-0 shadow-sm transition-all duration-300">
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2 -ml-2 text-navy-900 hover:bg-slate-100 rounded-lg transition cursor-pointer" onClick={toggleSidebar}>
          <Menu className="w-6 h-6" />
        </button>
        <div>
           <h2 className="font-display text-lg lg:text-2xl font-bold text-navy-900 truncate max-w-[180px] lg:max-w-none tracking-tight">{title}</h2>
           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5 hidden sm:block">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-6">
         {/* Notification Bell */}
         <div className="relative">
            <button onClick={() => setShowNotifs(!showNotifs)} className="w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-navy-900 transition relative border border-slate-200 shadow-sm hover:shadow-md cursor-pointer">
               <Bell className="w-5 h-5" />
               <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            
            {showNotifs && (
               <div className="absolute right-0 top-14 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-sovereign border border-slate-100 p-4 animate-fade-in-up origin-top-right z-50">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                     <h4 className="font-bold text-navy-900 text-sm">Notificaciones</h4>
                     <span className="text-[0.6rem] font-bold text-blue-600 cursor-pointer">Marcar leídas</span>
                  </div>
                  <div className="space-y-2">
                     <div className="flex gap-3 p-3 bg-slate-50/50 rounded-xl hover:bg-slate-100 transition cursor-pointer border border-transparent hover:border-slate-200">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg h-fit"><FileText className="w-4 h-4"/></div>
                        <div><p className="text-xs font-bold text-navy-900">Nuevo Reporte</p><p className="text-[0.65rem] text-slate-500 mt-0.5">Post-Consulta lista para revisión.</p></div>
                     </div>
                  </div>
               </div>
            )}
         </div>

         {/* AI Trigger Button */}
         <button onClick={toggleAI} className="group flex items-center justify-center gap-3 bg-navy-950 text-white pl-4 pr-6 py-2.5 rounded-full text-xs lg:text-sm font-bold shadow-2xl hover:bg-navy-900 transition-all transform hover:-translate-y-0.5 border border-navy-800 hover:shadow-glow relative overflow-hidden cursor-pointer">
            <div className="w-5 h-5 relative shrink-0 atom-container">
               <div className="w-full h-full atom-breathe">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-blue-300 group-hover:text-white transition-colors">
                     <circle cx="50" cy="50" r="42" className="morph-orbit orbit-1 ui-orbit" stroke="currentColor"/><circle cx="50" cy="50" r="42" className="morph-orbit orbit-2 ui-orbit" stroke="currentColor"/><circle cx="50" cy="50" r="42" className="morph-orbit orbit-3 ui-orbit" stroke="currentColor"/><circle cx="50" cy="50" r="14" fill="white"/>
                  </svg>
               </div>
            </div>
            <span className="hidden sm:inline tracking-tight">NSG <span className="text-blue-200 group-hover:text-white">Intelligence</span></span>
         </button>
      </div>
    </header>
  );
}