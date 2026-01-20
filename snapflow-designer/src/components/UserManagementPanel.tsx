'use client';

import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Power, RefreshCw, CheckCircle, XCircle, Search } from 'lucide-react';

interface User {
    id: string;
    username: string;
    fullName: string;
    email: string;
    active: boolean;
}

const SEED_USERS = [
    { username: 'jdoe', fullName: 'John Doe', email: 'john@example.com' },
    { username: 'admin', fullName: 'Administrator', email: 'admin@snapflow.com' },
    { username: 'alice', fullName: 'Alice HR', email: 'alice@hr.com' },
    { username: 'bob', fullName: 'Bob Manager', email: 'bob@approvers.com' },
    { username: 'charlie', fullName: 'Charlie Dev', email: 'charlie@tech.com' }
];

export function UserManagementPanel() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Add User Form State
    const [newUser, setNewUser] = useState({ username: '', fullName: '', email: '' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8081/api/identity/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSeedUsers = async () => {
        if (!confirm('This will attempt to create 5 default users. Continue?')) return;
        setLoading(true);
        try {
            for (const u of SEED_USERS) {
                await fetch('http://localhost:8081/api/identity/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...u, active: true, avatarUrl: '' })
                });
            }
            fetchUsers();
            alert('Seed complete!');
        } catch (e) {
            console.error(e);
            alert('Error seeding users');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this user?')) return;
        try {
            await fetch(`http://localhost:8081/api/identity/users/${id}`, { method: 'DELETE' });
            setUsers(users.filter(u => u.id !== id));
        } catch (e) {
            console.error(e);
        }
    };

    const toggleStatus = async (user: User) => {
        try {
            const newState = !user.active;
            const res = await fetch(`http://localhost:8081/api/identity/users/${user.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newState)
            });
            if (res.ok) {
                setUsers(users.map(u => u.id === user.id ? { ...u, active: newState } : u));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddUser = async () => {
        if (!newUser.username || !newUser.fullName) return;
        try {
            const res = await fetch('http://localhost:8081/api/identity/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newUser, active: true, avatarUrl: '' })
            });
            if (res.ok) {
                fetchUsers();
                setIsAddModalOpen(false);
                setNewUser({ username: '', fullName: '', email: '' });
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Filter
    const filteredUsers = users.filter(u =>
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <section className="bg-white rounded-sm shadow-md border border-red-200 overflow-hidden">
            {/* Header matching Dashboard style */}
            <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold text-red-800 flex items-center gap-2">
                        <Users size={20} className="text-red-600" />
                        User Management
                    </h2>
                    <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full">{users.length}</span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group w-full max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#D41C2C] transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#D41C2C] focus:border-[#D41C2C] transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleSeedUsers}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors shadow-sm"
                        title="Reset/Seed Defaults"
                    >
                        <RefreshCw size={14} /> Seed
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white bg-[#D41C2C] rounded-sm hover:bg-[#B81926] shadow-sm transform transition hover:-translate-y-0.5"
                    >
                        <UserPlus size={14} /> Add User
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-white text-gray-500 font-bold uppercase text-xs border-b border-gray-100 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">Loading users...</td>
                            </tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">No users found.</td>
                            </tr>
                        ) : (
                            filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-red-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold border border-slate-300 text-xs">
                                                {user.fullName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-800">{user.fullName}</div>
                                                <div className="text-[10px] text-gray-500 font-mono">@{user.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-600">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.active ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 uppercase tracking-wide">
                                                <CheckCircle size={10} className="mr-1" /> Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200 uppercase tracking-wide">
                                                <XCircle size={10} className="mr-1" /> Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => toggleStatus(user)}
                                                className={`p-1.5 rounded-sm transition-colors ${user.active ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}
                                                title={user.active ? "Deactivate" : "Activate"}
                                            >
                                                <Power size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add User Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95">
                        <h2 className="text-xl font-bold mb-4">Add New User</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input
                                    className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-[#D41C2C] focus:border-[#D41C2C] outline-none"
                                    value={newUser.username}
                                    onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-[#D41C2C] focus:border-[#D41C2C] outline-none"
                                    value={newUser.fullName}
                                    onChange={e => setNewUser({ ...newUser, fullName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-[#D41C2C] focus:border-[#D41C2C] outline-none"
                                    value={newUser.email}
                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-sm font-bold text-sm">Cancel</button>
                            <button onClick={handleAddUser} className="px-4 py-2 bg-[#D41C2C] text-white rounded-sm font-bold text-sm hover:bg-[#B81926]">Create User</button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
