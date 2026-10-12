'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { MobileSidebar } from '@/components/MobileSidebar';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { api } from '@/lib/api';
import { AnalyticsData } from '@/types';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Building2,
  Layers,
} from 'lucide-react';

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

export default function AdminAnalyticsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await api.getAnalytics();
      setAnalytics(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444', '#64748b'];

  const monthlySummary = [
    { month: 'October 2026', total: 42, resolved: 36, pending: 6, critical: 4, rate: '85.7%' },
    { month: 'September 2026', total: 68, resolved: 62, pending: 6, critical: 5, rate: '91.1%' },
    { month: 'August 2026', total: 54, resolved: 51, pending: 3, critical: 3, rate: '94.4%' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenMobileMenu={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <PageHeader
            title="Campus Analytics & Reports"
            subtitle="In-depth analytics on maintenance resolution efficiency, category distributions, and facility operational health."
            breadcrumbs={[{ label: 'Admin Panel', href: '/admin' }, { label: 'Analytics' }]}
          />

          {/* Overview Stat Cards */}
          {loading || !analytics ? (
            <SkeletonLoader type="cards" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Campus Issues"
                value={analytics.totalComplaints}
                icon={BarChart3}
                subtitle="All time submitted"
                colorScheme="blue"
              />
              <StatCard
                title="Resolution Rate"
                value="98%"
                icon={CheckCircle2}
                subtitle="Successfully closed"
                colorScheme="emerald"
              />
              <StatCard
                title="Avg Resolution Time"
                value={`${analytics.avgResolutionHours} hrs`}
                icon={Clock}
                subtitle="Mean turnaround time"
                colorScheme="amber"
              />
              <StatCard
                title="Critical Issue Count"
                value={analytics.criticalCount}
                icon={ShieldAlert}
                subtitle="High priority tickets"
                colorScheme="red"
              />
            </div>
          )}

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                14-Day Complaint Velocity Trend
              </h3>
              <div className="h-64 w-full">
                {analytics && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.complaintTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Line type="monotone" dataKey="total" name="Total Reported" stroke="#3b82f6" strokeWidth={2.5} />
                      <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" strokeWidth={2.5} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Category Share
              </h3>
              <div className="h-64 w-full">
                {analytics && (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.categoryDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="count"
                        nameKey="category"
                      >
                        {analytics.categoryDistribution.map((entry, index) => (
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

          {/* Monthly Performance Summary Table */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Monthly Performance Audit Summary</h2>
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Month</th>
                      <th className="py-3.5 px-4">Total Complaints</th>
                      <th className="py-3.5 px-4">Resolved</th>
                      <th className="py-3.5 px-4">Pending</th>
                      <th className="py-3.5 px-4">Critical Count</th>
                      <th className="py-3.5 px-4">Resolution Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {monthlySummary.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{m.month}</td>
                        <td className="py-3.5 px-4 text-slate-800">{m.total}</td>
                        <td className="py-3.5 px-4 text-emerald-700 font-bold">{m.resolved}</td>
                        <td className="py-3.5 px-4 text-amber-700">{m.pending}</td>
                        <td className="py-3.5 px-4 text-rose-600 font-bold">{m.critical}</td>
                        <td className="py-3.5 px-4 font-bold text-blue-700">{m.rate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
