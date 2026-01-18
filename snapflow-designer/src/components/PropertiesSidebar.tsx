import React from 'react';
import { useStore } from '../store/useStore';
import { X, Settings2, Database, Shield, Activity, FileText, User, Sparkles, Trash2 } from 'lucide-react';

export function PropertiesSidebar() {
    const { selectedNode, setSelectedNode, updateNodeData, selectedEdge, setSelectedEdge, updateEdgeData } = useStore();
    const [availableForms, setAvailableForms] = React.useState<any[]>([]);
    const [activeTab, setActiveTab] = React.useState<'general' | 'config' | 'data'>('general');

    React.useEffect(() => {
        if (selectedNode?.type === 'task' || selectedNode?.type === 'start') {
            fetch('http://localhost:8081/api/forms')
                .then(res => res.json())
                .then(data => setAvailableForms(data))
                .catch(err => console.error("Failed to fetch forms", err));
        }
    }, [selectedNode?.type]);

    if (!selectedNode && !selectedEdge) return null;

    const handleClose = () => {
        setSelectedNode(null);
        setSelectedEdge(null);
    };

    return (
        <aside className="w-96 border-l bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300 z-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#D41C2C] to-[#B81926] p-5 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Settings2 size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg leading-tight">
                            {selectedNode ? 'Node Settings' : 'Connection'}
                        </h3>
                        <p className="text-white/70 text-[10px] uppercase font-bold tracking-wider">
                            {selectedNode ? selectedNode.type : 'Flow Logic'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleClose}
                    className="p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded-md transition-all"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Tabs (Only if Node) */}
            {selectedNode && (
                <div className="flex border-b border-gray-200 bg-gray-50/50">
                    {[
                        { id: 'general', label: 'General', icon: Activity },
                        { id: 'config', label: 'Configuration', icon: Settings2 },
                        { id: 'data', label: 'Data & Form', icon: Database },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 py-3 border-b-2 text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-2 ${activeTab === tab.id
                                ? 'border-[#D41C2C] text-[#D41C2C] bg-white'
                                : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Content area */}
            <div className="p-6 flex-1 overflow-y-auto bg-gray-50/30">
                {selectedNode ? (
                    <div className="space-y-6">
                        {/* GENERAL TAB */}
                        {activeTab === 'general' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-5">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Display Label</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#D41C2C]/20 focus:border-[#D41C2C] transition-all outline-none shadow-sm"
                                        value={selectedNode.data.label}
                                        onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                                        placeholder="Name this step..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Description</label>
                                    <textarea
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#D41C2C]/20 focus:border-[#D41C2C] transition-all outline-none shadow-sm min-h-[120px] resize-none"
                                        value={selectedNode.data.description || ''}
                                        onChange={(e) => updateNodeData(selectedNode.id, { description: e.target.value })}
                                        placeholder="Describe the purpose of this step for documentation..."
                                    />
                                </div>
                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                    <h4 className="text-blue-800 text-xs font-bold mb-1 flex items-center gap-2">
                                        <Activity size={14} /> Process Note
                                    </h4>
                                    <p className="text-blue-600 text-[11px] leading-relaxed">
                                        This ID <strong>{selectedNode.id}</strong> is unique and used for tracking audit logs.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* CONFIG TAB */}
                        {activeTab === 'config' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-5">
                                {selectedNode.type === 'aiAgent' ? (
                                    <>
                                        <div>
                                            <label className="block text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Sparkles size={12} /> System Prompt</label>
                                            <textarea
                                                className="w-full p-4 bg-purple-50/50 border border-purple-100 rounded-xl text-sm font-mono text-gray-700 min-h-[160px] focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                                                value={selectedNode.data.config?.systemPrompt || ''}
                                                onChange={(e) => updateNodeData(selectedNode.id, {
                                                    config: { ...selectedNode.data.config, systemPrompt: e.target.value }
                                                })}
                                                placeholder="You are a helpful assistant..."
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Input Var</label>
                                                <input
                                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-mono"
                                                    value={selectedNode.data.config?.inputVariableName || ''}
                                                    onChange={(e) => updateNodeData(selectedNode.id, {
                                                        config: { ...selectedNode.data.config, inputVariableName: e.target.value }
                                                    })}
                                                    placeholder="input"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Output Var</label>
                                                <input
                                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-mono"
                                                    value={selectedNode.data.config?.outputVariableName || ''}
                                                    onChange={(e) => updateNodeData(selectedNode.id, {
                                                        config: { ...selectedNode.data.config, outputVariableName: e.target.value }
                                                    })}
                                                    placeholder="output"
                                                />
                                            </div>
                                        </div>
                                    </>
                                ) : selectedNode.type === 'task' ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                <Settings2 size={12} /> Task Type
                                            </label>
                                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                                <button
                                                    onClick={() => updateNodeData(selectedNode.id, { config: { ...selectedNode.data.config, taskType: 'user' } })}
                                                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${(!selectedNode.data.config?.taskType || selectedNode.data.config?.taskType === 'user') ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                                >
                                                    User Task
                                                </button>
                                                <button
                                                    onClick={() => updateNodeData(selectedNode.id, { config: { ...selectedNode.data.config, taskType: 'service' } })}
                                                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${selectedNode.data.config?.taskType === 'service' ? 'bg-white text-[#D41C2C] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                                >
                                                    Service Task
                                                </button>
                                            </div>
                                        </div>

                                        {selectedNode.data.config?.taskType === 'service' && (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div className="col-span-1">
                                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Method</label>
                                                        <select
                                                            className="w-full px-2 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-mono font-bold outline-none"
                                                            value={selectedNode.data.config?.method || 'GET'}
                                                            onChange={(e) => updateNodeData(selectedNode.id, {
                                                                config: { ...selectedNode.data.config, method: e.target.value }
                                                            })}
                                                        >
                                                            <option>GET</option>
                                                            <option>POST</option>
                                                            <option>PUT</option>
                                                            <option>DELETE</option>
                                                        </select>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Endpoint URL</label>
                                                        <input
                                                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-mono outline-none focus:border-blue-500 transition-colors"
                                                            value={selectedNode.data.config?.url || ''}
                                                            onChange={(e) => updateNodeData(selectedNode.id, {
                                                                config: { ...selectedNode.data.config, url: e.target.value }
                                                            })}
                                                            placeholder="https://api.example.com/..."
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Request Body (JSON)</label>
                                                    <textarea
                                                        className="w-full p-3 bg-slate-900 text-green-400 border border-slate-700 rounded-lg text-xs font-mono min-h-[100px] outline-none"
                                                        value={selectedNode.data.config?.body || ''}
                                                        onChange={(e) => updateNodeData(selectedNode.id, {
                                                            config: { ...selectedNode.data.config, body: e.target.value }
                                                        })}
                                                        placeholder={'{\n  "key": "value"\n}'}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {(!selectedNode.data.config?.taskType || selectedNode.data.config?.taskType === 'user') && (
                                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-center">
                                                <p className="text-xs text-blue-800">
                                                    Configure assignment and forms in the <strong>Data & Form</strong> tab.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-xl text-center">
                                        <div className="p-3 bg-gray-50 rounded-full mb-3 text-gray-400">
                                            <Settings2 size={24} />
                                        </div>
                                        <p className="text-sm font-medium text-gray-500">No specific configuration needed for this node type.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* DATA TAB */}
                        {activeTab === 'data' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                                {(selectedNode.type === 'task' || selectedNode.type === 'start') ? (
                                    <>
                                        {/* User Task Data Config */}
                                        {(!selectedNode.data.config?.taskType || selectedNode.data.config?.taskType === 'user') && (
                                            <>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                        <User size={12} /> Assignee Group
                                                    </label>
                                                    <select
                                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#D41C2C]/20 focus:border-[#D41C2C] outline-none"
                                                        value={selectedNode.data.config?.assignee || ''}
                                                        onChange={(e) => updateNodeData(selectedNode.id, {
                                                            config: { ...selectedNode.data.config, assignee: e.target.value }
                                                        })}
                                                    >
                                                        <option value="">Unassigned</option>
                                                        <option value="admins">Administrators</option>
                                                        <option value="approvers">Approvers Team</option>
                                                        <option value="users">Standard Users</option>
                                                        <option value="manager">Manager</option>
                                                    </select>
                                                </div>

                                                <div className="pt-4 border-t border-gray-100">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                                            <FileText size={12} /> Attached Form
                                                        </label>
                                                        <a href="/forms/designer" target="_blank" className="text-[10px] font-bold text-[#D41C2C] hover:underline flex items-center gap-1">
                                                            + Create New
                                                        </a>
                                                    </div>

                                                    <select
                                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#D41C2C]/20 focus:border-[#D41C2C] outline-none appearance-none"
                                                        value={selectedNode.data.config?.formKey || ''}
                                                        onChange={(e) => updateNodeData(selectedNode.id, {
                                                            config: { ...selectedNode.data.config, formKey: e.target.value }
                                                        })}
                                                    >
                                                        <option value="">Select a form...</option>
                                                        {availableForms.map(form => (
                                                            <option key={form.id} value={form.id}>{form.name}</option>
                                                        ))}
                                                    </select>

                                                    {selectedNode.data.config?.formKey ? (
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
                                            </>
                                        )}

                                        {/* Service Task Data Config */}
                                        {selectedNode.data.config?.taskType === 'service' && (
                                            <div>
                                                <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl mb-4">
                                                    <h4 className="text-yellow-800 text-xs font-bold mb-1 flex items-center gap-2">
                                                        <Activity size={14} /> Service Task
                                                    </h4>
                                                    <p className="text-yellow-600 text-[11px] leading-relaxed">
                                                        This task will execute automatically. Response data will be stored in process variables.
                                                    </p>
                                                </div>

                                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Result Variable</label>
                                                <input
                                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-mono"
                                                    value={selectedNode.data.config?.resultVariable || ''}
                                                    onChange={(e) => updateNodeData(selectedNode.id, {
                                                        config: { ...selectedNode.data.config, resultVariable: e.target.value }
                                                    })}
                                                    placeholder="apiResponse"
                                                />
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-10 text-gray-400 text-sm">
                                        Data configuration not available for this node type.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : selectedEdge ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Rule Label</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#D41C2C]/20 focus:border-[#D41C2C] transition-all outline-none"
                                value={selectedEdge.label as string || ''}
                                onChange={(e) => updateEdgeData(selectedEdge.id, { label: e.target.value })}
                                placeholder="Yes, No, > $500..."
                            />
                        </div>
                        <div className="mt-4 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                            <h4 className="text-orange-800 text-xs font-bold mb-1 flex items-center gap-2">
                                <Database size={14} /> Conditional Flow
                            </h4>
                            <p className="text-orange-600 text-[11px] leading-relaxed">
                                Use this label to define the business rule for taking this path (e.g., "Amount &gt; 1000").
                            </p>
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t bg-gray-50 flex justify-center">
                <button
                    onClick={() => {
                        if (selectedNode) {
                            if (confirm('Are you sure you want to delete this node?')) {
                                const { nodes, setNodes } = useStore.getState();
                                setNodes(nodes.filter(n => n.id !== selectedNode.id));
                                setSelectedNode(null);
                            }
                        } else if (selectedEdge) {
                            if (confirm('Are you sure you want to delete this connection?')) {
                                const { edges, setEdges } = useStore.getState();
                                setEdges(edges.filter(e => e.id !== selectedEdge.id));
                                setSelectedEdge(null);
                            }
                        }
                    }}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-all font-bold text-xs uppercase"
                >
                    <Trash2 size={14} /> Delete {selectedNode ? 'Node' : 'Connection'}
                </button>
            </div>
        </aside>
    );
}
