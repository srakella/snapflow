import React from 'react';

interface EmailConfigProps {
    config: any;
    onUpdate: (config: any) => void;
}

export function EmailConfig({ config, onUpdate }: EmailConfigProps) {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-[10px] font-bold text-pink-600 uppercase tracking-wider mb-2">
                    Recipient Email
                </label>
                <input
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-pink-500 transition-colors"
                    value={config?.recipient || ''}
                    onChange={(e) =>
                        onUpdate({
                            ...config,
                            recipient: e.target.value,
                        })
                    }
                    placeholder="user@example.com"
                />
            </div>

            <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Subject
                </label>
                <input
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-pink-500 transition-colors"
                    value={config?.subject || ''}
                    onChange={(e) =>
                        onUpdate({
                            ...config,
                            subject: e.target.value,
                        })
                    }
                    placeholder="Email subject..."
                />
            </div>

            <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Email Body
                </label>
                <textarea
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm min-h-[120px] outline-none focus:border-pink-500 transition-colors"
                    value={config?.body || ''}
                    onChange={(e) =>
                        onUpdate({
                            ...config,
                            body: e.target.value,
                        })
                    }
                    placeholder="Email message content..."
                />
            </div>
        </div>
    );
}
