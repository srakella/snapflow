import { Handle, Position, NodeProps } from '@xyflow/react';
import { AppNode } from '../../store/useStore';

export function StartNode({ selected }: NodeProps<AppNode>) {
    return (
        <div className={`w-10 h-10 rounded-full bg-white border-2 flex items-center justify-center transition-all ${selected ? 'border-green-500 ring-2 ring-green-500/20' : 'border-green-400'}`}>
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <Handle
                type="source"
                position={Position.Right}
                className={`w-3 h-3 transition-all hover:scale-125 !border-2 ${selected ? '!bg-green-500 !border-white ring-2 ring-green-500/30' : '!bg-gray-300 !border-gray-400 opacity-50'}`}
            />
        </div>
    );
}
