import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/context/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";

export const metadata: Metadata = {
  title: "Social94 — Automated Social Media Marketing",
  description: "AI-powered social media marketing automation platform. Check audience reach, analyze content quality, manage campaigns, and automate reminders.",
  keywords: "social media marketing, automation, audience analytics, content quality, AI marketing",
  openGraph: {
    title: "Social94",
    description: "Automated Social Media Marketing Tool powered by Gemini AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <ToastProvider>
            <AuthGuard>
              <div className="app-layout">
                <Sidebar />
                <div className="main-content">
                  {children}
                </div>
                <BottomNav />
              </div>
            </AuthGuard>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
