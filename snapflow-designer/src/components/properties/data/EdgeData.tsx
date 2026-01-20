import React, { useState } from 'react';
import { InfoBox } from '../shared/InfoBox';
import { Database, Code2 } from 'lucide-react';

interface EdgeDataProps {
    label: string;
    condition: string;
    onUpdate: (updates: { label?: string; data?: { condition?: string } }) => void;
}

export function EdgeData({ label, condition, onUpdate }: EdgeDataProps) {
    const [isConditional, setIsConditional] = useState(!!condition);

    const handleConditionToggle = (checked: boolean) => {
        setIsConditional(checked);
        if (!checked) {
            onUpdate({ label, data: { condition: '' } }); // Clear condition if disabled
        } else {
            // Add default syntax if enabling
            if (!condition) {
                onUpdate({ data: { condition: '${}' } });
            }
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
            <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Visual Label
                </label>
                <input
                    type="text"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#D41C2C]/20 focus:border-[#D41C2C] transition-all outline-none"
                    value={label}
                    onChange={(e) => onUpdate({ label: e.target.value })}
                    placeholder="e.g. Approved, > $500"
                />
            </div>

            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Code2 size={16} className="text-[#D41C2C]" />
                        <span className="text-sm font-bold text-gray-700">Conditional Logic</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={isConditional}
                            onChange={(e) => handleConditionToggle(e.target.checked)}
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#D41C2C]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#D41C2C]"></div>
                    </label>
                </div>

                {isConditional && (
                    <div className="animate-in fade-in duration-200">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                            UEL Expression
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-mono text-blue-600 focus:ring-2 focus:ring-[#D41C2C]/20 focus:border-[#D41C2C] transition-all outline-none"
                                value={condition}
                                onChange={(e) => onUpdate({ data: { condition: e.target.value } })}
                                placeholder="${amount > 1000}"
                            />
                            <div className="absolute right-3 top-3 text-xs text-gray-400 font-mono pointer-events-none">
                                UEL
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Enter a Unified Expression Language (UEL) condition. This path will be taken if true.
                        </p>
                    </div>
                )}
            </div>

            <InfoBox
                title="Routing Logic"
                message='Use conditional expressions to route the workflow. For "Default" paths on a gateway, simply leave the condition empty and ensure other paths cover all scenarios.'
                icon={Database}
                variant="info"
            />
        </div>
    );
}
