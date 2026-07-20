'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, BellRing, Check, CheckCircle2 } from 'lucide-react';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

export function SpideyHeader({ title, user }: { title: string, user?: { email: string, role: string } }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/logout', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        router.push(data.redirect || '/login');
        router.refresh();
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: notif.id })
      });
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      setShowDropdown(false);
      router.push(notif.link);
      router.refresh();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true })
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="bg-[#0B0B12] border-b border-red-900/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl leading-none">G</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Genesis Portal</h1>
            <span className="hidden sm:inline-block ml-4 text-sm font-medium text-red-500 uppercase tracking-wider">{title}</span>
          </div>
          
          {user && (
            <div className="flex items-center gap-4 relative" ref={dropdownRef}>
              {/* Notification Bell */}
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-gray-800/40 transition-all cursor-pointer flex items-center justify-center"
                title="Notifications"
              >
                {unreadCount > 0 ? (
                  <>
                    <BellRing className="w-5 h-5 text-red-500 animate-pulse" />
                    <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-lg border border-[#0B0B12]">
                      {unreadCount}
                    </span>
                  </>
                ) : (
                  <Bell className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {/* Notification Dropdown */}
              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-[#12121B]/95 border border-red-900/40 rounded-lg shadow-2xl overflow-hidden z-50 backdrop-blur-md transform transition-all duration-200 ease-out origin-top-right">
                  <div className="p-3 border-b border-red-900/30 flex justify-between items-center bg-[#0B0B12]/90">
                    <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">Notifications</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllRead}
                        className="text-[10px] text-red-400 hover:text-red-300 font-semibold cursor-pointer flex items-center gap-1 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" /> Mark all read
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-72 overflow-y-auto divide-y divide-red-950/30">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                        <Bell className="w-6 h-6 text-gray-600 stroke-[1.5]" />
                        <span className="text-xs text-gray-500 italic">No new notifications</span>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-3.5 text-left text-xs cursor-pointer transition-all hover:bg-red-950/15 ${
                            !n.is_read ? 'bg-red-950/5 border-l-2 border-red-500' : 'bg-transparent'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <span className="font-semibold text-gray-200 flex items-center gap-1.5">
                              {!n.is_read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                              )}
                              {n.title}
                            </span>
                            <span className="text-[9px] text-gray-500 whitespace-nowrap shrink-0 pt-0.5">
                              {new Date(n.created_at).toLocaleDateString(undefined, { hour: 'numeric', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-gray-400 line-clamp-2 leading-relaxed mt-0.5">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              <span className="text-sm text-gray-400 hidden sm:inline-block">{user.email}</span>
              <form onSubmit={handleLogout}>
                <button type="submit" className="text-sm font-medium text-red-500 hover:text-red-400 transition-colors cursor-pointer">
                  Sign Out
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
