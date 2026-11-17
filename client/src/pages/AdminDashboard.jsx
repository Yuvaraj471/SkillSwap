import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { 
  Shield, Users, FolderKanban, Flag, CheckCircle, 
  Trash2, Ban, UserCheck, AlertTriangle, ArrowUpDown, Repeat
} from 'lucide-react';

export const AdminDashboard = () => {
  const { showToast } = useAuth();
  
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);

  const [activeTab, setActiveTab] = useState('overview'); // overview | users | projects | reports
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      const resStats = await axios.get('/api/admin/stats');
      if (resStats.data.success) setStats(resStats.data.data);

      const resUsers = await axios.get('/api/admin/users');
      if (resUsers.data.success) setUsers(resUsers.data.data);

      const resProjects = await axios.get('/api/admin/projects');
      if (resProjects.data.success) setProjects(resProjects.data.data);

      const resReports = await axios.get('/api/reports');
      if (resReports.data.success) setReports(resReports.data.data);

    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDisable = async (userId) => {
    try {
      const res = await axios.put(`/api/admin/users/${userId}/disable`);
      if (res.data.success) {
        showToast(res.data.message, 'success');
        fetchAdminData();
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Action failed', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await axios.delete(`/api/admin/users/${userId}`);
      if (res.data.success) {
        showToast('User deleted', 'info');
        fetchAdminData();
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      const res = await axios.delete(`/api/admin/projects/${projectId}`);
      if (res.data.success) {
        showToast('Project deleted', 'info');
        fetchAdminData();
      }
    } catch (err) {
      showToast('Delete failed', 'error');
    }
  };

  const handleUpdateReportStatus = async (reportId, status) => {
    try {
      const res = await axios.put(`/api/reports/${reportId}`, { status });
      if (res.data.success) {
        showToast(`Report marked as ${status}`, 'success');
        fetchAdminData();
      }
    } catch (err) {
      showToast('Status update failed', 'error');
    }
  };

  if (loading) return <LoadingSpinner label="Accessing Admin Moderation Console..." />;

  return (
    <div className="space-y-8">
      
      {/* Admin Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 rounded-full text-amber-300 text-xs font-semibold mb-2 border border-amber-500/30">
            <Shield className="w-4 h-4 text-amber-400" /> Platform Super Admin Controls
          </div>
          <h1 className="text-3xl font-black">SkillSwap Administration</h1>
          <p className="text-slate-300 text-xs mt-1">Manage registered students, moderate campus projects, and resolve reports.</p>
        </div>
      </div>

      {/* ADMIN TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'overview', label: 'Platform Statistics' },
          { id: 'users', label: `Users (${users.length})` },
          { id: 'projects', label: `Projects (${projects.length})` },
          { id: 'reports', label: `Reports (${reports.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* STATS OVERVIEW TAB */}
      {activeTab === 'overview' && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-xs font-bold text-slate-400 uppercase">Total Students</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{stats.totalStudents}</h3>
            <span className="text-[10px] text-emerald-600 font-semibold">{stats.activeUsers} Active</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-xs font-bold text-slate-400 uppercase">Total Projects</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{stats.totalProjects}</h3>
            <span className="text-[10px] text-indigo-600 font-semibold">{stats.activeProjects} In Progress</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-xs font-bold text-slate-400 uppercase">Collaboration Requests</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{stats.collaborationRequests}</h3>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-xs font-bold text-slate-400 uppercase">Skill Swaps</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{stats.skillSwaps}</h3>
          </div>
        </div>
      )}

      {/* USER MANAGEMENT TABLE TAB */}
      {(activeTab === 'users' || activeTab === 'overview') && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-lg">User Management</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase">
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Year</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50">
                    <td className="p-3 flex items-center gap-2">
                      <img
                        src={u.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}`}
                        alt={u.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <span className="font-bold text-slate-900">{u.name}</span>
                    </td>
                    <td className="p-3 text-slate-600">{u.email}</td>
                    <td className="p-3">{u.department}</td>
                    <td className="p-3">{u.year}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      {u.isDisabled ? (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[10px]">Disabled</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">Active</span>
                      )}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {u.role !== 'admin' && (
                        <>
                          <button
                            onClick={() => handleToggleDisable(u._id)}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-amber-50 text-slate-700 font-semibold"
                          >
                            {u.isDisabled ? 'Enable' : 'Disable'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 font-semibold hover:bg-rose-100"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PROJECT MANAGEMENT TABLE TAB */}
      {(activeTab === 'projects' || activeTab === 'overview') && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-lg">Project Management</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase">
                  <th className="p-3">Project Title</th>
                  <th className="p-3">Owner</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {projects.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{p.title}</td>
                    <td className="p-3 text-slate-600">{p.owner?.name || 'Unknown'}</td>
                    <td className="p-3">{p.category}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-bold text-[10px]">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteProject(p._id)}
                        className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 font-semibold hover:bg-rose-100"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORTS MANAGEMENT TAB */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-lg">Reports & Flagged Content</h3>

          {reports.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">No pending reports.</p>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div key={rep._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <p className="font-bold text-slate-900">Reporter: {rep.reporter?.name}</p>
                    <p className="text-slate-600 mt-0.5">Reason: "{rep.reason}"</p>
                    <span className="text-[10px] text-slate-400 block mt-1">Status: {rep.status}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateReportStatus(rep._id, 'resolved')}
                      className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-xl"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => handleUpdateReportStatus(rep._id, 'dismissed')}
                      className="px-3 py-1 bg-slate-200 text-slate-700 font-bold rounded-xl"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
