import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { SkillBadge } from '../components/SkillBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { 
  FolderKanban, Users, Calendar, CheckCircle2, 
  Trash2, Edit, UserPlus, ArrowLeft, Shield, Sparkles, Send
} from 'lucide-react';

export const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, showToast } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Status update
  const [status, setStatus] = useState('Planning');
  const [progressStep, setProgressStep] = useState(1);
  const [updating, setUpdating] = useState(false);

  // Invite modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteStudentId, setInviteStudentId] = useState('');
  const [availableConnections, setAvailableConnections] = useState([]);

  useEffect(() => {
    fetchProjectDetails();
    fetchConnections();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/projects/${id}`);
      if (res.data.success) {
        setProject(res.data.data);
        setStatus(res.data.data.status);
        setProgressStep(res.data.data.progressStep || 1);
      }
    } catch (err) {
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConnections = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      if (res.data.success) {
        setAvailableConnections(res.data.data.connections || []);
      }
    } catch (err) {
      // Silent
    }
  };

  const handleUpdateStatus = async (newStatus, newStep) => {
    try {
      setUpdating(true);
      const res = await axios.put(`/api/projects/${id}`, {
        status: newStatus,
        progressStep: newStep
      });
      if (res.data.success) {
        setStatus(newStatus);
        setProgressStep(newStep);
        showToast(`Project milestone updated to ${newStatus}!`, 'success');
        fetchProjectDetails();
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Update failed', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await axios.delete(`/api/projects/${id}`);
      if (res.data.success) {
        showToast('Project deleted', 'info');
        navigate('/projects');
      }
    } catch (err) {
      showToast('Failed to delete project', 'error');
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteStudentId) return;

    try {
      const res = await axios.post(`/api/projects/${id}/invite`, {
        studentId: inviteStudentId
      });
      if (res.data.success) {
        showToast('Member added to project team!', 'success');
        setShowInviteModal(false);
        fetchProjectDetails();
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Invitation failed', 'error');
    }
  };

  if (loading) return <LoadingSpinner label="Loading project details..." />;
  if (!project) return <p className="text-center text-slate-500 py-12">Project not found</p>;

  const isOwner = project.owner?._id === user?._id || user?.role === 'admin';
  const isMember = project.members?.some(m => m._id === user?._id);

  const steps = [
    { number: 1, label: 'Planning', statusKey: 'Planning' },
    { number: 2, label: 'Development', statusKey: 'In Progress' },
    { number: 3, label: 'Testing', statusKey: 'In Progress' },
    { number: 4, label: 'Completed', statusKey: 'Completed' }
  ];

  return (
    <div className="space-y-8">
      
      {/* Top Back Link & Actions */}
      <div className="flex items-center justify-between">
        <Link to="/projects" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </Link>

        {isOwner && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-all flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" /> Invite Member
            </button>
            <button
              onClick={handleDeleteProject}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-all flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* PROJECT HEADER CARD */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-block text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md border border-indigo-100 uppercase tracking-wider mb-2">
              {project.category}
            </span>
            <h1 className="text-3xl font-black text-slate-900">{project.title}</h1>
          </div>

          {project.matchPercentage !== undefined && (
            <div className="px-4 py-2 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 font-bold text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{project.matchPercentage}% Skill Match Score</span>
            </div>
          )}
        </div>

        <p className="text-sm text-slate-700 leading-relaxed max-w-3xl">
          {project.description}
        </p>

        {/* PROGRESS TIMELINE INDICATOR */}
        <div className="pt-4 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Project Progress Timeline</p>
          <div className="grid grid-cols-4 gap-2 text-center">
            {steps.map((st) => {
              const isActive = progressStep >= st.number;
              const isCurrent = progressStep === st.number;

              return (
                <div
                  key={st.number}
                  onClick={() => isOwner && handleUpdateStatus(st.statusKey, st.number)}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all ${
                    isOwner ? 'cursor-pointer' : ''
                  } ${
                    isCurrent
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                      : isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-wider font-mono opacity-80">Step {st.number}</div>
                  <div>{st.label}</div>
                </div>
              );
            })}
          </div>
          {isOwner && (
            <p className="text-[11px] text-slate-400 text-center mt-2">Click any timeline step above to update project status</p>
          )}
        </div>

        {/* REQUIRED SKILLS */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Required Skills</p>
          <div className="flex flex-wrap gap-2">
            {(project.requiredSkills || []).map((skill, idx) => (
              <SkillBadge key={idx} name={skill} />
            ))}
          </div>
        </div>

      </div>

      {/* TEAM MEMBERS & OWNER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Members List (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Team Members ({project.members?.length || 1} / {project.maxTeamSize})
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(project.members || []).map((m) => (
              <div key={m._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={m.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}`}
                    alt={m.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{m.name}</h4>
                    <p className="text-[11px] text-slate-500">{m.department} • {m.year}</p>
                  </div>
                </div>
                {m._id === project.owner?._id && (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded">Lead</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Project Owner Info (1 col) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Project Lead</h3>
          {project.owner && (
            <div className="text-center space-y-3">
              <img
                src={project.owner.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.owner.name)}`}
                alt={project.owner.name}
                className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-indigo-500 p-0.5 shadow-xs"
              />
              <div>
                <h4 className="font-bold text-slate-900 text-base">{project.owner.name}</h4>
                <p className="text-xs text-slate-500">{project.owner.department} • {project.owner.college}</p>
              </div>
              <Link
                to={`/profile/${project.owner._id}`}
                className="inline-block px-4 py-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-all"
              >
                View Lead Profile
              </Link>
            </div>
          )}
        </div>

      </div>

      {/* INVITE MEMBER MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Invite Member to Project</h3>
            <form onSubmit={handleInviteMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Connected Student</label>
                <select
                  value={inviteStudentId}
                  onChange={(e) => setInviteStudentId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                >
                  <option value="">-- Choose Connection --</option>
                  {availableConnections.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold gradient-bg text-white shadow-xs hover:opacity-95"
                >
                  Confirm Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
