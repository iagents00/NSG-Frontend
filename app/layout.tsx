import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastProvider";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter" 
});



const mono = JetBrains_Mono({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono" 
});

export const metadata: Metadata = {
  title: "NSG Intelligence | Deep Processing v14.6",
  description: "Cognitive Infrastructure for Enterprise",
};

import ThemeProvider from "@/components/providers/ThemeProvider";
import TokenVerifier from "@/components/auth/TokenVerifier";


// ... existing imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${mono.variable} antialiased h-full`} suppressHydrationWarning>
      <body className="h-full overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900" suppressHydrationWarning>
        <ThemeProvider>
          <TokenVerifier>
            <ToastProvider>{children}</ToastProvider>
          </TokenVerifier>
        </ThemeProvider>
      </body>
    </html>
  );
}