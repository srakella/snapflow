import { Handle, Position, NodeProps } from '@xyflow/react';
import { User } from 'lucide-react';
import { AppNode } from '../../store/useStore';

export function TaskNode({ data, selected }: NodeProps<AppNode>) {
    return (
        <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 transition-all ${selected ? 'border-primary ring-2 ring-primary/20' : 'border-blue-400'}`}>
            <div className="flex items-center">
                <div className="rounded-full w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 mr-2">
                    <User size={16} />
                </div>
                <div>
                    <div className="text-xs font-bold text-gray-500 uppercase">Process Task</div>
                    <div className="text-sm font-semibold">{data.label}</div>
                </div>
            </div>

            <Handle
                type="target"
                position={Position.Top}
                className={`w-3 h-3 transition-all hover:scale-125 !border-2 ${selected ? '!bg-primary !border-white ring-2 ring-primary/30' : '!bg-gray-300 !border-gray-400 opacity-50'}`}
            />
            <Handle
                type="source"
                position={Position.Bottom}
                className={`w-3 h-3 transition-all hover:scale-125 !border-2 ${selected ? '!bg-primary !border-white ring-2 ring-primary/30' : '!bg-gray-300 !border-gray-400 opacity-50'}`}
            />
            <Handle
                type="target"
                position={Position.Left}
                className={`w-3 h-3 transition-all hover:scale-125 !border-2 ${selected ? '!bg-primary !border-white ring-2 ring-primary/30' : '!bg-gray-300 !border-gray-400 opacity-50'}`}
            />
            <Handle
                type="source"
                position={Position.Right}
                className={`w-3 h-3 transition-all hover:scale-125 !border-2 ${selected ? '!bg-primary !border-white ring-2 ring-primary/30' : '!bg-gray-300 !border-gray-400 opacity-50'}`}
            />
        </div>
    );
}
