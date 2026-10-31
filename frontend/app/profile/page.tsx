"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { updateProfile, uploadProfilePicture } from "@/lib/api";
import { 
  User, Mail, Phone, MapPin, Briefcase, 
  Award, Save, Loader2, ArrowLeft, Languages, 
  Download, Camera
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, token, loading: authLoading, login } = useAuth();
  const router = useRouter();
  const photoInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    experience: "",
    skills: "",
    bio: "",
    languages: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/");
      } else {
        setFormData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          location: user.location || "",
          experience: user.experience || "",
          skills: (user.skills || []).join(", "),
          bio: user.bio || "",
          languages: (user.languages || []).join(", ")
        });
        setPhotoPreview(user.profile_picture || null);
      }
    }
  }, [user, authLoading]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setIsUploading(true);
    setError("");

    try {
      const result = await uploadProfilePicture(file, token);
      login(token, { ...user!, profile_picture: result.profile_picture }, "/profile");
      setPhotoPreview(result.profile_picture);
    } catch (err) {
      setError("Failed to upload profile picture.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsSuccess(false);
    setError("");

    try {
      const dataToSubmit = {
        ...formData,
        skills: formData.skills.split(",").map(s => s.trim()).filter(s => s),
        languages: formData.languages.split(",").map(l => l.trim()).filter(l => l)
      };
      
      const updatedUser = await updateProfile(dataToSubmit, token!);
      login(token!, { ...updatedUser, profile_picture: photoPreview || undefined }, "/profile");
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadProfileAsResume = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const photoHtml = photoPreview 
        ? `<img src="${photoPreview}" style="width: 140px; height: 140px; object-fit: cover; border-radius: 24px; border: 4px solid #0d9488; margin-right: 30px;">`
        : '';

      const skillsList = formData.skills.split(',').map(s => `<li>${s.trim()}</li>`).join('');
      const languagesList = formData.languages.split(',').map(l => `<li>${l.trim()}</li>`).join('');

      printWindow.document.write(`
        <html>
          <head>
            <title>Resume - ${formData.name}</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; padding: 50px; color: #1e293b; max-width: 900px; margin: 0 auto; }
              .header { display: flex; align-items: center; border-bottom: 4px solid #0d9488; padding-bottom: 30px; margin-bottom: 40px; }
              .header-info h1 { margin: 0; color: #0d9488; font-size: 3em; text-transform: uppercase; font-weight: 900; line-height: 1; }
              .header-info p { margin: 5px 0 0; font-size: 1.1em; color: #64748b; font-weight: 600; }
              .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 40px; margin-top: 20px; }
              .section { margin-bottom: 35px; }
              .section-title { font-weight: 900; font-size: 1.3em; text-transform: uppercase; color: #0d9488; margin-bottom: 12px; border-bottom: 2px solid #f1f5f9; padding-bottom: 5px; }
              .content { font-size: 1.1em; color: #334155; }
              ul { padding-left: 20px; margin-top: 5px; }
              li { margin-bottom: 5px; font-weight: 600; }
              @media print { body { padding: 20px; } .header { border-bottom-width: 2px; } }
            </style>
          </head>
          <body>
            <div class="header">
              ${photoHtml}
              <div class="header-info">
                <h1>${formData.name}</h1>
                <p>${formData.email}</p>
                <p>${formData.phone} | ${formData.location}</p>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Professional Summary</div>
              <div class="content">${formData.bio || 'No summary provided.'}</div>
            </div>

            <div class="grid">
              <div class="section">
                <div class="section-title">Work Experience</div>
                <div class="content" style="white-space: pre-wrap;">${formData.experience || 'No experience listed.'}</div>
              </div>

              <div class="section">
                <div class="section-title">Key Skills</div>
                <ul class="content">${skillsList || '<li>No skills listed.</li>'}</ul>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Languages</div>
              <ul class="content" style="display: flex; gap: 20px; list-style: none; padding: 0;">
                ${languagesList.replace(/<li>/g, '<li style="background: #f1f5f9; padding: 5px 15px; border-radius: 10px;">') || 'No languages listed.'}
              </ul>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
      </div>
    );
  }

  const isCandidate = user.role === 'user' || user.role === 'candidate';

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link 
            href={isCandidate ? "/candidate" : "/recruiter"} 
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-all"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>
          <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isCandidate ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700'}`}>
            {user.role} Profile
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100 mb-8">
          <div className={`h-32 bg-gradient-to-r ${isCandidate ? 'from-teal-600 to-emerald-600' : 'from-blue-600 to-indigo-600'}`}></div>
          
          <div className="px-10 pb-10">
            <div className="relative -mt-16 mb-8 flex flex-col md:flex-row md:items-end gap-6">
              <div 
                className="relative group cursor-pointer"
                onClick={() => photoInputRef.current?.click()}
              >
                <div className="w-32 h-32 rounded-[2rem] bg-white p-2 shadow-xl overflow-hidden relative">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile" className="w-full h-full rounded-[1.5rem] object-cover" />
                  ) : (
                    <div className={`w-full h-full rounded-[1.5rem] ${isCandidate ? 'bg-teal-50 text-teal-600' : 'bg-blue-50 text-blue-600'} flex items-center justify-center text-4xl font-black`}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    {isUploading ? <Loader2 className="animate-spin" /> : <Camera size={24} />}
                  </div>
                </div>
                <input type="file" ref={photoInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{user.name}</h1>
                <p className="text-slate-500 font-medium">{user.email}</p>
              </div>
              <div className="flex gap-3">
                 <button 
                  onClick={handleDownloadProfileAsResume}
                  className={`flex items-center gap-2 px-6 py-3 ${isCandidate ? 'bg-teal-600 shadow-teal-600/20' : 'bg-blue-600 shadow-blue-600/20'} text-white rounded-xl font-bold hover:scale-[1.02] transition-all shadow-lg`}
                 >
                   <Download size={18} />
                   Download Resume (PDF)
                 </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Details */}
                <div className="space-y-6">
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <User size={20} className={isCandidate ? 'text-teal-600' : 'text-blue-600'} />
                    Personal Information
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-600/5 focus:border-teal-600 transition-all outline-none font-bold text-slate-900 shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                      <div className="relative group">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                        <input 
                          type="email" 
                          value={formData.email}
                          disabled={true}
                          className="w-full pl-12 pr-5 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl outline-none font-bold text-slate-500 cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Phone Number</label>
                      <div className="relative group">
                        <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                        <input 
                          type="tel" 
                          placeholder="e.g. +91 9876543210"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-600/5 focus:border-teal-600 transition-all outline-none font-bold text-slate-900 shadow-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Location</label>
                      <div className="relative group">
                        <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                        <input 
                          type="text" 
                          placeholder="e.g. Bangalore, Karnataka"
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-600/5 focus:border-teal-600 transition-all outline-none font-bold text-slate-900 shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Details */}
                <div className="space-y-6">
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Briefcase size={20} className={isCandidate ? 'text-teal-600' : 'text-blue-600'} />
                    Work & Skills
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Work Experience</label>
                      <textarea 
                        rows={2}
                        placeholder="e.g. 2 years as Driver"
                        value={formData.experience}
                        onChange={(e) => setFormData({...formData, experience: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-600/5 focus:border-teal-600 transition-all outline-none font-bold text-slate-900 shadow-sm resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Skills (Comma separated)</label>
                      <div className="relative group">
                        <Award size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                        <input 
                          type="text" 
                          placeholder="e.g. Driving, Mechanics"
                          value={formData.skills}
                          onChange={(e) => setFormData({...formData, skills: e.target.value})}
                          className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-600/5 focus:border-teal-600 transition-all outline-none font-bold text-slate-900 shadow-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Languages</label>
                      <div className="relative group">
                        <Languages size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                        <input 
                          type="text" 
                          placeholder="e.g. Kannada, English"
                          value={formData.languages}
                          onChange={(e) => setFormData({...formData, languages: e.target.value})}
                          className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-600/5 focus:border-teal-600 transition-all outline-none font-bold text-slate-900 shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Bio / About Me</label>
                <textarea 
                  rows={3}
                  placeholder="Tell us about your background and goals..."
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-600/5 focus:border-teal-600 transition-all outline-none font-bold text-slate-900 shadow-sm resize-none"
                />
              </div>

              {error && (
                <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold border border-rose-100">
                  {error}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 py-4 ${isCandidate ? 'bg-teal-600 shadow-teal-600/20' : 'bg-blue-600 shadow-blue-600/20'} text-white rounded-2xl font-black text-xl shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-50`}
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                  {isSuccess ? 'Profile Updated!' : 'Save & Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
