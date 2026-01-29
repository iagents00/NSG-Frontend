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
                            initial={{
                                opacity: 0,
                                scale: 0.95,
                                y: 20,
                                filter: "blur(10px)",
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                                filter: "blur(0px)",
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.98,
                                y: 10,
                                filter: "blur(10px)",
                                transition: { duration: 0.15 },
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                                mass: 0.8, // Snappy but smooth "Google" feel
                            }}
                            className="fixed inset-0 z-120 bg-[#F8FAFF]/95 backdrop-blur-3xl flex flex-col shadow-2xl overflow-hidden supports-backdrop-filter:bg-[#F8FAFF]/85"
                        >
                            {/* Dynamic Abstract Background Blobs */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                                <m.div
                                    animate={{
                                        x: [0, 40, -20, 0],
                                        y: [0, -60, 30, 0],
                                        scale: [1, 1.1, 0.9, 1],
                                    }}
                                    transition={{
                                        duration: 20,
                                        repeat: Infinity,
                                        ease: "linear",
                                    }}
                                    className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-400/20 rounded-full blur-[120px]"
                                />
                                <m.div
                                    animate={{
                                        x: [0, -50, 20, 0],
                                        y: [0, 30, -50, 0],
                                        scale: [1, 0.9, 1.1, 1],
                                    }}
                                    transition={{
                                        duration: 25,
                                        repeat: Infinity,
                                        ease: "linear",
                                    }}
                                    className="absolute bottom-[10%] -right-[5%] w-[40%] h-[40%] bg-indigo-400/20 rounded-full blur-[100px]"
                                />
                                <m.div
                                    animate={{
                                        x: [0, 20, -40, 0],
                                        y: [0, 50, -20, 0],
                                        scale: [1, 1.15, 0.95, 1],
                                    }}
                                    transition={{
                                        duration: 18,
                                        repeat: Infinity,
                                        ease: "linear",
                                    }}
                                    className="absolute top-[20%] right-[10%] w-[35%] h-[45%] bg-purple-400/15 rounded-full blur-[110px]"
                                />
                            </div>

                            {/* Header Gradient Overlay - Subtle Ambience */}
                            <div className="absolute top-0 left-0 right-0 h-48 bg-linear-to-b from-white via-white/40 to-transparent z-30 pointer-events-none" />

                            {/* Dynamic Back Button - Responsive & Pro UI */}
                            <m.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2, duration: 0.3 }}
                                className="absolute top-6 right-6 md:top-8 md:right-8 z-60"
                            >
                                <button
                                    onClick={toggleAI}
                                    className="group flex items-center justify-center gap-2 p-2 md:pl-4 md:pr-3 md:py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-white/50 shadow-sm hover:shadow-md hover:bg-white transition-all duration-300 transform active:scale-95 cursor-pointer"
                                    aria-label="Volver"
                                >
                                    <span className="hidden md:block text-sm font-semibold text-slate-600 group-hover:text-slate-900 tracking-tight">
                                        Volver
                                    </span>
                                    <div className="bg-slate-100 group-hover:bg-blue-50 text-slate-500 group-hover:text-blue-600 rounded-full p-1.5 transition-colors">
                                        <ArrowLeft className="w-5 h-5 md:w-4 md:h-4 rotate-180" />
                                    </div>
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
