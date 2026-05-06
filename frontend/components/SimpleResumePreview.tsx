import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Phone, MapPin, Briefcase, Award, Languages, Download, Edit3 } from 'lucide-react';

export default function SimpleResumePreview({ onEdit }: { onEdit: () => void }) {
  const { user } = useAuth();

  if (!user || !user.experience) return null;

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
      {/* Header / Banner */}
      <div className="h-32 bg-gradient-to-r from-teal-600 to-emerald-600 relative">
        <div className="absolute -bottom-16 left-8 md:left-12 flex items-end gap-6">
          <div className="relative">
            {user.profile_picture ? (
              <img 
                src={user.profile_picture} 
                alt={user.name} 
                className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-2xl"
              />
            ) : (
              <div className="w-32 h-32 rounded-3xl bg-slate-100 flex items-center justify-center border-4 border-white shadow-2xl">
                <User className="w-16 h-16 text-slate-300" />
              </div>
            )}
          </div>
          <div className="pb-2">
            <h2 className="text-3xl font-black text-slate-900 leading-none">{user.name}</h2>
            <p className="text-teal-600 font-bold mt-1 uppercase tracking-widest text-xs">ಕುಶಲ ಕಾರ್ಮಿಕ (Skilled Worker)</p>
          </div>
        </div>
        <button 
          onClick={onEdit}
          className="absolute top-6 right-6 p-3 bg-white/20 hover:bg-white/30 text-white rounded-2xl backdrop-blur-md transition-all group"
          title="Edit Resume"
        >
          <Edit3 className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      <div className="pt-24 pb-12 px-8 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Sidebar Info */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ಸಂಪರ್ಕ (Contact)</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-600 font-medium">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Phone className="w-4 h-4" /></div>
                <span>{user.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 font-medium">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><MapPin className="w-4 h-4" /></div>
                <span>{user.location}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ಭಾಷೆಗಳು (Languages)</h3>
            <div className="flex flex-wrap gap-2">
              {user.languages?.map((lang: string) => (
                <span key={lang} className="px-4 py-1.5 bg-teal-50 text-teal-700 text-sm font-bold rounded-full border border-teal-100">
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-10">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> ವೃತ್ತಿ ಅನುಭವ (Experience)
            </h3>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-xl font-bold text-slate-900">{user.experience}</p>
              <p className="text-slate-500 font-medium mt-1">ಒಟ್ಟು ಕೆಲಸದ ಅನುಭವ (Total Work Experience)</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Award className="w-4 h-4" /> ಕೌಶಲ್ಯಗಳು (Skills)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {user.skills?.map((skill: string) => (
                <div key={skill} className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-teal-500" />
                  <span className="font-bold text-slate-700">{skill}</span>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full flex items-center justify-center gap-3 p-4 border-2 border-dashed border-slate-200 text-slate-400 hover:border-teal-200 hover:text-teal-500 rounded-2xl transition-all font-bold group">
            <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
            ರೆಸ್ಯೂಮ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ (Download PDF - Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
}
