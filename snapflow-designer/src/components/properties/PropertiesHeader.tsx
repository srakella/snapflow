import React from 'react';
import { X, Settings2 } from 'lucide-react';

interface PropertiesHeaderProps {
    title: string;
    subtitle: string;
    onClose: () => void;
}

export function PropertiesHeader({ title, subtitle, onClose }: PropertiesHeaderProps) {
    return (
        <div className="bg-gradient-to-r from-[#D41C2C] to-[#B81926] p-5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Settings2 size={20} className="text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-white text-lg leading-tight">{title}</h3>
                    <p className="text-white/70 text-[10px] uppercase font-bold tracking-wider">
                        {subtitle}
                    </p>
                </div>
            </div>
            <button
                onClick={onClose}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded-md transition-all"
            >
                <X size={20} />
            </button>
        </div>
    );
}
