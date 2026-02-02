'use client';

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <head>
        <title>Error Crítico | BS Intelligence</title>
      </head>
      <body className="bg-slate-50 min-h-screen flex items-center justify-center p-4 font-sans selection:bg-blue-100 selection:text-blue-900">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
          <div className="p-8 md:p-10 text-center">
            {/* Animated Icon */}
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-10 w-10" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-navy-900 mb-3 tracking-tight">
              Error de Procesamiento
            </h2>
            
            <p className="text-slate-500 mb-8 leading-relaxed text-sm">
               Se ha detectado una interrupción en la infraestructura cognitiva. Nuestro sistema ha sido notificado y estamos trabajando en la estabilización.
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 mb-8 text-left border border-slate-100/50">
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">Diagnóstico:</p>
              <p className="text-xs font-mono text-slate-600 break-all leading-tight">
                {error.message || "An unexpected system error occurred."}
              </p>
              {error.digest && (
                <p className="text-[10px] font-mono text-slate-400 mt-2">
                  ID: {error.digest}
                </p>
              )}
            </div>

            <button
              onClick={() => reset()}
              className="w-full py-4 bg-navy-900 text-white font-bold rounded-2xl hover:bg-navy-800 transition-all shadow-xl shadow-navy-900/20 active:scale-[0.98] active:shadow-inner"
            >
              Reestablecer Sistema
            </button>
            
            <button
               onClick={() => window.location.href = '/'}
               className="w-full mt-3 py-3 text-slate-400 hover:text-navy-900 font-bold text-xs transition-colors"
            >
              Volver al inicio
            </button>
          </div>
          
          <div className="bg-slate-50/50 border-t border-slate-100 py-4 px-8">
            <p className="text-[10px] text-center font-bold text-slate-400 uppercase tracking-widest">
              BS Intelligence Infrastructure v14.6
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
