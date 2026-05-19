'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Search, Filter, MoreHorizontal, 
  Phone, Link as LinkIcon, MessageCircle, Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getCandidates, evaluateCandidate } from '@/lib/api';

interface Candidate {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  experience?: string;
  location?: string;
  status: string;
  selection_status?: string;
  eligibility_reason?: string;
  interview_link?: string;
  ai_score: number | null;
  ai_suitability: string | null;
  ai_summary: string | null;
  session_id?: string;
  created_at: string;
}

export default function ApplicantsPage() {
  const { jobId } = useParams();
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [evaluatingCandidateId, setEvaluatingCandidateId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'admin' && user.role !== 'recruiter'))) {
      router.push('/');
      return;
    }
    if (token) {
      fetchCandidates();
    }
  }, [jobId, token, user, authLoading]);

  const fetchCandidates = async () => {
    try {
      const data = await getCandidates(jobId as string, token!);
      setCandidates(data);
    } catch (error) {
      console.error("Failed to fetch candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = candidates.filter(cand => {
    const matchesSearch = cand.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          cand.phone.includes(searchQuery);
    const matchesStatus = statusFilter === "All" || cand.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEvaluate = async (e: React.MouseEvent, candidateId: string) => {
    e.stopPropagation();
    if (!token) return;
    setEvaluatingCandidateId(candidateId);
    try {
      await evaluateCandidate(candidateId, token);
      await fetchCandidates();
    } catch (err) {
      console.error("Evaluation failed:", err);
      alert("Failed to evaluate candidate.");
    } finally {
      setEvaluatingCandidateId(null);
    }
  };

  if (authLoading || !user || (user.role !== 'admin' && user.role !== 'recruiter')) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <button 
        onClick={() => router.push('/hiring')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Jobs
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Applicants</h1>
          <p className="text-slate-500 font-medium">Screen and manage candidates for this role.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
          <div className="text-slate-400 text-xs font-black uppercase mb-1">Total</div>
          <div className="text-3xl font-black text-slate-900">{candidates.length}</div>
        </div>
        <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl">
          <div className="text-emerald-600 text-xs font-black uppercase mb-1">Completed</div>
          <div className="text-3xl font-black text-emerald-700">{candidates.filter(c => c.status === 'Completed').length}</div>
        </div>
        <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl">
          <div className="text-blue-600 text-xs font-black uppercase mb-1">In Progress</div>
          <div className="text-3xl font-black text-blue-700">{candidates.filter(c => c.status === 'In-Progress').length}</div>
        </div>
        <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl">
          <div className="text-amber-600 text-xs font-black uppercase mb-1">Pending</div>
          <div className="text-3xl font-black text-amber-700">{candidates.filter(c => c.status === 'Pending').length}</div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search candidates..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-600/5 focus:border-teal-600 transition-all shadow-sm"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-6 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-600/5 focus:border-teal-600 transition-all font-bold text-slate-700 shadow-sm"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="In-Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50 text-slate-400 text-xs uppercase tracking-widest font-black">
                <th className="px-8 py-6">Candidate</th>
                <th className="px-8 py-6">Eligibility</th>
                <th className="px-8 py-6">Interview Status</th>
                <th className="px-8 py-6">Link / Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={4} className="py-20 text-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-600 mx-auto"></div></td></tr>
              ) : filteredCandidates.length > 0 ? (
                filteredCandidates.map((cand) => (
                  <tr 
                    key={cand._id} 
                    onClick={() => cand.status === 'completed' && cand.session_id && router.push(`/results/${cand.session_id}`)}
                    className={`hover:bg-slate-50/50 transition-colors group ${cand.status === 'completed' && cand.session_id ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-lg text-slate-900">{cand.name}</span>
                        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                          <Phone size={12} className="text-teal-600" />
                          {cand.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-2">
                        <SelectionBadge status={cand.selection_status || "Pending"} />
                        {cand.eligibility_reason && (
                          <p className="text-[10px] text-slate-400 font-medium max-w-[200px] leading-tight italic">
                            {cand.eligibility_reason}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <StatusBadge status={cand.status} />
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        {cand.interview_link && cand.selection_status === 'Selected' ? (
                          <div className="flex gap-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(cand.interview_link!);
                                alert("Link copied!");
                              }}
                              className="p-2.5 rounded-xl bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white transition-all shadow-sm"
                              title="Copy Link"
                            >
                              <LinkIcon size={18} />
                            </button>
                            <a 
                              href={`https://t.me/share/url?url=${encodeURIComponent(cand.interview_link!)}&text=${encodeURIComponent(`Hello ${cand.name}, you have been selected for the interview. Please attend here:`)}`}
                              onClick={(e) => e.stopPropagation()}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2.5 rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-600 hover:text-white transition-all shadow-sm"
                              title="Send Telegram"
                            >
                              <span className="font-bold text-xs">TG</span>
                            </a>
                          </div>
                        ) : cand.selection_status === 'Pending' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEvaluate(e, cand._id);
                            }}
                            disabled={evaluatingCandidateId === cand._id}
                            className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50"
                          >
                            {evaluatingCandidateId === cand._id ? (
                              <>
                                <Loader2 size={14} className="animate-spin" />
                                Evaluating...
                              </>
                            ) : (
                              "Evaluate Candidate"
                            )}
                          </button>
                        ) : (
                          <span className="text-slate-300 text-xs italic">No Link</span>
                        )}
                        {cand.status === 'completed' && cand.session_id && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/results/${cand.session_id}`);
                            }}
                            className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                            title="View Interview Results"
                          >
                            <ArrowLeft size={18} className="rotate-180" />
                          </button>
                        )}
                        <button 
                          onClick={(e) => e.stopPropagation()}
                          className="p-2.5 rounded-xl hover:bg-white transition-colors text-slate-300 hover:text-teal-600"
                        >
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-slate-400 font-medium">No applicants found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    "Completed": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "In-Progress": "bg-blue-100 text-blue-700 border-blue-200",
    "Pending": "bg-amber-100 text-amber-700 border-amber-200",
  };
  
  return (
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${styles[status]}`}>
      {status}
    </span>
  );
}

function SelectionBadge({ status }: { status: string }) {
  const styles: any = {
    "Selected": "bg-emerald-600 text-white border-emerald-700",
    "Rejected": "bg-rose-100 text-rose-700 border-rose-200",
    "Pending": "bg-slate-100 text-slate-600 border-slate-200",
  };
  
  return (
    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border shadow-sm ${styles[status]}`}>
      {status}
    </span>
  );
}

function SuitabilityBadge({ level }: { level: string }) {
  const styles: any = {
    "Good": "bg-emerald-500 text-white",
    "Average": "bg-slate-200 text-slate-700",
    "Not Suitable": "bg-rose-500 text-white",
  };
  
  return (
    <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 ${styles[level]}`}>
      {level}
    </div>
  );
}
