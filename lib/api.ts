import axios from "axios";

// ============================================
// Client-side API Configuration
// ============================================
// This API client connects to Next.js API routes (server-side proxy)
// The API routes then forward requests to the actual backend
// This keeps the backend URL hidden from the client bundle

// All calls go through Next.js API routes (same-origin)
const API_URL = "/api/backend";

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 120000, // Increased to 2 minutes
});

// ============================================
// Request Interceptor
// ============================================
api.interceptors.request.use(
    (config) => {
        // Add Authorization header if token exists
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("nsg-token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        // Log request in development
        if (process.env.NODE_ENV === 'development' && typeof window !== "undefined") {
            console.debug("[API] Request:", {
                method: config.method?.toUpperCase(),
                url: config.url,
                hasAuth: !!config.headers.Authorization,
            });
        }

        return config;
    },
    (error) => {
        if (process.env.NODE_ENV === 'development') {
            console.error("[ERROR] Request Error:", error);
        }
        return Promise.reject(error);
    }
);

// ============================================
// Response Interceptor
// ============================================
api.interceptors.response.use(
    (response) => {
        // Log response in development
        if (process.env.NODE_ENV === 'development' && typeof window !== "undefined") {
            console.debug("[API] Response:", {
                status: response.status,
                url: response.config.url,
            });
        }
        return response;
    },
    (error) => {
        // Enhanced error handling
        if (error.response) {
            // Server responded with error status
            const status = error.response.status;
            const message = error.response.data?.message || error.message;

            if (process.env.NODE_ENV === 'development' && status !== 404) {
                console.error(`[API Error] ${status} ${message} - URL: ${error.config?.url}`);
            }

            // Handle specific error cases
            switch (status) {
                case 401:
                    // Unauthorized - means session is invalid or expired
                    if (typeof window !== "undefined") {
                        const token = localStorage.getItem("nsg-token");
                        if (token) {
                            console.log("[AUTH] Session invalid (401), clearing token and redirecting");
                            localStorage.removeItem("nsg-token");
                        }

                        // Only redirect if not already on public/login page
                        if (!window.location.pathname.includes("/auth/login") &&
                            !window.location.pathname.includes("/auth/register") &&
                            window.location.pathname !== "/") {
                            window.location.href = "/auth/login";
                        }
                    }
                    break;
                case 403:
                    console.error("Forbidden: You don't have permission to access this resource");
                    break;
                case 404:
                    // Don't log 404 as errors - many are expected for new users
                    if (process.env.NODE_ENV === 'development') {
                        console.log("[INFO] Resource not found:", error.config?.url);
                    }
                    break;
                case 500:
                    console.error("Server Error: Something went wrong on the server");
                    break;
            }
        } else if (error.request) {
            // Request made but no response received
            const isVerifyToken = error.config?.url?.includes('/auth/verify-token');
            if (process.env.NODE_ENV === 'development' && !isVerifyToken) {
                console.error("[ERROR] Network Error: No response from server", {
                    url: error.config?.url,
                });
            }
        } else {
            // Something else happened
            if (process.env.NODE_ENV === 'development') {
                console.error("[ERROR] Error:", error.message);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
