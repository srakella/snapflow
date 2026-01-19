import React from 'react';
import { InfoBox } from '../shared/InfoBox';
import { Activity } from 'lucide-react';

interface ServiceTaskDataProps {
    config: any;
    onUpdate: (config: any) => void;
}

export function ServiceTaskData({ config, onUpdate }: ServiceTaskDataProps) {
    return (
        <div>
            <InfoBox
                title="Service Task"
                message="This task will execute automatically. Response data will be stored in process variables."
                icon={Activity}
                variant="warning"
            />

            <div className="mt-4">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Result Variable
                </label>
                <input
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-mono"
                    value={config?.resultVariable || ''}
                    onChange={(e) =>
                        onUpdate({
                            ...config,
                            resultVariable: e.target.value,
                        })
                    }
                    placeholder="apiResponse"
                />
            </div>
        </div>
    );
}
