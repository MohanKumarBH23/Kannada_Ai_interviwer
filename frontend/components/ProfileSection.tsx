import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updateProfile } from '@/lib/api';
import { User, Phone, MapPin, Linkedin, Github, Edit2, Save, X } from 'lucide-react';

export default function ProfileSection() {
  const { user, token, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    linkedin: user?.linkedin || '',
    github: user?.github || '',
  });

  if (!user) return null;

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    // Reset form data if canceling
    if (isEditing) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        location: user.location || '',
        linkedin: user.linkedin || '',
        github: user.github || '',
      });
      setError('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const updatedUser = await updateProfile(formData, token);
      updateUser(updatedUser);
      setIsEditing(false);
    } catch (err) {
      setError('ಪ್ರೊಫೈಲ್ ನವೀಕರಿಸಲು ವಿಫಲವಾಗಿದೆ (Failed to update profile)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-amazon-green/10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-amazon-dark flex items-center gap-2">
          <User className="w-6 h-6 text-amazon-green" />
          ಪ್ರೊಫೈಲ್ (Profile)
        </h2>
        <button
          onClick={handleEditToggle}
          className={`p-2 rounded-lg transition-colors ${
            isEditing 
              ? 'bg-red-50 text-red-600 hover:bg-red-100' 
              : 'bg-amazon-light text-amazon-green hover:bg-amazon-green hover:text-white'
          }`}
        >
          {isEditing ? <X className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-amazon-dark">ಹೆಸರು (Name)</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-xl border border-amazon-green/30 bg-white text-amazon-dark outline-none focus:ring-2 focus:ring-amazon-green"
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-amazon-dark/70">ಫೋನ್ (Phone)</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-xl border border-amazon-green/30 bg-white text-amazon-dark outline-none focus:ring-2 focus:ring-amazon-green"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-amazon-dark/70">ಸ್ಥಳ (Location)</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-xl border border-amazon-green/30 bg-white text-amazon-dark outline-none focus:ring-2 focus:ring-amazon-green"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-amazon-dark/70">ಲಿಂಕ್ಡ್‌ಇನ್ (LinkedIn URL)</label>
            <input
              type="url"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-xl border border-amazon-green/30 bg-white text-amazon-dark outline-none focus:ring-2 focus:ring-amazon-green"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-amazon-dark/70">ಗಿಟ್‌ಹಬ್ (GitHub URL)</label>
            <input
              type="url"
              name="github"
              value={formData.github}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-xl border border-amazon-green/30 bg-white text-amazon-dark outline-none focus:ring-2 focus:ring-amazon-green"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 mt-4 bg-amazon-green hover:bg-amazon-dark text-white p-3 rounded-xl font-bold transition-colors disabled:opacity-70 shadow-lg shadow-amazon-green/20"
          >
            {loading ? 'ಉಳಿಸಲಾಗುತ್ತಿದೆ (Saving...)' : <><Save className="w-5 h-5" /> ಉಳಿಸಿ (Save)</>}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-amazon-green/10 pb-4">
            <div className="w-12 h-12 rounded-full bg-amazon-light flex items-center justify-center text-amazon-green font-bold text-xl">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-bold text-amazon-dark">{user.name}</p>
              <p className="text-sm text-amazon-green">{user.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-amazon-dark">
              <Phone className="w-5 h-5 text-amazon-green" />
              <span>{user.phone || 'ಫೋನ್ ಸಂಖ್ಯೆ ಸೇರಿಸಲಾಗಿಲ್ಲ (Phone not added)'}</span>
            </div>
            <div className="flex items-center gap-3 text-amazon-dark">
              <MapPin className="w-5 h-5 text-amazon-green" />
              <span>{user.location || 'ಸ್ಥಳ ಸೇರಿಸಲಾಗಿಲ್ಲ (Location not added)'}</span>
            </div>
            <div className="flex items-center gap-3 text-amazon-dark">
              <Linkedin className="w-5 h-5 text-amazon-green" />
              {user.linkedin ? (
                <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="text-amazon-green hover:underline truncate font-medium">
                  {user.linkedin}
                </a>
              ) : (
                <span className="opacity-60 text-sm">ಲಿಂಕ್ಡ್‌ಇನ್ ಸೇರಿಸಲಾಗಿಲ್ಲ (LinkedIn not added)</span>
              )}
            </div>
            <div className="flex items-center gap-3 text-amazon-dark">
              <Github className="w-5 h-5 text-amazon-green" />
              {user.github ? (
                <a href={user.github} target="_blank" rel="noopener noreferrer" className="text-amazon-green hover:underline truncate font-medium">
                  {user.github}
                </a>
              ) : (
                <span className="opacity-60 text-sm">ಗಿಟ್‌ಹಬ್ ಸೇರಿಸಲಾಗಿಲ್ಲ (GitHub not added)</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
