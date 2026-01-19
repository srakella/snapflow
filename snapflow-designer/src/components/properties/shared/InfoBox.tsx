import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InfoBoxProps {
    title: string;
    message: string;
    icon: LucideIcon;
    variant?: 'info' | 'warning' | 'success' | 'error';
}

const variantStyles = {
    info: {
        container: 'bg-blue-50 border-blue-100',
        title: 'text-blue-800',
        message: 'text-blue-600',
    },
    warning: {
        container: 'bg-amber-50 border-amber-100',
        title: 'text-amber-800',
        message: 'text-amber-600',
    },
    success: {
        container: 'bg-green-50 border-green-100',
        title: 'text-green-800',
        message: 'text-green-600',
    },
    error: {
        container: 'bg-red-50 border-red-100',
        title: 'text-red-800',
        message: 'text-red-600',
    },
};

export function InfoBox({ title, message, icon: Icon, variant = 'info' }: InfoBoxProps) {
    const styles = variantStyles[variant];

    return (
        <div className={`p-4 border rounded-xl ${styles.container}`}>
            <h4 className={`text-xs font-bold mb-1 flex items-center gap-2 ${styles.title}`}>
                <Icon size={14} />
                {title}
            </h4>
            <p className={`text-[11px] leading-relaxed ${styles.message}`} dangerouslySetInnerHTML={{ __html: message }} />
        </div>
    );
}
