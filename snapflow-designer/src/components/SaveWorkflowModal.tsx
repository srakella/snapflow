import React from 'react';
import { useRouter } from 'next/navigation';

interface SaveWorkflowModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string) => Promise<any>;
}

export function SaveWorkflowModal({ isOpen, onClose, onSave }: SaveWorkflowModalProps) {
    const router = useRouter();
    const [name, setName] = React.useState(`Workflow ${new Date().toLocaleTimeString()}`);
    const [status, setStatus] = React.useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [logs, setLogs] = React.useState<string[]>([]);

    if (!isOpen) return null;

    const handleSave = async () => {
        setStatus('saving');
        setLogs(prev => [...prev, 'Starting deployment...']);
        try {
            const result = await onSave(name);
            setLogs(prev => [...prev, '✔ Backend persisted JSON state', `✔ Deployed to Engine (ID: ${result.id})`]);
            setStatus('success');
            setTimeout(() => {
                onClose();
                setStatus('idle');
                setLogs([]);
                router.push('/dashboard');
            }, 2000);
        } catch (e: any) {
            setLogs(prev => [...prev, `❌ Error: ${e.message}`]);
            setStatus('error');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-md shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border-t-4 border-[#D41C2C]">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-[#D41C2C] mb-1 font-serif">Save & Launch</h2>
                    <p className="text-sm text-gray-600 mb-6 font-sans">Name your workflow to persist it to the database and deploy it to the engine.</p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1 tracking-wide">Workflow Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-[#D41C2C] focus:border-[#D41C2C] font-medium text-gray-800"
                                placeholder="My Awesome Workflow"
                            />
                        </div>

                        {logs.length > 0 && (
                            <div className="bg-gray-50 border border-gray-200 rounded-sm p-3 font-mono text-xs text-green-700 space-y-1 max-h-32 overflow-y-auto shadow-inner">
                                {logs.map((log, i) => (
                                    <div key={i}>{log}</div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-bold text-[#D41C2C] hover:bg-[#D41C2C]/5 rounded-sm transition-colors uppercase tracking-wide border border-transparent hover:border-[#D41C2C]/10"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={status === 'saving' || status === 'success'}
                            className="bg-[#D41C2C] hover:bg-[#B81926] text-white px-6 py-2 rounded-sm text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 uppercase tracking-wide"
                        >
                            {status === 'saving' && (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            )}
                            {status === 'success' ? 'Deployed!' : 'Save & Launch'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
