import React from 'react';
import { useStore } from '../store/useStore';
import { X, Settings2 } from 'lucide-react';

export function PropertiesSidebar() {
    const { selectedNode, setSelectedNode, updateNodeData, selectedEdge, setSelectedEdge, updateEdgeData } = useStore();

    if (!selectedNode && !selectedEdge) return null;

    const handleClose = () => {
        setSelectedNode(null);
        setSelectedEdge(null);
    };

    return (
        <aside className="w-80 border-l bg-white shadow-xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-2">
                    <Settings2 size={18} className="text-primary" />
                    <h3 className="font-bold text-gray-800">
                        {selectedNode ? 'Node Properties' : 'Connection Properties'}
                    </h3>
                </div>
                <button
                    onClick={handleClose}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            <div className="p-6 flex flex-col gap-6 overflow-y-auto">
                {selectedNode ? (
                    <>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Label</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                                value={selectedNode.data.label}
                                onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description</label>
                            <textarea
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none min-h-[100px]"
                                value={selectedNode.data.description || ''}
                                onChange={(e) => updateNodeData(selectedNode.id, { description: e.target.value })}
                                placeholder="What does this step do?"
                            />
                        </div>

                        <div className="pt-4 border-t">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">Configuration</h4>
                            {selectedNode.type === 'aiAgent' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Model Prompt</label>
                                        <textarea
                                            className="w-full p-2 border rounded-md bg-purple-50 text-sm italic"
                                            value={selectedNode.data.config?.prompt || ''}
                                            onChange={(e) => updateNodeData(selectedNode.id, {
                                                config: { ...selectedNode.data.config, prompt: e.target.value }
                                            })}
                                            placeholder="System instructions for the AI..."
                                        />
                                    </div>
                                </div>
                            )}

                            {selectedNode.type === 'task' && (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Assigned Group</label>
                                    <select
                                        className="w-full p-2 border rounded-md"
                                        value={selectedNode.data.config?.assignee || ''}
                                        onChange={(e) => updateNodeData(selectedNode.id, {
                                            config: { ...selectedNode.data.config, assignee: e.target.value }
                                        })}
                                    >
                                        <option value="">Unassigned</option>
                                        <option value="admins">Admins</option>
                                        <option value="approvers">Approvers</option>
                                        <option value="users">Standard Users</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </>
                ) : selectedEdge ? (
                    <>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Connection Label</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                                value={selectedEdge.label as string || ''}
                                onChange={(e) => updateEdgeData(selectedEdge.id, { label: e.target.value })}
                                placeholder="e.g., Yes, No, Approved"
                            />
                        </div>
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
                            Labels added here will appear directly on the connector line.
                        </div>
                    </>
                ) : null}
            </div>
        </aside>
    );
}
