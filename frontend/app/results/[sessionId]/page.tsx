"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getInterviewSession, getInterviewReport } from "@/lib/api";
import { Trophy, Home, Loader2, Star, Download, TrendingUp, TrendingDown, Minus, Shield, Award, AlertTriangle, CheckCircle, CheckCircle2, BarChart3, FileText, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface QABreakdown {
  question_num: number;
  rating: "strong" | "average" | "weak";
  note: string;
}

interface ReportData {
  session_id: string;
  job_role: string;
  score: number;
  overall_feedback: string;
  created_at: string;
  candidate_name: string;
  confidence_score: number;
  confidence_analysis: string;
  strengths: string;
  improvements: string;
  qa_breakdown: QABreakdown[];
  recommendation: string;
}

export default function ResultsPage({ params }: { params: { sessionId: string } }) {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const [session, setSession] = useState<any>(null);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  const [showReport, setShowReport] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Removed mandatory login check to allow guest candidate access

  useEffect(() => {
    const fetchSession = async () => {
    // We allow fetching even without a token for guest candidate access
      try {
        const data = await getInterviewSession(params.sessionId, token || "");
        setSession(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [params.sessionId, token]);

  const handleGenerateReport = useCallback(async () => {
    if (!token) return;
    setReportLoading(true);
    setReportError("");
    try {
      const data = await getInterviewReport(params.sessionId, token);
      setReport(data);
      setShowReport(true);
    } catch (err: any) {
      setReportError(err.message || "Failed to generate report");
    } finally {
      setReportLoading(false);
    }
  }, [params.sessionId, token]);

  useEffect(() => {
    if (session?.is_practice && !report && !reportLoading && token) {
      handleGenerateReport();
    }
  }, [session, report, reportLoading, token, handleGenerateReport]);

  const handlePrint = () => {
    window.print();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
          <p className="text-slate-500 font-medium">ಲೋಡ್ ಆಗುತ್ತಿದೆ...</p>
        </div>
      </div>
    );
  }

  // Check if results are hidden
  // Logic: 
  // 1. If it's a practice interview, allow the user to see it.
  // 2. If it's a hiring interview (linked to a candidate_id), only admins can see it.
  // 3. Otherwise, only admins or the owner can see it.
  const isPractice = session?.is_practice === true;
  const isResultsHidden = !isPractice && ((!user || user.role !== "admin") || (session?.candidate_id && user?.role !== "admin"));

  if (isResultsHidden) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-xl p-12 text-center space-y-8 animate-fade-in">
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 leading-tight">
            ಸಂದರ್ಶನ ಪೂರ್ಣಗೊಂಡಿದೆ!<br />
            (Interview Completed!)
          </h1>
          <p className="text-slate-500 text-lg font-medium leading-relaxed">
            ನಿಮ್ಮ ಸಮಯಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು. ನಿಮ್ಮ ಸಂದರ್ಶನದ ಉತ್ತರಗಳನ್ನು ನಾವು ಸ್ವೀಕರಿಸಿದ್ದೇವೆ. ನಮ್ಮ ನೇಮಕಾತಿ ತಂಡವು ಶೀಘ್ರದಲ್ಲೇ ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸುತ್ತದೆ.<br />
            <span className="text-sm opacity-70">Thank you for your time. We have received your interview responses. Our hiring team will contact you shortly.</span>
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-10 py-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-teal-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Dashboard ಗೆ ಹಿಂತಿರುಗಿ (Back to Dashboard)
          </button>
        </div>
      </div>
    );
  }

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-teal-600";
    if (score >= 60) return "text-amber-500";
    return "text-rose-500";
  };
  const scoreBg = (score: number) => {
    if (score >= 80) return "bg-teal-50 border-teal-200";
    if (score >= 60) return "bg-amber-50 border-amber-200";
    return "bg-rose-50 border-rose-200";
  };
  const ratingIcon = (rating: string) => {
    if (rating === "strong") return <TrendingUp className="w-4 h-4 text-teal-500" />;
    if (rating === "weak") return <TrendingDown className="w-4 h-4 text-rose-500" />;
    return <Minus className="w-4 h-4 text-amber-500" />;
  };
  const ratingBadge = (rating: string) => {
    if (rating === "strong") return "bg-teal-50 text-teal-700 border-teal-200";
    if (rating === "weak") return "bg-rose-50 text-rose-700 border-rose-200";
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  const confidenceLabel = (score: number) => {
    if (score >= 80) return "High Confidence";
    if (score >= 60) return "Moderate Confidence";
    if (score >= 40) return "Low-Moderate Confidence";
    return "Low Confidence";
  };

  const kannadaPart = (text: string) => text?.split("|||")[0]?.trim() || "";
  const englishPart = (text: string) => text?.split("|||")[1]?.trim() || "";

  const bulletPoints = (text: string) => {
    const lines = text.split("\n").map(l => l.replace(/^[•\-*]\s*/, "").trim()).filter(Boolean);
    return lines;
  };

  return (
    <>
      {/* ===== PRINT STYLES - only visible when printing ===== */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #report-printable, #report-printable * { visibility: visible; }
          #report-printable { position: fixed; top: 0; left: 0; width: 100%; }
          .no-print { display: none !important; }
          @page { margin: 1cm; size: A4; }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/20">
        <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 space-y-8">

          {/* ===== SCORE CARD ===== */}
          <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-slate-100 overflow-hidden animate-fade-in">
            <div className="h-2 w-full bg-gradient-to-r from-teal-500 to-emerald-500" />
            <div className="p-8 sm:p-12">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                {/* Trophy + Score */}
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-3xl flex items-center justify-center border border-teal-100 shadow-inner">
                    <Trophy className="w-12 h-12 text-teal-600" />
                  </div>
                  <div className={`px-8 py-4 rounded-2xl border-2 ${scoreBg(session?.score || 0)} flex items-end gap-2`}>
                    <span className={`text-6xl font-black leading-none ${scoreColor(session?.score || 0)}`}>
                      {session?.score || 0}
                    </span>
                    <span className="text-xl text-slate-400 font-bold mb-1">/ 100</span>
                  </div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Overall Score</p>
                </div>

                {/* Info */}
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-xs font-black text-teal-600 uppercase tracking-widest mb-3">Interview Completed</p>
                  <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-2">
                    ಸಂದರ್ಶನ ಪೂರ್ಣಗೊಂಡಿದೆ!
                  </h1>
                  <p className="text-slate-400 font-medium text-lg mb-6">Great effort, {user?.name || "Candidate"}!</p>
                  <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                    <button
                      onClick={() => router.push("/")}
                      className="no-print flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all"
                    >
                      <Home className="w-4 h-4" />
                      New Interview
                    </button>
                    {!showReport && (
                      <button
                        onClick={handleGenerateReport}
                        disabled={reportLoading}
                        className="no-print flex items-center gap-3 px-7 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold shadow-lg shadow-teal-600/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70"
                      >
                        {reportLoading ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> ರಿಪೋರ್ಟ್ ತಯಾರಾಗುತ್ತಿದೆ...</>
                        ) : (
                          <><Sparkles className="w-4 h-4" /> Generate PDF Report</>
                        )}
                      </button>
                    )}
                    {showReport && (
                      <button
                        onClick={handlePrint}
                        className="no-print flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold shadow-lg shadow-teal-600/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        <Download className="w-4 h-4" />
                        Download PDF
                      </button>
                    )}
                  </div>
                  {reportError && (
                    <p className="mt-3 text-sm text-rose-600 font-medium">{reportError}</p>
                  )}
                </div>
              </div>

              {/* Overall Feedback */}
              <div className="mt-10 pt-10 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest bg-teal-50 px-2 py-0.5 rounded-md">ಕನ್ನಡ</span>
                  <p className="text-slate-700 leading-[1.7] text-sm font-medium">
                    {kannadaPart(session?.feedback || "") || "ಯಾವುದೇ ಪ್ರತಿಕ್ರಿಯೆ ಲಭ್ಯವಿಲ್ಲ."}
                  </p>
                </div>
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest bg-teal-50 px-2 py-0.5 rounded-md">English</span>
                  <p className="text-slate-600 leading-[1.7] text-sm font-medium">
                    {englishPart(session?.feedback || "") || "No feedback available."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ===== DETAILED REPORT ===== */}
          {showReport && report && (
            <div id="report-printable" ref={reportRef} className="space-y-6 animate-fade-in">
              
              {/* Report Header */}
              <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-teal-600/20">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <p className="text-teal-200 text-xs font-black uppercase tracking-widest mb-2">Interview Performance Report</p>
                    <h2 className="text-4xl font-black tracking-tight">{report.candidate_name}</h2>
                    <p className="text-teal-200 mt-1 font-medium">{report.job_role}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-6xl font-black">{report.score}</div>
                    <div className="text-teal-200 text-sm font-bold">/ 100 Overall Score</div>
                    <div className="text-teal-200 text-xs mt-1">
                      {report.created_at ? new Date(report.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' }) : ""}
                    </div>
                  </div>
                </div>
              </div>

              {/* Confidence Analysis */}
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8">
                  <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-8">
                    <BarChart3 className="w-4 h-4 text-teal-500" />
                    Confidence Analysis
                  </h3>
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    {/* Gauge */}
                    <div className="relative flex items-center justify-center flex-shrink-0">
                      <svg className="w-40 h-40 transform -rotate-90">
                        <circle cx="80" cy="80" r="68" className="stroke-current text-slate-100" strokeWidth="14" fill="none" />
                        <circle
                          cx="80" cy="80" r="68"
                          className={`stroke-current transition-all duration-1000 ${
                            report.confidence_score >= 70 ? "text-teal-500" :
                            report.confidence_score >= 45 ? "text-amber-500" : "text-rose-500"
                          }`}
                          strokeWidth="14" fill="none"
                          strokeDasharray="427.26"
                          strokeDashoffset={427.26 - (427.26 * report.confidence_score) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-3xl font-black text-slate-900">{report.confidence_score}%</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Confidence</span>
                      </div>
                    </div>
                    {/* Analysis text */}
                    <div className="flex-1 space-y-4">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black border ${
                        report.confidence_score >= 70 ? "bg-teal-50 text-teal-700 border-teal-200" :
                        report.confidence_score >= 45 ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-rose-50 text-rose-700 border-rose-200"
                      }`}>
                        <Shield className="w-4 h-4" />
                        {confidenceLabel(report.confidence_score)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">ಕನ್ನಡ</span>
                          <p className="text-slate-700 text-sm leading-relaxed font-medium">{kannadaPart(report.confidence_analysis)}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">English</span>
                          <p className="text-slate-600 text-sm leading-relaxed font-medium">{englishPart(report.confidence_analysis)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="bg-white rounded-[2rem] border border-teal-100 shadow-sm p-8">
                  <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-6">
                    <Award className="w-4 h-4 text-teal-500" />
                    Positives & Strengths (ಬಲ ಅಂಶಗಳು)
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">ಕನ್ನಡ</span>
                      <ul className="space-y-2">
                        {bulletPoints(kannadaPart(report.strengths)).map((pt, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-700 text-sm font-medium">
                            <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="h-px bg-slate-100" />
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">English</span>
                      <ul className="space-y-2">
                        {bulletPoints(englishPart(report.strengths)).map((pt, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-600 text-sm font-medium">
                            <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Improvements */}
                <div className="bg-white rounded-[2rem] border border-amber-100 shadow-sm p-8">
                  <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-6">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Negatives & Improvements (ಸುಧಾರಣೆ ಅಂಶಗಳು)
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">ಕನ್ನಡ</span>
                      <ul className="space-y-2">
                        {bulletPoints(kannadaPart(report.improvements)).map((pt, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-700 text-sm font-medium">
                            <TrendingUp className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="h-px bg-slate-100" />
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">English</span>
                      <ul className="space-y-2">
                        {bulletPoints(englishPart(report.improvements)).map((pt, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-600 text-sm font-medium">
                            <TrendingUp className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Q&A Breakdown */}
              {report.qa_breakdown && report.qa_breakdown.length > 0 && (
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
                  <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-6">
                    <FileText className="w-4 h-4 text-teal-500" />
                    Question-by-Question Breakdown
                  </h3>
                  <div className="space-y-3">
                    {report.qa_breakdown.map((item) => (
                      <div key={item.question_num} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-sm font-black text-slate-500 flex-shrink-0 shadow-sm">
                          Q{item.question_num}
                        </div>
                        <div className="flex-1 text-sm text-slate-600 font-medium">{item.note}</div>
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border ${ratingBadge(item.rating)}`}>
                          {ratingIcon(item.rating)}
                          {item.rating.charAt(0).toUpperCase() + item.rating.slice(1)}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Legend */}
                  <div className="mt-6 flex items-center gap-6 text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-teal-500" /> Strong</span>
                    <span className="flex items-center gap-1"><Minus className="w-3 h-3 text-amber-500" /> Average</span>
                    <span className="flex items-center gap-1"><TrendingDown className="w-3 h-3 text-rose-500" /> Weak</span>
                  </div>
                </div>
              )}

              {/* Recommendation */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] p-8 text-white">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Star className="w-4 h-4 text-amber-400" />
                  Final Recommendation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">ಕನ್ನಡ</p>
                    <p className="text-white font-semibold leading-relaxed">{kannadaPart(report.recommendation)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">English</p>
                    <p className="text-slate-200 font-semibold leading-relaxed">{englishPart(report.recommendation)}</p>
                  </div>
                </div>
              </div>

              {/* Print footer */}
              <div className="text-center text-xs text-slate-400 font-medium py-4 hidden print:block">
                Generated by Kannada AI Interview System • {new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
}
