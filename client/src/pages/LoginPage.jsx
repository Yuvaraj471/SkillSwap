import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Mail, Lock, Shield, ArrowRight, UserCheck } from 'lucide-react';

export const LoginPage = ({ isAdminPage = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = isAdminPage || location.pathname.includes('/admin');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    const result = await login(email, password, isAdmin);
    setIsSubmitting(false);

    if (result.success) {
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  };

  // Quick preset login helper for demonstration
  const handleQuickLogin = (presetEmail, presetPassword) => {
    setEmail(presetEmail);
    setPassword(presetPassword);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
        
        {/* Header Logo & Title */}
        <div className="text-center mb-8">
          <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white shadow-lg ${
            isAdmin ? 'bg-amber-600 shadow-amber-500/20' : 'gradient-bg shadow-indigo-500/20'
          }`}>
            {isAdmin ? <Shield className="w-7 h-7" /> : <Zap className="w-7 h-7 fill-current" />}
          </div>

          <h2 className="text-2xl font-bold text-slate-900">
            {isAdmin ? 'Admin Portal Login' : 'Welcome back to SkillSwap'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isAdmin ? 'Enter administrator credentials to access platform controls' : 'Log in to connect with peers and manage your projects'}
          </p>
        </div>

        {/* Demo Preset Buttons */}
        <div className="mb-6 p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-2 text-xs">
          <p className="font-bold text-indigo-900 text-center">⚡ Quick Demo Login Presets</p>
          <div className="grid grid-cols-2 gap-2">
            {!isAdmin ? (
              <>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('yuvaraj@skillswap.edu', 'password123')}
                  className="py-1.5 px-2 bg-white text-indigo-700 font-semibold rounded-xl border border-indigo-200 hover:bg-indigo-100 transition-all text-center truncate"
                >
                  Student: Yuvaraj D
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('gowri@skillswap.edu', 'password123')}
                  className="py-1.5 px-2 bg-white text-indigo-700 font-semibold rounded-xl border border-indigo-200 hover:bg-indigo-100 transition-all text-center truncate"
                >
                  Student: Gowri D
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@skillswap.edu', 'admin123')}
                className="col-span-2 py-1.5 px-2 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-all text-center"
              >
                Log in as Administrator (Admin Credentials)
              </button>
            )}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@skillswap.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-xl text-xs font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 ${
              isAdmin ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20' : 'gradient-bg shadow-indigo-500/20 hover:opacity-95'
            }`}
          >
            <span>{isSubmitting ? 'Authenticating...' : (isAdmin ? 'Admin Sign In' : 'Sign In')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Switch Links */}
        <div className="mt-6 pt-6 border-t border-slate-100 text-center space-y-2 text-xs">
          {!isAdmin ? (
            <>
              <p className="text-slate-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-bold text-indigo-600 hover:underline">
                  Register here
                </Link>
              </p>
              <p className="text-slate-400">
                Are you an Administrator?{' '}
                <Link to="/admin/login" className="font-bold text-amber-600 hover:underline">
                  Admin Login
                </Link>
              </p>
            </>
          ) : (
            <p className="text-slate-600">
              Return to Student Login?{' '}
              <Link to="/login" className="font-bold text-indigo-600 hover:underline">
                Student Login
              </Link>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
