import React from 'react';
import { FileText } from 'lucide-react';
import { FormDefinition } from '@/services/formService';

interface FormSelectorProps {
    value: string;
    forms: FormDefinition[];
    onChange: (formId: string) => void;
    loading?: boolean;
    onCreateNew?: () => void;
    onEdit?: (formId: string) => void;
}

export function FormSelector({ value, forms, onChange, loading, onCreateNew, onEdit }: FormSelectorProps) {
    return (
        <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={12} /> Attached Form
                </label>
                {onCreateNew && (
                    <button
                        onClick={onCreateNew}
                        className="text-[10px] font-bold text-[#D41C2C] hover:underline flex items-center gap-1 uppercase"
                    >
                        + Create New
                    </button>
                )}
            </div>

            <select
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#D41C2C]/20 focus:border-[#D41C2C] outline-none appearance-none disabled:opacity-50"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={loading}
            >
                <option value="">{loading ? 'Loading forms...' : 'Select a form...'}</option>
                {forms.map((form) => (
                    <option key={form.id} value={form.id}>
                        {form.name}
                    </option>
                ))}
            </select>

            {value ? (
                <div className="mt-3 bg-green-50 border border-green-100 rounded-lg p-3">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <FileText size={16} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-green-800">Form Linked</p>
                            <p className="text-[10px] text-green-600">This task uses the selected form.</p>
                        </div>
                    </div>
                    {onEdit && (
                        <button
                            onClick={() => onEdit(value)}
                            className="w-full bg-white border border-green-200 text-green-700 text-xs font-bold py-1.5 rounded hover:bg-green-100 transition-colors uppercase tracking-wide"
                        >
                            Edit Form
                        </button>
                    )}
                </div>
            ) : (
                <div className="mt-3 p-3 bg-gray-50 border border-gray-100 rounded-lg text-center">
                    <p className="text-[10px] text-gray-400">No form selected. Task will be generic.</p>
                </div>
            )}
        </div>
    );
}
