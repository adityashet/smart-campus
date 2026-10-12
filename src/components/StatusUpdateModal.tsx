'use client';

import React, { useState } from 'react';
import { Modal } from './Modal';
import { Complaint, ComplaintStatus } from '@/types';
import { api } from '@/lib/api';
import { useToast } from './Toast';
import { RefreshCw } from 'lucide-react';

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint | null;
  userRole?: 'STUDENT' | 'STAFF' | 'ADMIN';
  userName?: string;
  onSuccess?: () => void;
}

export function StatusUpdateModal({
  isOpen,
  onClose,
  complaint,
  userRole = 'ADMIN',
  userName = 'Campus Admin',
  onSuccess,
}: StatusUpdateModalProps) {
  const { showToast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus>('IN_PROGRESS');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!complaint) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.updateComplaintStatus(complaint.id, selectedStatus, notes, userRole, userName);
      showToast('Status Updated', `${complaint.complaintNumber} updated to ${selectedStatus}`, 'success');
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Update Failed', 'Could not update complaint status.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions: { value: ComplaintStatus; label: string }[] = [
    { value: 'REVIEWED', label: 'REVIEWED - Priority Triage Complete' },
    { value: 'ASSIGNED', label: 'ASSIGNED - Dispatched to Department' },
    { value: 'IN_PROGRESS', label: 'IN_PROGRESS - Work Started' },
    { value: 'RESOLVED', label: 'RESOLVED - Work Complete' },
    { value: 'REJECTED', label: 'REJECTED - Invalid / Duplicate' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Complaint Status"
      subtitle={`Modify status for ${complaint.complaintNumber}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">New Workflow Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as ComplaintStatus)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Update Notes / Audit Reason</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add reasoning for status transition..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{isSubmitting ? 'Updating...' : 'Save Status'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
