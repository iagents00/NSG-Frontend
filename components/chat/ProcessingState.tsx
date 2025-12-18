"use client";
import { useState, useEffect } from "react";
import AtomEffect from "@/components/ui/AtomEffect";

const PHRASES = [
  "Decodificando Patrones...",
  "Optimizando Vectores...",
  "Sincronizando Contexto...",
  "Generando Insight...",
];

export default function ProcessingState() {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center mt-8 animate-fade-in-up gap-6 w-full">
      {/* Atom Container */}
      <AtomEffect className="w-16 h-16" />
      
      {/* Animated Text */}
      <p className="text-xs font-bold text-blue-500 tracking-widest uppercase animate-text-glow transition-all duration-500">
        {PHRASES[phraseIndex]}
      </p>
    </div>
  );
}