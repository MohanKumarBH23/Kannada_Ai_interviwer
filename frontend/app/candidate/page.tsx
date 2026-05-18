"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { startInterview, getJobs, updateProfile, uploadProfilePicture, applyJob } from "@/lib/api";
import { 
  Sparkles, Briefcase, GraduationCap, FileText, 
  LogIn, LogOut, User as UserIcon, MessageSquare, 
  RefreshCw, Download, X, Save, MapPin, Phone, 
  Award, Loader2, CheckCircle2, Camera, UserCircle,
  ChevronRight, ArrowRight, Zap, Target, Search,
  Bot, Mic, Square
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { buildVoiceResume, generateResume } from "@/lib/api";


export default function CandidateDashboard() {
  const router = useRouter();
  const { user, logout, token, loading: authLoading, login } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  
  const [jobRole, setJobRole] = useState("Software Engineer");
  const [difficulty, setDifficulty] = useState("medium");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Resume Builder States
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resumeTranscript, setResumeTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const applicationFormRef = useRef<HTMLDivElement>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applySuccessMessage, setApplySuccessMessage] = useState("");


  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    } else if (user) {
      setPhotoPreview(user.profile_picture || null);
      fetchJobs();
    }
  }, [user, authLoading, router]);

  const fetchJobs = async () => {
    try {
      const data = await getJobs();
      // Only show active jobs
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
    setApplySuccessMessage("");
    try {
      if (!token) throw new Error("Please log in to apply for jobs.");
      await applyJob(selectedJob._id, resumeFile, token);
      setApplySuccessMessage("Application submitted successfully! Our recruiters will review your profile, and if selected, you will receive your interview link via Telegram.");
      setTimeout(() => {
        setIsApplyModalOpen(false);
        setSelectedJob(null);
        setApplySuccessMessage("");
      }, 5000);
    } catch (err: any) {
      setError(err.message || "Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await startInterview(
        jobRole, 
        difficulty, 
        resumeFile, 
        token || undefined,
        selectedJob?._id,
        undefined, // candidateId
        !selectedJob // isPractice
      );
      router.push(`/interview/${result._id}`);
    } catch (err: any) {
      setError(err.message || "Failed to start interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const startResumeRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await handleVoiceResumeSubmit(blob);
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic error:", err);
      alert("Microphone access required.");
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
      const result = await buildVoiceResume(blob, token);
      setResumeTranscript(result.transcript);
      // Refresh user data is handled by auth context usually, but we might need a local refresh
      // For now, alert success
      alert("ಹೊಸ ರೆಸ್ಯೂಮ್ ಸಿದ್ಧವಾಗಿದೆ! (Your new resume is ready!)");
      setIsResumeModalOpen(false);
      window.location.reload(); // Quick way to refresh profile data
    } catch (err) {
      console.error(err);
      alert("Failed to process voice. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };


  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfdfd] text-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-600/20 group-hover:scale-105 transition-transform">
              <Sparkles size={22} />
            </div>
            <span className="text-xl font-black tracking-tight">Kannada<span className="text-teal-600">AI</span></span>
          </Link>
          
          <div className="flex items-center gap-6">
             <Link href="/profile" className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-50 transition-all font-bold text-sm text-slate-600">
                <UserIcon size={18} />
                Profile
             </Link>
             <button onClick={logout} className="flex items-center gap-2 px-4 py-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-all font-bold text-sm">
                <LogOut size={18} />
                Logout
             </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {/* AI Resume Builder Section */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
           
           <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/20 text-teal-300 rounded-full text-xs font-black uppercase tracking-widest border border-teal-500/30">
                    <Sparkles size={14} />
                    New: AI Resume Builder
                 </div>
                 <h2 className="text-4xl font-black leading-tight">
                    Don't have a Resume? <br/>
                    <span className="text-teal-400">Just tell us your story.</span>
                 </h2>
                 <p className="text-slate-400 text-lg font-medium leading-relaxed">
                    Our AI assistant will help you create a professional resume in minutes. 
                    Upload an existing file or use your voice to generate one from scratch in Kannada or English.
                 </p>
                 <div className="flex flex-wrap gap-4 pt-4">
                    <button 
                      onClick={() => setIsResumeModalOpen(true)}
                      className="px-8 py-4 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-black transition-all flex items-center gap-3 shadow-xl shadow-teal-900/20 active:scale-95"
                    >
                       <Mic size={20} />
                       Voice Assistant
                    </button>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black transition-all flex items-center gap-3 border border-white/10 backdrop-blur-md active:scale-95"
                    >
                       <FileText size={20} />
                       Upload PDF
                    </button>
                 </div>
              </div>

              <div className="hidden lg:block relative">
                 <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-sm space-y-6 rotate-2 hover:rotate-0 transition-all duration-500">
                    <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                       <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center text-white font-black text-xl">
                          {user?.name?.charAt(0) || "C"}
                       </div>
                       <div>
                          <div className="h-4 w-32 bg-white/20 rounded-full mb-2"></div>
                          <div className="h-3 w-48 bg-white/10 rounded-full"></div>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <div className="h-3 w-full bg-white/10 rounded-full"></div>
                       <div className="h-3 w-full bg-white/10 rounded-full"></div>
                       <div className="h-3 w-3/4 bg-white/10 rounded-full"></div>
                    </div>
                    <div className="pt-4 flex gap-3">
                       <div className="h-8 w-20 bg-teal-500/20 border border-teal-500/30 rounded-lg"></div>
                       <div className="h-8 w-24 bg-teal-500/20 border border-teal-500/30 rounded-lg"></div>
                    </div>
                 </div>
                 {/* Decorative elements */}
                 <div className="absolute -top-6 -right-6 w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-2xl animate-bounce">
                    <Bot className="text-white" size={32} />
                 </div>
              </div>
           </div>
        </section>


        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           {/* Left Column: Live Openings */}
           <div className="lg:col-span-7 space-y-8">
              <div className="flex items-center justify-between">
                 <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                    <Briefcase className="text-teal-600" />
                    Live Job Openings
                 </h2>
                 <span className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                    {jobs.length} Active Jobs
                 </span>
              </div>

              {loadingJobs ? (
                 <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-100 border-dashed">
                    <Loader2 className="animate-spin text-teal-600 mb-4" size={32} />
                    <p className="text-slate-400 font-bold">Loading live jobs...</p>
                 </div>
              ) : jobs.length === 0 ? (
                 <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100 border-dashed">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                       <Search className="text-slate-300" size={32} />
                    </div>
                    <h3 className="text-xl font-black mb-2">No active openings yet</h3>
                    <p className="text-slate-400 font-medium">Recruiters are currently preparing new campaigns. Check back soon!</p>
                 </div>
              ) : (
                 <div className="space-y-4">
                    {jobs.map((job) => (
                       <div 
                         key={job._id} 
                         className={`group bg-white p-6 rounded-[2rem] border transition-all hover:shadow-xl hover:shadow-teal-900/5 ${selectedJob?._id === job._id ? 'border-teal-500 ring-4 ring-teal-500/5' : 'border-slate-100'}`}
                       >
                          <div className="flex items-start justify-between gap-4">
                             <div className="flex gap-5">
                                <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0">
                                   {job.title.charAt(0)}
                                </div>
                                <div className="space-y-2">
                                   <h3 className="text-xl font-black group-hover:text-teal-600 transition-colors">{job.title}</h3>
                                   <div className="flex flex-wrap gap-4 text-sm font-bold text-slate-500">
                                      <span className="flex items-center gap-1.5"><MapPin size={16} /> {job.location}</span>
                                      <span className="flex items-center gap-1.5"><Award size={16} /> {job.salary}</span>
                                   </div>
                                   <p className="text-sm text-slate-400 line-clamp-2 font-medium leading-relaxed">
                                      {job.description}
                                   </p>
                                </div>
                             </div>
                             <button 
                               onClick={() => handleApply(job)}
                               className={`px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 shrink-0 ${selectedJob?._id === job._id ? 'bg-teal-600 text-white' : 'bg-slate-900 text-white hover:bg-teal-600'}`}
                             >
                                Apply Now
                                <ArrowRight size={16} />
                             </button>
                          </div>
                       </div>
                    ))}
                 </div>
              )}


           </div>

           {/* Right Column: Application Form */}
           <div className="lg:col-span-5" ref={applicationFormRef}>
              <div className="sticky top-28 space-y-6">
                 <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                    
                    <div className="relative z-10 space-y-8">
                       <div>
                          <h2 className="text-2xl font-black tracking-tight mb-2">
                             {selectedJob ? 'Complete Application' : 'Quick Practice'}
                          </h2>
                          <p className="text-sm text-slate-500 font-medium">
                             {selectedJob ? `You are applying for ${selectedJob.title}` : 'Choose a role to start practicing.'}
                          </p>
                       </div>

                       <form onSubmit={handleStartInterview} className="space-y-6">
                          <div className="space-y-3">
                             <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Job Role</label>
                             <input 
                               type="text"
                               value={jobRole}
                               onChange={(e) => setJobRole(e.target.value)}
                               readOnly={!!selectedJob}
                               className={`w-full px-6 py-4 rounded-2xl border transition-all font-bold text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/5 ${selectedJob ? 'bg-slate-50 border-slate-100 text-slate-400' : 'bg-white border-slate-200 focus:border-teal-500'}`}
                             />
                          </div>

                          <div className="space-y-3">
                             <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Difficulty Level</label>
                             <div className="grid grid-cols-3 gap-3">
                                {['easy', 'medium', 'hard'].map((level) => (
                                   <button
                                     key={level}
                                     type="button"
                                     onClick={() => setDifficulty(level)}
                                     className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${difficulty === level ? 'bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-600/20' : 'bg-white border-slate-100 text-slate-400 hover:border-teal-200 hover:text-teal-600'}`}
                                   >
                                      {level}
                                   </button>
                                ))}
                             </div>
                          </div>

                          <div className="space-y-3">
                             <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Resume (Optional)</label>
                             <div 
                               onClick={() => fileInputRef.current?.click()}
                               className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${resumeFile ? 'border-teal-500 bg-teal-50/30' : 'border-slate-100 hover:border-teal-300 hover:bg-slate-50/50'}`}
                             >
                                <input 
                                  type="file" 
                                  ref={fileInputRef}
                                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                                  className="hidden"
                                />
                                {resumeFile ? (
                                   <div className="flex flex-col items-center gap-2">
                                      <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center">
                                         <FileText size={20} />
                                      </div>
                                      <span className="text-xs font-black text-teal-700 truncate max-w-[200px]">{resumeFile.name}</span>
                                   </div>
                                ) : (
                                   <div className="flex flex-col items-center gap-2 text-slate-400">
                                      <Download size={24} />
                                      <span className="text-xs font-bold">Upload Resume (PDF)</span>
                                   </div>
                                )}
                             </div>
                          </div>

                          {error && (
                             <div className="p-4 bg-rose-50 text-rose-500 rounded-2xl text-xs font-bold flex items-center gap-3 animate-in shake duration-300">
                                <X size={16} />
                                {error}
                             </div>
                          )}

                          <button 
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-teal-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-teal-600/20 hover:bg-teal-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                          >
                             {loading ? (
                                <Loader2 className="animate-spin" size={24} />
                             ) : (
                                <>
                                   Launch Practice Bot
                                   <Sparkles size={20} />
                                </>
                             )}
                          </button>
                       </form>
                    </div>
                 </div>

                 {/* Tips Card */}
                 <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100">
                    <h4 className="font-black text-sm mb-4 flex items-center gap-2">
                       <Award size={16} className="text-teal-600" />
                       Pro Tips
                    </h4>
                    <ul className="space-y-4">
                       <li className="flex gap-3">
                          <div className="w-5 h-5 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">1</div>
                          <p className="text-xs font-medium text-slate-500 leading-relaxed">Ensure your profile is complete to improve your eligibility score.</p>
                       </li>
                       <li className="flex gap-3">
                          <div className="w-5 h-5 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">2</div>
                          <p className="text-xs font-medium text-slate-500 leading-relaxed">Practice in Kannada to get familiar with the AI's response pattern.</p>
                       </li>
                    </ul>
                 </div>
              </div>
           </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-12 mt-20">
         <div className="max-w-7xl mx-auto px-6 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
            © 2026 KannadaAI Recruiter • Built for the blue-collar workforce
         </div>
      </footer>

      {/* Voice Resume Modal */}
      {isResumeModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-12 text-center space-y-8">
              <div className="w-24 h-24 bg-teal-50 rounded-[2rem] flex items-center justify-center mx-auto text-teal-600 relative">
                {isRecording && (
                  <div className="absolute inset-0 bg-teal-500/20 rounded-[2rem] animate-ping"></div>
                )}
                <Mic size={48} className={isRecording ? "animate-pulse" : ""} />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-slate-900">
                  {isProcessing ? "Processing your story..." : "Tell us your story"}
                </h3>
                <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-md mx-auto">
                  {isRecording 
                    ? "Recording... Speak about your skills, work experience, and location in Kannada or English."
                    : isProcessing
                    ? "Our AI is building your professional profile. This will take a moment."
                    : "Click the button below and describe your background. Our AI will automatically build your resume."
                  }
                </p>
              </div>

              {!isProcessing && (
                <div className="flex flex-col items-center gap-6">
                  <button 
                    onClick={isRecording ? stopResumeRecording : startResumeRecording}
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${
                      isRecording 
                        ? "bg-rose-500 text-white shadow-rose-500/30 scale-110" 
                        : "bg-teal-600 text-white shadow-teal-600/30 hover:scale-105"
                    }`}
                  >
                    {isRecording ? <Square size={32} fill="currentColor" /> : <Mic size={32} />}
                  </button>
                  
                  <button 
                    onClick={() => setIsResumeModalOpen(false)}
                    className="text-slate-400 font-black text-sm uppercase tracking-widest hover:text-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {isProcessing && (
                <div className="py-8 flex flex-col items-center gap-6">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-teal-600 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-teal-600 rounded-full animate-bounce delay-100"></div>
                    <div className="w-3 h-3 bg-teal-600 rounded-full animate-bounce delay-200"></div>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-teal-600 h-full w-1/2 animate-progress"></div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-teal-50 p-8 border-t border-teal-100">
              <p className="text-xs font-bold text-teal-800 leading-relaxed text-center italic">
                "Hi, I'm Ramesh. I have 5 years of experience in construction and painting. I'm based in Bangalore and I'm looking for supervisor roles."
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {isApplyModalOpen && selectedJob && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Apply Now</h3>
                  <p className="text-slate-500 font-medium text-sm mt-1">
                    You are applying for {selectedJob.title}
                  </p>
                </div>
                <button 
                  onClick={() => setIsApplyModalOpen(false)}
                  className="p-2 bg-slate-100 text-slate-400 rounded-full hover:bg-slate-200 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmitApplication} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Resume (Optional)</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${resumeFile ? 'border-teal-500 bg-teal-50/30' : 'border-slate-100 hover:border-teal-300 hover:bg-slate-50/50'}`}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    {resumeFile ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center">
                          <FileText size={20} />
                        </div>
                        <span className="text-xs font-black text-teal-700 truncate max-w-[200px]">{resumeFile.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Download size={24} />
                        <span className="text-xs font-bold">Upload Resume (PDF)</span>
                      </div>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-rose-50 text-rose-500 rounded-2xl text-xs font-bold flex items-center gap-3 animate-in shake duration-300">
                    <X size={16} />
                    {error}
                  </div>
                )}

                {applySuccessMessage && (
                  <div className="p-4 bg-teal-50 text-teal-700 rounded-2xl text-xs font-bold flex items-center gap-3 animate-in zoom-in duration-300 border border-teal-100">
                    <CheckCircle2 size={16} />
                    {applySuccessMessage}
                  </div>
                )}

                {!applySuccessMessage && (
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-teal-600 text-white rounded-2xl font-black shadow-xl shadow-teal-600/20 hover:bg-teal-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      <>
                        Submit Application
                        <ArrowRight size={20} />
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
