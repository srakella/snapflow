"use client";

import React, { useEffect, useState } from 'react';
import { Play, Activity, Package, Loader2, ClipboardList, Trash2, Ban, Home, PenTool } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const [deployments, setDeployments] = useState<any[]>([]);
    const [instances, setInstances] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isStartModalOpen, setIsStartModalOpen] = useState(false);
    const [selectedDefinition, setSelectedDefinition] = useState<any>(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'deployments' | 'instances' | 'tasks' | 'admin'>('deployments');

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [defsRes, instsRes, tasksRes] = await Promise.all([
                fetch('http://localhost:8081/api/runtime/definitions'),
                fetch('http://localhost:8081/api/runtime/instances'),
                fetch('http://localhost:8081/api/runtime/tasks')
            ]);

            const defs = await defsRes.json();
            const insts = await instsRes.json();
            const tasksData = await tasksRes.json();

            setDeployments(defs);
            setInstances(insts);
            setTasks(tasksData);
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
                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        className={`px-6 py-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors ${activeTab === 'deployments'
                            ? 'border-[#D41C2C] text-[#D41C2C]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => setActiveTab('deployments')}
                    >
                        Deployed Workflows
                    </button>
                    <button
                        className={`px-6 py-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors ${activeTab === 'instances'
                            ? 'border-[#FCCF0A] text-gray-800'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => setActiveTab('instances')}
                    >
                        Active Instances
                    </button>

                    <button
                        className={`px-6 py-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors ${activeTab === 'admin'
                            ? 'border-red-600 text-red-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => setActiveTab('admin')}
                    >
                        Admin
                    </button>
                </div>

                {/* Deployed Workflows Content */}
                {activeTab === 'deployments' && (
                    <section className="bg-white rounded-sm shadow-md border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                                <Package size={20} className="text-[#D41C2C]" />
                                Deployed Workflows
                            </h2>
                            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">{deployments.length}</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100 text-gray-500 font-bold uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-3">Name</th>
                                        <th className="px-6 py-3">Key</th>
                                        <th className="px-6 py-3">Version</th>
                                        <th className="px-6 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {isLoading && deployments.length === 0 ? (
                                        <tr><td colSpan={4} className="p-4 text-center text-gray-400">Loading definitions...</td></tr>
                                    ) : deployments.map((def) => (
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

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100 text-gray-500 font-bold uppercase text-xs">
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
                                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-sm border border-green-100">
                                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                    In-Progress
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}



                {activeTab === 'admin' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Admin: Definitions Management */}
                        <section className="bg-white rounded-sm shadow-md border border-red-200 overflow-hidden">
                            <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-red-800 flex items-center gap-2">
                                    <Package size={20} className="text-red-600" />
                                    Manage Definitions
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-white text-gray-500 font-bold uppercase text-xs border-b border-gray-100">
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

                        {/* Admin: Instance Management */}
                        <section className="bg-white rounded-sm shadow-md border border-red-200 overflow-hidden">
                            <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-red-800 flex items-center gap-2">
                                    <Activity size={20} className="text-red-600" />
                                    Manage Instances
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-white text-gray-500 font-bold uppercase text-xs border-b border-gray-100">
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
                                {formDefinition.schema.map((field: any) => (
                                    <div key={field.id}>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1 tracking-wide">{field.label}</label>
                                        <input
                                            type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#D41C2C] focus:ring-1 focus:ring-[#D41C2C]"
                                            value={formData[field.key] || ''}
                                            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                            required={field.required}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1 tracking-wide">Input Variables (JSON)</label>
                                <textarea
                                    value={variables}
                                    onChange={(e) => setVariables(e.target.value)}
                                    className="w-full h-32 px-4 py-3 border border-gray-300 rounded-sm text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#D41C2C] focus:border-[#D41C2C] bg-gray-50"
                                />
                                <p className="text-[10px] text-gray-500 mt-1">
                                    No form attached. Provided raw JSON variables.
                                </p>
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
                    <h2 className="text-xl font-bold text-blue-600 mb-1 font-serif">Complete Task</h2>
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
                                        <input
                                            type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 disabled:bg-gray-100 disabled:text-gray-500"
                                            value={formData[field.key] || ''}
                                            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                            required={field.required}
                                            disabled={isReviewMode}
                                        />
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
                            <div className="text-center text-gray-500 italic py-8">
                                No form attached to this task. Just complete it.
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
