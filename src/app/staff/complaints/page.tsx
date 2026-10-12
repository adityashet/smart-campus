'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { MobileSidebar } from '@/components/MobileSidebar';
import { PageHeader } from '@/components/PageHeader';
import { FilterBar } from '@/components/FilterBar';
import { ComplaintTable } from '@/components/ComplaintTable';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { EmptyState } from '@/components/EmptyState';
import { api } from '@/lib/api';
import { Complaint, ComplaintCategory, ComplaintStatus, PriorityLevel } from '@/types';

export default function StaffComplaintsListPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [categories, setCategories] = useState<ComplaintCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<PriorityLevel | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('PRIORITY_HIGH');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const cats = await api.getCategories();
      setCategories(cats);
      const data = await api.getComplaints({
        search: searchQuery,
        status: statusFilter,
        priority: priorityFilter,
        category: categoryFilter,
        sortBy: sortBy as any,
      });
      setComplaints(data);
      setLoading(false);
    }
    loadData();
  }, [searchQuery, statusFilter, priorityFilter, categoryFilter, sortBy]);

  const handleReset = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setCategoryFilter('ALL');
    setSortBy('PRIORITY_HIGH');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenMobileMenu={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <PageHeader
            title="Assigned Complaints Queue"
            subtitle="Manage, triage, and update resolution statuses for maintenance tasks assigned to your team."
            breadcrumbs={[{ label: 'Staff Portal', href: '/staff' }, { label: 'Assigned Complaints' }]}
          />

          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            priorityFilter={priorityFilter}
            onPriorityChange={setPriorityFilter}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            categories={categories}
            onReset={handleReset}
          />

          {loading ? (
            <SkeletonLoader type="table" />
          ) : complaints.length === 0 ? (
            <EmptyState
              title="No Assigned Complaints"
              description="There are currently no maintenance complaints matching your filters."
            />
          ) : (
            <ComplaintTable complaints={complaints} role="STAFF" />
          )}
        </main>
      </div>
    </div>
  );
}
