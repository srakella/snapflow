'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, FileText, Settings2, Activity, Rocket, Home, Briefcase } from 'lucide-react';

export function TopNavigation() {
    const pathname = usePathname();

    const isActive = (path: string) => {
        // Exact match for Home ('/')
        if (path === '/' && pathname === '/') return true;
        // Exact match for Designer ('/designer') to avoid partial match issues if we had /designer-v2
        if (path === '/designer' && pathname === '/designer') return true;
        // Prefix match for nested routes (e.g. /rules/id, /forms/designer)
        if (path !== '/' && pathname?.startsWith(path)) return true;
        return false;
    };

    const navItems = [
        { path: '/', label: 'Home', icon: <Home size={18} /> },
        { path: '/designer', label: 'Designer', icon: <LayoutGrid size={18} /> },
        { path: '/rules', label: 'Rules', icon: <Settings2 size={18} /> },
        { path: '/forms/designer', label: 'Forms', icon: <FileText size={18} /> },
        { path: '/tasks', label: 'Tasks', icon: <Briefcase size={18} /> },
        { path: '/dashboard', label: 'Monitor', icon: <Activity size={18} /> },
    ];

    return (
        <nav className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50 sticky top-0 font-sans">
            {/* Logo */}
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#D41C2C] rounded-lg flex items-center justify-center text-white shadow-sm">
                    <Rocket size={20} className="fill-white" />
                </div>
                <span className="font-bold text-gray-900 text-lg tracking-tight">SnapFlow</span>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-1">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                            ${isActive(item.path)
                                ? 'bg-red-50 text-[#D41C2C]'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }
                        `}
                    >
                        {item.icon}
                        {item.label}
                    </Link>
                ))}
            </div>

            {/* User Profile / Actions */}
            <div className="flex items-center gap-3">
                <button className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-medium text-gray-700">
                    JD
                </button>
            </div>
        </nav>
    );
}
