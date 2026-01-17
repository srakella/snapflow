import React from 'react';

interface LoadWorkflowButtonProps {
    onLoad: (json: any) => void;
}

export function LoadWorkflowButton({ onLoad }: LoadWorkflowButtonProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [workflows, setWorkflows] = React.useState<any[]>([]);

    const handleLoadClick = async () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            try {
                const res = await fetch('http://localhost:8081/api/workflows');
                const data = await res.json();
                setWorkflows(data);
            } catch (e) {
                console.error("Failed to load workflows", e);
            }
        }
    };

    return (
        <div className="relative">
            <button
                onClick={handleLoadClick}
                className="flex items-center gap-2 bg-white text-[#D41C2C] border border-[#D41C2C] px-4 py-2 rounded-sm text-sm font-bold hover:bg-[#D41C2C] hover:text-white transition-all active:scale-95 uppercase tracking-wide shadow-sm"
            >
                Load
            </button>

            {isOpen && (
                <div className="absolute top-12 left-0 w-64 bg-white rounded-md shadow-xl border border-gray-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wilder mb-2 px-2 border-b border-gray-100 pb-1">Saved Workflows</h3>
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                        {workflows.length === 0 ? (
                            <div className="text-sm text-gray-400 px-2 py-4 text-center italic">No saved workflows</div>
                        ) : (
                            workflows.map((wf) => (
                                <button
                                    key={wf.id}
                                    onClick={() => {
                                        onLoad(wf.jsonState);
                                        setIsOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-[#FCCF0A]/20 hover:text-[#D41C2C] rounded-sm transition-colors truncate font-medium"
                                >
                                    {wf.name}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
