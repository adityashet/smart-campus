'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { MobileSidebar } from '@/components/MobileSidebar';
import { PageHeader } from '@/components/PageHeader';
import { FilterBar } from '@/components/FilterBar';
import { ComplaintTable } from '@/components/ComplaintTable';
import { AssignModal } from '@/components/AssignModal';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { EmptyState } from '@/components/EmptyState';
import { api } from '@/lib/api';
import { Complaint, ComplaintCategory, ComplaintStatus, PriorityLevel } from '@/types';

export default function AdminComplaintsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [categories, setCategories] = useState<ComplaintCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [assigningComplaint, setAssigningComplaint] = useState<Complaint | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<PriorityLevel | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('PRIORITY_HIGH');

  const loadData = async () => {
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
  };

  useEffect(() => {
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
            title="All Campus Complaints"
            subtitle="Master administration portal for searching, filtering, triaging, and assigning staff across all campus facilities."
            breadcrumbs={[{ label: 'Admin Panel', href: '/admin' }, { label: 'All Complaints' }]}
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
              title="No Complaints Found"
              description="No complaints matched your master search query and filter criteria."
            />
          ) : (
            <ComplaintTable
              complaints={complaints}
              role="ADMIN"
              onAssign={(item) => setAssigningComplaint(item)}
            />
          )}

          <AssignModal
            isOpen={!!assigningComplaint}
            onClose={() => setAssigningComplaint(null)}
            complaint={assigningComplaint}
            onSuccess={loadData}
          />
        </main>
      </div>
    </div>
  );
}
