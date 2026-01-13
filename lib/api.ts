import axios from "axios";

// ============================================
// API Configuration
// ============================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://nsg-backend.onrender.com";
const isDevelopment = process.env.NEXT_PUBLIC_APP_ENV === "development" || process.env.NODE_ENV === "development";

// Validate API URL
if (!process.env.NEXT_PUBLIC_API_URL && isDevelopment) {
    console.warn(
        "⚠️ NEXT_PUBLIC_API_URL not set. Using default:",
        API_URL
    );
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
    console.info("🔗 API Base URL:", API_URL);
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
            console.debug("📤 API Request:", {
                method: config.method?.toUpperCase(),
                url: config.url,
                hasAuth: !!config.headers.Authorization,
            });
        }

        return config;
    },
    (error) => {
        if (isDevelopment) {
            console.error("❌ Request Error:", error);
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
            console.debug("📥 API Response:", {
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

            if (isDevelopment) {
                console.error("❌ API Error:", {
                    status,
                    message,
                    url: error.config?.url,
                    data: error.response.data,
                });
            }

            // Handle specific error cases
            switch (status) {
                case 401:
                    // Unauthorized - clear token and redirect to login
                    if (typeof window !== "undefined") {
                        localStorage.removeItem("nsg-token");
                        // Only redirect if not already on login page
                        if (!window.location.pathname.includes("/auth/login")) {
                            window.location.href = "/auth/login";
                        }
                    }
                    break;
                case 403:
                    console.error("Forbidden: You don't have permission to access this resource");
                    break;
                case 404:
                    console.error("Not Found: The requested resource doesn't exist");
                    break;
                case 500:
                    console.error("Server Error: Something went wrong on the server");
                    break;
            }
        } else if (error.request) {
            // Request made but no response received
            if (isDevelopment) {
                console.error("❌ Network Error: No response from server", {
                    url: error.config?.url,
                });
            }
        } else {
            // Something else happened
            if (isDevelopment) {
                console.error("❌ Error:", error.message);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
