"use client";

import { useEffect, useState } from "react";
import { authService } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";

export default function TokenVerifier({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // 1. Check if we are on a public path
      const isPublicPath = ['/auth/login', '/auth/register', '/auth/forgot-password', '/'].includes(pathname);
      const token = localStorage.getItem('nsg-token');

      // 2. Logic to determine authorization
      if (isPublicPath) {
        // Always allow public paths
        setIsAuthorized(true);
      } else if (token) {
        // If we have a token (and are on a private path), authorize temporarily
        // The background verification will handle validity
        setIsAuthorized(true);
      } else {
        // Private path AND no token -> Redirect and Block
        setIsAuthorized(false);
        router.replace('/auth/login');
        return; // Stop execution
      }

      // 3. Background Verification (only if we have a token)
      if (token) {
         try {
            await authService.verifySession();
         } catch (error) {
            // If verification fails (401), existing logic in authService removes token
            // Then we need to re-evaluate or redirect
            if (!localStorage.getItem('nsg-token')) {
                // Token was removed
                if (!isPublicPath) {
                   setIsAuthorized(false);
                   router.replace('/auth/login');
                }
            }
         }
      }
    };

    checkAuth();
    
    // Constant verification loop
    const intervalId = setInterval(checkAuth, 10000);
    return () => clearInterval(intervalId);
  }, [pathname, router]);

  // If not authorized, render NOTHING (null) effectively blocking the page
  if (!isAuthorized) {
      return null;
  }

  return <>{children}</>;
}
