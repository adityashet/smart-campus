'use client';

import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { UserAvatar } from './UserAvatar';
import { NotificationDropdown } from './NotificationDropdown';
import { Search, Menu, LogOut, User as UserIcon, Shield, Laptop, GraduationCap, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export function Header({ onOpenMobileMenu }: HeaderProps) {
  const { user, logout, switchRole } = useAuth();
  const router = useRouter();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showDemoRoleMenu, setShowDemoRoleMenu] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleRoleSwitch = (role: 'STUDENT' | 'STAFF' | 'ADMIN') => {
    switchRole(role);
    setShowDemoRoleMenu(false);
    if (role === 'ADMIN') router.push('/admin');
    else if (role === 'STAFF') router.push('/staff');
    else router.push('/dashboard');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-6 shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar */}
        <div className="relative hidden md:block w-64 lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search complaints, rooms, staff..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const target = e.target as HTMLInputElement;
                if (target.value.trim()) {
                  const path = user?.role === 'ADMIN' ? '/admin/complaints' : user?.role === 'STAFF' ? '/staff/complaints' : '/complaints';
                  router.push(`${path}?search=${encodeURIComponent(target.value.trim())}`);
                }
              }
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Quick Demo Role Switcher Badge */}
        <div className="relative">
          <button
            onClick={() => setShowDemoRoleMenu(!showDemoRoleMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors shadow-2xs"
            title="Switch Demo Account Role"
          >
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Role: <strong className="font-semibold">{user?.role || 'STUDENT'}</strong></span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {showDemoRoleMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDemoRoleMenu(false)} />
              <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white shadow-xl border border-slate-200 z-50 p-1.5">
                <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Quick Demo Switcher
                </div>
                <button
                  onClick={() => handleRoleSwitch('STUDENT')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg transition-colors ${
                    user?.role === 'STUDENT' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>Student View</span>
                </button>
                <button
                  onClick={() => handleRoleSwitch('STAFF')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg transition-colors ${
                    user?.role === 'STAFF' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Laptop className="w-4 h-4 text-amber-600" />
                  <span>Staff Portal</span>
                </button>
                <button
                  onClick={() => handleRoleSwitch('ADMIN')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg transition-colors ${
                    user?.role === 'ADMIN' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Shield className="w-4 h-4 text-purple-600" />
                  <span>Admin Panel</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Notifications */}
        <NotificationDropdown />

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100 transition-colors focus:outline-none"
          >
            <UserAvatar user={user} size="sm" showRoleBadge />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 leading-tight">{user?.name || 'User'}</span>
              <span className="text-[10px] text-slate-500 font-medium">{user?.role || 'STUDENT'}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showUserDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserDropdown(false)} />
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-200 z-50 p-1.5 divide-y divide-slate-100">
                <div className="px-3 py-2">
                  <p className="text-xs font-semibold text-slate-900">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  <Link
                    href="/profile"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span>My Profile</span>
                  </Link>
                </div>
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-medium"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
