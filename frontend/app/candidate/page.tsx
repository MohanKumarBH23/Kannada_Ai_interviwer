"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { startInterview, getJobs, applyJob, buildVoiceResume } from "@/lib/api";
import { 
  Sparkles, Briefcase, FileText, LogOut, 
  User as UserIcon, Download, X, MapPin, 
  Award, Loader2, CheckCircle2, ArrowRight, 
  Search, Mic, Square
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function CandidateDashboard() {
  const router = useRouter();
  const { user, logout, token, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  
  const [jobRole, setJobRole] = useState("Delivery Executive");
  const [difficulty, setDifficulty] = useState("medium");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Resume Builder States
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const applicationFormRef = useRef<HTMLDivElement>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applySuccessMessage, setApplySuccessMessage] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    } else if (user) {
      fetchJobs();
    }
  }, [user, authLoading, router]);

  const fetchJobs = async () => {
    try {
      const data = await getJobs();
      setJobs(data.filter((j: any) => j.is_active));
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleApply = (job: any) => {
    setSelectedJob(job);
    setJobRole(job.title);
    setApplySuccessMessage("");
    setIsApplyModalOpen(true);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    
    setLoading(true);
    setError("");

    try {
      const res = await applyJob(selectedJob._id, resumeFile || undefined, token!);
      setApplySuccessMessage(res.message || "Application submitted successfully!");
      setTimeout(() => {
        setIsApplyModalOpen(false);
        setResumeFile(null);
        setSelectedJob(null);
        setApplySuccessMessage("");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to submit application.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobRole.trim()) {
      setError("Please specify a job role.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const session = await startInterview(
        jobRole, 
        difficulty, 
        resumeFile, 
        token || undefined,
        selectedJob?._id,
        undefined,
        !selectedJob
      );
      router.push(`/interview/${session._id || session.id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to start interview. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const startResumeRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await handleVoiceResumeSubmit(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone error:", err);
      alert("Microphone access is required to build a voice resume.");
    }
  };

  const stopResumeRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleVoiceResumeSubmit = async (blob: Blob) => {
    if (!token) return;
    setIsProcessing(true);
    try {
      await buildVoiceResume(blob, token);
      alert("ಹೊಸ ರೆಸ್ಯೂಮ್ ಸಿದ್ಧವಾಗಿದೆ! (Your new resume is ready!)");
      setIsResumeModalOpen(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to process voice. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-border px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 tracking-tight group">
            <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block"></span>
            <span className="text-xl font-black text-primary">ಕನ್ನಡ AI</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-accent-subtle text-accent-subtle-foreground font-semibold uppercase">Candidate</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/profile" className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface-raised border border-border text-xs font-semibold text-foreground hover:border-primary/50 transition-colors">
              <UserIcon size={16} className="text-accent" />
              <span>{user?.name || "Profile"}</span>
            </Link>
            <button 
              onClick={logout} 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-foreground-muted hover:text-red-600 transition-colors text-xs font-semibold"
            >
              <LogOut size={16} />
              <span>ಲಾಗ್ ಔಟ್</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        {/* AI Resume Builder Hero Section */}
        <section className="bg-[#1B2A4A] rounded-2xl p-8 md:p-12 text-white relative overflow-hidden border border-[#243352] shadow-sm">
          <div className="absolute inset-0 bg-[radial-gradient(#D97706_0.75px,transparent_0.75px)] [background-size:24px_24px] opacity-10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D97706]/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-amber-400/30 text-amber-300 rounded-full text-xs font-semibold uppercase tracking-wider">
                <Sparkles size={14} className="text-accent" />
                <span>AI ರೆಸ್ಯೂಮ್ ಬಿಲ್ಡರ್</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">
                ರೆಸ್ಯೂಮ್ ಇಲ್ಲವೇ? <br/>
                <span className="text-amber-400">ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಮಾತನಾಡಿ ತಿಳಿಸಿ.</span>
              </h2>
              <p className="text-slate-300 text-base font-normal leading-relaxed max-w-xl">
                ನಮ್ಮ AI ಸಹಾಯಕವು ನಿಮ್ಮ ಅನುಭವ ಮತ್ತು ಕೌಶಲ್ಯಗಳನ್ನು ಆಧರಿಸಿ ವೃತ್ತಿಪರ ರೆಸ್ಯೂಮ್ ಅನ್ನು ನಿಮಿಷಗಳಲ್ಲಿ ಸಿದ್ಧಪಡಿಸುತ್ತದೆ. ಕನ್ನಡ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಧ್ವನಿಯ ಮೂಲಕ ಅಥವಾ ಫೈಲ್ ಅಪ್‌ಲೋಡ್ ಮಾಡುವ ಮೂಲಕ ಆರಂಭಿಸಿ.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button 
                  onClick={() => setIsResumeModalOpen(true)}
                  className="px-6 py-3 bg-accent hover:bg-[#B45309] text-white rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Mic size={18} />
                  <span>ಧ್ವನಿ ಮೂಲಕ ರಚಿಸಿ (Voice)</span>
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 border border-white/15"
                >
                  <FileText size={18} />
                  <span>PDF ಅಪ್‌ಲೋಡ್ ಮಾಡಿ</span>
                </button>
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="bg-[#131F37] border border-[#243352] rounded-2xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-4 border-b border-[#243352] pb-4">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-black text-lg border border-amber-400/30">
                    {user?.name?.charAt(0) || "C"}
                  </div>
                  <div>
                    <p className="text-white font-bold text-base">{user?.name || "ಅಭ್ಯರ್ಥಿ ಹೆಸರು"}</p>
                    <p className="text-xs text-amber-400 font-medium">ಕನ್ನಡ AI ಪರಿಶೀಲಿಸಿದ ಪ್ರೊಫೈಲ್</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2.5 w-full bg-white/10 rounded-full"></div>
                  <div className="h-2.5 w-5/6 bg-white/10 rounded-full"></div>
                  <div className="h-2.5 w-3/4 bg-white/10 rounded-full"></div>
                </div>
                <div className="pt-2 flex gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300 font-medium">ಕೌಶಲ್ಯಗಳು</span>
                  <span className="text-xs px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300 font-medium">ಅನುಭವ</span>
                  <span className="text-xs px-2.5 py-1 rounded-md bg-accent-subtle text-accent-subtle-foreground font-semibold">PDF ಸಿದ್ಧ</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Live Openings */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black tracking-tight flex items-center gap-2.5 text-foreground">
                <Briefcase className="text-accent" size={22} />
                <span>ಉದ್ಯೋಗಾವಕಾಶಗಳು (Live Jobs)</span>
              </h2>
              <span className="text-xs font-semibold text-foreground-muted bg-surface-raised px-3 py-1 rounded-md border border-border">
                {jobs.length} ಸಕ್ರಿಯ ಉದ್ಯೋಗಗಳು
              </span>
            </div>

            {loadingJobs ? (
              <div className="flex flex-col items-center justify-center py-16 bg-surface rounded-2xl border border-border border-dashed">
                <Loader2 className="animate-spin text-accent mb-3" size={28} />
                <p className="text-foreground-muted font-medium text-sm">ಉದ್ಯೋಗಾವಕಾಶಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-16 bg-surface rounded-2xl border border-border border-dashed p-6">
                <div className="w-12 h-12 bg-surface-raised rounded-xl flex items-center justify-center mx-auto mb-4 border border-border">
                  <Search className="text-foreground-muted" size={24} />
                </div>
                <h3 className="text-base font-bold text-foreground mb-1">ಯಾವುದೇ ಸಕ್ರಿಯ ಉದ್ಯೋಗಗಳು ಕಂಡುಬಂದಿಲ್ಲ</h3>
                <p className="text-foreground-muted text-xs">ನೇಮಕಾತಿದಾರರು ಹೊಸ ಉದ್ಯೋಗಗಳನ್ನು ಶೀಘ್ರದಲ್ಲೇ ಪೋಸ್ಟ್ ಮಾಡಲಿದ್ದಾರೆ.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div 
                    key={job._id} 
                    className={`bg-surface p-6 rounded-2xl border transition-all shadow-sm ${selectedJob?._id === job._id ? 'border-primary ring-2 ring-primary/10' : 'border-border hover:border-border/80'}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-accent-subtle text-accent-subtle-foreground rounded-xl flex items-center justify-center text-xl font-black shrink-0 border border-amber-200/50">
                          {job.title.charAt(0)}
                        </div>
                        <div className="space-y-1.5">
                          <h3 className="text-lg font-black text-foreground hover:text-primary transition-colors">{job.title}</h3>
                          <div className="flex flex-wrap gap-4 text-xs font-semibold text-foreground-muted">
                            <span className="flex items-center gap-1"><MapPin size={14} className="text-accent" /> {job.location}</span>
                            <span className="flex items-center gap-1"><Award size={14} className="text-accent" /> {job.salary}</span>
                          </div>
                          <p className="text-xs text-foreground-muted line-clamp-2 leading-relaxed">
                            {job.description}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleApply(job)}
                        className={`px-4 py-2 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 shrink-0 ${selectedJob?._id === job._id ? 'bg-primary text-white' : 'bg-surface-raised hover:bg-border/60 text-foreground border border-border'}`}
                      >
                        <span>ಅರ್ಜಿ ಸಲ್ಲಿಸಿ</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Quick Practice Form */}
          <div className="lg:col-span-5" ref={applicationFormRef}>
            <div className="sticky top-24 space-y-6">
              <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-lg font-black text-foreground tracking-tight">
                    {selectedJob ? 'ಉದ್ಯೋಗ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ' : 'ತ್ವರಿತ AI ಸಂದರ್ಶನ ಅಭ್ಯಾಸ'}
                  </h2>
                  <p className="text-xs text-foreground-muted mt-0.5">
                    {selectedJob ? `${selectedJob.title} ಹುದ್ದೆಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸುತ್ತಿದ್ದೀರಿ` : 'ಯಾವುದೇ ಹುದ್ದೆಗೆ ನೈಜ ಸಮಯದಲ್ಲಿ ಸಂದರ್ಶನ ಅಭ್ಯಾಸ ಆರಂಭಿಸಿ'}
                  </p>
                </div>

                <form onSubmit={handleStartInterview} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">ಹುದ್ದೆ (Job Role)</label>
                    <input 
                      type="text"
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                      readOnly={!!selectedJob}
                      placeholder="e.g. Delivery Executive, Driver, Security Guard"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium outline-none transition-colors ${selectedJob ? 'bg-surface-raised border-border text-foreground-muted' : 'bg-background border-border focus:border-primary focus:ring-1 focus:ring-primary text-foreground'}`}
                    />
                    {!selectedJob && (
                      <div className="pt-1.5">
                        <p className="text-[11px] text-foreground-muted mb-1.5 font-medium">ಜನಪ್ರಿಯ ಉದ್ಯೋಗಗಳು (Quick Select):</p>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { title: "Delivery Executive", kn: "ಡೆಲಿವರಿ" },
                            { title: "Driver", kn: "ಚಾಲಕ" },
                            { title: "Security Guard", kn: "ಸೆಕ್ಯುರಿಟಿ" },
                            { title: "Warehouse Associate", kn: "ಗೋದಾಮು" },
                            { title: "Electrician", kn: "ಎಲೆಕ್ಟ್ರಿಷಿಯನ್" },
                            { title: "Customer Support Executive", kn: "ಗ್ರಾಹಕ ಸೇವೆ" },
                            { title: "Retail Store Assistant", kn: "ಮಾರಾಟ" },
                          ].map((chip) => (
                            <button
                              key={chip.title}
                              type="button"
                              onClick={() => setJobRole(chip.title)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                                jobRole === chip.title
                                  ? 'bg-accent-subtle text-accent border-amber-300 font-bold shadow-sm'
                                  : 'bg-surface-raised border-border text-foreground-muted hover:text-foreground hover:bg-border/40'
                              }`}
                            >
                              {chip.kn} ({chip.title.split(' ')[0]})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">ಹಂತ (Difficulty)</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['easy', 'medium', 'hard'].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setDifficulty(level)}
                          className={`py-2 rounded-lg text-xs font-semibold uppercase tracking-wider border transition-colors ${difficulty === level ? 'bg-primary border-primary text-white shadow-sm' : 'bg-surface border-border text-foreground-muted hover:text-foreground'}`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">ರೆಸ್ಯೂಮ್ (Resume PDF)</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`border border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${resumeFile ? 'border-primary bg-accent-subtle/30' : 'border-border hover:border-primary/50 bg-background'}`}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      {resumeFile ? (
                        <div className="flex flex-col items-center gap-1.5">
                          <FileText size={20} className="text-accent" />
                          <span className="text-xs font-semibold text-foreground truncate max-w-[200px]">{resumeFile.name}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1.5 text-foreground-muted">
                          <Download size={20} />
                          <span className="text-xs font-medium">PDF ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-medium border border-red-200 flex items-center gap-2">
                      <X size={14} className="flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-primary hover:bg-[#131F37] text-white rounded-xl font-semibold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <>
                        <span>AI ಸಂದರ್ಶನ ಆರಂಭಿಸಿ</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Tips Card */}
              <div className="bg-surface rounded-2xl p-5 border border-border shadow-sm">
                <h4 className="font-bold text-xs uppercase tracking-wider text-foreground mb-3 flex items-center gap-2">
                  <Award size={16} className="text-accent" />
                  <span>ಸಲಹೆಗಳು (Pro Tips)</span>
                </h4>
                <ul className="space-y-2.5">
                  <li className="flex gap-2.5 text-xs text-foreground-muted leading-relaxed">
                    <span className="w-4 h-4 rounded-full bg-accent-subtle text-accent-subtle-foreground flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                    <span>ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಪೂರ್ಣಗೊಳಿಸುವುದರಿಂದ AI ಸ್ಕೋರ್ ಹೆಚ್ಚಾಗುತ್ತದೆ.</span>
                  </li>
                  <li className="flex gap-2.5 text-xs text-foreground-muted leading-relaxed">
                    <span className="w-4 h-4 rounded-full bg-accent-subtle text-accent-subtle-foreground flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                    <span>ಕನ್ನಡದಲ್ಲಿ ನೈಜವಾಗಿ ಮಾತನಾಡಿ AI ಯೊಂದಿಗೆ ಅಭ್ಯಾಸ ನಡೆಸಿ.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Voice Resume Modal */}
      {isResumeModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-surface rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-border animate-fade-in">
            <div className="p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-accent-subtle rounded-2xl flex items-center justify-center mx-auto text-accent border border-amber-200/50">
                <Mic size={32} className={isRecording ? "animate-pulse" : ""} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-black text-foreground">
                  {isProcessing ? "ಪ್ರೊಫೈಲ್ ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ..." : "ನಿಮ್ಮ ವೃತ್ತಿ ಕಥೆಯನ್ನು ತಿಳಿಸಿ"}
                </h3>
                <p className="text-foreground-muted text-xs leading-relaxed max-w-sm mx-auto">
                  {isRecording 
                    ? "ರೆಕಾರ್ಡಿಂಗ್ ನಡೆಯುತ್ತಿದೆ... ನಿಮ್ಮ ಅನುಭವ ಮತ್ತು ಕೌಶಲ್ಯಗಳನ್ನು ಕನ್ನಡ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಮಾತನಾಡಿ."
                    : isProcessing
                    ? "ನಮ್ಮ AI ನಿಮ್ಮ ವೃತ್ತಿಪರ ಪ್ರೊಫೈಲ್ ಅನ್ನು ನಿರ್ಮಿಸುತ್ತಿದೆ. ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ."
                    : "ಕೆಳಗಿನ ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ ಮಾತನಾಡಲು ಆರಂಭಿಸಿ. AI ಸ್ವಯಂಚಾಲಿತವಾಗಿ ರೆಸ್ಯೂಮ್ ರಚಿಸುತ್ತದೆ."
                  }
                </p>
              </div>

              {!isProcessing && (
                <div className="flex flex-col items-center gap-4">
                  <button 
                    onClick={isRecording ? stopResumeRecording : startResumeRecording}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-md ${
                      isRecording 
                        ? "bg-red-600 text-white scale-105" 
                        : "bg-primary text-white hover:bg-[#131F37]"
                    }`}
                  >
                    {isRecording ? <Square size={24} fill="currentColor" /> : <Mic size={24} />}
                  </button>
                  
                  <button 
                    onClick={() => setIsResumeModalOpen(false)}
                    className="text-foreground-muted font-semibold text-xs hover:text-foreground transition-colors"
                  >
                    ರದ್ದುಮಾಡಿ (Cancel)
                  </button>
                </div>
              )}

              {isProcessing && (
                <div className="py-4 flex justify-center">
                  <Loader2 className="animate-spin text-accent" size={28} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {isApplyModalOpen && selectedJob && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-surface rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-border animate-fade-in">
            <div className="p-6 space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-black text-foreground">ಅರ್ಜಿ ಸಲ್ಲಿಸಿ</h3>
                  <p className="text-foreground-muted text-xs mt-0.5">
                    {selectedJob.title} ಹುದ್ದೆಗಾಗಿ
                  </p>
                </div>
                <button 
                  onClick={() => setIsApplyModalOpen(false)}
                  className="p-1.5 bg-surface-raised text-foreground-muted rounded-lg hover:text-foreground transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitApplication} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">ರೆಸ್ಯೂಮ್ (Resume PDF)</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${resumeFile ? 'border-primary bg-accent-subtle/30' : 'border-border bg-background hover:border-primary/50'}`}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    {resumeFile ? (
                      <div className="flex flex-col items-center gap-1">
                        <FileText size={18} className="text-accent" />
                        <span className="text-xs font-semibold text-foreground truncate max-w-[200px]">{resumeFile.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-foreground-muted">
                        <Download size={18} />
                        <span className="text-xs font-medium">PDF ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ</span>
                      </div>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-medium border border-red-200">
                    {error}
                  </div>
                )}

                {applySuccessMessage && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200 flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    <span>{applySuccessMessage}</span>
                  </div>
                )}

                {!applySuccessMessage && (
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-primary hover:bg-[#131F37] text-white rounded-xl font-semibold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <>
                        <span>ಅರ್ಜಿ ಸಲ್ಲಿಸಿ (Submit)</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
