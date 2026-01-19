import React, { useState, useEffect } from 'react';
import { Search, Eye, Plus, ChevronRight } from 'lucide-react';

interface RuleSet {
    id: string;
    name: string;
    description: string;
    visibility: 'public' | 'private' | 'team';
    rulesCount: number;
    category: string;
}

interface RulesEngineConfigProps {
    nodeId: string;
    config: any;
    onUpdate: (config: any) => void;
}

export function RulesEngineConfig({ nodeId, config, onUpdate }: RulesEngineConfigProps) {
    const [ruleSets, setRuleSets] = useState<RuleSet[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRuleSet, setSelectedRuleSet] = useState<RuleSet | null>(null);
    const [inputMappings, setInputMappings] = useState<Record<string, string>>(config?.inputMappings || {});
    const [outputMappings, setOutputMappings] = useState<Record<string, string>>(config?.outputMappings || {});
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        fetchRuleSets();
        if (config?.ruleSetId) {
            fetchRuleSetDetails(config.ruleSetId);
        }
    }, [config?.ruleSetId]);

    const fetchRuleSets = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/rules/rule-sets');
            const data = await response.json();
            setRuleSets(data);
        } catch (error) {
            console.error('Error fetching rule sets:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRuleSetDetails = async (ruleSetId: string) => {
        try {
            const response = await fetch(`http://localhost:8080/api/rules/rule-sets/${ruleSetId}`);
            const data = await response.json();
            setSelectedRuleSet(data);
        } catch (error) {
            console.error('Error fetching rule set details:', error);
        }
    };

    const handleSelectRuleSet = (ruleSet: RuleSet) => {
        setSelectedRuleSet(ruleSet);
        onUpdate({
            ...config,
            ruleSetId: ruleSet.id,
            ruleSetName: ruleSet.name,
        });
    };

    const handleInputMappingChange = (ruleField: string, workflowVariable: string) => {
        const newMappings = { ...inputMappings, [ruleField]: workflowVariable };
        setInputMappings(newMappings);
        onUpdate({ ...config, inputMappings: newMappings });
    };

    const handleOutputMappingChange = (ruleField: string, workflowVariable: string) => {
        const newMappings = { ...outputMappings, [ruleField]: workflowVariable };
        setOutputMappings(newMappings);
        onUpdate({ ...config, outputMappings: newMappings });
    };

    const filteredRuleSets = ruleSets.filter(rs =>
        rs.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rs.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getVisibilityIcon = (visibility: string) => {
        switch (visibility) {
            case 'public': return '🔓';
            case 'private': return '🔒';
            case 'team': return '👥';
            default: return '📁';
        }
    };

    return (
        <div className="space-y-4">
            {/* Rule Set Selector */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Rule Set
                </label>

                {/* Search */}
                <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search rules..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Rule Sets List */}
                <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
                    ) : filteredRuleSets.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">No rule sets found</div>
                    ) : (
                        filteredRuleSets.map((ruleSet) => (
                            <button
                                key={ruleSet.id}
                                onClick={() => handleSelectRuleSet(ruleSet)}
                                className={`w-full p-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${selectedRuleSet?.id === ruleSet.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-base">{getVisibilityIcon(ruleSet.visibility)}</span>
                                            <span className="font-medium text-sm text-gray-900 truncate">
                                                {ruleSet.name}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 line-clamp-2">{ruleSet.description}</p>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                            <span>{ruleSet.rulesCount} rules</span>
                                            <span>•</span>
                                            <span>{ruleSet.category}</span>
                                        </div>
                                    </div>
                                    {selectedRuleSet?.id === ruleSet.id && (
                                        <ChevronRight size={16} className="text-blue-600 flex-shrink-0 ml-2" />
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* Create New Link */}
                <button className="w-full mt-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg flex items-center justify-center gap-2">
                    <Plus size={16} />
                    Create New Rule Set
                </button>
            </div>

            {/* Selected Rule Set Info */}
            {selectedRuleSet && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900 mb-1">
                                {getVisibilityIcon(selectedRuleSet.visibility)} {selectedRuleSet.name}
                            </div>
                            <p className="text-xs text-gray-600">{selectedRuleSet.description}</p>
                        </div>
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className="p-1 hover:bg-blue-100 rounded"
                        >
                            <Eye size={16} className="text-blue-600" />
                        </button>
                    </div>
                    <div className="text-xs text-gray-500">
                        {selectedRuleSet.rulesCount} rules • {selectedRuleSet.category}
                    </div>
                </div>
            )}

            {/* Input Variable Mapping */}
            {selectedRuleSet && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        📥 Input Variables
                    </label>
                    <div className="space-y-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-2">
                            Map workflow variables to rule inputs
                        </p>
                        {/* Common fields for loan approval example */}
                        {['creditScore', 'income', 'debtRatio'].map((field) => (
                            <div key={field} className="flex items-center gap-2">
                                <span className="text-sm text-gray-700 w-32">{field}</span>
                                <span className="text-gray-400">←</span>
                                <input
                                    type="text"
                                    placeholder={`workflow.${field}`}
                                    value={inputMappings[field] || ''}
                                    onChange={(e) => handleInputMappingChange(field, e.target.value)}
                                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Output Variable Mapping */}
            {selectedRuleSet && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        📤 Output Variables
                    </label>
                    <div className="space-y-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-2">
                            Map rule outputs to workflow variables
                        </p>
                        {['decision', 'reason'].map((field) => (
                            <div key={field} className="flex items-center gap-2">
                                <span className="text-sm text-gray-700 w-32">{field}</span>
                                <span className="text-gray-400">→</span>
                                <input
                                    type="text"
                                    placeholder={`workflow.${field}`}
                                    value={outputMappings[field] || ''}
                                    onChange={(e) => handleOutputMappingChange(field, e.target.value)}
                                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Test with Sample Data */}
            {selectedRuleSet && (
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    Test with Sample Data
                </button>
            )}
        </div>
    );
}
