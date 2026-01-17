"use client";

import React, { useState } from 'react';
import { Plus, Save, Trash2, GripVertical, FileText, Calendar, Hash, CheckSquare, List, Eye, Edit2, Settings, X, AlertCircle, Copy, Home, Columns, Rows } from 'lucide-react';
import Link from 'next/link';

type FieldType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea' | 'email' | 'phone';

interface FormField {
    id: string;
    label: string;
    key: string;
    type: FieldType;
    required: boolean;
    placeholder?: string;
    helpText?: string;
    defaultValue?: string;
    options?: string[];
    width: 1 | 2 | 3 | 4; // Column span (1=25%, 2=50%, 3=75%, 4=100%)
}

interface FormRow {
    id: string;
    fields: FormField[];
}

export default function FormDesignerPage() {
    const [formName, setFormName] = useState('New Form');
    const [formDescription, setFormDescription] = useState('');
    const [rows, setRows] = useState<FormRow[]>([]);
    const [selectedField, setSelectedField] = useState<FormField | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [showFieldConfig, setShowFieldConfig] = useState(false);

    const fieldTemplates = [
        { type: 'text' as FieldType, icon: <FileText size={18} />, label: 'Text Input', color: 'blue', description: 'Single-line text' },
        { type: 'textarea' as FieldType, icon: <FileText size={18} />, label: 'Text Area', color: 'blue', description: 'Multi-line text' },
        { type: 'email' as FieldType, icon: <FileText size={18} />, label: 'Email', color: 'indigo', description: 'Email address' },
        { type: 'phone' as FieldType, icon: <Hash size={18} />, label: 'Phone', color: 'indigo', description: 'Phone number' },
        { type: 'number' as FieldType, icon: <Hash size={18} />, label: 'Number', color: 'green', description: 'Numeric input' },
        { type: 'date' as FieldType, icon: <Calendar size={18} />, label: 'Date', color: 'purple', description: 'Date picker' },
        { type: 'select' as FieldType, icon: <List size={18} />, label: 'Dropdown', color: 'orange', description: 'Select from options' },
        { type: 'checkbox' as FieldType, icon: <CheckSquare size={18} />, label: 'Checkbox', color: 'teal', description: 'Yes/No toggle' },
    ];

    const addRow = () => {
        const newRow: FormRow = {
            id: Math.random().toString(36).substr(2, 9),
            fields: []
        };
        setRows([...rows, newRow]);
    };

    const addFieldToRow = (rowId: string, type: FieldType) => {
        const template = fieldTemplates.find(t => t.type === type);
        const newField: FormField = {
            id: Math.random().toString(36).substr(2, 9),
            label: `${template?.label || 'New Field'}`,
            key: `field_${Date.now()}`,
            type,
            required: false,
            placeholder: '',
            helpText: '',
            options: type === 'select' ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
            width: 4 // Default to full width
        };

        setRows(rows.map(row => {
            if (row.id === rowId) {
                return { ...row, fields: [...row.fields, newField] };
            }
            return row;
        }));

        setSelectedField(newField);
        setShowFieldConfig(true);
    };

    const updateField = (fieldId: string, updates: Partial<FormField>) => {
        setRows(rows.map(row => ({
            ...row,
            fields: row.fields.map(f => {
                if (f.id === fieldId) {
                    const updated = { ...f, ...updates };
                    if (selectedField?.id === fieldId) setSelectedField(updated);
                    return updated;
                }
                return f;
            })
        })));
    };

    const removeField = (rowId: string, fieldId: string) => {
        setRows(rows.map(row => {
            if (row.id === rowId) {
                return { ...row, fields: row.fields.filter(f => f.id !== fieldId) };
            }
            return row;
        }));
        if (selectedField?.id === fieldId) {
            setSelectedField(null);
            setShowFieldConfig(false);
        }
    };

    const removeRow = (rowId: string) => {
        setRows(rows.filter(r => r.id !== rowId));
    };

    const duplicateField = (rowId: string, field: FormField) => {
        const newField = {
            ...field,
            id: Math.random().toString(36).substr(2, 9),
            key: `${field.key}_copy`,
            label: `${field.label} (Copy)`
        };
        setRows(rows.map(row => {
            if (row.id === rowId) {
                return { ...row, fields: [...row.fields, newField] };
            }
            return row;
        }));
    };

    const handleSave = async () => {
        if (!formName.trim()) {
            alert("Please give your form a name.");
            return;
        }

        // Flatten rows into a single field array for backend compatibility
        const allFields = rows.flatMap(row => row.fields);

        setIsSaving(true);
        try {
            const response = await fetch('http://localhost:8081/api/forms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formName,
                    schema: allFields
                })
            });

            if (response.ok) {
                alert('✓ Form saved successfully!');
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

    const totalFields = rows.reduce((sum, row) => sum + row.fields.length, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 font-sans flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm sticky top-0 z-20">
                <div className="max-w-[1800px] mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-8 bg-[#D41C2C] rounded-full"></div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">Form Designer</h1>
                                <p className="text-xs text-gray-500">Enterprise Form Builder</p>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-gray-200"></div>
                        <div className="flex flex-col gap-1">
                            <input
                                type="text"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                className="text-base font-bold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[#D41C2C] focus:outline-none px-2 py-0.5 transition-colors"
                                placeholder="Form Name"
                            />
                            <input
                                type="text"
                                value={formDescription}
                                onChange={(e) => setFormDescription(e.target.value)}
                                className="text-xs text-gray-600 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[#D41C2C] focus:outline-none px-2 py-0.5 transition-colors"
                                placeholder="Add description (optional)"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full font-mono">
                            {totalFields} {totalFields === 1 ? 'field' : 'fields'} • {rows.length} {rows.length === 1 ? 'row' : 'rows'}
                        </div>
                        <button
                            onClick={() => setPreviewMode(!previewMode)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${previewMode ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            {previewMode ? <><Edit2 size={16} /> Edit</> : <><Eye size={16} /> Preview</>}
                        </button>
                        <Link href="/" className="text-sm font-semibold text-gray-600 hover:text-[#D41C2C] transition-colors flex items-center gap-1.5">
                            <Home size={16} /> Home
                        </Link>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-[#D41C2C] hover:bg-[#B81926] text-white px-6 py-2 rounded-md text-sm font-bold shadow-sm flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save size={16} />
                            {isSaving ? 'Saving...' : 'Save Form'}
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-[1800px] w-full mx-auto p-6 grid grid-cols-12 gap-6">

                {/* Component Palette */}
                {!previewMode && (
                    <div className="col-span-3 space-y-4">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-3 border-b border-gray-200">
                                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Field Components</h2>
                            </div>
                            <div className="p-3 space-y-1.5">
                                {fieldTemplates.map((template) => (
                                    <div
                                        key={template.type}
                                        draggable
                                        className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-[#D41C2C] hover:bg-red-50/30 transition-all cursor-move group"
                                    >
                                        <div className={`p-2 rounded-md bg-${template.color}-100 text-${template.color}-600 group-hover:bg-[#D41C2C] group-hover:text-white transition-colors`}>
                                            {template.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-gray-800 text-sm group-hover:text-[#D41C2C] transition-colors">{template.label}</div>
                                            <div className="text-xs text-gray-500">{template.description}</div>
                                        </div>
                                        <GripVertical size={14} className="text-gray-300 group-hover:text-[#D41C2C] transition-colors flex-shrink-0" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="text-xs text-blue-900 leading-relaxed">
                                    <strong className="font-bold">Pro Tip:</strong> Drag fields from the palette into rows. Click fields to configure width, validation, and more.
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Canvas */}
                <div className={previewMode ? "col-span-12 max-w-4xl mx-auto w-full" : "col-span-6"}>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-[700px] flex flex-col">
                        <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-base font-bold text-gray-800">{previewMode ? 'Live Preview' : 'Form Canvas'}</h2>
                                    <p className="text-xs text-gray-500 mt-0.5">{previewMode ? 'How your form will appear to users' : 'Build your form layout with rows and columns'}</p>
                                </div>
                                {!previewMode && (
                                    <button
                                        onClick={addRow}
                                        className="flex items-center gap-2 bg-[#D41C2C] hover:bg-[#B81926] text-white px-4 py-2 rounded-md text-sm font-semibold transition-all"
                                    >
                                        <Plus size={16} /> Add Row
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="p-6 flex-1 space-y-4 bg-gradient-to-br from-white to-gray-50/30">
                            {rows.length === 0 ? (
                                <div className="h-[500px] flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded-xl bg-white/50">
                                    <div className="bg-gray-100 p-6 rounded-full mb-4">
                                        <Rows size={48} className="opacity-40" />
                                    </div>
                                    <p className="font-semibold text-lg text-gray-600">No rows yet</p>
                                    <p className="text-sm text-gray-500 mt-1 mb-4">Click "Add Row" to start building your form</p>
                                    <button
                                        onClick={addRow}
                                        className="flex items-center gap-2 bg-[#D41C2C] hover:bg-[#B81926] text-white px-6 py-3 rounded-md text-sm font-semibold transition-all"
                                    >
                                        <Plus size={16} /> Add First Row
                                    </button>
                                </div>
                            ) : (
                                rows.map((row, rowIndex) => (
                                    <div key={row.id} className="bg-white border-2 border-gray-200 rounded-lg p-4 group hover:border-gray-300 transition-all">
                                        {/* Row Header */}
                                        {!previewMode && (
                                            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                                                <div className="flex items-center gap-2">
                                                    <Rows size={14} className="text-gray-400" />
                                                    <span className="text-xs font-bold text-gray-500 uppercase">Row {rowIndex + 1}</span>
                                                    <span className="text-xs text-gray-400">({row.fields.length} {row.fields.length === 1 ? 'field' : 'fields'})</span>
                                                </div>
                                                <button
                                                    onClick={() => removeRow(row.id)}
                                                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}

                                        {/* Fields in Row */}
                                        <div className="grid grid-cols-4 gap-3">
                                            {row.fields.map((field) => (
                                                <div
                                                    key={field.id}
                                                    onClick={() => {
                                                        if (!previewMode) {
                                                            setSelectedField(field);
                                                            setShowFieldConfig(true);
                                                        }
                                                    }}
                                                    className={`${!previewMode ? 'cursor-pointer' : ''} ${field.width === 1 ? 'col-span-1' :
                                                            field.width === 2 ? 'col-span-2' :
                                                                field.width === 3 ? 'col-span-3' :
                                                                    'col-span-4'
                                                        }`}
                                                >
                                                    <div className={`h-full ${!previewMode
                                                            ? `border-2 rounded-lg p-3 transition-all ${selectedField?.id === field.id
                                                                ? 'border-[#D41C2C] bg-red-50/30 shadow-md'
                                                                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                                            }`
                                                            : ''
                                                        }`}>
                                                        {/* Field Controls */}
                                                        {!previewMode && (
                                                            <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100">
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-xs font-bold text-gray-400 uppercase">{field.type}</span>
                                                                    {field.required && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-semibold">*</span>}
                                                                </div>
                                                                <div className="flex items-center gap-0.5">
                                                                    <button onClick={(e) => { e.stopPropagation(); duplicateField(row.id, field); }} className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Copy size={12} /></button>
                                                                    <button onClick={(e) => { e.stopPropagation(); removeField(row.id, field.id); }} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={12} /></button>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Field Render */}
                                                        <div>
                                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                                {field.label}
                                                                {field.required && <span className="text-red-500 ml-1">*</span>}
                                                            </label>
                                                            {field.helpText && <p className="text-xs text-gray-500 mb-2">{field.helpText}</p>}

                                                            {(field.type === 'text' || field.type === 'email' || field.type === 'phone') && (
                                                                <input
                                                                    type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
                                                                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#D41C2C] focus:ring-2 focus:ring-red-100 disabled:bg-gray-50 transition-all"
                                                                    disabled={!previewMode}
                                                                />
                                                            )}
                                                            {field.type === 'textarea' && (
                                                                <textarea
                                                                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                                                                    rows={3}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#D41C2C] focus:ring-2 focus:ring-red-100 disabled:bg-gray-50 resize-none transition-all"
                                                                    disabled={!previewMode}
                                                                />
                                                            )}
                                                            {field.type === 'number' && (
                                                                <input
                                                                    type="number"
                                                                    placeholder={field.placeholder || "0"}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#D41C2C] focus:ring-2 focus:ring-red-100 disabled:bg-gray-50 transition-all"
                                                                    disabled={!previewMode}
                                                                />
                                                            )}
                                                            {field.type === 'date' && (
                                                                <input
                                                                    type="date"
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#D41C2C] focus:ring-2 focus:ring-red-100 disabled:bg-gray-50 transition-all"
                                                                    disabled={!previewMode}
                                                                />
                                                            )}
                                                            {field.type === 'select' && (
                                                                <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#D41C2C] focus:ring-2 focus:ring-red-100 disabled:bg-gray-50 appearance-none bg-white transition-all" disabled={!previewMode}>
                                                                    <option value="">Select...</option>
                                                                    {field.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                                                                </select>
                                                            )}
                                                            {field.type === 'checkbox' && (
                                                                <div className="flex items-center gap-2">
                                                                    <input type="checkbox" className="w-4 h-4 text-[#D41C2C] border-gray-300 rounded focus:ring-[#D41C2C]" disabled={!previewMode} />
                                                                    <span className="text-sm text-gray-700">{field.placeholder || 'Check to confirm'}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Add Field to Row Button */}
                                            {!previewMode && (
                                                <div className="col-span-4">
                                                    <div className="relative group/add">
                                                        <button
                                                            onClick={() => {
                                                                const menu = document.getElementById(`add-menu-${row.id}`);
                                                                if (menu) menu.classList.toggle('hidden');
                                                            }}
                                                            className="w-full border-2 border-dashed border-gray-300 hover:border-[#D41C2C] rounded-lg p-3 text-sm text-gray-500 hover:text-[#D41C2C] font-semibold transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <Plus size={16} /> Add Field to Row
                                                        </button>
                                                        <div id={`add-menu-${row.id}`} className="hidden absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 grid grid-cols-2 gap-1 z-10 w-full">
                                                            {fieldTemplates.map((template) => (
                                                                <button
                                                                    key={template.type}
                                                                    onClick={() => {
                                                                        addFieldToRow(row.id, template.type);
                                                                        const menu = document.getElementById(`add-menu-${row.id}`);
                                                                        if (menu) menu.classList.add('hidden');
                                                                    }}
                                                                    className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded text-left text-xs"
                                                                >
                                                                    {template.icon}
                                                                    <span>{template.label}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Field Configuration Panel */}
                {!previewMode && showFieldConfig && selectedField && (
                    <div className="col-span-3 space-y-4">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-24">
                            <div className="bg-gradient-to-r from-[#D41C2C] to-[#B81926] px-4 py-3 flex justify-between items-center">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Field Settings</h3>
                                <button onClick={() => setShowFieldConfig(false)} className="text-white hover:bg-white/20 p-1 rounded transition-colors">
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                                {/* Width Control */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Field Width</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[1, 2, 3, 4].map((width) => (
                                            <button
                                                key={width}
                                                onClick={() => updateField(selectedField.id, { width: width as 1 | 2 | 3 | 4 })}
                                                className={`p-2 border-2 rounded-md text-xs font-semibold transition-all ${selectedField.width === width
                                                        ? 'border-[#D41C2C] bg-red-50 text-[#D41C2C]'
                                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                                    }`}
                                            >
                                                {width === 1 ? '25%' : width === 2 ? '50%' : width === 3 ? '75%' : '100%'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Basic Settings */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Label</label>
                                    <input
                                        type="text"
                                        value={selectedField.label}
                                        onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#D41C2C] focus:ring-1 focus:ring-red-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Variable Key</label>
                                    <input
                                        type="text"
                                        value={selectedField.key}
                                        onChange={(e) => updateField(selectedField.id, { key: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:border-[#D41C2C] focus:ring-1 focus:ring-red-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Placeholder</label>
                                    <input
                                        type="text"
                                        value={selectedField.placeholder || ''}
                                        onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#D41C2C] focus:ring-1 focus:ring-red-100"
                                        placeholder="Enter placeholder text"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Help Text</label>
                                    <textarea
                                        value={selectedField.helpText || ''}
                                        onChange={(e) => updateField(selectedField.id, { helpText: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#D41C2C] focus:ring-1 focus:ring-red-100 resize-none"
                                        rows={2}
                                        placeholder="Add helpful description"
                                    />
                                </div>

                                {/* Options for Select */}
                                {selectedField.type === 'select' && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Options</label>
                                        <textarea
                                            value={selectedField.options?.join('\n') || ''}
                                            onChange={(e) => updateField(selectedField.id, { options: e.target.value.split('\n').filter(o => o.trim()) })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:border-[#D41C2C] focus:ring-1 focus:ring-red-100 resize-none"
                                            rows={5}
                                            placeholder="One option per line"
                                        />
                                    </div>
                                )}

                                {/* Validation */}
                                <div className="pt-4 border-t border-gray-200">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedField.required}
                                            onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                                            className="w-4 h-4 text-[#D41C2C] border-gray-300 rounded focus:ring-[#D41C2C]"
                                        />
                                        <span className="text-sm font-semibold text-gray-700">Required Field</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
