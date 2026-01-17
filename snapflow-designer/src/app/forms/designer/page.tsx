"use client";

import React, { useState } from 'react';
import { Plus, Save, Trash2, GripVertical, FileText, Calendar, Hash, CheckSquare, List, Eye, Edit2, ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';

type FieldType = 'text' | 'number' | 'date' | 'select' | 'checkbox';

interface FormField {
    id: string;
    label: string;
    key: string;
    type: FieldType;
    required: boolean;
    options?: string[]; // For select fields
}

export default function FormDesignerPage() {
    const [formName, setFormName] = useState('New Form');
    const [fields, setFields] = useState<FormField[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

    const addField = (type: FieldType) => {
        const newField: FormField = {
            id: Math.random().toString(36).substr(2, 9),
            label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
            key: `field_${fields.length + 1}`,
            type,
            required: false,
            options: type === 'select' ? ['Option 1', 'Option 2'] : undefined
        };
        setFields([...fields, newField]);
    };

    const updateField = (id: string, updates: Partial<FormField>) => {
        setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const removeField = (id: string) => {
        setFields(fields.filter(f => f.id !== id));
    };

    const moveField = (index: number, direction: 'up' | 'down') => {
        const newFields = [...fields];
        if (direction === 'up' && index > 0) {
            [newFields[index], newFields[index - 1]] = [newFields[index - 1], newFields[index]];
        } else if (direction === 'down' && index < newFields.length - 1) {
            [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
        }
        setFields(newFields);
    };

    const handleSave = async () => {
        if (!formName.trim()) {
            alert("Please give your form a name.");
            return;
        }
        setIsSaving(true);
        try {
            const response = await fetch('http://localhost:8081/api/forms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formName,
                    schema: fields
                })
            });

            if (response.ok) {
                alert('Form saved successfully!');
            } else {
                alert('Failed to save form');
            }
        } catch (error) {
            console.error(error);
            alert('Error saving form');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f4f4f4] text-gray-800 font-sans flex flex-col">
            {/* Header */}
            <header className="bg-white border-b-4 border-[#D41C2C] px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-serif font-bold text-[#D41C2C] tracking-tight">Form Designer</h1>
                    <div className="h-6 w-px bg-gray-300"></div>
                    <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="text-xl font-bold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[#D41C2C] focus:outline-none px-2 py-1 transition-colors"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setPreviewMode(!previewMode)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-bold uppercase tracking-wide transition-colors ${previewMode ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        {previewMode ? <Edit2 size={16} /> : <Eye size={16} />}
                        {previewMode ? 'Edit Mode' : 'Preview'}
                    </button>
                    <div className="h-6 w-px bg-gray-300"></div>
                    <Link href="/" className="text-sm font-bold text-gray-600 hover:text-[#D41C2C] transition-colors uppercase tracking-wide">
                        Back to Home
                    </Link>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-[#D41C2C] hover:bg-[#B81926] text-white px-4 py-2 rounded-sm text-sm font-bold shadow-sm flex items-center gap-2 uppercase tracking-wide disabled:opacity-50"
                    >
                        <Save size={16} />
                        {isSaving ? 'Saving...' : 'Save Form'}
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Palette (Toolbox) - Hidden in Preview Mode */}
                {!previewMode && (
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white p-5 rounded-sm shadow-md border border-gray-200">
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Component Palette</h2>
                            <div className="grid grid-cols-1 gap-2">
                                <PaletteButton icon={<FileText size={18} />} label="Text Input" onClick={() => addField('text')} color="blue" />
                                <PaletteButton icon={<Hash size={18} />} label="Number Input" onClick={() => addField('number')} color="green" />
                                <PaletteButton icon={<Calendar size={18} />} label="Date Picker" onClick={() => addField('date')} color="purple" />
                                <PaletteButton icon={<List size={18} />} label="Dropdown Select" onClick={() => addField('select')} color="orange" />
                                <PaletteButton icon={<CheckSquare size={18} />} label="Checkbox" onClick={() => addField('checkbox')} color="teal" />
                            </div>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-sm text-xs text-blue-800 leading-relaxed">
                            <strong>Tip:</strong> Click components to add them to the canvas. In the canvas, you can reorder fields using the arrow buttons.
                        </div>
                    </div>
                )}

                {/* Canvas / Preview Area */}
                <div className={previewMode ? "lg:col-span-4 max-w-3xl mx-auto w-full" : "lg:col-span-3"}>
                    <div className="bg-white min-h-[600px] rounded-sm shadow-md border border-gray-200 flex flex-col">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-700 font-serif">{previewMode ? 'Live Preview' : 'Form Canvas'}</h2>
                            <span className="text-xs text-gray-500 font-mono bg-white px-2 py-1 rounded-full border border-gray-200">{fields.length} Fields</span>
                        </div>

                        <div className="p-8 flex-1 space-y-6 bg-white/50">
                            {fields.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-sm py-20">
                                    <Plus size={48} className="mb-4 opacity-20" />
                                    <p className="font-medium">Form is empty</p>
                                    <p className="text-sm">Add fields from the palette</p>
                                </div>
                            ) : (
                                fields.map((field, index) => (
                                    <div key={field.id} className={`group relative transition-all ${!previewMode ? 'bg-white border border-gray-200 p-5 rounded-sm shadow-sm hover:border-[#D41C2C]/50' : ''}`}>

                                        {/* Edit Controls (Only visible in Edit Mode) */}
                                        {!previewMode && (
                                            <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-3">
                                                <div className="flex items-center gap-2">
                                                    <GripVertical size={16} className="text-gray-300 cursor-move" />
                                                    <span className="text-xs font-bold text-gray-400 uppercase">{field.type} Field</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => moveField(index, 'up')} disabled={index === 0} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"><ArrowUp size={14} /></button>
                                                    <button onClick={() => moveField(index, 'down')} disabled={index === fields.length - 1} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"><ArrowDown size={14} /></button>
                                                    <div className="h-4 w-px bg-gray-200 mx-1"></div>
                                                    <button onClick={() => removeField(field.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Field Render Logic */}
                                        <div className={!previewMode ? "pl-2" : ""}>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5 cursor-pointer">
                                                {previewMode ? field.label : (
                                                    <input
                                                        type="text"
                                                        value={field.label}
                                                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                                                        className="hover:bg-gray-50 focus:bg-white border-b border-transparent focus:border-[#D41C2C] focus:outline-none transition-colors"
                                                    />
                                                )}
                                                <span className="text-red-500 ml-1">{field.required && '*'}</span>
                                            </label>

                                            {/* Preview of the Input Element */}
                                            {field.type === 'text' && (
                                                <input type="text" placeholder="Text answer" className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#D41C2C] focus:ring-1 focus:ring-[#D41C2C] disabled:bg-gray-50" disabled />
                                            )}
                                            {field.type === 'number' && (
                                                <input type="number" placeholder="0" className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#D41C2C] focus:ring-1 focus:ring-[#D41C2C] disabled:bg-gray-50" disabled />
                                            )}
                                            {field.type === 'date' && (
                                                <div className="relative">
                                                    <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#D41C2C] focus:ring-1 focus:ring-[#D41C2C] disabled:bg-gray-50" disabled />
                                                    <Calendar size={16} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
                                                </div>
                                            )}
                                            {field.type === 'select' && (
                                                <div>
                                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#D41C2C] disabled:bg-gray-50 appearance-none bg-white" disabled>
                                                        <option>Select an option...</option>
                                                        {field.options?.map((opt, i) => <option key={i}>{opt}</option>)}
                                                    </select>
                                                    {!previewMode && (
                                                        <div className="mt-2 pl-1">
                                                            <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">Options (Comma separated)</div>
                                                            <input
                                                                type="text"
                                                                className="w-full text-xs p-1 border border-gray-200 rounded-sm"
                                                                value={field.options?.join(', ')}
                                                                onChange={(e) => updateField(field.id, { options: e.target.value.split(',').map(s => s.trim()) })}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {field.type === 'checkbox' && (
                                                <div className="flex items-center gap-2">
                                                    <input type="checkbox" className="w-4 h-4 text-[#D41C2C] border-gray-300 rounded focus:ring-[#D41C2C]" disabled />
                                                    <span className="text-sm text-gray-600">Yes, confirm this selection</span>
                                                </div>
                                            )}

                                            {/* Configuration Footer (Only Edit Mode) */}
                                            {!previewMode && (
                                                <div className="mt-4 pt-3 border-t border-gray-100 flex gap-4 text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-500 font-bold uppercase">Variable:</span>
                                                        <input
                                                            type="text"
                                                            value={field.key}
                                                            onChange={(e) => updateField(field.id, { key: e.target.value })}
                                                            className="bg-gray-50 border border-gray-200 px-1 rounded-sm font-mono text-gray-700 w-32 focus:outline-none focus:border-blue-400"
                                                        />
                                                    </div>
                                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                                        <input
                                                            type="checkbox"
                                                            checked={field.required}
                                                            onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                                            className="rounded"
                                                        />
                                                        <span className="text-gray-600">Required</span>
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function PaletteButton({ icon, label, onClick, color }: any) {
    const colorClasses: any = {
        blue: 'bg-blue-100 text-blue-600 group-hover:bg-[#D41C2C] group-hover:text-white',
        green: 'bg-green-100 text-green-600 group-hover:bg-[#D41C2C] group-hover:text-white',
        purple: 'bg-purple-100 text-purple-600 group-hover:bg-[#D41C2C] group-hover:text-white',
        orange: 'bg-orange-100 text-orange-600 group-hover:bg-[#D41C2C] group-hover:text-white',
        teal: 'bg-teal-100 text-teal-600 group-hover:bg-[#D41C2C] group-hover:text-white',
    };

    return (
        <button onClick={onClick} className="flex items-center gap-3 p-3 border border-gray-200 rounded-sm hover:bg-gray-50 hover:border-[#D41C2C] transition-all text-left group w-full">
            <div className={`p-2 rounded-sm transition-colors ${colorClasses[color]}`}>
                {icon}
            </div>
            <div className="font-bold text-gray-700 text-sm group-hover:text-[#D41C2C]">{label}</div>
            <Plus size={14} className="ml-auto text-gray-300 group-hover:text-[#D41C2C]" />
        </button>
    );
}
