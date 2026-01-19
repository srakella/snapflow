"use client";

import React from 'react';
import { AuthProvider } from '@/components/AuthContext';
import { TopNavigation } from '@/components/TopNavigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <TopNavigation />
            <main className="flex-1 w-full overflow-hidden relative">
                {children}
            </main>
        </AuthProvider>
    );
}
