'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { MobileSidebar } from '@/components/MobileSidebar';
import { PageHeader } from '@/components/PageHeader';
import { useToast } from '@/components/Toast';
import { Settings, Bell, Wrench, Shield, Save, Building, ToggleLeft, ToggleRight } from 'lucide-react';

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Settings State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [criticalSmsAlerts, setCriticalSmsAlerts] = useState(true);
  const [autoAssignment, setAutoAssignment] = useState(false);
  const [priorityWeight, setPriorityWeight] = useState('HIGH');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('Settings Saved', 'System preferences updated successfully.', 'success');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenMobileMenu={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto w-full">
          <PageHeader
            title="System Settings"
            subtitle="Configure priority rules, notification preferences, and department workflows."
            breadcrumbs={[{ label: 'Admin Panel', href: '/admin' }, { label: 'Settings' }]}
          />

          <form onSubmit={handleSave} className="space-y-6">
            {/* Notification Preferences Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <span>Notification & Alert Preferences</span>
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Critical Complaint Email Alerts</span>
                    <span className="text-[11px] text-slate-500">Dispatch instant email alerts to department heads when critical complaints arise.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEmailAlerts(!emailAlerts)}
                    className="text-blue-600 focus:outline-none"
                  >
                    {emailAlerts ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Technician SMS Dispatch</span>
                    <span className="text-[11px] text-slate-500">Send high priority SMS notifications to assigned technicians.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCriticalSmsAlerts(!criticalSmsAlerts)}
                    className="text-blue-600 focus:outline-none"
                  >
                    {criticalSmsAlerts ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Backend Priority Engine Rules */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                <span>Backend Priority Engine Triage Weighting</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Safety Risk Multiplier Weight</label>
                  <select
                    value={priorityWeight}
                    onChange={(e) => setPriorityWeight(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs text-slate-900 focus:bg-white focus:outline-none"
                  >
                    <option value="STANDARD">Standard Safety Weight (1.0x)</option>
                    <option value="HIGH">High Urgency Weight (1.5x - Recommended for Labs & Power)</option>
                    <option value="AGGRESSIVE">Aggressive Safety Priority (2.0x)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Automated Department Routing</span>
                    <span className="text-[11px] text-slate-500">Auto-assign incoming complaints based on category defaults.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoAssignment(!autoAssignment)}
                    className="text-blue-600 focus:outline-none"
                  >
                    {autoAssignment ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving Settings...' : 'Save All Settings'}</span>
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
