'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { MobileSidebar } from '@/components/MobileSidebar';
import { PageHeader } from '@/components/PageHeader';
import { PriorityBadge } from '@/components/PriorityBadge';
import { PriorityScore } from '@/components/PriorityScore';
import { ComplaintStatusBadge } from '@/components/ComplaintStatusBadge';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/Toast';
import { api } from '@/lib/api';
import { ComplaintCategory, CampusLocation, Complaint, SeverityLevel } from '@/types';
import { complaintSubmissionSchema } from '@/lib/validations';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wrench,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  ArrowRight,
  FileText,
  Image as ImageIcon,
  X,
} from 'lucide-react';

export default function SubmitComplaintPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [categories, setCategories] = useState<ComplaintCategory[]>([]);
  const [locations, setLocations] = useState<CampusLocation[]>([]);

  // Form State
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [roomDetails, setRoomDetails] = useState('');
  const [severity, setSeverity] = useState<SeverityLevel>('HIGH');
  const [description, setDescription] = useState('');
  const [contactPreference, setContactPreference] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Image Upload State
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Status & Validation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    async function loadOptions() {
      const cats = await api.getCategories();
      const locs = await api.getLocations();
      setCategories(cats);
      setLocations(locs);
    }
    loadOptions();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEvidenceFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeFile = () => {
    setEvidenceFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = complaintSubmissionSchema.safeParse({
      title,
      categoryId,
      locationId,
      roomDetails,
      severity,
      description,
      contactPreference,
      additionalNotes,
    });

    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) formattedErrors[issue.path[0].toString()] = issue.message;
      });
      setErrors(formattedErrors);
      showToast('Validation Error', 'Please complete all required form fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const newComplaint = await api.createComplaint({
        title,
        categoryId,
        locationId,
        roomDetails,
        severity,
        description,
        contactPreference,
        additionalNotes,
        submittedBy: {
          id: user?.id || 'u-std-1',
          name: user?.name || 'Ananya Sharma',
          email: user?.email || 'student@campus.edu',
          phone: user?.phone,
        },
        imageEvidenceUrl: previewUrl || undefined,
      });

      setSubmittedComplaint(newComplaint);
      showToast('Complaint Submitted', `Registered ${newComplaint.complaintNumber} with priority score ${newComplaint.priorityScore}`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Submission Error', 'Failed to submit complaint.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setCategoryId('');
    setLocationId('');
    setRoomDetails('');
    setSeverity('HIGH');
    setDescription('');
    setContactPreference('');
    setAdditionalNotes('');
    setEvidenceFile(null);
    setPreviewUrl(null);
    setSubmittedComplaint(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenMobileMenu={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto w-full">
          <PageHeader
            title="Report a Campus Issue"
            subtitle="Provide details about the issue so the maintenance team can resolve it quickly."
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard font-medium' },
              { label: 'Complaints', href: '/complaints' },
              { label: 'Report New Issue' },
            ]}
          />

          {/* Submission Success Screen */}
          {submittedComplaint ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 text-center space-y-6 animate-scale-up">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Complaint Submitted Successfully!</h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Your maintenance request has been registered in the system and queued for admin priority triage.
                </p>
              </div>

              {/* Priority & Status Card */}
              <div className="max-w-md mx-auto bg-slate-50 rounded-2xl border border-slate-200 p-5 text-left space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-xs text-slate-500 font-semibold">Complaint ID</span>
                  <span className="font-mono font-bold text-blue-700 text-sm">{submittedComplaint.complaintNumber}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-semibold">Status</span>
                  <ComplaintStatusBadge status={submittedComplaint.status} size="sm" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-semibold">Assigned Priority</span>
                  <PriorityBadge priority={submittedComplaint.priorityLevel} size="sm" />
                </div>

                <div className="pt-2">
                  <PriorityScore score={submittedComplaint.priorityScore} />
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href={`/complaints/${submittedComplaint.id}`}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                >
                  View Complaint Details
                </Link>
                <button
                  onClick={resetForm}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                >
                  Submit Another Complaint
                </button>
              </div>
            </div>
          ) : (
            /* Submission Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Notice Banner */}
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-slate-900">Backend Priority Calculation Note:</span>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    The backend priority algorithm computes the exact 0-100 score dynamically using severity, category urgency, and location safety risk factors.
                  </p>
                </div>
              </div>

              {/* Section 1: Basic Information */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Section 1: Basic Information</span>
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Complaint Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Electrical sparking in Lab 3 switchboard"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                  {errors.title && <p className="text-[11px] text-rose-600 mt-1">{errors.title}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Problem Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {errors.categoryId && <p className="text-[11px] text-rose-600 mt-1">{errors.categoryId}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Campus Location <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={locationId}
                      onChange={(e) => setLocationId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Select Location</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name} ({loc.building})
                        </option>
                      ))}
                    </select>
                    {errors.locationId && <p className="text-[11px] text-rose-600 mt-1">{errors.locationId}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Specific Room / Floor / Bench Details <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={roomDetails}
                    onChange={(e) => setRoomDetails(e.target.value)}
                    placeholder="e.g. Block A - 2nd Floor, Lab 3, Bench 4"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                  {errors.roomDetails && <p className="text-[11px] text-rose-600 mt-1">{errors.roomDetails}</p>}
                </div>
              </div>

              {/* Section 2: Severity Selection */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Section 2: Issue Severity Level</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    {
                      level: 'LOW' as const,
                      title: 'LOW',
                      desc: 'Minor issue with little impact on daily activities',
                      bg: 'hover:border-emerald-400 bg-emerald-50/30',
                      active: 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20',
                    },
                    {
                      level: 'MEDIUM' as const,
                      title: 'MEDIUM',
                      desc: 'Affects normal usage of room or facility',
                      bg: 'hover:border-amber-400 bg-amber-50/30',
                      active: 'border-amber-600 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20',
                    },
                    {
                      level: 'HIGH' as const,
                      title: 'HIGH',
                      desc: 'Significantly affects multiple students or staff',
                      bg: 'hover:border-orange-400 bg-orange-50/30',
                      active: 'border-orange-600 bg-orange-50 text-orange-900 ring-2 ring-orange-500/20',
                    },
                    {
                      level: 'CRITICAL' as const,
                      title: 'CRITICAL',
                      desc: 'Urgent safety risk, fire, or major operational outage',
                      bg: 'hover:border-red-400 bg-red-50/30',
                      active: 'border-red-600 bg-red-50 text-red-900 ring-2 ring-red-500/20',
                    },
                  ].map((option) => (
                    <button
                      key={option.level}
                      type="button"
                      onClick={() => setSeverity(option.level)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        severity === option.level ? option.active : `border-slate-200 ${option.bg}`
                      }`}
                    >
                      <span className="block text-xs font-black uppercase tracking-wider">{option.title}</span>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{option.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 3: Detailed Description */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span>Section 3: Detailed Description</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">{description.length} / 1000</span>
                </div>

                <div>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the problem in detail (e.g., Heavy sparking and smoke coming from Bench 4 switchboard in Lab 3 after connecting oscilloscope)..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                  {errors.description && <p className="text-[11px] text-rose-600 mt-1">{errors.description}</p>}
                </div>
              </div>

              {/* Section 4: Additional Details */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Section 4: Additional Details (Optional)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Contact Method</label>
                    <input
                      type="text"
                      value={contactPreference}
                      onChange={(e) => setContactPreference(e.target.value)}
                      placeholder="e.g. Call +91 98765 43210 during lab hours"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Additional Notes</label>
                    <input
                      type="text"
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      placeholder="e.g. Lab assistant informed"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Evidence Attachment UI */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <span>Section 5: Photo / Media Evidence</span>
                </h3>

                {previewUrl ? (
                  <div className="relative inline-block border border-slate-200 rounded-2xl overflow-hidden group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl} alt="Evidence Preview" className="h-44 w-auto object-cover" />
                    <button
                      type="button"
                      onClick={removeFile}
                      className="absolute top-2 right-2 p-1.5 bg-slate-900/80 text-white rounded-full hover:bg-rose-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <span className="absolute bottom-2 left-2 text-[10px] bg-slate-900/70 text-white px-2 py-0.5 rounded-md">
                      {evidenceFile?.name}
                    </span>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-blue-50/50 transition-all">
                    <UploadCloud className="w-8 h-8 text-blue-600 mb-2" />
                    <span className="text-xs font-bold text-slate-800">Click to upload photo or document</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, or PDF up to 5MB</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                )}
              </div>

              {/* Submit Button Bar */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Link
                  href="/dashboard"
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all"
                >
                  <span>{isSubmitting ? 'Submitting Complaint...' : 'Submit Complaint'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
