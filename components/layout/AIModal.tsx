"use client";
import { useUIStore } from "@/store/useUIStore";
import { X } from "lucide-react";
import ChatInterface from "@/components/chat/ChatInterface";
import clsx from "clsx";

export default function AIModal() {
  const { isAIOpen, toggleAI } = useUIStore();

  if (!isAIOpen) return null;

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center p-0 lg:p-8">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-xl transition-opacity" onClick={toggleAI}></div>
        
        {/* Wrapper for positioning button outside */}
        <div className="relative w-full h-dvh lg:h-auto lg:max-w-5xl animate-fade-in-up flex flex-col">
            
            {/* Close Button - Enhanced */}
            <button 
                onClick={toggleAI} 
                className="absolute top-6 right-6 lg:-top-10 lg:-right-12 z-50 group outline-none focus:outline-none"
                aria-label="Close"
            >
                 <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-200/50 hover:bg-slate-200 lg:bg-white/10 lg:hover:bg-white/20 transition-all duration-200 backdrop-blur-sm">
                    <X className="w-5 h-5 text-slate-600 lg:text-white/80 lg:group-hover:text-white transition-colors" />
                 </div>
            </button>

            {/* Modal Container */}
            <div className="bg-slate-50 w-full h-full lg:h-[85vh] lg:rounded-[2.5rem] shadow-2xl flex flex-col relative overflow-hidden lg:border lg:border-white/40 lg:ring-1 lg:ring-white/50">
                {/* Chat Interface Integration */}
                <div className="flex-1 w-full h-full overflow-hidden relative">
                    <ChatInterface />
                </div>
            </div>
        </div>
    </div>
  );
}