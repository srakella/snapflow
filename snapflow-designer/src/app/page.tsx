'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, MessageSquare, Zap, Shield, LayoutGrid, FileText, Settings2, Activity } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-12">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-semibold mb-8 border border-red-100 shadow-sm animate-fade-in-up">
            <Zap size={16} className="text-red-600 fill-current" />
            <span>Communication Design Platform</span>
          </div>

          <h1 className="text-6xl font-bold text-slate-900 mb-8 leading-tight tracking-tight">
            Design smarter
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-[#D41C2C] to-orange-600">
              Communication Flows
            </span>
          </h1>

          <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto mb-12">
            Orchestrate enterprise communications with our visual designer.
            Build rules, design forms, and automate decisions in one unified platform.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/designer"
              className="px-8 py-4 bg-[#D41C2C] text-white rounded-lg font-bold text-lg hover:bg-[#B81926] hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
            >
              Open Designer
              <ArrowRight size={20} />
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-white text-slate-700 border border-slate-300 rounded-lg font-bold text-lg hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              View Dashboard
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Card 1: Designer */}
          <Link href="/designer" className="group p-6 bg-white rounded-xl border border-slate-200 hover:border-red-400 hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <LayoutGrid className="text-red-600" size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Visual Designer</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Drag-and-drop workflow builder with support for BPMN 2.0 and dynamic routing.
            </p>
          </Link>

          {/* Card 2: Rules */}
          <Link href="/rules" className="group p-6 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Settings2 className="text-blue-600" size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Rules Engine</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Define complex business logic and decision tables visually.
            </p>
          </Link>

          {/* Card 3: Forms */}
          <Link href="/forms/designer" className="group p-6 bg-white rounded-xl border border-slate-200 hover:border-green-400 hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText className="text-green-600" size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Form Builder</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Create dynamic forms for user tasks and data collection.
            </p>
          </Link>

          {/* Card 4: Monitor */}
          <Link href="/dashboard" className="group p-6 bg-white rounded-xl border border-slate-200 hover:border-orange-400 hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Activity className="text-orange-600" size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Real-time Monitor</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Track active instances and analyze performance metrics.
            </p>
          </Link>
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
              <span className="text-slate-400">Communication Design Platform</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
