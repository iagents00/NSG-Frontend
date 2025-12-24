"use client";

import React from 'react';
import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
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
    <div className="flex-1 overflow-y-auto custom-scroll safe-bottom-scroll scroll-smooth w-full animate-fade-in-up flex flex-col items-center bg-slate-50/30">
      
      {/* 2. Jarvis Assistant Hero */}
      <div className="w-full relative z-20 mb-8">
         <JarvisAssistant />
      </div>

      <div className="w-full px-6 lg:px-10 pb-16 max-w-[1600px]">
        {/* Section Header */}
        <div className="mb-8 pl-2 flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Módulos Operativos</h2>
                <p className="text-slate-500 font-medium mt-1">Acceso directo a tus herramientas de inteligencia.</p>
            </div>
            
            <div className="hidden md:flex gap-2">
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-400 uppercase tracking-widest shadow-sm">
                    {roleData.roleDesc}
                </span>
            </div>
        </div>

        {/* 3. Dynamic Modules Grid */}
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
           className="relative group text-left h-64 w-full bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-20px_rgba(59,130,246,0.25)] hover:border-blue-100 transition-all duration-500 ease-out hover:-translate-y-1 overflow-hidden p-8 flex flex-col justify-between animate-fade-in-up fill-mode-backwards"
        >
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-slate-50 to-blue-50/50 rounded-bl-[100%] opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-700 ease-in-out" />
            
            {/* Icon */}
            <div className="relative z-10 w-14 h-14 rounded-2xl bg-slate-50 group-hover:bg-blue-600 flex items-center justify-center text-slate-500 group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-lg group-hover:shadow-blue-500/30">
                <Icon strokeWidth={1.5} className="w-7 h-7" />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full mb-2">
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors duration-300 font-display tracking-tight mb-2">
                    {title}
                </h3>
                <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-[90%] group-hover:text-slate-500 transition-colors">
                    {description}
                </p>
            </div>

            {/* Hover Action */}
            <div className="absolute bottom-6 right-6 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 delay-[50ms]">
                 <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <ArrowRight className="w-5 h-5" />
                 </div>
            </div>
        </button>
    );
}