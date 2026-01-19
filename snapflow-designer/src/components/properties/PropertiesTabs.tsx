import React from 'react';
import { Activity, Settings2, Database } from 'lucide-react';

type TabId = 'general' | 'config' | 'data';

interface Tab {
    id: TabId;
    label: string;
    icon: React.ComponentType<{ size: number }>;
}

interface PropertiesTabsProps {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
}

const tabs: Tab[] = [
    { id: 'general', label: 'General', icon: Activity },
    { id: 'config', label: 'Configuration', icon: Settings2 },
    { id: 'data', label: 'Data & Form', icon: Database },
];

export function PropertiesTabs({ activeTab, onTabChange }: PropertiesTabsProps) {
    return (
        <div className="flex border-b border-gray-200 bg-gray-50/50">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex-1 py-3 border-b-2 text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-2 ${activeTab === tab.id
                            ? 'border-[#D41C2C] text-[#D41C2C] bg-white'
                            : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <tab.icon size={14} />
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
