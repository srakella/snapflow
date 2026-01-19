import React from 'react';
import { Activity } from 'lucide-react';
import { AppNode } from '@/store/useStore';

interface GeneralTabProps {
    node: AppNode;
    onUpdate: (data: any) => void;
}

export function GeneralTab({ node, onUpdate }: GeneralTabProps) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-5">
            <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Display Label
                </label>
                <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#D41C2C]/20 focus:border-[#D41C2C] transition-all outline-none shadow-sm"
                    value={node.data.label}
                    onChange={(e) => onUpdate({ label: e.target.value })}
                    placeholder="Name this step..."
                />
            </div>

            <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Description
                </label>
                <textarea
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#D41C2C]/20 focus:border-[#D41C2C] transition-all outline-none shadow-sm min-h-[120px] resize-none"
                    value={node.data.description || ''}
                    onChange={(e) => onUpdate({ description: e.target.value })}
                    placeholder="Describe the purpose of this step for documentation..."
                />
            </div>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <h4 className="text-blue-800 text-xs font-bold mb-1 flex items-center gap-2">
                    <Activity size={14} /> Process Note
                </h4>
                <p className="text-blue-600 text-[11px] leading-relaxed">
                    This ID <strong>{node.id}</strong> is unique and used for tracking audit logs.
                </p>
            </div>
        </div>
    );
}
