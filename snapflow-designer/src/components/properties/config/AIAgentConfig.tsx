import React from 'react';
import { Sparkles } from 'lucide-react';

interface AIAgentConfigProps {
    config: any;
    onUpdate: (config: any) => void;
}

export function AIAgentConfig({ config, onUpdate }: AIAgentConfigProps) {
    return (
        <div className="space-y-5">
            <div>
                <label className="block text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles size={12} /> System Prompt
                </label>
                <textarea
                    className="w-full p-4 bg-purple-50/50 border border-purple-100 rounded-xl text-sm font-mono text-gray-700 min-h-[160px] focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                    value={config?.systemPrompt || ''}
                    onChange={(e) =>
                        onUpdate({
                            ...config,
                            systemPrompt: e.target.value,
                        })
                    }
                    placeholder="You are a helpful assistant..."
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Input Var
                    </label>
                    <input
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-mono"
                        value={config?.inputVariableName || ''}
                        onChange={(e) =>
                            onUpdate({
                                ...config,
                                inputVariableName: e.target.value,
                            })
                        }
                        placeholder="input"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Output Var
                    </label>
                    <input
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-mono"
                        value={config?.outputVariableName || ''}
                        onChange={(e) =>
                            onUpdate({
                                ...config,
                                outputVariableName: e.target.value,
                            })
                        }
                        placeholder="output"
                    />
                </div>
            </div>
        </div>
    );
}
