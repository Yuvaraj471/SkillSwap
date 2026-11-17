import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastNotification = () => {
  const { toast } = useAuth();

  if (!toast) return null;

  const bgColors = {
    success: 'bg-emerald-600 text-white shadow-emerald-500/20',
    error: 'bg-rose-600 text-white shadow-rose-500/20',
    info: 'bg-indigo-600 text-white shadow-indigo-500/20'
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 transition-all duration-300 transform translate-y-0 opacity-100">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border border-white/10 ${bgColors[toast.type] || bgColors.info}`}>
        {icons[toast.type] || icons.info}
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
    </div>
  );
};
