import React from 'react';
import { FileText } from 'lucide-react';
import { FormDefinition } from '@/services/formService';

interface FormSelectorProps {
    value: string;
    forms: FormDefinition[];
    onChange: (formId: string) => void;
    loading?: boolean;
    onCreateNew?: () => void;
}

export function FormSelector({ value, forms, onChange, loading, onCreateNew }: FormSelectorProps) {
    return (
        <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={12} /> Attached Form
                </label>
                {onCreateNew && (
                    <a
                        href="/forms/designer"
                        target="_blank"
                        className="text-[10px] font-bold text-[#D41C2C] hover:underline flex items-center gap-1"
                    >
                        + Create New
                    </a>
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
                <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-lg flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <FileText size={16} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-green-800">Form Active</p>
                        <p className="text-[10px] text-green-600">Users will complete this form.</p>
                    </div>
                </div>
            ) : (
                <div className="mt-3 p-3 bg-gray-50 border border-gray-100 rounded-lg text-center">
                    <p className="text-[10px] text-gray-400">No form selected. Task will be generic.</p>
                </div>
            )}
        </div>
    );
}
