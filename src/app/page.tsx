'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import {
  Wrench,
  ShieldAlert,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Building2,
  Users,
  Activity,
  Zap,
  TrendingUp,
  Layers,
  ChevronRight,
  GraduationCap,
  Laptop,
  Shield,
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { switchRole } = useAuth();

  const handleDemoAccess = (role: 'STUDENT' | 'STAFF' | 'ADMIN') => {
    switchRole(role);
    if (role === 'ADMIN') router.push('/admin');
    else if (role === 'STAFF') router.push('/staff');
    else router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Landing Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">CampusFix</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">
              How It Works
            </a>
            <a href="#stats" className="hover:text-blue-600 transition-colors">
              Stats & Impact
            </a>
            <a href="#demo" className="hover:text-blue-600 transition-colors">
              Demo Access
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200/60 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Next-Gen DBMS Campus Maintenance Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Smart Maintenance for a <span className="text-blue-600">Better Campus</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
                Report campus problems, track real-time repair status, visualize priority triage scores, and keep your entire university campus operating smoothly.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => handleDemoAccess('STUDENT')}
                  className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-0.5"
                >
                  <span>Report an Issue Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <Link
                  href="/login"
                  className="px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-sm font-semibold rounded-xl shadow-xs transition-all"
                >
                  Portal Login
                </Link>
              </div>

              {/* Demo Pills */}
              <div className="pt-4 border-t border-slate-200/60 flex flex-wrap items-center gap-3">
                <span className="text-xs font-semibold text-slate-500">Quick 1-Click Demo:</span>
                <button
                  onClick={() => handleDemoAccess('STUDENT')}
                  className="px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 transition-colors"
                >
                  🎓 Student Mode
                </button>
                <button
                  onClick={() => handleDemoAccess('STAFF')}
                  className="px-3 py-1 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 transition-colors"
                >
                  🔧 Staff Portal
                </button>
                <button
                  onClick={() => handleDemoAccess('ADMIN')}
                  className="px-3 py-1 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 transition-colors"
                >
                  ⚡ Admin Panel
                </button>
              </div>
            </div>

            {/* Right Interactive Visual Illustration */}
            <div className="lg:col-span-5 relative">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-800">Priority Triage Engine</span>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                    Score: 94 / 100
                  </span>
                </div>

                {/* Mock Card Preview */}
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-red-50/80 border border-red-200 text-left">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold text-red-700">CMP-1025</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded-full">
                        CRITICAL
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Electrical Sparking in Lab 3</h4>
                    <p className="text-xs text-slate-600 mt-1">Block A • Main Distribution Switchboard</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Assigned Department</span>
                      <span className="font-semibold text-slate-800">Electrical Maintenance</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Technician</span>
                      <span className="font-semibold text-blue-700">Rahul Kumar</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                      <div className="bg-blue-600 h-full w-3/4 rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Enterprise Features</h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Everything Needed for Campus Maintenance Management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Report Issues</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Seamless complaint submission with room details, severity categories, and media evidence attachment.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Smart Prioritization</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Algorithmic 0-100 priority score calculation based on severity, safety risks, and location impact.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Track Progress</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Live step-by-step resolution timeline with timestamps and staff assignment transparency.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Faster Resolution</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automated technician assignment, work acceptance workflow, and resolution audit tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Workflow Step-by-Step</h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">How CampusFix Operates</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 relative">
              <span className="text-4xl font-black text-blue-100 absolute right-4 top-4">01</span>
              <h3 className="text-sm font-bold text-slate-900 mb-1">1. Report Issue</h3>
              <p className="text-xs text-slate-500">Student or staff submits complaint details & severity level.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 relative">
              <span className="text-4xl font-black text-blue-100 absolute right-4 top-4">02</span>
              <h3 className="text-sm font-bold text-slate-900 mb-1">2. Prioritize</h3>
              <p className="text-xs text-slate-500">System evaluates priority score and ranks in critical queue.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 relative">
              <span className="text-4xl font-black text-blue-100 absolute right-4 top-4">03</span>
              <h3 className="text-sm font-bold text-slate-900 mb-1">3. Assign</h3>
              <p className="text-xs text-slate-500">Admin dispatches complaint to specialized maintenance department.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 relative">
              <span className="text-4xl font-black text-blue-100 absolute right-4 top-4">04</span>
              <h3 className="text-sm font-bold text-slate-900 mb-1">4. Resolve</h3>
              <p className="text-xs text-slate-500">Technician completes work, uploads notes, and closes complaint.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section id="stats" className="py-16 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="text-xs font-bold text-blue-300 uppercase tracking-widest">Demonstration Metrics</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-white">1,250+</div>
              <div className="text-xs text-blue-200 mt-1 font-medium">Issues Resolved</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-white">98%</div>
              <div className="text-xs text-blue-200 mt-1 font-medium">Resolution Rate</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-white">24</div>
              <div className="text-xs text-blue-200 mt-1 font-medium">Campus Departments</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-white">4.8 / 5</div>
              <div className="text-xs text-blue-200 mt-1 font-medium">User Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Roles Access Section */}
      <section id="demo" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white text-center max-w-4xl mx-auto shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Try Demo Mode Instantly</h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto mb-8 leading-relaxed">
              Explore the entire role-based workflow (Student submission, Admin priority assignment, Staff resolution) without backend setup.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => handleDemoAccess('STUDENT')}
                className="p-5 rounded-2xl bg-slate-800 hover:bg-blue-600 transition-all border border-slate-700 text-left group"
              >
                <GraduationCap className="w-6 h-6 text-blue-400 group-hover:text-white mb-2" />
                <h4 className="text-sm font-bold text-white">Student Portal</h4>
                <p className="text-[11px] text-slate-400 group-hover:text-blue-100 mt-1">Submit & track complaints</p>
              </button>

              <button
                onClick={() => handleDemoAccess('STAFF')}
                className="p-5 rounded-2xl bg-slate-800 hover:bg-amber-600 transition-all border border-slate-700 text-left group"
              >
                <Laptop className="w-6 h-6 text-amber-400 group-hover:text-white mb-2" />
                <h4 className="text-sm font-bold text-white">Staff Portal</h4>
                <p className="text-[11px] text-slate-400 group-hover:text-amber-100 mt-1">Accept tasks & resolve</p>
              </button>

              <button
                onClick={() => handleDemoAccess('ADMIN')}
                className="p-5 rounded-2xl bg-slate-800 hover:bg-purple-600 transition-all border border-slate-700 text-left group"
              >
                <Shield className="w-6 h-6 text-purple-400 group-hover:text-white mb-2" />
                <h4 className="text-sm font-bold text-white">Admin Dashboard</h4>
                <p className="text-[11px] text-slate-400 group-hover:text-purple-100 mt-1">Priority queue & analytics</p>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 text-xs py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-blue-500" />
            <span className="font-bold text-white">CampusFix System</span>
          </div>
          <p>© {new Date().getFullYear()} CampusFix Management Platform. Suitable for DBMS College Demonstration.</p>
        </div>
      </footer>
    </div>
  );
}
