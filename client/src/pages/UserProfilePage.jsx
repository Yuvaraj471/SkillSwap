import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { SkillBadge } from '../components/SkillBadge';
import { ProjectCard } from '../components/ProjectCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { 
  UserCheck, Send, Repeat, Edit, Trophy, 
  Globe, MapPin, Building, GraduationCap, CheckCircle2
} from 'lucide-react';

export const UserProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser, showToast, updateUserState } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const targetId = id || currentUser?._id;
      const res = await axios.get(`/api/users/${targetId}`);
      if (res.data.success) {
        setProfile(res.data.data);
        setEditData({
          name: res.data.data.name,
          bio: res.data.data.bio,
          location: res.data.data.location,
          department: res.data.data.department,
          year: res.data.data.year,
          availability: res.data.data.availability,
          socialLinks: res.data.data.socialLinks || {}
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await axios.put(`/api/users/${profile._id}`, editData);
      if (res.data.success) {
        showToast('Profile updated successfully!', 'success');
        setProfile(res.data.data);
        if (profile._id === currentUser?._id) {
          updateUserState(res.data.data);
        }
        setShowEditModal(false);
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleConnect = async () => {
    try {
      const res = await axios.post('/api/requests', {
        receiverId: profile._id,
        message: `Hi ${profile.name}, I would love to connect with you on SkillSwap!`
      });
      if (res.data.success) {
        showToast(`Collaboration request sent to ${profile.name}!`, 'success');
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Request failed', 'error');
    }
  };

  if (loading) return <LoadingSpinner label="Loading student profile..." />;
  if (!profile) return <p className="text-center text-slate-500 py-12">User profile not found</p>;

  const isSelf = currentUser?._id === profile._id;
  const isConnected = currentUser?.connections?.some(c => (c._id || c) === profile._id);

  return (
    <div className="space-y-8">
      
      {/* PROFILE HEADER CARD */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs relative overflow-hidden">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img
              src={profile.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}`}
              alt={profile.name}
              className="w-24 h-24 rounded-3xl object-cover border-2 border-indigo-500 shadow-md shrink-0"
            />

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{profile.name}</h1>
                <span className="text-xs font-mono text-slate-400">@{profile.username}</span>
              </div>

              <p className="text-xs font-semibold text-slate-600 mt-1 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1"><GraduationCap className="w-4 h-4 text-indigo-500" /> {profile.department} • {profile.year}</span>
                <span className="flex items-center gap-1"><Building className="w-4 h-4 text-slate-400" /> {profile.college}</span>
                {profile.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-slate-400" /> {profile.location}</span>}
              </p>

              <div className="mt-2">
                <span className="inline-block text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  ● {profile.availability || 'Available'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {isSelf ? (
              <button
                onClick={() => setShowEditModal(true)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-all flex items-center gap-2"
              >
                <Edit className="w-4 h-4" /> Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleConnect}
                  disabled={isConnected}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    isConnected
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'gradient-bg text-white shadow-md hover:opacity-95'
                  }`}
                >
                  {isConnected ? <UserCheck className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                  <span>{isConnected ? 'Connected' : 'Connect'}</span>
                </button>

                <Link
                  to="/skill-swap"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-all flex items-center gap-1.5"
                >
                  <Repeat className="w-4 h-4" /> Skill Swap
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-6 text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
            "{profile.bio}"
          </p>
        )}

        {/* Social Links */}
        {profile.socialLinks && (
          <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-slate-600">
            {profile.socialLinks.github && (
              <a href={profile.socialLinks.github} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-slate-900">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                GitHub
              </a>
            )}
            {profile.socialLinks.linkedin && (
              <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-indigo-600">
                <svg className="w-4 h-4 fill-current text-indigo-600" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
                LinkedIn
              </a>
            )}
            {profile.socialLinks.portfolio && (
              <a href={profile.socialLinks.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-indigo-600">
                <Globe className="w-4 h-4" /> Portfolio
              </a>
            )}
          </div>
        )}

      </div>

      {/* SKILLS WITH PROFICIENCY BARS */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
        <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
          Technical & Soft Skills
        </h2>

        {(!profile.skills || profile.skills.length === 0) ? (
          <p className="text-xs text-slate-400">No skills added yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.skills.map((skill, idx) => {
              const prof = skill.proficiency || 80;
              return (
                <div key={idx} className="space-y-1.5 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>{skill.name}</span>
                    <span className="font-mono text-indigo-600">{prof}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full gradient-bg rounded-full transition-all duration-500"
                      style={{ width: `${prof}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PROJECTS LIST */}
      {profile.projects && profile.projects.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Projects & Contributions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.projects.map((p) => (
              <ProjectCard key={p._id} project={p} />
            ))}
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Edit Profile Information</h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editData.name || ''}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bio</label>
                <textarea
                  rows="3"
                  value={editData.bio || ''}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={editData.department || ''}
                    onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Year</label>
                  <input
                    type="text"
                    value={editData.year || ''}
                    onChange={(e) => setEditData({ ...editData, year: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold gradient-bg text-white shadow-xs hover:opacity-95"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
