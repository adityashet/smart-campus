'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  User,
  ShieldAlert,
  BarChart3,
  RefreshCw,
  Users,
  Settings,
  LogOut,
  Wrench,
  X,
  ClipboardList,
} from 'lucide-react';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const role = user?.role || 'STUDENT';

  if (!isOpen) return null;

  const studentNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Complaints', href: '/complaints', icon: FileText },
    { name: 'Submit Complaint', href: '/complaints/new', icon: PlusCircle },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const staffNav = [
    { name: 'Staff Dashboard', href: '/staff', icon: LayoutDashboard },
    { name: 'Assigned Complaints', href: '/staff/complaints', icon: ClipboardList },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const adminNav = [
    { name: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'All Complaints', href: '/admin/complaints', icon: FileText },
    { name: 'Priority Queue', href: '/admin/priority-queue', icon: ShieldAlert },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Recurring Problems', href: '/admin/recurring-problems', icon: RefreshCw },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const navItems = role === 'ADMIN' ? adminNav : role === 'STAFF' ? staffNav : studentNav;

  const handleLogout = () => {
    logout();
    onClose();
    router.push('/login');
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl flex flex-col z-50">
        <div className="flex items-center justify-between px-6 h-16 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-base font-bold text-slate-900">CampusFix</span>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {role} Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
