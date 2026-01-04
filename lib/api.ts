import axios from "axios";

// Backend URL is now hardcoded below

const api = axios.create({
    baseURL:
        process.env.NEXT_PUBLIC_API_URL || "https://nsg-backend.onrender.com",
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Add Authorization header if token exists
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("nsg-token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
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
