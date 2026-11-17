import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { SkillBadge } from '../components/SkillBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { 
  Repeat, Sparkles, Send, CheckCircle2, Clock, 
  ArrowRight, BookOpen, GraduationCap, MessageSquare
} from 'lucide-react';

export const SkillSwapPage = () => {
  const { user, showToast, updateUserState } = useAuth();
  
  const [incomingSwaps, setIncomingSwaps] = useState([]);
  const [outgoingSwaps, setOutgoingSwaps] = useState([]);
  const [mutualMatches, setMutualMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Teach & Learn skills inputs
  const [teachInput, setTeachInput] = useState('');
  const [learnInput, setLearnInput] = useState('');

  // Proposal modal
  const [selectedTargetUser, setSelectedTargetUser] = useState(null);
  const [offeredSkill, setOfferedSkill] = useState('');
  const [requestedSkill, setRequestedSkill] = useState('');
  const [proposalMessage, setProposalMessage] = useState('');
  const [sendingProposal, setSendingProposal] = useState(false);

  useEffect(() => {
    fetchSkillSwaps();
  }, []);

  const fetchSkillSwaps = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/skill-swaps');
      if (res.data.success) {
        setIncomingSwaps(res.data.incoming || []);
        setOutgoingSwaps(res.data.outgoing || []);
        setMutualMatches(res.data.mutualMatches || []);
      }
    } catch (err) {
      console.error('Error fetching skill swaps:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeachSkill = async (e) => {
    e.preventDefault();
    if (!teachInput.trim()) return;
    const newTeach = [...(user.teachSkills || []), { name: teachInput.trim(), level: 'Intermediate' }];
    try {
      const res = await axios.put(`/api/users/${user._id}`, { teachSkills: newTeach });
      if (res.data.success) {
        updateUserState(res.data.data);
        setTeachInput('');
        showToast('Teaching skill added!', 'success');
        fetchSkillSwaps();
      }
    } catch (err) {
      showToast('Failed to update skills', 'error');
    }
  };

  const handleAddLearnSkill = async (e) => {
    e.preventDefault();
    if (!learnInput.trim()) return;
    const newLearn = [...(user.learnSkills || []), { name: learnInput.trim(), level: 'Beginner' }];
    try {
      const res = await axios.put(`/api/users/${user._id}`, { learnSkills: newLearn });
      if (res.data.success) {
        updateUserState(res.data.data);
        setLearnInput('');
        showToast('Learning interest added!', 'success');
        fetchSkillSwaps();
      }
    } catch (err) {
      showToast('Failed to update skills', 'error');
    }
  };

  const handleSendProposal = async (e) => {
    e.preventDefault();
    if (!selectedTargetUser || !offeredSkill || !requestedSkill) return;

    try {
      setSendingProposal(true);
      const res = await axios.post('/api/skill-swaps', {
        receiverId: selectedTargetUser._id,
        offeredSkill,
        requestedSkill,
        message: proposalMessage || `Hi ${selectedTargetUser.name}, I can help you learn ${offeredSkill} if you can help me learn ${requestedSkill}!`
      });

      if (res.data.success) {
        showToast(`Skill Swap proposal sent to ${selectedTargetUser.name}!`, 'success');
        setSelectedTargetUser(null);
        fetchSkillSwaps();
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Proposal failed', 'error');
    } finally {
      setSendingProposal(false);
    }
  };

  const handleUpdateSwapStatus = async (swapId, status) => {
    try {
      const res = await axios.put(`/api/skill-swaps/${swapId}`, { status });
      if (res.data.success) {
        showToast(`Skill Swap proposal ${status}!`, 'success');
        fetchSkillSwaps();
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Update failed', 'error');
    }
  };

  if (loading) return <LoadingSpinner label="Detecting mutual Skill Swap opportunities across campus..." />;

  return (
    <div className="space-y-8">
      
      {/* Banner */}
      <div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-xs font-semibold mb-2">
          <Repeat className="w-4 h-4 text-purple-600" /> Peer-to-Peer Knowledge Exchange
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Skill Swap</h1>
        <p className="text-xs text-slate-500 mt-1">
          Teach what you know and learn what you need. Our algorithm automatically matches reciprocal learning interests between students.
        </p>
      </div>

      {/* SECTION 1: TEACH & LEARN PREFERENCES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* I Can Teach */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-600" />
              I Can Teach
            </h3>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
              {user?.teachSkills?.length || 0} Listed
            </span>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[3rem] items-center">
            {(user?.teachSkills || []).map((s, idx) => (
              <span key={idx} className="px-3 py-1 bg-emerald-50 text-emerald-800 font-semibold text-xs rounded-xl border border-emerald-200">
                {s.name || s} ({s.level || 'Intermediate'})
              </span>
            ))}
            {(user?.teachSkills || []).length === 0 && (
              <p className="text-xs text-slate-400">Add skills you are proficient enough to mentor others in.</p>
            )}
          </div>

          <form onSubmit={handleAddTeachSkill} className="flex gap-2">
            <input
              type="text"
              value={teachInput}
              onChange={(e) => setTeachInput(e.target.value)}
              placeholder="e.g. Python, React, Figma..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              Add
            </button>
          </form>
        </div>

        {/* I Want to Learn */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              I Want to Learn
            </h3>
            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200">
              {user?.learnSkills?.length || 0} Listed
            </span>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[3rem] items-center">
            {(user?.learnSkills || []).map((s, idx) => (
              <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-800 font-semibold text-xs rounded-xl border border-indigo-200">
                {s.name || s} ({s.level || 'Beginner'})
              </span>
            ))}
            {(user?.learnSkills || []).length === 0 && (
              <p className="text-xs text-slate-400">Add skills or domains you want to learn from peers.</p>
            )}
          </div>

          <form onSubmit={handleAddLearnSkill} className="flex gap-2">
            <input
              type="text"
              value={learnInput}
              onChange={(e) => setLearnInput(e.target.value)}
              placeholder="e.g. UI/UX, Machine Learning, Cybersecurity..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              Add
            </button>
          </form>
        </div>

      </div>

      {/* SECTION 2: MUTUAL SKILL SWAP OPPORTUNITIES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500 fill-current" />
            Detected Mutual Skill Swap Opportunities
          </h2>
          <span className="text-xs text-slate-500 font-semibold">User A teaches B ⇄ User B teaches A</span>
        </div>

        {mutualMatches.length === 0 ? (
          <EmptyState
            title="No mutual skill swaps found right now"
            message="Add more skills under 'I Can Teach' and 'I Want to Learn' to increase match triggers across campus."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mutualMatches.map((match) => (
              <div key={match.user._id} className="bg-gradient-to-br from-white to-purple-50/30 rounded-3xl border border-purple-200 p-6 shadow-xs hover:shadow-md transition-all space-y-4">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={match.user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.user.name)}`}
                      alt={match.user.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-purple-200"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{match.user.name}</h4>
                      <p className="text-xs text-slate-500">{match.user.department} • {match.user.year}</p>
                    </div>
                  </div>

                  {match.isMutual ? (
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Perfect Swap
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-800 text-xs font-bold rounded-full border border-indigo-200">
                      Partial Swap
                    </span>
                  )}
                </div>

                {/* Swap Visualizer Card */}
                <div className="p-4 bg-white rounded-2xl border border-purple-100 flex items-center justify-between gap-4 text-xs font-semibold">
                  <div className="text-center flex-1">
                    <span className="text-[10px] text-slate-400 uppercase block font-mono">You Teach</span>
                    <span className="text-emerald-700 font-bold text-sm block mt-0.5">
                      {match.youTeach.join(', ') || (user?.teachSkills?.[0]?.name || 'Your Skill')}
                    </span>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Repeat className="w-4 h-4" />
                  </div>

                  <div className="text-center flex-1">
                    <span className="text-[10px] text-slate-400 uppercase block font-mono">{match.user.name.split(' ')[0]} Teaches</span>
                    <span className="text-indigo-700 font-bold text-sm block mt-0.5">
                      {match.youLearn.join(', ') || (match.user.teachSkills?.[0]?.name || 'Peer Skill')}
                    </span>
                  </div>
                </div>

                {/* Propose Action */}
                <button
                  onClick={() => {
                    setSelectedTargetUser(match.user);
                    setOfferedSkill(match.youTeach[0] || user?.teachSkills?.[0]?.name || 'Python');
                    setRequestedSkill(match.youLearn[0] || match.user.teachSkills?.[0]?.name || 'UI/UX');
                  }}
                  className="w-full py-2.5 rounded-xl text-xs font-bold gradient-bg text-white shadow-xs hover:opacity-95 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Propose Skill Swap
                </button>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: INCOMING & OUTGOING PROPOSALS */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3">Active Skill Swap Proposals</h3>
        
        {incomingSwaps.length === 0 && outgoingSwaps.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No active skill swap proposals sent or received yet.</p>
        ) : (
          <div className="space-y-3">
            {[...incomingSwaps, ...outgoingSwaps].map((swap) => {
              const isIncoming = swap.receiver._id === user._id || swap.receiver === user._id;
              const otherUser = isIncoming ? swap.sender : swap.receiver;

              return (
                <div key={swap._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={otherUser.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name)}`}
                      alt={otherUser.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <p className="font-bold text-slate-900">
                        {isIncoming ? `${otherUser.name} proposed a swap` : `Proposal sent to ${otherUser.name}`}
                      </p>
                      <p className="text-slate-600 mt-0.5">
                        <strong className="text-emerald-700">Teach:</strong> {swap.offeredSkill} ⇄ <strong className="text-indigo-700 font-semibold">Learn:</strong> {swap.requestedSkill}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {swap.status === 'pending' && isIncoming && (
                      <>
                        <button
                          onClick={() => handleUpdateSwapStatus(swap._id, 'accepted')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleUpdateSwapStatus(swap._id, 'rejected')}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 font-bold rounded-xl"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {swap.status === 'pending' && !isIncoming && (
                      <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Pending
                      </span>
                    )}

                    {swap.status === 'accepted' && (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Accepted & Connected
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PROPOSAL MODAL */}
      {selectedTargetUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Propose Skill Swap</h3>
            <p className="text-xs text-slate-500 mb-4">Swap expertise with {selectedTargetUser.name}</p>

            <form onSubmit={handleSendProposal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Skill You Will Teach</label>
                <input
                  type="text"
                  required
                  value={offeredSkill}
                  onChange={(e) => setOfferedSkill(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Skill You Want to Learn</label>
                <input
                  type="text"
                  required
                  value={requestedSkill}
                  onChange={(e) => setRequestedSkill(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Proposal Message</label>
                <textarea
                  rows="3"
                  value={proposalMessage}
                  onChange={(e) => setProposalMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTargetUser(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingProposal}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold gradient-bg text-white shadow-xs hover:opacity-95"
                >
                  {sendingProposal ? 'Sending...' : 'Send Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
