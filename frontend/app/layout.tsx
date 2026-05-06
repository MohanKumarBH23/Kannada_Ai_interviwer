import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kannada AI Interview",
  description: "AI-powered interview system in Kannada language",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="kn">
      <body suppressHydrationWarning className={`${inter.className} antialiased min-h-screen bg-slate-50 text-slate-900`}>
        <AuthProvider>
          <main className="w-full min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
