import React, { useState } from 'react';
import { User, Mail, Upload, Camera, Save, X, Sparkles, MapPin, GraduationCap, Target, ShieldCheck, Check } from 'lucide-react';
import BeeAnimatedMascot from './BeeAnimatedMascot';
import CityAutocomplete from './CityAutocomplete';
import { logActivity } from '../services/activityLogService';

const beeAvatarPresets = [
  '/bee_frame_1.png',
  '/bee_frame_2.png',
  '/bee_frame_3.png',
  '/bee_frame_4.png',
  '/logo.png'
];

export default function UserProfileModal({ isOpen, onClose, currentUser, userStats, onSaveProfile }) {
  const [username, setUsername] = useState(currentUser?.username || 'Bee Learner');
  const [email, setEmail] = useState(currentUser?.email || 'student@beestudy.ai');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '/bee_frame_4.png');
  const [cityLocation, setCityLocation] = useState(userStats?.cityLocation || 'Manila, 🇵🇭 Philippines');
  const [educationLevel, setEducationLevel] = useState(userStats?.educationLevel || 'College / University');
  const [targetExam, setTargetExam] = useState(userStats?.targetExam || 'Biology & CS Midterms');
  const [studyStyle, setStudyStyle] = useState(userStats?.preferredStudyStyle || 'Active Recall + Feynman');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleAvatarFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      setAvatarUrl(evt.target?.result || avatarUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();

    const updatedUser = {
      ...currentUser,
      username,
      email,
      avatarUrl,
      isAuthenticated: true
    };

    const updatedStats = {
      cityLocation,
      educationLevel,
      targetExam,
      preferredStudyStyle: studyStyle
    };

    onSaveProfile(updatedUser, updatedStats);

    // Log profile update to activity_logs
    logActivity('Profile Updated', 'Profile', {
      userId: currentUser?.userId,
      username: username,
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 select-none">
      <div className="glass-panel w-full max-w-lg p-6 relative border-sky-500/40 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto backdrop-blur-2xl bg-slate-900/90">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <User size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-display">User Profile Management</h2>
            <p className="text-xs text-slate-400">Customize your avatar, display name, location, and study goals</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          {/* Avatar Upload & Presets */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">Profile Avatar</label>
            <div className="flex items-center gap-4">
              <div className="relative group">
                <img
                  src={avatarUrl}
                  alt="User Avatar"
                  className="w-16 h-16 rounded-full bg-slate-900 border-2 border-sky-400 object-contain p-1 shadow-md"
                />
                <label className="absolute inset-0 bg-slate-950/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Camera size={18} className="text-sky-400" />
                  <input type="file" accept="image/*" onChange={handleAvatarFileUpload} className="hidden" />
                </label>
              </div>

              <div className="space-y-1">
                <label className="btn-secondary text-[11px] py-1.5 px-3 cursor-pointer inline-flex items-center gap-1.5">
                  <Upload size={13} />
                  Upload Custom Avatar Image
                  <input type="file" accept="image/*" onChange={handleAvatarFileUpload} className="hidden" />
                </label>
                <span className="text-[10px] text-slate-500 block">PNG, JPG, GIF up to 5MB</span>
              </div>
            </div>

            {/* Mascot Avatar Presets */}
            <div className="pt-1">
              <span className="text-[10px] text-slate-400 font-semibold block mb-1">Or pick a mascot preset:</span>
              <div className="flex gap-2">
                {beeAvatarPresets.map((preset, idx) => (
                  <img
                    key={idx}
                    src={preset}
                    alt="Preset"
                    onClick={() => setAvatarUrl(preset)}
                    className={`w-9 h-9 rounded-full bg-slate-900 border cursor-pointer p-0.5 object-contain transition-all ${
                      avatarUrl === preset ? 'border-sky-400 scale-110 shadow-md' : 'border-slate-800 hover:border-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Username & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Display Name / Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. Alex_Mastery"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alex@student.edu"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* City Location Autocomplete */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">City / Region (Leaderboard Placement)</label>
            <CityAutocomplete value={cityLocation} onChange={(val) => setCityLocation(val)} />
          </div>

          {/* Education & Exam Focus */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Education Level</label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="High School">High School Student</option>
                <option value="College / University">College / University</option>
                <option value="Medical / Nursing">Medical & Health Sciences</option>
                <option value="Engineering & Tech">Engineering & Computer Science</option>
                <option value="Board / Licensing Exam">Board / Licensure Exam Prep</option>
                <option value="Self Learner">Self-Taught / Professional</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Exam / Goal</label>
              <input
                type="text"
                value={targetExam}
                onChange={(e) => setTargetExam(e.target.value)}
                placeholder="e.g. Organic Chemistry Final"
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full btn-primary text-xs py-2.5 justify-center mt-2"
          >
            {isSaved ? (
              <>
                <Check size={16} /> Profile Changes Saved!
              </>
            ) : (
              <>
                <Save size={16} /> Save Profile Changes
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
