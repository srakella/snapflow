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
    Type, Hash, Calendar, Mail, Phone, List, CheckSquare, AlignLeft, Settings2, Plus
} from 'lucide-react';
import Link from 'next/link';

type FieldType = 'text' | 'number' | 'date' | 'email' | 'phone' | 'select' | 'checkbox' | 'textarea';

interface FormField {
    id: string;
    type: FieldType;
    label: string;
    key: string;
    required: boolean;
    placeholder?: string;
    helpText?: string;
    options?: string[];
    width: 1 | 2 | 3 | 4; // 1=25%, 2=50%, 3=75%, 4=100%
}

interface FormRow {
    id: string;
    fields: FormField[];
}

const FIELD_TEMPLATES = [
    { type: 'text' as FieldType, icon: Type, label: 'Text', color: 'bg-blue-500' },
    { type: 'textarea' as FieldType, icon: AlignLeft, label: 'Area', color: 'bg-indigo-500' },
    { type: 'email' as FieldType, icon: Mail, label: 'Email', color: 'bg-purple-500' },
    { type: 'phone' as FieldType, icon: Phone, label: 'Phone', color: 'bg-pink-500' },
    { type: 'number' as FieldType, icon: Hash, label: 'Number', color: 'bg-green-500' },
    { type: 'date' as FieldType, icon: Calendar, label: 'Date', color: 'bg-orange-500' },
    { type: 'select' as FieldType, icon: List, label: 'Select', color: 'bg-yellow-500' },
    { type: 'checkbox' as FieldType, icon: CheckSquare, label: 'Check', color: 'bg-teal-500' },
];

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
            <div className={`group h-full bg-white border-2 rounded-lg p-3 cursor-pointer transition-all ${isSelected ? 'border-[#D41C2C] shadow-lg ring-2 ring-[#D41C2C]/20' : 'border-slate-200 hover:border-slate-300'
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
                            {field.label}{field.required && <span className="text-[#D41C2C]">*</span>}
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

            <div className="flex gap-2">
                {FIELD_TEMPLATES.slice(0, 4).map((template) => {
                    const Icon = template.icon;
                    return (
                        <button
                            key={template.type}
                            onClick={() => onAddField(row.id, template.type)}
                            className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-white border border-slate-200 rounded hover:border-[#D41C2C] hover:bg-red-50 transition-all text-xs font-semibold text-slate-600 hover:text-[#D41C2C]"
                        >
                            <Icon size={14} />
                            {template.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default function EnterpriseFormDesigner() {
    const [formName, setFormName] = useState('Untitled Form');
    const [rows, setRows] = useState<FormRow[]>([]);
    const [selectedField, setSelectedField] = useState<FormField | null>(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

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
            required: false,
            width: 2, // Default 50% width
            options: type === 'select' ? ['Option 1', 'Option 2'] : undefined,
        };
        setRows(rows.map(row => row.id === rowId ? { ...row, fields: [...row.fields, newField] } : row));
        setSelectedField(newField);
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

        // Find which row contains the active field
        const activeRow = rows.find(row => row.fields.some(f => f.id === activeId));
        const overRow = rows.find(row => row.fields.some(f => f.id === overId) || row.id === overId);

        if (!activeRow || !overRow) return;
        if (activeRow.id === overRow.id) return; // Same row, no need to move

        // Move field from one row to another
        const activeField = activeRow.fields.find(f => f.id === activeId);
        if (!activeField) return;

        setRows(rows.map(row => {
            if (row.id === activeRow.id) {
                return { ...row, fields: row.fields.filter(f => f.id !== activeId) };
            } else if (row.id === overRow.id) {
                const overFieldIndex = row.fields.findIndex(f => f.id === overId);
                const newFields = [...row.fields];
                if (overFieldIndex >= 0) {
                    newFields.splice(overFieldIndex, 0, activeField);
                } else {
                    newFields.push(activeField);
                }
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
                body: JSON.stringify({ name: formName, schema: allFields })
            });
            if (response.ok) alert('✓ Form saved!');
            else alert('Failed to save');
        } catch (error) {
            alert('Error saving');
        } finally {
            setIsSaving(false);
        }
    };

    const totalFields = rows.reduce((sum, row) => sum + row.fields.length, 0);

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
                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Enterprise Builder</p>
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
                            <div className="px-3 py-1.5 bg-slate-100 rounded-sm text-xs font-semibold text-slate-700">
                                <span className="text-[#D41C2C] font-bold">{totalFields}</span> fields
                            </div>
                            <button onClick={() => setPreviewMode(!previewMode)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold uppercase ${previewMode ? 'bg-[#D41C2C] text-white' : 'bg-gray-100 text-gray-700'}`}>
                                <Eye size={14} /> {previewMode ? 'Edit' : 'Preview'}
                            </button>
                            <Link href="/designer" className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-sm text-xs font-bold hover:bg-gray-200 uppercase">
                                <Layout size={14} /> Workflow
                            </Link>
                            <Link href="/" className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-sm text-xs font-bold hover:bg-gray-200 uppercase">
                                <Home size={14} /> Home
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
                {/* Compact Left Palette */}
                {!previewMode && (
                    <aside className="w-20 bg-white border-r-2 border-slate-200 flex-shrink-0">
                        <div className="p-2 space-y-2">
                            <div className="text-[10px] font-bold text-slate-400 uppercase text-center mb-3 mt-2">Fields</div>
                            {FIELD_TEMPLATES.map((template) => {
                                const Icon = template.icon;
                                return (
                                    <div
                                        key={template.type}
                                        draggable
                                        onDragStart={(e) => {
                                            e.dataTransfer.effectAllowed = 'copy';
                                            e.dataTransfer.setData('fieldType', template.type);
                                        }}
                                        className={`${template.color} p-3 rounded-lg cursor-move hover:shadow-lg transition-all active:scale-95 group`}
                                        title={template.label}
                                    >
                                        <Icon className="text-white mx-auto" size={18} strokeWidth={2.5} />
                                        <div className="text-[9px] text-white text-center mt-1 font-semibold">{template.label}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </aside>
                )}

                {/* Canvas */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6 max-w-7xl mx-auto">
                        <div className="bg-white rounded-xl shadow-xl border-2 border-slate-200 min-h-[700px]">
                            <div className="bg-gradient-to-r from-slate-50 via-red-50 to-slate-50 px-6 py-4 border-b-2 border-slate-200 flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <Layout size={20} className="text-[#D41C2C]" /> Form Canvas
                                    </h2>
                                    <p className="text-xs text-slate-600">Drag fields into rows • Resize fields • Reorder rows</p>
                                </div>
                                <button onClick={addRow} className="flex items-center gap-2 bg-gradient-to-r from-[#D41C2C] to-[#B81926] text-white px-4 py-2 rounded-lg text-sm font-bold hover:shadow-lg transition-all">
                                    <Plus size={16} /> Add Row
                                </button>
                            </div>

                            <div className="p-6">
                                {rows.length === 0 ? (
                                    <div className="h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl">
                                        <div className="bg-gradient-to-br from-red-100 to-orange-100 p-10 rounded-2xl mb-4">
                                            <Layout size={48} className="text-[#D41C2C]" />
                                        </div>
                                        <p className="font-bold text-xl text-slate-700 mb-2">Click "Add Row" to Start</p>
                                        <p className="text-sm text-slate-500">Build multi-column forms with rows</p>
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

                {/* Right Settings */}
                {!previewMode && selectedField && (
                    <aside className="w-80 bg-white border-l-2 border-slate-200 overflow-y-auto flex-shrink-0">
                        <div className="bg-gradient-to-r from-[#D41C2C] to-[#B81926] px-4 py-3 flex justify-between items-center">
                            <div>
                                <h3 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                                    <Settings2 size={16} /> Field Settings
                                </h3>
                            </div>
                            <button onClick={() => setSelectedField(null)} className="text-white hover:bg-white/20 p-1.5 rounded">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Width</label>
                                <div className="grid grid-cols-4 gap-1.5">
                                    {[1, 2, 3, 4].map((w) => (
                                        <button
                                            key={w}
                                            onClick={() => updateField(selectedField.id, { width: w as any })}
                                            className={`p-2 border-2 rounded text-xs font-bold ${selectedField.width === w ? 'border-[#D41C2C] bg-red-50 text-[#D41C2C]' : 'border-slate-200 text-slate-600'}`}
                                        >
                                            {w === 1 ? '25%' : w === 2 ? '50%' : w === 3 ? '75%' : '100%'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Label</label>
                                <input type="text" value={selectedField.label} onChange={(e) => updateField(selectedField.id, { label: e.target.value })} className="w-full px-3 py-2 border-2 border-slate-300 rounded text-sm focus:border-[#D41C2C] focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Variable Key</label>
                                <input type="text" value={selectedField.key} onChange={(e) => updateField(selectedField.id, { key: e.target.value })} className="w-full px-3 py-2 border-2 border-slate-300 rounded text-sm font-mono focus:border-[#D41C2C] focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Placeholder</label>
                                <input type="text" value={selectedField.placeholder || ''} onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })} className="w-full px-3 py-2 border-2 border-slate-300 rounded text-sm focus:border-[#D41C2C] focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Help Text</label>
                                <textarea value={selectedField.helpText || ''} onChange={(e) => updateField(selectedField.id, { helpText: e.target.value })} className="w-full px-3 py-2 border-2 border-slate-300 rounded text-sm focus:border-[#D41C2C] focus:outline-none resize-none" rows={2} />
                            </div>
                            {selectedField.type === 'select' && (
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Options (one per line)</label>
                                    <textarea value={selectedField.options?.join('\n') || ''} onChange={(e) => updateField(selectedField.id, { options: e.target.value.split('\n').filter(o => o.trim()) })} className="w-full px-3 py-2 border-2 border-slate-300 rounded text-sm font-mono focus:border-[#D41C2C] focus:outline-none resize-none" rows={4} />
                                </div>
                            )}
                            <div className="pt-3 border-t-2 border-slate-200">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={selectedField.required} onChange={(e) => updateField(selectedField.id, { required: e.target.checked })} className="w-4 h-4 text-[#D41C2C] border-2 border-slate-300 rounded" />
                                    <span className="text-sm font-semibold text-slate-700">Required Field</span>
                                </label>
                            </div>
                        </div>
                    </aside>
                )}
            </main>
        </div>
    );
}
