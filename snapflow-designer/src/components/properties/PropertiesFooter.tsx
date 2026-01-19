import React from 'react';
import { Trash2 } from 'lucide-react';

interface PropertiesFooterProps {
    itemType: 'node' | 'edge';
    onDelete: () => void;
}

export function PropertiesFooter({ itemType, onDelete }: PropertiesFooterProps) {
    return (
        <div className="p-4 border-t bg-gray-50 flex justify-center">
            <button
                onClick={onDelete}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-all font-bold text-xs uppercase"
            >
                <Trash2 size={14} /> Delete {itemType === 'node' ? 'Node' : 'Connection'}
            </button>
        </div>
    );
}
