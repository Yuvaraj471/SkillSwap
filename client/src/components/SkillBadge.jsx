import React from 'react';

export const SkillBadge = ({ name, category, proficiency, matched, onClick, removable, onRemove }) => {
  let badgeStyle = "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100";

  if (matched === true) {
    badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold";
  } else if (matched === false) {
    badgeStyle = "bg-rose-50 text-rose-700 border-rose-200 opacity-70 line-through";
  } else if (category === 'Design') {
    badgeStyle = "bg-purple-50 text-purple-700 border-purple-200";
  } else if (category === 'AI' || category === 'Machine Learning') {
    badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
  } else if (category === 'Backend' || category === 'DevOps') {
    badgeStyle = "bg-cyan-50 text-cyan-700 border-cyan-200";
  }

  return (
    <span 
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-all ${badgeStyle} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {matched === true && <span className="text-emerald-600">✓</span>}
      {matched === false && <span className="text-rose-500">✗</span>}
      {name}
      {proficiency !== undefined && <span className="text-[10px] opacity-75 font-mono">({proficiency}%)</span>}
      {removable && (
        <button 
          onClick={(e) => { e.stopPropagation(); onRemove && onRemove(name); }}
          className="ml-1 hover:text-rose-600 font-bold"
        >
          ×
        </button>
      )}
    </span>
  );
};
