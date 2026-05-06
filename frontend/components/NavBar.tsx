"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User as UserIcon } from "lucide-react";

export default function NavBar() {
  const { user, logout, loading } = useAuth();

  if (loading) return null;

  return (
    <nav className="flex justify-between items-center py-4 mb-8 border-b border-amazon-green/10">
      <Link href="/" className="text-xl font-bold text-amazon-green flex items-center gap-2">
        Kannada AI
      </Link>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <div className="flex items-center gap-2 text-sm font-medium text-amazon-dark bg-amazon-light px-3 py-1.5 rounded-full">
              <UserIcon className="w-4 h-4 text-amazon-green" />
              <span>{user.name}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1 text-sm font-medium text-amazon-dark hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" /> ಲಾಗ್ ಔಟ್ (Logout)
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-sm font-bold text-amazon-dark hover:text-amazon-green transition-colors">
              ಲಾಗಿನ್ (Login)
            </Link>
            <Link href="/register" className="text-sm font-bold bg-amazon-green text-white px-5 py-2 rounded-xl hover:bg-amazon-dark shadow-sm transition-colors">
              ಖಾತೆ ರಚಿಸಿ (Register)
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
