"use client";

import { useAppStore } from "@/store/useAppStore";
import { Activity } from "lucide-react";
import { CONTEXT, RoleType } from "@/data/context";
import { Dispatch, SetStateAction, useRef } from "react";
import clsx from "clsx";

interface DynamicIslandProps {
  currentMode: string;
  setMode: Dispatch<SetStateAction<string>>;
}

export default function DynamicIsland({ currentMode, setMode }: DynamicIslandProps) {
  const { currentRole } = useAppStore();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Get menu items for current role
  const roleKey = (currentRole as RoleType) || 'consultant';
  const menuItems = CONTEXT[roleKey]?.menu || [];
  
  // Combine Standard + Menu Items
  const allItems = [
    { id: 'standard', label: 'Standard', icon: Activity },
    ...menuItems
  ];

  return (
    <div className="relative z-50 flex flex-col items-center justify-center p-4 transition-all duration-500 ease-in-out" ref={containerRef}>
      
      <div className="relative flex items-center justify-center w-full max-w-3xl mx-auto">
        <div className={clsx(
            "flex flex-nowrap items-center p-2 gap-2 w-full",
            "bg-[#0F172A] backdrop-blur-xl border border-white/10",
            "rounded-full shadow-lg shadow-blue-900/10",
            "overflow-x-auto scrollbar-hide transition-all duration-500"
        )}>
           
           {allItems.map((item) => {
             const isActive = currentMode === item.id;
             const isSpecial = item.id === 'nsg_ios';
             const Icon = item.icon;

             return (
               <button
                 key={item.id}
                 onClick={() => setMode(item.id)}
                 className={clsx(
                    "flex items-center gap-2.5 px-5 py-2.5 rounded-full transition-all duration-300 ease-out whitespace-nowrap group relative flex-shrink-0",
                    isActive 
                        ? (isSpecial ? "bg-blue-600/10 text-blue-400" : "bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30") 
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5",
                    // Increase prominence for active special item BUT NO EXTRA GLOW popups
                    (isActive && isSpecial) && "px-6 py-3"
                 )}
               >
                 <Icon className={clsx(
                   "w-5 h-5 transition-colors flex-shrink-0", 
                   isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
                 )} />
                 <span className="text-[14px] font-semibold tracking-wide">
                   {item.label}
                 </span>
                 
                 {/* Subtle Active Glow Effect - Disabled for Special Item */}
                 {isActive && !isSpecial && (
                    <div className="absolute inset-0 rounded-full bg-blue-400/5 blur-md pointer-events-none" />
                 )}
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
