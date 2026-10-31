"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, ArrowRight, User as UserIcon, Briefcase, ShieldCheck, Globe } from "lucide-react";
import { homeTranslations, LANGUAGES, SupportedLanguage } from "@/lib/translations";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<"candidate" | "recruiter">("candidate");
  const [lang, setLang] = useState<SupportedLanguage>("kn");
  const { login, user, loading: authLoading, logout } = useAuth();
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
        headers: {
          "Content-Type": "application/json",
        },
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

      if (!userRes.ok) {
        const errorData = await userRes.json();
        throw new Error(errorData.detail || "Failed to fetch user data");
      }

      const userData = await userRes.json();
      
      let redirectTo = "/";
      if (userData.role === "admin" || userData.role === "recruiter") {
        redirectTo = "/recruiter";
      } else {
        redirectTo = "/candidate";
      }
      
      login(data.access_token, userData, redirectTo);

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

  const isLoggedIn = !!user;
  const u = user as any;
  const effectiveRole = isLoggedIn ? (u.role === 'admin' || u.role === 'recruiter' ? 'recruiter' : 'candidate') : role;
  const isRecruiter = effectiveRole === 'recruiter';

  return (
    <div className="min-h-screen w-full flex fixed inset-0 bg-background overflow-hidden">
      {/* Top Language Translator Bar */}
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

      {/* Left side - Karnataka Modern Heritage Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#1B2A4A] border-r border-[#243352] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#D97706_0.75px,transparent_0.75px)] [background-size:24px_24px] opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D97706]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col justify-between p-16 h-full text-white w-full">
          <div>
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-amber-400/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-8">
              <span className="w-2 h-2 rounded-full bg-accent"></span>
              <span>{t.platformBadge}</span>
            </div>

            <h1 className="text-5xl xl:text-6xl font-black leading-tight tracking-tight text-white mb-6">
              {isRecruiter ? (
                <>
                  {t.heroRecruiterPrefix} <br />
                  <span className="text-amber-400">{t.heroRecruiterHighlight}</span> {t.heroRecruiterSuffix}
                </>
              ) : (
                <>
                  {t.heroCandidatePrefix} <br />
                  <span className="text-amber-400">{t.heroCandidateHighlight}</span>
                </>
              )}
            </h1>

            <p className="text-lg text-slate-300 max-w-lg font-normal leading-relaxed mb-8">
              {isRecruiter ? t.heroDescRecruiter : t.heroDescCandidate}
            </p>
          </div>

          <div className="bg-[#131F37] p-6 rounded-2xl w-full max-w-lg border border-[#243352] shadow-sm">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="border-r border-[#243352] pr-2">
                <p className="text-2xl font-bold text-amber-400">{t.statInterviewsCount}</p>
                <p className="text-xs text-slate-400 mt-1">{t.statInterviewsLabel}</p>
              </div>
              <div className="border-r border-[#243352] pr-2">
                <p className="text-2xl font-bold text-white">{t.statBilingualTitle}</p>
                <p className="text-xs text-slate-400 mt-1">{t.statBilingualSubtitle}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-400">{t.statTransparencyCount}</p>
                <p className="text-xs text-slate-400 mt-1">{t.statTransparencyLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Unified Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 overflow-y-auto bg-background relative">
        <div className="w-full max-w-md space-y-6 animate-fade-in pt-12 lg:pt-0">
          <div className="space-y-1.5">
            <h2 className="text-3xl font-black text-foreground tracking-tight">
              {isLoggedIn ? t.welcomeBack : t.loginTitle}
            </h2>
            <p className="text-foreground-muted text-sm font-medium">
              {isLoggedIn ? `${t.loggedInAs}${u.name}` : t.loginSubtitle}
            </p>
          </div>

          {/* Role Switcher */}
          {!isLoggedIn && (
            <div className="flex p-1 bg-surface-raised border border-border rounded-xl">
              <button 
                type="button"
                onClick={() => setRole("candidate")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${!isRecruiter ? 'bg-primary text-white shadow-sm' : 'text-foreground-muted hover:text-foreground'}`}
              >
                <UserIcon size={16} />
                {t.candidateRole}
              </button>
              <button 
                type="button"
                onClick={() => setRole("recruiter")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${isRecruiter ? 'bg-primary text-white shadow-sm' : 'text-foreground-muted hover:text-foreground'}`}
              >
                <Briefcase size={16} />
                {t.recruiterRole}
              </button>
            </div>
          )}

          <div className="bg-surface p-8 rounded-2xl shadow-sm border border-border space-y-6">
            {isLoggedIn ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-3 py-2">
                   <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white bg-primary">
                      {u.name.charAt(0).toUpperCase()}
                   </div>
                   <div className="text-center">
                      <p className="font-bold text-lg text-foreground">{u.name}</p>
                      <p className="text-foreground-muted text-sm">{u.email}</p>
                      <span className="mt-2 inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-accent-subtle text-accent-subtle-foreground">
                        {u.role}
                      </span>
                   </div>
                </div>
                <button
                  onClick={() => router.push(u.role === 'admin' || u.role === 'recruiter' ? '/recruiter' : '/candidate')}
                  className="w-full py-3.5 rounded-xl font-semibold text-base text-white bg-primary hover:bg-[#131F37] shadow-sm transition-colors"
                >
                  {t.continueDashboard}
                </button>
                <button
                  onClick={() => logout()}
                  className="w-full py-2.5 text-foreground-muted font-medium text-sm hover:text-foreground transition-colors"
                >
                  {t.signOut}
                </button>
              </div>
            ) : (
              <>
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
                        className="w-full pl-10 pr-3.5 py-2.5 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl transition-colors outline-none text-foreground text-sm font-medium"
                        placeholder={t.emailPlaceholder}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                        {t.passwordLabel}
                      </label>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl transition-colors outline-none text-foreground text-sm font-medium"
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
                  href={`/register?role=${role}`}
                  className="w-full flex items-center justify-center py-2.5 bg-surface-raised hover:bg-border/60 text-foreground border border-border rounded-xl font-semibold text-sm transition-colors"
                >
                  {t.createAccountButton}
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-foreground-muted">
            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
            <span>{t.secureBadge}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
