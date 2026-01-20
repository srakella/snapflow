'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, MessageSquare, Zap, Shield, LayoutGrid, FileText, Settings2, Activity, User, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  // Mock Action Items (In real app, fetch from /api/tasks?priority=high)
  const actionItems = [
    {
      id: 1,
      type: 'urgent',
      title: 'Expense Approval #8821',
      desc: 'Approaching SLA deadline (2 hours left)',
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      link: '/tasks/1'
    },
    {
      id: 2,
      type: 'mention',
      title: 'Comment in "Loan Process"',
      desc: '@Sarah: "Can you review this logic?"',
      icon: MessageSquare,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      link: '/designer?id=loan-process'
    },
    {
      id: 3,
      type: 'task',
      title: 'Compliance Review',
      desc: 'Pending your signature',
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50',
      link: '/tasks/2'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">

      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/snapflowlogo.png" alt="SnapFlow Logo" className="h-8 w-auto" />
            <span className="text-xl font-bold text-slate-900 tracking-tight">SnapFlow</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
                <div className="w-6 h-6 rounded-full bg-[#D41C2C] text-white flex items-center justify-center text-xs font-bold">
                  {user.fullName.charAt(0)}
                </div>
                <span className="text-sm font-semibold text-slate-700">{user.fullName}</span>
              </div>
            ) : (
              <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900">Sign In</Link>
            )}
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 pt-32 pb-12">

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto mb-20 animate-in slide-in-from-bottom-4 duration-700">

          {/* Tile 1: My Tasks (Inbox) - Visible only when logged in */}
          {user && (
            <Link href="/tasks" className="group p-6 bg-white rounded-xl border border-slate-200 hover:border-red-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600 animate-pulse">
                  3 Urgent
                </span>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="text-red-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">My Inbox</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Manage approvals and urgent priorities.
              </p>
            </Link>
          )}

          {/* Tile 2: Designer */}
          <Link href="/designer" className="group p-6 bg-white rounded-xl border border-slate-200 hover:border-slate-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <LayoutGrid className="text-slate-600" size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Designer</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Build workflows visually with BPMN 2.0.
            </p>
          </Link>

          {/* Tile 3: Rules */}
          <Link href="/rules" className="group p-6 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Settings2 className="text-blue-600" size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Rules</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Define complex business logic decisions.
            </p>
          </Link>

          {/* Tile 4: Forms */}
          <Link href="/forms/designer" className="group p-6 bg-white rounded-xl border border-slate-200 hover:border-green-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText className="text-green-600" size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Forms</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Create dynamic forms for data collection.
            </p>
          </Link>

          {/* Tile 5: Monitor */}
          <Link href="/dashboard" className="group p-6 bg-white rounded-xl border border-slate-200 hover:border-orange-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Activity className="text-orange-600" size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Monitor</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Track active instances and metrics.
            </p>
          </Link>
        </div>



        {/* Signature Tagline */}
        <div className="text-center max-w-4xl mx-auto pt-12 border-t border-slate-100">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-400 mb-6 leading-tight tracking-tight">
            Design at the speed of thought.
            <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-[#D41C2C] to-orange-600">
              Deploy in a snap.
            </span>
          </h1>

        </div>

      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Shield size={16} />
              <span>© 2026 SnapFlow Enterprise</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate-400">Enterprise Workflow Automation</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
