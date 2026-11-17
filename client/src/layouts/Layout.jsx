import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { ToastNotification } from '../components/ToastNotification';
import { useAuth } from '../context/AuthContext';

export const Layout = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  const isPublicPage = ['/', '/login', '/register', '/admin/login'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900">
      <Navbar />

      <div className="flex-1 flex w-full">
        {/* Render Sidebar on authenticated student/admin pages */}
        {isAuthenticated && !isPublicPage && <Sidebar />}

        <main className={`flex-1 ${!isPublicPage ? 'p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full' : ''}`}>
          <Outlet />
        </main>
      </div>

      <ToastNotification />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 SkillSwap — Skill-Based Collaboration & Project Partner Finder.</p>
          <p className="font-medium text-slate-600">Find Skills. Build Teams. Create Together.</p>
        </div>
      </footer>
    </div>
  );
};
