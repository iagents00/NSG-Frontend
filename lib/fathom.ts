import api from './api';

export interface FathomSite {
  id: string;
  name: string;
  sharing: string;
  created_at: string;
}

export interface FathomStats {
  visits: number;
  uniques: number;
  pageviews: number;
  avg_duration: number;
  bounce_rate: number;
}

export const fathomService = {
  // Iniciar conexión OAuth (redirige al backend con el token JWT)
  connect: () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('No hay token de autenticación');
      window.location.href = '/auth/login';
      return;
    }
    
    // Redirigir al backend con el token en la URL (el backend lo validará)
    window.location.href = `${backendUrl}/fathom/connect?token=${encodeURIComponent(token)}`;
  },

  // Verificar estado de conexión
  checkConnection: async () => {
    try {
      const response = await api.get('/fathom/connection/status');
      return response.data;
    } catch (error) {
      console.error('Error checking Fathom connection:', error);
      throw error;
    }
  },

  // Desconectar cuenta
  disconnect: async () => {
    try {
      const response = await api.delete('/fathom/connection');
      return response.data;
    } catch (error) {
      console.error('Error disconnecting Fathom:', error);
      throw error;
    }
  },

  // Obtener sitios del usuario
  getSites: async () => {
    try {
      const response = await api.get<{ success: boolean; data: FathomSite[] }>('/fathom/user/sites');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching Fathom sites:', error);
      throw error;
    }
  },

  // Obtener estadísticas de un sitio
  getSiteStats: async (siteId: string, params?: {
    from?: string;
    to?: string;
    aggregates?: string;
  }) => {
    try {
      const queryParams = new URLSearchParams(params as Record<string, string>).toString();
      const url = `/fathom/user/sites/${siteId}/stats${queryParams ? `?${queryParams}` : ''}`;
      const response = await api.get<{ success: boolean; data: unknown }>(url);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching Fathom stats:', error);
      throw error;
    }
  },

  // Obtener estadísticas resumidas para dashboard
  getDashboardStats: async (siteId: string, period: '24h' | '7d' | '30d' | '90d' = '7d') => {
    try {
      const response = await api.get<{ success: boolean; data: FathomStats }>(`/fathom/user/sites/${siteId}/dashboard?period=${period}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching Fathom dashboard stats:', error);
      throw error;
    }
  },
};
