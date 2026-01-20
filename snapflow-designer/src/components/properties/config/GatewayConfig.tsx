import React from 'react';
import { GitFork, GitMerge } from 'lucide-react';
import { InfoBox } from '../shared/InfoBox';

interface GatewayConfigProps {
    config: any;
    onUpdate: (config: any) => void;
}

export function GatewayConfig({ config, onUpdate }: GatewayConfigProps) {
    const gatewayType = config?.gatewayType || 'exclusive';

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Gateway Type
                </label>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => onUpdate({ ...config, gatewayType: 'exclusive' })}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all ${gatewayType === 'exclusive'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <GitFork size={14} className="rotate-90" />
                        Exclusive (XOR)
                    </button>
                    <button
                        onClick={() => onUpdate({ ...config, gatewayType: 'parallel' })}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all ${gatewayType === 'parallel'
                            ? 'bg-white text-purple-600 shadow-sm'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <GitMerge size={14} />
                        Parallel (AND)
                    </button>
                </div>
            </div>

            <InfoBox
                title={gatewayType === 'exclusive' ? 'Exclusive Gateway' : 'Parallel Gateway'}
                message={gatewayType === 'exclusive'
                    ? "Only ONE path will be taken based on conditions. The first condition that evaluates to true wins."
                    : "ALL paths will be taken simultaneously. Execution waits at a joining gateway until all paths arrive."
                }
                icon={gatewayType === 'exclusive' ? GitFork : GitMerge}
                variant={gatewayType === 'exclusive' ? 'info' : 'warning'}
            />
        </div>
    );
}
