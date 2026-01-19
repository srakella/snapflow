import React from 'react';
import { Activity } from 'lucide-react';

interface ConditionalExecutionProps {
    value?: string;
    onChange: (condition: string | undefined) => void;
}

export function ConditionalExecution({ value, onChange }: ConditionalExecutionProps) {
    const isEnabled = value !== undefined;

    const handleToggle = (enabled: boolean) => {
        onChange(enabled ? '${amount >= 1000}' : undefined);
    };

    return (
        <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Activity size={12} /> Conditional Execution
            </label>
            <div className="p-3 border border-gray-200 rounded-lg bg-gray-50/50">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-700">Run only if...</span>
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={isEnabled}
                            onChange={(e) => handleToggle(e.target.checked)}
                        />
                        <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                {isEnabled && (
                    <div className="animate-in fade-in slide-in-from-top-1">
                        <input
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-xs font-mono text-blue-600 focus:ring-1 focus:ring-blue-500 outline-none"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="${condition}"
                        />
                        <p className="text-[10px] text-gray-400 mt-1.5 leading-tight">
                            Task will be active only if this expression evaluates to true. <br />
                            Example: <code className="bg-gray-100 px-1 rounded">{'${amount >= 1000}'}</code>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
