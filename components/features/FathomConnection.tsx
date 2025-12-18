"use client";

import React, { useState, useEffect } from 'react';
import { BarChart3, CheckCircle2, AlertCircle, Loader2, ExternalLink, TrendingUp, Users, Eye, Clock } from 'lucide-react';
import { fathomService, FathomSite } from '@/lib/fathom';
import { useToast } from '@/components/ui/ToastProvider';
import clsx from 'clsx';

export default function FathomConnection() {
  const { showToast } = useToast();
  
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [sites, setSites] = useState<FathomSite[]>([]);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    uniques?: number;
    visits?: number;
    pageviews?: number;
    avg_duration?: number;
    bounce_rate?: number;
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Verificar conexión al cargar
  useEffect(() => {
    checkConnectionStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Detectar callback de OAuth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const connected = urlParams.get('connected');
    const errorParam = urlParams.get('error');

    if (connected === 'true') {
      showToast('¡Cuenta de Fathom conectada exitosamente!', 'success');
      setIsConnected(true);
      loadSites();
      // Limpiar URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (errorParam) {
      let errorMessage = 'Error conectando con Fathom';
      switch (errorParam) {
        case 'oauth_denied':
          errorMessage = 'Autorización denegada por el usuario';
          break;
        case 'oauth_failed':
          errorMessage = 'Error en el proceso de autorización';
          break;
        case 'missing_params':
          errorMessage = 'Parámetros faltantes en la respuesta';
          break;
      }
      showToast(errorMessage, 'error');
      // Limpiar URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cargar sitios cuando se conecta
  useEffect(() => {
    if (isConnected && sites.length === 0) {
      loadSites();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  // Cargar estadísticas cuando se selecciona un sitio
  useEffect(() => {
    if (selectedSite) {
      loadStats(selectedSite);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSite]);

  const checkConnectionStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fathomService.checkConnection();
      setIsConnected(response.connected);
      if (response.connected) {
        loadSites();
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = () => {
    setIsConnecting(true);
    fathomService.connect();
  };

  const handleDisconnect = async () => {
    try {
      await fathomService.disconnect();
      setIsConnected(false);
      setSites([]);
      setSelectedSite(null);
      setStats(null);
      showToast('Cuenta de Fathom desconectada', 'info');
    } catch (err) {
      console.error('Disconnect error:', err);
      showToast('Error al desconectar la cuenta', 'error');
    }
  };

  const loadSites = async () => {
    try {
      const sitesData = await fathomService.getSites();
      setSites(sitesData);
      if (sitesData.length > 0 && !selectedSite) {
        setSelectedSite(sitesData[0].id);
      }
    } catch (err) {
      console.error('Load sites error:', err);
      showToast('Error al cargar los sitios', 'error');
    }
  };

  const loadStats = async (siteId: string) => {
    setLoadingStats(true);
    try {
      const statsData = await fathomService.getDashboardStats(siteId, '7d');
      setStats(statsData);
    } catch (err) {
      console.error('Load stats error:', err);
      showToast('Error al cargar las estadísticas', 'error');
    } finally {
      setLoadingStats(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-8 rounded-[2.5rem] shadow-card border border-slate-200">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-card border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xl text-navy-900">Fathom Analytics</h3>
            <p className="text-slate-500 text-sm">Conecta tu cuenta para ver estadísticas</p>
          </div>
        </div>
        
        {isConnected && (
          <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700">Conectado</span>
          </div>
        )}
      </div>

      {/* Connection Status */}
      {!isConnected ? (
        <div className="space-y-4">
          <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Conecta tu cuenta de Fathom Analytics para visualizar tus estadísticas en tiempo real.
                </p>
                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                  <li>Acceso seguro mediante OAuth 2.0</li>
                  <li>Visualiza métricas de todos tus sitios</li>
                  <li>Datos actualizados en tiempo real</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className={clsx(
              "w-full py-4 px-6 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-3 shadow-md",
              isConnecting
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:scale-[1.02] cursor-pointer'
            )}
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Conectando...
              </>
            ) : (
              <>
                <ExternalLink className="w-5 h-5" />
                Conectar con Fathom
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Sites Selector */}
          {sites.length > 0 && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Selecciona un sitio
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
          )}

          {/* Stats Display */}
          {loadingStats ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                icon={Users}
                label="Visitantes Únicos"
                value={stats.uniques?.toLocaleString() || '0'}
                color="blue"
              />
              <StatCard
                icon={Eye}
                label="Visitas Totales"
                value={stats.visits?.toLocaleString() || '0'}
                color="indigo"
              />
              <StatCard
                icon={TrendingUp}
                label="Páginas Vistas"
                value={stats.pageviews?.toLocaleString() || '0'}
                color="purple"
              />
              <StatCard
                icon={Clock}
                label="Duración Promedio"
                value={stats.avg_duration ? `${Math.round(stats.avg_duration)}s` : '0s'}
                color="emerald"
              />
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-sm">
              Selecciona un sitio para ver las estadísticas
            </div>
          )}

          {/* Disconnect Button */}
          <button
            onClick={handleDisconnect}
            className="w-full py-3 px-6 bg-red-50 text-red-600 font-bold rounded-2xl border border-red-100 hover:bg-red-100 hover:shadow-md transition-all text-sm cursor-pointer"
          >
            Desconectar Cuenta
          </button>
        </div>
      )}
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color: 'blue' | 'indigo' | 'purple' | 'emerald';
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  const colorStyles = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    purple: 'bg-purple-50 text-purple-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };

  return (
    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
      <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center mb-3', colorStyles[color])}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold text-navy-900">{value}</p>
    </div>
  );
}
