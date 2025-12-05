"use client";
import { useUIStore } from "@/store/useUIStore";
import { X } from "lucide-react";
import ChatInterface from "@/components/chat/ChatInterface";
import clsx from "clsx";

export default function AIModal() {
  const { isAIOpen, toggleAI } = useUIStore();

  if (!isAIOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-xl" onClick={toggleAI}></div>
        
        {/* Modal Container */}
        <div className="bg-slate-50 w-full h-[100dvh] lg:h-[85vh] lg:max-w-5xl lg:rounded-[2.5rem] shadow-2xl flex flex-col relative z-10 overflow-hidden lg:border lg:border-white/40 lg:ring-1 lg:ring-white/50 animate-fade-in-up">
            
            {/* Close Button */}
            <button onClick={toggleAI} className="absolute top-6 right-6 lg:top-8 lg:right-8 p-2.5 bg-white/60 hover:bg-white rounded-full transition shadow-sm z-50 backdrop-blur-md group border border-white/20">
                <X className="w-5 h-5 text-slate-500 group-hover:text-red-500 transition-colors" />
            </button>

            {/* Chat Interface Integration */}
            <div className="flex-1 w-full h-full overflow-hidden relative">
                <ChatInterface />
            </div>
        </div>
    </div>
  );
}