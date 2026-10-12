'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { MobileSidebar } from '@/components/MobileSidebar';
import { PageHeader } from '@/components/PageHeader';
import { UserAvatar } from '@/components/UserAvatar';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { useToast } from '@/components/Toast';
import { api } from '@/lib/api';
import { User, Role } from '@/types';
import { Users as UsersIcon, Shield, Laptop, GraduationCap, UserCheck, UserX } from 'lucide-react';

export default function AdminUsersPage() {
  const { showToast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Role | 'ALL'>('ALL');

  // Deactivation state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    const data = await api.getUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = activeTab === 'ALL' ? users : users.filter((u) => u.role === activeTab);

  const handleToggleStatus = async () => {
    if (!selectedUser) return;
    try {
      const updated = await api.toggleUserStatus(selectedUser.id);
      setUsers(updated);
      showToast(
        'Status Changed',
        `${selectedUser.name} account is now ${selectedUser.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'}.`,
        'success'
      );
    } catch (err) {
      console.error(err);
      showToast('Error', 'Could not update user status.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenMobileMenu={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <PageHeader
            title="User Management"
            subtitle="Administer registered students, technicians, staff members, and system administrators."
            breadcrumbs={[{ label: 'Admin Panel', href: '/admin' }, { label: 'User Management' }]}
          />

          {/* Role Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            {[
              { id: 'ALL', label: 'All Users', icon: UsersIcon },
              { id: 'STUDENT', label: 'Students', icon: GraduationCap },
              { id: 'STAFF', label: 'Staff / Techs', icon: Laptop },
              { id: 'ADMIN', label: 'Administrators', icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Users Table */}
          {loading ? (
            <SkeletonLoader type="table" />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">User</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Department</th>
                      <th className="py-3.5 px-4">Phone</th>
                      <th className="py-3.5 px-4">Account Status</th>
                      <th className="py-3.5 px-4">Joined Date</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <UserAvatar user={u} size="sm" />
                            <div>
                              <span className="font-bold text-slate-900 block">{u.name}</span>
                              <span className="text-[11px] text-slate-400 block">{u.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              u.role === 'ADMIN'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : u.role === 'STAFF'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">{u.department || 'N/A'}</td>
                        <td className="py-3.5 px-4 text-slate-600">{u.phone}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                              u.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{u.joinedDate}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setShowConfirmModal(true);
                            }}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1 ${
                              u.status === 'ACTIVE'
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {u.status === 'ACTIVE' ? (
                              <>
                                <UserX className="w-3.5 h-3.5" />
                                <span>Deactivate</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Activate</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <ConfirmDialog
            isOpen={showConfirmModal}
            onClose={() => setShowConfirmModal(false)}
            onConfirm={handleToggleStatus}
            title={`${selectedUser?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} User Account`}
            message={`Are you sure you want to ${
              selectedUser?.status === 'ACTIVE' ? 'deactivate' : 'activate'
            } ${selectedUser?.name}?`}
            confirmLabel={selectedUser?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            isDangerous={selectedUser?.status === 'ACTIVE'}
          />
        </main>
      </div>
    </div>
  );
}
