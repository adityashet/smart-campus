'use client';

import React, { useState, useEffect, use } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { MobileSidebar } from '@/components/MobileSidebar';
import { PageHeader } from '@/components/PageHeader';
import { PriorityBadge } from '@/components/PriorityBadge';
import { PriorityScore } from '@/components/PriorityScore';
import { ComplaintStatusBadge } from '@/components/ComplaintStatusBadge';
import { ComplaintTimeline } from '@/components/ComplaintTimeline';
import { ResolveModal } from '@/components/ResolveModal';
import { StatusUpdateModal } from '@/components/StatusUpdateModal';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { ErrorState } from '@/components/ErrorState';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/Toast';
import { api } from '@/lib/api';
import { Complaint } from '@/types';
import { formatDate, formatDateTime } from '@/lib/utils';
import Link from 'next/link';
import {
  ArrowLeft,
  Wrench,
  CheckCircle2,
  Play,
  CheckSquare,
  Image as ImageIcon,
  Clock,
} from 'lucide-react';

export default function StaffComplaintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const { showToast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Modals
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await api.getComplaintById(resolvedParams.id);
      if (!data) setError(true);
      else setComplaint(data);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [resolvedParams.id]);

  const handleAcceptComplaint = async () => {
    if (!complaint) return;
    try {
      await api.updateComplaintStatus(
        complaint.id,
        'ASSIGNED',
        'Technician accepted dispatch ticket.',
        'STAFF',
        user?.name || 'Rahul Kumar'
      );
      showToast('Complaint Accepted', `Accepted ${complaint.complaintNumber} into your active task queue.`, 'success');
      loadData();
    } catch (err) {
      console.error(err);
      showToast('Error', 'Could not accept complaint.', 'error');
    }
  };

  const handleStartWork = async () => {
    if (!complaint) return;
    try {
      await api.updateComplaintStatus(
        complaint.id,
        'IN_PROGRESS',
        'Technician started maintenance inspection & repairs.',
        'STAFF',
        user?.name || 'Rahul Kumar'
      );
      showToast('Work Started', `Status updated to IN_PROGRESS for ${complaint.complaintNumber}`, 'success');
      loadData();
    } catch (err) {
      console.error(err);
      showToast('Error', 'Could not update status.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenMobileMenu={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {loading ? (
            <SkeletonLoader type="details" />
          ) : error || !complaint ? (
            <ErrorState title="Complaint Not Found" message={`ID: ${resolvedParams.id}`} />
          ) : (
            <>
              <PageHeader
                title={complaint.title}
                subtitle={`Complaint ID: ${complaint.complaintNumber} • Location: ${complaint.locationName}`}
                breadcrumbs={[
                  { label: 'Staff Portal', href: '/staff' },
                  { label: 'Assigned Complaints', href: '/staff/complaints' },
                  { label: complaint.complaintNumber },
                ]}
                action={
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={complaint.priorityLevel} size="lg" />
                    <ComplaintStatusBadge status={complaint.status} size="lg" />
                  </div>
                }
              />

              {/* Staff Action Workflow Bar */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Maintenance Technician Workflow Actions</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Execute valid status transitions for this complaint ticket.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {(complaint.status === 'SUBMITTED' || complaint.status === 'REVIEWED') && (
                    <button
                      onClick={handleAcceptComplaint}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                    >
                      <CheckSquare className="w-4 h-4" />
                      <span>Accept Complaint</span>
                    </button>
                  )}

                  {(complaint.status === 'ASSIGNED' || complaint.status === 'REVIEWED') && (
                    <button
                      onClick={handleStartWork}
                      className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Start Work</span>
                    </button>
                  )}

                  {complaint.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => setShowResolveModal(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark as Resolved</span>
                    </button>
                  )}

                  {complaint.status === 'RESOLVED' && (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Resolved & Audited
                    </span>
                  )}
                </div>
              </div>

              {/* Main Content Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
                    <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                      Complaint Overview & Location
                    </h3>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 font-medium block">Category</span>
                        <span className="font-bold text-slate-800 text-sm">{complaint.categoryName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium block">Severity Grade</span>
                        <span className="font-bold text-slate-800 text-sm">{complaint.severity}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium block">Building / Location</span>
                        <span className="font-bold text-slate-800">{complaint.locationName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium block">Exact Room / Bench</span>
                        <span className="font-bold text-slate-800">{complaint.roomDetails}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-700 block mb-1">Issue Description</span>
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                        {complaint.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-700 block mb-1">Reported By</span>
                      <p className="text-xs text-slate-800 font-bold">
                        {complaint.submittedBy.name} ({complaint.submittedBy.email})
                      </p>
                    </div>
                  </div>

                  {complaint.imageEvidenceUrl && (
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-3">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <ImageIcon className="w-4 h-4 text-blue-600" />
                        <span>Uploaded Evidence Photo</span>
                      </h3>
                      <div className="rounded-xl overflow-hidden border border-slate-200 max-w-md">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={complaint.imageEvidenceUrl} alt="Evidence" className="w-full h-56 object-cover" />
                      </div>
                    </div>
                  )}

                  {complaint.status === 'RESOLVED' && complaint.resolution && (
                    <div className="bg-emerald-50/70 rounded-2xl border border-emerald-200 p-6 space-y-3">
                      <h3 className="text-base font-bold text-emerald-900 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span>Resolution Record</span>
                      </h3>
                      <p className="text-xs text-emerald-950 font-medium bg-white p-4 rounded-xl border border-emerald-200/60 leading-relaxed">
                        {complaint.resolution.description}
                      </p>
                      {complaint.resolution.actualCost !== undefined && (
                        <p className="text-xs text-emerald-800 font-bold">
                          Actual Repair Cost: ₹{complaint.resolution.actualCost}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                      Priority Score Index
                    </h3>
                    <PriorityScore score={complaint.priorityScore} size="lg" />
                  </div>

                  <ComplaintTimeline timeline={complaint.timeline} currentStatus={complaint.status} />

                  <Link
                    href="/staff/complaints"
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Assigned Queue</span>
                  </Link>
                </div>
              </div>
            </>
          )}

          <ResolveModal
            isOpen={showResolveModal}
            onClose={() => setShowResolveModal(false)}
            complaint={complaint}
            staffName={user?.name || 'Rahul Kumar'}
            staffId={user?.id || 'stf-1'}
            onSuccess={loadData}
          />
        </main>
      </div>
    </div>
  );
}
