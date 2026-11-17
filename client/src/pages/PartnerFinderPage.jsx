import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MatchCard } from '../components/MatchCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { Sparkles, Plus, X, Search, CheckCircle2, Send, Layers } from 'lucide-react';

export const PartnerFinderPage = () => {
  const { showToast } = useAuth();

  const [projectTitle, setProjectTitle] = useState('Smart Campus Assistant');
  const [category, setCategory] = useState('Web Application');
  const [requiredSkills, setRequiredSkills] = useState(['React', 'Node.js', 'MongoDB', 'UI/UX']);
  const [skillInput, setSkillInput] = useState('');
  const [preferredDept, setPreferredDept] = useState('All');

  const [matches, setMatches] = useState(null);
  const [loading, setLoading] = useState(false);

  // Invite modal state
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [inviteMessage, setInviteMessage] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!skillInput.trim()) return;
    const clean = skillInput.trim();
    if (!requiredSkills.some(s => s.toLowerCase() === clean.toLowerCase())) {
      setRequiredSkills([...requiredSkills, clean]);
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skillToRemove));
  };

  const handleCalculateMatches = async (e) => {
    if (e) e.preventDefault();
    if (requiredSkills.length === 0) {
      showToast('Please specify at least one required skill', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post('/api/matches', {
        projectTitle,
        category,
        requiredSkills,
        preferredDepartment: preferredDept
      });

      if (res.data.success) {
        setMatches(res.data);
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Matching failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    try {
      setSendingInvite(true);
      const res = await axios.post('/api/requests', {
        receiverId: selectedCandidate._id,
        message: inviteMessage || `Hi ${selectedCandidate.name}, I would love for you to join our project "${projectTitle}" based on your skill compatibility (${selectedCandidate.matchPercentage}% match)!`
      });

      if (res.data.success) {
        showToast(`Collaboration invitation sent to ${selectedCandidate.name}!`, 'success');
        setSelectedCandidate(null);
        setInviteMessage('');
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to send invite', 'error');
    } finally {
      setSendingInvite(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Banner */}
      <div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
          <Sparkles className="w-4 h-4 text-indigo-600" /> Smart Match Engine
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Find Project Partners</h1>
        <p className="text-xs text-slate-500 mt-1">
          Specify your project requirement skills. Our algorithm calculates match scores using: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700 font-mono">Match Score = (Matched / Required) × 100</code>
        </p>
      </div>

      {/* PROJECT REQUIREMENTS FORM */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          Project Requirements Setup
        </h2>

        <form onSubmit={handleCalculateMatches} className="space-y-5">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Project Title</label>
              <input
                type="text"
                required
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="e.g. Smart Attendance System"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-indigo-500"
              >
                <option value="Web Application">Web Application</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Machine Learning">Machine Learning</option>
                <option value="Cloud & IoT">Cloud & IoT</option>
                <option value="Mobile App">Mobile App</option>
                <option value="Cybersecurity">Cybersecurity</option>
              </select>
            </div>
          </div>

          {/* Required Skills Tag Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Required Skills Tags ({requiredSkills.length} selected)
            </label>
            
            <div className="flex flex-wrap gap-2 mb-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 min-h-[3rem] items-center">
              {requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-indigo-700 font-semibold border border-indigo-200 rounded-xl text-xs shadow-xs"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-rose-600 font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
              {requiredSkills.length === 0 && (
                <span className="text-xs text-slate-400">Type a skill name below and press Add</span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(e); } }}
                placeholder="Type skill name (e.g. React, Computer Vision, Node.js) and press Enter"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-all flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Skill
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
            <div className="w-full sm:w-auto">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Preferred Department</label>
              <select
                value={preferredDept}
                onChange={(e) => setPreferredDept(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50"
              >
                <option value="All">All Departments</option>
                <option value="AI & DS">AI & DS</option>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-xs font-bold text-white gradient-bg shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>{loading ? 'Calculating Compatibility...' : 'Find Compatible Partners'}</span>
            </button>
          </div>

        </form>
      </div>

      {/* MATCHED RESULTS SECTION */}
      {loading ? (
        <LoadingSpinner label="Running Smart Skill Matching Algorithm..." />
      ) : matches ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">
              Ranked Candidates for "{matches.projectTitle}"
            </h3>
            <span className="text-xs font-semibold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
              {matches.matchCount} Students Evaluated
            </span>
          </div>

          {matches.data.length === 0 ? (
            <EmptyState title="No matching students found" message="Try expanding your required skills list or department filter." />
          ) : (
            <div className="space-y-4">
              {matches.data.map((candidate, idx) => (
                <MatchCard
                  key={candidate._id}
                  candidate={candidate}
                  rank={idx + 1}
                  onInvite={(cand) => {
                    setSelectedCandidate(cand);
                    setInviteMessage(`Hi ${cand.name}! We're looking for a partner with ${cand.matchedSkills.join(', ')} for our project "${projectTitle}". Would love to collaborate!`);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <Sparkles className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">Ready to find partners?</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            Click "Find Compatible Partners" above to trigger backend matching algorithm and rank available students by match percentage.
          </p>
          <button
            onClick={handleCalculateMatches}
            className="px-6 py-3 gradient-bg text-white text-xs font-bold rounded-xl shadow-md hover:opacity-95"
          >
            Run Skill Match Calculation Now
          </button>
        </div>
      )}

      {/* INVITATION MODAL */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={selectedCandidate.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCandidate.name)}`}
                alt={selectedCandidate.name}
                className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
              />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Send Request to {selectedCandidate.name}</h3>
                <span className="text-xs font-bold text-emerald-600">{selectedCandidate.matchPercentage}% Skill Match Score</span>
              </div>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Personalized Message</label>
                <textarea
                  rows="4"
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-indigo-500"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCandidate(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingInvite}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold gradient-bg text-white shadow-xs hover:opacity-95 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>{sendingInvite ? 'Sending...' : 'Send Collaboration Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
