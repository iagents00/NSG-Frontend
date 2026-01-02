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

        {/* HEADER: More compact Brand + Close Button */}
        <div className="h-20 flex items-center px-6 border-b border-navy-900 justify-between bg-navy-950/50 backdrop-blur-md sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 relative shrink-0 atom-container">
              <div className="w-full h-full atom-breathe">
                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                  <defs><linearGradient id="sidebarGrad" x1="0" y1="0" x2="100" y2="100"><stop offset="0" stopColor="#60A5FA" /><stop offset="1" stopColor="#FFFFFF" /></linearGradient></defs>
                  <circle cx="50" cy="50" r="42" className="morph-orbit orbit-1 sidebar-orbit" stroke="url(#sidebarGrad)" />
                  <circle cx="50" cy="50" r="42" className="morph-orbit orbit-2 sidebar-orbit" stroke="url(#sidebarGrad)" style={{ transform: 'rotate(60deg) scaleY(0.45)' }} />
                  <circle cx="50" cy="50" r="41" className="morph-orbit orbit-3 sidebar-orbit" stroke="url(#sidebarGrad)" style={{ transform: 'rotate(120deg) scaleY(0.45)' }} />
                  <circle cx="50" cy="50" r="8" fill="#FFFFFF" />
                </svg>
              </div>
            </div>
            <span className="font-display font-bold text-white text-lg tracking-tight">NSG <span className="font-normal text-blue-400">Intelligence</span></span>
          </div>

          <button className="lg:hidden p-2 text-slate-500 hover:text-white transition" onClick={toggleSidebar}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* COMPACT USER PROFILE & NAVIGATION */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Streamlined User Info */}
          <div className="px-6 py-4 shrink-0">
            <div className="flex items-center gap-3 bg-white/5 p-2.5 rounded-xl border border-white/5 group transition-all hover:bg-white/10 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-[0.65rem] shadow-lg border border-white/10 group-hover:scale-105 transition-transform">
                {config?.avatar || 'US'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate leading-none mb-1">{username || 'Usuario'}</p>
                <p className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest truncate">{config?.roleDesc || 'GUEST'}</p>
              </div>
            </div>
          </div>

          {/* MENU OPTIONS - Now has more space */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scroll pb-6">
            {config?.menu.map((item) => {
              const Icon = item.icon;
              const targetPath = `/dashboard/${item.id}`;
              const isActive = pathname === targetPath;

              return (
                <Link
                  key={item.id}
                  href={targetPath}
                  onClick={() => {
                    if (window.innerWidth < 1024) toggleSidebar();
                  }}
                  className={clsx(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all mb-0.5 cursor-pointer group",
                    "focus:outline-none active:scale-[0.98]",
                    item.id === 'nsg_intelligence'
                      ? "bg-gradient-to-r from-blue-900/30 to-navy-900/30 border border-blue-500/20 text-blue-300 shadow-glass hover:text-white"
                      : isActive
                        ? "text-white bg-white/10 shadow-[inset_2px_0_0_0_#60A5FA] border-transparent"
                        : "text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1 border border-transparent"
                  )}
                >
                  {item.id === 'nsg_intelligence' ? (
                    <BrandAtom className="w-4.5 h-4.5" />
                  ) : (
                    <Icon className={clsx(
                      "w-4.5 h-4.5 transition-colors",
                      isActive ? "text-blue-400" : "text-slate-500 group-hover:text-blue-400"
                    )} />
                  )}
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM SECTION: Precision & Logout (Compact & Bottom-aligned) */}
        <div className="p-4 border-t border-navy-900 space-y-1 bg-navy-950 shrink-0">
          <div className="flex items-center justify-between px-3 py-2 text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest bg-navy-900/40 rounded-lg">
            <span className="opacity-60">System Precision</span>
            <span className="text-emerald-500 flex items-center gap-1.5"><Activity className="w-3 h-3" /> Optimal</span>
          </div>
          <button
            onClick={() => {
              authService.logout();
              router.push('/auth/login');
            }}
            className="flex items-center gap-3 text-[0.75rem] font-bold text-slate-500 hover:text-red-400 transition w-full p-2.5 rounded-lg hover:bg-red-500/5 group cursor-pointer text-left uppercase tracking-tighter"
          >
            <LogOut className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" /> Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}