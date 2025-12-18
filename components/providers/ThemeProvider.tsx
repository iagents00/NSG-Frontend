"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = (targetTheme: string) => {
      root.classList.remove("light", "dark", "neon");
      root.classList.add(targetTheme);

      if (targetTheme === "dark") {
        root.style.setProperty("--background", "#0B1121");
        root.style.setProperty("--foreground", "#ededed");
      } else if (targetTheme === "neon") {
        root.style.setProperty("--background", "#020410");
        root.style.setProperty("--foreground", "#60A5FA");
      } else {
        root.style.setProperty("--background", "#F8FAFC");
        root.style.setProperty("--foreground", "#0F172A");
      }
    };

    if (theme === 'system') {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      
      const handleSystemChange = () => {
         const systemTheme = mediaQuery.matches ? "dark" : "light";
         applyTheme(systemTheme);
      };

      handleSystemChange(); // Initial apply

      mediaQuery.addEventListener("change", handleSystemChange);
      return () => mediaQuery.removeEventListener("change", handleSystemChange);
    } 
    
    // Explicit theme
    applyTheme(theme);
    
  }, [theme]);

  return <>{children}</>;
}
