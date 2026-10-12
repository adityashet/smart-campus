'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from './Modal';
import { Department, StaffMember, Complaint } from '@/types';
import { api } from '@/lib/api';
import { useToast } from './Toast';
import { UserCheck } from 'lucide-react';

interface AssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint | null;
  onSuccess?: () => void;
}

function deptsDefault(catId: string) {
  if (catId.includes('elec')) return 'dept-elec';
  if (catId.includes('water') || catId.includes('plumb') || catId.includes('clean')) return 'dept-plumb';
  if (catId.includes('ac')) return 'dept-hvac';
  if (catId.includes('net') || catId.includes('equip')) return 'dept-it';
  return 'dept-civil';
}

export function AssignModal({ isOpen, onClose, complaint, onSuccess }: AssignModalProps) {
  const { showToast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    const depts = await api.getDepartments();
    const staff = await api.getStaff();
    setDepartments(depts);
    setStaffList(staff);
    if (complaint) {
      setSelectedDept(complaint.assignedDepartmentId || deptsDefault(complaint.categoryId));
      setSelectedStaff(complaint.assignedStaffId || '');
    }
  }, [complaint]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]);

  const filteredStaff = staffList.filter((s) => s.departmentId === selectedDept);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !selectedDept) return;
    setIsSubmitting(true);
    try {
      await api.assignComplaint(complaint.id, selectedDept, selectedStaff);
      showToast('Assignment Updated', `Assigned ${complaint.complaintNumber} to maintenance team.`, 'success');
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Assignment Failed', 'Could not update complaint assignment.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!complaint) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Maintenance Team"
      subtitle={`Assign department & technician for ${complaint.complaintNumber}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Maintenance Department <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setSelectedStaff('');
              }}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code}) - {d.activeComplaints} Active
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Assign Technician / Staff (Optional)
          </label>
          <select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
          >
            <option value="">Auto-assign to Department Queue</option>
            {filteredStaff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.activeCount} active tasks)
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500 mt-1">
            Selecting a technician directly dispatches this task to their active task queue.
          </p>
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
            disabled={isSubmitting || !selectedDept}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors"
          >
            <UserCheck className="w-4 h-4" />
            <span>{isSubmitting ? 'Assigning...' : 'Confirm Assignment'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
