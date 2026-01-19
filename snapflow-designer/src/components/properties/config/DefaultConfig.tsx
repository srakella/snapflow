import React from 'react';
import { Settings2 } from 'lucide-react';

interface DefaultConfigProps {
    nodeType: string;
}

export function DefaultConfig({ nodeType }: DefaultConfigProps) {
    return (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-xl text-center">
            <div className="p-3 bg-gray-50 rounded-full mb-3 text-gray-400">
                <Settings2 size={24} />
            </div>
            <p className="text-sm font-medium text-gray-500">
                No specific configuration needed for this node type.
            </p>
            <p className="text-xs text-gray-400 mt-1">Type: {nodeType}</p>
        </div>
    );
}
