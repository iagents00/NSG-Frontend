"use client";

import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { use } from "react"; 
import { useAppStore } from "@/store/useAppStore";
import { CONTEXT, RoleType } from "@/data/context";

// Lazy load components map
const Views: Record<string, any> = {
  // Main System
  nsg_intelligence: dynamic(() => import("@/components/views/NSGIntelligence")),
  
  // Modules
  nsg_news: dynamic(() => import("@/components/views/NSGNews")),
  nsg_clarity: dynamic(() => import("@/components/views/NSGClarity")),
  nsg_horizon: dynamic(() => import("@/components/views/NSGHorizon")),

  
  // Features
  calendar: dynamic(() => import("@/components/views/CalendarView")),
  metrics: dynamic(() => import("@/components/views/Metrics")),
  strategy: dynamic(() => import("@/components/views/Strategy")),
  wellness: dynamic(() => import("@/components/views/Wellness")),
  library: dynamic(() => import("@/components/views/Library")),
  journal: dynamic(() => import("@/components/views/Journal")),
  portfolio: dynamic(() => import("@/components/views/Portfolio")),
  reports: dynamic(() => import("@/components/views/Reports")),
  patients: dynamic(() => import("@/components/views/Patients")),
  clinical_radar: dynamic(() => import("@/components/views/ClinicalRadar")),
  deliverables: dynamic(() => import("@/components/views/Deliverables")),
  settings: dynamic(() => import("@/components/views/Settings")),
};

// Define which views are available for each role
const RoleViewAccess: Record<RoleType, string[]> = {
  consultant: ['nsg_intelligence', 'nsg_clarity', 'nsg_news', 'nsg_horizon', 'portfolio', 'calendar', 'reports', 'settings'],
  psychologist: ['nsg_intelligence', 'nsg_clarity', 'nsg_news', 'nsg_horizon', 'clinical_radar', 'calendar', 'patients', 'library', 'settings'],
  manager: ['nsg_intelligence', 'nsg_clarity', 'nsg_news', 'nsg_horizon', 'calendar', 'metrics', 'strategy', 'reports', 'portfolio', 'settings'],
  patient: ['nsg_intelligence', 'nsg_clarity', 'nsg_news', 'wellness', 'calendar', 'settings'],
};

interface PageProps {
  params: Promise<{ view: string }>;
}

export default function ViewPage({ params }: PageProps) {
  const { currentRole } = useAppStore();
  const resolvedParams = use(params);
  
  // Check if user has access to this view
  const roleKey = (currentRole as RoleType) || 'consultant';
  const allowedViews = RoleViewAccess[roleKey] || [];
  
  if (!allowedViews.includes(resolvedParams.view)) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8 bg-white rounded-3xl shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-navy-900 mb-4">Acceso Denegado</h2>
          <p className="text-slate-600 mb-6">
            Este view no esta disponible para tu rol: <strong>{currentRole}</strong>
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-500 transition"
          >
            Regresar
          </button>
        </div>
      </div>
    );
  }
  
  const Component = Views[resolvedParams.view];

  if (!Component) {
    return notFound();
  }

  if (resolvedParams.view === 'nsg_intelligence') {
    return <Component />;
  }

  return (
    <div className="h-full w-full overflow-y-auto custom-scroll relative p-6 lg:p-8">
      <Component />
    </div>
  );
}
