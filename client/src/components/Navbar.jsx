import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Zap, Bell, User, LogOut, Shield, Compass, Search, 
  PlusCircle, FolderKanban, ArrowUpDown, MessageSquare, ChevronDown
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout, unreadNotifications } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to={isAuthenticated ? (isAdmin ? '/admin' : '/dashboard') : '/'} className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Skill<span className="text-indigo-600">Swap</span></span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">Student SaaS</span>
          </div>
        </Link>

        {/* Center Nav Links (When Authenticated & Not Admin) */}
        {isAuthenticated && !isAdmin && (
          <nav className="hidden lg:flex items-center gap-1">
            <Link 
              to="/dashboard" 
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${location.pathname === '/dashboard' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/discover" 
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${location.pathname === '/discover' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              Discover Skills
            </Link>
            <Link 
              to="/partner-finder" 
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${location.pathname === '/partner-finder' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              Find Partners
            </Link>
            <Link 
              to="/projects" 
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${location.pathname.startsWith('/projects') ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              Projects
            </Link>
            <Link 
              to="/skill-swap" 
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${location.pathname === '/skill-swap' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              Skill Swap
            </Link>
          </nav>
        )}

        {/* Admin Navigation Header */}
        {isAuthenticated && isAdmin && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-800 rounded-lg text-xs font-semibold border border-amber-200">
            <Shield className="w-4 h-4 text-amber-600" />
            Admin Management Console
          </div>
        )}

        {/* Right Section Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Notification Bell */}
              {!isAdmin && (
                <Link 
                  to="/notifications" 
                  className="relative p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-all"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadNotifications}
                    </span>
                  )}
                </Link>
              )}

              {/* Connections / Messages */}
              {!isAdmin && (
                <Link 
                  to="/connections" 
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all"
                >
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  <span>Connections</span>
                </Link>
              )}

              {/* User Menu Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all"
                >
                  <img
                    src={user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=4f46e5&color=fff`}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-300"
                  />
                  <span className="hidden sm:inline-block text-sm font-semibold text-slate-800">{user?.name}</span>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                        {user?.department} • {user?.year}
                      </span>
                    </div>

                    {!isAdmin ? (
                      <>
                        <Link
                          to={`/profile/${user?._id}`}
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 font-medium"
                        >
                          <User className="w-4 h-4" /> My Profile
                        </Link>
                        <Link
                          to="/requests"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 font-medium"
                        >
                          <ArrowUpDown className="w-4 h-4" /> Requests
                        </Link>
                      </>
                    ) : (
                      <Link
                        to="/admin"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-700 font-medium"
                      >
                        <Shield className="w-4 h-4 text-amber-600" /> Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                        navigate('/login');
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 font-medium"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                to="/login" 
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-all"
              >
                Log In
              </Link>
              <Link 
                to="/register" 
                className="px-4 py-2 text-sm font-semibold text-white gradient-bg rounded-xl shadow-md hover:opacity-95 transition-all shadow-indigo-500/20"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
