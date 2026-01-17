import React from 'react';
import { User, GitBranch, Sparkles } from 'lucide-react';

export function SidePalette() {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const nodeTypes = [
        { type: 'task', label: 'User Task', icon: <User size={18} />, color: 'bg-blue-500' },
        { type: 'gateway', label: 'Gateway', icon: <GitBranch size={18} />, color: 'bg-orange-500' },
        { type: 'aiAgent', label: 'AI Agent', icon: <Sparkles size={18} />, color: 'bg-purple-600' },
    ];

    return (
        <aside className="w-64 border-r bg-gray-50/50 p-4 flex flex-col gap-4">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
                Node Library
            </div>
            {nodeTypes.map((node) => (
                <div
                    key={node.type}
                    className="flex items-center gap-3 p-3 bg-white border rounded-lg cursor-grab hover:shadow-md transition-all active:cursor-grabbing"
                    onDragStart={(event) => onDragStart(event, node.type)}
                    draggable
                >
                    <div className={`p-2 rounded-md ${node.color} text-white`}>
                        {node.icon}
                    </div>
                    <span className="text-sm font-medium">{node.label}</span>
                </div>
            ))}
            <div className="mt-auto p-4 bg-blue-50 rounded-lg border border-blue-100 italic text-xs text-blue-700">
                Drag and drop components to build your workflow.
            </div>
        </aside>
    );
}
