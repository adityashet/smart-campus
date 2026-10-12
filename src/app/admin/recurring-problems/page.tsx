'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { MobileSidebar } from '@/components/MobileSidebar';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { api } from '@/lib/api';
import { RecurringProblem } from '@/types';
import { RefreshCw, TrendingUp, AlertTriangle, Building2, ShieldAlert } from 'lucide-react';

export default function RecurringProblemsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [problems, setProblems] = useState<RecurringProblem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await api.getRecurringProblems();
      setProblems(data);
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenMobileMenu={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <PageHeader
            title="Recurring Campus Problems"
            subtitle="Identify locations and issue categories that repeatedly require maintenance interventions."
            breadcrumbs={[{ label: 'Admin Panel', href: '/admin' }, { label: 'Recurring Problems' }]}
          />

          {/* Highlight Cards */}
          {loading ? (
            <SkeletonLoader type="cards" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Most Reported Location"
                value="Lab Complex (Block A)"
                icon={Building2}
                subtitle="32 total complaints"
                colorScheme="red"
              />
              <StatCard
                title="Most Common Category"
                value="Electrical Faults"
                icon={RefreshCw}
                subtitle="42% of campus issues"
                colorScheme="amber"
              />
              <StatCard
                title="Highest Recurrence"
                value="85%"
                icon={TrendingUp}
                subtitle="Repeat transformer loads"
                colorScheme="purple"
              />
              <StatCard
                title="Critical Recurring Count"
                value="8 Issues"
                icon={ShieldAlert}
                subtitle="High safety impact"
                colorScheme="blue"
              />
            </div>
          )}

          {/* Recurrence Table */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recurrence Patterns Table</h2>

            {loading ? (
              <SkeletonLoader type="table" />
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="py-3.5 px-4">Campus Location</th>
                        <th className="py-3.5 px-4">Issue Category</th>
                        <th className="py-3.5 px-4">Total Count</th>
                        <th className="py-3.5 px-4">Critical Count</th>
                        <th className="py-3.5 px-4">Last Reported</th>
                        <th className="py-3.5 px-4">Recurrence Trend</th>
                        <th className="py-3.5 px-4">Root Cause Summary</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {problems.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900">{p.locationName}</td>
                          <td className="py-3.5 px-4 text-blue-700 font-semibold">{p.categoryName}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">{p.complaintCount}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-bold border border-red-200">
                              {p.criticalCount} Critical
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">{p.lastReported}</td>
                          <td className="py-3.5 px-4">
                            {p.trend === 'UP' && (
                              <span className="text-rose-600 font-bold inline-flex items-center gap-1">
                                ↑ Increasing
                              </span>
                            )}
                            {p.trend === 'STABLE' && (
                              <span className="text-amber-600 font-bold inline-flex items-center gap-1">
                                → Stable
                              </span>
                            )}
                            {p.trend === 'DOWN' && (
                              <span className="text-emerald-600 font-bold inline-flex items-center gap-1">
                                ↓ Decreasing
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">{p.statusSummary}</td>
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
