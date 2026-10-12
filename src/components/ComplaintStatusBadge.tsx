import React from 'react';
import { ComplaintStatus } from '@/types';
import { getStatusBadgeColor } from '@/lib/utils';
import { Clock, CheckCircle2, AlertCircle, Wrench, FileCheck, XCircle } from 'lucide-react';

interface ComplaintStatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function ComplaintStatusBadge({ status, size = 'md' }: ComplaintStatusBadgeProps) {
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs gap-1'
      : size === 'lg'
      ? 'px-3 py-1.5 text-sm gap-2'
      : 'px-2.5 py-1 text-xs gap-1.5';

  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  const colorClass = getStatusBadgeColor(status);

  const getStatusLabel = (st: ComplaintStatus) => {
    switch (st) {
      case 'SUBMITTED':
        return 'Submitted';
      case 'REVIEWED':
        return 'Reviewed';
      case 'ASSIGNED':
        return 'Assigned';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'RESOLVED':
        return 'Resolved';
      case 'REJECTED':
        return 'Rejected';
      default:
        return st;
    }
  };

  return (
    <span className={`inline-flex items-center rounded-md border ${sizeClasses} ${colorClass}`}>
      {status === 'SUBMITTED' && <Clock className={iconSize} />}
      {status === 'REVIEWED' && <FileCheck className={iconSize} />}
      {status === 'ASSIGNED' && <AlertCircle className={iconSize} />}
      {status === 'IN_PROGRESS' && <Wrench className={`${iconSize} animate-spin-slow`} />}
      {status === 'RESOLVED' && <CheckCircle2 className={iconSize} />}
      {status === 'REJECTED' && <XCircle className={iconSize} />}
      <span>{getStatusLabel(status)}</span>
    </span>
  );
}
