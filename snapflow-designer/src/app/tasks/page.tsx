'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, User, Shield, Briefcase, Filter, Search, ArrowRight, Activity } from 'lucide-react';

// Mock Identity Context
const MOCK_USERS = [
    { id: 'jdoe', name: 'John Doe', groups: ['users'] },
    { id: 'admin', name: 'Admin User', groups: ['admins', 'users', 'managers'] },
    { id: 'alice', name: 'Alice HR', groups: ['hr', 'users'] },
    { id: 'bob', name: 'Bob Approver', groups: ['approvers', 'users'] }
];

interface Task {
    id: string;
    name: string;
    description?: string;
    assignee?: string; // specific user
    candidateGroups?: string[]; // groups that can claim
    created: string;
    due?: string;
    priority: number;
    processInstanceId?: string;
}

export default function TaskInboxPage() {
    // Current User Context (Simulation of SSO)
    const [currentUser, setCurrentUser] = useState(MOCK_USERS[0]);

    // Task State
    const [tasks, setTasks] = useState<Task[]>([]);
    const [activeTab, setActiveTab] = useState<'my-tasks' | 'group-tasks'>('my-tasks');
    const [loading, setLoading] = useState(false);

    // Initial Mock Data Load
    useEffect(() => {
        // In real app, fetch from API. Here we mock some tasks.
        const mockTasks: Task[] = [
            {
                id: 't1',
                name: 'Approve Leave Request #1023',
                description: 'Annual leave request for Sarah Smith (5 days)',
                candidateGroups: ['managers', 'approvers'],
                created: '2023-10-25T10:00:00Z',
                priority: 50
            },
            {
                id: 't2',
                name: 'Review Expense Report #5501',
                description: 'Q3 Travel Expenses - $1,200',
                assignee: 'jdoe',
                created: '2023-10-26T09:30:00Z',
                priority: 75
            },
            {
                id: 't3',
                name: 'Onboard New Hire: Mike Ross',
                description: 'Setup email and laptop',
                candidateGroups: ['admins'],
                created: '2023-10-27T14:00:00Z',
                priority: 30
            }
        ];
        setTasks(mockTasks);
    }, []);

    // Filter Logic
    const myTasks = tasks.filter(t => t.assignee === currentUser.id);
    const groupTasks = tasks.filter(t =>
        !t.assignee && // Not assigned yet
        t.candidateGroups?.some(chatGroup => currentUser.groups.includes(chatGroup))
    );

    const handleClaim = (taskId: string) => {
        setTasks(tasks.map(t =>
            t.id === taskId ? { ...t, assignee: currentUser.id } : t
        ));
        // TODO: Call API to claim task
    };

    const handleComplete = (taskId: string) => {
        // TODO: Call API to complete task
        setTasks(tasks.filter(t => t.id !== taskId));
        alert('Task Completed! (Mock)');
    };

    const handleUnclaim = (taskId: string) => {
        setTasks(tasks.map(t =>
            t.id === taskId ? { ...t, assignee: undefined } : t
        ));
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Context Header (Mock SSO) */}
            <div className="bg-slate-900 text-white px-6 py-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                    <Shield size={12} className="text-green-400" />
                    <span className="font-mono text-slate-400">SSO Context:</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-slate-400">Simulate User:</span>
                    <select
                        className="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-white outline-none"
                        value={currentUser.id}
                        onChange={(e) => setCurrentUser(MOCK_USERS.find(u => u.id === e.target.value) || currentUser)}
                    >
                        {MOCK_USERS.map(u => (
                            <option key={u.id} value={u.id}>{u.name} ({u.groups.length} groups)</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Main Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-6 py-8">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Briefcase className="text-[#D41C2C]" /> Task Inbox
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>You are logged in as <strong>{currentUser.name}</strong></span>
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">{currentUser.groups.join(', ')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Actions */}
            <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 space-y-6">

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('my-tasks')}
                        className={`px-6 py-3 text-sm font-bold uppercase border-b-2 transition-all flex items-center gap-2 ${activeTab === 'my-tasks' ? 'border-[#D41C2C] text-[#D41C2C]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <User size={16} /> My Assignments
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{myTasks.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('group-tasks')}
                        className={`px-6 py-3 text-sm font-bold uppercase border-b-2 transition-all flex items-center gap-2 ${activeTab === 'group-tasks' ? 'border-[#D41C2C] text-[#D41C2C]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <Shield size={16} /> Group Tasks
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{groupTasks.length}</span>
                    </button>
                </div>

                {/* List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[400px]">
                    {activeTab === 'my-tasks' ? (
                        activeTab === 'my-tasks' && myTasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <CheckCircle size={48} className="mb-4 text-gray-200" />
                                <p>No tasks assigned to you right now.</p>
                                <p className="text-xs">Check "Group Tasks" to claim work.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {myTasks.map(task => (
                                    <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800 mb-1">{task.name}</h3>
                                            <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                                            <div className="flex items-center gap-4 text-xs text-gray-400">
                                                <span className="flex items-center gap-1"><Clock size={12} /> Created: {new Date(task.created).toLocaleDateString()}</span>
                                                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded">Priority: {task.priority}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => handleComplete(task.id)}
                                                className="bg-[#D41C2C] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#B81926] shadow-sm flex items-center gap-2"
                                            >
                                                Complete Task <ArrowRight size={16} />
                                            </button>
                                            {/* Optional: Return to pool */}
                                            <button
                                                onClick={() => handleUnclaim(task.id)}
                                                className="text-xs text-gray-400 hover:text-gray-600 underline"
                                            >
                                                Return to Group
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : (
                        // Group Tasks View
                        activeTab === 'group-tasks' && groupTasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <Shield size={48} className="mb-4 text-gray-200" />
                                <p>No group tasks available for your teams.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {groupTasks.map(task => (
                                    <div key={task.id} className="p-6 hover:bg-indigo-50/30 transition-colors flex items-center justify-between group border-l-4 border-l-indigo-200">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-bold text-gray-800">{task.name}</h3>
                                                {task.candidateGroups?.map(g => (
                                                    <span key={g} className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-bold uppercase tracking-wider">{g}</span>
                                                ))}
                                            </div>
                                            <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                                            <div className="flex items-center gap-4 text-xs text-gray-400">
                                                <span className="flex items-center gap-1"><Clock size={12} /> Created: {new Date(task.created).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleClaim(task.id)}
                                            className="bg-white border-2 border-indigo-100 text-indigo-600 px-4 py-2 rounded-lg font-bold text-sm hover:border-indigo-500 hover:text-indigo-700 transition-all flex items-center gap-2"
                                        >
                                            <Shield size={14} /> Claim Task
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
