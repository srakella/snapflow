import React from 'react';
import { InfoBox } from '../shared/InfoBox';
import { Database } from 'lucide-react';

interface EdgeDataProps {
    label: string;
    onUpdate: (label: string) => void;
}

export function EdgeData({ label, onUpdate }: EdgeDataProps) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Rule Label
                </label>
                <input
                    type="text"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#D41C2C]/20 focus:border-[#D41C2C] transition-all outline-none"
                    value={label}
                    onChange={(e) => onUpdate(e.target.value)}
                    placeholder="Yes, No, > $500..."
                />
            </div>

            <div className="mt-4">
                <InfoBox
                    title="Conditional Flow"
                    message='Use this label to define the business rule for taking this path (e.g., "Amount &gt; 1000").'
                    icon={Database}
                    variant="warning"
                />
            </div>
        </div>
    );
}
