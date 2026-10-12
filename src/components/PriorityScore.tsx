import React from 'react';
import { getPriorityScoreColor } from '@/lib/utils';
import { PriorityLevel } from '@/types';

interface PriorityScoreProps {
  score: number;
  level?: PriorityLevel;
  showMeter?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PriorityScore({ score, showMeter = true, size = 'md' }: PriorityScoreProps) {
  const color = getPriorityScoreColor(score);

  const containerPadding = size === 'sm' ? 'py-0.5 px-2' : size === 'lg' ? 'p-3' : 'py-1 px-2.5';
  const scoreTextSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base font-bold' : 'text-sm font-semibold';
  const meterHeight = size === 'sm' ? 'h-1' : size === 'lg' ? 'h-2.5' : 'h-1.5';

  return (
    <div className={`flex flex-col gap-1.5 rounded-lg border border-slate-200 bg-white/80 ${containerPadding}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Priority Score</span>
        <div className="flex items-center gap-1">
          <span className={`${scoreTextSize} ${color.text}`}>{score}</span>
          <span className="text-xs text-slate-400">/ 100</span>
        </div>
      </div>
      {showMeter && (
        <div className={`w-full ${color.bg} rounded-full overflow-hidden ${meterHeight}`}>
          <div
            className={`${color.fill} ${meterHeight} rounded-full transition-all duration-500`}
            style={{ width: `${Math.min(Math.max(score, 5), 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
