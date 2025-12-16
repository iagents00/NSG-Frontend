import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastProvider";

const inter = Inter({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter" 
});

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta" 
});

const mono = JetBrains_Mono({ 
  subsets: ["latin"], 
  weight: ["400", "500"],
  variable: "--font-mono" 
});

export const metadata: Metadata = {
  title: "NSG Intelligence | Deep Processing v14.6",
  description: "Cognitive Infrastructure for Enterprise",
};

import ThemeProvider from "@/components/providers/ThemeProvider";
import TokenVerifier from "@/components/auth/TokenVerifier";

// ... existing imports

import { AuthProvider } from "@/components/providers/AuthProvider";

// ... existing imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${jakarta.variable} ${mono.variable} antialiased h-full`} suppressHydrationWarning>
      <body className="h-full overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900" suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <TokenVerifier>
              <ToastProvider>{children}</ToastProvider>
            </TokenVerifier>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}