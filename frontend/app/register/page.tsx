"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Mail, Lock, User, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  // Determine role from query params
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
        // Role-based default redirection
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
    <div className="min-h-screen flex items-center justify-center py-12 px-6 bg-slate-50">
      <div className="w-full max-w-md p-10 rounded-[2.5rem] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100">
        <div className="text-center mb-10">
          <div className={`w-20 h-20 ${isRecruiter ? 'bg-blue-50 text-blue-600' : 'bg-teal-50 text-teal-600'} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner`}>
            <UserPlus className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            {isRecruiter ? 'ನೇಮಕಾತಿದಾರರ ನೋಂದಣಿ' : 'ಹೊಸ ಖಾತೆ ರಚಿಸಿ'}
          </h1>
          <p className="text-slate-500 mt-3 font-medium">
            {isRecruiter ? 'Start hiring with AI power.' : 'Create your candidate profile.'}
          </p>
          <div className={`mt-4 inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isRecruiter ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'}`}>
            Registering as {role}
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100 animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">
              ಹೆಸರು (Name)
            </label>
            <div className="relative group">
              <User className={`w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 ${isRecruiter ? 'text-blue-400 group-focus-within:text-blue-600' : 'text-teal-400 group-focus-within:text-teal-600'} transition-colors`} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-100 outline-none text-slate-900 transition-all shadow-sm"
                placeholder="ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">
              ಇಮೇಲ್ (Email)
            </label>
            <div className="relative group">
              <Mail className={`w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 ${isRecruiter ? 'text-blue-400 group-focus-within:text-blue-600' : 'text-teal-400 group-focus-within:text-teal-600'} transition-colors`} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-100 outline-none text-slate-900 transition-all shadow-sm"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">
              ಪಾಸ್ವರ್ಡ್ (Password)
            </label>
            <div className="relative group">
              <Lock className={`w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 ${isRecruiter ? 'text-blue-400 group-focus-within:text-blue-600' : 'text-teal-400 group-focus-within:text-teal-600'} transition-colors`} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-100 outline-none text-slate-900 transition-all shadow-sm"
                placeholder="ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳು"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-5 mt-4 ${isRecruiter ? 'bg-blue-600 hover:bg-blue-700' : 'bg-teal-600 hover:bg-teal-700'} text-white rounded-2xl font-bold shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98]`}
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "ನೋಂದಾಯಿಸಿ (Register Now)"}
          </button>
        </form>

        <p className="mt-10 text-center text-sm font-medium text-slate-400">
          ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?{" "}
          <Link href={`/${typeof window !== 'undefined' ? window.location.search : ''}`} className={`font-black ${isRecruiter ? 'text-blue-600' : 'text-teal-600'} hover:underline`}>
            ಲಾಗಿನ್ ಆಗಿ (Login here)
          </Link>
        </p>
      </div>
    </div>
  );
}
