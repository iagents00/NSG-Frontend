"use client";

import { useAppStore } from "@/store/useAppStore";
import { Activity, ChevronDown } from "lucide-react";
import { CONTEXT, RoleType } from "@/data/context";
import { Dispatch, SetStateAction, useState, useEffect, useRef } from "react";
import clsx from "clsx";

interface DynamicIslandProps {
  currentMode: string;
  setMode: Dispatch<SetStateAction<string>>;
}

export default function DynamicIsland({ currentMode, setMode }: DynamicIslandProps) {
  const { currentRole, isContextCached } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Close only if clicking outside
  const handleSelect = (modeId: string) => {
      setMode(modeId);
      // Optional: don't close immediately to allow browsing? Or close nicely?
      // User asked: "select the field - Keep the blue once selected" 
      // It implies we can see the selection. Let's keep it open for a moment or let user close it.
      // But typical UI is close on select. Let's close it but maybe after delay or just close.
      // Wait, "scroll horizontally and select the field - Keep the blue once selected" might mean the list stays visible?
      // Just select and highlight.
      // I will close it to keep UI clean, but the pill reflects the selection.
      // Actually, if I show ALL items when open, highlighting the active one is nice.
      setIsOpen(false); 
  };

  // Get menu items for current role
  const roleKey = (currentRole as RoleType) || 'consultant';
  const menuItems = CONTEXT[roleKey]?.menu || [];
  
  // Find current mode label
  const currentModeItem = menuItems.find(item => item.id === currentMode);
  const currentModeLabel = currentModeItem?.label || "Standard";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Background Backdrop to prevent intersection
  const Backdrop = () => (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[150%] bg-slate-950/80 backdrop-blur-xl blur-lg rounded-[100%] pointer-events-none -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
  );

  return (
    <div className="relative z-50 flex flex-col items-center justify-center p-2" ref={containerRef}>
      {/* Scrim/Background - Absolute to respect container/modal rounds */}
      <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-slate-50/90 via-slate-50/50 to-transparent pointer-events-none z-[-1]" aria-hidden="true" />
      
      <div 
        className={`
           relative flex items-center transition-all duration-200 ease-out
           ${isOpen ? 'w-auto' : 'w-auto'}
        `}
      >
        <div className={`
            flex items-center p-1.5 gap-1.5 
            bg-[#0F172A] backdrop-blur-xl border border-white/10 
            rounded-full shadow-lg shadow-blue-900/10 
            transition-all duration-200 ease-out overflow-hidden
            ${isOpen ? 'pl-2 pr-2' : 'pl-4 pr-3 hover:scale-[1.02]'}
        `}>
          
          {/* Active Item / Toggle Trigger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`
              flex items-center gap-2.5 rounded-full transition-all duration-300
              ${isOpen ? 'mr-0' : ''}
              group relative
            `}
          >
            {/* The active icon */}
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full 
              bg-linear-to-br from-blue-500/20 to-indigo-500/20 text-blue-400
              transition-transform duration-300
            `}>
                {(() => {
                  const Icon = currentModeItem?.icon || Activity;
                  return <Icon className="w-4 h-4" />;
                })()}
            </div>
            
             <div className="flex flex-col items-start mr-1">
                  <span className={`text-[13px] font-semibold tracking-wide transition-colors duration-300 ${isOpen ? 'text-blue-400' : 'text-blue-100'}`}>
                    {currentModeLabel}
                  </span>
                 {/* Indicator of mode type if needed, or just removed for clean look */}
            </div>

            <ChevronDown 
              className={`
                w-4 h-4 text-slate-400 transition-transform duration-300 ease-out 
                ${isOpen ? 'rotate-90 opacity-0 w-0 h-0 overflow-hidden ml-0' : 'rotate-0 ml-1'}
              `} 
            />
          </button>

          {/* Expanded Options (Horizontal) */}
            <div 
              className={`
                flex items-center gap-1 transition-all duration-200 ease-out overflow-hidden
                ${isOpen ? 'max-w-lg opacity-100 translate-x-0 overflow-x-auto scrollbar-hide' : 'max-w-0 opacity-0 -translate-x-2'}
              `}
            >
              <div className="w-px h-6 bg-white/10 mx-1 shrink-0" /> {/* Divider */}

              {/* Standard Mode Option */}
              <button
                 onClick={() => {
                   setMode('standard');
                 }}
                 className={clsx(
                    "px-3 py-1.5 rounded-full text-[13px] font-medium transition-all whitespace-nowrap shrink-0",
                    currentMode === 'standard' 
                        ? "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                 )}
              >
                 Standard
              </button>

              {menuItems.map((item) => (
                   <button
                     key={item.id}
                     onClick={() => {
                       setMode(item.id);
                     }}
                     className={clsx(
                        "px-3 py-1.5 rounded-full text-[13px] font-medium transition-all whitespace-nowrap shrink-0",
                        currentMode === item.id 
                            ? "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30" 
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                     )}
                   >
                     {item.label}
                   </button>
              ))}
            </div>
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
