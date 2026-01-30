import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import React from "react";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "OrderGo - Restaurant Management",
  description: "Modern restaurant management platform for QR ordering and operations",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "OrderGo",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "OrderGo",
    title: "OrderGo - Restaurant Management",
    description: "Modern restaurant management platform for QR ordering and operations",
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/error-boundary";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          <ErrorBoundary>
            <ConvexClientProvider>
              {children}
            </ConvexClientProvider>
          </ErrorBoundary>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
