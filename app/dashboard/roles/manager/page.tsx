"use client";

import { useAppStore } from "@/store/useAppStore";
import Link from "next/link";
import { ArrowRight, Activity, Users, DollarSign, TrendingUp, Briefcase, Building2 } from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import RoleSelector from "@/components/controls/RoleSelector";
import ThemeToggle from "@/components/controls/ThemeToggle";
import dynamic from "next/dynamic";

const ChartComponent = dynamic(() => import("@/components/dashboard/ChartComponent"), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-slate-50 rounded-2xl flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-medium text-slate-400">Loading Chart...</p>
      </div>
    </div>
  ),
});

export default function Dashboard() {
  const { currentRole } = useAppStore();

  return (
    <div className="flex-1 overflow-y-auto custom-scroll">
      <div className="p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl lg:text-4xl text-navy-900 mb-2">
              Dashboard
            </h1>
            <p className="text-slate-500 font-medium">
              Welcome back, <span className="font-bold text-navy-900">{currentRole}</span>
            </p>
          </div>
          <Link
            href="/chat"
            className="bg-navy-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all flex items-center gap-2 shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 will-change-transform w-fit"
          >
            Open Neural Core <ArrowRight className="w-4 h-4" />
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            title="System Status"
            subtitle="Performance"
            icon={Activity}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 font-medium">Uptime</span>
                <span className="font-bold text-navy-900">99.9%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 w-[98%] h-full rounded-full transition-all duration-1000"></div>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold">
                <TrendingUp className="w-3 h-3" />
                <span>Optimal Performance</span>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Total Employees"
            subtitle="HR Metrics"
            icon={Users}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-display font-bold text-navy-900">150</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                  Stable
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 w-[100%] h-full rounded-full transition-all duration-1000"></div>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Revenue (YTD)"
            subtitle="Financial"
            icon={DollarSign}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-display font-bold text-navy-900">$2.4M</span>
                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
                  +15% YoY
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 w-[85%] h-full rounded-full transition-all duration-1000"></div>
              </div>
            </div>
          </DashboardCard>
        </div>

        <DashboardCard
          title="Executive Analytics"
          subtitle="Last 30 Days"
          icon={TrendingUp}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          glassmorphism={false}
        >
          <ChartComponent role={currentRole} />
        </DashboardCard>

        <DashboardCard
          title="Profile Management"
          subtitle="Customize Experience"
          icon={Building2}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        >
          <RoleSelector />
        </DashboardCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardCard
            title="Appearance"
            subtitle="Visual Settings"
            glassmorphism={true}
          >
            <ThemeToggle />
          </DashboardCard>

          <DashboardCard
            title="Quick Actions"
            subtitle="Shortcuts"
            neonBorder={true}
          >
            <div className="space-y-3">
              <Link
                href="/chat"
                className="flex items-center justify-between p-3 bg-slate-50 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-200 group"
              >
                <span className="font-medium text-slate-700 group-hover:text-blue-600">
                  Start New Conversation
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-emerald-50 rounded-xl transition-all border border-transparent hover:border-emerald-200 group">
                <span className="font-medium text-slate-700 group-hover:text-emerald-600">
                  View Reports
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
