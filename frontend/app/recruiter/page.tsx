"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Plus, Briefcase, Users, BarChart3, Clock, 
  FileText, Zap, Search, ChevronRight, 
  LayoutDashboard, LogOut, CheckCircle2, 
  Target, Activity, Sparkles, Brain
} from "lucide-react";
import { getJobs, createJob, getAdminStats, getAllCandidates, getAnalytics, parseJD, generateQuestions } from "@/lib/api";

export default function RecruiterDashboard() {
  const { user, token, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  
  const [jobs, setJobs] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [stats, setStats] = useState({
    total_jobs: 0,
    total_applicants: 0,
    total_interviews: 0,
    ai_screened_pct: 0
  });

  const [analyticsData, setAnalyticsData] = useState<any>(null);
  
  // Job Form State
  const [jobFormData, setJobFormData] = useState({
    title: "",
    location: "",
    salary: "",
    description: "",
    requirements: "",
    eligibility: ""
  });
  
  const [rawJD, setRawJD] = useState("");
  const [isParsingJD, setIsParsingJD] = useState(false);
  const [questionPool, setQuestionPool] = useState<{easy: any[], difficult: any[]}>({easy: [], difficult: []});
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user || (user.role !== "admin" && user.role !== "recruiter")) {
        router.push("/");
      } else if (token) {
        fetchInitialData();
      }
    }
  }, [user, authLoading, token]);

  useEffect(() => {
    if (token) {
      if (activeTab === 'candidates') fetchCandidates();
      if (activeTab === 'analytics') fetchAnalytics();
      if (activeTab === 'jobs') fetchJobs();
      if (activeTab === 'overview') {
        fetchJobs();
        fetchStats();
      }
    }
  }, [activeTab, token]);

  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.all([
      fetchJobs(),
      fetchStats(),
      fetchAnalytics()
    ]);
    setLoading(false);
  };

  const fetchJobs = async () => {
    try {
      const data = await getJobs(token!);
      setJobs(data);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    }
  };

  const fetchCandidates = async () => {
    try {
      const data = await getAllCandidates(token!);
      setCandidates(data);
    } catch (error) {
      console.error("Failed to fetch candidates:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getAdminStats(token!);
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const data = await getAnalytics(token!);
      setAnalyticsData(data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
  };

  const handleParseJD = async () => {
    if (!rawJD) return;
    setIsParsingJD(true);
    try {
      const parsed = await parseJD(rawJD, token!);
      setJobFormData({
        title: parsed.title || "",
        location: parsed.location || "Bangalore",
        salary: parsed.salary || "Competitive",
        description: parsed.description || "",
        requirements: parsed.requirements ? parsed.requirements.join("\n") : "",
        eligibility: parsed.eligibility || ""
      });

      // Auto-generate Kannada adaptive questions
      if (parsed.title) {
        handleGenerateQuestions(parsed.title, parsed.requirements || []);
      }
    } catch (error) {
      console.error("JD Parsing failed:", error);
      alert("Failed to parse JD automatically. Please fill manually.");
    } finally {
      setIsParsingJD(false);
    }
  };

  const handleGenerateQuestions = async (role: string, reqs: string[]) => {
    setIsGeneratingQuestions(true);
    try {
      const questions = await generateQuestions(role, reqs, token!);
      setQuestionPool(questions);
    } catch (error) {
      console.error("Question generation failed:", error);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createJob(jobFormData, token!);
      setIsPostJobModalOpen(false);
      resetForm();
      fetchJobs();
      fetchStats();
    } catch (error) {
      console.error("Failed to post job:", error);
      alert("Failed to post job details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setJobFormData({
      title: "",
      location: "",
      salary: "",
      description: "",
      requirements: "",
      eligibility: ""
    });
    setRawJD("");
    setQuestionPool({easy: [], difficult: []});
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex text-foreground font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-surface border-r border-border hidden xl:flex flex-col sticky top-0 h-screen shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-2.5 mb-8">
            <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block"></span>
            <span className="text-xl font-black text-primary tracking-tight">ಕನ್ನಡ AI</span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-accent-subtle text-accent-subtle-foreground font-bold uppercase tracking-wider">Recruiter</span>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'overview', icon: LayoutDashboard, label: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ (Overview)' },
              { id: 'jobs', icon: Briefcase, label: 'ಉದ್ಯೋಗ ಪ್ರಚಾರಗಳು (Jobs)' },
              { id: 'candidates', icon: Users, label: 'ಅಭ್ಯರ್ಥಿಗಳು (Candidates)' },
              { id: 'analytics', icon: BarChart3, label: 'ವಿಶ್ಲೇಷಣೆ (Analytics)' }
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-colors ${activeTab === item.id ? 'bg-accent-subtle text-accent-subtle-foreground font-bold border-l-2 border-accent' : 'text-foreground-muted hover:bg-surface-raised hover:text-foreground'}`}
              >
                <item.icon size={18} className={activeTab === item.id ? 'text-accent' : ''} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-border">
          <div className="flex items-center gap-3 mb-4 p-2.5 rounded-xl bg-surface-raised border border-border">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground truncate">{user.name}</p>
              <p className="text-[11px] text-foreground-muted truncate capitalize">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-foreground-muted hover:text-red-600 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            <span>ಲಾಗ್ ಔಟ್ (Sign Out)</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen overflow-y-auto">
        <header className="bg-surface/90 backdrop-blur-md sticky top-0 z-30 border-b border-border px-8 py-4 flex items-center justify-between shadow-sm">
          <div className="xl:hidden flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block"></span>
            <span className="font-bold text-primary">ಕನ್ನಡ AI Recruiter</span>
          </div>
          
          <div className="hidden xl:flex items-center gap-2 text-xs text-foreground-muted font-medium">
            <span>ಮುಖ್ಯಪುಟ</span>
            <ChevronRight size={14} />
            <span className="text-foreground font-bold capitalize">{activeTab}</span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsPostJobModalOpen(true)}
              className="px-4 py-2 bg-primary hover:bg-[#131F37] text-white rounded-xl font-semibold text-xs shadow-sm transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              <span>ಹೊಸ ಹುದ್ದೆ ಸೇರಿಸಿ (Post Job)</span>
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {activeTab === "overview" && (
            <>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-black text-foreground tracking-tight">ಸುಸ್ವಾಗತ, {user.name.split(' ')[0]}! 👋</h1>
                  <p className="text-foreground-muted text-xs mt-0.5">ಇಂದಿನ ನೇಮಕಾತಿ ಅಂಕಿಅಂಶಗಳು ಮತ್ತು ಅಭ್ಯರ್ಥಿ ಪ್ರಗತಿ ವಿವರಗಳು.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'ಸಕ್ರಿಯ ಹುದ್ದೆಗಳು (Active Jobs)', value: stats.total_jobs, icon: Briefcase, color: 'text-primary' },
                  { label: 'ಒಟ್ಟು ಅಭ್ಯರ್ಥಿಗಳು (Applicants)', value: stats.total_applicants, icon: Users, color: 'text-emerald-600' },
                  { label: 'ಸಂದರ್ಶನಗಳು (Interviews)', value: stats.total_interviews, icon: Clock, color: 'text-accent' },
                  { label: 'AI ಸ್ಕ್ರೀನಿಂಗ್ ದಕ್ಷತೆ', value: `${stats.ai_screened_pct}%`, icon: Zap, color: 'text-amber-600' }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-surface p-5 rounded-xl border border-border shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-foreground-muted text-xs font-semibold uppercase tracking-wider">{stat.label}</p>
                      <stat.icon size={18} className={stat.color} />
                    </div>
                    <h3 className="text-2xl font-black text-foreground">{stat.value}</h3>
                  </div>
                ))}
              </div>

              <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-black text-foreground tracking-tight">ಇತ್ತೀಚಿನ ಉದ್ಯೋಗ ಪ್ರಚಾರಗಳು</h2>
                    <p className="text-xs text-foreground-muted">ಸಕ್ರಿಯವಾಗಿರುವ ಉದ್ಯೋಗಗಳು ಮತ್ತು ಅಭ್ಯರ್ಥಿಗಳ ಮಾಹಿತಿ.</p>
                  </div>
                  <button onClick={() => setActiveTab("jobs")} className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
                    ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ <ChevronRight size={14} />
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-surface-raised text-foreground-muted font-semibold uppercase tracking-wider">
                        <th className="px-6 py-3.5">ಉದ್ಯೋಗ ಶೀರ್ಷಿಕೆ</th>
                        <th className="px-6 py-3.5">ಸ್ಥಳ (Location)</th>
                        <th className="px-6 py-3.5">ಸ್ಥಿತಿ (Status)</th>
                        <th className="px-6 py-3.5">ಕ್ರಮಗಳು (Actions)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {loading ? (
                        <tr><td colSpan={4} className="px-6 py-12 text-center"><div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-accent mx-auto"></div></td></tr>
                      ) : jobs.length === 0 ? (
                        <tr><td colSpan={4} className="px-6 py-12 text-center font-medium text-foreground-muted">ಯಾವುದೇ ಉದ್ಯೋಗಗಳು ಕಂಡುಬಂದಿಲ್ಲ.</td></tr>
                      ) : (
                        jobs.slice(0, 5).map((job) => (
                          <tr key={job._id} className="hover:bg-surface-raised/50 transition-colors">
                            <td className="px-6 py-4 font-bold text-foreground">{job.title}</td>
                            <td className="px-6 py-4 text-foreground-muted font-medium">{job.location}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${job.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-surface-raised text-foreground-muted border border-border'}`}>
                                {job.is_active ? 'Active' : 'Closed'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <Link href={`/hiring/${job._id}/applicants`} className="text-accent hover:underline font-semibold">ಅಭ್ಯರ್ಥಿಗಳನ್ನು ವೀಕ್ಷಿಸಿ</Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === "jobs" && (
            <div className="space-y-4">
              <h1 className="text-2xl font-black text-foreground tracking-tight">ನನ್ನ ಉದ್ಯೋಗ ಪ್ರಚಾರಗಳು</h1>
              <div className="grid grid-cols-1 gap-3">
                {jobs.map(job => (
                  <div key={job._id} className="bg-surface rounded-xl p-5 border border-border shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-accent-subtle text-accent-subtle-foreground rounded-xl flex items-center justify-center text-lg font-black border border-amber-200/50">{job.title.charAt(0)}</div>
                      <div>
                        <h3 className="text-base font-bold text-foreground">{job.title}</h3>
                        <p className="text-xs text-foreground-muted">{job.location} • {job.salary}</p>
                      </div>
                    </div>
                    <Link href={`/hiring/${job._id}/applicants`} className="px-4 py-2 bg-primary hover:bg-[#131F37] text-white rounded-xl font-semibold text-xs shadow-sm transition-colors">ಅಭ್ಯರ್ಥಿಗಳ ಪಟ್ಟಿ</Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "candidates" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-black text-foreground tracking-tight">ಎಲ್ಲಾ ಅಭ್ಯರ್ಥಿಗಳು (Candidates)</h1>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted" size={16} />
                  <input 
                    type="text" 
                    placeholder="ಹೆಸರು ಅಥವಾ ಹುದ್ದೆ ಹುಡುಕಿ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors font-medium text-xs text-foreground"
                  />
                </div>
              </div>

              <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-surface-raised text-foreground-muted font-semibold uppercase tracking-wider">
                        <th className="px-6 py-3.5">ಅಭ್ಯರ್ಥಿ ಹೆಸರು</th>
                        <th className="px-6 py-3.5">ಅರ್ಜಿ ಸಲ್ಲಿಸಿದ ಹುದ್ದೆ</th>
                        <th className="px-6 py-3.5">ಸ್ಥಿತಿ</th>
                        <th className="px-6 py-3.5">AI ಸ್ಕೋರ್</th>
                        <th className="px-6 py-3.5">ಕ್ರಮಗಳು</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {candidates
                        .filter(c => 
                          c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.job_title?.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map(c => (
                        <tr key={c._id} className="hover:bg-surface-raised/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-foreground">{c.name}</td>
                          <td className="px-6 py-4 text-foreground-muted font-medium">{c.job_title}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${c.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-accent-subtle text-accent-subtle-foreground border border-amber-200'}`}>{c.status}</span>
                          </td>
                          <td className="px-6 py-4">
                            {c.ai_score !== undefined ? <span className="font-bold text-accent">{c.ai_score}%</span> : <span className="text-foreground-muted">Not Scored</span>}
                          </td>
                          <td className="px-6 py-4"><Link href={`/hiring/${c.job_id}/applicants`} className="text-accent hover:underline font-semibold">ಫಲಿತಾಂಶ ನೋಡಿ</Link></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "analytics" && analyticsData && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-2xl font-black text-foreground tracking-tight">ಕಾರ್ಯಕ್ಷಮತೆಯ ವಿಶ್ಲೇಷಣೆ (Analytics)</h1>
                <p className="text-foreground-muted text-xs">ನೈಜ ಸಮಯದ ಅಭ್ಯರ್ಥಿ ಕಾರ್ಯಕ್ಷಮತೆ ಮತ್ತು ಪರಿವರ್ತನೆ ಒಳನೋಟಗಳು.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-surface p-6 rounded-xl border border-border shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent-subtle text-accent rounded-xl flex items-center justify-center border border-amber-200/50">
                    <Activity size={24} />
                  </div>
                  <div>
                    <p className="text-foreground-muted text-xs font-semibold uppercase tracking-wider mb-0.5">ಸರಾಸರಿ ಸಂದರ್ಶನ ಸ್ಕೋರ್</p>
                    <h3 className="text-2xl font-black text-foreground">{analyticsData.performance.avg_score}%</h3>
                  </div>
                </div>
                <div className="bg-surface p-6 rounded-xl border border-border shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center border border-emerald-200/50">
                    <Target size={24} />
                  </div>
                  <div>
                    <p className="text-foreground-muted text-xs font-semibold uppercase tracking-wider mb-0.5">ಗರಿಷ್ಠ ಸ್ಕೋರ್</p>
                    <h3 className="text-2xl font-black text-foreground">{analyticsData.performance.highest_score}%</h3>
                  </div>
                </div>
                <div className="bg-surface p-6 rounded-xl border border-border shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center border border-primary/20">
                    <Zap size={24} />
                  </div>
                  <div>
                    <p className="text-foreground-muted text-xs font-semibold uppercase tracking-wider mb-0.5">ಉಳಿತಾಯವಾದ ಸಮಯ (AI)</p>
                    <h3 className="text-2xl font-black text-foreground">{analyticsData.impact.time_saved_hours} ಗಂಟೆಗಳು</h3>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Post Job Modal */}
      {isPostJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 overflow-y-auto">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsPostJobModalOpen(false)}></div>
          <div className="relative bg-surface w-full max-w-4xl rounded-2xl shadow-2xl border border-border overflow-hidden animate-fade-in my-auto">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-foreground tracking-tight">ಹೊಸ ಉದ್ಯೋಗ ಪ್ರಚಾರ ರಚಿಸಿ</h2>
                <p className="text-xs text-foreground-muted">AI ಬಳಸಿ ನಿಮ್ಮ JD ಯಿಂದ ಕನ್ನಡ ಪ್ರಶ್ನೆಗಳನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಸಿದ್ಧಪಡಿಸಿ.</p>
              </div>
              <button onClick={() => setIsPostJobModalOpen(false)} className="p-1.5 text-foreground-muted hover:text-foreground rounded-lg transition-colors">
                <Plus size={20} className="rotate-45" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Left Side: JD Manager */}
              <div className="p-6 border-r border-border bg-surface-raised">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wider flex items-center gap-2">
                      <FileText size={14} className="text-accent" />
                      JD ಮ್ಯಾನೇಜರ್ (ಉದ್ಯೋಗ ವಿವರಣೆ ಪೇಸ್ಟ್ ಮಾಡಿ)
                    </label>
                    <textarea 
                      rows={8}
                      placeholder="ಇಲ್ಲಿ ಸಂಪೂರ್ಣ ಉದ್ಯೋಗ ವಿವರಣೆ ಪೇಸ್ಟ್ ಮಾಡಿ..."
                      value={rawJD}
                      onChange={(e) => setRawJD(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors font-medium text-xs text-foreground resize-none"
                    />
                  </div>
                  <button 
                    onClick={handleParseJD}
                    disabled={isParsingJD || !rawJD}
                    className="w-full py-2.5 bg-primary hover:bg-[#131F37] text-white rounded-xl font-semibold text-xs shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isParsingJD ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        ಮಾಹಿತಿ ಗುರುತಿಸಿ & ಪ್ರಶ್ನೆ ಸಿದ್ಧಪಡಿಸಿ
                      </>
                    )}
                  </button>

                  {/* Adaptive Questions Preview */}
                  {questionPool.easy.length > 0 && (
                    <div className="space-y-3 pt-3 border-t border-border">
                      <h4 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider flex items-center gap-1.5">
                        <Brain size={14} className="text-accent" />
                        ಸಿದ್ಧಪಡಿಸಲಾದ ಕನ್ನಡ ಪ್ರಶ್ನೆಗಳು
                      </h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {questionPool.easy.map((q, i) => (
                          <div key={i} className="p-2.5 bg-background border border-border rounded-lg">
                            <span className="text-[10px] font-bold text-emerald-700 uppercase mb-0.5 block">ಹಂತ: ಸುಲಭ</span>
                            <p className="text-xs font-medium text-foreground leading-relaxed">{q.q}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: Form */}
              <form onSubmit={handlePostJob} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">ಹುದ್ದೆ ಶೀರ್ಷಿಕೆ</label>
                    <input 
                      required
                      type="text" 
                      placeholder="ಉದಾ. Delivery Executive"
                      value={jobFormData.title}
                      onChange={(e) => setJobFormData({...jobFormData, title: e.target.value})}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none text-xs font-medium text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">ಸ್ಥಳ (Location)</label>
                    <input 
                      required
                      type="text" 
                      placeholder="ಉದಾ. Bangalore"
                      value={jobFormData.location}
                      onChange={(e) => setJobFormData({...jobFormData, location: e.target.value})}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none text-xs font-medium text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">ವೇತನ (Salary)</label>
                  <input 
                    required
                    type="text" 
                    placeholder="ಉದಾ. ₹25,000 - ₹35,000"
                    value={jobFormData.salary}
                    onChange={(e) => setJobFormData({...jobFormData, salary: e.target.value})}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none text-xs font-medium text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">ಸಾರಾಂಶ (Description)</label>
                  <textarea 
                    required
                    rows={2}
                    value={jobFormData.description}
                    onChange={(e) => setJobFormData({...jobFormData, description: e.target.value})}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none text-xs font-medium text-foreground resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button 
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full py-2.5 bg-primary hover:bg-[#131F37] text-white rounded-xl font-semibold text-sm shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        ಪ್ರಕಟಿಸಿ (Publish Campaign)
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
