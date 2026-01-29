'use client';

import { useAppStore } from '@/store/useAppStore';
import { Brain, Hexagon, Activity } from 'lucide-react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import ComingSoon from '@/components/ComingSoon';

// Register Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function ClinicalRadar() {
  const { currentRole } = useAppStore();

  // Permisos: Admin y Psicólogo pueden acceder
  const hasAccess = currentRole === 'admin' || currentRole === 'psychologist';

  if (!hasAccess) {
    return (
      <ComingSoon
        title="Análisis Multiaxial"
        subtitle="Sistema de Evaluación Clínica Integral próximamente"
        estimatedDate="Q2 2026"
      />
    );
  }

  const radarData: ChartData<'radar'> = {
    labels: ['Clínico', 'Personalidad', 'Médico', 'Psicosocial', 'Funcionalidad'],
    datasets: [
      {
        label: 'Paciente JM',
        data: [80, 65, 20, 70, 75],
        backgroundColor: 'rgba(37, 99, 235, 0.2)',
        borderColor: '#2563EB',
        pointBackgroundColor: '#2563EB',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#2563EB',
        borderWidth: 2,
      },
    ],
  };

  const radarOptions: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          display: false,
        },
        suggestedMin: 0,
        suggestedMax: 100,
        grid: {
          color: 'rgba(0,0,0,0.05)',
        },
        pointLabels: {
          font: {
            family: "'Plus Jakarta Sans', sans-serif",
            size: 11,
            weight: 'bold',
          },
          color: '#64748B',
        },
        ticks: {
          display: false,
          backdropColor: 'transparent',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scroll safe-bottom-scroll scroll-smooth w-full animate-fade-in-up flex flex-col items-center bg-slate-50/30">
      <div className="w-full px-2 xs:px-4 lg:px-12 py-8 max-w-[1700px]">
        {/* Header */}
        <div className="mb-8 p-6 bg-white/60 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-navy-950 rounded-2xl flex items-center justify-center shadow-lg">
              <Hexagon className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-navy-950 tracking-tight font-display">
                Evaluación Multiaxial
              </h1>
              <p className="text-slate-500 font-medium text-sm">
                Sistema de Análisis Clínico Integral
              </p>
            </div>
          </div>
          <button className="px-6 py-2.5 bg-navy-950 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-lg">
            Actualizar Métricas
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Radar Chart Card */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col min-h-[500px]">
            <h3 className="font-display font-bold text-xl text-navy-950 mb-6 flex items-center gap-3">
              <Activity className="w-5 h-5 text-blue-600" />
              Visualización de Perfil
            </h3>
            <div className="flex-1 relative w-full min-h-[400px]">
              <Radar data={radarData} options={radarOptions} />
            </div>
          </div>

          {/* Summary Panel */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col gap-6">
            <h3 className="font-display font-bold text-xl text-navy-900">
              Resumen por Ejes
            </h3>
            <div className="space-y-4 flex-1 overflow-y-auto custom-scroll p-1">
              <StatItem
                label="Eje I: Clínico"
                value="Ansiedad G."
                colorClass="text-red-500"
                bgColorClass="bg-red-50"
              />
              <StatItem
                label="Eje II: Personalidad"
                value="Rasgos Obsesivos"
                colorClass="text-orange-500"
                bgColorClass="bg-orange-50"
              />
              <StatItem
                label="Eje III: Médico"
                value="Sin Hallazgos"
                colorClass="text-emerald-500"
                bgColorClass="bg-emerald-50"
              />
              <StatItem
                label="Eje IV: Psicosocial"
                value="Estrés Laboral"
                colorClass="text-blue-500"
                bgColorClass="bg-blue-50"
              />
              <StatItem
                label="Eje V: GAF"
                value="75/100"
                colorClass="text-indigo-500"
                bgColorClass="bg-indigo-50"
              />
            </div>

            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
              <p className="text-xs text-blue-700 font-medium leading-relaxed">
                <span className="font-bold">Nota:</span> Estos datos reflejan la última evaluación realizada el 28 de Octubre, 2024.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({
  label,
  value,
  colorClass,
  bgColorClass
}: {
  label: string;
  value: string;
  colorClass: string;
  bgColorClass: string;
}) {
  return (
    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${colorClass.replace('text', 'bg')}`} />
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <span className={`text-sm font-bold ${colorClass} ${bgColorClass} px-3 py-1 rounded-lg`}>
        {value}
      </span>
    </div>
  );
}
