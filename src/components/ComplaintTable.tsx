import React from 'react';
import { Complaint } from '@/types';
import { PriorityBadge } from './PriorityBadge';
import { ComplaintStatusBadge } from './ComplaintStatusBadge';
import { PriorityScore } from './PriorityScore';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Eye, UserCheck, ArrowUpDown } from 'lucide-react';

interface ComplaintTableProps {
  complaints: Complaint[];
  role?: 'STUDENT' | 'STAFF' | 'ADMIN';
  onAssign?: (complaint: Complaint) => void;
  onUpdateStatus?: (complaint: Complaint) => void;
  onSort?: (field: string) => void;
}

export function ComplaintTable({
  complaints,
  role = 'STUDENT',
  onAssign,
  onUpdateStatus,
}: ComplaintTableProps) {
  if (complaints.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-3.5 px-4">Complaint ID</th>
              <th className="py-3.5 px-4">Title & Details</th>
              <th className="py-3.5 px-4">Location</th>
              <th className="py-3.5 px-4">Priority Score</th>
              <th className="py-3.5 px-4">Priority</th>
              <th className="py-3.5 px-4">Status</th>
              {role === 'ADMIN' && <th className="py-3.5 px-4">Assigned To</th>}
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {complaints.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4 font-mono font-semibold text-blue-700">{item.complaintNumber}</td>
                <td className="py-3.5 px-4 max-w-xs">
                  <Link
                    href={role === 'ADMIN' ? `/admin/complaints/${item.id}` : role === 'STAFF' ? `/staff/complaints/${item.id}` : `/complaints/${item.id}`}
                    className="font-semibold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
                  >
                    {item.title}
                  </Link>
                  <span className="text-[11px] text-slate-500 block truncate">{item.categoryName}</span>
                </td>
                <td className="py-3.5 px-4 text-slate-700">
                  <span className="font-semibold block">{item.locationName}</span>
                  <span className="text-[11px] text-slate-400 block truncate">{item.roomDetails}</span>
                </td>
                <td className="py-3.5 px-4 min-w-[130px]">
                  <PriorityScore score={item.priorityScore} size="sm" />
                </td>
                <td className="py-3.5 px-4">
                  <PriorityBadge priority={item.priorityLevel} size="sm" />
                </td>
                <td className="py-3.5 px-4">
                  <ComplaintStatusBadge status={item.status} size="sm" />
                </td>
                {role === 'ADMIN' && (
                  <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                    {item.assignedStaffName ? (
                      <span className="font-semibold text-slate-800">{item.assignedStaffName}</span>
                    ) : item.assignedDepartmentName ? (
                      <span className="text-slate-600">{item.assignedDepartmentName}</span>
                    ) : (
                      <span className="text-amber-600 font-medium italic">Unassigned</span>
                    )}
                  </td>
                )}
                <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">{formatDate(item.createdDate)}</td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {role === 'ADMIN' && onAssign && (
                      <button
                        onClick={() => onAssign(item)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                        title="Assign Staff"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <Link
                      href={role === 'ADMIN' ? `/admin/complaints/${item.id}` : role === 'STAFF' ? `/staff/complaints/${item.id}` : `/complaints/${item.id}`}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden divide-y divide-slate-100">
        {complaints.map((item) => (
          <div key={item.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-blue-700">{item.complaintNumber}</span>
              <ComplaintStatusBadge status={item.status} size="sm" />
            </div>

            <div>
              <Link
                href={role === 'ADMIN' ? `/admin/complaints/${item.id}` : role === 'STAFF' ? `/staff/complaints/${item.id}` : `/complaints/${item.id}`}
                className="text-sm font-bold text-slate-900 hover:text-blue-600 line-clamp-2"
              >
                {item.title}
              </Link>
              <p className="text-xs text-slate-500 mt-0.5">{item.locationName} • {item.roomDetails}</p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <PriorityBadge priority={item.priorityLevel} size="sm" />
                <span className="text-xs font-semibold text-slate-700">Score: {item.priorityScore}/100</span>
              </div>
              <Link
                href={role === 'ADMIN' ? `/admin/complaints/${item.id}` : role === 'STAFF' ? `/staff/complaints/${item.id}` : `/complaints/${item.id}`}
                className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold rounded-lg transition-colors"
              >
                Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
