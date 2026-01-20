import api from "./api";

export interface LocationData {
    latitude: number;
    longitude: number;
    timezone: string;
    city?: string;
    country?: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    role?: string;
    location?: LocationData;
}

export interface LoginData {
    email: string;
    password: string;
    location?: LocationData;
}

export interface AuthResponse {
    user: unknown; // Adjustable based on actual response
    token: string;
}

export const authService = {
    register: async (data: RegisterData) => {
        const response = await api.post<AuthResponse>("/auth/register", data);
        return response.data;
    },

    login: async (data: LoginData) => {
        const response = await api.post<AuthResponse>("/auth/login", data);
        return response.data;
    },

    verifySession: async () => {
        if (
            typeof window !== "undefined" &&
            !localStorage.getItem("nsg-token")
        ) {
            return;
        }
        try {
            const response = await api.get("/auth/verify-token");
            return response.data;
        } catch (error) {
            // Only remove token if the error is explicitly an authentication error (401)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (
                typeof window !== "undefined" &&
                (error as any)?.response &&
                (error as any)?.response?.status === 401
            ) {
                localStorage.removeItem("nsg-token");
            }
            throw error;
        }
    },

    logout: () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("nsg-token");
            localStorage.removeItem("nsg-storage");
            localStorage.removeItem("fathom_connected");
            // Opcional: limpiar todo si se desea máxima seguridad
            // localStorage.clear();
        }
    },
};
