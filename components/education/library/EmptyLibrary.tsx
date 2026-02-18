"use client";

import { BookOpen, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function EmptyLibrary() {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                    delay: 0.2,
                }}
                className="relative mb-10"
            >
                {/* Background Glow */}
                <div className="absolute inset-0 bg-blue-500/10 blur-[60px] rounded-full animate-pulse" />

                {/* Icon Container */}
                <div className="relative w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/10 border border-slate-100 ring-1 ring-slate-100">
                    <BookOpen className="w-10 h-10 text-blue-600" />

                    {/* Decorative element removed */}
                </div>
            </motion.div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="max-w-md space-y-4"
            >
                <h3 className="text-2xl font-display font-bold text-navy-950 tracking-tight">
                    Tu Biblioteca está lista para la Ingesta
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                    Aún no has procesado recursos estratégicos. Comienza
                    enviando textos, documentos o imágenes para que tu agente
                    pueda analizarlos y transformarlos en planes de acción.
                </p>

                <div className="pt-6 flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50/50 px-4 py-2 rounded-full border border-blue-100/50">
                        <ArrowRight className="w-3 h-3" />
                        Sigue el Protocolo de Arriba
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
