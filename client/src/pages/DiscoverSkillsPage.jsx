import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ProfileCard } from '../components/ProfileCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { Search, Filter, ArrowUpDown, SlidersHorizontal, Sparkles } from 'lucide-react';

export const DiscoverSkillsPage = () => {
  const { showToast, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [skill, setSkill] = useState(searchParams.get('skill') || 'All');
  const [department, setDepartment] = useState('All');
  const [year, setYear] = useState('All');
  const [availability, setAvailability] = useState('All');
  const [sortBy, setSortBy] = useState('Best Match');

  const popularSkillsList = [
    'All', 'Python', 'React', 'Node.js', 'MongoDB', 'Machine Learning', 
    'UI/UX', 'Figma', 'Java', 'Cybersecurity', 'Cloud', 'Data Science', 'Computer Vision'
  ];

  useEffect(() => {
    fetchStudents();
  }, [search, skill, department, year, availability, sortBy]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (skill && skill !== 'All') params.skill = skill;
      if (department && department !== 'All') params.department = department;
      if (year && year !== 'All') params.year = year;
      if (availability && availability !== 'All') params.availability = availability;
      if (sortBy) params.sortBy = sortBy;

      const res = await axios.get('/api/users', { params });
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (student) => {
    try {
      const res = await axios.post('/api/requests', {
        receiverId: student._id,
        message: `Hi ${student.name}, I found your skill profile on SkillSwap and would love to collaborate!`
      });

      if (res.data.success) {
        showToast(`Collaboration request sent to ${student.name}!`, 'success');
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Request failed', 'error');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Discover Skills & Peers</h1>
        <p className="text-xs text-slate-500 mt-1">
          Search students by technical skills, department, proficiency, and calculate skill match compatibility.
        </p>
      </div>

      {/* SEARCH BAR & CONTROLS */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by skill, name, department..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
          />
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Filter Skill</label>
            <select
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50"
            >
              {popularSkillsList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50"
            >
              <option value="All">All Departments</option>
              <option value="AI & DS">AI & DS</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50"
            >
              <option value="All">All Years</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Availability</label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Looking for Team">Looking for Team</option>
              <option value="Busy">Busy</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Sorting</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50"
            >
              <option value="Best Match">Best Skill Match</option>
              <option value="Most Skills">Most Skills</option>
              <option value="Newest Users">Newest Users</option>
            </select>
          </div>

        </div>

      </div>

      {/* RESULTS GRID */}
      {loading ? (
        <LoadingSpinner label="Searching students across campus..." />
      ) : students.length === 0 ? (
        <EmptyState
          title="No students match your query"
          message="Try resetting your filters or searching for another skill like React, Python, or UI/UX."
          actionLabel="Reset Filters"
          onAction={() => {
            setSearch('');
            setSkill('All');
            setDepartment('All');
            setYear('All');
            setAvailability('All');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <ProfileCard
              key={student._id}
              student={student}
              onConnect={handleConnect}
              isConnected={user?.connections?.some(c => (c._id || c) === student._id)}
            />
          ))}
        </div>
      )}

    </div>
  );
};
