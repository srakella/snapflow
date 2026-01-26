import React, { useState } from 'react';
import { Type, AlignLeft, Hash, List, CheckSquare, Filter, Activity, Calendar, User, Paperclip, PenTool, Database, Plus } from 'lucide-react';
import { FieldType } from '@/app/forms/designer/types';

// Central definition of templates
export const FIELD_TEMPLATES = [
    { type: 'text' as FieldType, icon: Type, label: 'Single Line Text', description: 'Short answers, names', color: 'bg-blue-500', group: 'Basic' },
    { type: 'textarea' as FieldType, icon: AlignLeft, label: 'Paragraph Text', description: 'Longer responses', color: 'bg-indigo-500', group: 'Basic' },
    { type: 'number' as FieldType, icon: Hash, label: 'Number', description: 'Quantities, prices', color: 'bg-green-500', group: 'Basic' },
    { type: 'email' as FieldType, icon: Type, label: 'Email', description: 'Email address validation', color: 'bg-blue-600', group: 'Contact' },
    { type: 'select' as FieldType, icon: List, label: 'Dropdown', description: 'Single selection from list', color: 'bg-yellow-500', group: 'Selection' },
    { type: 'checkbox' as FieldType, icon: CheckSquare, label: 'Checkbox', description: 'Yes/No options', color: 'bg-teal-500', group: 'Selection' },
    { type: 'radio' as FieldType, icon: Filter, label: 'Radio Group', description: 'Select one option', color: 'bg-purple-500', group: 'Selection' },
    { type: 'toggle' as FieldType, icon: Activity, label: 'Switch', description: 'On/Off toggle', color: 'bg-cyan-500', group: 'Selection' },
    { type: 'date' as FieldType, icon: Calendar, label: 'Date Picker', description: 'Dates and times', color: 'bg-orange-500', group: 'Advanced' },
    { type: 'people' as FieldType, icon: User, label: 'People Picker', description: 'Select users', color: 'bg-pink-600', group: 'Advanced' },
    { type: 'file' as FieldType, icon: Paperclip, label: 'File Upload', description: 'Documents triggers', color: 'bg-slate-600', group: 'Advanced' },
    { type: 'signature' as FieldType, icon: PenTool, label: 'Signature', description: 'E-Signatures', color: 'bg-violet-600', group: 'Advanced' },
];

interface FormElementsSidebarProps {
    onAddField: (type: FieldType) => void;
    upstreamVariables: any[];
    onAddVariable: (variable: any) => void;
}

export function FormElementsSidebar({ onAddField, upstreamVariables, onAddVariable }: FormElementsSidebarProps) {
    const [activeTab, setActiveTab] = useState<'elements' | 'data'>('elements');

    // Grouping
    const groups = ['Basic', 'Selection', 'Contact', 'Advanced'];

    return (
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-full shadow-lg z-20">
            {/* Tab Header */}
            <div className="flex border-b border-gray-100">
                <button
                    onClick={() => setActiveTab('elements')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'elements' ? 'border-[#D41C2C] text-[#D41C2C] bg-red-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Elements
                </button>
                <button
                    onClick={() => setActiveTab('data')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'data' ? 'border-[#D41C2C] text-[#D41C2C] bg-red-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Workflow Data
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-slate-50/50">
                {activeTab === 'elements' ? (
                    <div className="p-4 space-y-6">
                        {groups.map(group => {
                            const groupItems = FIELD_TEMPLATES.filter(t => t.group === group);
                            if (groupItems.length === 0) return null;
                            return (
                                <div key={group}>
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 pl-1">{group}</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {groupItems.map(template => {
                                            const Icon = template.icon;
                                            return (
                                                <button
                                                    key={template.type}
                                                    onClick={() => onAddField(template.type)}
                                                    className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-lg hover:border-[#D41C2C] hover:shadow-md transition-all group text-center"
                                                >
                                                    <div className={`p-2 rounded-full ${template.color} text-white mb-2 shadow-sm group-hover:scale-110 transition-transform`}>
                                                        <Icon size={16} strokeWidth={2.5} />
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-700 group-hover:text-[#D41C2C]">{template.label}</span>
                                                    {/* <span className="text-[9px] text-gray-400 mt-0.5 leading-tight">{template.description}</span> */}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-4 space-y-3">
                        {upstreamVariables.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                <Database size={32} className="mx-auto mb-2 opacity-20" />
                                <p className="text-xs">No workflow variables found.</p>
                            </div>
                        ) : (
                            upstreamVariables.map((v, i) => (
                                <div key={i} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:border-blue-400 transition-all group">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{v.sourceNodeLabel}</span>
                                        <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono">{v.type}</span>
                                    </div>
                                    <div className="font-bold text-slate-700 text-sm mb-1">{v.label}</div>
                                    <div className="flex items-center justify-between mt-2">
                                        <code className="text-[10px] text-slate-400 font-mono">{v.key}</code>
                                        <button
                                            onClick={() => onAddVariable(v)}
                                            className="p-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                            title="Add to form"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </aside>
    );
}
