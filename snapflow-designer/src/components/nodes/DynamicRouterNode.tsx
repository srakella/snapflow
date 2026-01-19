import React from 'react';
import { Handle, Position } from '@xyflow/react';

export function DynamicRouterNode({ data, selected }: any) {
    return (
        <div
            className={`relative bg-white rounded-lg shadow-lg transition-all ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                }`}
            style={{
                minWidth: '180px',
                border: '2px dashed #3b82f6',
            }}
        >
            {/* Handles */}
            <Handle
                type="target"
                position={Position.Left}
                className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
            />
            <Handle
                type="source"
                position={Position.Right}
                className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
            />

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 rounded-t-lg">
                <div className="flex items-center gap-2 text-white">
                    <span className="text-lg">⚡</span>
                    <span className="font-semibold text-sm">Dynamic Router</span>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 py-3 space-y-2">
                <div className="text-sm font-medium text-gray-900">
                    {data.label || 'Route Dynamically'}
                </div>

                {data.config?.routingStrategy && (
                    <div className="text-xs text-gray-600 space-y-1">
                        <div className="flex items-center gap-1">
                            <span className="font-medium">Strategy:</span>
                            <span className="capitalize">{data.config.routingStrategy}</span>
                        </div>

                        {data.config.routingStrategy === 'rules' && data.config.ruleSetName && (
                            <div className="flex items-center gap-1">
                                <span className="font-medium">Rules:</span>
                                <span className="truncate">{data.config.ruleSetName}</span>
                            </div>
                        )}

                        {data.config.routingStrategy === 'database' && (
                            <div className="flex items-center gap-1">
                                <span className="font-medium">Source:</span>
                                <span>Database Query</span>
                            </div>
                        )}

                        {data.config.routingStrategy === 'script' && (
                            <div className="flex items-center gap-1">
                                <span className="font-medium">Source:</span>
                                <span>Custom Script</span>
                            </div>
                        )}
                    </div>
                )}

                {!data.config?.routingStrategy && (
                    <div className="text-xs text-gray-400 italic">
                        Not configured
                    </div>
                )}
            </div>

            {/* Footer Badge */}
            <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 rounded-b-lg">
                <div className="text-xs text-blue-700 font-medium flex items-center gap-1">
                    <span>⚡</span>
                    <span>Runtime Routing</span>
                </div>
            </div>
        </div>
    );
}
