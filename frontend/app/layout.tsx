import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GeoTeraProvider } from "@/lib/GeoTeraContext";
import Nav from "@/components/Nav";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GeoTera — Live World Intelligence",
  description: "Real-time global data dashboard: news, markets, climate, and population.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="bg-[#060b18] text-white min-h-screen">
        <GeoTeraProvider>
          <Nav />
          <main>{children}</main>
          <footer className="border-t border-white/10 py-8 text-center text-xs text-gray-700 px-6">
            <p>GeoTera — Live data refreshes every 15 minutes via WebSocket.</p>
            <p className="mt-1">Sources: BBC · Reuters · AP · Yahoo Finance · Open-Meteo · USGS · NOAA · WHO · REST Countries</p>
          </footer>
        </GeoTeraProvider>
      </body>
    </html>
  );
}
