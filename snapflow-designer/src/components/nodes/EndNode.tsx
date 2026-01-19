import { Handle, Position, NodeProps } from '@xyflow/react';
import { Square } from 'lucide-react';
import { AppNode } from '../../store/useStore';

export function EndNode({ selected }: NodeProps<AppNode>) {
    return (
        <div className={`w-14 h-14 rounded-full bg-white border-4 border-gray-700 flex items-center justify-center transition-all duration-200 shadow-md ${selected ? 'ring-2 ring-gray-400 scale-110 border-gray-900' : 'hover:scale-105 hover:shadow-lg'}`}>
            <Square size={16} className="text-gray-700 fill-gray-700" />
            <Handle
                type="target"
                position={Position.Left}
                className={`w-3 h-3 transition-all hover:scale-150 !border-2 ${selected ? '!bg-gray-900 !border-white ring-2 ring-gray-400' : '!bg-gray-400 !border-gray-600'}`}
            />
        </div>
    );
}
