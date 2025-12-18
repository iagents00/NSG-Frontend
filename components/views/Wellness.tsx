"use client";
import React, { useEffect, useRef } from "react";
import { Heart, Activity, Flame, Footprints } from "lucide-react";
import Chart from "chart.js/auto";

export default function Wellness() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) chartInstance.current.destroy();

      // --- LEGACY CHART CONFIGURATION ---
      chartInstance.current = new Chart(chartRef.current, {
        type: 'line',
        data: {
          labels: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
          datasets: [{ 
            label: 'Nivel Energía', 
            data: [70, 75, 60, 80, 85, 90, 88], 
            borderColor: '#10B981', 
            backgroundColor: 'rgba(16, 185, 129, 0.1)', 
            tension: 0.4, 
            fill: true, 
            pointRadius: 4, 
            borderWidth: 3 
          }]
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: false, 
          plugins: { legend: { display: false } }, 
          scales: { 
            y: { display: false, min: 0, max: 100 }, 
            x: { grid: { display: false } } 
          } 
        }
      });
    }
    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        
        {/* Sleep Ring (SVG) */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-card border border-slate-200 flex flex-col items-center justify-center text-center">
          <div className="w-48 h-48 relative mb-6">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              <circle cx="50" cy="50" r="45" stroke="#F1F5F9" strokeWidth="8" fill="none"/>
              <circle cx="50" cy="50" r="45" stroke="#10B981" strokeWidth="8" fill="none" strokeDasharray="283" strokeDashoffset="70" strokeLinecap="round"/>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-display font-extrabold text-navy-900">85</span>
              <span className="text-xs font-bold text-slate-400 uppercase">Sleep Score</span>
            </div>
          </div>
          <p className="text-slate-600 font-medium">Calidad de sueño óptima. Recuperación profunda detectada.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <SmallCard title="HRV" value="42ms" icon={Heart} bgClass="bg-red-50 text-red-600" />
          <SmallCard title="Pasos" value="8,240" icon={Footprints} bgClass="bg-blue-50 text-blue-600" />
          <SmallCard title="Calorías" value="2,100" icon={Flame} bgClass="bg-orange-50 text-orange-600" />
          <SmallCard title="Oxígeno" value="98%" icon={Activity} bgClass="bg-sky-50 text-sky-600" />
        </div>
      </div>

      {/* CHART CONTAINER */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-card border border-slate-200">
        <h3 className="font-bold text-navy-900 mb-4">Tendencia Semanal</h3>
        <div className="h-64 w-full relative">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
    </div>
  );
}

function SmallCard({ title, value, icon: Icon, bgClass }: { title: string, value: string, icon: React.ElementType, bgClass: string }) {
  return (
    <div className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-slate-100 flex items-center justify-between">
      <div className="flex flex-col">
        <p className="text-[0.6rem] font-bold uppercase text-slate-400 tracking-widest">{title}</p>
        <p className="text-xl font-bold text-navy-900 mt-1">{value}</p>
      </div>
      <div className={`p-2 rounded-xl ${bgClass}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}