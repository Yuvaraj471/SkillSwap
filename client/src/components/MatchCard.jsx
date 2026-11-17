import React from 'react';
import { Link } from 'react-router-dom';
import { SkillBadge } from './SkillBadge';
import { Sparkles, Send, CheckCircle, XCircle } from 'lucide-react';

export const MatchCard = ({ candidate, rank, onInvite }) => {
  const matchPercentage = candidate.matchPercentage || 0;
  const matchedSkills = candidate.matchedSkills || [];
  const missingSkills = candidate.missingSkills || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Left: Rank + Avatar + Name */}
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-sm text-indigo-700 shrink-0">
            #{rank}
          </div>
          <img
            src={candidate.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}`}
            alt={candidate.name}
            className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
          />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 text-base">{candidate.name}</h4>
              <span className="text-xs font-mono text-slate-400">@{candidate.username}</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {candidate.department} • {candidate.year}
            </p>
            {candidate.bio && (
              <p className="text-xs text-slate-600 line-clamp-1 mt-1">"{candidate.bio}"</p>
            )}
          </div>
        </div>

        {/* Center: Match Formula Display */}
        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100 shrink-0">
          <div className="text-center px-2">
            <div className="flex items-center justify-center gap-1 text-lg font-black text-indigo-600">
              <Sparkles className="w-4 h-4 fill-current" />
              {matchPercentage}%
            </div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase">Skill Match</span>
          </div>

          <div className="h-8 w-px bg-slate-200"></div>

          {/* Breakdown checklist */}
          <div className="space-y-1 text-xs">
            {matchedSkills.length > 0 && (
              <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Matched: <strong>{matchedSkills.join(', ')}</strong></span>
              </div>
            )}
            {missingSkills.length > 0 && (
              <div className="flex items-center gap-1.5 text-rose-600 font-medium">
                <XCircle className="w-3.5 h-3.5 text-rose-500" />
                <span>Missing: {missingSkills.join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center sm:flex-col gap-2 shrink-0 justify-end">
          <Link
            to={`/profile/${candidate._id}`}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all text-center"
          >
            View Profile
          </Link>
          <button
            onClick={() => onInvite(candidate)}
            className="px-4 py-2 rounded-xl text-xs font-semibold gradient-bg text-white hover:opacity-95 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            Connect / Invite
          </button>
        </div>

      </div>
    </div>
  );
};
