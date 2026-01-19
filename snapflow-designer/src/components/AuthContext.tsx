"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface UserGroup {
    id: string;
    code: 'ADMIN' | 'DESIGNER' | 'USER';
    name: string;
}

export interface User {
    id: string;
    username: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    groups: UserGroup[];
}

interface AuthContextType {
    user: User | null;
    login: (user: User) => void;
    logout: () => void;
    hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    const [isInitialized, setIsInitialized] = useState(false);

    // Initial check on mount
    useEffect(() => {
        const stored = localStorage.getItem('snapflow_user');
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse stored user");
                localStorage.removeItem('snapflow_user');
            }
        }
        setIsInitialized(true);
    }, []);

    // Auth Guard
    useEffect(() => {
        if (!isInitialized) return; // Wait for initial check

        const isLoginPage = window.location.pathname === '/login';

        if (!user && !isLoginPage) {
            router.push('/login');
        }
    }, [user, isInitialized, router]);

    // Don't render children until we know the auth state to prevent flash
    if (!isInitialized) return null;

    const login = (newUser: User) => {
        setUser(newUser);
        localStorage.setItem('snapflow_user', JSON.stringify(newUser));
        router.push('/dashboard'); // Redirect to dashboard on login
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('snapflow_user');
        router.push('/login');
    };

    const hasRole = (roleCode: string) => {
        if (!user) return false;
        // Admin has all roles implicitly? Or check explicitly?
        // Let's check explicitly for now, assuming Admin has 'ADMIN' group.
        return user.groups.some(g => g.code === roleCode || g.code === 'ADMIN');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
