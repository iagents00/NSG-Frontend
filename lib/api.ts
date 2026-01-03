import axios from 'axios';

// Backend URL is now hardcoded below

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add Authorization header if token exists
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
<<<<<<< HEAD
        config.headers.Authorization = `Bearer ${token}`;
=======
        config.headers.Authorization = `${token}`;
        console.log('🔑 Token attached to request');
      } else {
        console.warn('⚠️ No token found in localStorage');
>>>>>>> 4da6b8c929bf31ac2743586204de22d6928b6763
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
