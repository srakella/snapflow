import React, { useState, useEffect } from 'react';

interface User {
    id: string;
    name: string;
    username: string;
}

interface UserLookupProps {
    value: string;
    onChange: (userId: string) => void;
    placeholder?: string;
}

export function UserLookup({ value, onChange, placeholder = 'Search users...' }: UserLookupProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('http://localhost:8081/api/identity/users');
                if (res.ok) {
                    const rawUsers = await res.json();
                    setUsers(rawUsers
                        .filter((u: any) => u.active !== false)
                        .map((u: any) => ({
                            id: u.username,
                            name: u.fullName,
                            username: u.username
                        })));
                }
            } catch (e) { console.error(e); }
        };
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(
        (u) =>
            u.name.toLowerCase().includes(value.toLowerCase()) ||
            u.username.toLowerCase().includes(value.toLowerCase())
    );

    return (
        <div className="relative group">
            <input
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#D41C2C]/20 focus:border-[#D41C2C] outline-none"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                placeholder={placeholder}
            />

            {/* User Type-Ahead Dropdown */}
            {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-1">
                        {filteredUsers.length === 0 ? (
                            <div className="px-3 py-2 text-xs text-gray-400 italic">No users found</div>
                        ) : (
                            filteredUsers.map((user) => (
                                <button
                                    key={user.id}
                                    className="w-full text-left px-3 py-2 hover:bg-red-50 rounded-md transition-colors flex items-center gap-2 group"
                                    onClick={() => onChange(user.id)}
                                >
                                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600 group-hover:bg-[#D41C2C] group-hover:text-white transition-colors">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-800">{user.name}</div>
                                        <div className="text-[10px] text-gray-400 font-mono">@{user.id}</div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
