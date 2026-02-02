// app/dashboard/page.tsx  -> Dispatcher  traffic controller -> looks the user role and inmediaately pushes them into the correct sub-folder
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";

export default function DashboardDispatcher() {
  const { currentRole } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    // 1. Security Check
    if (!currentRole) {
      router.replace("/"); 
      return;
    }

    // 2. Logic: Define the "Home View" for each role
    // Currently, everyone starts at the Main System (nsg_intelligence), 
    // but you can change this (e.g., manager -> 'metrics')
    const defaultViews: Record<string, string> = {
      manager: "nsg_intelligence", 
      consultant: "nsg_intelligence", 
      psychologist: "nsg_intelligence", 
      patient:  "nsg_intelligence",
    };

    const view = defaultViews[currentRole] || "nsg_intelligence";
    
    // 3. Execute Redirect to the Dynamic Route
    // This sends the user to: /dashboard/nsg_intelligence
    router.replace(`/dashboard/${view}`);
    
  }, [currentRole, router]);

  // 4. Loading State
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="font-display text-sm font-medium text-slate-500 animate-pulse">
          Accessing Neural Core...
        </p>
      </div>
    </div>
  );
}
