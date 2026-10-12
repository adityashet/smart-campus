'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCheck, ShieldAlert, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { NotificationItem } from '@/types';
import { api } from '@/lib/api';
import Link from 'next/link';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const fetchNotifs = useCallback(async () => {
    const data = await api.getNotifications();
    setNotifications(data);
  }, []);

  useEffect(() => {
    let isMounted = true;
    api.getNotifications().then((data) => {
      if (isMounted) setNotifications(data);
    });
    const interval = setInterval(() => {
      api.getNotifications().then((data) => {
        if (isMounted) setNotifications(data);
      });
    }, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    const updated = await api.markAllNotificationsRead();
    setNotifications(updated);
  };

  const handleMarkRead = async (id: string) => {
    const updated = await api.markNotificationRead(id);
    setNotifications(updated);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-xl border border-slate-200 z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-medium">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">No notifications</div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleMarkRead(item.id)}
                    className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 ${
                      !item.read ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {item.type === 'CRITICAL' ? (
                        <div className="p-1.5 rounded-full bg-red-100 text-red-600">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                      ) : item.type === 'ASSIGNMENT' ? (
                        <div className="p-1.5 rounded-full bg-blue-100 text-blue-600">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="p-1.5 rounded-full bg-slate-100 text-slate-600">
                          <Info className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-slate-900 truncate">{item.title}</h4>
                        <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">{item.message}</p>
                      {item.complaintId && (
                        <Link
                          href={`/complaints/${item.complaintId}`}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline mt-1 font-medium"
                        >
                          View Details <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
