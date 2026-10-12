'use client';

import React, { useState } from 'react';
import { Modal } from './Modal';
import { Complaint } from '@/types';
import { api } from '@/lib/api';
import { useToast } from './Toast';
import { CheckCircle2, DollarSign } from 'lucide-react';

interface ResolveModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint | null;
  staffName?: string;
  staffId?: string;
  onSuccess?: () => void;
}

export function ResolveModal({
  isOpen,
  onClose,
  complaint,
  staffName = 'Rahul Kumar',
  staffId = 'stf-1',
  onSuccess,
}: ResolveModalProps) {
  const { showToast } = useToast();
  const [description, setDescription] = useState('');
  const [actualCost, setActualCost] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!complaint) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || description.trim().length < 10) {
      setError('Please provide at least 10 characters describing the resolution.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await api.resolveComplaint(complaint.id, {
        description: description.trim(),
        actualCost: actualCost ? parseFloat(actualCost) : undefined,
        notes: notes.trim() || undefined,
        staffName,
        staffId,
      });
      showToast('Complaint Resolved', `${complaint.complaintNumber} has been successfully resolved!`, 'success');
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Resolution Error', 'Could not complete resolution.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mark Complaint as Resolved"
      subtitle={`Add technical resolution details for ${complaint.complaintNumber}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Resolution Summary / Work Done <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what was fixed (e.g., Replaced main switch fuse, tightened wiring, restored power)..."
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
          />
          {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Actual Repair Cost (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">₹</span>
              <input
                type="number"
                min="0"
                step="50"
                placeholder="0.00"
                value={actualCost}
                onChange={(e) => setActualCost(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-7 pr-3 text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Resolved By</label>
            <input
              type="text"
              disabled
              value={staffName}
              className="w-full rounded-xl border border-slate-200 bg-slate-100 py-2 px-3 text-xs text-slate-500 font-semibold"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Maintenance Notes (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Spare part purchased from vendor batch #44..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
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
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Resolving...' : 'Complete & Resolve'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
