"use client";

import React from 'react';
import Link from 'next/link';
import { PenTool, Activity, ArrowRight, Layers } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b-4 border-[#D41C2C] px-8 py-6 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="bg-[#D41C2C] p-2 rounded-md">
            <Layers className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#D41C2C] tracking-tight">SnapFlow</h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Enterprise Workflow Engine</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-8 flex items-center justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">

          {/* Designer Card */}
          <Link href="/designer" className="group relative bg-white rounded-xl shadow-md border border-gray-200 p-8 hover:shadow-xl hover:border-[#D41C2C]/30 transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <PenTool size={120} className="text-[#D41C2C]" />
            </div>
            <div className="relative z-10">
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:bg-[#D41C2C] transition-colors duration-300">
                <PenTool size={32} className="text-blue-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-[#D41C2C] transition-colors">Workflow Designer</h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Design, model, and deploy BPMN 2.0 executable processes. configure tasks, forms, and decision logic visually.
              </p>
              <div className="flex items-center text-sm font-bold text-blue-600 uppercase tracking-wide group-hover:text-[#D41C2C] transition-colors">
                Launch Designer <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Dashboard Card */}
          <Link href="/dashboard" className="group relative bg-white rounded-xl shadow-md border border-gray-200 p-8 hover:shadow-xl hover:border-[#FCCF0A]/50 transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity size={120} className="text-[#FCCF0A]" />
            </div>
            <div className="relative z-10">
              <div className="bg-yellow-50 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:bg-[#FCCF0A] transition-colors duration-300">
                <Activity size={32} className="text-yellow-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-yellow-600 transition-colors">Runtime Dashboard</h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Monitor active instances, manage task lists, handle administrative operations, and track workflow health.
              </p>
              <div className="flex items-center text-sm font-bold text-yellow-600 uppercase tracking-wide group-hover:text-yellow-700 transition-colors">
                Open Dashboard <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-400 text-xs font-medium uppercase tracking-wider">
        &copy; 2026 SnapFlow &bull; Powered by Flowable & Gemini
      </footer>
    </div>
  );
}
