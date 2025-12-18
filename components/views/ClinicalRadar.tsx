"use client";
import { useEffect, useRef } from "react";
import { Hexagon } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import Chart from "chart.js/auto";

export default function ClinicalRadar() {
  const { showToast } = useToast();
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // Destroy previous instance to prevent memory leaks during re-renders
      if (chartInstance.current) chartInstance.current.destroy();

      // --- LEGACY CHART CONFIGURATION ---
      chartInstance.current = new Chart(chartRef.current, {
        type: 'radar',
        data: {
          labels: ['Clínico', 'Personalidad', 'Médico', 'Psicosocial', 'Funcionalidad'],
          datasets: [{ 
            label: 'Paciente JM', 
            data: [80, 65, 20, 70, 75], 
            backgroundColor: 'rgba(37, 99, 235, 0.2)', 
            borderColor: '#2563EB', 
            pointBackgroundColor: '#2563EB', 
            pointBorderColor: '#fff', 
            pointHoverBackgroundColor: '#fff', 
            pointHoverBorderColor: '#2563EB' 
          }]
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: false, 
          scales: { 
            r: { 
              angleLines: { display: false }, 
              suggestedMin: 0, 
              suggestedMax: 100, 
              grid: { color: 'rgba(0,0,0,0.05)' }, 
              pointLabels: { 
                font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: 'bold' }, 
                color: '#64748B' 
              }, 
              ticks: { display: false, backdropColor: 'transparent' } 
            } 
          }, 
          plugins: { legend: { display: false } } 
        }
      });
    }
    
    // Cleanup on unmount
    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col gap-6 animate-fade-in-up">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-[500px]">
        
        {/* CHART CONTAINER */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-card border border-slate-200 flex flex-col">
          <h3 className="font-display font-bold text-2xl text-navy-900 mb-6 flex items-center gap-3">
            <Hexagon className="w-6 h-6 text-blue-600" /> Evaluación Multiaxial
          </h3>
          <div className="flex-1 relative w-full h-full min-h-[300px]">
            <canvas ref={chartRef}></canvas>
          </div>
        </div>

        {/* SIDE PANEL (Stat Items) */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-card border border-slate-200 flex flex-col gap-6">
          <h3 className="font-display font-bold text-xl text-navy-900">Resumen Clínico</h3>
          <div className="space-y-4 flex-1 overflow-y-auto custom-scroll p-1">
             <StatItem label="Eje I: Clínico" value="Ansiedad G." color="text-red-500" bg="bg-red-50" />
             <StatItem label="Eje II: Personalidad" value="Rasgos Obsesivos" color="text-orange-500" bg="bg-orange-50" />
             <StatItem label="Eje III: Médico" value="Sin Hallazgos" color="text-emerald-500" bg="bg-emerald-50" />
             <StatItem label="Eje IV: Psicosocial" value="Estrés Laboral" color="text-blue-500" bg="bg-blue-50" />
             <StatItem label="Eje V: GAF" value="75/100" color="text-indigo-500" bg="bg-indigo-50" />
          </div>
          <button onClick={() => showToast('Métricas actualizadas', 'success')} className="w-full py-3 bg-navy-950 text-white rounded-xl font-bold hover:bg-blue-700 transition cursor-pointer">
            Actualizar Métricas
          </button>
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value, color, bg }: { label: string, value: string, color: string, bg: string }) {
  return (
    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${color.replace('text', 'bg')}`}></div>
        <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">{label}</span>
      </div>
      <span className={`text-sm font-bold ${color} ${bg} px-3 py-1 rounded-lg`}>{value}</span>
    </div>
  );
}