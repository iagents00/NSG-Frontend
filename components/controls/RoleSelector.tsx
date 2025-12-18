"use client";

import { useAppStore, Role } from "@/store/useAppStore";
import { CONTEXT } from "@/data/context";
import { Briefcase, Brain, TrendingUp, Building2 } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface RoleOption {
  id: Role;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: "consultant",
    label: "Consultor",
    description: "Gestión de Activos & Data Strategy",
    icon: Briefcase,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200 hover:border-blue-400",
  },
  {
    id: "psychologist",
    label: "Psicólogo",
    description: "Clínica & Análisis de Conducta",
    icon: Brain,
    color: "text-sky-600",
    bgColor: "bg-sky-50",
    borderColor: "border-sky-200 hover:border-sky-400",
  },
  {
    id: "patient",
    label: "Paciente",
    description: "Bienestar & Análisis de Conducta",
    icon: TrendingUp,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200 hover:border-emerald-400",
  },
  {
    id: "manager",
    label: "CEO / Directivo",
    description: "Inteligencia de Datos & KPIs",
    icon: Building2,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200 hover:border-purple-400",
  },
];

export default function RoleSelector() {
  const { currentRole, setRole } = useAppStore();

  const handleRoleChange = (role: Role) => {
    setRole(role);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-xl text-navy-900">
            Seleccionar Perfil
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Elige tu rol para personalizar la experiencia
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
            {CONTEXT[currentRole].roleDesc}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ROLE_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isActive = currentRole === option.id;

          return (
            <button
              key={option.id}
              onClick={() => handleRoleChange(option.id)}
              className={`group relative p-6 rounded-2xl text-left border-2 transition-all duration-300 transform hover:-translate-y-1 will-change-transform cursor-pointer ${
                isActive
                  ? `${option.borderColor.split(" ")[0]} shadow-md ring-2 ring-offset-2 ${option.color.replace("text", "ring")}`
                  : `border-slate-100 hover:shadow-md ${option.borderColor}`
              }`}
              aria-pressed={isActive}
              aria-label={`Select ${option.label} role`}
            >
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute top-4 right-4">
                  <div className={`w-3 h-3 ${option.color.replace("text", "bg")} rounded-full animate-pulse`}></div>
                </div>
              )}

              {/* Icon */}
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`w-14 h-14 ${option.bgColor} ${option.color} rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isActive ? "scale-110" : "group-hover:scale-105"
                  } will-change-transform`}
                >
                  <Icon className="w-7 h-7" />
                </div>
              </div>

              {/* Content */}
              <h4 className="font-display font-bold text-lg text-navy-900 mb-1">
                {option.label}
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                {option.description}
              </p>

              {/* Hover Arrow */}
              <div
                className={`absolute bottom-4 right-4 transition-all duration-300 ${
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
              >
                <svg
                  className={`w-5 h-5 ${option.color}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
