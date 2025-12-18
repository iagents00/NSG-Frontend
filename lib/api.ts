import axios from 'axios';

const appBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!appBackendUrl) {
  console.warn("⚠️ NOTICE: NEXT_PUBLIC_BACKEND_URL is not defined in your environment variables. API requests will default to the current origin, which may cause 404 or 405 errors if the routes do not exist locally.");
}

const api = axios.create({
  baseURL: 'https://nsg-backend.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Log the request to the console
    // Simplified request logging
    console.log(`🚀 Sending ${config.method?.toUpperCase()} request to ${config.url}`);

    // Add Authorization header if token exists
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `${token}`;
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
    console.log(`API Response from ${response.config.url}:`, response.data);
    return response;
  },
  (error) => {
    // Handle global errors here, e.g., logging or redirecting to login on 401
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
