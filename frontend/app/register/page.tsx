"use client";

import { useState } from "react";
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
        body: JSON.stringify({ name, email, password }),
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
      login(data.access_token, userData);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10">
      <div className="w-full max-w-md p-8 rounded-3xl bg-white shadow-2xl border border-amazon-green/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amazon-light rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-amazon-green" />
          </div>
          <h1 className="text-3xl font-bold text-amazon-dark">ಹೊಸ ಖಾತೆ (Register)</h1>
          <p className="text-amazon-green mt-2">ನಿಮ್ಮ ಹೊಸ ಪ್ರೊಫೈಲ್ ರಚಿಸಿ.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-100 dark:border-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-amazon-dark">
              ಹೆಸರು (Name)
            </label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-amazon-green/50" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-white border border-amazon-green/30 rounded-xl focus:ring-2 focus:ring-amazon-green focus:border-amazon-green transition-all outline-none text-amazon-dark"
                placeholder="ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-amazon-dark">
              ಇಮೇಲ್ (Email)
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-amazon-green/50" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-white border border-amazon-green/30 rounded-xl focus:ring-2 focus:ring-amazon-green focus:border-amazon-green transition-all outline-none text-amazon-dark"
                placeholder="ನಿಮ್ಮ ಇಮೇಲ್ ನಮೂದಿಸಿ"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-amazon-dark">
              ಪಾಸ್ವರ್ಡ್ (Password)
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-amazon-green/50" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 bg-white border border-amazon-green/30 rounded-xl focus:ring-2 focus:ring-amazon-green focus:border-amazon-green transition-all outline-none text-amazon-dark"
                placeholder="ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳು"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 mt-2 bg-amazon-green hover:bg-amazon-dark text-white rounded-xl font-bold shadow-lg shadow-amazon-green/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "ಖಾತೆ ರಚಿಸಿ (Register)"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-amazon-dark opacity-60">
          ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?{" "}
          <Link href="/login" className="font-bold text-amazon-green hover:underline">
            ಲಾಗಿನ್ ಆಗಿ (Login here)
          </Link>
        </p>
      </div>
    </div>
  );
}
