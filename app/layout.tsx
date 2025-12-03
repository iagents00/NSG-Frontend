import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import DynamicIsland from "@/components/layout/DynamicIsland";

const inter = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "NSG Intelligence | Deep Processing v14.6",
  description: "Cognitive Infrastructure for Enterprise",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable} ${mono.variable} antialiased h-full`}>
      <body className="h-full overflow-hidden bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 flex">
        <Sidebar />
        <main className="flex-1 flex flex-col relative overflow-hidden bg-[#F8FAFC] w-full h-full">
            <DynamicIsland />
            {children}
        </main>
      </body>
    </html>
  );
}
