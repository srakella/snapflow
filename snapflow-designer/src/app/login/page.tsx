"use client";

import React, { useEffect, useState } from 'react';
import { Shield, ChevronRight } from 'lucide-react';
import { useAuth, User } from '@/components/AuthContext';

export default function LoginPage() {
    const { login } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch users from backend
        fetch('http://localhost:8081/api/identity/users')
            .then(res => res.json())
            .then(data => {
                setUsers(data);
                setIsLoading(false);
                // Default to first user if available
                if (data.length > 0) setSelectedUserId(data[0].id);
            })
            .catch(err => {
                console.error("Failed to fetch users", err);
                setIsLoading(false);
            });
    }, []);

    const handleLogin = () => {
        const user = users.find(u => u.id === selectedUserId);
        if (user) {
            login(user);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-300">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6">
                        <img src="/snapflowlogo.png" alt="SnapFlow" className="h-16 w-auto" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Welcome to SnapFlow</h1>
                    <p className="text-slate-500 mt-2">Select a persona to simulate login</p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select User</label>
                        {isLoading ? (
                            <div className="h-10 bg-slate-100 animate-pulse rounded-lg"></div>
                        ) : (
                            <div className="relative">
                                <select
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                    className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-[#D41C2C] focus:border-[#D41C2C] block p-3 pr-10 font-bold"
                                >
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.fullName} ({user.groups.map(g => g.name).join(', ')})
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                                    <ChevronRight size={16} className="rotate-90" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Capabilities</h3>
                        <div className="space-y-2">
                            {users.find(u => u.id === selectedUserId)?.groups.map(g => (
                                <div key={g.id} className="flex items-center gap-2 text-sm text-slate-600">
                                    <Shield size={14} className="text-[#D41C2C]" />
                                    <span>{g.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleLogin}
                        className="w-full flex items-center justify-center gap-2 bg-[#D41C2C] text-white py-3 rounded-xl font-bold hover:bg-[#B81926] transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        Sign In <ChevronRight size={18} />
                    </button>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-400">SnapFlow Enterprise v2.0</p>
                </div>
            </div>
        </div>
    );
}
