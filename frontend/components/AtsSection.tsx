import React, { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { analyzeResumeATS } from '@/lib/api';
import { FileText, UploadCloud, CheckCircle, AlertCircle, Sparkles, Layout } from 'lucide-react';

export default function AtsSection({ onNavigate }: { onNavigate?: (tab: "interview" | "profile" | "ats" | "resume") => void }) {
  const { user, token, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeFile || !token) return;
    setLoading(true);
    setError('');

    try {
      const updatedUser = await analyzeResumeATS(resumeFile, token);
      updateUser(updatedUser);
      setResumeFile(null); // Clear after upload
      if (fileInputRef.current) fileInputRef.current.value = '';
      setShowUpload(false);
    } catch (err: any) {
      // Try to extract a meaningful error message from the API response
      let message = 'ರೆಸ್ಯೂಮ್ ವಿಶ್ಲೇಷಿಸಲು ವಿಫಲವಾಗಿದೆ (Failed to analyze resume)';
      if (err?.message) {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed?.detail) message = parsed.detail;
        } catch {
          message = err.message;
        }
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const hasAtsScore = user.ats_score !== undefined && user.ats_score !== null;
  const hasSimpleResume = user.experience !== undefined && user.experience !== null;

  return (
    <div className="space-y-12">
      <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-8 md:p-10 border border-slate-100 animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-[5rem] -mr-10 -mt-10 opacity-50"></div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 relative z-10">
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-4">
            <div className="p-3 bg-teal-600 rounded-2xl shadow-lg shadow-teal-600/20">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <span>ATS ಸ್ಕೋರ್ (ATS Score)</span>
          </h2>
          {hasAtsScore && !showUpload && (
            <button
              onClick={() => setShowUpload(true)}
              className="text-sm font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-5 py-2.5 rounded-xl transition-all border border-teal-100"
            >
              ಮತ್ತೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ (Re-upload)
            </button>
          )}
        </div>

        {error && (
          <div className="mb-8 p-5 bg-rose-50 text-rose-600 rounded-2xl text-sm flex items-start gap-3 border border-rose-100 shadow-sm animate-shake">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {(!hasAtsScore || showUpload) ? (
          <div className="space-y-10">
            <div className="space-y-4">
              <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-teal-600" />
                ನಿಮ್ಮ ರೆಸ್ಯೂಮ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ (Upload PDF)
              </label>
              <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                <div className="flex-1 relative group">
                  <input
                    type="file"
                    accept=".pdf"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:ring-4 focus:ring-teal-600/5 focus:border-teal-600 transition-all outline-none file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer shadow-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAnalyze}
                    disabled={!resumeFile || loading}
                    className="flex-1 sm:flex-none relative flex items-center justify-center gap-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white py-4 px-10 rounded-2xl font-black transition-all disabled:opacity-70 shadow-xl shadow-teal-600/20 hover:scale-[1.02] active:scale-[0.98] overflow-hidden group min-w-[180px]"
                  >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                    {loading ? (
                      <span className="animate-pulse">ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...</span>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>ವಿಶ್ಲೇಷಿಸಿ (Analyze)</span>
                      </>
                    )}
                  </button>
                  {showUpload && (
                    <button
                      onClick={() => setShowUpload(false)}
                      className="px-6 py-4 rounded-2xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all font-black uppercase text-xs tracking-widest"
                    >
                      ರದ್ದು
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {!hasAtsScore && !showUpload && (
              <div className="text-center p-16 border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/30 group transition-all hover:bg-slate-50 hover:border-teal-200">
                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all">
                  <FileText className="w-12 h-12 text-slate-200 group-hover:text-teal-500" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">ನಿಮ್ಮ ATS ಸ್ಕೋರ್ ಪಡೆಯಲು ರೆಸ್ಯೂಮ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.</h3>
                <p className="text-slate-400 font-medium">(Upload a resume to get your ATS score.)</p>
                
                <div className="mt-10 pt-10 border-t border-slate-100 flex flex-col items-center">
                  <p className="text-sm font-bold text-slate-500 mb-4">ಅಥವಾ (OR)</p>
                  <button 
                    onClick={() => onNavigate?.("resume")}
                    className="flex items-center gap-3 px-8 py-4 bg-white text-teal-600 border-2 border-teal-100 rounded-2xl font-black hover:bg-teal-50 transition-all shadow-sm"
                  >
                    <Layout className="w-5 h-5" />
                    ನನ್ನದೇ ಆದ ಸರಳ ರೆಸ್ಯೂಮ್ ತಯಾರಿಸಿ (Create My Simple Resume)
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-50/50 rounded-[3rem] p-10 border border-slate-100/50 space-y-12 relative overflow-hidden">
            <div className="flex flex-col items-center justify-center gap-6 relative z-10">
              <div className="relative flex items-center justify-center group">
                <div className="absolute inset-0 bg-teal-400 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                <svg className="w-48 h-48 transform -rotate-90 relative z-10 drop-shadow-2xl">
                  <circle
                    cx="96"
                    cy="96"
                    r="84"
                    className="stroke-current text-white shadow-inner"
                    strokeWidth="16"
                    fill="none"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="84"
                    className={`stroke-current ${
                      (user.ats_score || 0) >= 80 ? 'text-teal-500' : 
                      (user.ats_score || 0) >= 50 ? 'text-emerald-500' : 'text-rose-500'
                    } transition-all duration-1000 ease-out`}
                    strokeWidth="16"
                    fill="none"
                    strokeDasharray="527.78"
                    strokeDashoffset={527.78 - (527.78 * (user.ats_score || 0)) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center z-20">
                  <span className="text-5xl font-black text-slate-900 leading-none tracking-tighter">
                    {user.ats_score || 0}%
                  </span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">ATS Score</span>
                </div>
              </div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">ನಿಮ್ಮ ರೆಸ್ಯೂಮ್ ಸಾಮರ್ಥ್ಯ (Resume Strength)</p>
            </div>

            <div className="space-y-8">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-3">
                <CheckCircle className="w-4 h-4 text-teal-500" />
                ಸಲಹೆಗಳು ಮತ್ತು ಸುಧಾರಣೆಗಳು (Feedback)
              </h3>
              
              <div className="flex flex-col gap-10 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50/50 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
                
                <div className="space-y-6 relative z-10">
                  <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-lg border border-teal-100">ಕನ್ನಡದಲ್ಲಿ (Kannada)</span>
                  <div className="space-y-4">
                    {(user.ats_feedback?.split('|||')[0]?.trim() || 'ಯಾವುದೇ ಪ್ರತಿಕ್ರಿಯೆ ಲಭ್ಯವಿಲ್ಲ').split('\n').map((point, index) => (
                      point.trim() && (
                        <p key={index} className="text-slate-700 leading-[1.7] text-base font-medium flex gap-4">
                          <span className="w-6 h-6 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">{index + 1}</span>
                          {point.replace(/^\d+\.\s*/, '').trim()}
                        </p>
                      )
                    ))}
                  </div>
                </div>
                
                <div className="h-px bg-slate-100 w-full"></div>
                
                <div className="space-y-6 relative z-10">
                  <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-lg border border-teal-100">In English</span>
                  <div className="space-y-4">
                    {(user.ats_feedback?.split('|||')[1]?.trim() || 'No feedback available').split('\n').map((point, index) => (
                      point.trim() && (
                        <p key={index} className="text-slate-600 leading-[1.7] text-base font-medium flex gap-4">
                          <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">{index + 1}</span>
                          {point.replace(/^\d+\.\s*/, '').trim()}
                        </p>
                      )
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
