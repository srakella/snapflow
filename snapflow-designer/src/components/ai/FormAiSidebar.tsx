import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, X, Bot, User, Play, RefreshCw, Loader2, ArrowRight } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    generatedForm?: any[];
}

interface FormAiSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyForm: (formRows: any[]) => void;
}

export function FormAiSidebar({ isOpen, onClose, onApplyForm }: FormAiSidebarProps) {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hi! I can help you build your form. Describe what fields you need.' }
    ]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleNewChat = () => {
        if (messages.length > 1 && confirm('Start a new conversation?')) {
            setMessages([{ role: 'assistant', content: 'Context cleared. What form shall we build?' }]);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input;
        setInput('');

        // Optimistic update
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        // Mock AI Generation for Forms
        setTimeout(() => {
            // Simple mock logic based on keywords
            let generatedRows: any[] = [];
            const lowerMsg = userMessage.toLowerCase();

            if (lowerMsg.includes('expense') || lowerMsg.includes('reimbursement')) {
                generatedRows = [
                    { id: 'row1', fields: [{ id: `f_${Date.now()}_1`, type: 'text', label: 'Employee Name', key: 'empName', width: 2, validation: { required: true }, logic: {}, data: { dataSource: 'static' } }, { id: `f_${Date.now()}_2`, type: 'date', label: 'Date', key: 'date', width: 2, validation: { required: true }, logic: {}, data: { dataSource: 'static' } }] },
                    { id: 'row2', fields: [{ id: `f_${Date.now()}_3`, type: 'number', label: 'Amount', key: 'amount', width: 2, validation: { min: 0 }, logic: {}, data: { dataSource: 'static' } }, { id: `f_${Date.now()}_4`, type: 'select', label: 'Category', key: 'category', width: 2, validation: {}, logic: {}, data: { options: ['Travel', 'Meals', 'Supplies'], dataSource: 'static' } }] },
                    { id: 'row3', fields: [{ id: `f_${Date.now()}_5`, type: 'file', label: 'Receipt', key: 'receipt', width: 4, validation: {}, logic: {}, data: { dataSource: 'static' } }] }
                ];
            } else if (lowerMsg.includes('leave') || lowerMsg.includes('vacation')) {
                generatedRows = [
                    { id: 'row1', fields: [{ id: `f_${Date.now()}_1`, type: 'people', label: 'Employee', key: 'employee', width: 2, validation: { required: true }, logic: {}, data: { dataSource: 'static' } }, { id: `f_${Date.now()}_2`, type: 'select', label: 'Leave Type', key: 'type', width: 2, validation: { required: true }, logic: {}, data: { options: ['Annual', 'Sick', 'Unpaid'], dataSource: 'static' } }] },
                    { id: 'row2', fields: [{ id: `f_${Date.now()}_3`, type: 'date', label: 'Start Date', key: 'startDate', width: 2, validation: { required: true }, logic: {}, data: { dataSource: 'static' } }, { id: `f_${Date.now()}_4`, type: 'date', label: 'End Date', key: 'endDate', width: 2, validation: { required: true }, logic: {}, data: { dataSource: 'static' } }] },
                    { id: 'row3', fields: [{ id: `f_${Date.now()}_5`, type: 'textarea', label: 'Reason', key: 'reason', width: 4, validation: {}, logic: {}, data: { dataSource: 'static' } }] }
                ];
            } else {
                // Default generic form
                generatedRows = [
                    { id: 'row1', fields: [{ id: `f_${Date.now()}_1`, type: 'text', label: 'Name', key: 'name', width: 4, validation: { required: true }, logic: {}, data: { dataSource: 'static' } }] },
                    { id: 'row2', fields: [{ id: `f_${Date.now()}_2`, type: 'textarea', label: 'Description', key: 'description', width: 4, validation: {}, logic: {}, data: { dataSource: 'static' } }] }
                ];
            }

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `I've generated a form template for you based on "${userMessage}".`,
                generatedForm: generatedRows
            }]);
            setIsLoading(false);
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div className="w-[400px] border-l border-gray-200 bg-white shadow-xl flex flex-col h-full animate-in slide-in-from-right duration-300 z-30">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-violet-50 to-indigo-50">
                <div className="flex items-center gap-2 text-indigo-900 font-bold">
                    <Sparkles size={18} className="text-indigo-600" />
                    AI Form Copilot
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleNewChat}
                        className="p-1.5 hover:bg-white/50 rounded-full transition-colors text-indigo-700 disabled:opacity-30"
                        title="New Chat"
                        disabled={messages.length <= 1}
                    >
                        <RefreshCw size={16} />
                    </button>
                    <button onClick={onClose} className="p-1.5 hover:bg-white/50 rounded-full transition-colors">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50" ref={scrollRef}>
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gray-900 text-white' : 'bg-indigo-100 text-indigo-600'}`}>
                            {msg.role === 'user' ? <User size={14} /> : <Bot size={16} />}
                        </div>

                        <div className="flex flex-col gap-2 max-w-[85%]">
                            <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                ? 'bg-gray-900 text-white rounded-tr-sm'
                                : 'bg-white border border-gray-100 text-gray-700 rounded-tl-sm'
                                }`}>
                                {msg.content}
                            </div>

                            {/* Generated Form Preview Card */}
                            {msg.generatedForm && (
                                <div className="bg-white border border-indigo-100 rounded-xl overflow-hidden shadow-sm mt-1">
                                    <div className="bg-indigo-50/50 px-3 py-2 border-b border-indigo-50 flex justify-between items-center text-xs text-indigo-700 font-medium">
                                        <span>Generated Form Fields</span>
                                        <span>{msg.generatedForm.reduce((acc: number, row: any) => acc + row.fields.length, 0)} Fields</span>
                                    </div>
                                    <div className="p-3">
                                        <div className="space-y-1 mb-3">
                                            {msg.generatedForm.slice(0, 3).map((row: any, i: number) => (
                                                <div key={i} className="flex flex-wrap gap-1">
                                                    {row.fields.map((f: any, fi: number) => (
                                                        <span key={fi} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] border border-gray-200">
                                                            {f.label}
                                                        </span>
                                                    ))}
                                                </div>
                                            ))}
                                            {msg.generatedForm.length > 3 && (
                                                <div className="text-[10px] text-gray-400 italic">...and more</div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => onApplyForm(msg.generatedForm!)}
                                            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded-lg text-xs font-bold transition-colors"
                                        >
                                            <Play size={12} /> Apply to Form
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                            <Bot size={16} />
                        </div>
                        <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm flex items-center gap-2 text-sm text-gray-500">
                            <Loader2 size={14} className="animate-spin text-indigo-600" />
                            Thinking...
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <div className="relative">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="e.g., Expense report..."
                        className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400"
                        autoFocus
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
