import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { SkillBadge } from '../components/SkillBadge';
import { MessageDrawer } from '../components/MessageDrawer';
import { Users, MessageSquare, ArrowRight, UserCheck } from 'lucide-react';

export const ConnectionsPage = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMessageUser, setActiveMessageUser] = useState(null);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/auth/me');
      if (res.data.success && res.data.data.connections) {
        setConnections(res.data.data.connections);
      }
    } catch (err) {
      console.error('Failed to load connections:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading your connections..." />;

  return (
    <div className="space-y-8">
      
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Connections</h1>
        <p className="text-xs text-slate-500 mt-1">
          Connected peers with accepted collaboration requests or skill swaps. Send direct messages or invite them to projects.
        </p>
      </div>

      {connections.length === 0 ? (
        <EmptyState
          title="No connections yet"
          message="Discover peers and send collaboration requests to start building your network."
          actionLabel="Discover Students"
          onAction={() => window.location.href = '/discover'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connections.map((conn) => (
            <div key={conn._id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between">
              
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={conn.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(conn.name)}`}
                    alt={conn.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{conn.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{conn.department} • {conn.year}</p>
                    <span className="inline-block text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded mt-0.5">
                      ● {conn.availability || 'Available'}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Top Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(conn.skills || []).slice(0, 3).map((s, idx) => (
                      <SkillBadge key={idx} name={typeof s === 'string' ? s : s.name} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  to={`/profile/${conn._id}`}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all text-center"
                >
                  View Profile
                </Link>

                <button
                  onClick={() => setActiveMessageUser(conn)}
                  className="py-2 px-4 rounded-xl text-xs font-semibold gradient-bg text-white shadow-xs hover:opacity-95 transition-all flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Message</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* MESSAGE DRAWER */}
      {activeMessageUser && (
        <MessageDrawer
          targetUser={activeMessageUser}
          onClose={() => setActiveMessageUser(null)}
        />
      )}

    </div>
  );
};
