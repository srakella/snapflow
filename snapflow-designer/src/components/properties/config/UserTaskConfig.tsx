import React from 'react';
import { InfoBox } from '../shared/InfoBox';
import { ConditionalExecution } from '../shared/ConditionalExecution';
import { Activity } from 'lucide-react';

interface UserTaskConfigProps {
    config: any;
    onUpdate: (config: any) => void;
}

export function UserTaskConfig({ config, onUpdate }: UserTaskConfigProps) {
    return (
        <div className="space-y-4">
            <InfoBox
                title="User Task"
                message="Configure assignment and forms in the <strong>Data &amp; Form</strong> tab."
                icon={Activity}
                variant="info"
            />

            <ConditionalExecution
                value={config?.activationCondition}
                onChange={(condition) =>
                    onUpdate({
                        ...config,
                        activationCondition: condition,
                    })
                }
            />
        </div>
    );
}
