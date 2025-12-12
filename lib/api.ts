import axios from 'axios';

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
    console.log(`API Request sent to ${config.url}:`, {
      method: config.method,
      data: config.data,
      params: config.params,
    });

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
    return response;
  },
  (error) => {
    // Handle global errors here, e.g., logging or redirecting to login on 401
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
