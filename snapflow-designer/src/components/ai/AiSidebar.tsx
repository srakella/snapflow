import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, X, Bot, User, Play, RefreshCw, Loader2, ArrowRight } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    metrics?: {
        steps?: number;
    };
    generatedPlan?: any[];
}

interface AiSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [expandedPlan, setExpandedPlan] = useState<any[] | undefined>(undefined);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hi! I can help you build or modify your workflow. What would you like to do?' }
    ]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { nodes, edges, resetWorkflow, setNodes, setEdges, addNode } = useStore();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleNewChat = () => {
        if (messages.length > 1 && confirm('Start a new conversation? This will clear current context.')) {
            setMessages([{ role: 'assistant', content: 'Context cleared. What shall we build next?' }]);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input;
        setInput('');

        // Optimistic update
        const newHistory = [...messages, { role: 'user', content: userMessage } as Message];
        setMessages(newHistory);
        setIsLoading(true);

        // Prepare context - Slice last 6 messages to stay within context window
        const contextHistory = newHistory.slice(-6).map(m => ({
            role: m.role,
            content: m.content
        }));

        try {
            const response = await fetch('http://localhost:8081/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: userMessage,
                    messages: contextHistory,
                    context: {
                        nodes: nodes.map(n => ({ id: n.id, type: n.type, label: n.data.label })),
                        edges: edges.map(e => ({ source: e.source, target: e.target }))
                    }
                })
            });

            if (!response.ok) throw new Error('Failed to reach AI service');

            const json = await response.json();

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `I've updated the plan based on your feedback.`,
                generatedPlan: json,
                metrics: { steps: json.length }
            }]);

        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please ensure Ollama is running.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApplyPlan = (plan: any[]) => {
        if (!plan) return;

        // INCREMENTAL UPDATE STRATEGY:
        // We do NOT reset the workflow. We append new nodes and edges.
        // We assume the AI returns "deltas" (new nodes, new connections).

        // ID Mapping Strategy
        const idMap = new Map<string, string>();

        // 1. Create Nodes
        plan.forEach(action => {
            if (action.type === 'ADD_NODE') {
                const realId = `${action.nodeType}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                idMap.set(action.tempId, realId);

                const { addNode } = useStore.getState();
                addNode({
                    id: realId,
                    type: action.nodeType,
                    position: { x: action.x, y: action.y },
                    data: {
                        label: action.label,
                        config: action.config || {}
                    }
                });
            }
        });

        // 2. Create Edges
        setTimeout(() => {
            const { edges, setEdges } = useStore.getState();
            const newEdges = [...edges]; // Start with existing edges!

            plan.forEach(action => {
                if (action.type === 'CONNECT_NODES') {
                    // Source/Target could be a Temp ID (new node) OR a Real ID (existing node)
                    // If it's in idMap, it's a new node. If not, assume it's a real existing ID.
                    const sourceId = idMap.get(action.source) || action.source;
                    const targetId = idMap.get(action.target) || action.target;

                    if (sourceId && targetId) {
                        newEdges.push({
                            id: `e-${sourceId}-${targetId}`,
                            source: sourceId,
                            target: targetId,
                            type: 'smoothstep',
                            animated: false,
                            markerEnd: {
                                type: 'arrowclosed',
                                width: 12,
                                height: 12,
                                color: '#475569',
                            },
                            style: {
                                strokeWidth: 2,
                                stroke: '#475569',
                            },
                        });
                    }
                }
            });
            setEdges(newEdges);
        }, 10);
    };

    if (!isOpen) return null;

    return (
        <div className="w-[400px] border-l border-gray-200 bg-white shadow-xl flex flex-col h-full animate-in slide-in-from-right duration-300 z-30">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-violet-50 to-indigo-50">
                <div className="flex items-center gap-2 text-indigo-900 font-bold">
                    <Sparkles size={18} className="text-indigo-600" />
                    AI Copilot
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleNewChat}
                        className="p-1.5 hover:bg-white/50 rounded-full transition-colors text-indigo-700 disabled:opacity-30"
                        title="New Chat (Clear Context)"
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

                        <div className="flex flex-col gap-2 max-w-[80%]">
                            <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                ? 'bg-gray-900 text-white rounded-tr-sm'
                                : 'bg-white border border-gray-100 text-gray-700 rounded-tl-sm'
                                }`}>
                                {msg.content}
                            </div>

                            {/* Generated Plan Preview Card */}
                            {msg.generatedPlan && (
                                <div className="bg-white border border-indigo-100 rounded-xl overflow-hidden shadow-sm mt-1">
                                    <div className="bg-indigo-50/50 px-3 py-2 border-b border-indigo-50 flex justify-between items-center text-xs text-indigo-700 font-medium">
                                        <span>Generated Workflow</span>
                                        <span>{msg.metrics?.steps} Steps</span>
                                    </div>
                                    <div className="p-3">
                                        <div className="space-y-2 mb-3">
                                            {msg.generatedPlan.slice(0, 3).map((step, i) => (
                                                <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                                                    <ArrowRight size={10} className="text-indigo-300" />
                                                    {step.type === 'ADD_NODE' ? (
                                                        <span>Add <strong>{step.nodeType}</strong>: {step.label}</span>
                                                    ) : (
                                                        <span>Connect nodes</span>
                                                    )}
                                                </div>
                                            ))}
                                            {msg.generatedPlan.length > 3 && (
                                                <button
                                                    onClick={() => setExpandedPlan(msg.generatedPlan)}
                                                    className="text-xs text-indigo-500 hover:text-indigo-700 w-full text-left pl-4 font-medium transition-colors"
                                                >
                                                    + {msg.generatedPlan.length - 3} more actions (View All)
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setExpandedPlan(msg.generatedPlan)}
                                                className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                            >
                                                Details
                                            </button>
                                            <button
                                                onClick={() => handleApplyPlan(msg.generatedPlan!)}
                                                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded-lg text-xs font-bold transition-colors"
                                            >
                                                <Play size={12} /> Apply
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3">
                        {/* Loading State UI */}
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
                        placeholder="e.g., Create a leave request process..."
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
                <div className="mt-2 text-[10px] text-center text-gray-400 flex items-center justify-center gap-1.5">
                    <Sparkles size={10} />
                    Powered by local AI
                </div>
            </div>

            {/* Plan Details Modal */}
            {expandedPlan && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-[600px] h-[500px] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border-2 border-white/20">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Sparkles size={16} className="text-indigo-500" /> Generated Plan Details
                            </h3>
                            <button onClick={() => setExpandedPlan(undefined)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-0">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 sticky top-0 backdrop-blur-sm bg-white/80">
                                    <tr>
                                        <th className="px-6 py-3 border-b">Step</th>
                                        <th className="px-6 py-3 border-b">Action</th>
                                        <th className="px-6 py-3 border-b">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {expandedPlan.map((step, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-gray-400 font-mono text-xs w-12">{idx + 1}</td>
                                            <td className="px-6 py-4 font-bold text-gray-700">
                                                {step.type === 'ADD_NODE' ? (
                                                    <span className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs">
                                                        {step.nodeType === 'userTask' ? 'User Task' : step.nodeType}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-xs">
                                                        Connect
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {step.type === 'ADD_NODE' ? step.label : <span className="font-mono text-xs">{step.source} → {step.target}</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button onClick={() => setExpandedPlan(undefined)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    handleApplyPlan(expandedPlan);
                                    setExpandedPlan(undefined);
                                }}
                                className="px-4 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm flex items-center gap-2"
                            >
                                <Play size={16} /> Apply to Canvas
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
