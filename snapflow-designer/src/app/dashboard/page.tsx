"use client";

import React, { useEffect, useState } from 'react';
import { Play, Activity, Package, Loader2, ClipboardList, Trash2, Ban, Home, PenTool, Search, ArrowUpDown, SlidersHorizontal, Eye, MessageCircle, Send, BookOpen, ToggleRight, CheckSquare, List, MousePointerClick } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const [deployments, setDeployments] = useState<any[]>([]);
    const [instances, setInstances] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isStartModalOpen, setIsStartModalOpen] = useState(false);
    const [selectedDefinition, setSelectedDefinition] = useState<any>(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isInstanceDetailsOpen, setIsInstanceDetailsOpen] = useState(false);
    const [selectedInstance, setSelectedInstance] = useState<any>(null);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'deployments' | 'instances' | 'tasks' | 'history' | 'admin' | 'help'>('deployments');
    const [adminSubTab, setAdminSubTab] = useState<'definitions' | 'instances' | 'users' | 'groups' | 'settings'>('definitions');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' as 'asc' | 'desc' });

    const filteredDeployments = React.useMemo(() => {
        return deployments.filter(d =>
            (d.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (d.key || '').toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a: any, b: any) => {
            const aVal = a[sortConfig.key] || '';
            const bVal = b[sortConfig.key] || '';
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [deployments, searchTerm, sortConfig]);

    const handleSort = (key: string) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [defsRes, instsRes, tasksRes, historyRes] = await Promise.all([
                fetch('http://localhost:8081/api/runtime/definitions'),
                fetch('http://localhost:8081/api/runtime/instances'),
                fetch('http://localhost:8081/api/runtime/tasks'),
                fetch('http://localhost:8081/api/audit/instances')
            ]);

            const defs = await defsRes.json();
            const insts = await instsRes.json();
            const tasksData = await tasksRes.json();
            const historyData = historyRes.ok ? await historyRes.json() : [];

            setDeployments(defs);
            setInstances(insts);
            setTasks(tasksData);
            setHistory(historyData);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    const openStartModal = (def: any) => {
        setSelectedDefinition(def);
        setIsStartModalOpen(true);
    };

    const openTaskModal = (task: any) => {
        setSelectedTask(task);
        setIsTaskModalOpen(true);
    };

    const openInstanceDetails = (inst: any) => {
        setSelectedInstance(inst);
        setIsInstanceDetailsOpen(true);
    };

    return (
        <div className="min-h-screen bg-[#f4f4f4] text-gray-800 font-sans">
            {/* Header */}
            <header className="bg-white border-b-4 border-[#D41C2C] px-8 py-4 flex justify-between items-center shadow-sm">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-[#D41C2C] tracking-tight">SnapFlow Monitor</h1>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Runtime Dashboard</p>
                </div>
                <div className="flex gap-4">
                    <Link href="/" className="text-sm font-bold text-gray-600 hover:text-[#D41C2C] transition-colors uppercase tracking-wide flex items-center gap-1">
                        <Home size={16} /> Home
                    </Link>
                    <Link href="/designer" className="text-sm font-bold text-gray-600 hover:text-[#D41C2C] transition-colors uppercase tracking-wide flex items-center gap-1">
                        <PenTool size={16} /> Designer
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-8">
                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                    <button
                        className={`px-6 py-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors whitespace-nowrap ${activeTab === 'deployments'
                            ? 'border-[#D41C2C] text-[#D41C2C]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => setActiveTab('deployments')}
                    >
                        Deployed Workflows
                    </button>
                    <button
                        className={`px-6 py-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors whitespace-nowrap ${activeTab === 'instances'
                            ? 'border-[#FCCF0A] text-gray-800'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => setActiveTab('instances')}
                    >
                        Active Instances
                    </button>

                    <button
                        className={`px-6 py-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors whitespace-nowrap ${activeTab === 'history'
                            ? 'border-purple-600 text-purple-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => setActiveTab('history')}
                    >
                        History / Audits
                    </button>

                    <button
                        className={`px-6 py-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors whitespace-nowrap ${activeTab === 'admin'
                            ? 'border-red-600 text-red-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => setActiveTab('admin')}
                    >
                        Admin
                    </button>
                    <button
                        className={`px-6 py-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors whitespace-nowrap ${activeTab === 'help'
                            ? 'border-teal-600 text-teal-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => setActiveTab('help')}
                    >
                        Help & Docs
                    </button>
                </div>

                {/* Deployed Workflows Content */}
                {activeTab === 'deployments' && (
                    <section className="bg-white rounded-sm shadow-md border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                                    <Package size={20} className="text-[#D41C2C]" />
                                    Deployed Workflows
                                </h2>
                                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">{deployments.length}</span>
                            </div>

                            <div className="flex items-center gap-2 flex-grow max-w-md justify-end">
                                <div className="relative group w-full max-w-xs">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#D41C2C] transition-colors" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Filter by name or key..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#D41C2C] focus:border-[#D41C2C] transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100 text-gray-500 font-bold uppercase text-xs sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-6 py-3 cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => handleSort('name')}>
                                            <div className="flex items-center gap-1">Name <ArrowUpDown size={12} className={sortConfig.key === 'name' ? 'text-[#D41C2C]' : 'opacity-30'} /></div>
                                        </th>
                                        <th className="px-6 py-3 cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => handleSort('key')}>
                                            <div className="flex items-center gap-1">Key <ArrowUpDown size={12} className={sortConfig.key === 'key' ? 'text-[#D41C2C]' : 'opacity-30'} /></div>
                                        </th>
                                        <th className="px-6 py-3 cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => handleSort('version')}>
                                            <div className="flex items-center gap-1">Version <ArrowUpDown size={12} className={sortConfig.key === 'version' ? 'text-[#D41C2C]' : 'opacity-30'} /></div>
                                        </th>
                                        <th className="px-6 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {isLoading && deployments.length === 0 ? (
                                        <tr><td colSpan={4} className="p-4 text-center text-gray-400">Loading definitions...</td></tr>
                                    ) : filteredDeployments.length === 0 ? (
                                        <tr><td colSpan={4} className="p-8 text-center text-gray-400 italic">No workflows found matching "{searchTerm}"</td></tr>
                                    ) : filteredDeployments.map((def) => (
                                        <tr key={def.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-800">{def.name || 'Untitled'}</td>
                                            <td className="px-6 py-4 font-mono text-xs text-gray-500">{def.key}</td>
                                            <td className="px-6 py-4 text-gray-600">v{def.version}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => openStartModal(def)}
                                                    className="inline-flex items-center gap-1 bg-[#D41C2C] text-white px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wide hover:bg-[#B81926] transition-colors shadow-sm"
                                                >
                                                    <Play size={12} fill="currentColor" /> Start
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* Active Instances Content */}
                {activeTab === 'instances' && (
                    <section className="bg-white rounded-sm shadow-md border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* ... existing instances content ... */}
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                                <Activity size={20} className="text-[#FCCF0A]" />
                                Active Instances
                            </h2>
                            <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">{instances.length}</span>
                        </div>

                        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100 text-gray-500 font-bold uppercase text-xs sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-6 py-3">Process</th>
                                        <th className="px-6 py-3">Started</th>
                                        <th className="px-6 py-3 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {isLoading && instances.length === 0 ? (
                                        <tr><td colSpan={3} className="p-4 text-center text-gray-400">Loading instances...</td></tr>
                                    ) : instances.length === 0 ? (
                                        <tr><td colSpan={3} className="p-8 text-center text-gray-400 italic">No active processes running.</td></tr>
                                    ) : instances.map((inst) => (
                                        <tr key={inst.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-800">{inst.processDefinitionName || inst.processDefinitionKey}</div>
                                                <div className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {inst.id}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 text-xs">
                                                {new Date(inst.startTime).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-sm border border-green-100">
                                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                        In-Progress
                                                    </span>
                                                    <button
                                                        onClick={() => openInstanceDetails(inst)}
                                                        className="inline-flex items-center gap-1 text-gray-500 hover:text-[#D41C2C] bg-white hover:bg-gray-50 border border-gray-200 px-2 py-1 rounded-sm text-xs font-bold transition-colors shadow-sm"
                                                        title="View Active Tasks"
                                                    >
                                                        <Eye size={14} /> View
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}





                {/* History Content */}
                {activeTab === 'history' && (
                    <section className="bg-white rounded-sm shadow-md border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                                <Activity size={20} className="text-purple-600" />
                                Process History
                            </h2>
                            <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded-full">{history.length}</span>
                        </div>
                        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100 text-gray-500 font-bold uppercase text-xs sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-6 py-3">Process</th>
                                        <th className="px-6 py-3">Start Time</th>
                                        <th className="px-6 py-3">End Time</th>
                                        <th className="px-6 py-3">Duration (ms)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {isLoading && history.length === 0 ? (
                                        <tr><td colSpan={4} className="p-4 text-center text-gray-400">Loading history...</td></tr>
                                    ) : history.length === 0 ? (
                                        <tr><td colSpan={4} className="p-8 text-center text-gray-400 italic">No history available.</td></tr>
                                    ) : history.map((h) => (
                                        <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-800">{h.processDefinitionKey}</div>
                                                <div className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {h.id}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 text-xs">{new Date(h.startTime).toLocaleString()}</td>
                                            <td className="px-6 py-4 text-gray-600 text-xs">{h.endTime ? new Date(h.endTime).toLocaleString() : '-'}</td>
                                            <td className="px-6 py-4 text-gray-600 font-mono text-xs">{h.durationInMillis || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {activeTab === 'admin' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 grid grid-cols-12 gap-8">
                        {/* Admin Sub Links */}
                        <div className="col-span-12 md:col-span-3">
                            <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-2 space-y-1">
                                <button
                                    onClick={() => setAdminSubTab('definitions')}
                                    className={`w-full text-left px-4 py-2 text-sm font-bold border-l-4 transition-all ${adminSubTab === 'definitions' ? 'border-red-600 bg-red-50 text-red-700' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                                >
                                    Definitions
                                </button>
                                <button
                                    onClick={() => setAdminSubTab('instances')}
                                    className={`w-full text-left px-4 py-2 text-sm font-bold border-l-4 transition-all ${adminSubTab === 'instances' ? 'border-red-600 bg-red-50 text-red-700' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                                >
                                    Instances
                                </button>
                                <div className="h-px bg-gray-100 my-2"></div>
                                <button
                                    onClick={() => setAdminSubTab('users')}
                                    className={`w-full text-left px-4 py-2 text-sm font-bold border-l-4 transition-all ${adminSubTab === 'users' ? 'border-red-600 bg-red-50 text-red-700' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                                >
                                    User Management
                                </button>
                                <button
                                    onClick={() => setAdminSubTab('groups')}
                                    className={`w-full text-left px-4 py-2 text-sm font-bold border-l-4 transition-all ${adminSubTab === 'groups' ? 'border-red-600 bg-red-50 text-red-700' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                                >
                                    Groups
                                </button>
                                <div className="h-px bg-gray-100 my-2"></div>
                                <button
                                    onClick={() => setAdminSubTab('settings')}
                                    className={`w-full text-left px-4 py-2 text-sm font-bold border-l-4 transition-all ${adminSubTab === 'settings' ? 'border-red-600 bg-red-50 text-red-700' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                                >
                                    System Settings
                                </button>
                            </div>
                        </div>

                        {/* Admin Content Area */}
                        <div className="col-span-12 md:col-span-9 space-y-6">

                            {/* DEFINITIONS TAB */}
                            {adminSubTab === 'definitions' && (
                                <section className="bg-white rounded-sm shadow-md border border-red-200 overflow-hidden">
                                    <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center justify-between">
                                        <h2 className="text-lg font-bold text-red-800 flex items-center gap-2">
                                            <Package size={20} className="text-red-600" />
                                            Manage Definitions
                                        </h2>
                                    </div>
                                    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-white text-gray-500 font-bold uppercase text-xs border-b border-gray-100 sticky top-0 z-10 shadow-sm">
                                                <tr>
                                                    <th className="px-6 py-3">Name</th>
                                                    <th className="px-6 py-3">Key</th>
                                                    <th className="px-6 py-3">Ver</th>
                                                    <th className="px-6 py-3 text-right">Danger Zone</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {deployments.map((def) => (
                                                    <tr key={def.id} className="hover:bg-red-50/30 transition-colors">
                                                        <td className="px-6 py-4 font-medium text-gray-800">{def.name}</td>
                                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">{def.key}</td>
                                                        <td className="px-6 py-4 text-gray-600">v{def.version}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm('Are you sure you want to DELETE this version? This will cascade delete all instances.')) {
                                                                        fetch(`http://localhost:8081/api/admin/definitions/${def.id}`, { method: 'DELETE' })
                                                                            .then(() => fetchData());
                                                                    }
                                                                }}
                                                                className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 hover:bg-red-100 px-3 py-1.5 rounded-sm text-xs font-bold uppercase transition-colors"
                                                            >
                                                                <Trash2 size={14} /> Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            )}

                            {/* INSTANCES TAB */}
                            {adminSubTab === 'instances' && (
                                <section className="bg-white rounded-sm shadow-md border border-red-200 overflow-hidden">
                                    <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center justify-between">
                                        <h2 className="text-lg font-bold text-red-800 flex items-center gap-2">
                                            <Activity size={20} className="text-red-600" />
                                            Manage Instances
                                        </h2>
                                    </div>
                                    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-white text-gray-500 font-bold uppercase text-xs border-b border-gray-100 sticky top-0 z-10 shadow-sm">
                                                <tr>
                                                    <th className="px-6 py-3">Process</th>
                                                    <th className="px-6 py-3">ID</th>
                                                    <th className="px-6 py-3">Started</th>
                                                    <th className="px-6 py-3 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {instances.map((inst) => (
                                                    <tr key={inst.id} className="hover:bg-red-50/30 transition-colors">
                                                        <td className="px-6 py-4 font-medium text-gray-800">{inst.processDefinitionName}</td>
                                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">{inst.id}</td>
                                                        <td className="px-6 py-4 text-gray-600 text-xs">{new Date(inst.startTime).toLocaleString()}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm('Are you sure you want to STOP this instance?')) {
                                                                        fetch(`http://localhost:8081/api/runtime/instances/${inst.id}`, { method: 'DELETE' })
                                                                            .then(() => fetchData());
                                                                    }
                                                                }}
                                                                className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 hover:bg-red-100 px-3 py-1.5 rounded-sm text-xs font-bold uppercase transition-colors"
                                                            >
                                                                <Ban size={14} /> Stop
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            )}


                            {/* PLACEHOLDERS */}
                            {(adminSubTab === 'users' || adminSubTab === 'groups' || adminSubTab === 'settings') && (
                                <div className="bg-white rounded-sm shadow-md border border-gray-200 p-12 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                        <SlidersHorizontal size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-700 mb-2">Coming Soon</h3>
                                    <p className="text-sm text-gray-500 max-w-sm mx-auto">
                                        {adminSubTab === 'users' && "Advanced user management, roles, and permissions."}
                                        {adminSubTab === 'groups' && "Group hierarchies and membership rules."}
                                        {adminSubTab === 'settings' && "System-wide configuration, mail settings, and integration keys."}
                                    </p>
                                </div>
                            )}

                        </div>
                    </div>
                )}

                {/* Help Content */}
                {activeTab === 'help' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 grid grid-cols-12 gap-8">
                        <div className="col-span-12 md:col-span-3">
                            <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-4 sticky top-4">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <BookOpen size={18} className="text-teal-600" />
                                    Documentation
                                </h3>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li className="font-medium text-teal-700">Form Fields Guide</li>
                                    <li>Workflow Designer</li>
                                    <li>Process Monitoring</li>
                                    <li>Admin Tools</li>
                                </ul>
                            </div>
                        </div>

                        <div className="col-span-12 md:col-span-9 space-y-8">
                            <section className="bg-white rounded-sm shadow-md border border-teal-200 overflow-hidden">
                                <div className="bg-teal-50 px-6 py-4 border-b border-teal-100">
                                    <h2 className="text-lg font-bold text-teal-800">Form Fields Reference</h2>
                                    <p className="text-xs text-teal-600 mt-1">Understanding the different input types available in the Form Designer.</p>
                                </div>
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded bg-cyan-100 text-cyan-600 flex items-center justify-center flex-shrink-0">
                                            <ToggleRight size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 text-sm">Switch (Toggle)</h4>
                                            <p className="text-xs text-gray-500 mt-1 mb-2">
                                                A binary control that allows users to switch between two mutually exclusive states, typically <strong>On/Off</strong> or <strong>Yes/No</strong>.
                                            </p>
                                            <div className="bg-gray-50 p-3 rounded border border-gray-100">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-4 bg-cyan-500 rounded-full relative">
                                                        <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 right-0.5" />
                                                    </div>
                                                    <span className="text-xs font-bold text-cyan-700">Approved</span>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-2 italic">Best for: Quick approvals, enable/disable features.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                                            <MousePointerClick size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 text-sm">Radio Buttons</h4>
                                            <p className="text-xs text-gray-500 mt-1 mb-2">
                                                Allows users to select exactly <strong>one</strong> option from a visible list. Good when you want all options exposed.
                                            </p>
                                            <div className="bg-gray-50 p-3 rounded border border-gray-100 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full border-2 border-purple-500 flex items-center justify-center">
                                                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                                                    </div>
                                                    <span className="text-xs text-gray-700">Option A</span>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-50">
                                                    <div className="w-3 h-3 rounded-full border-2 border-gray-400" />
                                                    <span className="text-xs text-gray-700">Option B</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded bg-yellow-100 text-yellow-600 flex items-center justify-center flex-shrink-0">
                                            <List size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 text-sm">Select Dictionary</h4>
                                            <p className="text-xs text-gray-500 mt-1 mb-2">
                                                A dropdown menu for selecting one option from a large list. Saves space compared to Radio buttons.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0">
                                            <CheckSquare size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 text-sm">Checkbox</h4>
                                            <p className="text-xs text-gray-500 mt-1 mb-2">
                                                Used for selecting multiple options from a list, or a single "I agree" confirmation.
                                            </p>
                                        </div>
                                    </div>

                                </div>
                            </section>

                            <section className="bg-white rounded-sm shadow-md border border-gray-200 overflow-hidden">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                    <h2 className="text-lg font-bold text-gray-700">Workflow Concepts</h2>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800 mb-1">User Tasks vs Service Tasks</h4>
                                        <p className="text-xs text-gray-600 leading-relaxed">
                                            <strong>User Tasks</strong> require human interaction (filling a form, approving).
                                            <strong>Service Tasks</strong> are automated system steps that call external APIs (HTTP GET/POST) without human intervention.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800 mb-1">Context Variables</h4>
                                        <p className="text-xs text-gray-600 leading-relaxed">
                                            Data passed between steps. For example, if Step 1 is an Expense Form, Step 2 (Approval) can "see" the <code>amount</code> and <code>reason</code> variables to display them.
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                )}

            </main>

            <StartProcessModal
                isOpen={isStartModalOpen}
                onClose={() => setIsStartModalOpen(false)}
                definition={selectedDefinition}
                onSuccess={fetchData}
            />

            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                task={selectedTask}
                onSuccess={fetchData}
            />

            <InstanceDetailsModal
                isOpen={isInstanceDetailsOpen}
                onClose={() => setIsInstanceDetailsOpen(false)}
                instance={selectedInstance}
            />
        </div>
    );
}

// ... StartProcessModal is below ... (skip its replacement in this tool call, assume it's there)
// I will append TaskModal function at the VERY END.
// Wait, using replace_file_content requires a contiguous block.
// I will just add the TaskModal definition at the end of the file.
// But first I need to update the JSX to include <TaskModal />. That's what I am doing here.
// I'll do two calls: one to update JSX, one to append Generic Modal.

// Actually I can do it in one go if I include StartProcessModal definition or if I replace the end of DashboardPage component.
// The target content handles the end of DashboardPage and the start of StartProcessModal? No, StartProcessModal is defined after.
// Let's just update the JSX first.

function StartProcessModal({ isOpen, onClose, definition, onSuccess }: { isOpen: boolean; onClose: () => void; definition: any; onSuccess: () => void }) {
    const [variables, setVariables] = useState('{\n  "rawText": "Hello SnapFlow"\n}');
    const [formDefinition, setFormDefinition] = useState<any>(null);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [isLoadingForm, setIsLoadingForm] = useState(false);
    const [status, setStatus] = useState<'idle' | 'starting' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);

    useEffect(() => {
        if (isOpen && definition?.startFormKey) {
            setIsLoadingForm(true);
            fetch(`http://localhost:8081/api/forms/${definition.startFormKey}`)
                .then(res => res.json())
                .then(data => {
                    setFormDefinition(data);
                    // Initialize default values
                    const initialData: any = {};
                    data.schema.forEach((field: any) => {
                        initialData[field.key] = '';
                    });
                    setFormData(initialData);
                })
                .catch(err => console.error("Failed to load form", err))
                .finally(() => setIsLoadingForm(false));
        } else {
            setFormDefinition(null);
        }
    }, [isOpen, definition]);

    if (!isOpen || !definition) return null;

    const handleStart = async () => {
        setStatus('starting');
        setMessage('');
        try {
            let finalVariables = {};

            if (formDefinition) {
                finalVariables = formData;
            } else {
                try {
                    finalVariables = JSON.parse(variables);
                } catch (e) {
                    setStatus('error');
                    setMessage("Invalid JSON format");
                    return;
                }
            }

            const res = await fetch('http://localhost:8081/api/runtime/instances', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    processDefinitionKey: definition.key,
                    variables: finalVariables
                })
            });

            if (res.ok) {
                const data = await res.json();
                setStatus('success');
                setMessage(`Started! ID: ${data.id}`);
                setTimeout(() => {
                    onSuccess();
                    onClose();
                    setStatus('idle');
                    setMessage('');
                    setFormData({});
                }, 1500);
            } else {
                const txt = await res.text();
                setStatus('error');
                setMessage('Failed: ' + txt);
            }
        } catch (e: any) {
            console.error(e);
            setStatus('error');
            setMessage('Network Error: ' + e.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-md shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 border-t-4 border-[#D41C2C]">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-[#D41C2C] mb-1 font-serif">Start Process</h2>
                    <p className="text-sm text-gray-600 mb-6">Initialize <span className="font-bold text-gray-800">{definition.name}</span>.</p>

                    <div className="space-y-4">
                        {isLoadingForm ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="animate-spin text-[#D41C2C]" size={24} />
                            </div>
                        ) : formDefinition ? (
                            <div className="space-y-4">
                                <div className="bg-blue-50 border border-blue-100 p-3 rounded-sm text-xs text-blue-800 font-bold mb-4">
                                    Using Form: {formDefinition.name}
                                </div>
                                {formDefinition.schema.filter((field: any) => field.showOnStart).map((field: any) => (
                                    <div key={field.id}>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1 tracking-wide">{field.label}</label>

                                        {field.type === 'textarea' ? (
                                            <textarea
                                                className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#D41C2C] focus:ring-1 focus:ring-[#D41C2C] resize-none"
                                                rows={3}
                                                value={formData[field.key] || ''}
                                                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                                required={field.validation?.required}
                                            />
                                        ) : field.type === 'select' ? (
                                            <select
                                                className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#D41C2C] focus:ring-1 focus:ring-[#D41C2C] bg-white"
                                                value={formData[field.key] || ''}
                                                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                                required={field.validation?.required}
                                            >
                                                <option value="">Select...</option>
                                                {field.data?.options?.map((opt: string) => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        ) : field.type === 'radio' ? (
                                            <div className="space-y-1">
                                                {field.data?.options?.map((opt: string) => (
                                                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name={field.key}
                                                            value={opt}
                                                            checked={formData[field.key] === opt}
                                                            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                                            className="text-[#D41C2C] focus:ring-[#D41C2C]"
                                                        />
                                                        <span className="text-sm text-gray-700">{opt}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        ) : field.type === 'toggle' ? (
                                            <div className="flex items-center gap-2 mt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, [field.key]: !formData[field.key] })}
                                                    className={`w-10 h-5 rounded-full relative transition-colors ${formData[field.key] ? 'bg-[#D41C2C]' : 'bg-gray-300'}`}
                                                >
                                                    <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-transform ${formData[field.key] ? 'left-6' : 'left-1'}`} />
                                                </button>
                                                <span className="text-sm text-gray-600">{formData[field.key] ? 'Yes' : 'No'}</span>
                                            </div>
                                        ) : (
                                            <input
                                                type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#D41C2C] focus:ring-1 focus:ring-[#D41C2C]"
                                                value={formData[field.key] || ''}
                                                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                                required={field.validation?.required}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div>
                                <div className="bg-gray-50 border border-gray-200 rounded-sm p-4 text-center mb-4">
                                    <h4 className="text-sm font-bold text-gray-700 mb-1">Ready to Start</h4>
                                    <p className="text-xs text-gray-500">This workflow does not require any initial data.</p>
                                </div>

                                <button
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    className="text-[10px] font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 flex items-center gap-1 mb-2"
                                >
                                    <SlidersHorizontal size={12} />
                                    {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
                                </button>

                                {showAdvanced && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1 tracking-wide">Initial Variables (JSON)</label>
                                        <textarea
                                            value={variables}
                                            onChange={(e) => setVariables(e.target.value)}
                                            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-sm text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#D41C2C] focus:border-[#D41C2C] bg-gray-50"
                                            placeholder='{ "key": "value" }'
                                        />
                                        <p className="text-[10px] text-gray-500 mt-1">
                                            Optional: Provide raw JSON variables to initialize the process instance.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Status Message Area */}
                        {status === 'error' && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm text-xs font-bold">
                                {message}
                            </div>
                        )}
                        {status === 'success' && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-sm text-xs font-bold flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                {message}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-sm transition-colors uppercase tracking-wide"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleStart}
                            disabled={status === 'starting' || status === 'success'}
                            className="bg-[#D41C2C] hover:bg-[#B81926] text-white px-6 py-2 rounded-sm text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 uppercase tracking-wide"
                        >
                            {status === 'starting' && <Loader2 size={16} className="animate-spin" />}
                            {status === 'success' ? 'Launched' : 'Confirm Start'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TaskModal({ isOpen, onClose, task, onSuccess }: { isOpen: boolean; onClose: () => void; task: any; onSuccess: () => void }) {
    const [formDefinition, setFormDefinition] = useState<any>(null);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [taskVariables, setTaskVariables] = useState<Record<string, any>>({});
    const [isReviewMode, setIsReviewMode] = useState(false);
    const [isLoadingTask, setIsLoadingTask] = useState(false);
    const [status, setStatus] = useState<'idle' | 'starting' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (isOpen && task) {
            setIsLoadingTask(true);
            fetch(`http://localhost:8081/api/runtime/tasks/${task.id}/form-data`)
                .then(res => res.json())
                .then(data => {
                    const form = data.form;
                    const vars = data.variables || {};
                    const reviewStep = data.isReviewStep || false;

                    setFormDefinition(form);
                    setTaskVariables(vars); // Store variables for display
                    setIsReviewMode(reviewStep);

                    if (form) {
                        const initialData: any = {};
                        form.schema.forEach((field: any) => {
                            // Pre-fill if exists in variables
                            initialData[field.key] = vars[field.key] || '';
                        });
                        setFormData(initialData);
                    }
                })
                .catch(err => console.error("Failed to load task data", err))
                .finally(() => setIsLoadingTask(false));
        }
    }, [isOpen, task]);

    if (!isOpen || !task) return null;

    const handleComplete = async () => {
        setStatus('starting');
        try {
            const res = await fetch(`http://localhost:8081/api/runtime/tasks/${task.id}/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setStatus('success');
                setMessage('Task Completed!');
                setTimeout(() => {
                    onSuccess();
                    onClose();
                    setStatus('idle');
                    setFormData({});
                }, 1000);
            } else {
                const txt = await res.text();
                setStatus('error');
                setMessage('Failed: ' + txt);
            }
        } catch (e: any) {
            setStatus('error');
            setMessage('Error: ' + e.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-md shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 border-t-4 border-blue-600">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-blue-600 mb-1 font-serif">Task Details</h2>
                    <p className="text-sm text-gray-600 mb-6">Work on <span className="font-bold text-gray-800">{task.name}</span>.</p>

                    <div className="space-y-4">
                        {isLoadingTask ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="animate-spin text-blue-600" size={24} />
                            </div>
                        ) : formDefinition ? (
                            <div className="space-y-4">
                                {isReviewMode && (
                                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-sm text-xs text-amber-800 font-bold mb-4 flex items-center gap-2">
                                        Review Mode: Read-Only Data
                                    </div>
                                )}
                                {formDefinition.schema.map((field: any) => (
                                    <div key={field.id}>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1 tracking-wide">{field.label}</label>

                                        {field.type === 'textarea' ? (
                                            <textarea
                                                className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-none disabled:bg-gray-100 disabled:text-gray-500"
                                                rows={3}
                                                value={formData[field.key] || ''}
                                                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                                required={field.validation?.required}
                                                disabled={isReviewMode}
                                            />
                                        ) : field.type === 'select' ? (
                                            <select
                                                className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white disabled:bg-gray-100 disabled:text-gray-500"
                                                value={formData[field.key] || ''}
                                                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                                required={field.validation?.required}
                                                disabled={isReviewMode}
                                            >
                                                <option value="">Select...</option>
                                                {field.data?.options?.map((opt: string) => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        ) : field.type === 'radio' ? (
                                            <div className="space-y-1">
                                                {field.data?.options?.map((opt: string) => (
                                                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name={field.key}
                                                            value={opt}
                                                            checked={formData[field.key] === opt}
                                                            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                                            className="text-blue-600 focus:ring-blue-600 disabled:text-gray-400"
                                                            disabled={isReviewMode}
                                                        />
                                                        <span className="text-sm text-gray-700">{opt}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        ) : field.type === 'toggle' ? (
                                            <div className="flex items-center gap-2 mt-1">
                                                <button
                                                    type="button"
                                                    disabled={isReviewMode}
                                                    onClick={() => setFormData({ ...formData, [field.key]: !formData[field.key] })}
                                                    className={`w-10 h-5 rounded-full relative transition-colors ${formData[field.key] ? 'bg-blue-600' : 'bg-gray-300'} disabled:opacity-50`}
                                                >
                                                    <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-transform ${formData[field.key] ? 'left-6' : 'left-1'}`} />
                                                </button>
                                                <span className="text-sm text-gray-600">{formData[field.key] ? 'Yes' : 'No'}</span>
                                            </div>
                                        ) : (
                                            <input
                                                type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 disabled:bg-gray-100 disabled:text-gray-500"
                                                value={formData[field.key] || ''}
                                                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                                required={field.validation?.required}
                                                disabled={isReviewMode}
                                            />
                                        )}
                                    </div>
                                ))}
                                {isReviewMode && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1 tracking-wide">Reviewer Feedback</label>
                                        <textarea
                                            className="w-full h-24 px-3 py-2 border border-blue-600/30 rounded-sm text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                            placeholder="Enter your feedback or approval notes..."
                                            onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                <div className="bg-gray-50 border border-gray-200 rounded-sm p-3 mb-4">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Process Context</h4>
                                    {Object.keys(taskVariables).length > 0 ? (
                                        <div className="space-y-1">
                                            {Object.entries(taskVariables).map(([key, value]) => (
                                                <div key={key} className="flex justify-between text-sm">
                                                    <span className="font-medium text-gray-700">{key}:</span>
                                                    <span className="text-gray-600 font-mono">{String(value)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-xs text-gray-400 italic">No variables found for this process.</div>
                                    )}
                                </div>

                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1 tracking-wide">Output Variables (JSON)</label>
                                <textarea
                                    className="w-full h-32 px-4 py-3 border border-gray-300 rounded-sm text-sm font-mono focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-gray-50"
                                    placeholder='{ "approved": true }'
                                    onChange={(e) => {
                                        try {
                                            const json = JSON.parse(e.target.value);
                                            setFormData(json);
                                            setMessage('');
                                        } catch (err) {
                                            // invalid json, ignore for now
                                        }
                                    }}
                                />
                                <p className="text-[10px] text-gray-500 mt-1">
                                    Enter variables to submit with completion.
                                </p>
                            </div>
                        )}

                        {/* Status Messages */}
                        {status === 'error' && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm text-xs font-bold">{message}</div>}
                        {status === 'success' && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-sm text-xs font-bold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" />{message}</div>}
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-sm transition-colors uppercase tracking-wide">Cancel</button>
                        <button onClick={handleComplete} disabled={status === 'starting' || status === 'success'} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-sm text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 uppercase tracking-wide">
                            {status === 'starting' && <Loader2 size={16} className="animate-spin" />}
                            {status === 'success' ? 'Completed' : 'Complete Task'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InstanceDetailsModal({ isOpen, onClose, instance }: { isOpen: boolean; onClose: () => void; instance: any }) {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [comment, setComment] = useState('');
    const [sending, setSending] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && instance) {
            setLoading(true);
            fetch(`http://localhost:8081/api/runtime/tasks?processInstanceId=${instance.id}`)
                .then(res => res.json())
                .then(data => setTasks(data))
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [isOpen, instance]);

    const handleSendComment = async (taskId: string) => {
        if (!comment.trim()) return;
        setSending(taskId);
        try {
            await fetch(`http://localhost:8081/api/runtime/tasks/${taskId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: comment, saveProcessInstanceId: true })
            });
            setComment('');
            alert('Comment sent to assignee!');
        } catch (e) {
            console.error(e);
            alert('Failed to send comment');
        } finally {
            setSending(null);
        }
    };

    if (!isOpen || !instance) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-md shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 border-t-4 border-[#FCCF0A]">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-1 font-serif">Instance Details</h2>
                            <p className="text-sm text-gray-600">Tracking: <span className="font-bold text-[#D41C2C]">{instance.processDefinitionName}</span></p>
                            <p className="text-[10px] font-mono text-gray-400 mt-0.5">{instance.id}</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><Ban size={20} /></button>
                    </div>

                    <div className="space-y-6">
                        <section>
                            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                                <Activity size={14} className="text-[#FCCF0A]" /> Active Tasks
                            </h3>

                            {loading ? (
                                <div className="p-8 text-center text-gray-400"><Loader2 className="animate-spin mx-auto mb-2" /> Loading tasks...</div>
                            ) : tasks.length === 0 ? (
                                <div className="p-4 bg-gray-50 border border-gray-100 rounded-sm text-center text-sm text-gray-500">No active tasks found. Process might be finishing up.</div>
                            ) : (
                                <div className="space-y-4">
                                    {tasks.map(task => (
                                        <div key={task.id} className="bg-white border border-gray-200 rounded-sm p-4 shadow-sm hover:border-gray-300 transition-colors">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <div className="font-bold text-gray-800">{task.name}</div>
                                                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-mono">ID: {task.id}</span>
                                                        <span className="text-gray-400">|</span>
                                                        <span>Assignee: <span className="font-bold text-gray-700">{task.assignee || 'Unassigned'}</span></span>
                                                    </div>
                                                </div>
                                                <div className="text-[10px] text-gray-400 font-mono">{new Date(task.createTime).toLocaleString()}</div>
                                            </div>

                                            {/* Comment Area */}
                                            <div className="mt-4 pt-3 border-t border-gray-100">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block flex items-center gap-1">
                                                    <MessageCircle size={10} /> Message to User
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={comment}
                                                        onChange={(e) => setComment(e.target.value)}
                                                        placeholder={`Send a message to ${task.assignee || 'the user'}...`}
                                                        className="flex-grow px-3 py-1.5 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                    />
                                                    <button
                                                        onClick={() => handleSendComment(task.id)}
                                                        disabled={sending === task.id || !comment.trim()}
                                                        className="bg-blue-600 text-white px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wide hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                                                    >
                                                        {sending === task.id ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                                                        Send
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
