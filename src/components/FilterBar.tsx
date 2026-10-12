'use client';

import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { ComplaintStatus, PriorityLevel } from '@/types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: ComplaintStatus | 'ALL';
  onStatusChange: (s: ComplaintStatus | 'ALL') => void;
  priorityFilter: PriorityLevel | 'ALL';
  onPriorityChange: (p: PriorityLevel | 'ALL') => void;
  categoryFilter: string;
  onCategoryChange: (c: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  categories?: { id: string; name: string }[];
  onReset?: () => void;
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  categoryFilter,
  onCategoryChange,
  sortBy,
  onSortChange,
  categories = [],
  onReset,
}: FilterBarProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by Complaint ID (e.g. CMP-1025), issue title, room..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Sort By Dropdown */}
        <div className="w-full sm:w-48">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none font-medium"
          >
            <option value="NEWEST">Sort: Newest First</option>
            <option value="OLDEST">Sort: Oldest First</option>
            <option value="PRIORITY_HIGH">Sort: Highest Priority</option>
            <option value="PRIORITY_LOW">Sort: Lowest Priority</option>
          </select>
        </div>
      </div>

      {/* Filter Dropdowns Grid */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
          <Filter className="w-3.5 h-3.5" /> Filters:
        </span>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as ComplaintStatus | 'ALL')}
          className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none"
        >
          <option value="ALL">Status: All</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="REVIEWED">Reviewed</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => onPriorityChange(e.target.value as PriorityLevel | 'ALL')}
          className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none"
        >
          <option value="ALL">Priority: All</option>
          <option value="CRITICAL">Critical (76-100)</option>
          <option value="HIGH">High (51-75)</option>
          <option value="MEDIUM">Medium (26-50)</option>
          <option value="LOW">Low (0-25)</option>
        </select>

        {/* Category Filter */}
        {categories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none"
          >
            <option value="ALL">Category: All</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        )}

        {onReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors ml-auto font-medium"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
