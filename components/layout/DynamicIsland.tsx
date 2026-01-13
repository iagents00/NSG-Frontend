"use client";

import { useAppStore } from "@/store/useAppStore";
import { Activity, ChevronDown, Zap, Layers, Scale, BrainCircuit } from "lucide-react";
import { CONTEXT, RoleType } from "@/data/context";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import clsx from "clsx";
import { m, AnimatePresence } from "framer-motion";

// Update Props Interface
interface DynamicIslandProps {
  currentMode: string;
  setMode: (mode: string) => void;
  selectedModel?: string; 
  setSelectedModel?: (model: string) => void;
  intelligenceMode?: 'pulse' | 'compare' | 'fusion' | 'deep';
  setIntelligenceMode?: (mode: 'pulse' | 'compare' | 'fusion' | 'deep') => void;
}

export default function DynamicIsland({ currentMode, setMode, selectedModel, setSelectedModel, intelligenceMode = 'pulse', setIntelligenceMode }: DynamicIslandProps) {
  const { currentRole } = useAppStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  
  // Get menu items for current role - Robust fallback
  const roleKey = (currentRole && CONTEXT[currentRole as RoleType]) ? (currentRole as RoleType) : 'consultant';
  const menuItems = CONTEXT[roleKey]?.menu || [];
  
  // Reconstruct list: Standard + Specific List in Exact Order
  const targetOrder = ['nsg_clarity', 'nsg_horizon', 'nsg_news', 'settings'];
  const menuMap = new Map(menuItems.map(i => [i.id, i]));
  
  const allItems = [
    { id: 'standard', label: 'Standard', icon: Activity },
    ...targetOrder
        .map(id => menuMap.get(id))
        .filter((item): item is NonNullable<typeof item> => !!item)
  ];

  return (
    <div className="relative z-50 flex flex-col items-center justify-start pt-0 md:pt-4 gap-4 md:gap-6 w-full" ref={containerRef}>
      
      {/* 1. System Status Indicator (Apple Pro Label) */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 backdrop-blur-md border border-white/60 shadow-sm animate-fade-in group cursor-default">
         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
         <span className="text-[10px] font-bold tracking-[0.15em] text-navy-900/70 uppercase font-display group-hover:text-navy-900 transition-colors">
            System NSG Intelligence
         </span>
      </div>

      {/* 2. Primary Dynamic Island (Navigation) */}
      <div className="relative flex items-center justify-center w-full max-w-[95vw] md:max-w-4xl mx-auto">
        <div className={clsx(
            "flex flex-nowrap items-center p-1.5 gap-1",
            "bg-navy-950 supports-backdrop-filter:bg-navy-950/90 backdrop-blur-xl", // Ultra-dark Navy/Black
            "border border-white/10 ring-1 ring-white/5",
            "rounded-full shadow-[0_8px_24px_-6px_rgba(0,0,0,0.3)]", 
            "overflow-x-auto scrollbar-hide transition-all duration-500 ease-spring"
        )}>
           
           {allItems.map((item) => {
             const isActive = currentMode === item.id;
             const isSpecial = item.id === 'nsg_intelligence';
             const Icon = item.icon;

             return (
               <button
                 key={item.id}
                 onClick={() => setMode(item.id)}
                 className={clsx(
                    "flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300 ease-out whitespace-nowrap relative shrink-0 cursor-pointer group",
                    isActive 
                        ? "bg-blue-600/20 text-blue-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] ring-1 ring-blue-500/30" 
                        : "text-slate-400 hover:text-white hover:bg-white/5",
                     (isActive && isSpecial) && "bg-blue-600/30 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-400/30"
                 )}
               >
                 <Icon className={clsx(
                   "w-4 h-4 transition-colors shrink-0", 
                   isActive ? "text-blue-300" : "text-slate-500 group-hover:text-slate-300"
                 )} />
                 <span className="text-[13px] font-medium tracking-wide">
                   {item.label}
                 </span>
               </button>
             );
           })}

        </div>
      </div>



      {/* Scrollbar hide styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
