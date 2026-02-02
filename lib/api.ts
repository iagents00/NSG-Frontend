import axios from "axios";

// ============================================
// API Configuration
// ============================================

const isDevelopment = process.env.NEXT_PUBLIC_APP_ENV === "development" || process.env.NODE_ENV === "development";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
    if (isDevelopment) {
        console.warn("[WARNING] NEXT_PUBLIC_API_URL is not set. API calls will fail.");
    } else {
        throw new Error("NEXT_PUBLIC_API_URL is required in production environments.");
    }
}
// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000, // 30 seconds
});

// Log API URL on initialization (development only)
if (isDevelopment && typeof window !== "undefined") {
    console.info("[API] Base URL:", API_URL);
}

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
        if (isDevelopment && typeof window !== "undefined") {
            console.debug("[API] Request:", {
                method: config.method?.toUpperCase(),
                url: config.url,
                hasAuth: !!config.headers.Authorization,
            });
        }

        return config;
    },
    (error) => {
        if (isDevelopment) {
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
        if (isDevelopment && typeof window !== "undefined") {
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

            if (isDevelopment && status !== 404) {
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
                    if (isDevelopment) {
                        console.log("[INFO] Resource not found:", error.config?.url);
                    }
                    break;
                case 500:
                    console.error("Server Error: Something went wrong on the server");
                    break;
            }
        } else if (error.request) {
            // Request made but no response received
            if (isDevelopment) {
                console.error("[ERROR] Network Error: No response from server", {
                    url: error.config?.url,
                });
            }
        } else {
            // Something else happened
            if (isDevelopment) {
                console.error("[ERROR] Error:", error.message);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
