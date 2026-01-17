import { NodeProps, Handle, Position } from '@xyflow/react';
import { Sparkles } from 'lucide-react';
import { AppNode } from '../../store/useStore';

export function AIAgentNode({ data, selected }: NodeProps<AppNode>) {
    return (
        <div className={`px-4 py-3 shadow-lg rounded-lg bg-white border-2 transition-all ${selected ? 'border-primary ring-2 ring-primary/20' : 'border-purple-500 animate-pulse-subtle'}`}>
            <div className="flex items-center">
                <div className="rounded-lg w-10 h-10 flex items-center justify-center bg-purple-100 text-purple-600 mr-3 shadow-inner">
                    <Sparkles size={20} className="animate-pulse" />
                </div>
                <div>
                    <div className="text-[10px] font-black text-purple-600 uppercase tracking-wider">AI Agent</div>
                    <div className="text-sm font-bold text-gray-800">{data.label}</div>
                </div>
            </div>

            <style jsx>{`
        .animate-pulse-subtle {
          animation: pulse-subtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; border-color: #a855f7; }
          50% { opacity: 0.9; border-color: #ca8a04; }
        }
      `}</style>

            <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-purple-400" />
            <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-purple-400" />
            <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-purple-400" />
            <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-purple-400" />
        </div>
    );
}
