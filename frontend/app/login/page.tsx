"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Mail, Lock, Loader2, ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

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
        throw new Error(errorData.detail || "Login failed");
      }

      const data = await res.json();

      const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/me`, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });

      if (!userRes.ok) throw new Error("Failed to fetch user data");

      const userData = await userRes.json();
      login(data.access_token, userData);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex fixed inset-0 bg-slate-50">
      {/* Left side - Illustration & Value Prop */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#0f172a] via-[#134e4a] to-[#0f172a] overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(20,184,166,0.1),transparent)]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>

        <div className="relative z-10 flex flex-col justify-end p-16 h-full text-white">
          <div className="animate-float mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium mb-6 shadow-xl">
              <Sparkles className="w-4 h-4 text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.8)]" />
              <span className="text-slate-200">AI Powered Platform</span>
            </div>
            <h1 className="text-6xl font-black leading-[1.1] mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tighter">
              ಕನ್ನಡ AI<br />ಸಂದರ್ಶನ ವ್ಯವಸ್ಥೆ
            </h1>
            <p className="text-xl text-slate-300 max-w-md font-light leading-relaxed">
              Experience the next generation of automated interviews in Kannada.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl w-full max-w-lg border border-white/10 shadow-2xl">
            <div className="flex items-center gap-4 text-slate-300">
              <div className="flex -space-x-4">
                <div className="w-10 h-10 rounded-full border-2 border-slate-800 bg-teal-500/20 flex items-center justify-center">🧑‍💻</div>
                <div className="w-10 h-10 rounded-full border-2 border-slate-800 bg-blue-500/20 flex items-center justify-center">👩‍💼</div>
                <div className="w-10 h-10 rounded-full border-2 border-slate-800 bg-indigo-500/20 flex items-center justify-center">👨‍🔬</div>
              </div>
              <p className="text-sm">Join thousands of candidates practicing their interviews.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 overflow-y-auto bg-slate-50/50 relative">
        <div className="w-full max-w-md p-8 sm:p-12 bg-white rounded-[2rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] border border-slate-100 space-y-10 animate-fade-in">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Welcome</h2>
            <p className="text-slate-500 mt-3 text-lg">ದಯವಿಟ್ಟು ನಿಮ್ಮ ಖಾತೆಗೆ ಲಾಗಿನ್ ಆಗಿ.</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50/80 backdrop-blur-sm text-red-600 rounded-2xl text-sm font-medium border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="p-1 bg-red-100 rounded-full mt-0.5"><Lock className="w-3 h-3 text-red-600" /></div>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 relative group">
              <label className="text-sm font-medium text-slate-700 ml-1">
                ಇಮೇಲ್ (Email)
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-white border border-[#E2E8F0] focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 rounded-2xl transition-all outline-none text-slate-900 shadow-sm"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2 relative group">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-medium text-slate-700">
                  ಪಾಸ್ವರ್ಡ್ (Password)
                </label>
                <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-white border border-[#E2E8F0] focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 rounded-2xl transition-all outline-none text-slate-900 shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full group relative py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-semibold shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>ಲಾಗಿನ್ (Login)</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative flex items-center py-6">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-sm bg-transparent px-2">ಅಥವಾ (Or)</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <Link
            href="/register"
            className="w-full flex items-center justify-center py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm rounded-2xl font-medium transition-all"
          >
            ಹೊಸ ಖಾತೆ ರಚಿಸಿ (Create account)
          </Link>
        </div>
      </div>
    </div>
  );
}

