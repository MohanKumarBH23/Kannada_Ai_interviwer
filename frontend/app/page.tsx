"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { startInterview } from "@/lib/api";
import { Sparkles, Briefcase, GraduationCap, FileText, LogIn, LogOut, User as UserIcon, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ProfileSection from "@/components/ProfileSection";
import AtsSection from "@/components/AtsSection";
import SimpleResumeBuilder from "@/components/SimpleResumeBuilder";
import SimpleResumePreview from "@/components/SimpleResumePreview";
import { Layout } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { user, logout, token, loading: authLoading } = useAuth();
  const [jobRole, setJobRole] = useState("ಸಾಫ್ಟ್‌ವೇರ್ ಇಂಜಿನಿಯರ್ (Software Engineer)");
  const [difficulty, setDifficulty] = useState("medium");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"interview" | "profile" | "ats" | "resume">("interview");
  const [isEditingResume, setIsEditingResume] = useState(false);

  const jobCategories = [
    {
      name: "ತಾಂತ್ರಿಕ ಮತ್ತು ಕಚೇರಿ (Technical & Office)",
      roles: [
        "ಸಾಫ್ಟ್‌ವೇರ್ ಇಂಜಿನಿಯರ್ (Software Engineer)",
        "ಡೇಟಾ ಎಂಟ್ರಿ ಆಪರೇಟರ್ (Data Entry Operator)",
        "ಗ್ರಾಫಿಕ್ ಡಿಸೈನರ್ (Graphic Designer)",
        "ಅಕೌಂಟೆಂಟ್ (Accountant)",
        "ರಿಸೆಪ್ಷನಿಸ್ಟ್ (Receptionist)",
      ]
    },
    {
      name: "ಬ್ಲೂ ಕಾಲರ್ ಮತ್ತು ಕುಶಲ ಕೆಲಸ (Blue Collar & Skilled)",
      roles: [
        "ಚಾಲಕ (Driver)",
        "ಎಲೆಕ್ಟ್ರಿಷಿಯನ್ (Electrician)",
        "ಪ್ಲಂಬರ್ (Plumber)",
        "ಮೆಕ್ಯಾನಿಕ್ (Mechanic)",
        "ಬಡಗಿ (Carpenter)",
        "ಪೇಂಟರ್ (Painter)",
        "ಟೈಲರ್ (Tailor)",
        "ಸೆಕ್ಯುರಿಟಿ ಗಾರ್ಡ್ (Security Guard)",
      ]
    },
    {
      name: "ಸೇವೆ ಮತ್ತು ಡೆಲಿವರಿ (Service & Delivery)",
      roles: [
        "ಡೆಲಿವರಿ ಬಾಯ್ (Delivery Boy)",
        "ಅಡುಗೆಯವರು (Cook/Chef)",
        "ಹೌಸ್ ಕೀಪಿಂಗ್ (Housekeeping)",
        "ವೇಟರ್ (Waiter)",
        "ಸೇಲ್ಸ್ ಎಕ್ಸಿಕ್ಯೂಟಿವ್ (Sales Executive)",
        "ಕಸ್ಟಮರ್ ಸಪೋರ್ಟ್ (Customer Support)",
      ]
    },
    {
      name: "ಇತರೆ (Others)",
      roles: [
        "ಶಿಕ್ಷಕರು (Teacher)",
        "ಮ್ಯಾನೇಜರ್ (Manager)",
      ]
    }
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      const params = window.location.search;
      router.push(`/login${params}`);
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const candidateId = params.get('candidate_id');
    const jobIdParam = params.get('job_id');

    if (candidateId && jobIdParam && token && !loading) {
      // Auto-start interview for invited candidate
      autoStartInterview(candidateId, jobIdParam);
    }
  }, [token]);

  const autoStartInterview = async (candidateId: string, jobIdParam: string) => {
    setLoading(true);
    try {
      // We can use a default role, the backend will fetch the real title using jobIdParam
      const session = await startInterview("Job Applicant", "medium", null, token || undefined, jobIdParam, candidateId);
      router.push(`/interview/${session._id || session.id}?candidate_id=${candidateId}&job_id=${jobIdParam}`);
    } catch (err) {
      setError("Failed to auto-start interview.");
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amazon-green"></div>
      </div>
    );
  }

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const session = await startInterview(jobRole, difficulty, resumeFile, token || undefined);
      router.push(`/interview/${session._id || session.id}`);
    } catch (err) {
      setError("ಸಂದರ್ಶನ ಪ್ರಾರಂಭಿಸಲು ವಿಫಲವಾಗಿದೆ (Failed to start interview). ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.");
      setLoading(false);
    }
  };

  const handlePractice = async () => {
    setLoading(true);
    try {
      const session = await startInterview("ಸಾಮಾನ್ಯ ಅಭ್ಯಾಸ (General Practice)", "medium", null, token || undefined, undefined, undefined, true);
      router.push(`/interview/${session._id || session.id}`);
    } catch (err) {
      setError("ಅಭ್ಯಾಸ ಮೋಡ್ ಪ್ರಾರಂಭಿಸಲು ವಿಫಲವಾಗಿದೆ (Failed to start practice mode).");
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSection />;
      case "ats":
        return <AtsSection onNavigate={(tab) => setActiveTab(tab)} />;
      case "resume":
        return (
          <div className="space-y-8 animate-fade-in">
            {user.experience && !isEditingResume ? (
              <SimpleResumePreview onEdit={() => setIsEditingResume(true)} />
            ) : (
              <div className="space-y-6">
                <SimpleResumeBuilder onComplete={() => setIsEditingResume(false)} />
                {user.experience && (
                  <button 
                    onClick={() => setIsEditingResume(false)}
                    className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                  >
                    ರದ್ದುಗೊಳಿಸಿ (Cancel)
                  </button>
                )}
              </div>
            )}
          </div>
        );
      case "interview":
      default:
        return (
          <div className="bg-white rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.08)] p-10 border border-slate-50 transition-all">
            <div className="text-center space-y-6 mb-10">
              <div className="inline-flex items-center justify-center p-4 bg-teal-50 rounded-[1.5rem] mb-2 shadow-inner border border-teal-100">
                <Sparkles className="w-10 h-10 text-teal-600 drop-shadow-[0_0_8px_rgba(13,148,136,0.2)]" />
              </div>
              <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">
                ಕನ್ನಡ AI ಸಂದರ್ಶನ
              </h1>
              <p className="text-slate-500 font-medium text-lg">
                ಹೊಸ ಸಂದರ್ಶನವನ್ನು ಪ್ರಾರಂಭಿಸಿ (Start a new interview)
              </p>
            </div>
            <form onSubmit={handleStart} className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-teal-600" />
                  ಉದ್ಯೋಗದ ಪಾತ್ರ (Job Role)
                </label>
                <div className="relative group">
                  <select
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:ring-4 focus:ring-teal-600/5 focus:border-teal-600 transition-all outline-none appearance-none cursor-pointer shadow-sm"
                    required
                  >
                    <option value="" disabled>ಯಾವುದಾದರೊಂದು ಉದ್ಯೋಗವನ್ನು ಆರಿಸಿ (Select a role)</option>
                    {jobCategories.map((cat) => (
                      <optgroup key={cat.name} label={cat.name} className="font-bold text-teal-600">
                        {cat.roles.map((role) => (
                          <option key={role} value={role} className="text-slate-900 font-normal">
                            {role}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-teal-600" />
                  ಕಷ್ಟದ ಮಟ್ಟ (Difficulty)
                </label>
                <div className="relative group">
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:ring-4 focus:ring-teal-600/5 focus:border-teal-600 transition-all outline-none appearance-none cursor-pointer shadow-sm"
                  >
                    <option value="easy">ಸುಲಭ (Easy)</option>
                    <option value="medium">ಮಧ್ಯಮ (Medium)</option>
                    <option value="hard">ಕಷ್ಟ (Hard)</option>
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600" />
                  ರೆಸ್ಯೂಮ್ (Resume - Optional PDF)
                </label>
                <div className="relative group">
                  <input
                    type="file"
                    accept=".pdf"
                    ref={fileInputRef}
                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:ring-4 focus:ring-teal-600/5 focus:border-teal-600 transition-all outline-none file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 transition-colors cursor-pointer shadow-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-800/50">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full relative py-5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-2xl font-bold shadow-xl shadow-teal-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-3 text-xl overflow-hidden group"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                {loading ? (
                  <span className="animate-pulse flex items-center gap-2">ಲೋಡ್ ಆಗುತ್ತಿದೆ... <Sparkles className="w-5 h-5 animate-spin" /></span>
                ) : (
                  <>
                    <span>ಸಂದರ್ಶನ ಪ್ರಾರಂಭಿಸಿ</span>
                    <Sparkles className="w-6 h-6" />
                  </>
                )}
              </button>
            </form>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-6 sm:p-12 lg:p-20">
      <div className="max-w-[1440px] w-full flex flex-col md:flex-row gap-10 justify-center items-start animate-fade-in">
        {/* Left Sidebar */}
        <div className="w-full md:w-[300px] flex-shrink-0 flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col items-center gap-4 transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500/10 to-emerald-500/10 flex items-center justify-center text-teal-600 font-bold text-3xl shadow-inner border border-teal-500/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-900 text-lg truncate max-w-[220px]">{user.name}</p>
              <p className="text-xs text-slate-500 truncate max-w-[220px]">{user.email}</p>
            </div>
            <button
              onClick={logout}
              className="mt-2 flex items-center gap-2 px-6 py-3 text-xs font-semibold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 rounded-xl transition-all shadow-lg shadow-teal-600/20 hover:scale-[1.02] active:scale-[0.98] w-full justify-center"
            >
              <LogOut className="w-4 h-4" />
              ಲಾಗ್ ಔಟ್ (Logout)
            </button>
          </div>

          <nav className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 p-3 flex flex-col gap-2">
            <button
              onClick={() => setActiveTab("interview")}
              className={`flex items-center gap-3 px-5 py-4 rounded-xl font-semibold transition-all ${
                activeTab === "interview"
                  ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-600/20"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              ಹೊಸ ಸಂದರ್ಶನ
            </button>
            
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-3 px-5 py-4 rounded-xl font-semibold transition-all ${
                activeTab === "profile"
                  ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-600/20"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <UserIcon className="w-5 h-5" />
              ಪ್ರೊಫೈಲ್
            </button>

            <button
              onClick={() => setActiveTab("ats")}
              className={`flex items-center gap-3 px-5 py-4 rounded-xl font-semibold transition-all ${
                activeTab === "ats"
                  ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-600/20"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <FileText className="w-5 h-5" />
              ATS ಸ್ಕೋರ್
            </button>

            <button
              onClick={() => setActiveTab("resume")}
              className={`flex items-center gap-3 px-5 py-4 rounded-xl font-semibold transition-all ${
                activeTab === "resume"
                  ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-600/20"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Layout className="w-5 h-5" />
              ಸರಳ ರೆಸ್ಯೂಮ್
            </button>

            <button
              onClick={handlePractice}
              className="flex items-center gap-3 px-5 py-4 rounded-xl font-semibold transition-all text-emerald-600 hover:bg-emerald-50 border border-emerald-100 mt-4 shadow-sm"
            >
              <Sparkles className="w-5 h-5" />
              ಅಭ್ಯಾಸ ಮೋಡ್ (Practice)
            </button>

            {user.role === "admin" && (
              <Link
                href="/hiring"
                className="flex items-center gap-3 px-5 py-4 rounded-xl font-semibold transition-all text-slate-600 hover:bg-slate-50 border-t border-slate-50 mt-2"
              >
                <Briefcase className="w-5 h-5 text-teal-600" />
                ನೇಮಕಾತಿ (Hiring)
              </Link>
            )}
          </nav>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 w-full">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
