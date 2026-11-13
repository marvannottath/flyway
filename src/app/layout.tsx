import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Flyway — Enterprise AI Automation & High-Concurrency Cloud Engine",
  description:
    "High-speed AI workflow orchestration, document intelligence extraction nodes, and usage-based compute credit engine for global enterprise fintech and SaaS.",
  keywords: [
    "AI automation",
    "compute credits",
    "cloud engine",
    "document intelligence",
    "high concurrency",
    "fintech SaaS",
    "usage-based billing",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background font-sans antialiased text-foreground flex flex-col selection:bg-brand-cyan/30 selection:text-brand-cyan">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
