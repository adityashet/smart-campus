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
import { AssignModal } from '@/components/AssignModal';
import { StatusUpdateModal } from '@/components/StatusUpdateModal';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { ErrorState } from '@/components/ErrorState';
import { useAuth } from '@/components/AuthProvider';
import { api } from '@/lib/api';
import { Complaint } from '@/types';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import {
  ArrowLeft,
  UserCheck,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  Shield,
} from 'lucide-react';

export default function AdminComplaintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
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
                subtitle={`Complaint ID: ${complaint.complaintNumber} • Priority Score: ${complaint.priorityScore}/100`}
                breadcrumbs={[
                  { label: 'Admin Panel', href: '/admin' },
                  { label: 'Complaints', href: '/admin/complaints' },
                  { label: complaint.complaintNumber },
                ]}
                action={
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={complaint.priorityLevel} size="lg" />
                    <ComplaintStatusBadge status={complaint.status} size="lg" />
                  </div>
                }
              />

              {/* Admin Actions Bar */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Admin Control & Dispatch Actions</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Assign department, reallocate staff, or override status.</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Assign Department & Staff</span>
                  </button>

                  <button
                    onClick={() => setShowStatusModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Update Status</span>
                  </button>
                </div>
              </div>

              {/* Main Content Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
                    <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                      Master Complaint Audit Record
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
                        <span className="text-slate-400 font-medium block">Campus Location</span>
                        <span className="font-bold text-slate-800">{complaint.locationName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium block">Room / Bench</span>
                        <span className="font-bold text-slate-800">{complaint.roomDetails}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-700 block mb-1">Full Description</span>
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                        {complaint.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-700 block mb-1">Reporter Details</span>
                      <p className="text-xs text-slate-800 font-bold">
                        {complaint.submittedBy.name} ({complaint.submittedBy.email}) • {complaint.submittedBy.phone || 'No phone'}
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

                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                      Current Department Allocation
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Department</span>
                        <span className="font-bold text-slate-900">{complaint.assignedDepartmentName || 'Not Assigned'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Assigned Technician</span>
                        <span className="font-bold text-blue-700">{complaint.assignedStaffName || 'Unassigned'}</span>
                      </div>
                    </div>
                  </div>

                  <ComplaintTimeline timeline={complaint.timeline} currentStatus={complaint.status} />

                  <Link
                    href="/admin/complaints"
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Master Complaints Table</span>
                  </Link>
                </div>
              </div>

              <AssignModal
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                complaint={complaint}
                onSuccess={loadData}
              />

              <StatusUpdateModal
                isOpen={showStatusModal}
                onClose={() => setShowStatusModal(false)}
                complaint={complaint}
                userRole="ADMIN"
                userName={user?.name || 'Dr. Vikram Singh'}
                onSuccess={loadData}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
