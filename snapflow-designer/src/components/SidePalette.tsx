import React from 'react';
import { User, GitBranch, Sparkles, Play, Square, Settings, Component } from 'lucide-react';

export function SidePalette() {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const nodeTypes = [
        { type: 'start', label: 'Start', icon: <Play size={20} className="fill-current" />, color: 'bg-green-600', desc: 'Start Event' },
        { type: 'task', label: 'Task', icon: <User size={20} />, color: 'bg-blue-600', desc: 'User Task' },
        { type: 'aiAgent', label: 'AI Agent', icon: <Sparkles size={20} />, color: 'bg-purple-600', desc: 'GenAI Agent' },
        { type: 'gateway', label: 'Gateway', icon: <GitBranch size={20} />, color: 'bg-orange-500', desc: 'Decision' },
        { type: 'end', label: 'End', icon: <Square size={20} className="fill-current" />, color: 'bg-red-600', desc: 'End Event' },
    ];

    return (
        <aside className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-4 z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
            <div className="mb-2">
                <div className="w-10 h-10 bg-[#D41C2C] rounded-lg flex items-center justify-center text-white shadow-lg shadow-red-200">
                    <Component size={24} />
                </div>
            </div>

            <div className="w-10 h-[2px] bg-gray-100 rounded-full mb-2"></div>

            <div className="flex flex-col gap-3 w-full px-2">
                {nodeTypes.map((node) => (
                    <div
                        key={node.type}
                        className="group relative flex flex-col items-center"
                        onDragStart={(event) => onDragStart(event, node.type)}
                        draggable
                    >
                        <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing text-white shadow-md transition-all hover:scale-110 hover:shadow-xl hover:rotate-3 ${node.color}`}
                        >
                            {node.icon}
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity absolute top-full whitespace-nowrap bg-gray-800 text-white px-2 py-1 rounded pointer-events-none z-50">
                            {node.desc}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-tight group-hover:text-gray-600 transition-colors">
                            {node.label}
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-auto">
                <button className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                    <Settings size={20} />
                </button>
            </div>
        </aside>
    );
}
