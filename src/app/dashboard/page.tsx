'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { MobileSidebar } from '@/components/MobileSidebar';
import { StatCard } from '@/components/StatCard';
import { ComplaintTable } from '@/components/ComplaintTable';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { useAuth } from '@/components/AuthProvider';
import { api } from '@/lib/api';
import { Complaint } from '@/types';
import Link from 'next/link';
import {
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';

export default function StudentDashboard() {
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

  const studentComplaints = complaints.filter(
    (c) => c.submittedBy.email.toLowerCase() === user?.email.toLowerCase() || user?.role === 'ADMIN'
  );

  const displayList = studentComplaints.length > 0 ? studentComplaints : complaints.slice(0, 5);

  const total = displayList.length;
  const pending = displayList.filter((c) => c.status === 'SUBMITTED' || c.status === 'REVIEWED').length;
  const inProgress = displayList.filter((c) => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS').length;
  const resolved = displayList.filter((c) => c.status === 'RESOLVED').length;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenMobileMenu={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Greeting Banner */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/80 text-blue-200 text-xs font-semibold mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                  <span>Student Maintenance Portal</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Good morning, {user?.name || 'Student'}! 👋
                </h1>
                <p className="text-xs sm:text-sm text-blue-200 mt-1 max-w-xl">
                  Here&apos;s an active overview of your reported campus maintenance requests and repair timelines.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href="/complaints/new"
                  className="flex items-center gap-2 px-5 py-3 bg-white text-blue-900 font-bold text-xs rounded-xl hover:bg-blue-50 shadow-md transition-all transform hover:-translate-y-0.5"
                >
                  <PlusCircle className="w-4 h-4 text-blue-600" />
                  <span>Report New Issue</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Interactive Demo Flow Guide */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 shadow-2xs">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block text-sm text-amber-950">Demo Instructions for Presentation:</span>
              <p className="text-amber-800 mt-0.5 leading-relaxed">
                1. Click <strong>&quot;Report New Issue&quot;</strong> to submit a complaint (e.g., &quot;Electrical sparking in Lab 3&quot;). <br />
                2. Use the <strong>Role Switcher</strong> in the top-right header to switch to <strong>Admin</strong> or <strong>Staff</strong> mode to test assignment and resolution!
              </p>
            </div>
          </div>

          {/* Stat Cards */}
          {loading ? (
            <SkeletonLoader type="cards" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Complaints"
                value={total}
                icon={FileText}
                subtitle="All submitted requests"
                colorScheme="blue"
              />
              <StatCard
                title="Pending Triage"
                value={pending}
                icon={Clock}
                subtitle="Awaiting admin review"
                colorScheme="amber"
              />
              <StatCard
                title="In Progress"
                value={inProgress}
                icon={Wrench}
                subtitle="Under active repair"
                colorScheme="purple"
              />
              <StatCard
                title="Resolved"
                value={resolved}
                icon={CheckCircle2}
                subtitle="Fully completed & closed"
                colorScheme="emerald"
              />
            </div>
          )}

          {/* Quick Actions Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/complaints/new"
              className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Report New Issue</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Submit electrical, plumbing, or AC fault</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              href="/complaints"
              className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-slate-100 text-slate-700 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">View All Complaints</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Search, filter, and track statuses</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>

          {/* Recent Complaints Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recent Complaints</h2>
                <p className="text-xs text-slate-500">Live priority score & stage indicators</p>
              </div>
              <Link href="/complaints" className="text-xs font-bold text-blue-600 hover:underline">
                View All →
              </Link>
            </div>

            {loading ? (
              <SkeletonLoader type="table" />
            ) : (
              <ComplaintTable complaints={displayList.slice(0, 5)} role="STUDENT" />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
