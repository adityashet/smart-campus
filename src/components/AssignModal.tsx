
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

function deptsDefault(
  categoryId: string,
  departments: Department[]
): string {
  const category = String(categoryId ?? '').toLowerCase();

  let targetName = 'Civil Maintenance';

  if (category.includes('elec')) {
    targetName = 'Electrical';
  } else if (category.includes('clean')) {
    targetName = 'Housekeeping';
  } else if (
    category.includes('water') ||
    category.includes('plumb')
  ) {
    targetName = 'Civil Maintenance';
  } else if (
    category.includes('net') ||
    category.includes('equip') ||
    category.includes('it')
  ) {
    targetName = 'IT Support';
  } else if (category.includes('safety')) {
    targetName = 'Security';
  }

  return (
    departments.find(
      (department) =>
        department.name.toLowerCase() === targetName.toLowerCase()
    )?.id != null
      ? String(
          departments.find(
            (department) =>
              department.name.toLowerCase() === targetName.toLowerCase()
          )!.id
        )
      : ''
  );
}

export function AssignModal({
  isOpen,
  onClose,
  complaint,
  onSuccess,
}: AssignModalProps) {
  const { showToast } = useToast();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!complaint) return;

    setIsLoading(true);

    try {
      const [depts, staff, categories] = await Promise.all([
        api.getDepartments(),
        api.getStaff(),
        api.getCategories(),
      ]);

      setDepartments(depts);
      setStaffList(staff);

      const existingDepartmentId = String(
        complaint.assignedDepartmentId ?? ''
      );

      const existingDepartment = depts.find(
        (department) =>
          String(department.id) === existingDepartmentId
      );

      const category = categories.find(
        (item) =>
          String(item.id) === String(complaint.categoryId)
      );

      const categoryDepartmentId =
        category?.defaultDepartmentId != null
          ? String(category.defaultDepartmentId)
          : '';

      const fallbackDepartmentId = deptsDefault(
        complaint.categoryId,
        depts
      );

      const nextDepartmentId = existingDepartment
        ? String(existingDepartment.id)
        : depts.some(
              (department) =>
                String(department.id) === categoryDepartmentId
            )
          ? categoryDepartmentId
          : fallbackDepartmentId;

      setSelectedDept(nextDepartmentId);

      const existingStaffId = String(
        complaint.assignedStaffId ?? ''
      );

      const existingStaffIsValid = staff.some(
        (member) =>
          String(member.id) === existingStaffId &&
          String(member.departmentId ?? '') === nextDepartmentId
      );

      setSelectedStaff(
        existingStaffIsValid ? existingStaffId : ''
      );
    } catch (error) {
      console.error('Failed to load assignment data:', error);

      showToast(
        'Loading Failed',
        'Could not load departments and staff. Please try again.',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  }, [complaint, showToast]);

  useEffect(() => {
    if (isOpen && complaint) {
      void loadData();
    }
  }, [isOpen, complaint, loadData]);

  const filteredStaff = staffList.filter(
    (member) =>
      String(member.departmentId ?? '') === String(selectedDept)
  );

  const handleDepartmentChange = (departmentId: string) => {
    setSelectedDept(departmentId);
    setSelectedStaff('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!complaint || !selectedDept || isSubmitting || isLoading) {
      return;
    }

    setIsSubmitting(true);

    try {
      await api.assignComplaint(
        complaint.id,
        selectedDept,
        selectedStaff
      );

      showToast(
        'Assignment Updated',
        `Assigned ${complaint.complaintNumber} to the maintenance team.`,
        'success'
      );

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to assign complaint:', error);

      showToast(
        'Assignment Failed',
        'Could not update the complaint assignment.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!complaint) {
    return null;
  }

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
            Maintenance Department{' '}
            <span className="text-rose-500">*</span>
          </label>

          <select
            value={selectedDept}
            onChange={(event) =>
              handleDepartmentChange(event.target.value)
            }
            required
            disabled={isLoading || isSubmitting}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none disabled:opacity-60"
          >
            <option value="">Select Department</option>

            {departments.map((department) => (
              <option
                key={department.id}
                value={String(department.id)}
              >
                {department.name} ({department.code}) -{' '}
                {department.activeComplaints} Active
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Assign Technician / Staff (Optional)
          </label>

          <select
            value={selectedStaff}
            onChange={(event) =>
              setSelectedStaff(event.target.value)
            }
            disabled={
              isLoading ||
              isSubmitting ||
              !selectedDept
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none disabled:opacity-60"
          >
            <option value="">
              Auto-assign to Department Queue
            </option>

            {filteredStaff.map((member) => (
              <option
                key={member.id}
                value={String(member.id)}
              >
                {member.name} ({member.activeCount} active tasks)
              </option>
            ))}
          </select>

          <p className="text-[11px] text-slate-500 mt-1">
            {isLoading
              ? 'Loading departments and staff...'
              : filteredStaff.length > 0
                ? 'Select a staff member to assign this complaint directly.'
                : 'No staff members are currently listed for this department. You can still assign the department queue.'}
          </p>
        </div>

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              isSubmitting ||
              isLoading ||
              !selectedDept
            }
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors"
          >
            <UserCheck className="w-4 h-4" />
            <span>
              {isSubmitting ? 'Assigning...' : 'Confirm Assignment'}
            </span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
