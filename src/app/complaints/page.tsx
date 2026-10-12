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
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

export default function MyComplaintsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [categories, setCategories] = useState<ComplaintCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<PriorityLevel | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('NEWEST');

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
    setSortBy('NEWEST');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenMobileMenu={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <PageHeader
            title="My Complaints"
            subtitle="Search, filter, and monitor all your submitted campus maintenance requests."
            action={
              <Link
                href="/complaints/new"
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report New Issue</span>
              </Link>
            }
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
              description="No maintenance complaints matched your current search filters."
              actionLabel="Report New Issue"
              actionHref="/complaints/new"
            />
          ) : (
            <ComplaintTable complaints={complaints} role="STUDENT" />
          )}
        </main>
      </div>
    </div>
  );
}
