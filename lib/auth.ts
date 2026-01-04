import api from './api';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: any; // Adjustable based on actual response
  token: string;
}

export const authService = {
  register: async (data: RegisterData) => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData) => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  verifySession: async () => {
    if (typeof window !== 'undefined' && !localStorage.getItem('nsg-token')) {
      return; 
    }
    try {
      const response = await api.get('/auth/verify-token');
      return response.data;
    } catch (error: any) {
      // Only remove token if the error is explicitly an authentication error (401)
      if (typeof window !== 'undefined' && error.response && error.response.status === 401) {
        localStorage.removeItem('nsg-token');
      }
      throw error;
    }
  },

  logout: () => {
      localStorage.removeItem('nsg-token');
  },
};
