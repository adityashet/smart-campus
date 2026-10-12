'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { MobileSidebar } from '@/components/MobileSidebar';
import { StatCard } from '@/components/StatCard';
import { PriorityBadge } from '@/components/PriorityBadge';
import { PriorityScore } from '@/components/PriorityScore';
import { ComplaintStatusBadge } from '@/components/ComplaintStatusBadge';
import { AssignModal } from '@/components/AssignModal';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { useAuth } from '@/components/AuthProvider';
import { api } from '@/lib/api';
import { Complaint, AnalyticsData } from '@/types';
import Link from 'next/link';
import {
  FileText,
  ShieldAlert,
  Clock,
  Wrench,
  CheckCircle2,
  TrendingUp,
  UserCheck,
  BarChart3,
  RefreshCw,
  Users as UsersIcon,
  ArrowRight,
} from 'lucide-react';

// Recharts components
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Assign Modal
  const [assigningComplaint, setAssigningComplaint] = useState<Complaint | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    const complaintsData = await api.getComplaints();
    const analyticsData = await api.getAnalytics();
    setComplaints(complaintsData);
    setAnalytics(analyticsData);
    setLoading(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const criticalComplaints = complaints.filter(
    (c) => c.priorityLevel === 'CRITICAL' || c.priorityScore >= 76
  );

  const COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444'];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenMobileMenu={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-3 border border-purple-500/30">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Campus Administration Triage Center</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Welcome back, {user?.name || 'Administrator'}! 👋
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                  Admin Control Panel &bull; Real-time campus maintenance operations, automated priority ranking, department allocation, and analytics.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Link
                  href="/admin/priority-queue"
                  className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Priority Queue</span>
                </Link>
                <Link
                  href="/admin/analytics"
                  className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 font-bold text-xs rounded-xl hover:bg-slate-100 shadow-md transition-all"
                >
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span>Analytics Report</span>
                </Link>
              </div>
            </div>
          </div>

          {/* KPI Stat Cards */}
          {loading || !analytics ? (
            <SkeletonLoader type="cards" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              <StatCard
                title="Total Issues"
                value={analytics.totalComplaints}
                icon={FileText}
                subtitle="All campus complaints"
                colorScheme="blue"
              />
              <StatCard
                title="Critical Urgency"
                value={analytics.criticalCount}
                icon={ShieldAlert}
                subtitle="Score >= 76"
                colorScheme="red"
              />
              <StatCard
                title="Pending Triage"
                value={analytics.pendingCount}
                icon={Clock}
                subtitle="Needs assignment"
                colorScheme="amber"
              />
              <StatCard
                title="In Progress"
                value={analytics.inProgressCount}
                icon={Wrench}
                subtitle="Active repairs"
                colorScheme="purple"
              />
              <StatCard
                title="Resolved"
                value={analytics.resolvedCount}
                icon={CheckCircle2}
                subtitle="Closed tickets"
                colorScheme="emerald"
              />
              <StatCard
                title="Avg Turnaround"
                value={`${analytics.avgResolutionHours} hrs`}
                icon={TrendingUp}
                subtitle="Resolution velocity"
                colorScheme="slate"
              />
            </div>
          )}

          {/* Recharts Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Line Chart: Complaint Trend */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">Complaint Trend Over Time</h3>
                  <p className="text-xs text-slate-500">Daily total vs resolved tickets</p>
                </div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  14-Day Velocity
                </span>
              </div>

              <div className="h-64 w-full">
                {analytics && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.complaintTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Line type="monotone" dataKey="total" name="Total Reported" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Donut Chart: Status Breakdown */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Status Distribution</h3>
                <p className="text-xs text-slate-500">Workflow stage ratio</p>
              </div>

              <div className="h-64 w-full">
                {analytics && (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="count"
                        nameKey="status"
                      >
                        {analytics.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Bar Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown Bar Chart */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Complaints by Category
              </h3>
              <div className="h-60 w-full">
                {analytics && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.categoryDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                      <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Location Breakdown Bar Chart */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Complaints by Campus Location
              </h3>
              <div className="h-60 w-full">
                {analytics && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.locationDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="location" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Critical Complaints Triage Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recent Critical Complaints</h2>
                <p className="text-xs text-slate-500">Requires immediate department assignment</p>
              </div>
              <Link href="/admin/complaints" className="text-xs font-bold text-blue-600 hover:underline">
                View Master Table →
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
                        <th className="py-3.5 px-4">Assigned Department</th>
                        <th className="py-3.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {criticalComplaints.slice(0, 5).map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors bg-red-50/20">
                          <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{item.complaintNumber}</td>
                          <td className="py-3.5 px-4 max-w-xs">
                            <Link href={`/admin/complaints/${item.id}`} className="font-bold text-slate-900 hover:text-blue-600 line-clamp-1">
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
                          <td className="py-3.5 px-4 text-slate-700">
                            {item.assignedDepartmentName || <span className="text-amber-600 font-bold italic">Unassigned</span>}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setAssigningComplaint(item)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors shadow-2xs inline-flex items-center gap-1"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Assign</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <AssignModal
            isOpen={!!assigningComplaint}
            onClose={() => setAssigningComplaint(null)}
            complaint={assigningComplaint}
            onSuccess={loadDashboardData}
          />
        </main>
      </div>
    </div>
  );
}
