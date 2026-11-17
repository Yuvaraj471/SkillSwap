import React from 'react';
import { SearchX } from 'lucide-react';

export const EmptyState = ({ title = 'No results found', message = 'Try adjusting your search query or filters.', actionLabel, onAction }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6 max-w-md mx-auto">
      <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100">
        <SearchX className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 mb-6">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 text-xs font-semibold gradient-bg text-white rounded-xl shadow-xs hover:opacity-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
