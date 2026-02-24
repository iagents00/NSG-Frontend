"use client";

import React, { useState } from "react";
import { X, Plus, Target, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Design constants aligned with NSGCopilot
const GLASS_DRAWER = "bg-white/95 backdrop-blur-3xl border-l border-white/50 shadow-[-20px_0_50px_rgba(0,0,0,0.05)]";
const BTN_PRIMARY = "bg-[#007AFF] hover:bg-[#0062CC] text-white shadow-[0_4px_14px_0_rgba(0,122,255,0.3)] transition-all duration-300 rounded-2xl font-medium tracking-wide active:scale-95";
const INPUT_GLASS = "bg-slate-50/50 hover:bg-slate-100/80 focus:bg-white border-transparent focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 rounded-xl outline-none";

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

interface AddActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (action: { title: string; description: string; impact: string }) => void;
}

export default function AddActionModal({ isOpen, onClose, onSave }: AddActionModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [impact, setImpact] = useState("Medio");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return;
        onSave({ title, description, impact });
        setTitle("");
        setDescription("");
        setImpact("Medio");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[#323232]/20 backdrop-blur-sm z-[110]"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className={cn("fixed top-0 right-0 h-full w-full max-w-lg z-[111] p-8 flex flex-col shadow-2xl", GLASS_DRAWER)}
                    >
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-50 rounded-xl">
                                    <Plus className="w-5 h-5 text-[#007AFF]" />
                                </div>
                                <h2 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">Nueva Acción</h2>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[#86868B] uppercase tracking-widest ml-1">Título de la Acción</label>
                                    <input 
                                        autoFocus
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Ej: Revisión de métricas semanales"
                                        className={cn(INPUT_GLASS, "w-full px-5 py-4 text-lg font-medium")}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[#86868B] uppercase tracking-widest ml-1">Descripción</label>
                                    <textarea 
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Define brevemente el objetivo de esta acción..."
                                        className={cn(INPUT_GLASS, "w-full p-5 min-h-[120px] text-[15px] resize-none leading-relaxed")}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-[#86868B] uppercase tracking-widest ml-1">Nivel de Impacto</label>
                                    <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100/50 rounded-2xl border border-slate-200/30">
                                        {['Bajo', 'Medio', 'Alto'].map((level) => (
                                            <button
                                                key={level}
                                                type="button"
                                                onClick={() => setImpact(level)}
                                                className={cn(
                                                    "py-2.5 rounded-xl text-xs font-bold transition-all duration-300",
                                                    impact === level 
                                                        ? "bg-white text-blue-600 shadow-sm scale-[1.02]" 
                                                        : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                                                )}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto space-y-4">
                                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex gap-3 items-start">
                                    <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                    <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                                        Esta acción se integrará en tu Lista de Acción Inteligente. El Agente I monitorizará su progreso automáticamente.
                                    </p>
                                </div>
                                <button 
                                    type="submit"
                                    disabled={!title}
                                    className={cn(BTN_PRIMARY, "w-full py-4 text-lg font-bold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed")}
                                >
                                    Crear Acción
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
