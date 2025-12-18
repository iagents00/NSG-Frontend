"use client";
import Sidebar from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";
import AIModal from "@/components/layout/AIModal";
import { useUIStore } from "@/store/useUIStore";
import DayDetailPanel from "@/components/features/DayDetailPanel";
import clsx from "clsx";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDayDetailOpen, closeDayDetail } = useUIStore();

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      
      {/* 1. Sidebar (Fixed or Slide-out) */}
      <Sidebar />

      {/* 2. Main Content Wrapper */}
      <main className="flex-1 flex flex-col relative overflow-hidden w-full h-full">
        
        {/* Header */}
        <TopNav />

        {/* Dynamic Page Content */}
        <div id="workspace-content" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scroll safe-bottom-scroll scroll-smooth w-full">
           {children}
        </div>

      </main>

      {/* 3. Global Modals (Overlaying everything) */}
      <AIModal />
      
      {/* 4. Day Detail Panel (Slide Over) */}
      <DayDetailPanel />
      
      {/* Backdrop for Day Detail Panel */}
      <div 
        className={clsx(
          "fixed inset-0 bg-navy-950/20 z-105 backdrop-blur-sm transition-opacity",
          isDayDetailOpen ? "opacity-100 block" : "opacity-0 hidden pointer-events-none"
        )} 
        onClick={closeDayDetail}
      />
    </div>
  );
}
