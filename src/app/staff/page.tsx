'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { MobileSidebar } from '@/components/MobileSidebar';
import { StatCard } from '@/components/StatCard';
import { PriorityBadge } from '@/components/PriorityBadge';
import { PriorityScore } from '@/components/PriorityScore';
import { ComplaintStatusBadge } from '@/components/ComplaintStatusBadge';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { useAuth } from '@/components/AuthProvider';
import { api } from '@/lib/api';
import { Complaint } from '@/types';
import Link from 'next/link';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function StaffDashboard() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await api.getComplaints();
      setComplaints(data);
      setLoading(false);
    }
    loadData();
  }, []);

  // Staff assigned tasks logic
  const assigned = complaints.filter(
    (c) =>
      c.assignedStaffId === 'stf-1' ||
      c.assignedStaffName?.toLowerCase().includes('rahul') ||
      c.assignedDepartmentId === 'dept-elec' ||
      user?.role === 'STAFF'
  );

  const pending = assigned.filter((c) => c.status === 'ASSIGNED' || c.status === 'SUBMITTED').length;
  const inProgress = assigned.filter((c) => c.status === 'IN_PROGRESS').length;
  const resolvedToday = assigned.filter((c) => c.status === 'RESOLVED').length;

  const priorityQueue = [...assigned].sort((a, b) => b.priorityScore - a.priorityScore);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenMobileMenu={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-3 border border-amber-500/30">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Maintenance Staff Portal</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Welcome back, {user?.name || 'Rahul Kumar'}!
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                  Monitor assigned campus repair tickets, accept dispatches, update work status, and record resolutions.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href="/staff/complaints"
                  className="flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  <Wrench className="w-4 h-4" />
                  <span>View All Assigned ({assigned.length})</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Stat Cards */}
          {loading ? (
            <SkeletonLoader type="cards" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Assigned"
                value={assigned.length}
                icon={Wrench}
                subtitle="Assigned maintenance tasks"
                colorScheme="blue"
              />
              <StatCard
                title="Pending Acceptance"
                value={pending}
                icon={Clock}
                subtitle="Awaiting technician review"
                colorScheme="amber"
              />
              <StatCard
                title="In Progress"
                value={inProgress}
                icon={Wrench}
                subtitle="Active repairs underway"
                colorScheme="purple"
              />
              <StatCard
                title="Resolved Today"
                value={resolvedToday}
                icon={CheckCircle2}
                subtitle="Completed tickets"
                colorScheme="emerald"
              />
            </div>
          )}

          {/* Priority Queue for Assigned Staff */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Assigned Priority Queue</h2>
                <p className="text-xs text-slate-500">Highest urgency complaints ranked first</p>
              </div>
              <Link href="/staff/complaints" className="text-xs font-bold text-blue-600 hover:underline">
                Manage All →
              </Link>
            </div>

            {loading ? (
              <SkeletonLoader type="table" />
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="py-3.5 px-4">Complaint ID</th>
                        <th className="py-3.5 px-4">Issue & Room</th>
                        <th className="py-3.5 px-4">Priority Score</th>
                        <th className="py-3.5 px-4">Priority</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {priorityQueue.map((item) => (
                        <tr
                          key={item.id}
                          className={`hover:bg-slate-50 transition-colors ${
                            item.priorityLevel === 'CRITICAL' ? 'bg-red-50/40 border-l-4 border-l-red-600' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{item.complaintNumber}</td>
                          <td className="py-3.5 px-4 max-w-xs">
                            <Link
                              href={`/staff/complaints/${item.id}`}
                              className="font-bold text-slate-900 hover:text-blue-600 line-clamp-1"
                            >
                              {item.title}
                            </Link>
                            <span className="text-[11px] text-slate-500 block">{item.locationName} • {item.roomDetails}</span>
                          </td>
                          <td className="py-3.5 px-4 min-w-[120px]">
                            <PriorityScore score={item.priorityScore} size="sm" />
                          </td>
                          <td className="py-3.5 px-4">
                            <PriorityBadge priority={item.priorityLevel} size="sm" />
                          </td>
                          <td className="py-3.5 px-4">
                            <ComplaintStatusBadge status={item.status} size="sm" />
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Link
                              href={`/staff/complaints/${item.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors shadow-2xs"
                            >
                              <span>Workflow</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
