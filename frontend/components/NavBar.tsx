"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User as UserIcon } from "lucide-react";

export default function NavBar() {
  const { user, logout, loading } = useAuth();

  if (loading) return null;

  return (
    <nav className="flex justify-between items-center py-4 mb-8 border-b border-border bg-surface px-6 rounded-2xl shadow-sm">
      <Link href="/" className="text-xl font-bold text-primary flex items-center gap-2 tracking-tight">
        <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block"></span>
        <span className="text-primary font-black">ಕನ್ನಡ AI</span>
        <span className="text-xs px-2 py-0.5 rounded-md bg-accent-subtle text-accent font-semibold tracking-wide uppercase">Hiring</span>
      </Link>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <div className="flex items-center gap-2 text-sm font-medium text-foreground bg-surface-raised border border-border px-3.5 py-1.5 rounded-full">
              <UserIcon className="w-4 h-4 text-accent" />
              <span>{user.name}</span>
            </div>
            {user.role === 'admin' && (
              <Link href="/hiring" className="text-sm font-semibold text-foreground-muted hover:text-primary transition-colors">
                Hiring
              </Link>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-sm font-medium text-foreground-muted hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" /> ಲಾಗ್ ಔಟ್ (Logout)
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-sm font-semibold text-foreground-muted hover:text-primary transition-colors">
              ಲಾಗಿನ್ (Login)
            </Link>
            <Link href="/register" className="text-sm font-semibold bg-primary hover:bg-primary-hover text-primary-foreground px-5 py-2.5 rounded-xl shadow-sm transition-colors">
              ಖಾತೆ ರಚಿಸಿ (Register)
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
