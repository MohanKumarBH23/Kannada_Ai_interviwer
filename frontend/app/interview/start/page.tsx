"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { startInterview } from "@/lib/api";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";

function InterviewStartContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token, loading: authLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const candidateId = searchParams.get("candidate_id");
    const jobId = searchParams.get("job_id");

    // If it's a candidate interview, we allow starting even without a user account
    if (candidateId && jobId) {
      handleAutoStart();
      return;
    }

    if (!authLoading && !user) {
      // Redirect to login but keep the current URL as a return point
      const currentParams = searchParams.toString();
      const currentPath = window.location.pathname;
      router.push(`/login?redirectTo=${encodeURIComponent(currentPath + '?' + currentParams)}&${currentParams}`);
      return;
    }

    if (user && token) {
      handleAutoStart();
    }
  }, [user, token, authLoading, searchParams]);

  const handleAutoStart = async () => {
    const candidateId = searchParams.get("candidate_id");
    const jobId = searchParams.get("job_id");

    if (!candidateId || !jobId) {
      setError("Invalid interview link. Missing parameters.");
      return;
    }

    try {
      console.log("Auto-starting interview for:", { candidateId, jobId });
      // The backend will fetch the real job title using jobId
      const session = await startInterview(
        "Job Applicant", 
        "medium", 
        null, 
        token || undefined, 
        jobId, 
        candidateId
      );
      
      router.push(`/interview/${session._id || session.id}`);
    } catch (err: any) {
      console.error("Failed to start interview:", err);
      setError("ಸಂದರ್ಶನ ಪ್ರಾರಂಭಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ. (Failed to start interview. Please try again.)");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 text-center space-y-8 animate-fade-in">
        {error ? (
          <>
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto text-red-500">
              <AlertCircle size={40} />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900">ದೋಷ (Error)</h1>
              <p className="text-slate-500 font-medium">{error}</p>
            </div>
            <button 
              onClick={() => router.push("/")}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
            >
              Back to Home
            </button>
          </>
        ) : (
          <>
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 bg-teal-500/20 rounded-[2rem] animate-pulse"></div>
              <div className="absolute inset-4 bg-white rounded-2xl shadow-inner flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-teal-600 animate-bounce" />
              </div>
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">ಸಿದ್ಧರಾಗುತ್ತಿದ್ದೇವೆ...</h1>
              <p className="text-slate-500 font-medium">ನಿಮ್ಮ ಸಂದರ್ಶನವನ್ನು ಸಿದ್ಧಪಡಿಸುತ್ತಿದ್ದೇವೆ (Preparing your interview session)</p>
            </div>
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function InterviewStartPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 text-center space-y-8 animate-fade-in animate-pulse">
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          </div>
        </div>
      </div>
    }>
      <InterviewStartContent />
    </Suspense>
  );
}
