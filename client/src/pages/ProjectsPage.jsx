import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ProjectCard } from '../components/ProjectCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { FolderKanban, Plus, Search, Filter, Sparkles, Layers } from 'lucide-react';

export const ProjectsPage = () => {
  const { user, showToast } = useAuth();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');

  // Create Project Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    category: 'Web Application',
    requiredSkills: '',
    maxTeamSize: 4,
    deadline: ''
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [search, category, status]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (category && category !== 'All') params.category = category;
      if (status && status !== 'All') params.status = status;

      const res = await axios.get('/api/projects', { params });
      if (res.data.success) {
        setProjects(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProject.title || !newProject.description) {
      showToast('Title and description are required', 'error');
      return;
    }

    try {
      setCreating(true);
      const res = await axios.post('/api/projects', newProject);
      if (res.data.success) {
        showToast('Project created successfully!', 'success');
        setShowCreateModal(false);
        setNewProject({
          title: '',
          description: '',
          category: 'Web Application',
          requiredSkills: '',
          maxTeamSize: 4,
          deadline: ''
        });
        fetchProjects();
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to create project', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinProject = async (project) => {
    try {
      const res = await axios.post(`/api/projects/${project._id}/join`);
      if (res.data.success) {
        showToast(`Request sent to join "${project.title}"!`, 'success');
        fetchProjects();
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Join request failed', 'error');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Explore & Manage Projects</h1>
          <p className="text-xs text-slate-500 mt-1">
            Discover student projects looking for team members, or post your own project to find collaborators.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 rounded-2xl text-xs font-bold text-white gradient-bg shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> Create New Project
        </button>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by project title, description, category, or required skills..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-1">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50"
            >
              <option value="All">All Categories</option>
              <option value="Web Application">Web Application</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
              <option value="Machine Learning">Machine Learning</option>
              <option value="Cloud & IoT">Cloud & IoT</option>
              <option value="Mobile App">Mobile App</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50"
            >
              <option value="All">All Statuses</option>
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* PROJECTS GRID */}
      {loading ? (
        <LoadingSpinner label="Fetching campus projects..." />
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects found"
          message="Be the first student to publish a project!"
          actionLabel="Create Project"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <ProjectCard
              key={proj._id}
              project={proj}
              onJoin={handleJoinProject}
              isOwner={proj.owner?._id === user?._id}
              isMember={proj.members?.some(m => m._id === user?._id)}
            />
          ))}
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Create New Project</h3>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  placeholder="e.g. AI Attendance System"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                <select
                  value={newProject.category}
                  onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="Web Application">Web Application</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="Cloud & IoT">Cloud & IoT</option>
                  <option value="Mobile App">Mobile App</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows="3"
                  required
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Describe your project goals, scope, and target outcomes..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-indigo-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Required Skills (Comma-separated)</label>
                <input
                  type="text"
                  value={newProject.requiredSkills}
                  onChange={(e) => setNewProject({ ...newProject, requiredSkills: e.target.value })}
                  placeholder="React, Node.js, MongoDB, UI/UX"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max Team Size</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newProject.maxTeamSize}
                    onChange={(e) => setNewProject({ ...newProject, maxTeamSize: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Deadline Date</label>
                  <input
                    type="date"
                    value={newProject.deadline}
                    onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold gradient-bg text-white shadow-xs hover:opacity-95"
                >
                  {creating ? 'Publishing...' : 'Publish Project'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
