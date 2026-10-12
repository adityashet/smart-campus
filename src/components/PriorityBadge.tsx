import React from 'react';
import { PriorityLevel } from '@/types';
import { getPriorityBadgeColor } from '@/lib/utils';
import { AlertTriangle, AlertCircle, ShieldAlert, CheckCircle } from 'lucide-react';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PriorityBadge({ priority, showIcon = true, size = 'md' }: PriorityBadgeProps) {
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs gap-1'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-sm gap-2'
      : 'px-2.5 py-1 text-xs gap-1.5';

  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  const colorClass = getPriorityBadgeColor(priority);

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-2xs ${sizeClasses} ${colorClass}`}
    >
      {showIcon && (
        <>
          {priority === 'CRITICAL' && <ShieldAlert className={`${iconSize} animate-bounce-subtle`} />}
          {priority === 'HIGH' && <AlertTriangle className={iconSize} />}
          {priority === 'MEDIUM' && <AlertCircle className={iconSize} />}
          {priority === 'LOW' && <CheckCircle className={iconSize} />}
        </>
      )}
      <span>{priority}</span>
    </span>
  );
}
