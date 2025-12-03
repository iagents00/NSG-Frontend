"use client";

import { useAppStore } from "@/store/useAppStore";
import { CONTEXT } from "@/data/context";
import { LogOut, Activity } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const { currentRole, isSidebarOpen } = useAppStore();
  const config = CONTEXT[currentRole];
  const pathname = usePathname();

  // Mobile drawer logic would go here (using isSidebarOpen to toggle class)

  return (
    <aside className={`fixed lg:static inset-y-0 left-0 w-72 bg-slate-950 flex flex-col text-slate-400 border-r border-slate-900 shadow-2xl z-[90] transition-transform duration-300 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      {/* Header */}
      <div className="h-24 flex items-center px-6 border-b border-slate-900 justify-between bg-slate-950/50 backdrop-blur-md sticky top-0 z-10 shrink-0">
         <div className="flex items-center gap-4">
             <div className="w-9 h-9 relative shrink-0">
                 <div className="w-full h-full animate-breathing bg-blue-500 rounded-full blur-md absolute opacity-50"></div>
                 <div className="w-full h-full rounded-full border border-blue-400 flex items-center justify-center relative z-10 bg-slate-900">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                 </div>
             </div>
             <div className="flex flex-col justify-center">
                <span className="font-display font-bold text-white text-lg tracking-tight whitespace-nowrap leading-none">NSG <span className="font-normal text-blue-400">Intelligence</span></span>
             </div>
         </div>
      </div>

      {/* User Profile */}
      <div className="p-6 shrink-0">
        <div className="flex items-center gap-3 bg-slate-900 p-4 rounded-2xl border border-white/5 shadow-inner group transition-all hover:bg-slate-800 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg border border-white/10 group-hover:scale-105 transition-transform">
                {config.avatar}
            </div>
            <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate leading-tight">{config.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest truncate">{config.roleDesc}</p>
                </div>
            </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scroll pb-10">
        {config.menu.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === `/${item.id}` || (item.id === 'nsg_ios' && pathname === '/');
            
            return (
                <Link 
                    key={item.id} 
                    href={item.id === 'nsg_ios' ? '/' : `/${item.id}`}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all mb-1 ${
                        item.special 
                        ? 'bg-gradient-to-r from-blue-900/40 to-slate-900/40 border border-blue-500/30 text-blue-300 shadow-glass' 
                        : isActive 
                            ? 'bg-white/10 text-white shadow-md' 
                            : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                    }`}
                >
                    <Icon className="w-5 h-5" />
                    {item.label}
                </Link>
            );
        })}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-slate-900 space-y-3 bg-slate-950 shrink-0">
         <div className="flex items-center justify-between px-3.5 py-2.5 text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest bg-slate-900/50 rounded-lg border border-white/5">
            <span>Precision Status</span>
            <span className="text-emerald-500 font-bold flex items-center gap-1"><Activity className="w-3 h-3" /> Optimal</span>
         </div>
         <button className="flex items-center gap-3 text-sm font-medium hover:text-white transition w-full p-2.5 rounded-lg hover:bg-white/5 text-slate-400 group">
            <LogOut className="w-4 h-4 group-hover:text-red-400 transition" /> Cerrar Sesión
         </button>
      </div>
    </aside>
  );
}
