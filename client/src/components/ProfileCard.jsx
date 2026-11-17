import React from 'react';
import { Link } from 'react-router-dom';
import { SkillBadge } from './SkillBadge';
import { UserCheck, Sparkles, Send, ArrowRight } from 'lucide-react';

export const ProfileCard = ({ student, onConnect, isConnected, onProposeSwap }) => {
  const matchPercentage = student.matchPercentage ?? 85;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Header with image, details & match percentage */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <img
              src={student.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}`}
              alt={student.name}
              className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs group-hover:scale-105 transition-transform"
            />
            <div>
              <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {student.name}
              </h3>
              <p className="text-xs font-medium text-slate-500">
                {student.department} • {student.year}
              </p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                @{student.username}
              </p>
            </div>
          </div>

          {/* Match Score Badge */}
          {matchPercentage !== undefined && (
            <div className="shrink-0 text-right">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                matchPercentage >= 80 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : matchPercentage >= 60 
                  ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                  : 'bg-slate-100 text-slate-700'
              }`}>
                <Sparkles className="w-3 h-3 text-current" />
                {matchPercentage}% Match
              </span>
            </div>
          )}
        </div>

        {/* Bio */}
        {student.bio && (
          <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
            "{student.bio}"
          </p>
        )}

        {/* Top Skills */}
        <div className="mb-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {(student.skills || []).slice(0, 4).map((skill, idx) => (
              <SkillBadge 
                key={idx} 
                name={typeof skill === 'string' ? skill : skill.name} 
                category={skill.category}
              />
            ))}
            {(student.skills || []).length > 4 && (
              <span className="text-xs text-slate-400 self-center font-medium">
                +{student.skills.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Teach / Learn tags if available */}
        {((student.teachSkills && student.teachSkills.length > 0) || (student.learnSkills && student.learnSkills.length > 0)) && (
          <div className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-1 mb-4 border border-slate-100">
            {student.teachSkills?.length > 0 && (
              <p className="text-slate-600 truncate">
                <strong className="text-emerald-700 font-semibold">Teaches:</strong> {student.teachSkills.map(s => s.name || s).join(', ')}
              </p>
            )}
            {student.learnSkills?.length > 0 && (
              <p className="text-slate-600 truncate">
                <strong className="text-indigo-700 font-semibold">Wants to learn:</strong> {student.learnSkills.map(s => s.name || s).join(', ')}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link
          to={`/profile/${student._id}`}
          className="flex-1 text-center py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-1"
        >
          <span>View Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        {onConnect && (
          <button
            onClick={() => onConnect(student)}
            disabled={isConnected}
            className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              isConnected
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                : 'gradient-bg text-white hover:opacity-95 shadow-xs'
            }`}
          >
            {isConnected ? (
              <>
                <UserCheck className="w-3.5 h-3.5" /> Connected
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" /> Connect
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
