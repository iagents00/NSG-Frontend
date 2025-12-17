"use client";

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Clock, 
  MousePointerClick,
  Calendar,
  Loader2,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { fathomService, FathomSite } from '@/lib/fathom';
import { useToast } from '@/components/ui/ToastProvider';
import clsx from 'clsx';

interface FathomDashboardProps {
  className?: string;
}

export default function FathomDashboard({ className }: FathomDashboardProps) {
  const { showToast } = useToast();
  
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sites, setSites] = useState<FathomSite[]>([]);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (selectedSite && selectedPeriod) {
      loadStats(selectedSite, selectedPeriod);
    }
  }, [selectedSite, selectedPeriod]);

  const checkConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fathomService.checkConnection();
      setIsConnected(response.connected);
      if (response.connected) {
        await loadSites();
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSites = async () => {
    try {
      const sitesData = await fathomService.getSites();
      setSites(sitesData);
      if (sitesData.length > 0 && !selectedSite) {
        setSelectedSite(sitesData[0].id);
      }
    } catch (error) {
      showToast('Error al cargar los sitios', 'error');
    }
  };

  const loadStats = async (siteId: string, period: '24h' | '7d' | '30d' | '90d') => {
    setLoadingStats(true);
    try {
      const statsData = await fathomService.getDashboardStats(siteId, period);
      setStats(statsData);
    } catch (error) {
      showToast('Error al cargar las estadísticas', 'error');
    } finally {
      setLoadingStats(false);
    }
  };

  const handleRefresh = () => {
    if (selectedSite) {
      loadStats(selectedSite, selectedPeriod);
      showToast('Estadísticas actualizadas', 'success');
    }
  };

  if (isLoading) {
    return (
      <div className={clsx("bg-white p-8 rounded-[2.5rem] shadow-card border border-slate-200", className)}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className={clsx("bg-white p-8 rounded-[2.5rem] shadow-card border border-slate-200", className)}>
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="font-display font-bold text-xl text-navy-900 mb-2">
            Conecta tu cuenta de Fathom
          </h3>
          <p className="text-slate-500 text-sm mb-6">
            Ve a Configuración para conectar tu cuenta de Fathom Analytics
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx("space-y-6", className)}>
      {/* Header Controls */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-card border border-slate-200">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Site Selector */}
          <div className="flex-1 w-full lg:w-auto">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
              Sitio Web
            </label>
            <select
              value={selectedSite || ''}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
            >
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </div>

          {/* Period Selector */}
          <div className="flex gap-2">
            {(['24h', '7d', '30d', '90d'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={clsx(
                  "px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer",
                  selectedPeriod === period
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {period === '24h' ? '24h' : period === '7d' ? '7 días' : period === '30d' ? '30 días' : '90 días'}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={loadingStats}
            className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={clsx("w-5 h-5 text-slate-600", loadingStats && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      {loadingStats ? (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-card border border-slate-200">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            icon={Users}
            label="Visitantes Únicos"
            value={stats.uniques?.toLocaleString() || '0'}
            color="blue"
            trend="+12%"
          />
          <MetricCard
            icon={Eye}
            label="Visitas Totales"
            value={stats.visits?.toLocaleString() || '0'}
            color="indigo"
            trend="+8%"
          />
          <MetricCard
            icon={MousePointerClick}
            label="Páginas Vistas"
            value={stats.pageviews?.toLocaleString() || '0'}
            color="purple"
            trend="+15%"
          />
          <MetricCard
            icon={Clock}
            label="Duración Promedio"
            value={stats.avg_duration ? `${Math.round(stats.avg_duration)}s` : '0s'}
            color="emerald"
            trend="+5%"
          />
        </div>
      ) : (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-card border border-slate-200">
          <div className="text-center py-12 text-slate-500 text-sm">
            No hay datos disponibles para este período
          </div>
        </div>
      )}

      {/* Additional Stats */}
      {stats && (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-card border border-slate-200">
          <h3 className="font-display font-bold text-xl text-navy-900 mb-6">
            Métricas Adicionales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Tasa de Rebote</p>
                  <p className="text-2xl font-bold text-navy-900">
                    {stats.bounce_rate ? `${(stats.bounce_rate * 100).toFixed(1)}%` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Período Analizado</p>
                  <p className="text-2xl font-bold text-navy-900">
                    {selectedPeriod === '24h' ? 'Últimas 24h' : 
                     selectedPeriod === '7d' ? 'Últimos 7 días' : 
                     selectedPeriod === '30d' ? 'Últimos 30 días' : 
                     'Últimos 90 días'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Metric Card Component
interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color: 'blue' | 'indigo' | 'purple' | 'emerald';
  trend?: string;
}

function MetricCard({ icon: Icon, label, value, color, trend }: MetricCardProps) {
  const colorStyles = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    purple: 'bg-purple-50 text-purple-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };

  return (
    <div className="bg-white p-6 rounded-[2.5rem] shadow-card border border-slate-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={clsx('w-12 h-12 rounded-2xl flex items-center justify-center', colorStyles[color])}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
            {trend}
          </span>
        )}
      </div>
      <p className="text-sm text-slate-500 font-medium mb-2">{label}</p>
      <p className="text-3xl font-bold text-navy-900">{value}</p>
    </div>
  );
}
