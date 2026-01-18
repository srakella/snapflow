"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Workflow, BarChart3, Zap, Shield, GitBranch } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-red-600 blur-sm opacity-50"></div>
                <div className="relative bg-gradient-to-br from-red-600 to-red-700 p-2.5 rounded-lg">
                  <Workflow className="text-white" size={24} strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">SnapFlow</h1>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Enterprise Automation</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                System Online
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-800 rounded-full text-sm font-semibold mb-6 border border-yellow-200">
            <Zap size={16} className="text-yellow-600" />
            <span>Powered by Flowable & Gemini AI</span>
          </div>
          <h2 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
            Build, Deploy & Monitor
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">
              Business Workflows
            </span>
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Enterprise-grade workflow automation platform with visual design tools,
            real-time monitoring, and AI-powered task execution.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">

          {/* Workflow Designer Card */}
          <Link
            href="/designer"
            className="group relative bg-white rounded-2xl border-2 border-slate-200 overflow-hidden hover:border-red-400 transition-all duration-300 hover:shadow-2xl hover:shadow-red-100"
          >
            {/* Image Section */}
            <div className="relative h-64 bg-gradient-to-br from-red-50 to-slate-50 overflow-hidden">
              <div className="absolute inset-0 bg-grid-slate-200 opacity-30"></div>
              <div className="relative h-full flex items-center justify-center p-8">
                <Image
                  src="/images/workflow-designer.png"
                  alt="Workflow Designer"
                  width={400}
                  height={300}
                  className="object-contain transform group-hover:scale-105 transition-transform duration-500"
                  priority
                />
              </div>
              <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">
                Designer
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-red-100 rounded-xl group-hover:bg-red-600 transition-colors">
                  <GitBranch className="text-red-600 group-hover:text-white transition-colors" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-red-600 transition-colors">
                    Workflow Designer
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    Visual BPMN 2.0 process modeling with drag-and-drop interface.
                    Configure tasks, forms, gateways, and service integrations with zero code.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">BPMN 2.0</span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">Form Builder</span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">AI Tasks</span>
              </div>

              <div className="flex items-center text-red-600 font-semibold group-hover:text-red-700">
                <span>Open Designer</span>
                <ArrowRight size={20} className="ml-2 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Runtime Dashboard Card */}
          <Link
            href="/dashboard"
            className="group relative bg-white rounded-2xl border-2 border-slate-200 overflow-hidden hover:border-orange-400 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-100"
          >
            {/* Image Section */}
            <div className="relative h-64 bg-gradient-to-br from-orange-50 to-slate-50 overflow-hidden">
              <div className="absolute inset-0 bg-grid-slate-200 opacity-30"></div>
              <div className="relative h-full flex items-center justify-center p-8">
                <Image
                  src="/images/dashboard-monitoring.png"
                  alt="Runtime Dashboard"
                  width={400}
                  height={300}
                  className="object-contain transform group-hover:scale-105 transition-transform duration-500"
                  priority
                />
              </div>
              <div className="absolute top-4 right-4 bg-orange-600 text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">
                Runtime
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-orange-100 rounded-xl group-hover:bg-orange-600 transition-colors">
                  <BarChart3 className="text-orange-600 group-hover:text-white transition-colors" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">
                    Runtime Dashboard
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    Real-time monitoring and management of workflow instances.
                    Track execution, manage tasks, and analyze performance metrics.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">Live Monitoring</span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">Task Management</span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">Analytics</span>
              </div>

              <div className="flex items-center text-orange-600 font-semibold group-hover:text-orange-700">
                <span>Open Dashboard</span>
                <ArrowRight size={20} className="ml-2 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </Link>

        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="text-center p-6 bg-white rounded-xl border border-slate-200">
            <div className="text-3xl font-bold text-slate-900 mb-1">BPMN 2.0</div>
            <div className="text-sm text-slate-600 font-medium">Standard Compliant</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl border border-slate-200">
            <div className="text-3xl font-bold text-slate-900 mb-1">Real-time</div>
            <div className="text-sm text-slate-600 font-medium">Process Monitoring</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl border border-slate-200">
            <div className="text-3xl font-bold text-slate-900 mb-1">AI-Powered</div>
            <div className="text-sm text-slate-600 font-medium">Task Automation</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Shield size={16} />
              <span>© 2026 SnapFlow Enterprise Workflow Engine</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate-400">Built with Flowable & Gemini AI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
