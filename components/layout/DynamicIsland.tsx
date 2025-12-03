"use client";

import { useAppStore } from "@/store/useAppStore";
import { Activity } from "lucide-react";

export default function DynamicIsland() {
  const { currentRole, isContextCached } = useAppStore();

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-950 rounded-full px-4 py-2 flex items-center gap-3 shadow-island z-50 transition-all duration-300 hover:scale-105 backdrop-blur-md border border-white/10">
       <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isContextCached ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{currentRole}</span>
       </div>
       <div className="h-4 w-px bg-white/10"></div>
       <div className="flex items-center gap-2 text-blue-400">
          <Activity className="w-3 h-3" />
          <span className="text-xs font-bold">Active</span>
       </div>
    </div>
  );
}
