import { NodeProps, Handle, Position } from '@xyflow/react';
import { GitBranch } from 'lucide-react';
import { AppNode } from '../../store/useStore';

export function GatewayNode({ data, selected }: NodeProps<AppNode>) {
    return (
        <div className={`relative w-16 h-16 flex items-center justify-center transition-all duration-200 ${selected ? 'scale-110' : ''}`}>
            <div className={`absolute inset-0 rotate-45 bg-white border-2 rounded-md shadow-md transition-all ${selected ? 'border-gray-900 ring-2 ring-gray-300' : 'border-gray-600 hover:border-gray-800'}`} />
            <div className="relative z-10 text-gray-700">
                <GitBranch size={22} strokeWidth={2.5} />
            </div>

            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-gray-600 uppercase whitespace-nowrap bg-white px-2 py-0.5 rounded border border-gray-300">
                {data.label}
            </div>

            <Handle
                type="target"
                position={Position.Top}
                className={`w-3 h-3 transition-all hover:scale-150 !border-2 ${selected ? '!bg-gray-900 !border-white ring-2 ring-gray-400' : '!bg-gray-400 !border-gray-600'}`}
            />
            <Handle
                type="source"
                position={Position.Bottom}
                className={`w-3 h-3 transition-all hover:scale-150 !border-2 ${selected ? '!bg-gray-900 !border-white ring-2 ring-gray-400' : '!bg-gray-400 !border-gray-600'}`}
            />
            <Handle
                type="target"
                position={Position.Left}
                className={`w-3 h-3 transition-all hover:scale-150 !border-2 ${selected ? '!bg-gray-900 !border-white ring-2 ring-gray-400' : '!bg-gray-400 !border-gray-600'}`}
            />
            <Handle
                type="source"
                position={Position.Right}
                className={`w-3 h-3 transition-all hover:scale-150 !border-2 ${selected ? '!bg-gray-900 !border-white ring-2 ring-gray-400' : '!bg-gray-400 !border-gray-600'}`}
            />
        </div>
    );
}
