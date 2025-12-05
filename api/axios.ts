import axios from "axios";

// Get the N8N webhook URL from environment variables
const N8N_WEBHOOK = process.env.NEXT_PUBLIC_N8N_WEBHOOK || process.env.N8N_WEBHOOK;

if (!N8N_WEBHOOK) {
  console.warn('N8N_WEBHOOK environment variable is not set');
}

const instance = axios.create({
    baseURL: N8N_WEBHOOK || '',
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add request interceptor for logging
instance.interceptors.request.use(
  (config) => {
    console.log('Sending request to:', config.url);
    console.log('Request data:', config.data);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
instance.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.statusText);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export default instance;
