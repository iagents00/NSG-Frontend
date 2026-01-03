"use client";

import React from 'react';
import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Cpu } from "lucide-react";
import JarvisAssistant from "@/components/features/JarvisAssistant";
import { CONTEXT, RoleType } from "@/data/context";

export default function NSGIntelligence() {
  const { currentRole } = useAppStore();
  const router = useRouter();

  // Get current user's menu items
  const roleKey = (currentRole as RoleType) || 'consultant'; // Default fallback
  const roleData = CONTEXT[roleKey] || CONTEXT.consultant;
  
  // Filter out the current view (Intelligence) to avoid redundancy in the grid
  const modules = roleData.menu.filter(item => item.id !== 'nsg_intelligence');

  return (
    <div className="flex-1 overflow-y-auto custom-scroll safe-bottom-scroll scroll-smooth w-full animate-fade-in-up flex flex-col items-center bg-white text-slate-900 selection:bg-blue-100">
      
      {/* 2. Jarvis Assistant Hero Section (Light Mode) */}
      <div className="w-full relative z-20 mb-8 pt-6">
         {/* Top Label for Pro Feel */}
         <div className="flex justify-center mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
             <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                 <span className="text-[10px] font-bold tracking-[0.25em] text-slate-500 uppercase">NSG AI Core 2.0</span>
             </div>
         </div>
         
         <div className="relative mx-auto max-w-[95%] xl:max-w-5xl">
            <JarvisAssistant />
         </div>
      </div>

      <div className="w-full px-6 lg:px-12 pb-24 max-w-[1700px] relative z-10">
        {/* Section Header */}
        <div className="mb-12 flex items-end justify-between border-b border-slate-200 pb-6">
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold tracking-[0.2em] text-blue-600 uppercase">Command Center</span>
                </div>
                <h2 className="text-4xl font-bold text-slate-900 tracking-tight font-display">Operative Modules</h2>
                <p className="text-slate-600 font-medium text-base">Select a neural vector to initiate.</p>
            </div>
            
            <div className="hidden md:block">
               <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Access Level</p>
                    <div className="flex items-center justify-end gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" />
                        <span className="text-sm font-bold text-slate-700">{roleData.roleDesc}</span>
                    </div>
               </div>
            </div>
        </div>

        {/* 3. Dynamic Modules Grid (Light Mode Bento) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
            {modules.map((item, index) => (
                <ModuleCard 
                    key={item.id}
                    title={item.label}
                    description={item.subtitle}
                    icon={item.icon}
                    onClick={() => router.push(`/dashboard/${item.id}`)}
                    index={index}
                />
            ))}
        </div>
      </div>
    </div>
  );
}

interface ModuleCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
  index: number;
}

function ModuleCard({ title, description, icon: Icon, onClick, index }: ModuleCardProps) {
    // Staggered animation delay
    const animationDelay = `${index * 50}ms`;

    return (
        <button 
           onClick={onClick}
           style={{ animationDelay }}
           className="relative group text-left h-[300px] w-full bg-white rounded-[2rem] border border-slate-200 hover:border-blue-200 shadow-sm hover:shadow-[0_20px_40px_-10px_rgba(59,130,246,0.15)] transition-all duration-500 cubic-bezier(0.25,1,0.5,1) hover:scale-[1.02] overflow-hidden p-8 flex flex-col justify-between animate-fade-in-up fill-mode-backwards cursor-pointer will-change-transform"
        >
            {/* Background Gradient Mesh (Light Mode) */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_50%)] animate-spin-process" />
            </div>
            
            {/* Top Row: Icon */}
            <div className="relative z-10 w-full flex justify-between items-start">
                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-all duration-500 shadow-sm">
                    <Icon strokeWidth={1.5} className="w-8 h-8" />
                </div>
                
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-100 bg-white group-hover:bg-blue-600 group-hover:border-transparent transition-all duration-500 group-hover:rotate-[-45deg]">
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                </div>
            </div>

            {/* Bottom Row: Content */}
            <div className="relative z-10 w-full mt-auto">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-3 group-hover:text-blue-700 transition-colors duration-300">
                    {title}
                </h3>
                <p className="text-[15px] text-slate-500 font-medium leading-relaxed group-hover:text-slate-600 transition-colors line-clamp-2 pr-4">
                    {description}
                </p>
                
                {/* Active Indicator Line */}
                <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-700 ease-in-out" />
            </div>
        </button>
    );
}
