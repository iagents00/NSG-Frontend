"use client";

import { useAppStore } from "@/store/useAppStore";
import Link from "next/link";
import { ArrowRight, Activity, Users, DollarSign } from "lucide-react";

export default function Dashboard() {
  const { currentRole } = useAppStore();

  return (
    <div className="p-8 space-y-8 overflow-y-auto custom-scroll h-full">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Welcome back, {currentRole}.</p>
        </div>
        <Link href="/chat" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition flex items-center gap-2 shadow-lg">
           Open Neural Core <ArrowRight className="w-4 h-4" />
        </Link>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">System Status</p>
                    <h3 className="text-xl font-bold text-slate-900">Optimal</h3>
                </div>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 w-[92%] h-full rounded-full"></div>
            </div>
         </div>

         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Users</p>
                    <h3 className="text-xl font-bold text-slate-900">1,240</h3>
                </div>
            </div>
             <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 w-[78%] h-full rounded-full"></div>
            </div>
         </div>

         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Revenue (Q4)</p>
                    <h3 className="text-xl font-bold text-slate-900">$450k</h3>
                </div>
            </div>
             <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 w-[65%] h-full rounded-full"></div>
            </div>
         </div>
      </div>
      
      {/* Content Area Placeholder */}
      <div className="bg-white rounded-3xl border border-slate-200 h-96 flex items-center justify-center text-slate-400 font-medium">
          Chart Area (React Chart.js)
      </div>
    </div>
  );
}
