"use client";

import { useEffect, useState } from "react";
import { authService } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";

export default function TokenVerifier({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const { setUserLocation, setUserProfile, setUserId } = useAppStore();

    useEffect(() => {
        const checkAuth = async () => {
            const publicPaths = [
                "/",
                "/auth/login",
                "/auth/register",
                "/auth/forgot-password",
                "/privacy",
                "/politica-de-privacidad",
                "/condiciones-del-servicio",
            ];

            const isPublicPath = publicPaths.some((path) =>
                path === "/" ? pathname === "/" : pathname.startsWith(path),
            );

            let token =
                typeof window !== "undefined"
                    ? localStorage.getItem("nsg-token")
                    : null;

            // Handle edge cases where token might be a string "null" or "undefined"
            if (token === "null" || token === "undefined") {
                token = null;
                if (typeof window !== "undefined")
                    localStorage.removeItem("nsg-token");
            }

            if (isPublicPath) {
                setIsAuthorized(true);
            } else if (token) {
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
                router.replace("/auth/login");
                return;
            }

            if (token) {
                try {
                    const response = await authService.verifySession();
                    if (response?.user) {
                        setUserProfile(response.user);
                        if (response.user.id) {
                            setUserId(response.user.id);
                        }
                        if (response.user.location) {
                            setUserLocation(response.user.location);
                        }
                    }
                } catch (error) {
                    console.error(
                        "[TokenVerifier] Error verifying session:",
                        error,
                    );
                    if (
                        typeof window !== "undefined" &&
                        !localStorage.getItem("nsg-token")
                    ) {
                        if (!isPublicPath) {
                            setIsAuthorized(false);
                            router.replace("/auth/login");
                        }
                    }
                }
            }
        };

        checkAuth();

        // Check every 30 seconds instead of 10 to reduce server load
        const intervalId = setInterval(checkAuth, 30000);
        return () => clearInterval(intervalId);
    }, [pathname, router, setUserLocation, setUserProfile, setUserId]);

    // If not authorized, render NOTHING (null) effectively blocking the page
    if (!isAuthorized) {
        return null;
    }

    return <>{children}</>;
}
