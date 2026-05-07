"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Plus, Briefcase, Users, BarChart3, Clock, 
  MapPin, DollarSign, FileText, Zap, Search, 
  Filter, ChevronRight, LayoutDashboard, Settings,
  LogOut, Bell, ExternalLink, MoreVertical, Trash2, Edit,
  Mail, Phone, CheckCircle2, AlertCircle, TrendingUp,
  Target, PieChart, Activity
} from "lucide-react";
import { getJobs, createJob, getAdminStats, getAllCandidates, getAnalytics } from "@/lib/api";

export default function RecruiterDashboard() {
  const { user, token, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  
  const [jobs, setJobs] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  
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

  // Refetch data when tab changes
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
      fetchCandidates(),
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

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createJob(jobFormData, token!);
      setIsPostJobModalOpen(false);
      setJobFormData({
        title: "",
        location: "",
        salary: "",
        description: "",
        requirements: "",
        eligibility: ""
      });
      fetchJobs();
      fetchStats();
    } catch (error) {
      console.error("Failed to post job:", error);
      alert("Failed to post job details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden xl:flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Briefcase size={22} />
            </div>
            <span className="text-xl font-black tracking-tight">Recruiter<span className="text-blue-600">Pro</span></span>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'overview', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'jobs', icon: Briefcase, label: 'My Job Posts' },
              { id: 'candidates', icon: Users, label: 'Candidates' },
              { id: 'analytics', icon: BarChart3, label: 'Analytics' }
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeTab === item.id ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-6 p-2 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen overflow-y-auto">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div className="xl:hidden flex items-center gap-3">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <Briefcase size={18} />
             </div>
             <span className="font-bold">RecruiterPro</span>
          </div>
          
          <div className="hidden xl:flex items-center gap-2 text-sm text-slate-400 font-medium">
            <span>Pages</span>
            <ChevronRight size={14} />
            <span className="text-slate-900 font-bold capitalize">{activeTab}</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2.5 text-slate-400 hover:text-blue-600 bg-white border border-slate-200 rounded-xl transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <button 
              onClick={() => setIsPostJobModalOpen(true)}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <Plus size={18} />
              Post Job
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {activeTab === "overview" && (
            <>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h1 className="text-3xl font-black tracking-tight mb-2">Welcome Back, {user.name.split(' ')[0]}! 👋</h1>
                  <p className="text-slate-500 font-medium">Here's what's happening with your recruitment pipelines today.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Active Jobs', value: stats.total_jobs, icon: Briefcase, color: 'blue' },
                  { label: 'Total Applicants', value: stats.total_applicants, icon: Users, color: 'emerald' },
                  { label: 'Interviews', value: stats.total_interviews, icon: Clock, color: 'amber' },
                  { label: 'AI Screened', value: `${stats.ai_screened_pct}%`, icon: Zap, color: 'purple' }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className={`w-12 h-12 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl flex items-center justify-center mb-4`}>
                      <stat.icon size={24} />
                    </div>
                    <p className="text-slate-500 text-sm font-bold mb-1 uppercase tracking-wider">{stat.label}</p>
                    <h3 className="text-3xl font-black">{stat.value}</h3>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black tracking-tight">Recent Job Postings</h2>
                    <p className="text-sm text-slate-500 font-medium">Manage and monitor your current job openings.</p>
                  </div>
                  <button onClick={() => setActiveTab("jobs")} className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
                    View All <ChevronRight size={16} />
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-widest">
                        <th className="px-8 py-5">Job Title</th>
                        <th className="px-8 py-5">Location</th>
                        <th className="px-8 py-5">Status</th>
                        <th className="px-8 py-5">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loading ? (
                        <tr><td colSpan={4} className="px-8 py-20 text-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div></td></tr>
                      ) : jobs.length === 0 ? (
                        <tr><td colSpan={4} className="px-8 py-20 text-center font-medium text-slate-500">No jobs found.</td></tr>
                      ) : (
                        jobs.slice(0, 5).map((job) => (
                          <tr key={job._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-5 font-bold">{job.title}</td>
                            <td className="px-8 py-5 text-slate-500 font-medium">{job.location}</td>
                            <td className="px-8 py-5">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${job.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                                {job.is_active ? 'Active' : 'Closed'}
                              </span>
                            </td>
                            <td className="px-8 py-5">
                              <Link href={`/hiring/${job._id}/applicants`} className="text-blue-600 hover:underline font-bold text-sm">View Details</Link>
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
            <div className="space-y-6">
              <h1 className="text-3xl font-black tracking-tight">My Job Postings</h1>
              <div className="grid grid-cols-1 gap-4">
                {jobs.map(job => (
                  <div key={job._id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black">{job.title.charAt(0)}</div>
                      <div>
                        <h3 className="text-xl font-black">{job.title}</h3>
                        <p className="text-sm font-bold text-slate-500">{job.location} • {job.salary}</p>
                      </div>
                    </div>
                    <Link href={`/hiring/${job._id}/applicants`} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/10 hover:bg-blue-700 transition-all">View Applicants</Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "candidates" && (
            <div className="space-y-6">
              <h1 className="text-3xl font-black tracking-tight">All Candidates</h1>
              <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-widest">
                        <th className="px-8 py-6">Candidate</th>
                        <th className="px-8 py-6">Applied For</th>
                        <th className="px-8 py-6">Status</th>
                        <th className="px-8 py-6">AI Score</th>
                        <th className="px-8 py-6">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {candidates.map(c => (
                        <tr key={c._id} className="hover:bg-slate-50/30">
                          <td className="px-8 py-6 font-bold">{c.name}</td>
                          <td className="px-8 py-6 text-sm font-bold text-slate-700">{c.job_title}</td>
                          <td className="px-8 py-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${c.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{c.status}</span>
                          </td>
                          <td className="px-8 py-6">
                            {c.ai_score !== undefined ? <span className="font-black text-blue-600">{c.ai_score}%</span> : <span className="text-slate-400 font-bold">Not Scored</span>}
                          </td>
                          <td className="px-8 py-6"><Link href={`/hiring/${c.job_id}/applicants`} className="text-blue-600 hover:underline font-bold text-sm">View Results</Link></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "analytics" && analyticsData && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div>
                  <h1 className="text-3xl font-black tracking-tight mb-2">Performance Analytics</h1>
                  <p className="text-slate-500 font-medium">Real-time candidate performance and conversion insights.</p>
               </div>

               {/* Metrics Row */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
                     <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        <Activity size={28} />
                     </div>
                     <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Avg. Interview Score</p>
                        <h3 className="text-3xl font-black">{analyticsData.performance.avg_score}%</h3>
                     </div>
                  </div>
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
                     <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <Target size={28} />
                     </div>
                     <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Highest Score</p>
                        <h3 className="text-3xl font-black">{analyticsData.performance.highest_score}%</h3>
                     </div>
                  </div>
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
                     <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                        <TrendingUp size={28} />
                     </div>
                     <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Conversion Rate</p>
                        <h3 className="text-3xl font-black">
                           {Math.round((analyticsData.funnel.shortlisted / analyticsData.funnel.applications) * 100) || 0}%
                        </h3>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Funnel */}
                  <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                    <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                       <PieChart className="text-blue-600" />
                       Hiring Funnel (Real Data)
                    </h3>
                    <div className="space-y-6">
                       {[
                         { label: 'Applications', value: analyticsData.funnel.applications, color: 'blue' },
                         { label: 'Interviews Started', value: analyticsData.funnel.interviews_started, color: 'indigo' },
                         { label: 'Interviews Completed', value: analyticsData.funnel.interviews_completed, color: 'emerald' },
                         { label: 'Shortlisted/Selected', value: analyticsData.funnel.shortlisted, color: 'amber' }
                       ].map((item, idx) => (
                         <div key={idx} className="space-y-2">
                            <div className="flex justify-between text-sm font-bold">
                               <span className="text-slate-500">{item.label}</span>
                               <span className="text-slate-900">{item.value}</span>
                            </div>
                            <div className="h-4 bg-slate-50 rounded-full overflow-hidden">
                               <div 
                                 className={`h-full bg-${item.color}-500 transition-all duration-1000`} 
                                 style={{ width: `${(item.value / analyticsData.funnel.applications) * 100 || 0}%` }}
                               ></div>
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>

                  {/* Score Distribution */}
                  <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                    <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                       <BarChart3 className="text-blue-600" />
                       Candidate Score Distribution
                    </h3>
                    <div className="flex items-end justify-between h-48 gap-2">
                       {Object.entries(analyticsData.distribution).map(([range, count]: [string, any]) => {
                          const maxCount = Math.max(...Object.values(analyticsData.distribution) as number[]);
                          const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                          return (
                            <div key={range} className="flex-1 flex flex-col items-center gap-3 group">
                               <div className="relative w-full flex items-end justify-center h-full">
                                  <div 
                                    className="w-full bg-blue-100 group-hover:bg-blue-600 transition-all duration-500 rounded-t-xl"
                                    style={{ height: `${height}%` }}
                                  ></div>
                                  <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-black py-1 px-2 rounded-lg">
                                     {count} candidates
                                  </div>
                               </div>
                               <span className="text-[10px] font-black text-slate-400 uppercase">{range}</span>
                            </div>
                          );
                       })}
                    </div>
                    <div className="mt-8 pt-8 border-t border-slate-50 text-center">
                       <p className="text-sm font-bold text-slate-500 italic">
                          Total of <span className="text-blue-600">{analyticsData.performance.total_scored}</span> candidates scored so far.
                       </p>
                    </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </main>

      {/* Post Job Modal */}
      {isPostJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsPostJobModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Post New Job Details</h2>
                <p className="text-sm text-slate-500 font-medium">Fill in the information below to start a new recruitment campaign.</p>
              </div>
              <button onClick={() => setIsPostJobModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 rounded-xl transition-all">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handlePostJob} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Job Title</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Software Engineer"
                    value={jobFormData.title}
                    onChange={(e) => setJobFormData({...jobFormData, title: e.target.value})}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold placeholder:font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Location</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Bangalore, Remote"
                    value={jobFormData.location}
                    onChange={(e) => setJobFormData({...jobFormData, location: e.target.value})}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold placeholder:font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Salary Range</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. $80,000 - $120,000"
                  value={jobFormData.salary}
                  onChange={(e) => setJobFormData({...jobFormData, salary: e.target.value})}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold placeholder:font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Job Description</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Describe the role and responsibilities..."
                  value={jobFormData.description}
                  onChange={(e) => setJobFormData({...jobFormData, description: e.target.value})}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold placeholder:font-medium resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Eligibility Criteria (AI Filters)</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="List requirements for AI to filter candidates..."
                  value={jobFormData.eligibility}
                  onChange={(e) => setJobFormData({...jobFormData, eligibility: e.target.value})}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold placeholder:font-medium resize-none"
                />
              </div>

              <div className="pt-4">
                <button 
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 hover:bg-blue-700 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Zap size={20} />
                      Publish Job Posting
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
