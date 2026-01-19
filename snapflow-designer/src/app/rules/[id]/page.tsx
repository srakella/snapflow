'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, ArrowLeft, Plus, Play } from 'lucide-react';
import { RuleEditor } from '../../../components/RuleEditor';

interface Rule {
    id: string;
    name: string;
    description: string;
    priority: number;
    conditions: any[];
    conditionLogic: 'AND' | 'OR';
    actions: any[];
    enabled: boolean;
}

interface RuleSet {
    id?: string;
    name: string;
    description: string;
    category: string;
    visibility: 'public' | 'private' | 'team';
    status: 'draft' | 'active' | 'archived';
}

export default function RuleSetEditorPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;
    const isNew = id === 'new';

    const [ruleSet, setRuleSet] = useState<RuleSet>({
        name: '',
        description: '',
        category: '',
        visibility: 'public',
        status: 'draft',
    });

    const [rules, setRules] = useState<Rule[]>([]);
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isNew && id) {
            fetchRuleSet(id as string);
            fetchRules(id as string);
        }
    }, [id, isNew]);

    const fetchRuleSet = async (ruleSetId: string) => {
        try {
            const response = await fetch(`http://localhost:8080/api/rules/rule-sets/${ruleSetId}`);
            const data = await response.json();
            setRuleSet(data);
        } catch (error) {
            console.error('Error fetching rule set:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRules = async (ruleSetId: string) => {
        try {
            const response = await fetch(`http://localhost:8080/api/rules/rule-sets/${ruleSetId}/rules`);
            const data = await response.json();
            setRules(data);
        } catch (error) {
            console.error('Error fetching rules:', error);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Save rule set
            const ruleSetResponse = await fetch(
                isNew
                    ? 'http://localhost:8080/api/rules/rule-sets'
                    : `http://localhost:8080/api/rules/rule-sets/${id}`,
                {
                    method: isNew ? 'POST' : 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(ruleSet),
                }
            );
            const savedRuleSet = await ruleSetResponse.json();

            // Save rules
            for (const rule of rules) {
                await fetch(
                    rule.id
                        ? `http://localhost:8080/api/rules/rules/${rule.id}`
                        : `http://localhost:8080/api/rules/rule-sets/${savedRuleSet.id}/rules`,
                    {
                        method: rule.id ? 'PUT' : 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(rule),
                    }
                );
            }

            router.push('/rules');
        } catch (error) {
            console.error('Error saving:', error);
        } finally {
            setSaving(false);
        }
    };

    const addRule = () => {
        const newRule: Rule = {
            id: `temp-${Date.now()}`,
            name: 'New Rule',
            description: '',
            priority: rules.length * 10,
            conditions: [],
            conditionLogic: 'AND',
            actions: [],
            enabled: true,
        };
        setRules([...rules, newRule]);
    };

    const updateRule = (index: number, updatedRule: Rule) => {
        const newRules = [...rules];
        newRules[index] = updatedRule;
        setRules(newRules);
    };

    const deleteRule = (index: number) => {
        setRules(rules.filter((_, i) => i !== index));
    };

    const moveRule = (index: number, direction: 'up' | 'down') => {
        const newRules = [...rules];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex >= 0 && targetIndex < rules.length) {
            [newRules[index], newRules[targetIndex]] = [newRules[targetIndex], newRules[index]];
            setRules(newRules);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600 mt-4">Loading rule set...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/rules')}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {isNew ? 'Create Rule Set' : 'Edit Rule Set'}
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    {isNew ? 'Define business rules for your workflows' : ruleSet.name}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => router.push('/rules')}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-6 py-2 bg-[#D41C2C] text-white rounded-lg hover:bg-[#B81926] disabled:opacity-50 flex items-center gap-2"
                            >
                                <Save size={18} />
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
                {/* Rule Set Info */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Rule Set Information</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                value={ruleSet.name}
                                onChange={(e) => setRuleSet({ ...ruleSet, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                placeholder="Loan Approval Rules"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <input
                                type="text"
                                value={ruleSet.category}
                                onChange={(e) => setRuleSet({ ...ruleSet, category: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                placeholder="Finance"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={ruleSet.description}
                                onChange={(e) => setRuleSet({ ...ruleSet, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                rows={3}
                                placeholder="Automated loan approval decision rules"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        checked={ruleSet.visibility === 'public'}
                                        onChange={() => setRuleSet({ ...ruleSet, visibility: 'public' })}
                                    />
                                    <span className="text-sm">🔓 Public</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        checked={ruleSet.visibility === 'private'}
                                        onChange={() => setRuleSet({ ...ruleSet, visibility: 'private' })}
                                    />
                                    <span className="text-sm">🔒 Private</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        checked={ruleSet.visibility === 'team'}
                                        onChange={() => setRuleSet({ ...ruleSet, visibility: 'team' })}
                                    />
                                    <span className="text-sm">👥 Team</span>
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={ruleSet.status}
                                onChange={(e) => setRuleSet({ ...ruleSet, status: e.target.value as any })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                            >
                                <option value="draft">Draft</option>
                                <option value="active">Active</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Rules */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Rules ({rules.length})
                        </h2>
                        <button
                            onClick={addRule}
                            className="px-4 py-2 bg-[#D41C2C] text-white rounded-lg hover:bg-[#B81926] flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Add Rule
                        </button>
                    </div>

                    {rules.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                            <div className="text-4xl mb-3">⚙️</div>
                            <p className="text-gray-600 mb-4">No rules yet</p>
                            <button
                                onClick={addRule}
                                className="px-4 py-2 bg-[#D41C2C] text-white rounded-lg hover:bg-[#B81926]"
                            >
                                Add Your First Rule
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {rules.map((rule, index) => (
                                <RuleEditor
                                    key={rule.id}
                                    rule={rule}
                                    onChange={(updatedRule) => updateRule(index, updatedRule)}
                                    onDelete={() => deleteRule(index)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
