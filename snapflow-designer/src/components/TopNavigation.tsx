'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, FileText, Settings2, Activity, Rocket, Home, Briefcase, LogOut, Zap } from 'lucide-react';
import { useAuth } from './AuthContext';

import { useStore } from '../store/useStore';
import { NotificationBell } from './NotificationBell';
import { MessageSquare } from 'lucide-react';

export function TopNavigation() {
    const pathname = usePathname();
    const { user, logout, hasRole } = useAuth();
    const { toggleCollaborationPanel, isCollaborationPanelOpen } = useStore();

    const isActive = (path: string) => {
        if (path === '/' && pathname === '/') return true;
        if (path === '/designer' && pathname === '/designer') return true;
        if (path !== '/' && pathname?.startsWith(path)) return true;
        return false;
    };

    // If on login page, hide nav or show simplified?
    // Let's hide nav items if not logged in
    if (!user) return null;

    const navItems = [
        { path: '/', label: 'Home', icon: <Home size={18} />, allowed: true },
        { path: '/designer', label: 'Designer', icon: <LayoutGrid size={18} />, allowed: hasRole('DESIGNER') },
        { path: '/rules', label: 'Rules', icon: <Settings2 size={18} />, allowed: hasRole('DESIGNER') },
        { path: '/forms/designer', label: 'Forms', icon: <FileText size={18} />, allowed: hasRole('DESIGNER') },
        { path: '/tasks', label: 'Tasks', icon: <Briefcase size={18} />, allowed: hasRole('USER') || hasRole('DESIGNER') },
        { path: '/dashboard', label: 'Monitor', icon: <Activity size={18} />, allowed: hasRole('USER') || hasRole('ADMIN') },
    ];

    return (
        <nav className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50 sticky top-0 font-sans">
            {/* Logo */}
            <div className="flex items-center gap-2">
                <img src="/snapflowlogo.png" alt="SnapFlow Logo" className="w-8 h-8 rounded-lg object-contain" />
                <span className="font-bold text-gray-900 text-lg tracking-tight">SnapFlow</span>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-1">
                {navItems.filter(item => item.allowed).map((item) => (
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
                <NotificationBell userId={user.id} />

                <button
                    onClick={toggleCollaborationPanel}
                    className={`p-2 rounded-full transition-colors relative ${isCollaborationPanelOpen ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100 hover:text-blue-600'}`}
                    title="Collaboration & Team"
                >
                    <MessageSquare size={20} />
                </button>

                <div className="h-6 w-px bg-gray-200 mx-1"></div>

                <button
                    onClick={logout}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-[#D41C2C] hover:bg-red-50 rounded transition-all uppercase"
                >
                    <LogOut size={14} /> Logout
                </button>
                <div className="w-8 h-8 rounded-full bg-[#D41C2C] text-white flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-white cursor-help" title={user.fullName}>
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
            </div>
        </nav>
    );
}
