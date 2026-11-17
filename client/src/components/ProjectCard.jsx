import React from 'react';
import { Link } from 'react-router-dom';
import { SkillBadge } from './SkillBadge';
import { Users, Calendar, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export const ProjectCard = ({ project, onJoin, isMember, isOwner }) => {
  const membersCount = project.members?.length || 1;
  const maxTeamSize = project.maxTeamSize || 4;
  const deadlineDate = project.deadline ? new Date(project.deadline).toLocaleDateString() : 'TBD';

  const statusColors = {
    'Planning': 'bg-sky-50 text-sky-700 border-sky-200',
    'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
    'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Category & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
            {project.category}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColors[project.status] || statusColors['Planning']}`}>
            {project.status}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
          {project.title}
        </h3>
        <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
          {project.description}
        </p>

        {/* Required Skills */}
        <div className="mb-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Required Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {(project.requiredSkills || []).map((skill, idx) => (
              <SkillBadge key={idx} name={skill} />
            ))}
          </div>
        </div>

        {/* Match Percentage if available */}
        {project.matchPercentage !== undefined && (
          <div className="mb-4 p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center justify-between text-xs">
            <span className="text-indigo-900 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Skill Match Score
            </span>
            <span className="font-bold text-indigo-700">{project.matchPercentage}% Match</span>
          </div>
        )}

        {/* Owner Info */}
        {project.owner && (
          <div className="flex items-center gap-2 py-2 px-3 bg-slate-50 rounded-xl border border-slate-100 mb-4">
            <img
              src={project.owner.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.owner.name)}`}
              alt={project.owner.name}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-xs font-medium text-slate-700">Led by <strong>{project.owner.name}</strong></span>
          </div>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-500" /> {membersCount} / {maxTeamSize} Members
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" /> {deadlineDate}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/projects/${project._id}`}
            className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-1"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {!isOwner && !isMember && onJoin && (
            <button
              onClick={() => onJoin(project)}
              className="py-2 px-4 rounded-xl text-xs font-semibold gradient-bg text-white hover:opacity-95 shadow-xs transition-all"
            >
              Request Join
            </button>
          )}

          {isMember && (
            <span className="py-2 px-3 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Joined
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
