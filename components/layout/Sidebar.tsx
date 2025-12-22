"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useUIStore } from "@/store/useUIStore"; // Imported for mobile toggling
import { CONTEXT } from "@/data/context";
import { LogOut, Activity, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "@/lib/auth";
import clsx from "clsx";
import BrandAtom from "@/components/ui/BrandAtom";

export default function Sidebar() {
  // 1. Merge State Management
  const { currentRole } = useAppStore();
  const { isSidebarOpen, toggleSidebar } = useUIStore(); // Controls mobile state
  const pathname = usePathname();
  const router = useRouter();
  
  const [username, setUsername] = useState<string | null>(null);

  // Safety check: fallback to 'paciente' or handle null if store is empty initially
  const roleKey = currentRole || 'paciente';
  const config = CONTEXT[roleKey];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authService.verifySession();
        // Correctly access 'user' (lowercase) based on API response
        if (data?.user?.username) {
          setUsername(data.user.username);
        }
      } catch (error) {
        console.error("Failed to fetch user info", error);
      }
    };
    fetchUser();
  }, []);

  return (
    <>
      {/* 2. Mobile Overlay (From my design) */}
      {/* Clicking the backdrop closes the sidebar on mobile */}
      <div 
        className={clsx(
          "fixed inset-0 bg-navy-950/80 z-[80] backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          isSidebarOpen ? "opacity-100 block" : "opacity-0 hidden pointer-events-none"
        )}
        onClick={toggleSidebar}
      />

      {/* 3. Main Sidebar Container */}
      <aside className={clsx(
        "fixed lg:static inset-y-0 left-0 w-72 bg-navy-950 flex flex-col text-slate-400 border-r border-navy-900 shadow-2xl z-[90] transition-transform duration-300 ease-in-out transform h-full",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        
        {/* HEADER: High-End Atom Animation + Brand */}
        <div className="h-24 flex items-center px-6 border-b border-navy-900 justify-between bg-navy-950/50 backdrop-blur-md sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-4 flex-nowrap overflow-hidden min-w-max">
             {/* The Complex SVG Atom */}
             <div className="w-9 h-9 relative shrink-0 atom-container">
                <div className="w-full h-full atom-breathe">
                   <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                      <defs><linearGradient id="sidebarGrad" x1="0" y1="0" x2="100" y2="100"><stop offset="0" stopColor="#60A5FA"/><stop offset="1" stopColor="#FFFFFF"/></linearGradient></defs>
                      <circle cx="50" cy="50" r="42" className="morph-orbit orbit-1 sidebar-orbit" stroke="url(#sidebarGrad)" />
                      <circle cx="50" cy="50" r="42" className="morph-orbit orbit-2 sidebar-orbit" stroke="url(#sidebarGrad)" style={{transform: 'rotate(60deg) scaleY(0.45)'}} />
                      <circle cx="50" cy="50" r="42" className="morph-orbit orbit-3 sidebar-orbit" stroke="url(#sidebarGrad)" style={{transform: 'rotate(120deg) scaleY(0.45)'}} />
                      <circle cx="50" cy="50" r="10" fill="#FFFFFF"/>
                   </svg>
                </div>
             </div>
             <div className="flex flex-col justify-center">
                 <span className="font-display font-bold text-white text-lg tracking-tight whitespace-nowrap leading-none">NSG <span className="font-normal text-blue-400">Intelligence</span></span>
             </div>
          </div>
          
          {/* Close Button (Visible only on Mobile) */}
          <button className="lg:hidden p-2 text-slate-400 hover:text-white transition cursor-pointer" onClick={toggleSidebar}>
            <X className="w-5 h-5"/>
          </button>
        </div>

        {/* USER PROFILE: Merging your data with my styling */}
        <div className="p-6 shrink-0">
          <div className="flex items-center gap-3 bg-navy-850 p-4 rounded-2xl border border-white/5 shadow-inner group transition-all hover:bg-navy-800 cursor-pointer">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg border border-white/10 group-hover:scale-105 transition-transform">
               {/* Use the avatar from CONTEXT */}
               {config?.avatar || 'US'} 
             </div>
             <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate leading-tight">{username || 'Usuario'}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                   <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest truncate">{config?.roleDesc || 'GUEST'}</p>
                </div>
             </div>
          </div>
        </div>

        {/* MENU: Merging your Logic (Map) with my Styles (Gradient/Glass) */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scroll pb-10">
          {config?.menu.map((item) => {
              const Icon = item.icon;
              // Correct routing logic for /dashboard/[view]
              const targetPath = `/dashboard/${item.id}`;
              const isActive = pathname === targetPath;
              
              return (
                  <Link 
                      key={item.id} 
                      href={targetPath}
                      onClick={() => {
                        // Close sidebar on mobile when a link is clicked
                        if (window.innerWidth < 1024) toggleSidebar(); 
                      }}
                      className={clsx(
                        "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all mb-1 cursor-pointer",
                        // Remove default focus outline and white flash
                        "focus:outline-none focus-visible:outline-none active:scale-[0.98]",
                        
                        // 1. NSG Intelligence Style (Always applies to this specific ID)
                        item.id === 'nsg_intelligence'
                          ? "bg-gradient-to-r from-blue-900/40 to-navy-900/40 border border-blue-500/30 text-blue-300 shadow-glass hover:text-white"
                          : isActive
                              // 2. Active Style for other items (Transparent + Soft White Left Light + Thin Vivid Blue Right)
                              ? "text-white shadow-[inset_-2px_0_0_0_#60A5FA,inset_3px_0_12px_-2px_rgba(255,255,255,0.15)] border border-transparent"
                              // 3. Inactive Style
                              : "text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1 border border-transparent"
                      )}
                  >
                      {item.id === 'nsg_intelligence' ? (
                        <BrandAtom className="w-5 h-5" />
                      ) : (
                        <Icon className={clsx(
                             "w-5 h-5 transition-colors", 
                             isActive ? "text-blue-400" : "text-slate-500 group-hover:text-white"
                        )} />
                      )}
                      {item.label}
                  </Link>
              );
          })}
        </nav>

        {/* FOOTER: High-end styling with your Logout logic */}
        <div className="p-6 border-t border-navy-900 space-y-3 bg-navy-950 shrink-0 safe-bottom-scroll">
           <div className="flex items-center justify-between px-3.5 py-2.5 text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest bg-navy-900/50 rounded-lg border border-white/5">
              <span>Precision Status</span>
              <span className="text-emerald-500 font-bold flex items-center gap-1"><Activity className="w-3 h-3" /> Optimal</span>
           </div>
           <button 
              onClick={() => {
                authService.logout();
                router.push('/auth/login');
              }}
              className="flex items-center gap-3 text-sm font-medium hover:text-white transition w-full p-2.5 rounded-lg hover:bg-white/5 text-slate-400 group cursor-pointer text-left"
           >
              <LogOut className="w-4 h-4 group-hover:text-red-400 transition" /> Cerrar Sesión
           </button>
        </div>
      </aside>
    </>
  );
}