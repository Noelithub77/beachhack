import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Welcome to COCO",
  description:
    "A unified customer support platform where customers never have to start over. One continuous experience across chat, voice, and email.",
  keywords: [
    "customer support",
    "help desk",
    "context-aware",
    "AI support",
    "unified support",
  ],
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
