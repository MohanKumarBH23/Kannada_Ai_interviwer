"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, ArrowRight, Sparkles, User as UserIcon, Briefcase } from "lucide-react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<"candidate" | "recruiter">("candidate");
  const { login, user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === "admin" || user.role === "recruiter") {
        router.push("/recruiter");
      } else {
        router.push("/candidate");
      }
    }
  }, [user, authLoading, router]);

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const isLoggedIn = !!user;
  const u = user as any;
  const effectiveRole = isLoggedIn ? (u.role === 'admin' || u.role === 'recruiter' ? 'recruiter' : 'candidate') : role;
  const isRecruiter = effectiveRole === 'recruiter';

  return (
    <div className="min-h-screen w-full flex fixed inset-0 bg-slate-50 overflow-hidden">
      {/* Left side - Dynamic Branding */}
      <div className={`hidden lg:flex lg:w-1/2 relative bg-gradient-to-br ${isRecruiter ? 'from-blue-900 via-indigo-900 to-blue-900' : 'from-[#0f172a] via-[#134e4a] to-[#0f172a]'} overflow-hidden transition-colors duration-700`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(20,184,166,0.1),transparent)]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>

        <div className="relative z-10 flex flex-col justify-end p-20 h-full text-white w-full">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium mb-6 shadow-xl">
              <Sparkles className={`w-4 h-4 ${isRecruiter ? 'text-blue-400' : 'text-teal-400'} drop-shadow-[0_0_8px_rgba(45,212,191,0.8)]`} />
              <span className="text-slate-200">AI Powered Platform</span>
            </div>
            <h1 className="text-7xl font-black leading-[1] mb-8 text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tighter">
              {isRecruiter ? <>ನೇಮಕಾತಿದಾರರ<br />ವೇದಿಕೆ</> : <>ಕನ್ನಡ AI<br />ಸಂದರ್ಶನ</>}
            </h1>
            <p className="text-2xl text-slate-300 max-w-lg font-light leading-relaxed mb-12">
              {isRecruiter ? 'Simplify your hiring process with India\'s first Kannada AI screening platform.' : 'Prepare and excel in your job interviews with our intelligent AI coach.'}
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg p-8 rounded-[2rem] w-full max-w-lg border border-white/10 shadow-2xl animate-fade-in">
            <div className="flex items-center gap-6 text-slate-300">
              <div className="flex -space-x-4">
                <div className="w-12 h-12 rounded-full border-2 border-slate-800 bg-teal-500/20 flex items-center justify-center text-xl">🧑‍💻</div>
                <div className="w-12 h-12 rounded-full border-2 border-slate-800 bg-blue-500/20 flex items-center justify-center text-xl">👩‍💼</div>
                <div className="w-12 h-12 rounded-full border-2 border-slate-800 bg-indigo-500/20 flex items-center justify-center text-xl">👨‍🔬</div>
              </div>
              <p className="text-lg font-medium">{isRecruiter ? 'Automate screening and save time.' : 'Over 10,000 interviews conducted.'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Unified Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 overflow-y-auto bg-slate-50/50 relative">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="text-center space-y-2">
            <h2 className="text-5xl font-black text-slate-900 tracking-tight">{isLoggedIn ? 'Welcome Back' : 'Login'}</h2>
            <p className="text-slate-500 text-lg font-medium">
              {isLoggedIn ? `Logged in as ${u.name}` : 'Welcome back! Please login to your account.'}
            </p>
          </div>

          {/* Role Switcher (Hidden if logged in to avoid confusion) */}
          {!isLoggedIn && (
            <div className="flex p-1.5 bg-slate-100 rounded-2xl shadow-inner mb-8">
              <button 
                onClick={() => setRole("candidate")}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all ${!isRecruiter ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <UserIcon size={18} />
                Candidate
              </button>
              <button 
                onClick={() => setRole("recruiter")}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all ${isRecruiter ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Briefcase size={18} />
                Recruiter
              </button>
            </div>
          )}

          <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.06)] border border-slate-100 space-y-8">
            {isLoggedIn ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-4 py-4">
                   <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white ${u.role === 'admin' || u.role === 'recruiter' ? 'bg-blue-600' : 'bg-teal-600'}`}>
                      {u.name.charAt(0).toUpperCase()}
                   </div>
                   <div className="text-center">
                      <p className="font-bold text-xl text-slate-900">{u.name}</p>
                      <p className="text-slate-500">{u.email}</p>
                      <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${u.role === 'admin' || u.role === 'recruiter' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'}`}>
                        {u.role}
                      </span>
                   </div>
                </div>
                <button
                  onClick={() => router.push(u.role === 'admin' || u.role === 'recruiter' ? '/recruiter' : '/candidate')}
                  className={`w-full py-5 rounded-2xl font-bold text-lg text-white shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] ${u.role === 'admin' || u.role === 'recruiter' ? 'bg-blue-600 shadow-blue-500/20' : 'bg-teal-600 shadow-teal-500/20'}`}
                >
                  Continue to Dashboard
                </button>
                <button
                  onClick={() => logout()}
                  className="w-full py-4 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
                >
                  Sign Out and Use Another Account
                </button>
              </div>
            ) : (
              <>
                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100 flex items-start gap-3 animate-shake">
                    <div className="p-1 bg-red-100 rounded-full mt-0.5"><Lock className="w-3 h-3 text-red-600" /></div>
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2 group">
                    <label className="text-sm font-bold text-slate-700 ml-1">
                      ಇಮೇಲ್ (Email)
                    </label>
                    <div className="relative">
                      <Mail className={`w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:${isRecruiter ? 'text-blue-600' : 'text-teal-600'} transition-colors`} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 rounded-2xl transition-all outline-none text-slate-900 font-medium"
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 group">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-sm font-bold text-slate-700">
                        ಪಾಸ್ವರ್ಡ್ (Password)
                      </label>
                      <a href="#" className={`text-xs font-bold ${isRecruiter ? 'text-blue-600' : 'text-teal-600'} hover:underline`}>Forgot?</a>
                    </div>
                    <div className="relative">
                      <Lock className={`w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:${isRecruiter ? 'text-blue-600' : 'text-teal-600'} transition-colors`} />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 rounded-2xl transition-all outline-none text-slate-900 font-medium"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full relative py-5 ${isRecruiter ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25' : 'bg-teal-600 hover:bg-teal-700 shadow-teal-500/25'} text-white rounded-2xl font-bold text-lg shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 overflow-hidden group`}
                  >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <span>ಲಾಗಿನ್ (Login)</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                <div className="relative flex items-center py-4">
                  <div className="flex-grow border-t border-slate-100"></div>
                  <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase tracking-widest">Or</span>
                  <div className="flex-grow border-t border-slate-100"></div>
                </div>

                <Link
                  href={`/register?role=${role}`}
                  className="w-full flex items-center justify-center py-5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl font-bold transition-all"
                >
                  ಹೊಸ ಖಾತೆ ರಚಿಸಿ (Create Account)
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
