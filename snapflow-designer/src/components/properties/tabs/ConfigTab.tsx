import React from 'react';
import { Settings2 } from 'lucide-react';
import { AppNode } from '@/store/useStore';
import { AIAgentConfig } from '../config/AIAgentConfig';
import { EmailConfig } from '../config/EmailConfig';
import { TimerConfig } from '../config/TimerConfig';
import { UserTaskConfig } from '../config/UserTaskConfig';
import { ServiceTaskConfig } from '../config/ServiceTaskConfig';
import { DefaultConfig } from '../config/DefaultConfig';

interface ConfigTabProps {
    node: AppNode;
    onUpdate: (data: any) => void;
}

export function ConfigTab({ node, onUpdate }: ConfigTabProps) {
    const updateConfig = (newConfig: any) => {
        onUpdate({ config: newConfig });
    };

    const isServiceTask = node.data.config?.taskType === 'service' || node.type === 'serviceTask';
    const isUserTask =
        (!node.data.config?.taskType || node.data.config?.taskType === 'user') &&
        (node.type === 'task' || node.type === 'userTask');

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-5">
            {/* Task Type Switcher (only for generic 'task' type) */}
            {node.type === 'task' && (
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Settings2 size={12} /> Task Type
                    </label>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() =>
                                updateConfig({ ...node.data.config, taskType: 'user' })
                            }
                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${!node.data.config?.taskType || node.data.config?.taskType === 'user'
                                ? 'bg-white text-gray-800 shadow-sm'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            User Task
                        </button>
                        <button
                            onClick={() =>
                                updateConfig({ ...node.data.config, taskType: 'service' })
                            }
                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${node.data.config?.taskType === 'service'
                                ? 'bg-white text-[#D41C2C] shadow-sm'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            Service Task
                        </button>
                    </div>
                </div>
            )}

            {/* Render appropriate config based on node type */}
            {node.type === 'aiAgent' && (
                <AIAgentConfig config={node.data.config} onUpdate={updateConfig} />
            )}

            {node.type === 'email' && (
                <EmailConfig config={node.data.config} onUpdate={updateConfig} />
            )}

            {node.type === 'timer' && (
                <TimerConfig config={node.data.config} onUpdate={updateConfig} />
            )}

            {isServiceTask && (
                <ServiceTaskConfig config={node.data.config} onUpdate={updateConfig} />
            )}

            {isUserTask && (
                <UserTaskConfig config={node.data.config} onUpdate={updateConfig} />
            )}

            {!['aiAgent', 'email', 'timer', 'task', 'userTask', 'serviceTask'].includes(
                node.type || ''
            ) && <DefaultConfig nodeType={node.type || 'unknown'} />}
        </div>
    );
}
