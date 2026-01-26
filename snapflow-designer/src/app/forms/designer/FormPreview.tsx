import React, { useState } from 'react';
import { FormRow, FormField, FieldType } from './types';
import { Calendar, Upload, User, PenTool, Check } from 'lucide-react';

interface FormPreviewProps {
    rows: FormRow[];
}

export function FormPreview({ rows }: FormPreviewProps) {
    // Local state to store form values so inputs are interactive
    const [formData, setFormData] = useState<Record<string, any>>({});

    const handleChange = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const renderField = (field: FormField) => {
        const commonClasses = "w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-[#D41C2C] focus:outline-none focus:ring-2 focus:ring-[#D41C2C]/10 transition-all";
        const labelClass = "block text-sm font-bold text-slate-700 mb-1.5";
        const helpTextClass = "text-xs text-slate-500 mt-1";

        const widthMap = {
            1: 'col-span-1',
            2: 'col-span-2',
            3: 'col-span-3',
            4: 'col-span-4'
        };

        return (
            <div key={field.id} className={widthMap[field.width]}>
                <label className={labelClass}>
                    {field.label}
                    {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {/* Render Input based on Type */}
                {(() => {
                    switch (field.type) {
                        case 'text':
                        case 'email':
                        case 'phone':
                        case 'number':
                            return (
                                <input
                                    type={field.type === 'number' ? 'number' : 'text'}
                                    className={commonClasses}
                                    placeholder={field.placeholder}
                                    value={formData[field.key] || ''}
                                    onChange={(e) => handleChange(field.key, e.target.value)}
                                />
                            );
                        case 'textarea':
                            return (
                                <textarea
                                    className={`${commonClasses} resize-none`}
                                    rows={4}
                                    placeholder={field.placeholder}
                                    value={formData[field.key] || ''}
                                    onChange={(e) => handleChange(field.key, e.target.value)}
                                />
                            );
                        case 'select':
                            return (
                                <select
                                    className={`${commonClasses} bg-white`}
                                    value={formData[field.key] || ''}
                                    onChange={(e) => handleChange(field.key, e.target.value)}
                                >
                                    <option value="">Select an option...</option>
                                    {field.data.options?.map((opt, i) => (
                                        <option key={i} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            );
                        case 'radio':
                            return (
                                <div className="space-y-2">
                                    {field.data.options?.map((opt, i) => (
                                        <label key={i} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name={field.key}
                                                value={opt}
                                                checked={formData[field.key] === opt}
                                                onChange={(e) => handleChange(field.key, e.target.value)}
                                                className="w-4 h-4 text-[#D41C2C] border-2 border-slate-300 focus:ring-[#D41C2C]"
                                            />
                                            <span className="text-sm text-slate-700">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            );
                        case 'checkbox':
                            return (
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={!!formData[field.key]}
                                        onChange={(e) => handleChange(field.key, e.target.checked)}
                                        className="w-5 h-5 rounded text-[#D41C2C] border-slate-300 focus:ring-[#D41C2C]"
                                    />
                                    <span className="text-sm text-slate-700">{field.placeholder || 'Yes, I agree'}</span>
                                </label>
                            );
                        case 'date':
                            return (
                                <div className="relative">
                                    <input
                                        type="date"
                                        className={commonClasses}
                                        value={formData[field.key] || ''}
                                        onChange={(e) => handleChange(field.key, e.target.value)}
                                    />
                                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                </div>
                            );
                        case 'file':
                            return (
                                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer">
                                    <Upload className="text-slate-400 mb-2" size={24} />
                                    <span className="text-sm font-bold text-slate-600">Click to upload or drag and drop</span>
                                    <span className="text-xs text-slate-400 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</span>
                                </div>
                            );
                        case 'people':
                            return (
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        className={`${commonClasses} pl-10`}
                                        placeholder="Search people..."
                                        value={formData[field.key] || ''}
                                        onChange={(e) => handleChange(field.key, e.target.value)}
                                    />
                                </div>
                            );
                        case 'signature':
                            return (
                                <div className="border-2 border-slate-200 rounded-lg h-32 bg-slate-50 flex items-center justify-center relative group cursor-crosshair">
                                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                        <PenTool size={14} /> Sign Here
                                    </span>
                                </div>
                            );
                        default:
                            return <div className="text-red-500 text-xs">Unknown field type: {field.type}</div>;
                    }
                })()}

                {field.helpText && <p className={helpTextClass}>{field.helpText}</p>}
            </div>
        );
    };

    if (rows.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-10">
                <p>Form is empty.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-4xl mx-auto space-y-6">
            <div className="space-y-6">
                {rows.map(row => (
                    <div key={row.id} className="grid grid-cols-4 gap-4">
                        {row.fields.map(field => renderField(field))}
                    </div>
                ))}
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button
                    className="bg-[#D41C2C] text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-[#B81926] active:scale-95 transition-all flex items-center gap-2"
                    onClick={() => alert('This is a preview. Form submission is simulated!')}
                >
                    <Check size={16} /> Submit Form
                </button>
            </div>
        </div>
    );
}
