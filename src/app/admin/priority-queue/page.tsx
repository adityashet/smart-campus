'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { MobileSidebar } from '@/components/MobileSidebar';
import { PageHeader } from '@/components/PageHeader';
import { PriorityBadge } from '@/components/PriorityBadge';
import { PriorityScore } from '@/components/PriorityScore';
import { ComplaintStatusBadge } from '@/components/ComplaintStatusBadge';
import { AssignModal } from '@/components/AssignModal';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { api } from '@/lib/api';
import { Complaint } from '@/types';
import Link from 'next/link';
import { ShieldAlert, Info, UserCheck, ArrowRight, Zap } from 'lucide-react';

export default function AdminPriorityQueuePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [queue, setQueue] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const [assigningComplaint, setAssigningComplaint] = useState<Complaint | null>(null);

  const loadQueue = async () => {
    setLoading(true);
    const data = await api.getPriorityQueue();
    setQueue(data);
    setLoading(false);
  };

  useEffect(() => {
    loadQueue();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenMobileMenu={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <PageHeader
            title="Priority Triage Queue"
            subtitle="Complaints ranked by urgency, safety risk, and campus operational impact."
            breadcrumbs={[{ label: 'Admin Panel', href: '/admin' }, { label: 'Priority Queue' }]}
          />

          {/* Explanation Panel Card */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2.5 text-rose-400 font-bold text-sm">
              <ShieldAlert className="w-5 h-5" />
              <span>Priority Triage Logic</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              Priority is determined using factors such as severity grade, location safety impact, complaint frequency, and issue category. High priority scores (76-100) indicate immediate safety hazard or major facility disruption.
            </p>
            <div className="pt-1 text-[11px] text-amber-300 font-medium flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Priority score is calculated by the backend/database prioritization engine.</span>
            </div>
          </div>

          {/* Queue Items List */}
          {loading ? (
            <SkeletonLoader type="table" />
          ) : (
            <div className="space-y-4">
              {queue.map((item, idx) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border p-5 shadow-2xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    item.priorityLevel === 'CRITICAL' ? 'border-red-200 bg-red-50/20' : 'border-slate-200/90'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rank</span>
                      <span className="text-xl font-black text-slate-900">#{idx + 1}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700">{item.complaintNumber}</span>
                        <PriorityBadge priority={item.priorityLevel} size="sm" />
                        <ComplaintStatusBadge status={item.status} size="sm" />
                      </div>

                      <Link
                        href={`/admin/complaints/${item.id}`}
                        className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors block"
                      >
                        {item.title}
                      </Link>

                      <p className="text-xs text-slate-500">
                        {item.locationName} • {item.roomDetails} • Reported by {item.submittedBy.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    <div className="w-36">
                      <PriorityScore score={item.priorityScore} size="sm" />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setAssigningComplaint(item)}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-2xs inline-flex items-center gap-1.5 transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Assign</span>
                      </button>
                      <Link
                        href={`/admin/complaints/${item.id}`}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                        title="View Details"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <AssignModal
            isOpen={!!assigningComplaint}
            onClose={() => setAssigningComplaint(null)}
            complaint={assigningComplaint}
            onSuccess={loadQueue}
          />
        </main>
      </div>
    </div>
  );
}
