import React from 'react';
import { User, GitBranch, Sparkles, Play, Square, Mail, Clock, Zap, Settings, FileCode } from 'lucide-react';

export function SidePalette() {
    const [draggedType, setDraggedType] = React.useState<string | null>(null);

    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
        setDraggedType(nodeType);
    };

    const onDragEnd = () => {
        setDraggedType(null);
    };

    // Professional BPMN-inspired palette with separate task types
    const nodes = [
        { type: 'start', label: 'Start', icon: <Play size={16} className="fill-current" />, desc: 'Start Event', shape: 'circle' },
        { type: 'end', label: 'End', icon: <Square size={14} className="fill-current" />, desc: 'End Event', shape: 'circle' },
        { type: 'userTask', label: 'User Task', icon: <User size={16} />, desc: 'Manual Task', shape: 'rect' },
        { type: 'serviceTask', label: 'Service', icon: <Settings size={16} />, desc: 'API/Service Call', shape: 'rect' },
        { type: 'email', label: 'Email', icon: <Mail size={16} />, desc: 'Send Email', shape: 'rect' },
        { type: 'timer', label: 'Timer', icon: <Clock size={16} />, desc: 'Delay/Wait', shape: 'circle' },
        { type: 'aiAgent', label: 'AI Agent', icon: <Sparkles size={16} />, desc: 'GenAI Task', shape: 'rect' },
        { type: 'rulesEngine', label: 'Rules', icon: <FileCode size={16} />, desc: 'Business Rules', shape: 'rect' },
        { type: 'dynamicRouter', label: 'Dynamic', icon: <Zap size={16} />, desc: 'Dynamic Router', shape: 'rect' },
        { type: 'gateway', label: 'Gateway', icon: <GitBranch size={16} />, desc: 'Decision Point', shape: 'diamond' },
    ];

    return (
        <aside
            className="w-[220px] bg-white border-r border-gray-200 flex flex-col z-10 shadow-sm"
            role="complementary"
            aria-label="Workflow elements palette"
        >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <Zap size={18} className="text-gray-700" />
                    <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Elements</h2>
                </div>
            </div>

            {/* Compact Grid - No Scrolling */}
            <div className="p-4">
                <div className="grid grid-cols-2 gap-2.5">
                    {nodes.map((node) => (
                        <div
                            key={node.type}
                            className="group relative"
                            onDragStart={(event) => onDragStart(event, node.type)}
                            onDragEnd={onDragEnd}
                            draggable
                            role="button"
                            tabIndex={0}
                            aria-label={`Add ${node.desc} to workflow`}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                }
                            }}
                        >
                            <div
                                className={`
                                    relative flex flex-col items-center justify-center gap-1.5 p-2.5 
                                    border-2 border-gray-300 rounded-lg
                                    cursor-grab active:cursor-grabbing
                                    transition-all duration-150
                                    ${draggedType === node.type
                                        ? 'opacity-50 scale-95'
                                        : 'hover:border-gray-900 hover:bg-gray-50 hover:shadow-md'
                                    }
                                `}
                            >
                                {/* Icon Container - Monochromatic */}
                                <div className={`
                                    flex items-center justify-center text-gray-700
                                    ${node.shape === 'circle' ? 'w-7 h-7 rounded-full border-2 border-gray-700' : ''}
                                    ${node.shape === 'rect' ? 'w-7 h-7 rounded border-2 border-gray-700' : ''}
                                    ${node.shape === 'diamond' ? 'w-7 h-7 rotate-45 border-2 border-gray-700' : ''}
                                `}>
                                    <div className={node.shape === 'diamond' ? '-rotate-45' : ''}>
                                        {node.icon}
                                    </div>
                                </div>

                                {/* Label */}
                                <span className="text-[9px] font-medium text-gray-600 text-center leading-tight">
                                    {node.label}
                                </span>
                            </div>

                            {/* Tooltip - ARIA compliant */}
                            <div
                                className="opacity-0 group-hover:opacity-100 transition-opacity absolute left-full ml-2 top-1/2 -translate-y-1/2 pointer-events-none z-50"
                                role="tooltip"
                            >
                                <div className="bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                                    {node.desc}
                                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Info Footer */}
            <div className="mt-auto px-4 py-3 border-t border-gray-200 bg-gray-50">
                <p className="text-[10px] text-gray-500 text-center">
                    Drag elements to canvas
                </p>
            </div>
        </aside>
    );
}
