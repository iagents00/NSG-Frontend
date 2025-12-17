"use client";

import React from 'react';
import FathomDashboard from '@/components/features/FathomDashboard';

export default function Analytics() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up pb-10">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-8 rounded-[2.5rem] shadow-card text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="font-display font-bold text-3xl tracking-tight">Analytics Dashboard</h1>
            <p className="text-blue-100 text-sm mt-1">Powered by Fathom Analytics</p>
          </div>
        </div>
        <p className="text-blue-50 text-sm max-w-2xl">
          Visualiza las métricas de tráfico de tus sitios web en tiempo real. Datos precisos y respetuosos con la privacidad.
        </p>
      </div>

      {/* Fathom Dashboard */}
      <FathomDashboard />
    </div>
  );
}
