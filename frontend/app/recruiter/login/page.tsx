"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, ArrowRight, Globe, Users } from "lucide-react";
import { homeTranslations, LANGUAGES, SupportedLanguage } from "@/lib/translations";

export default function RecruiterLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lang, setLang] = useState<SupportedLanguage>("kn");
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("app_lang") as SupportedLanguage;
    if (saved && (saved === "kn" || saved === "en" || saved === "hi")) {
      setLang(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === "admin" || user.role === "recruiter") {
        router.push("/recruiter");
      } else {
        router.push("/candidate");
      }
    }
  }, [user, authLoading, router]);

  const handleLangChange = (newLang: SupportedLanguage) => {
    setLang(newLang);
    localStorage.setItem("app_lang", newLang);
    document.documentElement.lang = newLang;
  };

  const t = homeTranslations[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        let errorMessage = "Login failed";
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map((e: any) => e.msg || JSON.stringify(e)).join(", ");
          } else {
            errorMessage = errorData.detail;
          }
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/me`, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });

      if (!userRes.ok) throw new Error("Failed to fetch user data");
      const userData = await userRes.json();
      
      login(data.access_token, userData, "/recruiter");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex fixed inset-0 bg-background overflow-hidden font-sans">
      {/* Top Bar with Language Switcher */}
      <div className="absolute top-5 right-6 z-30 flex items-center gap-2 bg-surface/90 backdrop-blur-sm border border-border px-3 py-1.5 rounded-xl shadow-sm">
        <Globe className="w-4 h-4 text-accent" />
        <select
          value={lang}
          onChange={(e) => handleLangChange(e.target.value as SupportedLanguage)}
          aria-label="Select language"
          className="bg-transparent text-xs font-semibold text-foreground outline-none cursor-pointer"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code} className="bg-surface text-foreground text-xs py-1">
              {l.nativeLabel} ({l.label})
            </option>
          ))}
        </select>
      </div>

      {/* Left side — Recruiter Capabilities & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#1B2A4A] border-r border-[#243352] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#D97706_0.75px,transparent_0.75px)] [background-size:24px_24px] opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D97706]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col justify-between p-16 h-full text-white w-full">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-amber-400/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-8">
              <span className="w-2 h-2 rounded-full bg-accent"></span>
              <span>ನೇಮಕಾತಿದಾರರ ಕನ್ಸೋಲ್ (Recruiter Console)</span>
            </div>

            <h1 className="text-5xl font-black leading-tight tracking-tight text-white mb-6">
              ನೇಮಕಾತಿಗೆ <br />
              <span className="text-amber-400">ವಿಶ್ವಾಸಾರ್ಹ AI</span> ವೇದಿಕೆ
            </h1>

            <p className="text-lg text-slate-300 max-w-lg font-normal leading-relaxed mb-8">
              ಉದ್ಯೋಗಗಳನ್ನು ಪೋಸ್ಟ್ ಮಾಡಿ, AI ಮೂಲಕ ಅಭ್ಯರ್ಥಿಗಳ ಅರ್ಹತೆಯನ್ನು ತಕ್ಷಣ ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಅರ್ಹ ಅಭ್ಯರ್ಥಿಗಳಿಗೆ ವರ್ಚುವಲ್ ಸಂದರ್ಶನ ಲಿಂಕ್ ಕಳುಹಿಸಿ.
            </p>
          </div>

          <div className="bg-[#131F37] p-6 rounded-2xl w-full max-w-lg border border-[#243352] shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-subtle text-accent flex items-center justify-center font-bold">
                <Users size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">ಸ್ವಯಂಚಾಲಿತ ಸ್ಕ್ರೀನಿಂಗ್ & ಸಂದರ್ಶನ ಲಿಂಕ್</p>
                <p className="text-xs text-slate-400">ಅರ್ಹ ಅಭ್ಯರ್ಥಿಗಳಿಗೆ ನೈಜ ಸಮಯದ ಕನ್ನಡ ಸಂದರ್ಶನ ಲಿಂಕ್ ಹಂಚಿಕೆ</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side — Recruiter Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 overflow-y-auto bg-background relative">
        <div className="w-full max-w-md space-y-6 animate-fade-in pt-12 lg:pt-0">
          <div className="space-y-1.5">
            <div className="inline-block px-2.5 py-1 rounded-md bg-accent-subtle text-accent-subtle-foreground text-xs font-bold uppercase mb-2">
              ನೇಮಕಾತಿದಾರರ ಲಾಗಿನ್ (Recruiter Login)
            </div>
            <h2 className="text-3xl font-black text-foreground tracking-tight">
              {t.loginTitle}
            </h2>
            <p className="text-foreground-muted text-sm font-medium">
              ನೇಮಕಾತಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಪ್ರವೇಶಿಸಲು ಲಾಗಿನ್ ಮಾಡಿ
            </p>
          </div>

          <div className="bg-surface p-8 rounded-2xl shadow-sm border border-border space-y-6">
            {/* Quick Demo Credentials Pill */}
            <div className="p-3 bg-surface-raised border border-border rounded-xl text-xs text-foreground-muted flex items-center justify-between">
              <div>
                <span className="font-semibold text-foreground">Default Recruiter:</span> recruiter@recruiter.com
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail("recruiter@recruiter.com");
                  setPassword("recruiter123");
                }}
                className="text-accent hover:underline font-semibold"
              >
                Auto-fill
              </button>
            </div>
            {error && (
              <div className="p-3.5 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-200 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  {t.emailLabel}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none text-foreground text-sm font-medium"
                    placeholder="recruiter@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  {t.passwordLabel}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none text-foreground text-sm font-medium"
                    placeholder={t.passwordPlaceholder}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 bg-primary hover:bg-[#131F37] text-white rounded-xl font-semibold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{t.loginButton}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink-0 mx-3 text-foreground-muted text-xs font-semibold uppercase">{t.orDivider}</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            <Link
              href="/register?role=recruiter"
              className="w-full flex items-center justify-center py-2.5 bg-surface-raised hover:bg-border/60 text-foreground border border-border rounded-xl font-semibold text-sm transition-colors"
            >
              ನೇಮಕಾತಿದಾರರ ಖಾತೆ ರಚಿಸಿ (Register as Recruiter)
            </Link>
          </div>

          <div className="flex items-center justify-between text-xs text-foreground-muted px-1">
            <Link href="/candidate/login" className="hover:text-primary font-semibold">
              ಅಭ್ಯರ್ಥಿಯೇ? ಇಲ್ಲಿ ಲಾಗಿನ್ ಮಾಡಿ →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

