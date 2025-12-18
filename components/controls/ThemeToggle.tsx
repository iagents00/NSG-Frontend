"use client";

import { useAppStore } from "@/store/useAppStore";
import { Sun, Moon, Zap, Laptop } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "neon" | "system";

interface ThemeOption {
  id: Theme;
  label: string;
  icon: typeof Sun;
  description: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "light",
    label: "Light",
    icon: Sun,
    description: "Clean & Professional",
  },
  {
    id: "dark",
    label: "Dark",
    icon: Moon,
    description: "Easy on Eyes",
  },
  {
    id: "neon",
    label: "Neon",
    icon: Zap,
    description: "High Contrast",
  },
  {
    id: "system",
    label: "System",
    icon: Laptop,
    description: "Match Device",
  },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
        <div className="w-10 h-10 rounded-lg bg-slate-200 animate-pulse"></div>
        <div className="w-10 h-10 rounded-lg bg-slate-200 animate-pulse"></div>
        <div className="w-10 h-10 rounded-lg bg-slate-200 animate-pulse"></div>
        <div className="w-10 h-10 rounded-lg bg-slate-200 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <h4 className="font-bold text-sm text-navy-900 mb-1">Tema</h4>
        <p className="text-xs text-slate-500">Personaliza la apariencia</p>
      </div>

      <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
        {THEME_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isActive = theme === option.id;

          return (
            <button
              key={option.id}
              onClick={() => setTheme(option.id)}
              className={`flex-1 flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-lg transition-all duration-300 cursor-pointer ${
                isActive
                  ? "bg-white shadow-md text-blue-600 scale-105"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              }`}
              aria-pressed={isActive}
              aria-label={`Switch to ${option.label} theme`}
              title={option.description}
            >
              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive ? "scale-110" : ""
                }`}
              />
              <span className="text-xs font-bold">{option.label}</span>
            </button>
          );
        })}
      </div>

      {/* Theme Preview */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Preview
            </p>
            <div className="space-y-2">
              <div className="h-2 bg-slate-200 rounded-full w-full"></div>
              <div className="h-2 bg-slate-200 rounded-full w-3/4"></div>
              <div className="h-2 bg-blue-500 rounded-full w-1/2"></div>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
