import React from 'react';

interface ServiceTaskConfigProps {
    config: any;
    onUpdate: (config: any) => void;
}

export function ServiceTaskConfig({ config, onUpdate }: ServiceTaskConfigProps) {
    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Method
                    </label>
                    <select
                        className="w-full px-2 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-mono font-bold outline-none"
                        value={config?.method || 'GET'}
                        onChange={(e) =>
                            onUpdate({
                                ...config,
                                method: e.target.value,
                            })
                        }
                    >
                        <option>GET</option>
                        <option>POST</option>
                        <option>PUT</option>
                        <option>DELETE</option>
                    </select>
                </div>
                <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Endpoint URL
                    </label>
                    <input
                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-mono outline-none focus:border-blue-500 transition-colors"
                        value={config?.url || ''}
                        onChange={(e) =>
                            onUpdate({
                                ...config,
                                url: e.target.value,
                            })
                        }
                        placeholder="https://api.example.com/..."
                    />
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Request Body (JSON)
                </label>
                <textarea
                    className="w-full p-3 bg-slate-900 text-green-400 border border-slate-700 rounded-lg text-xs font-mono min-h-[100px] outline-none"
                    value={config?.body || ''}
                    onChange={(e) =>
                        onUpdate({
                            ...config,
                            body: e.target.value,
                        })
                    }
                    placeholder={'{\n  "key": "value"\n}'}
                />
            </div>
        </div>
    );
}
