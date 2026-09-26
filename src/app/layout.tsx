import type { Metadata } from "next";
import { Inter, Syne, Playfair_Display, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const syne = Syne({ subsets: ["latin"], variable: "--font-display" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif", style: ['normal', 'italic'] });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "CERTIFY - Digital Credentials",
  description: "Generate and verify digitally verifiable certificates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${syne.variable} ${playfair.variable} ${mono.variable} font-sans antialiased bg-gray-50 text-gray-900 min-h-screen flex flex-col`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
