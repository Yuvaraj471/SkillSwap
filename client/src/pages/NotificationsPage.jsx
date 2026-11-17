import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { Bell, CheckCircle2, CheckCheck, Clock, ArrowRight } from 'lucide-react';

export const NotificationsPage = () => {
  const { fetchNotificationCount } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const res = await axios.put(`/api/notifications/${id}/read`);
      if (res.data.success) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        fetchNotificationCount();
      }
    } catch (err) {
      // Silent
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await axios.put('/api/notifications/read-all');
      if (res.data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        fetchNotificationCount();
      }
    } catch (err) {
      // Silent
    }
  };

  if (loading) return <LoadingSpinner label="Fetching your notifications..." />;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-xs text-slate-500 mt-1">
            Stay updated with collaboration requests, skill swap proposals, project updates, and new connections.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-all flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4" /> Mark All as Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState title="No notifications" message="You are all caught up!" />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                notif.isRead
                  ? 'bg-white border-slate-200 opacity-85'
                  : 'bg-indigo-50/60 border-indigo-200 shadow-xs cursor-pointer'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  notif.isRead ? 'bg-slate-100 text-slate-500' : 'bg-indigo-600 text-white shadow-xs'
                }`}>
                  <Bell className="w-4 h-4" />
                </div>

                <div>
                  <p className={`text-xs ${notif.isRead ? 'text-slate-700 font-medium' : 'text-slate-900 font-bold'}`}>
                    {notif.message}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {!notif.isRead && (
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0 mt-2"></span>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
