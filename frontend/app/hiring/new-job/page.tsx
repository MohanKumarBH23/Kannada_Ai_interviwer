'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Check, Briefcase, MapPin, DollarSign, 
  FileText, ListChecks, Upload, X, Info, Zap 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { bulkRecruitment, generateJobInfo } from '@/lib/api';

export default function NewJobPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [notify, setNotify] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    salary: '',
    description: '',
    requirements: '',
    eligibility: ''
  });
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, authLoading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      alert("Please upload a valid CSV file.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !file) {
      if (!file) alert("Please upload a CSV file with candidates.");
      return;
    }
    
    setLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('location', formData.location);
    data.append('salary', formData.salary);
    data.append('description', formData.description);
    data.append('requirements', formData.requirements);
    data.append('eligibility', formData.eligibility);
    data.append('notify', String(notify));
    data.append('file', file);

    try {
      const result = await bulkRecruitment(data, token);
      router.push(`/hiring/${result.job_id}/applicants`);
    } catch (error) {
      console.error("Error launching pipeline:", error);
      alert("Failed to launch recruitment pipeline");
    } finally {
      setLoading(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!formData.title || !formData.location) {
      alert("Please provide both Job Title and Location first.");
      return;
    }
    
    setIsAiLoading(true);
    try {
      const result = await generateJobInfo(formData.title, formData.location, token!);
      setFormData(prev => ({
        ...prev,
        description: result.description,
        requirements: result.requirements,
        eligibility: result.eligibility
      }));
    } catch (error) {
      console.error("AI Generation failed:", error);
      alert("Failed to generate job details. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  if (authLoading || !user || user.role !== 'admin') return null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">Launch Recruitment Campaign</h1>
            <p className="text-slate-500 text-lg font-medium">Define the role, criteria, and upload candidates to start AI screening.</p>
          </div>
          <div className="hidden md:flex flex-col items-end">
            <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-600 rounded-full font-bold text-sm">
              <Zap size={16} />
              AI Powered Pipeline
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <section className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm">1</span>
              Job Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                  <Briefcase size={16} className="text-teal-600" />
                  Job Title
                </label>
                <div className="flex gap-2">
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Delivery Executive"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-600/5 focus:border-teal-600 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAiGenerate}
                    disabled={isAiLoading || !formData.title || !formData.location}
                    className="px-4 bg-teal-50 text-teal-600 rounded-2xl border border-teal-100 hover:bg-teal-100 transition-all flex items-center justify-center disabled:opacity-50"
                    title="Generate details with AI"
                  >
                    {isAiLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-600"></div>
                    ) : (
                      <Zap size={20} />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                  <MapPin size={16} className="text-teal-600" />
                  Location
                </label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Bengaluru, Karnataka"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-600/5 focus:border-teal-600 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                <DollarSign size={16} className="text-teal-600" />
                Salary Range
              </label>
              <input 
                required
                type="text" 
                placeholder="e.g. ₹20,000 - ₹30,000 per month"
                value={formData.salary}
                onChange={(e) => setFormData({...formData, salary: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-600/5 focus:border-teal-600 transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                <FileText size={16} className="text-teal-600" />
                Job Description
              </label>
              <textarea 
                required
                rows={3}
                placeholder="Briefly describe the role responsibilities..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-600/5 focus:border-teal-600 transition-all resize-none font-medium"
              />
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm">2</span>
              Eligibility & Interview Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                  <ListChecks size={16} className="text-teal-600" />
                  Eligibility Criteria (AI Filters)
                </label>
                <textarea 
                  required
                  rows={4}
                  placeholder="e.g. Must have a valid driving license, 2+ years experience in retail, based in Bengaluru..."
                  value={formData.eligibility}
                  onChange={(e) => setFormData({...formData, eligibility: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-600/5 focus:border-teal-600 transition-all resize-none font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                  <Zap size={16} className="text-teal-600" />
                  Interview Focus Areas
                </label>
                <textarea 
                  required
                  rows={4}
                  placeholder="What specific skills or scenarios should the AI Interviewer test for?"
                  value={formData.requirements}
                  onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-600/5 focus:border-teal-600 transition-all resize-none font-medium"
                />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm">3</span>
              Candidates & Dispatch
            </h2>
            
            <div className="p-8 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="flex flex-col items-center text-center">
                {file ? (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                      <Check size={32} />
                    </div>
                    <span className="font-bold text-lg text-slate-900 mb-1">{file.name}</span>
                    <span className="text-sm text-slate-500 mb-4">{(file.size / 1024).toFixed(1)} KB</span>
                    <button 
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-rose-600 font-bold text-sm flex items-center gap-1 hover:underline"
                    >
                      <X size={14} /> Remove File
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-4">
                      <Upload size={32} />
                    </div>
                    <h3 className="font-bold text-lg mb-1">Upload Candidate CSV</h3>
                    <p className="text-slate-500 mb-6 max-w-sm">
                      Upload a CSV file containing columns for <code className="bg-slate-100 px-1 rounded">name</code>, <code className="bg-slate-100 px-1 rounded">phone</code>, and <code className="bg-slate-100 px-1 rounded">experience</code>.
                    </p>
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold hover:shadow-md transition-all"
                    >
                      Browse Files
                    </button>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv"
                  className="hidden" 
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-6 bg-slate-900 rounded-3xl text-white shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-500/20 rounded-2xl flex items-center justify-center">
                  <Zap size={24} className="text-teal-400" />
                </div>
                <div>
                  <h3 className="font-bold">Automated Notifications</h3>
                  <p className="text-xs text-slate-400">Selected candidates will receive interview links instantly.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={notify}
                  onChange={(e) => setNotify(e.target.checked)}
                />
                <div className="w-14 h-8 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-teal-500"></div>
              </label>
            </div>
          </section>

          <div className="pt-8">
            <button 
              disabled={loading}
              type="submit" 
              className="w-full py-6 rounded-3xl bg-teal-600 text-white text-xl font-black shadow-2xl shadow-teal-600/40 hover:bg-teal-700 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-white"></div>
                  <span>Processing & Screening...</span>
                </>
              ) : (
                <>
                  <Zap size={28} />
                  Launch Pipeline & Notify Candidates
                </>
              )}
            </button>
            <p className="text-center text-slate-400 text-sm mt-4 flex items-center justify-center gap-2">
              <Info size={14} />
              AI will screen each candidate based on your eligibility criteria.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
