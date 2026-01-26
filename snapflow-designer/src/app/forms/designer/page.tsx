"use client";

import React, { useState } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragStartEvent,
    DragOverEvent,
    DragOverlay,
    useDraggable,
    useDroppable,
    PointerSensor,
    useSensor,
    useSensors,
    closestCenter,
} from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
    horizontalListSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    Save, Eye, FileText, X, Trash2, GripVertical, FolderOpen,
    Type, Hash, Calendar, List, CheckSquare, AlignLeft, Settings2, Plus,
    User, Paperclip, PenTool, FilePlus, ChevronDown, ToggleLeft,
    Rows, Columns, Clock, FileType, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { useToast } from '@/components/ui/Toast';
import { FormPreview } from './FormPreview';
import { FormRow, FormField, FieldType, OptionItem, ValidationRules } from './types';

// ============================================================================
// FIELD TEMPLATES
// ============================================================================
const FIELD_TEMPLATES = [
    { type: 'text' as FieldType, icon: Type, label: 'Text', color: 'bg-blue-500' },
    { type: 'textarea' as FieldType, icon: AlignLeft, label: 'Text Area', color: 'bg-indigo-500' },
    { type: 'number' as FieldType, icon: Hash, label: 'Number', color: 'bg-emerald-500' },
    { type: 'select' as FieldType, icon: List, label: 'Dropdown', color: 'bg-amber-500' },
    { type: 'checkbox' as FieldType, icon: CheckSquare, label: 'Checkbox', color: 'bg-teal-500' },
    { type: 'radio' as FieldType, icon: ChevronDown, label: 'Radio', color: 'bg-purple-500' },
    { type: 'toggle' as FieldType, icon: ToggleLeft, label: 'Toggle', color: 'bg-cyan-500' },
    { type: 'date' as FieldType, icon: Calendar, label: 'Date', color: 'bg-orange-500' },
    { type: 'people' as FieldType, icon: User, label: 'People', color: 'bg-pink-500' },
    { type: 'file' as FieldType, icon: Paperclip, label: 'File', color: 'bg-slate-500' },
    { type: 'signature' as FieldType, icon: PenTool, label: 'Signature', color: 'bg-violet-500' },
];

// ============================================================================
// DRAGGABLE PALETTE ITEM
// ============================================================================
function PaletteItem({ template }: { template: typeof FIELD_TEMPLATES[0] }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `palette-${template.type}`,
        data: { type: 'palette', fieldType: template.type },
    });
    const Icon = template.icon;

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`flex items-center gap-2 p-2.5 bg-white border border-gray-200 rounded-lg cursor-grab hover:border-[#D41C2C] hover:shadow-md transition-all ${isDragging ? 'opacity-50' : ''}`}
        >
            <div className={`p-1.5 rounded ${template.color} text-white`}>
                <Icon size={14} strokeWidth={2.5} />
            </div>
            <span className="text-xs font-semibold text-gray-700">{template.label}</span>
        </div>
    );
}

// ============================================================================
// FIELD IN ROW - Sortable field within a row with resize handle
// ============================================================================
function RowField({ field, isSelected, onSelect, onDelete, onResize }: {
    field: FormField;
    isSelected: boolean;
    onSelect: () => void;
    onDelete: () => void;
    onResize: (width: number) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: field.id,
        data: { type: 'field', field }
    });
    const template = FIELD_TEMPLATES.find(t => t.type === field.type);
    const Icon = template?.icon || Type;
    const [isResizing, setIsResizing] = useState(false);
    const fieldRef = React.useRef<HTMLDivElement>(null);
    const rowRef = React.useRef<HTMLDivElement | null>(null);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: isResizing ? 'none' : transition,
        opacity: isDragging ? 0.5 : 1,
        width: `${field.width}%`,
        flexShrink: 0,
    };

    const handleResizeStart = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setIsResizing(true);

        const startX = e.clientX;
        const startWidth = field.width;

        // Get parent row width for percentage calculation
        const parentRow = fieldRef.current?.parentElement;
        const rowWidth = parentRow?.offsetWidth || 800;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaPercent = (deltaX / rowWidth) * 100;
            const newWidth = Math.min(100, Math.max(10, Math.round(startWidth + deltaPercent)));
            onResize(newWidth);
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <div
            ref={(el) => { setNodeRef(el); fieldRef.current = el; }}
            style={style}
            className="p-1 relative group"
        >
            <div
                onClick={onSelect}
                className={`h-full bg-white rounded-lg border-2 p-3 cursor-pointer transition-all
                    ${isSelected ? 'border-[#D41C2C] shadow-lg ring-2 ring-[#D41C2C]/20' : 'border-gray-200 hover:border-gray-300'}`}
            >
                <div className="flex items-center gap-2">
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-gray-100 text-gray-400 hover:text-[#D41C2C] transition-colors"
                        title="Drag to reorder"
                    >
                        <GripVertical size={16} />
                    </div>
                    <div className={`p-1.5 rounded ${template?.color}`}>
                        <Icon size={12} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-800 truncate">
                            {field.label}
                            {field.validation?.required && <span className="text-red-500 ml-0.5">*</span>}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono truncate">{field.key}</div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-semibold">{field.width}%</span>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-gray-400 hover:text-red-500">
                            <Trash2 size={12} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Resize Handle */}
            <div
                onMouseDown={handleResizeStart}
                className={`absolute right-0 top-1 bottom-1 w-2 cursor-ew-resize rounded-r 
                    ${isResizing ? 'bg-[#D41C2C]' : 'bg-transparent group-hover:bg-gray-300 hover:!bg-[#D41C2C]'}
                    transition-colors`}
            />
        </div>
    );
}

// ============================================================================
// DROPPABLE ROW - A row that accepts field drops
// ============================================================================
function DroppableRow({ row, children, onAddField, onDeleteRow }: {
    row: FormRow;
    children: React.ReactNode;
    onAddField: (rowId: string, type: FieldType) => void;
    onDeleteRow: () => void;
}) {
    // Use a unique ID for droppable that won't conflict with sortable
    const droppableId = `droppable-row-${row.id}`;

    const { setNodeRef: setDroppableRef, isOver } = useDroppable({
        id: droppableId,
        data: { type: 'row', rowId: row.id }
    });

    const {
        attributes,
        listeners,
        setNodeRef: setSortableRef,
        transform,
        transition
    } = useSortable({
        id: `sortable-row-${row.id}`,
        data: { type: 'row-sort', rowId: row.id }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    // Combine refs
    const setRefs = React.useCallback((node: HTMLDivElement | null) => {
        setSortableRef(node);
        setDroppableRef(node);
    }, [setSortableRef, setDroppableRef]);

    return (
        <div ref={setRefs} style={style} className="group">
            <div
                className={`bg-white rounded-xl border-2 transition-all ${isOver ? 'border-[#D41C2C] bg-red-50/30' : 'border-gray-200 hover:border-gray-300'}`}
            >
                {/* Row Header */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
                    <div className="flex items-center gap-2">
                        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-[#D41C2C]">
                            <GripVertical size={16} />
                        </div>
                        <Rows size={14} className="text-gray-400" />
                        <span className="text-xs font-medium text-gray-500">
                            Row • {row.fields.length} field{row.fields.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <button onClick={onDeleteRow} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity">
                        <Trash2 size={14} />
                    </button>
                </div>

                {/* Row Content */}
                <div className="p-2 min-h-[60px]">
                    {row.fields.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-400 text-xs py-4 border-2 border-dashed border-gray-200 rounded-lg">
                            <Columns size={14} className="mr-2" /> Drag fields here
                        </div>
                    ) : (
                        <div className="flex flex-wrap">
                            {children}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// VALIDATION PANEL - Per-type validation settings
// ============================================================================
function ValidationPanel({ field, onUpdate }: { field: FormField; onUpdate: (v: Partial<ValidationRules>) => void }) {
    const validation = field.validation || {};

    return (
        <div className="space-y-4">
            {/* Required */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Required</span>
                <ToggleButton checked={validation.required || false} onChange={(v) => onUpdate({ required: v })} />
            </div>

            {/* TEXT VALIDATIONS */}
            {(field.type === 'text' || field.type === 'textarea' || field.type === 'email' || field.type === 'phone') && (
                <>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Min Length</label>
                            <input type="number" value={validation.minLength || ''} onChange={(e) => onUpdate({ minLength: parseInt(e.target.value) || undefined })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="0" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Max Length</label>
                            <input type="number" value={validation.maxLength || ''} onChange={(e) => onUpdate({ maxLength: parseInt(e.target.value) || undefined })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="∞" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Pattern (Regex)</label>
                        <input type="text" value={validation.pattern || ''} onChange={(e) => onUpdate({ pattern: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono" placeholder="^[A-Z].*" />
                    </div>
                </>
            )}

            {/* NUMBER VALIDATIONS */}
            {field.type === 'number' && (
                <>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Min Value</label>
                            <input type="number" value={validation.min ?? ''} onChange={(e) => onUpdate({ min: parseFloat(e.target.value) || undefined })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Max Value</label>
                            <input type="number" value={validation.max ?? ''} onChange={(e) => onUpdate({ max: parseFloat(e.target.value) || undefined })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Decimal Places</label>
                            <input type="number" value={validation.decimalPlaces ?? ''} onChange={(e) => onUpdate({ decimalPlaces: parseInt(e.target.value) || undefined })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Any" />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-xs font-medium text-gray-600">Allow Negative</span>
                            <ToggleButton checked={validation.allowNegative ?? true} onChange={(v) => onUpdate({ allowNegative: v })} />
                        </div>
                    </div>
                </>
            )}

            {/* DATE VALIDATIONS */}
            {field.type === 'date' && (
                <>
                    <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-center gap-2">
                            <Clock size={14} className="text-amber-600" />
                            <span className="text-sm font-medium text-amber-800">Block Past Dates</span>
                        </div>
                        <ToggleButton checked={validation.disablePastDates || false} onChange={(v) => onUpdate({ disablePastDates: v })} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2">
                            <Clock size={14} className="text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">Block Future Dates</span>
                        </div>
                        <ToggleButton checked={validation.disableFutureDates || false} onChange={(v) => onUpdate({ disableFutureDates: v })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Min Date</label>
                            <input type="date" value={validation.minDate || ''} onChange={(e) => onUpdate({ minDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Max Date</label>
                            <input type="date" value={validation.maxDate || ''} onChange={(e) => onUpdate({ maxDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Timezone</label>
                        <select value={validation.timezone || ''} onChange={(e) => onUpdate({ timezone: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                            <option value="">User's Local Timezone</option>
                            <option value="UTC">UTC</option>
                            <option value="America/New_York">Eastern (ET)</option>
                            <option value="America/Chicago">Central (CT)</option>
                            <option value="America/Denver">Mountain (MT)</option>
                            <option value="America/Los_Angeles">Pacific (PT)</option>
                            <option value="Europe/London">London (GMT/BST)</option>
                            <option value="Asia/Tokyo">Tokyo (JST)</option>
                        </select>
                    </div>
                </>
            )}

            {/* FILE VALIDATIONS */}
            {field.type === 'file' && (
                <>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Accepted File Types</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png', 'gif'].map(ext => {
                                const isSelected = validation.acceptedTypes?.includes(ext);
                                return (
                                    <button
                                        key={ext}
                                        onClick={() => {
                                            const current = validation.acceptedTypes || [];
                                            const updated = isSelected ? current.filter(t => t !== ext) : [...current, ext];
                                            onUpdate({ acceptedTypes: updated.length > 0 ? updated : undefined });
                                        }}
                                        className={`px-2 py-1 text-xs font-mono rounded border transition-colors ${isSelected ? 'bg-[#D41C2C] text-white border-[#D41C2C]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
                                    >
                                        .{ext}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Max File Size (MB)</label>
                            <input type="number" value={validation.maxFileSize || ''} onChange={(e) => onUpdate({ maxFileSize: parseInt(e.target.value) || undefined })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="10" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Max Files</label>
                            <input type="number" value={validation.maxFiles || ''} onChange={(e) => onUpdate({ maxFiles: parseInt(e.target.value) || undefined })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="1" />
                        </div>
                    </div>
                </>
            )}

            {/* Custom Error Message */}
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Custom Error Message</label>
                <input type="text" value={validation.customMessage || ''} onChange={(e) => onUpdate({ customMessage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Please check this field" />
            </div>
        </div>
    );
}

// Toggle Button Component
function ToggleButton({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button onClick={() => onChange(!checked)} className={`w-10 h-5 rounded-full transition-colors relative ${checked ? 'bg-[#D41C2C]' : 'bg-gray-300'}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
    );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function ProfessionalFormDesigner() {
    const [formName, setFormName] = useState('Untitled Form');
    const [rows, setRows] = useState<FormRow[]>([]);
    const [selectedField, setSelectedField] = useState<FormField | null>(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [settingsTab, setSettingsTab] = useState<'general' | 'validation' | 'options'>('general');
    const [isNewFormModalOpen, setIsNewFormModalOpen] = useState(false);
    const [showLoadModal, setShowLoadModal] = useState(false);
    const [savedForms, setSavedForms] = useState<any[]>([]);
    const { showToast, ToastComponent } = useToast();

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    // ========================================================================
    // DRAG & DROP
    // ========================================================================
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeData = active.data.current;
        const overId = over.id as string;

        // Dropping from palette onto a row
        if (activeData?.type === 'palette' && overId.startsWith('droppable-row-')) {
            const rowId = overId.replace('droppable-row-', '');
            const fieldType = activeData.fieldType as FieldType;
            addFieldToRow(rowId, fieldType);
        }

        // Reordering rows
        if (activeData?.type === 'row-sort' && over.data.current?.type === 'row-sort') {
            const activeRowId = activeData.rowId;
            const overRowId = over.data.current.rowId;
            const oldIndex = rows.findIndex(r => r.id === activeRowId);
            const newIndex = rows.findIndex(r => r.id === overRowId);
            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                setRows(arrayMove(rows, oldIndex, newIndex));
            }
        }

        // Reordering fields within/between rows
        if (activeData?.type === 'field') {
            const sourceRowId = rows.find(r => r.fields.some(f => f.id === active.id))?.id;
            let targetRowId = over.data.current?.rowId || rows.find(r => r.fields.some(f => f.id === over.id))?.id;

            if (sourceRowId && targetRowId) {
                const activeField = rows.flatMap(r => r.fields).find(f => f.id === active.id);
                if (!activeField) return;

                if (sourceRowId === targetRowId) {
                    // Same row - reorder
                    setRows(rows.map(row => {
                        if (row.id === sourceRowId) {
                            const oldIndex = row.fields.findIndex(f => f.id === active.id);
                            const newIndex = row.fields.findIndex(f => f.id === over.id);
                            if (oldIndex !== -1 && newIndex !== -1) {
                                return { ...row, fields: arrayMove(row.fields, oldIndex, newIndex) };
                            }
                        }
                        return row;
                    }));
                } else {
                    // Move between rows
                    setRows(rows.map(row => {
                        if (row.id === sourceRowId) {
                            return { ...row, fields: row.fields.filter(f => f.id !== active.id) };
                        }
                        if (row.id === targetRowId) {
                            return { ...row, fields: [...row.fields, activeField] };
                        }
                        return row;
                    }));
                }
            }
        }
    };

    // Handle drag over for real-time field swapping within rows
    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeData = active.data.current;

        // Only handle field-to-field swapping
        if (activeData?.type !== 'field') return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Don't swap with itself
        if (activeId === overId) return;

        // Find source and target rows
        const sourceRow = rows.find(r => r.fields.some(f => f.id === activeId));
        const targetRow = rows.find(r => r.fields.some(f => f.id === overId));

        // Only handle same-row swaps in dragOver (cross-row in dragEnd)
        if (sourceRow && targetRow && sourceRow.id === targetRow.id) {
            const oldIndex = sourceRow.fields.findIndex(f => f.id === activeId);
            const newIndex = sourceRow.fields.findIndex(f => f.id === overId);

            if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
                setRows(rows.map(row => {
                    if (row.id === sourceRow.id) {
                        return { ...row, fields: arrayMove(row.fields, oldIndex, newIndex) };
                    }
                    return row;
                }));
            }
        }
    };

    // ========================================================================
    // ACTIONS
    // ========================================================================
    const addRow = () => {
        setRows([...rows, { id: `row_${Date.now()}`, fields: [] }]);
    };

    const deleteRow = (rowId: string) => {
        setRows(rows.filter(r => r.id !== rowId));
    };

    const addFieldToRow = (rowId: string, type: FieldType) => {
        const template = FIELD_TEMPLATES.find(t => t.type === type);
        const newField: FormField = {
            id: `field_${Date.now()}`,
            type,
            label: template?.label || 'Field',
            key: `field_${Date.now()}`,
            width: 50,
            validation: { required: false },
            logic: {},
            data: { options: [{ id: 'opt1', label: 'Option 1' }, { id: 'opt2', label: 'Option 2' }], dataSource: 'static' },
        };
        setRows(rows.map(r => r.id === rowId ? { ...r, fields: [...r.fields, newField] } : r));
        setSelectedField(newField);
        setSettingsTab('general');
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

    const deleteField = (fieldId: string) => {
        setRows(rows.map(row => ({ ...row, fields: row.fields.filter(f => f.id !== fieldId) })));
        if (selectedField?.id === fieldId) setSelectedField(null);
    };

    // Save/Load
    const handleSave = async () => {
        if (!formName.trim()) { showToast("Please name your form.", 'error'); return; }
        setIsSaving(true);
        try {
            const response = await fetch('http://localhost:8081/api/forms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: formName, schema: rows })
            });
            if (response.ok) showToast('Form saved!', 'success');
            else showToast('Failed to save', 'error');
        } catch { showToast('Server error', 'error'); }
        finally { setIsSaving(false); }
    };

    const handleNewForm = () => {
        if (rows.length > 0) setIsNewFormModalOpen(true);
        else confirmNewForm();
    };

    const confirmNewForm = () => {
        setFormName("Untitled Form");
        setRows([]);
        setSelectedField(null);
    };

    const handleOpenLoadModal = async () => {
        try {
            const res = await fetch('http://localhost:8081/api/forms');
            if (res.ok) { setSavedForms(await res.json()); setShowLoadModal(true); }
        } catch { showToast('Error loading forms', 'error'); }
    };

    const handleLoadForm = (form: any) => {
        setFormName(form.name);
        let loadedRows: FormRow[] = [];
        if (Array.isArray(form.schema)) {
            if (form.schema[0]?.fields) {
                loadedRows = form.schema;
            } else {
                loadedRows = [{ id: 'imported', fields: form.schema }];
            }
        }
        setRows(loadedRows);
        setShowLoadModal(false);
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                {/* HEADER */}
                <header className="bg-white border-b-4 border-[#D41C2C] sticky top-0 z-50 shadow-sm">
                    <div className="max-w-[1920px] mx-auto px-6 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link href="/" className="flex items-center gap-2">
                                    <div className="bg-gradient-to-br from-[#D41C2C] to-[#B81926] p-2 rounded-lg">
                                        <FileText className="text-white" size={20} />
                                    </div>
                                    <div>
                                        <h1 className="text-lg font-bold text-gray-900">Form Designer</h1>
                                        <p className="text-[9px] text-gray-500 uppercase tracking-wider">Professional Builder</p>
                                    </div>
                                </Link>
                                <div className="h-8 w-px bg-gray-200" />
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    className="text-lg font-semibold bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-[#D41C2C] focus:outline-none px-2 py-1"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={handleNewForm} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">
                                    <FilePlus size={16} /> New
                                </button>
                                <button onClick={handleOpenLoadModal} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">
                                    <FolderOpen size={16} /> Open
                                </button>
                                <button onClick={() => setPreviewMode(!previewMode)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold ${previewMode ? 'bg-[#D41C2C] text-white' : 'bg-gray-100 text-gray-700'}`}>
                                    <Eye size={16} /> {previewMode ? 'Edit' : 'Preview'}
                                </button>
                                <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-1.5 px-4 py-2 bg-[#D41C2C] text-white rounded-lg text-sm font-semibold hover:bg-[#B81926]">
                                    <Save size={16} /> {isSaving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* MAIN */}
                <main className="flex-1 flex overflow-hidden">
                    {/* LEFT - Palette */}
                    {!previewMode && (
                        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
                            <div className="p-4 border-b border-gray-100">
                                <h2 className="font-bold text-gray-800 text-sm">Form Elements</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Drag into rows</p>
                            </div>
                            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                {FIELD_TEMPLATES.map(t => <PaletteItem key={t.type} template={t} />)}
                            </div>
                        </aside>
                    )}

                    {/* CENTER - Canvas */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="max-w-4xl mx-auto">
                            {previewMode ? (
                                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">{formName}</h2>
                                    <FormPreview rows={rows} />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Add Row Button */}
                                    <button onClick={addRow} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-semibold text-gray-500 hover:border-[#D41C2C] hover:text-[#D41C2C] transition-colors flex items-center justify-center gap-2">
                                        <Plus size={16} /> Add Row
                                    </button>

                                    {/* Rows */}
                                    <SortableContext items={rows.map(r => `sortable-row-${r.id}`)} strategy={verticalListSortingStrategy}>
                                        {rows.map(row => (
                                            <DroppableRow key={row.id} row={row} onAddField={addFieldToRow} onDeleteRow={() => deleteRow(row.id)}>
                                                <SortableContext items={row.fields.map(f => f.id)} strategy={horizontalListSortingStrategy}>
                                                    {row.fields.map(field => (
                                                        <RowField
                                                            key={field.id}
                                                            field={field}
                                                            isSelected={selectedField?.id === field.id}
                                                            onSelect={() => { setSelectedField(field); setSettingsTab('general'); }}
                                                            onDelete={() => deleteField(field.id)}
                                                            onResize={(w) => updateField(field.id, { width: w })}
                                                        />
                                                    ))}
                                                </SortableContext>
                                            </DroppableRow>
                                        ))}
                                    </SortableContext>

                                    {rows.length === 0 && (
                                        <div className="text-center py-16 text-gray-400">
                                            <Rows size={48} className="mx-auto mb-4 opacity-30" />
                                            <p className="text-lg font-medium">No rows yet</p>
                                            <p className="text-sm">Click "Add Row" to start building your form</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT - Settings */}
                    {!previewMode && selectedField && (
                        <aside className="w-80 bg-white border-l border-gray-200 flex flex-col">
                            <div className="p-4 bg-gradient-to-r from-[#D41C2C] to-[#B81926] flex justify-between items-center">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <Settings2 size={16} /> Field Settings
                                </h3>
                                <button onClick={() => setSelectedField(null)} className="text-white/80 hover:text-white p-1">
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b border-gray-200">
                                {['general', 'validation', 'options'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setSettingsTab(tab as any)}
                                        className={`flex-1 py-2.5 text-xs font-semibold uppercase ${settingsTab === tab ? 'border-b-2 border-[#D41C2C] text-[#D41C2C]' : 'text-gray-500'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <div className="flex-1 overflow-y-auto p-4">
                                {/* GENERAL */}
                                {settingsTab === 'general' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Label</label>
                                            <input type="text" value={selectedField.label} onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#D41C2C] focus:outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Field Key</label>
                                            <input type="text" value={selectedField.key} onChange={(e) => updateField(selectedField.id, { key: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono bg-gray-50" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Placeholder</label>
                                            <input type="text" value={selectedField.placeholder || ''} onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                                Width <span className="text-[#D41C2C] font-bold">{selectedField.width}%</span>
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="range"
                                                    min="10"
                                                    max="100"
                                                    step="5"
                                                    value={selectedField.width}
                                                    onChange={(e) => updateField(selectedField.id, { width: parseInt(e.target.value) })}
                                                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#D41C2C]"
                                                />
                                                <input
                                                    type="number"
                                                    min="10"
                                                    max="100"
                                                    value={selectedField.width}
                                                    onChange={(e) => updateField(selectedField.id, { width: Math.min(100, Math.max(10, parseInt(e.target.value) || 50)) })}
                                                    className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-sm text-center font-semibold"
                                                />
                                            </div>
                                            <div className="flex justify-between mt-2">
                                                {[25, 33, 50, 75, 100].map(p => (
                                                    <button
                                                        key={p}
                                                        onClick={() => updateField(selectedField.id, { width: p })}
                                                        className={`px-2 py-1 text-xs rounded border transition-colors ${selectedField.width === p ? 'bg-[#D41C2C] text-white border-[#D41C2C]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
                                                    >
                                                        {p}%
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Help Text</label>
                                            <textarea value={selectedField.helpText || ''} onChange={(e) => updateField(selectedField.id, { helpText: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" rows={2} />
                                        </div>
                                    </div>
                                )}

                                {/* VALIDATION */}
                                {settingsTab === 'validation' && (
                                    <ValidationPanel
                                        field={selectedField}
                                        onUpdate={(v) => updateField(selectedField.id, { validation: { ...selectedField.validation, ...v } })}
                                    />
                                )}

                                {/* OPTIONS */}
                                {settingsTab === 'options' && (selectedField.type === 'select' || selectedField.type === 'radio') && (
                                    <div className="space-y-3">
                                        <p className="text-xs text-gray-500">Define ID (for logic) and Label (displayed)</p>
                                        {(selectedField.data?.options || []).map((opt, idx) => {
                                            const isObj = typeof opt === 'object';
                                            const id = isObj ? (opt as OptionItem).id : opt;
                                            const label = isObj ? (opt as OptionItem).label : opt;
                                            return (
                                                <div key={idx} className="flex gap-2">
                                                    <input type="text" value={id} placeholder="ID"
                                                        onChange={(e) => {
                                                            const newOpts = [...(selectedField.data?.options || [])] as OptionItem[];
                                                            newOpts[idx] = { id: e.target.value, label };
                                                            updateField(selectedField.id, { data: { ...selectedField.data, options: newOpts } });
                                                        }}
                                                        className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs font-mono bg-gray-50" />
                                                    <input type="text" value={label} placeholder="Label"
                                                        onChange={(e) => {
                                                            const newOpts = [...(selectedField.data?.options || [])] as OptionItem[];
                                                            newOpts[idx] = { id, label: e.target.value };
                                                            updateField(selectedField.id, { data: { ...selectedField.data, options: newOpts } });
                                                        }}
                                                        className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs" />
                                                    <button onClick={() => {
                                                        const newOpts = (selectedField.data?.options || []).filter((_, i) => i !== idx) as OptionItem[];
                                                        updateField(selectedField.id, { data: { ...selectedField.data, options: newOpts } });
                                                    }} className="p-1.5 text-gray-400 hover:text-red-500">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                        <button onClick={() => {
                                            const newOpts = [...(selectedField.data?.options || []), { id: `opt_${Date.now()}`, label: 'New Option' }] as OptionItem[];
                                            updateField(selectedField.id, { data: { ...selectedField.data, options: newOpts } });
                                        }} className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-xs font-semibold text-gray-500 hover:border-[#D41C2C] hover:text-[#D41C2C]">
                                            <Plus size={14} className="inline mr-1" /> Add Option
                                        </button>
                                    </div>
                                )}

                                {settingsTab === 'options' && !['select', 'radio'].includes(selectedField.type) && (
                                    <div className="text-center py-8 text-gray-400">
                                        <AlertCircle size={24} className="mx-auto mb-2" />
                                        <p className="text-sm">Options only apply to Dropdown and Radio fields</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-gray-100">
                                <button onClick={() => deleteField(selectedField.id)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-semibold border border-red-200">
                                    <Trash2 size={16} /> Delete Field
                                </button>
                            </div>
                        </aside>
                    )}
                </main>

                {/* Modals */}
                <ConfirmationModal isOpen={isNewFormModalOpen} onClose={() => setIsNewFormModalOpen(false)} onConfirm={confirmNewForm}
                    title="Start New Form?" message="This will clear all content. Unsaved changes will be lost." confirmText="Start New" />

                {showLoadModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center">
                        <div className="bg-white rounded-xl shadow-2xl w-[500px] max-h-[70vh] overflow-hidden">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="font-bold text-lg">Open Form</h3>
                                <button onClick={() => setShowLoadModal(false)} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
                            </div>
                            <div className="p-4 max-h-[50vh] overflow-y-auto space-y-2">
                                {savedForms.length === 0 ? <p className="text-center text-gray-400 py-8">No saved forms</p> : savedForms.map(form => (
                                    <button key={form.id} onClick={() => handleLoadForm(form)}
                                        className="w-full p-4 border border-gray-200 rounded-lg hover:border-[#D41C2C] text-left flex items-center gap-3">
                                        <FileText className="text-[#D41C2C]" />
                                        <div>
                                            <div className="font-semibold">{form.name}</div>
                                            <div className="text-xs text-gray-500">ID: {form.id}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <ToastComponent />
            </div>
        </DndContext>
    );
}
