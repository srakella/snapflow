import React, { useState, useEffect } from 'react';
import { X, Save, CheckCircle, Clock, Calendar, FileText } from 'lucide-react';

interface TaskExecutionModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: any;
    onComplete: (taskId: string, data: any) => void;
}

export function TaskExecutionModal({ isOpen, onClose, task, onComplete }: TaskExecutionModalProps) {
    const [formData, setFormData] = useState({});
    const [comment, setComment] = useState('');

    // Reset form when task changes
    useEffect(() => {
        setComment('');
        setFormData({});
    }, [task]);

    if (!isOpen || !task) return null;

    const handleSave = () => {
        // Mock Save
        alert(`Draft saved for task ${task.id}`);
        onClose();
    };

    const handleComplete = () => {
        onComplete(task.id, { ...formData, comment });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-start bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{task.name}</h2>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-2">
                            {task.due ? (
                                <span className="flex items-center gap-1 text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                                    <Calendar size={12} /> Due: {new Date(task.due).toLocaleDateString()}
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-gray-400">
                                    <Clock size={12} /> No Due Date
                                </span>
                            )}
                            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-500">ID: {task.id}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                        title="Close"
                    >
                        <X size={20} className="text-gray-400 hover:text-gray-600" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Description */}
                    <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 border border-blue-100">
                        <div className="flex items-center gap-2 mb-2 opacity-70">
                            <FileText size={14} />
                            <h3 className="font-bold text-xs uppercase tracking-wide">Description</h3>
                        </div>
                        <p className="leading-relaxed whitespace-pre-line">
                            {task.description || "No description provided for this task."}
                        </p>
                    </div>

                    {/* Dynamic Form Area */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-900">Task Form</h3>
                            <span className="text-xs text-gray-500 italic">Fill in the required information</span>
                        </div>

                        {/* Mock Form Fields */}
                        <div className="grid grid-cols-1 gap-4 p-5 border border-gray-200 rounded-xl bg-gray-50/50">
                            {/* Variable input based on task name simulation */}
                            {task.name.toLowerCase().includes('approve') ? (
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">Approval Decision</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="decision" className="text-[#D41C2C] focus:ring-[#D41C2C]" />
                                            <span className="text-sm">Approve</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="decision" className="text-[#D41C2C] focus:ring-[#D41C2C]" />
                                            <span className="text-sm">Reject</span>
                                        </label>
                                    </div>
                                </div>
                            ) : null}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Comments / Notes</label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-lg p-3 h-32 focus:ring-2 focus:ring-[#D41C2C]/20 focus:border-[#D41C2C] outline-none transition-all placeholder:text-gray-400 text-sm"
                                    placeholder="Enter any additional details or comments..."
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-bold text-sm hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 transition-all flex items-center gap-2"
                    >
                        <Save size={16} /> Save Draft
                    </button>
                    <button
                        onClick={handleComplete}
                        className="px-6 py-2 bg-[#D41C2C] text-white rounded-lg font-bold text-sm hover:bg-[#B81926] flex items-center gap-2 shadow-sm transform transition active:scale-[0.98]"
                    >
                        <CheckCircle size={16} /> Complete Task
                    </button>
                </div>
            </div>
        </div>
    );
}
