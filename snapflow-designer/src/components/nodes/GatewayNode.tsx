import { NodeProps, Handle, Position } from '@xyflow/react';
import { GitBranch } from 'lucide-react';
import { AppNode } from '../../store/useStore';

export function GatewayNode({ data, selected }: NodeProps<AppNode>) {
    return (
        <div className={`relative w-12 h-12 flex items-center justify-center transition-all ${selected ? 'scale-110' : ''}`}>
            <div className={`absolute inset-0 rotate-45 bg-white border-2 rounded-sm shadow-md transition-all ${selected ? 'border-primary ring-2 ring-primary/20' : 'border-orange-400'}`} />
            <div className="relative z-10 text-orange-600">
                <GitBranch size={20} />
            </div>

            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-500 uppercase whitespace-nowrap">
                {data.label}
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
