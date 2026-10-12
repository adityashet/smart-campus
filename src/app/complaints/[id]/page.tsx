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
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { ErrorState } from '@/components/ErrorState';
import { api } from '@/lib/api';
import { Complaint } from '@/types';
import { formatDateTime, formatDate } from '@/lib/utils';
import Link from 'next/link';
import {
  ArrowLeft,
  Building,
  MapPin,
  Calendar,
  User,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
} from 'lucide-react';

export default function StudentComplaintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadComplaint() {
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
    }
    loadComplaint();
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
            <ErrorState
              title="Complaint Not Found"
              message={`Could not find complaint records matching ID: ${resolvedParams.id}`}
            />
          ) : (
            <>
              <PageHeader
                title={complaint.title}
                subtitle={`Complaint ID: ${complaint.complaintNumber} • Submitted ${formatDate(complaint.createdDate)}`}
                breadcrumbs={[
                  { label: 'Dashboard', href: '/dashboard' },
                  { label: 'Complaints', href: '/complaints' },
                  { label: complaint.complaintNumber },
                ]}
                action={
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={complaint.priorityLevel} size="lg" />
                    <ComplaintStatusBadge status={complaint.status} size="lg" />
                  </div>
                }
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Main Column */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Detailed Information Card */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
                    <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                      Complaint Details
                    </h3>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 font-medium block">Category</span>
                        <span className="font-bold text-slate-800 text-sm">{complaint.categoryName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium block">Severity</span>
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
                      <span className="text-xs font-semibold text-slate-700 block mb-1">Full Problem Description</span>
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                        {complaint.description}
                      </p>
                    </div>

                    {complaint.additionalNotes && (
                      <div className="pt-1">
                        <span className="text-xs font-semibold text-slate-700 block mb-1">Additional Notes</span>
                        <p className="text-xs text-slate-500 italic">{complaint.additionalNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Uploaded Evidence Section */}
                  {complaint.imageEvidenceUrl && (
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-3">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <ImageIcon className="w-4 h-4 text-blue-600" />
                        <span>Attached Media Evidence</span>
                      </h3>
                      <div className="rounded-xl overflow-hidden border border-slate-200 max-w-md">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={complaint.imageEvidenceUrl}
                          alt="Evidence Photo"
                          className="w-full h-56 object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>
                  )}

                  {/* Resolution Report Card (If Resolved) */}
                  {complaint.status === 'RESOLVED' && complaint.resolution && (
                    <div className="bg-emerald-50/70 rounded-2xl border border-emerald-200 p-6 space-y-3">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span>Resolution Details</span>
                      </div>
                      <p className="text-xs text-emerald-950 leading-relaxed font-medium bg-white/80 p-4 rounded-xl border border-emerald-200/60">
                        {complaint.resolution.description}
                      </p>
                      <div className="flex flex-wrap items-center justify-between text-xs text-emerald-800 pt-1">
                        <span>Resolved by: <strong>{complaint.resolution.resolvedBy}</strong></span>
                        <span>Date: <strong>{formatDateTime(complaint.resolution.resolvedDate)}</strong></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Priority & Assignment + Timeline */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Priority & Score Indicator */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                      Backend Priority Score
                    </h3>
                    <PriorityScore score={complaint.priorityScore} size="lg" />
                    <p className="text-[11px] text-slate-400 italic leading-relaxed">
                      Score computed dynamically using severity grade, safety factors, and category impact.
                    </p>
                  </div>

                  {/* Assignment Card */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                      Assigned Maintenance Team
                    </h3>
                    {complaint.assignedDepartmentName ? (
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Department</span>
                          <span className="font-bold text-slate-900">{complaint.assignedDepartmentName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Assigned Staff</span>
                          <span className="font-bold text-blue-700">{complaint.assignedStaffName || 'Team Dispatch'}</span>
                        </div>
                        {complaint.assignedDate && (
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>Dispatch Time</span>
                            <span>{formatDate(complaint.assignedDate)}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-amber-700 font-semibold bg-amber-50 p-3 rounded-xl border border-amber-200">
                        Queued for department assignment by admin triage team.
                      </p>
                    )}
                  </div>

                  {/* Timeline Component */}
                  <ComplaintTimeline timeline={complaint.timeline} currentStatus={complaint.status} />

                  <div className="pt-2">
                    <Link
                      href="/complaints"
                      className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Complaints List</span>
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
