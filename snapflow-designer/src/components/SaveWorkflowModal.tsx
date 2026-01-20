import React from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../store/useStore';

interface SaveWorkflowModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string) => Promise<any>;
}

export function SaveWorkflowModal({ isOpen, onClose, onSave }: SaveWorkflowModalProps) {
    const router = useRouter();
    const { workflowMetadata, setWorkflowMetadata } = useStore();

    const [name, setName] = React.useState('');
    const [deleteOldVersions, setDeleteOldVersions] = React.useState(false);
    const [status, setStatus] = React.useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [logs, setLogs] = React.useState<string[]>([]);

    // Initialize name when modal opens
    React.useEffect(() => {
        if (isOpen) {
            if (workflowMetadata.name) {
                // Existing workflow - keep the base name
                setName(workflowMetadata.name);
            } else {
                // New workflow - generate default name
                setName(`Workflow ${new Date().toLocaleTimeString()}`);
            }
        }
    }, [isOpen, workflowMetadata.name]);

    if (!isOpen) return null;

    const handleSave = async () => {
        setStatus('saving');
        setLogs([]);

        const isExistingWorkflow = workflowMetadata.name !== null;
        const newVersion = isExistingWorkflow ? workflowMetadata.version + 1 : 1;
        const versionedName = `${name} v${newVersion}`;

        setLogs(prev => [...prev, `Saving ${versionedName}...`]);

        try {
            const result = await onSave(versionedName);
            setLogs(prev => [...prev, '✔ Backend persisted JSON state', `✔ Saved (ID: ${result.id})`]);

            // Update workflow metadata
            setWorkflowMetadata({
                name: name,
                version: newVersion,
                id: result.id,
            });

            // Delete old versions if checkbox is checked
            if (deleteOldVersions && isExistingWorkflow && newVersion > 2) {
                setLogs(prev => [...prev, 'Cleaning up old versions...']);

                // Fetch all workflows with this base name
                const response = await fetch('http://localhost:8081/api/workflows');
                const allWorkflows = await response.json();

                // Find workflows with the same base name
                const sameNameWorkflows = allWorkflows.filter((wf: any) => {
                    const baseName = wf.name.replace(/\s*v\d+$/, '');
                    return baseName === name;
                });

                // Sort by version and delete all except the latest 2
                const sortedWorkflows = sameNameWorkflows
                    .map((wf: any) => {
                        const versionMatch = wf.name.match(/v(\d+)$/);
                        const version = versionMatch ? parseInt(versionMatch[1]) : 1;
                        return { ...wf, version };
                    })
                    .sort((a: any, b: any) => b.version - a.version);

                // Delete all versions except the latest 2
                const toDelete = sortedWorkflows.slice(2);

                for (const wf of toDelete) {
                    try {
                        await fetch(`http://localhost:8081/api/workflows/${wf.id}`, {
                            method: 'DELETE'
                        });
                        setLogs(prev => [...prev, `✔ Deleted ${wf.name}`]);
                    } catch (err) {
                        setLogs(prev => [...prev, `⚠ Failed to delete ${wf.name}`]);
                    }
                }

                if (toDelete.length === 0) {
                    setLogs(prev => [...prev, '✔ No old versions to delete']);
                } else {
                    setLogs(prev => [...prev, `✔ Cleaned up ${toDelete.length} old version(s)`]);
                }
            }

            setStatus('success');
            setTimeout(() => {
                onClose();
                setStatus('idle');
                setLogs([]);
                setDeleteOldVersions(false);
                router.push('/dashboard');
            }, 2500);
        } catch (e: any) {
            setLogs(prev => [...prev, `❌ Error: ${e.message}`]);
            setStatus('error');
        }
    };

    const isExistingWorkflow = workflowMetadata.name !== null;
    const nextVersion = isExistingWorkflow ? workflowMetadata.version + 1 : 1;
    const showDeleteOption = isExistingWorkflow && nextVersion > 2;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-md shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border-t-4 border-[#D41C2C]">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-[#D41C2C] mb-1 font-serif">Save Workflow</h2>
                    <p className="text-sm text-gray-600 mb-6 font-sans">
                        {isExistingWorkflow
                            ? `Saving as version ${nextVersion}. Previous version (v${workflowMetadata.version}) will be kept as backup.`
                            : 'Name your workflow to persist it.'
                        }
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1 tracking-wide">Workflow Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-[#D41C2C] focus:border-[#D41C2C] font-medium text-gray-800"
                                placeholder="My Awesome Workflow"
                                disabled={isExistingWorkflow}
                            />
                            {isExistingWorkflow && (
                                <p className="text-xs text-gray-500 mt-1 italic">Will be saved as: {name} v{nextVersion}</p>
                            )}
                        </div>

                        {showDeleteOption && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-sm p-3">
                                <label className="flex items-start gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={deleteOldVersions}
                                        onChange={e => setDeleteOldVersions(e.target.checked)}
                                        className="mt-0.5 w-4 h-4 text-[#D41C2C] border-gray-300 rounded focus:ring-[#D41C2C]"
                                    />
                                    <div>
                                        <span className="text-sm font-bold text-gray-800">Delete old versions</span>
                                        <p className="text-xs text-gray-600 mt-0.5">
                                            Keep only the latest 2 versions (v{nextVersion} and v{nextVersion - 1}).
                                            All older versions will be permanently deleted.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        )}

                        {logs.length > 0 && (
                            <div className="bg-gray-50 border border-gray-200 rounded-sm p-3 font-mono text-xs text-green-700 space-y-1 max-h-48 overflow-y-auto shadow-inner">
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
                            disabled={status === 'saving' || status === 'success' || !name.trim()}
                            className="bg-[#D41C2C] hover:bg-[#B81926] text-white px-6 py-2 rounded-sm text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 uppercase tracking-wide"
                        >
                            {status === 'saving' && (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            )}
                            {status === 'success' ? 'Saved!' : `Save as v${nextVersion}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
