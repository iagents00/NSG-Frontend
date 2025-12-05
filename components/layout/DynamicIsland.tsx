"use client";

import { useAppStore } from "@/store/useAppStore";
import { Activity, ChevronDown } from "lucide-react";
import { CONTEXT, RoleType } from "@/data/context";
import { Dispatch, SetStateAction, useState, useEffect, useRef } from "react";

interface DynamicIslandProps {
  currentMode: string;
  setMode: Dispatch<SetStateAction<string>>;
}

export default function DynamicIsland({ currentMode, setMode }: DynamicIslandProps) {
  const { currentRole, isContextCached } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (

    <div className="relative z-50" ref={containerRef}>
      <div className={`
        relative flex items-center gap-3 px-5 py-2.5 
        bg-slate-950/90 backdrop-blur-xl border border-white/10 
        rounded-full shadow-island 
        transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]
        ${isOpen ? 'rounded-b-none rounded-[28px]' : 'rounded-full hover:scale-[1.02]'}
      `}>
        {/* Mode Selector */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 group"
        >
          {(() => {
            const Icon = currentModeItem?.icon || Activity;
            return <Icon className="w-3.5 h-3.5 text-blue-400 transition-transform group-hover:scale-110" />;
          })()}
          <span className="text-[13px] font-medium text-slate-200 group-hover:text-blue-400 transition-colors">
            {currentModeLabel}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ease-out ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown Menu - Connected Surface */}
      <div 
        className={`
          absolute top-full left-0 w-full mt-[-1px] pt-2 pb-3
          bg-slate-950/90 backdrop-blur-xl border-x border-b border-white/10
          rounded-b-[24px] shadow-2xl overflow-hidden
          transition-all duration-300 origin-top
          ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
        `}
      >
        <div className="flex flex-col gap-1 px-1">
          {/* Standard Mode */}
          <button
            onClick={() => {
              setMode('standard');
              setIsOpen(false);
            }}
            className={`
              w-full px-4 py-2.5 rounded-full text-left text-[13px] font-medium transition-all flex items-center gap-3
              ${currentMode === 'standard' 
                ? 'bg-blue-600/20 text-blue-400' 
                : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'}
            `}
          >
            <Activity className="w-4 h-4" />
            Standard
          </button>

          {/* Menu Items */}
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setMode(item.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-4 py-2.5 rounded-full text-left text-[13px] font-medium transition-all flex items-center gap-3
                  ${currentMode === item.id 
                    ? 'bg-blue-600/20 text-blue-400' 
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'}
                `}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
