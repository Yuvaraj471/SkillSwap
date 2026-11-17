import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { SkillBadge } from '../components/SkillBadge';
import { ArrowUpDown, Check, X, Clock, UserCheck, MessageSquare, Send } from 'lucide-react';

export const CollaborationRequestsPage = () => {
  const { showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('received'); // received | sent | accepted | rejected

  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const resReceived = await axios.get('/api/requests/received');
      if (resReceived.data.success) {
        setReceivedRequests(resReceived.data.data);
      }

      const resSent = await axios.get('/api/requests/sent');
      if (resSent.data.success) {
        setSentRequests(resSent.data.data);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId, status) => {
    try {
      const res = await axios.put(`/api/requests/${requestId}`, { status });
      if (res.data.success) {
        showToast(`Request ${status} successfully!`, 'success');
        fetchRequests();
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Update failed', 'error');
    }
  };

  if (loading) return <LoadingSpinner label="Fetching collaboration requests..." />;

  // Filter requests based on tab
  let displayedItems = [];
  if (activeTab === 'received') {
    displayedItems = receivedRequests.filter(r => r.status === 'pending');
  } else if (activeTab === 'sent') {
    displayedItems = sentRequests.filter(r => r.status === 'pending');
  } else if (activeTab === 'accepted') {
    displayedItems = [
      ...receivedRequests.filter(r => r.status === 'accepted'),
      ...sentRequests.filter(r => r.status === 'accepted')
    ];
  } else if (activeTab === 'rejected') {
    displayedItems = [
      ...receivedRequests.filter(r => r.status === 'rejected'),
      ...sentRequests.filter(r => r.status === 'rejected')
    ];
  }

  return (
    <div className="space-y-8">
      
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Collaboration Requests</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage incoming collaboration requests, sent invitations, and active team connections.
        </p>
      </div>

      {/* TABS HEADER */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'received', label: 'Received Requests', count: receivedRequests.filter(r => r.status === 'pending').length },
          { id: 'sent', label: 'Sent Requests', count: sentRequests.filter(r => r.status === 'pending').length },
          { id: 'accepted', label: 'Accepted / Connected', count: receivedRequests.filter(r => r.status === 'accepted').length + sentRequests.filter(r => r.status === 'accepted').length },
          { id: 'rejected', label: 'Rejected', count: receivedRequests.filter(r => r.status === 'rejected').length + sentRequests.filter(r => r.status === 'rejected').length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ITEMS LIST */}
      {displayedItems.length === 0 ? (
        <EmptyState
          title={`No ${activeTab} requests found`}
          message="When students send or accept collaboration requests, they will appear here."
        />
      ) : (
        <div className="space-y-4">
          {displayedItems.map((req) => {
            const isIncoming = activeTab === 'received' || (activeTab !== 'sent' && req.receiver._id !== req.sender._id);
            const otherUser = isIncoming ? req.sender : req.receiver;

            return (
              <div key={req._id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Left: User Avatar & Details */}
                  <div className="flex items-start gap-4">
                    <img
                      src={otherUser.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name)}`}
                      alt={otherUser.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{otherUser.name}</h4>
                        <span className="text-xs font-mono text-slate-400">@{otherUser.username}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {otherUser.department} • {otherUser.year}
                      </p>
                      
                      {/* Message bubble */}
                      <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2 line-clamp-2">
                        "{req.message}"
                      </p>

                      {/* Project Tag if applicable */}
                      {req.project && (
                        <span className="inline-block mt-2 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100">
                          Project: {req.project.title}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions or Status Badge */}
                  <div className="flex items-center sm:flex-col gap-2 shrink-0 justify-end">
                    
                    {req.status === 'pending' && isIncoming && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateStatus(req._id, 'accepted')}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center gap-1"
                        >
                          <Check className="w-4 h-4" /> Accept
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(req._id, 'rejected')}
                          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 border border-slate-200 transition-all flex items-center gap-1"
                        >
                          <X className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    )}

                    {req.status === 'pending' && !isIncoming && (
                      <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Pending Response
                      </span>
                    )}

                    {req.status === 'accepted' && (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5" /> Connected
                        </span>
                        <Link
                          to="/connections"
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold gradient-bg text-white shadow-xs flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Message
                        </Link>
                      </div>
                    )}

                    {req.status === 'rejected' && (
                      <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        Rejected
                      </span>
                    )}

                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
