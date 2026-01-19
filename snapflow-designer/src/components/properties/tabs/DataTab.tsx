import React from 'react';
import { AppNode } from '@/store/useStore';
import { FormDefinition } from '@/services/formService';
import { UserTaskData } from '../data/UserTaskData';
import { ServiceTaskData } from '../data/ServiceTaskData';

interface DataTabProps {
    node: AppNode;
    onUpdate: (data: any) => void;
    forms: FormDefinition[];
    formsLoading: boolean;
}

export function DataTab({ node, onUpdate, forms, formsLoading }: DataTabProps) {
    const updateConfig = (newConfig: any) => {
        onUpdate({ config: newConfig });
    };

    const isServiceTask = node.data.config?.taskType === 'service' || node.type === 'serviceTask';
    const isUserTask =
        (!node.data.config?.taskType || node.data.config?.taskType === 'user' || node.type === 'userTask') &&
        node.type !== 'serviceTask';

    const isTaskType =
        node.type === 'task' ||
        node.type === 'start' ||
        node.type === 'userTask' ||
        node.type === 'serviceTask';

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
            {isTaskType ? (
                <>
                    {/* User Task Data Config */}
                    {isUserTask && (
                        <UserTaskData
                            config={node.data.config}
                            onUpdate={updateConfig}
                            forms={forms}
                            formsLoading={formsLoading}
                        />
                    )}

                    {/* Service Task Data Config */}
                    {isServiceTask && (
                        <ServiceTaskData config={node.data.config} onUpdate={updateConfig} />
                    )}
                </>
            ) : (
                <div className="text-center py-10 text-gray-400 text-sm">
                    Data configuration not available for this node type.
                </div>
            )}
        </div>
    );
}
