"use client";
import { useUIStore } from "@/store/useUIStore";
import { ArrowLeft } from "lucide-react";
import ChatInterface from "@/components/chat/ChatInterface";
import { m, AnimatePresence, LazyMotion, domAnimation } from "framer-motion";

export default function AIModal() {
  const { isAIOpen, toggleAI } = useUIStore();

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {isAIOpen && (
          <>
            {/* 1. Backdrop Layer: Solves the "Blue vs White" clash by neutralizing the background first */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }} // Fast fade to mask content immediately
              className="fixed inset-0 z-110 bg-navy-950/40 backdrop-blur-sm"
              onClick={toggleAI} // Optional: Click outside to close (though it's full screen, good for intent)
            />

            {/* 2. Main Surface: "Material 3" Elevation & Expansion */}
            <m.div
              key="ai-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.98, y: 10, filter: "blur(10px)", transition: { duration: 0.15 } }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 0.8 // Snappy but smooth "Google" feel
              }}
              className="fixed inset-0 z-120 bg-[#f0f4f9] flex flex-col shadow-2xl overflow-hidden"
            >
              
              {/* Header Gradient Overlay */}
              <div className="absolute top-0 left-0 right-0 h-40 bg-linear-to-b from-[#f0f4f9] via-[#f0f4f9]/90 to-transparent z-30 pointer-events-none" />

              {/* Dynamic Back Button - Responsive & Pro UI */}
              <m.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="absolute top-4 left-4 md:top-6 md:left-6 z-60"
              >
                  <button 
                      onClick={toggleAI} 
                      className="group flex items-center justify-center gap-2 p-2 md:pl-3 md:pr-4 md:py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-white/50 shadow-sm hover:shadow-md hover:bg-white transition-all duration-300 transform active:scale-95 cursor-pointer"
                      aria-label="Volver"
                  >
                      <div className="bg-slate-100 group-hover:bg-blue-50 text-slate-500 group-hover:text-blue-600 rounded-full p-1.5 transition-colors">
                          <ArrowLeft className="w-5 h-5 md:w-4 md:h-4" />
                      </div>
                      <span className="hidden md:block text-sm font-semibold text-slate-600 group-hover:text-slate-900 tracking-tight">Volver</span>
                  </button>
              </m.div>

              {/* Full Screen Chat Interface */}
              <div className="flex-1 w-full h-full relative">
                  <ChatInterface />
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}