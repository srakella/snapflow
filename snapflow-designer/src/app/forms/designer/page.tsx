"use client";

import React, { useState } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    useSortable,
    verticalListSortingStrategy,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    Save, Home, Layout, Eye, FileText, X, Trash2, GripVertical,
    Type, Hash, Calendar, Mail, Phone, List, CheckSquare, AlignLeft, Settings2, Plus,
    User, Paperclip, PenTool, Sparkles, Filter, Shield, Activity
} from 'lucide-react';
import Link from 'next/link';

// --- Types ---

type FieldType = 'text' | 'number' | 'date' | 'email' | 'phone' | 'select' | 'checkbox' | 'textarea' | 'people' | 'file' | 'signature';

interface ValidationRules {
    required?: boolean;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    customMessage?: string;
}

interface LogicRules {
    visibility?: string; // e.g., "status == 'Active'"
    disabled?: string;
}

interface DataConfig {
    options?: string[]; // For static dropdowns
    dataSource?: 'static' | 'api';
    apiEndpoint?: string;
    parentFieldKey?: string; // For cascading
}

interface FormField {
    id: string;
    type: FieldType;
    label: string;
    key: string;
    placeholder?: string;
    helpText?: string;
    width: 1 | 2 | 3 | 4;
    validation: ValidationRules;
    logic: LogicRules;
    data: DataConfig;
}

interface FormRow {
    id: string;
    fields: FormField[];
}

// --- Templates ---

const FIELD_TEMPLATES = [
    { type: 'text' as FieldType, icon: Type, label: 'Text', color: 'bg-blue-500' },
    { type: 'textarea' as FieldType, icon: AlignLeft, label: 'Area', color: 'bg-indigo-500' },
    { type: 'number' as FieldType, icon: Hash, label: 'Number', color: 'bg-green-500' },
    { type: 'select' as FieldType, icon: List, label: 'Select', color: 'bg-yellow-500' },
    { type: 'checkbox' as FieldType, icon: CheckSquare, label: 'Check', color: 'bg-teal-500' },
    { type: 'date' as FieldType, icon: Calendar, label: 'Date', color: 'bg-orange-500' },
    { type: 'people' as FieldType, icon: User, label: 'People', color: 'bg-pink-600' },
    { type: 'file' as FieldType, icon: Paperclip, label: 'File', color: 'bg-slate-600' },
    { type: 'signature' as FieldType, icon: PenTool, label: 'Sign', color: 'bg-violet-600' },
];

// --- Components ---

function SortableField({ field, rowId, isSelected, onClick, onDelete }: {
    field: FormField;
    rowId: string;
    isSelected: boolean;
    onClick: () => void;
    onDelete: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
    const template = FIELD_TEMPLATES.find(t => t.type === field.type);
    const Icon = template?.icon || Type;

    const widthClass = field.width === 1 ? 'col-span-1' : field.width === 2 ? 'col-span-2' : field.width === 3 ? 'col-span-3' : 'col-span-4';

    return (
        <div ref={setNodeRef} style={style} onClick={onClick} className={`${widthClass}`}>
            <div className={`group h-full bg-white border-2 rounded-lg p-3 cursor-pointer transition-all ${isSelected ? 'border-[#D41C2C] shadow-lg ring-2 ring-[#D41C2C]/20 relative z-10' : 'border-slate-200 hover:border-slate-300'
                }`}>
                <div className="flex items-start gap-2">
                    <div {...attributes} {...listeners} className="cursor-move mt-0.5 text-slate-400 hover:text-[#D41C2C]">
                        <GripVertical size={16} />
                    </div>
                    <div className={`p-1.5 rounded ${template?.color} flex-shrink-0`}>
                        <Icon className="text-white" size={14} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-900 truncate">
                            {field.label}
                            {field.validation.required && <span className="text-[#D41C2C]">*</span>}
                            {field.logic.visibility && <span className="text-[10px] ml-2 text-amber-600 bg-amber-50 px-1 rounded border border-amber-200">Logic</span>}
                        </div>
                        <div className="text-xs text-slate-500 font-mono truncate">{field.key}</div>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 rounded"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}

function SortableRow({ row, selectedField, onSelectField, onDeleteField, onAddField, onDeleteRow }: {
    row: FormRow;
    selectedField: FormField | null;
    onSelectField: (field: FormField) => void;
    onDeleteField: (rowId: string, fieldId: string) => void;
    onAddField: (rowId: string, type: FieldType) => void;
    onDeleteRow: (rowId: string) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

    return (
        <div ref={setNodeRef} style={style} className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4 group hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div {...attributes} {...listeners} className="cursor-move text-slate-400 hover:text-[#D41C2C]">
                        <GripVertical size={18} />
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase">Row • {row.fields.length} fields</span>
                </div>
                <button onClick={() => onDeleteRow(row.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all">
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-3">
                <SortableContext items={row.fields.map(f => f.id)} strategy={horizontalListSortingStrategy}>
                    {row.fields.map((field) => (
                        <SortableField
                            key={field.id}
                            field={field}
                            rowId={row.id}
                            isSelected={selectedField?.id === field.id}
                            onClick={() => onSelectField(field)}
                            onDelete={() => onDeleteField(row.id, field.id)}
                        />
                    ))}
                </SortableContext>
            </div>

            {/* Quick Add row of small icons */}
            <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                {FIELD_TEMPLATES.map((template) => {
                    const Icon = template.icon;
                    return (
                        <button
                            key={template.type}
                            onClick={() => onAddField(row.id, template.type)}
                            className="flex-shrink-0 flex items-center gap-1 px-2 py-1.5 bg-white border border-slate-200 rounded hover:border-[#D41C2C] hover:bg-red-50 transition-all text-[10px] font-bold text-slate-600 hover:text-[#D41C2C]"
                            title={`Add ${template.label}`}
                        >
                            <Icon size={12} />
                            {template.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// --- Main Designer Component ---

export default function EnterpriseFormDesigner() {
    const [formName, setFormName] = useState('Untitled Form');
    const [rows, setRows] = useState<FormRow[]>([]);
    const [selectedField, setSelectedField] = useState<FormField | null>(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [settingsTab, setSettingsTab] = useState<'general' | 'validation' | 'logic' | 'data'>('general');
    const [isAIGenerating, setIsAIGenerating] = useState(false);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    // --- Actions ---

    const addRow = () => {
        setRows([...rows, { id: `row_${Date.now()}`, fields: [] }]);
    };

    const addFieldToRow = (rowId: string, type: FieldType) => {
        const template = FIELD_TEMPLATES.find(t => t.type === type);
        const newField: FormField = {
            id: `field_${Date.now()}`,
            type,
            label: template?.label || 'Field',
            key: `field_${Date.now()}`,
            width: 2,
            validation: { required: false },
            logic: {},
            data: { options: ['Option 1', 'Option 2'], dataSource: 'static' }
        };
        setRows(rows.map(row => row.id === rowId ? { ...row, fields: [...row.fields, newField] } : row));
        setSelectedField(newField);
        setSettingsTab('general');
    };

    const updateField = (fieldId: string, updates: Partial<FormField> | { validation: Partial<ValidationRules> } | { logic: Partial<LogicRules> } | { data: Partial<DataConfig> }) => {
        setRows(rows.map(row => ({
            ...row,
            fields: row.fields.map(f => {
                if (f.id === fieldId) {
                    // Deep merge logic
                    let updated = { ...f };
                    if ('validation' in updates) updated.validation = { ...f.validation, ...updates.validation };
                    else if ('logic' in updates) updated.logic = { ...f.logic, ...updates.logic };
                    else if ('data' in updates) updated.data = { ...f.data, ...updates.data };
                    else updated = { ...f, ...updates };

                    if (selectedField?.id === fieldId) setSelectedField(updated);
                    return updated;
                }
                return f;
            })
        })));
    };

    const deleteField = (rowId: string, fieldId: string) => {
        setRows(rows.map(row => row.id === rowId ? { ...row, fields: row.fields.filter(f => f.id !== fieldId) } : row));
        if (selectedField?.id === fieldId) setSelectedField(null);
    };

    const deleteRow = (rowId: string) => {
        setRows(rows.filter(r => r.id !== rowId));
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;
        const activeId = active.id as string;
        const overId = over.id as string;
        const activeRow = rows.find(row => row.fields.some(f => f.id === activeId));
        const overRow = rows.find(row => row.fields.some(f => f.id === overId) || row.id === overId);
        if (!activeRow || !overRow || activeRow.id === overRow.id) return;

        const activeField = activeRow.fields.find(f => f.id === activeId);
        if (!activeField) return;

        setRows(rows.map(row => {
            if (row.id === activeRow.id) {
                return { ...row, fields: row.fields.filter(f => f.id !== activeId) };
            } else if (row.id === overRow.id) {
                const overFieldIndex = row.fields.findIndex(f => f.id === overId);
                const newFields = [...row.fields];
                if (overFieldIndex >= 0) newFields.splice(overFieldIndex, 0, activeField);
                else newFields.push(activeField);
                return { ...row, fields: newFields };
            }
            return row;
        }));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const isRowDrag = rows.some(r => r.id === active.id);
            if (isRowDrag) {
                setRows((items) => {
                    const oldIndex = items.findIndex((item) => item.id === active.id);
                    const newIndex = items.findIndex((item) => item.id === over.id);
                    return arrayMove(items, oldIndex, newIndex);
                });
            } else {
                const activeRow = rows.find(row => row.fields.some(f => f.id === active.id));
                const overRow = rows.find(row => row.fields.some(f => f.id === over.id));
                if (activeRow && overRow && activeRow.id === overRow.id) {
                    setRows(rows.map(row => {
                        if (row.id === activeRow.id) {
                            const oldIndex = row.fields.findIndex(f => f.id === active.id);
                            const newIndex = row.fields.findIndex(f => f.id === over.id);
                            return { ...row, fields: arrayMove(row.fields, oldIndex, newIndex) };
                        }
                        return row;
                    }));
                }
            }
        }
        setActiveId(null);
    };

    const handleSave = async () => {
        if (!formName.trim()) { alert("Please name your form."); return; }
        setIsSaving(true);
        try {
            const allFields = rows.flatMap(row => row.fields);
            const response = await fetch('http://localhost:8081/api/forms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: formName, schema: { rows: rows } }) // Saving raw rows structure now for better reload
            });
            if (response.ok) alert('✓ Form saved!');
            else alert('Failed to save');
        } catch (error) { alert('Error saving'); }
        finally { setIsSaving(false); }
    };

    const handleAIGenerate = () => {
        const userPrompt = prompt("✨ Describe the form you want to create:\n(e.g., 'Expense report with receipt upload and supervisor approval')");
        if (!userPrompt) return;

        setIsAIGenerating(true);
        // Mocking AI generation - normally this would call an LLM
        setTimeout(() => {
            setFormName("Expense Report");
            const newRows: FormRow[] = [
                { id: 'row1', fields: [{ id: 'f1', type: 'text', label: 'Employee Name', key: 'empName', width: 2, validation: { required: true }, logic: {}, data: {} }, { id: 'f2', type: 'date', label: 'Date', key: 'date', width: 2, validation: { required: true }, logic: {}, data: {} }] },
                { id: 'row2', fields: [{ id: 'f3', type: 'number', label: 'Amount', key: 'amount', width: 2, validation: { min: 0 }, logic: {}, data: {} }, { id: 'f4', type: 'select', label: 'Category', key: 'category', width: 2, validation: {}, logic: {}, data: { options: ['Travel', 'Meals', 'Supplies'], dataSource: 'static' } }] },
                { id: 'row3', fields: [{ id: 'f5', type: 'file', label: 'Receipt Upload', key: 'receipt', width: 4, validation: {}, logic: {}, data: {} }] },
                { id: 'row4', fields: [{ id: 'f6', type: 'people', label: 'Approver', key: 'approver', width: 4, validation: { required: true }, logic: {}, data: {} }] }
            ];
            setRows(newRows);
            setIsAIGenerating(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col">
            {/* Header */}
            <header className="bg-white/95 backdrop-blur-md border-b-4 border-[#D41C2C] sticky top-0 z-50 shadow-lg">
                <div className="max-w-[1920px] mx-auto px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="flex items-center gap-2 group">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-[#D41C2C] blur-sm opacity-50"></div>
                                    <div className="relative bg-gradient-to-br from-[#D41C2C] to-[#B81926] p-2 rounded-lg">
                                        <FileText className="text-white" size={22} strokeWidth={2.5} />
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-[#D41C2C]">SnapFlow Forms</h1>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Enterprise Builder v2.0</p>
                                </div>
                            </Link>
                            <div className="h-8 w-[1px] bg-gray-200"></div>
                            <input
                                type="text"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                className="text-base font-bold bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-[#D41C2C] focus:outline-none px-2 py-1 transition-colors"
                                placeholder="Untitled Form"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handleAIGenerate} className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-sm text-xs font-bold hover:bg-indigo-100 hover:shadow-md transition-all uppercase mr-2">
                                <Sparkles size={14} className={isAIGenerating ? "animate-spin" : ""} /> {isAIGenerating ? 'Generating...' : 'AI Magic'}
                            </button>
                            <button onClick={() => setPreviewMode(!previewMode)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold uppercase ${previewMode ? 'bg-[#D41C2C] text-white' : 'bg-gray-100 text-gray-700'}`}>
                                <Eye size={14} /> {previewMode ? 'Edit' : 'Preview'}
                            </button>
                            <Link href="/designer" className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-sm text-xs font-bold hover:bg-gray-200 uppercase">
                                <Layout size={14} /> Workflow
                            </Link>
                            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-1.5 bg-[#D41C2C] text-white px-4 py-1.5 rounded-sm text-xs font-bold hover:bg-[#B81926] uppercase">
                                <Save size={14} /> {isSaving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="flex-1 flex overflow-hidden">
                {/* Canvas */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6 max-w-7xl mx-auto">
                        <div className="bg-white rounded-xl shadow-xl border-2 border-slate-200 min-h-[700px]">
                            <div className="bg-gradient-to-r from-slate-50 via-red-50 to-slate-50 px-6 py-4 border-b-2 border-slate-200 flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <Layout size={20} className="text-[#D41C2C]" /> Form Canvas
                                    </h2>
                                    <p className="text-xs text-slate-600">Drag fields between rows • Multi-column layouts • Enterprise validation</p>
                                </div>
                                <button onClick={addRow} className="flex items-center gap-2 bg-gradient-to-r from-[#D41C2C] to-[#B81926] text-white px-4 py-2 rounded-lg text-sm font-bold hover:shadow-lg transition-all">
                                    <Plus size={16} /> Add Row
                                </button>
                            </div>

                            <div className="p-6">
                                {rows.length === 0 ? (
                                    <div className="h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl">
                                        <div className="bg-gradient-to-br from-red-100 to-orange-100 p-10 rounded-2xl mb-4">
                                            <Sparkles size={48} className="text-[#D41C2C]" />
                                        </div>
                                        <p className="font-bold text-xl text-slate-700 mb-2">Start from Scratch</p>
                                        <p className="text-sm text-slate-500 mb-6">Click "Add Row" to start building your form</p>
                                    </div>
                                ) : (
                                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={(e) => setActiveId(e.active.id as string)} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
                                        <SortableContext items={rows.map(r => r.id)} strategy={verticalListSortingStrategy}>
                                            <div className="space-y-4">
                                                {rows.map((row) => (
                                                    <SortableRow
                                                        key={row.id}
                                                        row={row}
                                                        selectedField={selectedField}
                                                        onSelectField={setSelectedField}
                                                        onDeleteField={deleteField}
                                                        onAddField={addFieldToRow}
                                                        onDeleteRow={deleteRow}
                                                    />
                                                ))}
                                            </div>
                                        </SortableContext>
                                    </DndContext>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Settings (Enhanced) */}
                {!previewMode && selectedField && (
                    <aside className="w-80 bg-white border-l-2 border-slate-200 flex-shrink-0 flex flex-col h-full shadow-2xl">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#D41C2C] to-[#B81926] px-4 py-4 flex justify-between items-center flex-shrink-0">
                            <div>
                                <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                                    <Settings2 size={16} />
                                    {selectedField.type} Settings
                                </h3>
                            </div>
                            <button onClick={() => setSelectedField(null)} className="text-white hover:bg-white/20 p-1.5 rounded transition-all">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 bg-gray-50">
                            {[
                                { id: 'general', icon: Settings2, label: 'General' },
                                { id: 'data', icon: Activity, label: 'Data', show: ['select', 'checkbox'].includes(selectedField.type) },
                                { id: 'validation', icon: Shield, label: 'Valid' },
                                { id: 'logic', icon: Filter, label: 'Logic' }
                            ].filter(t => t.show !== false).map((tab: any) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setSettingsTab(tab.id as any)}
                                    className={`flex-1 py-3 border-b-2 text-[10px] font-bold uppercase transition-all flex flex-col items-center gap-1 ${settingsTab === tab.id
                                        ? 'border-[#D41C2C] text-[#D41C2C] bg-white'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <tab.icon size={14} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="p-5 overflow-y-auto flex-1 space-y-5">
                            {/* GENERAL TAB */}
                            {settingsTab === 'general' && (
                                <>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Label</label>
                                        <input type="text" value={selectedField.label} onChange={(e) => updateField(selectedField.id, { label: e.target.value })} className="w-full px-3 py-2 border-2 border-slate-300 rounded text-sm focus:border-[#D41C2C] focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Variable Key</label>
                                        <input type="text" value={selectedField.key} onChange={(e) => updateField(selectedField.id, { key: e.target.value })} className="w-full px-3 py-2 border-2 border-slate-300 rounded text-sm font-mono focus:border-[#D41C2C] focus:outline-none bg-slate-50" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Width</label>
                                        <div className="grid grid-cols-4 gap-1.5">
                                            {[1, 2, 3, 4].map((w) => (
                                                <button
                                                    key={w}
                                                    onClick={() => updateField(selectedField.id, { width: w as any })}
                                                    className={`p-2 border-2 rounded text-xs font-bold transition-all ${selectedField.width === w ? 'border-[#D41C2C] bg-red-50 text-[#D41C2C]' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                                >
                                                    {w === 4 ? '100%' : `${w * 25}%`}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Placeholder</label>
                                        <input type="text" value={selectedField.placeholder || ''} onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })} className="w-full px-3 py-2 border-2 border-slate-300 rounded text-sm focus:border-[#D41C2C] focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Help Text</label>
                                        <textarea value={selectedField.helpText || ''} onChange={(e) => updateField(selectedField.id, { helpText: e.target.value })} className="w-full px-3 py-2 border-2 border-slate-300 rounded text-sm focus:border-[#D41C2C] focus:outline-none resize-none" rows={2} />
                                    </div>
                                </>
                            )}

                            {/* DATA TAB */}
                            {settingsTab === 'data' && (
                                <>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Source</label>
                                        <div className="flex bg-slate-100 p-1 rounded-lg">
                                            <button
                                                onClick={() => updateField(selectedField.id, { data: { dataSource: 'static' } })}
                                                className={`flex-1 py-1.5 text-xs font-bold rounded ${selectedField.data.dataSource === 'static' ? 'bg-white shadow text-[#D41C2C]' : 'text-slate-500'}`}
                                            >Static</button>
                                            <button
                                                onClick={() => updateField(selectedField.id, { data: { dataSource: 'api' } })}
                                                className={`flex-1 py-1.5 text-xs font-bold rounded ${selectedField.data.dataSource === 'api' ? 'bg-white shadow text-[#D41C2C]' : 'text-slate-500'}`}
                                            >API / Dynamic</button>
                                        </div>
                                    </div>

                                    {selectedField.data.dataSource === 'static' ? (
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Options (one per line)</label>
                                            <textarea
                                                value={selectedField.data.options?.join('\n') || ''}
                                                onChange={(e) => updateField(selectedField.id, { data: { options: e.target.value.split('\n') } })}
                                                className="w-full px-3 py-2 border-2 border-slate-300 rounded text-sm font-mono focus:border-[#D41C2C] focus:outline-none resize-none"
                                                rows={8}
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">API Endpoint</label>
                                                <input type="text" placeholder="https://api.example.com/options" value={selectedField.data.apiEndpoint || ''} onChange={(e) => updateField(selectedField.id, { data: { apiEndpoint: e.target.value } })} className="w-full px-3 py-2 border-2 border-slate-300 rounded text-sm font-mono focus:border-[#D41C2C] focus:outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Cascading: Parent Field Key</label>
                                                <input type="text" placeholder="e.g. country_field" value={selectedField.data.parentFieldKey || ''} onChange={(e) => updateField(selectedField.id, { data: { parentFieldKey: e.target.value } })} className="w-full px-3 py-2 border-2 border-slate-300 rounded text-sm font-mono focus:border-[#D41C2C] focus:outline-none" />
                                                <p className="text-[10px] text-slate-500 mt-1">If set, this field will refresh when the parent field changes.</p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* VALIDATION TAB */}
                            {settingsTab === 'validation' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200">
                                        <span className="text-sm font-bold text-slate-700">Required Field</span>
                                        <input type="checkbox" checked={selectedField.validation.required || false} onChange={(e) => updateField(selectedField.id, { validation: { required: e.target.checked } })} className="w-5 h-5 text-[#D41C2C] border-2 border-slate-300 rounded focus:ring-[#D41C2C]" />
                                    </div>

                                    {(selectedField.type === 'text' || selectedField.type === 'textarea') && (
                                        <>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Min Length</label>
                                                    <input type="number" value={selectedField.validation.minLength || ''} onChange={(e) => updateField(selectedField.id, { validation: { minLength: parseInt(e.target.value) } })} className="w-full px-2 py-2 border-2 border-slate-300 rounded text-sm focus:border-[#D41C2C] focus:outline-none" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Max Length</label>
                                                    <input type="number" value={selectedField.validation.maxLength || ''} onChange={(e) => updateField(selectedField.id, { validation: { maxLength: parseInt(e.target.value) } })} className="w-full px-2 py-2 border-2 border-slate-300 rounded text-sm focus:border-[#D41C2C] focus:outline-none" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Regex Pattern</label>
                                                <input type="text" placeholder="^A-Z+$" value={selectedField.validation.pattern || ''} onChange={(e) => updateField(selectedField.id, { validation: { pattern: e.target.value } })} className="w-full px-3 py-2 border-2 border-slate-300 rounded text-sm font-mono focus:border-[#D41C2C] focus:outline-none" />
                                            </div>
                                        </>
                                    )}

                                    {selectedField.type === 'number' && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Min Value</label>
                                                <input type="number" value={selectedField.validation.min || ''} onChange={(e) => updateField(selectedField.id, { validation: { min: parseInt(e.target.value) } })} className="w-full px-2 py-2 border-2 border-slate-300 rounded text-sm focus:border-[#D41C2C] focus:outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Max Value</label>
                                                <input type="number" value={selectedField.validation.max || ''} onChange={(e) => updateField(selectedField.id, { validation: { max: parseInt(e.target.value) } })} className="w-full px-2 py-2 border-2 border-slate-300 rounded text-sm focus:border-[#D41C2C] focus:outline-none" />
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Custom Error Message</label>
                                        <input type="text" value={selectedField.validation.customMessage || ''} onChange={(e) => updateField(selectedField.id, { validation: { customMessage: e.target.value } })} className="w-full px-3 py-2 border-2 border-slate-300 rounded text-sm focus:border-[#D41C2C] focus:outline-none" placeholder="Please check this field" />
                                    </div>
                                </div>
                            )}

                            {/* LOGIC TAB */}
                            {settingsTab === 'logic' && (
                                <div className="space-y-4">
                                    <div className="bg-amber-50 border border-amber-200 p-3 rounded text-xs text-amber-800">
                                        Conditions are evaluated at runtime. Support standard Javascript expressions.
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 flex items-center gap-2">
                                            <Eye size={12} /> Visibility Condition (Show if...)
                                        </label>
                                        <textarea
                                            value={selectedField.logic.visibility || ''}
                                            onChange={(e) => updateField(selectedField.id, { logic: { visibility: e.target.value } })}
                                            className="w-full px-3 py-2 border-2 border-slate-300 rounded text-sm font-mono focus:border-[#D41C2C] focus:outline-none resize-none"
                                            rows={3}
                                            placeholder="data.country == 'US' && data.age >= 18"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 flex items-center gap-2">
                                            <Shield size={12} /> Disable Condition (Disable if...)
                                        </label>
                                        <textarea
                                            value={selectedField.logic.disabled || ''}
                                            onChange={(e) => updateField(selectedField.id, { logic: { disabled: e.target.value } })}
                                            className="w-full px-3 py-2 border-2 border-slate-300 rounded text-sm font-mono focus:border-[#D41C2C] focus:outline-none resize-none"
                                            rows={3}
                                            placeholder="data.isReadOnly == true"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-slate-200 bg-slate-50 mt-auto">
                            <button
                                onClick={() => {
                                    const row = rows.find(r => r.fields.some(f => f.id === selectedField.id));
                                    if (row && confirm('Are you sure you want to delete this field?')) {
                                        deleteField(row.id, selectedField.id);
                                    }
                                }}
                                className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 p-2 rounded-lg font-bold text-sm transition-all border border-transparent hover:border-red-200 uppercase"
                            >
                                <Trash2 size={16} /> Delete Field
                            </button>
                        </div>
                    </aside>
                )}
            </main>
        </div>
    );
}
