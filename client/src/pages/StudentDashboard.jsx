import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ProfileCard } from '../components/ProfileCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { 
  Sparkles, Code, Users, FolderKanban, ArrowUpDown, 
  PlusCircle, Search, Repeat, Bell, CheckCircle2, ArrowRight
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user, showToast } = useAuth();
  const navigate = useNavigate();

  const [recommendedPartners, setRecommendedPartners] = useState([]);
  const [activeProjectsCount, setActiveProjectsCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Skill Modal State
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState(80);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch recommended partners
      const resMatches = await axios.get('/api/matches');
      if (resMatches.data.success) {
        setRecommendedPartners(resMatches.data.data.slice(0, 3));
      }

      // Fetch user projects
      const resProjects = await axios.get('/api/projects');
      if (resProjects.data.success) {
        const myProjects = resProjects.data.data.filter(p => 
          p.owner?._id === user?._id || p.members?.some(m => m._id === user?._id)
        );
        setActiveProjectsCount(myProjects.length);
      }

      // Fetch incoming requests
      const resRequests = await axios.get('/api/requests/received');
      if (resRequests.data.success) {
        setRequestsCount(resRequests.data.data.filter(r => r.status === 'pending').length);
      }

      // Fetch notifications as activities
      const resNotifs = await axios.get('/api/notifications');
      if (resNotifs.data.success) {
        setRecentActivities(resNotifs.data.data.slice(0, 5));
      }

    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    try {
      const res = await axios.post('/api/users/skills', {
        name: newSkillName.trim(),
        proficiency: Number(newSkillProficiency)
      });

      if (res.data.success) {
        showToast(`Skill "${newSkillName}" added successfully!`, 'success');
        setShowAddSkillModal(false);
        setNewSkillName('');
        // reload
        window.location.reload();
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to add skill', 'error');
    }
  };

  const handleConnect = async (partner) => {
    try {
      const res = await axios.post('/api/requests', {
        receiverId: partner._id,
        message: `Hi ${partner.name}, I would love to connect and collaborate with you on SkillSwap!`
      });

      if (res.data.success) {
        showToast(`Collaboration request sent to ${partner.name}!`, 'success');
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Request failed', 'error');
    }
  };

  if (loading) return <LoadingSpinner label="Preparing your student dashboard..." />;

  const mySkillsCount = user?.skills?.length || 0;
  const connectionsCount = user?.connections?.length || 0;

  return (
    <div className="space-y-8">
      
      {/* WELCOME HEADER */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-indigo-200 text-xs font-semibold mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Student SaaS Network
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
            Good morning, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Build your next project with the right people. You currently have {mySkillsCount} skills listed and {requestsCount} pending collaboration requests.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/partner-finder"
              className="px-4 py-2.5 rounded-xl bg-white text-indigo-900 text-xs font-bold hover:bg-slate-100 transition-all flex items-center gap-2 shadow-sm"
            >
              <Search className="w-4 h-4" /> Find Partners
            </Link>
            <button
              onClick={() => setShowAddSkillModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600/60 hover:bg-indigo-600 text-white text-xs font-bold border border-indigo-400/30 transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Add Skill
            </button>
            <Link
              to="/projects"
              className="px-4 py-2.5 rounded-xl bg-indigo-600/60 hover:bg-indigo-600 text-white text-xs font-bold border border-indigo-400/30 transition-all flex items-center gap-2"
            >
              <FolderKanban className="w-4 h-4" /> Manage Projects
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* STATISTICS (4 CARDS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">My Skills</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{mySkillsCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Code className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Requests</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{requestsCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <ArrowUpDown className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Projects</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{activeProjectsCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
            <FolderKanban className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Connections</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{connectionsCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* TWO COLUMN CONTENT: RECOMMENDED PARTNERS & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recommended Partners (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Recommended Partners</h2>
              <p className="text-xs text-slate-500">Matched based on your skill compatibility score</p>
            </div>
            <Link to="/discover" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {recommendedPartners.map((partner) => (
              <ProfileCard 
                key={partner._id} 
                student={partner} 
                onConnect={handleConnect}
              />
            ))}
          </div>
        </div>

        {/* Recent Activity & Quick Actions (1 col) */}
        <div className="space-y-6">
          
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/partner-finder"
                className="p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200 transition-all text-center flex flex-col items-center gap-1.5"
              >
                <Search className="w-4 h-4 text-indigo-600" />
                <span>Find Partners</span>
              </Link>
              <button
                onClick={() => setShowAddSkillModal(true)}
                className="p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200 transition-all text-center flex flex-col items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>Add Skill</span>
              </button>
              <Link
                to="/projects"
                className="p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200 transition-all text-center flex flex-col items-center gap-1.5"
              >
                <FolderKanban className="w-4 h-4 text-cyan-600" />
                <span>Create Project</span>
              </Link>
              <Link
                to="/requests"
                className="p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200 transition-all text-center flex flex-col items-center gap-1.5"
              >
                <ArrowUpDown className="w-4 h-4 text-amber-600" />
                <span>View Requests</span>
              </Link>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center justify-between">
              <span>Recent Activity</span>
              <Bell className="w-4 h-4 text-slate-400" />
            </h3>

            {recentActivities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((act) => (
                  <div key={act._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-700 leading-snug">{act.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ADD SKILL MODAL */}
      {showAddSkillModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add New Skill to Profile</h3>
            <form onSubmit={handleAddSkill} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g. React, Python, UI/UX, Docker..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Proficiency Level ({newSkillProficiency}%)
                </label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={newSkillProficiency}
                  onChange={(e) => setNewSkillProficiency(e.target.value)}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSkillModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold gradient-bg text-white shadow-xs hover:opacity-95"
                >
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
