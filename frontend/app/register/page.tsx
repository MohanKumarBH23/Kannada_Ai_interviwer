"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Mail, Lock, User, Loader2, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const [role, setRole] = useState<string>("user");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    if (roleParam === 'recruiter') {
      setRole('recruiter');
    } else {
      setRole('user');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Registration failed");
      }

      const data = await res.json();
      
      const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/me`, {
          headers: { Authorization: `Bearer ${data.access_token}` },
      });
      
      if (!userRes.ok) throw new Error("Failed to fetch user data");
      
      const userData = await userRes.json();
      const searchParams = new URLSearchParams(window.location.search);
      const redirectToParam = searchParams.get('redirectTo');
      
      let redirectTo = "/";
      if (redirectToParam) {
        redirectTo = redirectToParam;
      } else {
        if (userData.role === "admin" || userData.role === "recruiter") {
          redirectTo = "/recruiter";
        } else {
          redirectTo = "/candidate";
        }
      }
      
      login(data.access_token, userData, redirectTo);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isRecruiter = role === 'recruiter';

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-6 bg-background">
      <div className="w-full max-w-md p-8 rounded-2xl bg-surface shadow-sm border border-border">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-accent-subtle text-accent border border-amber-200/50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            {isRecruiter ? 'ನೇಮಕಾತಿದಾರರ ನೋಂದಣಿ' : 'ಹೊಸ ಖಾತೆ ರಚಿಸಿ'}
          </h1>
          <p className="text-foreground-muted text-sm mt-1 font-medium">
            {isRecruiter ? 'Recruiter registration' : 'Candidate registration'}
          </p>
          <div className="mt-3 inline-block px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-surface-raised border border-border text-foreground-muted">
            {isRecruiter ? 'ಪಾತ್ರ: ನೇಮಕಾತಿದಾರ (Recruiter)' : 'ಪಾತ್ರ: ಅಭ್ಯರ್ಥಿ (Candidate)'}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              ಹೆಸರು (Full Name)
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-10 pr-3.5 py-2.5 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none text-foreground text-sm font-medium transition-colors"
                placeholder="ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              ಇಮೇಲ್ (Email)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-3.5 py-2.5 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none text-foreground text-sm font-medium transition-colors"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              ಪಾಸ್‌ವರ್ಡ್ (Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-3.5 py-2.5 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none text-foreground text-sm font-medium transition-colors"
                placeholder="ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳು"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 bg-primary hover:bg-[#131F37] text-white rounded-xl font-semibold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>ನೋಂದಾಯಿಸಿ (Register)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs font-medium text-foreground-muted">
          ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?{" "}
          <Link href="/login" className="font-semibold text-accent hover:underline">
            ಲಾಗಿನ್ ಆಗಿ (Login)
          </Link>
        </p>
      </div>
    </div>
  );
}
