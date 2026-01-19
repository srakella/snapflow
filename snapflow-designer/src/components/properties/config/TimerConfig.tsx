import React from 'react';
import { InfoBox } from '../shared/InfoBox';
import { Activity } from 'lucide-react';

interface TimerConfigProps {
    config: any;
    onUpdate: (config: any) => void;
}

export function TimerConfig({ config, onUpdate }: TimerConfigProps) {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2">
                    Duration
                </label>
                <input
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-amber-500 transition-colors"
                    value={config?.duration || ''}
                    onChange={(e) =>
                        onUpdate({
                            ...config,
                            duration: e.target.value,
                        })
                    }
                    placeholder="e.g., 5m, 1h, 2d"
                />
            </div>

            <InfoBox
                title="Timer Format"
                message="Use ISO 8601 duration format (PT5M for 5 minutes, PT1H for 1 hour, P1D for 1 day)"
                icon={Activity}
                variant="warning"
            />
        </div>
    );
}
