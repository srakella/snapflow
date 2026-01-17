import { Handle, Position, NodeProps } from '@xyflow/react';
import { AppNode } from '../../store/useStore';

export function EndNode({ selected }: NodeProps<AppNode>) {
    return (
        <div className={`w-10 h-10 rounded-full bg-white border-4 flex items-center justify-center transition-all ${selected ? 'border-red-600 ring-2 ring-red-600/20' : 'border-red-500'}`}>
            <div className="w-4 h-4 rounded-full bg-red-600" />
            <Handle
                type="target"
                position={Position.Left}
                className={`w-3 h-3 transition-all hover:scale-125 !border-2 ${selected ? '!bg-red-600 !border-white ring-2 ring-red-600/30' : '!bg-gray-300 !border-gray-400 opacity-50'}`}
            />
        </div>
    );
}
