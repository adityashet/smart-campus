import { PriorityLevel, ComplaintStatus } from '@/types';

export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function getPriorityBadgeColor(priority: PriorityLevel): string {
  switch (priority) {
    case 'CRITICAL':
      return 'bg-red-50 text-red-700 border-red-200 font-semibold ring-1 ring-red-600/10';
    case 'HIGH':
      return 'bg-orange-50 text-orange-700 border-orange-200 font-semibold ring-1 ring-orange-600/10';
    case 'MEDIUM':
      return 'bg-amber-50 text-amber-800 border-amber-200 font-medium ring-1 ring-amber-600/10';
    case 'LOW':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium ring-1 ring-emerald-600/10';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export function getStatusBadgeColor(status: ComplaintStatus): string {
  switch (status) {
    case 'SUBMITTED':
      return 'bg-blue-50 text-blue-700 border-blue-200 font-medium';
    case 'REVIEWED':
      return 'bg-purple-50 text-purple-700 border-purple-200 font-medium';
    case 'ASSIGNED':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200 font-medium';
    case 'IN_PROGRESS':
      return 'bg-amber-50 text-amber-700 border-amber-200 font-semibold animate-pulse-subtle';
    case 'RESOLVED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';
    case 'REJECTED':
      return 'bg-rose-50 text-rose-700 border-rose-200 font-medium';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export function getPriorityScoreColor(score: number): {
  bg: string;
  fill: string;
  text: string;
} {
  if (score >= 76) {
    return { bg: 'bg-red-100', fill: 'bg-red-600', text: 'text-red-700' };
  } else if (score >= 51) {
    return { bg: 'bg-orange-100', fill: 'bg-orange-500', text: 'text-orange-700' };
  } else if (score >= 26) {
    return { bg: 'bg-amber-100', fill: 'bg-amber-500', text: 'text-amber-800' };
  } else {
    return { bg: 'bg-emerald-100', fill: 'bg-emerald-500', text: 'text-emerald-700' };
  }
}

export function calculatePriorityScore(severity: string, location: string, category: string): { score: number; level: PriorityLevel } {
  let score = 20;
  if (severity === 'CRITICAL') score += 45;
  else if (severity === 'HIGH') score += 30;
  else if (severity === 'MEDIUM') score += 15;
  else score += 5;

  if (category.toLowerCase().includes('elec') || category.toLowerCase().includes('water')) score += 20;
  else if (category.toLowerCase().includes('ac') || category.toLowerCase().includes('net')) score += 15;

  if (location.toLowerCase().includes('lab') || location.toLowerCase().includes('main')) score += 15;

  const finalScore = Math.min(Math.max(score, 10), 98);
  let level: PriorityLevel = 'LOW';
  if (finalScore >= 76) level = 'CRITICAL';
  else if (finalScore >= 51) level = 'HIGH';
  else if (finalScore >= 26) level = 'MEDIUM';

  return { score: finalScore, level };
}
