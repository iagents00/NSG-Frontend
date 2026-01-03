"use client";

import { useAppStore } from "@/store/useAppStore";
import { Activity } from "lucide-react";
import { CONTEXT, RoleType } from "@/data/context";
import { Dispatch, SetStateAction, useRef } from "react";
import clsx from "clsx";
import { m } from "framer-motion";

// Update Props Interface
interface DynamicIslandProps {
  currentMode: string;
  setMode: Dispatch<SetStateAction<string>>;
  selectedModel?: string; // Optional for backward compatibility if needed, but we'll use it
  setSelectedModel?: Dispatch<SetStateAction<string>>;
}

export default function DynamicIsland({ currentMode, setMode, selectedModel, setSelectedModel }: DynamicIslandProps) {
  const { currentRole } = useAppStore();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Get menu items for current role
  const roleKey = (currentRole as RoleType) || 'consultant';
// ... (rest of existing logic)
  const menuItems = CONTEXT[roleKey]?.menu || [];
  
  // Combine Standard + Menu Items (excluding NSG Intelligence)
  const allItems = [
    { id: 'standard', label: 'Standard', icon: Activity },
    ...menuItems.filter(item => item.id !== 'nsg_intelligence')
  ];

  return (
    <div className="relative z-50 flex flex-col items-center justify-start pt-0 md:pt-4 transition-all duration-500 ease-out gap-4 md:gap-6 w-full" ref={containerRef}>
      
      {/* 1. System Status Indicator (Apple Pro Label) */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 backdrop-blur-md border border-white/60 shadow-sm animate-fade-in group cursor-default">
         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
         <span className="text-[10px] font-bold tracking-[0.15em] text-navy-900/70 uppercase font-display group-hover:text-navy-900 transition-colors">
            System NSG Intelligence
         </span>
      </div>

      {/* 2. Primary Dynamic Island (Navigation) */}
      <div className="relative flex items-center justify-center w-full max-w-[95vw] md:max-w-3xl mx-auto">
        <div className={clsx(
            "flex flex-nowrap items-center p-1.5 gap-1",
            "bg-[#020617] supports-[backdrop-filter]:bg-[#020617]/90 backdrop-blur-3xl", // Ultra-dark Navy/Black for max contrast
            "border border-white/10 ring-1 ring-white/5",
            "rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]", // Reduced, smoother "Pro" shadow
            "overflow-x-auto scrollbar-hide",
            "transition-all duration-500 ease-spring"
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
                    "flex items-center gap-2.5 px-4 py-2.5 rounded-[1.4rem] transition-all duration-300 ease-out whitespace-nowrap relative shrink-0 cursor-pointer group",
                    isActive 
                        ? "bg-blue-600/20 text-blue-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] ring-1 ring-blue-500/30" 
                        : "text-slate-400 hover:text-white hover:bg-white/5",
                     (isActive && isSpecial) && "bg-blue-600/30 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-400/30"
                 )}
               >
                 <Icon className={clsx(
                   "w-4.5 h-4.5 transition-colors shrink-0", 
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

      {/* 3. Secondary Intelligence Selector (Glass Pill) */}
      {setSelectedModel && selectedModel && (
        <div className="animate-fade-in-up flex items-center justify-center p-1 rounded-full bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 transform">
             {['Chat GPT', 'Gemini', 'Claude'].map((model) => {
                 const isModelActive = selectedModel === model;
                 return (
                    <button
                        key={model}
                        onClick={() => setSelectedModel(model)}
                        className={clsx(
                            "px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer relative overflow-hidden",
                            isModelActive 
                                ? "text-slate-900 bg-white shadow-sm ring-1 ring-black/5" 
                                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
                        )}
                    >
                        {isModelActive && (
                            <m.div 
                                layoutId="activeModelIndicator"
                                className="absolute inset-0 bg-white rounded-full z-[-1]"
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        )}
                        
                        {/* Status Dot */}
                        <div className={clsx(
                            "w-1.5 h-1.5 rounded-full transition-colors", 
                            isModelActive ? "bg-blue-600 scale-110" : "bg-slate-300"
                        )} />
                        
                        {model}
                    </button>
                 );
             })}
        </div>
      )}

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
