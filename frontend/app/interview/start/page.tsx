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

    if (candidateId && jobId) {
      handleAutoStart();
      return;
    }

    if (!authLoading && !user) {
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
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-surface rounded-2xl shadow-sm p-8 border border-border text-center space-y-6 animate-fade-in">
        {error ? (
          <>
            <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mx-auto text-red-600 border border-red-200">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-xl font-bold text-foreground">ದೋಷ (Error)</h1>
              <p className="text-foreground-muted text-xs font-medium">{error}</p>
            </div>
            <button 
              onClick={() => router.push("/")}
              className="w-full py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-[#131F37] transition-colors"
            >
              ಮುಖ್ಯಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ (Back to Home)
            </button>
          </>
        ) : (
          <>
            <div className="w-14 h-14 bg-accent-subtle rounded-2xl flex items-center justify-center mx-auto border border-amber-200/50">
              <Sparkles className="w-7 h-7 text-accent" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-foreground tracking-tight">ಸಿದ್ಧರಾಗುತ್ತಿದ್ದೇವೆ...</h1>
              <p className="text-foreground-muted text-xs">ನಿಮ್ಮ AI ಸಂದರ್ಶನವನ್ನು ಸಿದ್ಧಪಡಿಸುತ್ತಿದ್ದೇವೆ (Preparing interview session)</p>
            </div>
            <div className="flex justify-center pt-2">
              <Loader2 className="w-6 h-6 text-accent animate-spin" />
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    }>
      <InterviewStartContent />
    </Suspense>
  );
}
