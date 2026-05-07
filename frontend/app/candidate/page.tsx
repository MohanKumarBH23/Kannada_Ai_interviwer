"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { startInterview, generateResume, updateProfile, uploadProfilePicture } from "@/lib/api";
import { 
  Sparkles, Briefcase, GraduationCap, FileText, 
  LogIn, LogOut, User as UserIcon, MessageSquare, 
  RefreshCw, Download, X, Save, MapPin, Phone, 
  Award, Loader2, CheckCircle2, Camera, UserCircle
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function CandidateDashboard() {
  const router = useRouter();
  const { user, logout, token, loading: authLoading, login } = useAuth();
  const [jobRole, setJobRole] = useState("Software Engineer");
  const [difficulty, setDifficulty] = useState("medium");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [error, setError] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Wizard State
  const [wizardData, setWizardData] = useState({
    phone: "",
    location: "",
    skills: "",
    experience: "",
    bio: ""
  });

  const jobCategories = [
    {
      name: "ತಾಂತ್ರಿಕ ಮತ್ತು ಕಚೇರಿ (Technical & Office)",
      roles: ["Software Engineer", "Data Entry Operator", "Graphic Designer", "Accountant", "Receptionist"]
    },
    {
      name: "ಬ್ಲೂ ಕಾಲರ್ ಮತ್ತು ಕುಶಲ ಕೆಲಸ (Blue Collar & Skilled)",
      roles: ["Driver", "Electrician", "Plumber", "Mechanic", "Carpenter", "Security Guard"]
    },
    {
      name: "ಸೇವೆ ಮತ್ತು ಡೆಲಿವರಿ (Service & Delivery)",
      roles: ["Delivery Boy", "Cook/Chef", "Housekeeping", "Waiter", "Sales Executive", "Customer Support"]
    }
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    } else if (user) {
      setWizardData({
        phone: user.phone || "",
        location: user.location || "",
        skills: (user.skills || []).join(", "),
        experience: user.experience || "",
        bio: user.bio || ""
      });
      setPhotoPreview(user.profile_picture || null);
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);

    try {
      const result = await uploadProfilePicture(file, token);
      login(token, { ...user!, profile_picture: result.profile_picture }, "/candidate");
    } catch (err) {
      setError("Failed to upload photo.");
    }
  };

  const handleBuildResume = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError("");
    try {
      // 1. Update profile first with the wizard data
      const dataToUpdate = {
        ...wizardData,
        skills: wizardData.skills.split(",").map(s => s.trim()).filter(s => s),
      };
      const updatedUser = await updateProfile(dataToUpdate, token!);
      
      // 2. Then generate resume
      const result = await generateResume(token!);
      
      // 3. Update local state
      login(token!, { ...updatedUser, resume_text: result.resume_text }, "/candidate");
      setShowWizard(false);
    } catch (err: any) {
      setError("Failed to build resume. Please check your details.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadResume = () => {
    if (!user?.resume_text) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const photoHtml = user.profile_picture 
        ? `<img src="${user.profile_picture}" style="width: 120px; height: 120px; object-fit: cover; border-radius: 20px; border: 4px solid #0d9488; margin-right: 30px;">`
        : '';

      printWindow.document.write(`
        <html>
          <head>
            <title>Resume - ${user.name}</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; padding: 50px; color: #1e293b; max-width: 900px; margin: 0 auto; }
              .header { display: flex; align-items: center; border-bottom: 4px solid #0d9488; padding-bottom: 30px; margin-bottom: 40px; }
              .header-content h1 { margin: 0; color: #0d9488; font-size: 3em; text-transform: uppercase; font-weight: 900; line-height: 1; }
              .header-content p { margin: 5px 0 0; font-size: 1.2em; color: #64748b; font-weight: 600; }
              .section { margin-bottom: 40px; }
              .section-title { font-weight: 900; font-size: 1.4em; text-transform: uppercase; color: #0d9488; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; }
              pre { white-space: pre-wrap; font-family: inherit; font-size: 1.2em; color: #334155; }
              @media print { body { padding: 20px; } .header { border-bottom-width: 2px; } }
            </style>
          </head>
          <body>
            <div class="header">
              ${photoHtml}
              <div class="header-content">
                <h1>${user.name}</h1>
                <p>${user.email} | ${user.phone || ''}</p>
                <p>${user.location || ''}</p>
              </div>
            </div>
            <div class="section">
              <pre>${user.resume_text}</pre>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const session = await startInterview(jobRole, difficulty, resumeFile, token || undefined);
      router.push(`/interview/${session._id || session.id}`);
    } catch (err) {
      setError("Failed to start interview. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 sm:p-12">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center">
            <div className="relative mb-4 group cursor-pointer" onClick={() => photoInputRef.current?.click()}>
              {user.profile_picture ? (
                <img 
                  src={user.profile_picture} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-3xl object-cover shadow-lg shadow-teal-600/20 transform group-hover:scale-105 transition-all"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl flex items-center justify-center text-white text-4xl font-black shadow-lg shadow-teal-600/20 transform -rotate-3 group-hover:rotate-0 transition-transform">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-xl shadow-md flex items-center justify-center text-teal-600 border border-slate-100 group-hover:bg-teal-600 group-hover:text-white transition-all">
                <Camera size={16} />
              </div>
              <input type="file" ref={photoInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{user.name}</h2>
            <p className="text-slate-500 font-bold text-sm mb-6">{user.email}</p>
            <div className="w-full space-y-3">
              <Link
                href="/profile"
                className="w-full py-3.5 px-6 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 border border-slate-200"
              >
                <UserIcon size={18} />
                Edit Profile
              </Link>
              <button
                onClick={logout}
                className="w-full py-3.5 px-6 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>

          {/* AI Resume Card */}
          <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">AI Resume</h3>
             </div>
             
             {user.resume_text ? (
               <div className="space-y-4">
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 font-medium line-clamp-4 italic leading-relaxed">
                   "{user.resume_text}"
                 </div>
                 <div className="flex flex-col gap-2">
                   <button 
                    onClick={handleDownloadResume}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-teal-600 text-white rounded-xl text-sm font-black shadow-lg shadow-teal-600/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
                   >
                     <Download size={16} />
                     Download Resume (PDF)
                   </button>
                   <button 
                    onClick={() => setShowWizard(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all"
                   >
                     <RefreshCw size={16} />
                     Build New Resume
                   </button>
                 </div>
               </div>
             ) : (
               <div className="space-y-4">
                 <p className="text-xs text-slate-500 font-bold leading-relaxed">
                   You don't have an AI resume yet. Fill in your details and let AI build one for you!
                 </p>
                 <button 
                  onClick={() => setShowWizard(true)}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-teal-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-teal-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                 >
                   <Sparkles size={18} />
                   Build My AI Resume
                 </button>
               </div>
             )}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 p-10 sm:p-16 border border-slate-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-teal-600/5">
               <MessageSquare size={120} />
            </div>
            
            <div className="flex items-center gap-4 mb-10 relative z-10">
              <div className="w-16 h-16 bg-teal-50 rounded-3xl flex items-center justify-center text-teal-600 shadow-sm">
                <MessageSquare size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">ಹೊಸ ಸಂದರ್ಶನ</h1>
                <p className="text-slate-500 font-black text-xl">(New AI Interview)</p>
              </div>
            </div>

            <form onSubmit={handleStart} className="space-y-8 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">ಉದ್ಯೋಗದ ಪಾತ್ರ (Job Role)</label>
                  <div className="relative">
                    <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <select
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-teal-600/5 focus:border-teal-600 transition-all font-black text-slate-900 appearance-none cursor-pointer text-lg shadow-sm"
                    >
                      {jobCategories.map(cat => (
                        <optgroup key={cat.name} label={cat.name}>
                          {cat.roles.map(role => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">ಕಷ್ಟದ ಮಟ್ಟ (Difficulty)</label>
                  <div className="grid grid-cols-3 gap-4">
                    {['easy', 'medium', 'hard'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setDifficulty(level)}
                        className={`py-5 rounded-[1.5rem] font-black capitalize transition-all border-2 ${difficulty === level ? 'bg-teal-600 text-white border-teal-600 shadow-xl shadow-teal-600/20' : 'bg-white text-slate-500 border-slate-100 hover:border-teal-600 hover:bg-teal-50/30'}`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">ರೆಸ್ಯೂಮ್ (Resume Selection)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Upload Card */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-6 border-2 border-dashed rounded-[2rem] transition-all cursor-pointer flex items-center gap-4 ${resumeFile ? 'border-teal-600 bg-teal-50/50' : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-teal-400'}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${resumeFile ? 'bg-teal-600 text-white' : 'bg-white text-slate-400 shadow-sm'}`}>
                      <FileText size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-900 truncate">{resumeFile ? resumeFile.name : 'Upload PDF'}</p>
                      <p className="text-xs font-bold text-slate-500">{resumeFile ? 'File selected' : 'Manual upload'}</p>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={(e) => setResumeFile(e.target.files?.[0] || null)} accept=".pdf" className="hidden" />
                  </div>

                  {/* Use AI Resume Card */}
                  <div 
                    className={`p-6 border-2 rounded-[2rem] transition-all flex items-center gap-4 ${user.resume_text && !resumeFile ? 'border-teal-600 bg-teal-50/50' : 'border-slate-100 bg-slate-50/30 opacity-50'}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${user.resume_text && !resumeFile ? 'bg-teal-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                      <Sparkles size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-900">Use AI Resume</p>
                      <p className="text-xs font-bold text-slate-500">{user.resume_text ? 'Ready to use' : 'Not built yet'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {error && <div className="text-rose-600 text-sm font-black bg-rose-50 p-5 rounded-2xl border border-rose-100 flex items-center gap-3">
                 <X size={20} />
                 {error}
              </div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-teal-600 text-white rounded-[2rem] font-black text-2xl shadow-2xl shadow-teal-600/30 hover:bg-teal-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4"
              >
                {loading ? <Loader2 className="animate-spin" /> : <MessageSquare size={28} />}
                {loading ? "ಲೋಡ್ ಆಗುತ್ತಿದೆ..." : "ಸಂದರ್ಶನ ಪ್ರಾರಂಭಿಸಿ (Start)"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Resume Builder Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-10">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => !isGenerating && setShowWizard(false)}></div>
           <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              <div className="p-8 sm:p-10 border-b border-slate-100 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center">
                       <Sparkles size={24} />
                    </div>
                    <div>
                       <h2 className="text-2xl font-black text-slate-900 tracking-tight">AI Resume Builder</h2>
                       <p className="text-slate-500 font-bold text-sm">Tell us about yourself to build your resume.</p>
                    </div>
                 </div>
                 <button onClick={() => setShowWizard(false)} className="p-2 text-slate-400 hover:text-slate-900 transition-all">
                    <X size={24} />
                 </button>
              </div>

              <form onSubmit={handleBuildResume} className="flex-1 overflow-y-auto p-8 sm:p-10 space-y-6">
                 {/* Photo Upload Section */}
                 <div className="flex flex-col items-center gap-4 mb-6">
                    <div className="relative group cursor-pointer" onClick={() => photoInputRef.current?.click()}>
                       {photoPreview ? (
                         <img src={photoPreview} alt="Preview" className="w-32 h-32 rounded-[2rem] object-cover shadow-xl border-4 border-white ring-4 ring-teal-50" />
                       ) : (
                         <div className="w-32 h-32 rounded-[2rem] bg-slate-50 border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-teal-400 hover:bg-teal-50 transition-all">
                            <Camera size={32} />
                            <span className="text-[10px] font-black uppercase tracking-widest mt-1">Add Photo</span>
                         </div>
                       )}
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">A professional photo makes your resume stand out</p>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Location</label>
                       <div className="relative">
                          <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            type="text" 
                            required
                            placeholder="City, State"
                            value={wizardData.location}
                            onChange={(e) => setWizardData({...wizardData, location: e.target.value})}
                            className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-600/5 focus:border-teal-600 outline-none font-bold text-slate-900 transition-all shadow-sm"
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                       <div className="relative">
                          <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            type="tel" 
                            required
                            placeholder="+91 00000 00000"
                            value={wizardData.phone}
                            onChange={(e) => setWizardData({...wizardData, phone: e.target.value})}
                            className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-600/5 focus:border-teal-600 outline-none font-bold text-slate-900 transition-all shadow-sm"
                          />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Your Skills</label>
                    <div className="relative">
                       <Award size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input 
                         type="text" 
                         required
                         placeholder="e.g. Driving, Cooking, Security (comma separated)"
                         value={wizardData.skills}
                         onChange={(e) => setWizardData({...wizardData, skills: e.target.value})}
                         className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-600/5 focus:border-teal-600 outline-none font-bold text-slate-900 transition-all shadow-sm"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Work Experience</label>
                    <textarea 
                      rows={3}
                      required
                      placeholder="e.g. 5 years experience as heavy vehicle driver..."
                      value={wizardData.experience}
                      onChange={(e) => setWizardData({...wizardData, experience: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-600/5 focus:border-teal-600 outline-none font-bold text-slate-900 transition-all resize-none shadow-sm"
                    />
                 </div>

                 <div className="pt-4 flex flex-col sm:flex-row gap-4">
                    <button 
                      type="submit"
                      disabled={isGenerating}
                      className="flex-1 py-5 bg-teal-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-teal-600/20 hover:bg-teal-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                      {isGenerating ? 'Building your resume...' : 'Build My Resume Now'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowWizard(false)}
                      className="px-8 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black text-lg hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
