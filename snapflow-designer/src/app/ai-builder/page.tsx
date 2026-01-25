"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowLeft, Loader2, Play } from 'lucide-react';
import { useStore } from '@/store/useStore';
import Link from 'next/link';

export default function AiBuilderPage() {
    const router = useRouter();
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedPlan, setGeneratedPlan] = useState<any[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { executeAiAction, resetWorkflow } = useStore();

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsLoading(true);
        setError(null);
        setGeneratedPlan(null);

        try {
            const response = await fetch('http://localhost:8081/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            if (!response.ok) {
                throw new Error('Failed to generate plan. Ensure Backend and Ollama are running.');
            }

            const json = await response.json();
            console.log("AI Response:", json);
            setGeneratedPlan(json);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApply = () => {
        if (!generatedPlan) return;

        // Reset current workflow to start fresh? Or append?
        // User probably expects a fresh start for "Build with AI"
        if (confirm('This will clear your current canvas and build the generated workflow. Continue?')) {
            resetWorkflow();

            // Map tempIds to real IDs
            const idMap = new Map<string, string>();

            // First pass: Create Nodes
            generatedPlan.forEach(action => {
                if (action.type === 'ADD_NODE') {
                    // Generate a real ID (we can't just rely on executeAiAction to return it easily since it's void,
                    // so we might need to manually construct the action with a predictable ID or handle it carefully.
                    // Actually, executeAiAction in store generates ID internally.
                    // We need to change the store to accept an ID or we generate it here.
                    // Let's modify the action passed to store to INCLUDE the id we generate here.

                    const realId = `${action.nodeType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    idMap.set(action.tempId, realId);

                    // We need to slightly modify executeAiAction to accept an ID if provided
                    // For now, let's assume we update the store to handle this or we just hack it by passing it as "id" in "action" if type allows,
                    // but AiAction type didn't have ID.
                    // Let's extend the logic in this component to call lower-level store methods?
                    // No, cleaner to stick to executeAiAction.
                    // Let's just generate the nodes one by one. But wait, CONNECT_NODES relies on knowing the IDs.

                    // Strategy: We will manually call addNode/addEdge from useStore relative here?
                    // Or better: update `executeAiAction` in store to accept an optional `id`.
                    // But I can't edit the store right now easily without context switch.

                    // Alternative: The store's ADD_NODE can return the ID? No, it's void.

                    // Client-side generation of ID is best practice anyway.
                    // Let's update the Store to allow passing `id` in ADD_NODE action.
                }
            });

            // Actually, let's just do the store update locally here since we have access to `addNode` and `setEdges` via `useStore`.
            const { addNode, setEdges, edges } = useStore.getState();

            const newNodes: any[] = [];
            const newEdges: any[] = [];

            generatedPlan.forEach(action => {
                if (action.type === 'ADD_NODE') {
                    const realId = `${action.nodeType}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                    idMap.set(action.tempId, realId);

                    addNode({
                        id: realId,
                        type: action.nodeType,
                        position: { x: action.x, y: action.y },
                        data: { label: action.label }
                    });
                }
            });

            // Wait a tick for nodes to be settled? access state directly.

            generatedPlan.forEach(action => {
                if (action.type === 'CONNECT_NODES') {
                    const sourceId = idMap.get(action.source);
                    const targetId = idMap.get(action.target);

                    if (sourceId && targetId) {
                        const newEdge = {
                            id: `e-${sourceId}-${targetId}`,
                            source: sourceId,
                            target: targetId,
                            type: 'smoothstep',
                            animated: true,
                            style: { stroke: '#475569', strokeWidth: 2 }
                        };
                        // We use the store's setEdges to append
                        const currentEdges = useStore.getState().edges;
                        useStore.getState().setEdges([...currentEdges, newEdge]);
                    }
                }
            });

            router.push('/designer');
        }
    };

    return (
        <div className="flex h-screen bg-[#F8FAFC]">
            {/* Left Panel - Input */}
            <div className="w-1/3 bg-white border-r border-gray-200 p-8 flex flex-col">
                <Link href="/designer" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors">
                    <ArrowLeft size={16} /> Back to Designer
                </Link>

                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Build with AI</h1>
                        <p className="text-gray-500">Describe your process, and I'll sketch it out for you.</p>
                    </div>

                    <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-indigo-100 rounded-xl p-4 shadow-sm">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., Create a leave request process where employee submits form, manager approves. If approved, email HR, else end."
                            className="w-full h-40 bg-transparent border-none outline-none resize-none text-gray-700 placeholder:text-gray-400 text-lg leading-relaxed"
                        />
                        <div className="flex justify-end mt-2">
                            <span className="text-xs text-indigo-400 font-medium">Powered by Ollama (Local)</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt.trim()}
                        className="w-full flex justify-center items-center gap-2 bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-[0.98]"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" /> Thinking...
                            </>
                        ) : (
                            <>
                                <Sparkles className="text-yellow-400" /> Generate Plan
                            </>
                        )}
                    </button>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="flex-1 bg-[#F1F5F9] p-8 flex flex-col items-center justify-center overflow-auto">
                {generatedPlan ? (
                    <div className="w-full max-w-2xl">
                        <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                <h3 className="font-bold text-gray-700">Generated Action Plan</h3>
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-bold">{generatedPlan.length} Steps</span>
                            </div>
                            <div className="p-0">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                                        <tr>
                                            <th className="px-6 py-3">Action</th>
                                            <th className="px-6 py-3">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {generatedPlan.map((step, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-gray-700">
                                                    {step.type === 'ADD_NODE' ? (step.nodeType === 'userTask' ? 'User Task' : step.nodeType) : 'Connect'}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {step.type === 'ADD_NODE' ? step.label : `${step.source} → ${step.target}`}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={handleApply}
                                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95"
                                >
                                    <Play size={16} /> Apply to Canvas
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-400">
                        <Sparkles size={48} className="mx-auto mb-4 text-gray-300" />
                        <h3 className="text-xl font-bold text-gray-400 mb-2">Ready to Create</h3>
                        <p className="max-w-md mx-auto">Enter a description on the left to generate a workflow automatically using your local AI model.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
