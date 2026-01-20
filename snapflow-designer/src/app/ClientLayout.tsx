"use client";

import React from 'react';
import { AuthProvider } from '@/components/AuthContext';
import { TopNavigation } from '@/components/TopNavigation';

import { useStore } from '@/store/useStore';
import { CollaborationPanel } from '@/components/CollaborationPanel';
import { useAuth } from '@/components/AuthContext';

function GlobalCollaborationOverlay() {
    const { isCollaborationPanelOpen, toggleCollaborationPanel, workflowMetadata, selectedNode } = useStore();
    const { user } = useAuth();

    if (!isCollaborationPanelOpen || !user) return null;

    return (
        <div className="fixed top-14 right-0 bottom-0 w-[400px] z-50 shadow-2xl border-l border-gray-200 bg-white animate-in slide-in-from-right duration-300">
            <CollaborationPanel
                contextType="workflow"
                contextId={workflowMetadata.id || 'global-lobby'}
                nodeId={selectedNode?.id}
                currentUserId={user.id}
                onClose={toggleCollaborationPanel}
            />
        </div>
    );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <TopNavigation />
            <GlobalCollaborationOverlay />
            <main className="flex-1 w-full overflow-hidden relative">
                {children}
            </main>
        </AuthProvider>
    );
}
