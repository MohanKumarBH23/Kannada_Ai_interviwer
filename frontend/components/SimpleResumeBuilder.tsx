import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updateProfile } from '@/lib/api';
import { User, Phone, MapPin, Briefcase, Award, Languages, Camera, Save, X, Sparkles, FileText } from 'lucide-react';

export default function SimpleResumeBuilder({ onComplete }: { onComplete: () => void }) {
  const { user, token, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    experience: user?.experience || '',
    skills: user?.skills?.join(', ') || '',
    languages: user?.languages?.join(', ') || '',
    profile_picture: user?.profile_picture || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profile_picture: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setError('');

    const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s !== '');
    const languagesArray = formData.languages.split(',').map(l => l.trim()).filter(l => l !== '');

    // Construct resume text for ATS and interview
    const resumeText = `
Name: ${formData.name}
Phone: ${formData.phone}
Location: ${formData.location}
Experience: ${formData.experience}
Skills: ${skillsArray.join(', ')}
Languages: ${languagesArray.join(', ')}
    `.trim();

    try {
      const updatedUser = await updateProfile({
        ...formData,
        skills: skillsArray,
        languages: languagesArray,
        resume_text: resumeText, // Save as resume text so it can be used for ATS/Interview
      }, token);
      updateUser(updatedUser);
      onComplete();
    } catch (err) {
      setError('ರೆಸ್ಯೂಮ್ ಉಳಿಸಲು ವಿಫಲವಾಗಿದೆ (Failed to save resume)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-teal-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-teal-50 rounded-2xl border border-teal-100 shadow-sm">
          <Sparkles className="w-8 h-8 text-teal-600" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            ಸರಳ ರೆಸ್ಯೂಮ್ ಬಿಲ್ಡರ್ (Simple Resume Builder)
          </h2>
          <p className="text-slate-500 font-medium mt-1">ಕೆಲವೇ ನಿಮಿಷಗಳಲ್ಲಿ ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಸಿದ್ಧಪಡಿಸಿ.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-3 border border-red-100 animate-shake">
          <X className="w-5 h-5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Picture */}
        <div className="md:col-span-2 flex flex-col items-center justify-center p-8 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 hover:border-teal-300 transition-colors group cursor-pointer relative overflow-hidden">
          {formData.profile_picture ? (
            <div className="relative group/img">
              <img 
                src={formData.profile_picture} 
                alt="Profile" 
                className="w-32 h-32 rounded-3xl object-cover shadow-xl border-4 border-white"
              />
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, profile_picture: '' })}
                className="absolute -top-2 -right-2 bg-rose-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover/img:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                <Camera className="w-8 h-8 text-slate-300 group-hover:text-teal-500" />
              </div>
              <p className="text-sm font-bold text-slate-600">ನಿಮ್ಮ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ (Upload Photo)</p>
            </>
          )}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>

        {/* Personal Details */}
        <div className="space-y-6">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <User className="w-4 h-4" /> ವೈಯಕ್ತಿಕ ವಿವರಗಳು (Personal)
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">ಹೆಸರು (Name)</label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-4 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:ring-4 focus:ring-teal-50 outline-none focus:border-teal-500 transition-all shadow-sm"
                  placeholder="ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">ಫೋನ್ ಸಂಖ್ಯೆ (Phone)</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:ring-4 focus:ring-teal-50 outline-none focus:border-teal-500 transition-all shadow-sm"
                  placeholder="+91 XXXXXXXXXX"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">ಸ್ಥಳ (Location)</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:ring-4 focus:ring-teal-50 outline-none focus:border-teal-500 transition-all shadow-sm"
                  placeholder="ಬೆಂಗಳೂರು, ಕರ್ನಾಟಕ"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Work Details */}
        <div className="space-y-6">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Briefcase className="w-4 h-4" /> ಉದ್ಯೋಗ ವಿವರಗಳು (Job)
          </h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">ಅನುಭವ (Experience - Years)</label>
              <div className="relative">
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full p-4 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:ring-4 focus:ring-teal-50 outline-none focus:border-teal-500 transition-all shadow-sm"
                  placeholder="ಉದಾ: 5 ವರ್ಷಗಳು"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">ಕೌಶಲ್ಯಗಳು (Skills - Comma separated)</label>
              <div className="relative">
                <Award className="absolute left-4 top-4 w-5 h-5 text-slate-300" />
                <textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:ring-4 focus:ring-teal-50 outline-none focus:border-teal-500 transition-all shadow-sm min-h-[100px]"
                  placeholder="ಚಾಲನೆ, ಎಲೆಕ್ಟ್ರಿಷಿಯನ್, ಇತ್ಯಾದಿ"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">ಭಾಷೆಗಳು (Languages - Comma separated)</label>
              <div className="relative">
                <Languages className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input
                  type="text"
                  name="languages"
                  value={formData.languages}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:ring-4 focus:ring-teal-50 outline-none focus:border-teal-500 transition-all shadow-sm"
                  placeholder="ಕನ್ನಡ, ಇಂಗ್ಲಿಷ್, ಹಿಂದಿ"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full relative py-5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-[2rem] font-black shadow-2xl shadow-teal-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 flex justify-center items-center gap-4 text-xl overflow-hidden group"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            {loading ? (
              <span className="animate-pulse">ಉಳಿಸಲಾಗುತ್ತಿದೆ (Saving...)</span>
            ) : (
              <>
                <FileText className="w-6 h-6" />
                <span>ರೆಸ್ಯೂಮ್ ತಯಾರಿಸಿ (Generate Resume)</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
