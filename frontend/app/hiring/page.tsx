'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Briefcase, MapPin, ArrowRight, Search, Trash2, BarChart3, Filter, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getJobs, deleteJob } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Job {
  _id: string;
  title: string;
  location: string;
  salary: string;
  description: string;
  created_at: string;
  is_active: boolean;
}

export default function HiringDashboard() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'admin' && user.role !== 'recruiter'))) {
      router.push('/');
      return;
    }
    if (token) {
      fetchJobs();
    }
  }, [token, user, authLoading]);

  const fetchJobs = async () => {
    try {
      const data = await getJobs(token!);
      setJobs(data);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobDelete = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this campaign? All candidates and data will be permanently removed.")) return;
    if (!token) return;

    try {
      await deleteJob(jobId, token);
      setJobs(jobs.filter(j => j._id !== jobId));
    } catch (error) {
      console.error("Failed to delete job:", error);
      alert("Failed to delete campaign");
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || !user || (user.role !== 'admin' && user.role !== 'recruiter')) {
    return <div className="min-h-screen flex items-center justify-center">Access Denied</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Recruitment Campaigns</h1>
          <p className="text-slate-500 text-lg font-medium">Manage your automated screening pipelines and candidate flow.</p>
        </div>
        <Link 
          href="/hiring/new-job" 
          className="px-8 py-4 rounded-2xl bg-teal-600 text-white font-bold shadow-xl shadow-teal-600/20 flex items-center gap-2 hover:bg-teal-700 transition-all"
        >
          <Plus size={20} />
          ADD NEW JOB
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by job title or location..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-600/5 focus:border-teal-600 transition-all shadow-sm"
          />
        </div>
        <button className="px-6 py-4 rounded-2xl bg-white border border-slate-200 flex items-center gap-2 font-medium hover:bg-slate-50 transition-colors shadow-sm">
          <Filter size={20} />
          Filters
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredJobs.map((job) => (
            <div 
              key={job._id}
              className="bg-white p-8 rounded-[2rem] border border-slate-100 hover:shadow-2xl hover:shadow-teal-600/5 transition-all group flex flex-col h-full shadow-sm"
            >
              <div className="mb-6 flex justify-between items-start">
                <div className="p-4 bg-teal-50 rounded-2xl text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <Briefcase size={24} />
                </div>
                <div className="flex gap-2">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${job.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                    {job.is_active ? 'Active' : 'Closed'}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      handleJobDelete(job._id);
                    }}
                    className="p-1.5 rounded-lg text-slate-300 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    title="Delete Campaign"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold tracking-tight mb-2 group-hover:text-teal-600 transition-colors">{job.title}</h3>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-slate-500">
                  <MapPin size={16} />
                  <span className="text-sm font-semibold">{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Calendar size={16} />
                  <span className="text-sm font-semibold">Posted on {new Date(job.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-auto flex flex-col gap-3">
                <Link 
                  href={`/hiring/${job._id}/analytics`}
                  className="w-full py-3 rounded-xl border border-teal-600/20 bg-white text-teal-600 font-bold flex items-center justify-center gap-2 hover:bg-teal-50 transition-all"
                >
                  <BarChart3 size={18} />
                  View Analytics
                </Link>
                <Link 
                  href={`/hiring/${job._id}/applicants`}
                  className="w-full py-4 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-teal-700 transition-all group/btn shadow-lg shadow-teal-600/10"
                >
                  View Applicants
                  <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
          <div className="bg-teal-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search size={32} className="text-teal-600/40" />
          </div>
          <h3 className="text-2xl font-bold mb-2">No jobs found</h3>
          <p className="text-slate-500 mb-8">Try adjusting your search or post a new job role.</p>
          <Link href="/hiring/new-job" className="text-teal-600 font-bold hover:underline">Add your first job &rarr;</Link>
        </div>
      )}
    </div>
  );
}
