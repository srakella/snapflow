import React from 'react';
import { User, Shield, Clock } from 'lucide-react';
import { UserLookup } from '../shared/UserLookup';
import { FormSelector } from '../shared/FormSelector';
import { FormDefinition } from '@/services/formService';
import { CANDIDATE_GROUPS } from '@/constants/users';

import { useStore, AppNode } from '@/store/useStore';

interface UserTaskDataProps {
    nodeId: string;
    config: any;
    onUpdate: (config: any) => void;
    forms: FormDefinition[];
    formsLoading: boolean;
}

export function UserTaskData({ nodeId, config, onUpdate, forms, formsLoading }: UserTaskDataProps) {
    const { nodes, edges } = useStore();

    const getWorkflowContext = () => {
        // Find upstream nodes
        const visited = new Set<string>();
        const upstreamNodes: any[] = [];
        const queue = [nodeId];

        // BFS backwards
        while (queue.length > 0) {
            const currentId = queue.shift()!;
            if (visited.has(currentId)) continue;
            visited.add(currentId);

            // Find incoming edges
            const incomingEdges = edges.filter(e => e.target === currentId);
            incomingEdges.forEach(edge => {
                const sourceNode = nodes.find(n => n.id === edge.source);
                if (sourceNode && !visited.has(sourceNode.id)) {
                    if (sourceNode.data.config?.formKey) {
                        upstreamNodes.push({
                            id: sourceNode.id,
                            label: sourceNode.data.label,
                            formKey: sourceNode.data.config.formKey
                        });
                    }
                    queue.push(sourceNode.id);
                }
            });
        }
        return { upstream: upstreamNodes };
    };

    const handleCreateForm = () => {
        const context = getWorkflowContext();
        const encodedContext = encodeURIComponent(JSON.stringify(context));
        window.open(`/forms/designer?context=${encodedContext}`, '_blank');
    };

    const handleEditForm = (formId: string) => {
        const context = getWorkflowContext();
        const encodedContext = encodeURIComponent(JSON.stringify(context));
        window.open(`/forms/designer?context=${encodedContext}&formId=${formId}`, '_blank');
    };

    return (
        <>
            <div className="space-y-3">
                <div className="relative">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <User size={12} /> Assignee (User)
                    </label>
                    <UserLookup
                        value={config?.assignee || ''}
                        onChange={(userId) =>
                            onUpdate({
                                ...config,
                                assignee: userId,
                            })
                        }
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                        Direct assignment. User sees task immediately.
                    </p>
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Shield size={12} /> Candidate Groups
                    </label>
                    <select
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#D41C2C]/20 focus:border-[#D41C2C] outline-none"
                        value={config?.candidateGroups || ''}
                        onChange={(e) =>
                            onUpdate({
                                ...config,
                                candidateGroups: e.target.value,
                            })
                        }
                    >
                        {CANDIDATE_GROUPS.map((group) => (
                            <option key={group.value} value={group.value}>
                                {group.label}
                            </option>
                        ))}
                    </select>
                    <p className="text-[10px] text-gray-400 mt-1">
                        Users in group can "claim" this task.
                    </p>
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Clock size={12} /> Due Date
                    </label>
                    <input
                        type="text"
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#D41C2C]/20 focus:border-[#D41C2C] outline-none placeholder:font-normal placeholder:text-gray-400"
                        placeholder="P3D, 2024-12-31, or ${dueDate}"
                        value={config?.dueDate || ''}
                        onChange={(e) => onUpdate({ ...config, dueDate: e.target.value })}
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                        Duration (P1D) or Date (ISO-8601).
                    </p>
                </div>
            </div>

            <FormSelector
                value={config?.formKey || ''}
                forms={forms}
                loading={formsLoading}
                onChange={(formId) =>
                    onUpdate({
                        ...config,
                        formKey: formId,
                    })
                }
                onCreateNew={handleCreateForm}
                onEdit={handleEditForm}
            />
        </>
    );
}
