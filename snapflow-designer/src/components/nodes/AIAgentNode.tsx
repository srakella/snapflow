import { NodeProps, Handle, Position } from '@xyflow/react';
import { Sparkles } from 'lucide-react';
import { AppNode } from '../../store/useStore';

export function AIAgentNode({ data, selected }: NodeProps<AppNode>) {
    return (
        <div className={`px-4 py-3 shadow-md rounded-md bg-white border-2 transition-all duration-200 ${selected ? 'border-gray-900 ring-2 ring-gray-300' : 'border-gray-400 hover:border-gray-600'}`}>
            <div className="flex items-center gap-3">
                <div className="rounded w-8 h-8 flex items-center justify-center border-2 border-gray-700 text-gray-700">
                    <Sparkles size={16} />
                </div>
                <div>
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">AI Agent</div>
                    <div className="text-sm font-bold text-gray-900">{data.label}</div>
                </div>
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
