import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Search, Users, FolderKanban, 
  Repeat, ArrowUpDown, Bell, User, Settings, Shield, Flag
} from 'lucide-react';

export const Sidebar = () => {
  const { user, isAdmin, unreadNotifications } = useAuth();

  const studentLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Discover Skills', path: '/discover', icon: Search },
    { name: 'Find Partners', path: '/partner-finder', icon: Users },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Skill Swap', path: '/skill-swap', icon: Repeat },
    { name: 'Requests', path: '/requests', icon: ArrowUpDown },
    { name: 'Connections', path: '/connections', icon: Users },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadNotifications },
    { name: 'My Profile', path: `/profile/${user?._id}`, icon: User },
  ];

  const adminLinks = [
    { name: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Project Management', path: '/admin/projects', icon: FolderKanban },
    { name: 'Reports & Flagged', path: '/admin/reports', icon: Flag },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <aside className="w-64 shrink-0 hidden md:block border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            {isAdmin ? 'Admin Console' : 'Navigation'}
          </p>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? isAdmin
                          ? 'bg-amber-50 text-amber-900 font-semibold border border-amber-200 shadow-xs'
                          : 'bg-indigo-50 text-indigo-600 font-semibold border border-indigo-100 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </div>
                  {link.badge > 0 ? (
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {link.badge}
                    </span>
                  ) : null}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Quick Info Box */}
        <div className="pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <img
                src={user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}`}
                alt={user?.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-300"
              />
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.department}</p>
                <span className="inline-block text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded mt-0.5">
                  ● {user?.availability || 'Available'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
