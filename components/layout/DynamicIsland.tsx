"use client";

import { useAppStore } from "@/store/useAppStore";
import { Activity } from "lucide-react";
import { CONTEXT, RoleType } from "@/data/context";
import { Dispatch, SetStateAction, useRef } from "react";
import clsx from "clsx";

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
    <div className="relative z-50 flex flex-col items-center justify-center p-4 transition-all duration-500 ease-in-out gap-3" ref={containerRef}>
      
      {/* Header Title - Apple Pro Style */}
      <div className="flex flex-col items-center animate-fade-in mb-1">
         <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-0.5">System</span>
         <h2 className="text-lg font-bold text-navy-900 tracking-tight drop-shadow-sm">NSG Intelligence</h2>
      </div>

      <div className="relative flex items-center justify-center w-full max-w-[95vw] md:max-w-3xl mx-auto">
        <div className={clsx(
            "flex flex-nowrap items-center p-1.5 md:p-2 gap-1.5 md:gap-2 w-full md:w-auto",
            "bg-[#0F172A] backdrop-blur-xl border border-white/10",
            "rounded-2xl md:rounded-full shadow-lg shadow-blue-900/10",
            "overflow-x-auto scrollbar-hide transition-all duration-500",
            "justify-start" 
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
                    "flex items-center gap-2 px-5 py-2.5 md:px-5 md:py-2.5 rounded-xl md:rounded-full transition-all duration-300 ease-out whitespace-nowrap group relative shrink-0 cursor-pointer",
                    isActive 
                        ? (isSpecial ? "bg-blue-600/10 text-blue-400" : "bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30") 
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5",
                     (isActive && isSpecial) && "px-6 py-3 md:px-6 md:py-3"
                 )}
               >
                 <Icon className={clsx(
                   "w-5 h-5 md:w-5 md:h-5 transition-colors shrink-0", 
                   isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
                 )} />
                 <span className="text-[14px] md:text-[14px] font-semibold tracking-wide">
                   {item.label}
                 </span>
                 
                 {/* Subtle Active Glow Effect */}
                 {isActive && !isSpecial && (
                    <div className="absolute inset-0 rounded-xl md:rounded-full bg-blue-400/5 blur-md pointer-events-none" />
                 )}
               </button>
             );
           })}

        </div>
      </div>

      {/* --- SECONDARY LAYER: AI MODEL SELECTOR --- */}
      {setSelectedModel && selectedModel && (
        <div className="animate-fade-in-up flex items-center justify-center gap-1 bg-white/80 backdrop-blur-md border border-white/20 p-1.5 rounded-full shadow-sm hover:shadow-md transition-all duration-300">
             {['Chat GPT', 'Gemini', 'Claude'].map((model) => {
                 const isModelActive = selectedModel === model;
                 return (
                    <button
                        key={model}
                        onClick={() => setSelectedModel(model)}
                        className={clsx(
                            "px-5 py-2 rounded-full text-[13px] font-medium transition-all duration-200 flex items-center gap-1.5",
                            isModelActive 
                                ? "bg-white text-[#0b57d0] shadow-sm ring-1 ring-slate-100" 
                                : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-700"
                        )}
                    >
                        {/* Dot Indicator */}
                        <div className={clsx("w-1.5 h-1.5 rounded-full transition-colors", isModelActive ? "bg-[#0b57d0]" : "bg-slate-300")} />
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
