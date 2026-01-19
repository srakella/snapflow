import React from 'react';
import { User, Shield } from 'lucide-react';
import { UserLookup } from '../shared/UserLookup';
import { FormSelector } from '../shared/FormSelector';
import { FormDefinition } from '@/services/formService';
import { CANDIDATE_GROUPS } from '@/constants/users';

interface UserTaskDataProps {
    config: any;
    onUpdate: (config: any) => void;
    forms: FormDefinition[];
    formsLoading: boolean;
}

export function UserTaskData({ config, onUpdate, forms, formsLoading }: UserTaskDataProps) {
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
                onCreateNew={() => window.open('/forms/designer', '_blank')}
            />
        </>
    );
}
