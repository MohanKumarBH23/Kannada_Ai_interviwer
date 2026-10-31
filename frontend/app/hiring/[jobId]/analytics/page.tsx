'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, Users, CheckCircle, 
  Clock, TrendingUp, BarChart3, AlertCircle, 
  Award, BrainCircuit, Activity
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getJobAnalytics } from '@/lib/api';

interface AnalyticsData {
  total: number;
  selected: number;
  rejected: number;
  in_progress: number;
  completed: number;
  avg_score: number;
  rejection_reasons: { reason: string; count: number }[];
}

export default function AnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const { token, user, loading: authLoading } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const jobId = params.jobId as string;

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'admin' && user.role !== 'recruiter'))) {
      router.push('/');
      return;
    }
    if (token && jobId) {
      fetchAnalytics();
    }
  }, [token, jobId, user, authLoading]);

  const fetchAnalytics = async () => {
    try {
      const result = await getJobAnalytics(jobId, token!);
      setData(result);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!data) return null;

  const selectionRate = data.total > 0 ? Math.round((data.selected / data.total) * 100) : 0;
  const completionRate = data.total > 0 ? Math.round(((data.completed + data.in_progress) / data.total) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 bg-slate-50 min-h-screen">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Campaigns
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-teal-600 text-white rounded-lg">
              <BarChart3 size={20} />
            </div>
            <h1 className="text-4xl font-black tracking-tight">Recruitment Analytics</h1>
          </div>
          <p className="text-slate-500 text-lg font-medium">Real-time performance metrics for this hiring campaign.</p>
        </div>
        
        <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Activity size={18} className="text-emerald-500 animate-pulse" />
          <span className="text-sm font-bold text-slate-600">LIVE TRACKING ACTIVE</span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          icon={<Users className="text-blue-600" />} 
          label="Total Applicants" 
          value={data.total} 
          color="blue"
        />
        <StatCard 
          icon={<CheckCircle className="text-emerald-600" />} 
          label="AI Selected" 
          value={data.selected} 
          subValue={`${selectionRate}% Eligibility Rate`}
          color="emerald"
        />
        <StatCard 
          icon={<Award className="text-amber-600" />} 
          label="Avg. Interview Score" 
          value={`${data.avg_score}%`}
          subValue="Across all completed"
          color="amber"
        />
        <StatCard 
          icon={<Clock className="text-indigo-600" />} 
          label="Interviews Active" 
          value={data.in_progress} 
          subValue={`${data.completed} Already Completed`}
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Selection Funnel */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/40">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black flex items-center gap-2">
              <TrendingUp size={24} className="text-teal-600" />
              Candidate Pipeline Funnel
            </h3>
          </div>
          
          <div className="space-y-10">
            <FunnelStep 
              label="Total Candidates Ingested" 
              count={data.total} 
              percentage={100} 
              color="bg-slate-200" 
            />
            <FunnelStep 
              label="Passed AI Eligibility Filter" 
              count={data.selected} 
              percentage={selectionRate} 
              color="bg-teal-500" 
            />
            <FunnelStep 
              label="Interview Sessions Started" 
              count={data.completed + data.in_progress} 
              percentage={completionRate} 
              color="bg-emerald-500" 
            />
            <FunnelStep 
              label="Successfully Evaluated" 
              count={data.completed} 
              percentage={data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0} 
              color="bg-indigo-600" 
            />
          </div>
        </div>

        {/* Rejection Insights */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/40">
          <h3 className="text-xl font-black flex items-center gap-2 mb-8">
            <AlertCircle size={24} className="text-rose-500" />
            AI Rejection Insights
          </h3>
          
          <div className="space-y-6">
            {data.rejection_reasons.length > 0 ? (
              data.rejection_reasons.map((item, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-1 rounded">TOP REASON #{idx+1}</span>
                    <span className="text-lg font-bold text-slate-900">{item.count}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed">
                    {item.reason}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">No candidates rejected yet.</p>
              </div>
            )}
          </div>

          <div className="mt-10 p-6 rounded-3xl bg-teal-900 text-white shadow-lg relative overflow-hidden">
            <BrainCircuit className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10" />
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <BrainCircuit size={18} />
              AI Summary
            </h4>
            <p className="text-xs text-teal-100 leading-relaxed">
              Based on the {data.total} applicants, the AI identifies {selectionRate}% of candidates meet your specific requirements. The average quality score is {data.avg_score > 70 ? 'High' : 'Moderate'}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subValue, color }: { icon: any, label: string, value: string | number, subValue?: string, color: string }) {
  const colorMap: any = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    indigo: 'bg-indigo-50 text-indigo-600'
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${colorMap[color]}`}>
        {icon}
      </div>
      <p className="text-slate-500 text-sm font-bold mb-1">{label}</p>
      <h4 className="text-3xl font-black text-slate-900 mb-2">{value}</h4>
      {subValue && <p className="text-xs font-semibold text-slate-400">{subValue}</p>}
    </div>
  );
}

function FunnelStep({ label, count, percentage, color }: { label: string, count: number, percentage: number, color: string }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-sm font-black text-slate-900">{label}</p>
          <p className="text-xs font-bold text-slate-500">{count} Candidates</p>
        </div>
        <span className="text-lg font-black text-slate-900">{percentage}%</span>
      </div>
      <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-1000 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
