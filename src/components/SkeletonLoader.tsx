import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ label = 'Loading data...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
      <span className="text-xs font-semibold text-slate-500">{label}</span>
    </div>
  );
}

export function SkeletonLoader({ type = 'table' }: { type?: 'table' | 'cards' | 'details' }) {
  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-200/70 rounded-2xl p-4" />
        ))}
      </div>
    );
  }

  if (type === 'details') {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 bg-slate-200/70 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-200/70 rounded-2xl" />
          <div className="h-80 bg-slate-200/70 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 animate-pulse">
      <div className="h-6 w-48 bg-slate-200 rounded-lg" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 bg-slate-100 rounded-xl w-full" />
        ))}
      </div>
    </div>
  );
}
