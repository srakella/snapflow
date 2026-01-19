import React, { useState } from 'react';
import { Plus, X, ChevronDown, ChevronUp, Play, Save } from 'lucide-react';

interface Condition {
    field: string;
    operator: string;
    value: any;
    type: 'string' | 'number' | 'boolean';
}

interface Action {
    type: 'setVariable' | 'routeTo' | 'logMessage';
    variable?: string;
    value?: any;
    targetNode?: string;
    message?: string;
}

interface Rule {
    id: string;
    name: string;
    description: string;
    priority: number;
    conditions: Condition[];
    conditionLogic: 'AND' | 'OR';
    actions: Action[];
    enabled: boolean;
}

const OPERATORS = [
    { value: 'equals', label: '=' },
    { value: 'notEquals', label: '!=' },
    { value: 'greaterThan', label: '>' },
    { value: 'greaterThanOrEqual', label: '>=' },
    { value: 'lessThan', label: '<' },
    { value: 'lessThanOrEqual', label: '<=' },
    { value: 'contains', label: 'contains' },
    { value: 'startsWith', label: 'starts with' },
    { value: 'in', label: 'in' },
    { value: 'isNull', label: 'is null' },
    { value: 'isNotNull', label: 'is not null' },
];

interface RuleEditorProps {
    rule: Rule;
    onChange: (rule: Rule) => void;
    onDelete: () => void;
}

export function RuleEditor({ rule, onChange, onDelete }: RuleEditorProps) {
    const [expanded, setExpanded] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testInput, setTestInput] = useState('{}');
    const [testResult, setTestResult] = useState<any>(null);

    const addCondition = () => {
        onChange({
            ...rule,
            conditions: [
                ...rule.conditions,
                { field: '', operator: 'equals', value: '', type: 'string' }
            ]
        });
    };

    const updateCondition = (index: number, updates: Partial<Condition>) => {
        const newConditions = [...rule.conditions];
        newConditions[index] = { ...newConditions[index], ...updates };
        onChange({ ...rule, conditions: newConditions });
    };

    const removeCondition = (index: number) => {
        onChange({
            ...rule,
            conditions: rule.conditions.filter((_, i) => i !== index)
        });
    };

    const addAction = (type: Action['type']) => {
        const newAction: Action = { type };
        if (type === 'setVariable') {
            newAction.variable = '';
            newAction.value = '';
        } else if (type === 'routeTo') {
            newAction.targetNode = '';
        } else if (type === 'logMessage') {
            newAction.message = '';
        }
        onChange({ ...rule, actions: [...rule.actions, newAction] });
    };

    const updateAction = (index: number, updates: Partial<Action>) => {
        const newActions = [...rule.actions];
        newActions[index] = { ...newActions[index], ...updates };
        onChange({ ...rule, actions: newActions });
    };

    const removeAction = (index: number) => {
        onChange({
            ...rule,
            actions: rule.actions.filter((_, i) => i !== index)
        });
    };

    const testRule = async () => {
        setTesting(true);
        try {
            const input = JSON.parse(testInput);
            const response = await fetch(`http://localhost:8080/api/rules/rules/${rule.id}/test`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input)
            });
            const result = await response.json();
            setTestResult(result);
        } catch (error) {
            setTestResult({ error: 'Invalid JSON or test failed' });
        } finally {
            setTesting(false);
        }
    };

    const renderConditionSummary = () => {
        if (rule.conditions.length === 0) return '(always)';
        return rule.conditions.map((c, i) => (
            <span key={i}>
                {i > 0 && ` ${rule.conditionLogic} `}
                {c.field} {OPERATORS.find(op => op.value === c.operator)?.label} {c.value}
            </span>
        ));
    };

    const renderActionSummary = () => {
        return rule.actions.map((a, i) => (
            <span key={i}>
                {i > 0 && ', '}
                {a.type === 'setVariable' && `Set ${a.variable} = "${a.value}"`}
                {a.type === 'routeTo' && `Route to ${a.targetNode}`}
                {a.type === 'logMessage' && `Log "${a.message}"`}
            </span>
        ));
    };

    return (
        <div className="border border-gray-300 rounded-lg bg-white">
            {/* Collapsed View */}
            <div className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-medium text-gray-500">Priority {rule.priority}</span>
                            <h4 className="text-lg font-semibold text-gray-900">{rule.name}</h4>
                            {!rule.enabled && (
                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">Disabled</span>
                            )}
                        </div>
                        {!expanded && (
                            <div className="text-sm text-gray-600">
                                <div className="mb-1">
                                    <span className="font-medium">IF</span> {renderConditionSummary()}
                                </div>
                                <div>
                                    <span className="font-medium">THEN</span> {renderActionSummary()}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded flex items-center gap-1"
                        >
                            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            {expanded ? 'Collapse' : 'Expand'}
                        </button>
                        <button
                            onClick={onDelete}
                            className="px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Expanded View */}
            {expanded && (
                <div className="border-t border-gray-200 p-4 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
                            <input
                                type="text"
                                value={rule.name}
                                onChange={(e) => onChange({ ...rule, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <input
                                type="number"
                                value={rule.priority}
                                onChange={(e) => onChange({ ...rule, priority: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Conditions */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h5 className="text-sm font-semibold text-gray-900">📌 CONDITIONS</h5>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="radio"
                                        checked={rule.conditionLogic === 'AND'}
                                        onChange={() => onChange({ ...rule, conditionLogic: 'AND' })}
                                    />
                                    All (AND)
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="radio"
                                        checked={rule.conditionLogic === 'OR'}
                                        onChange={() => onChange({ ...rule, conditionLogic: 'OR' })}
                                    />
                                    Any (OR)
                                </label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {rule.conditions.map((condition, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="Field name"
                                        value={condition.field}
                                        onChange={(e) => updateCondition(index, { field: e.target.value })}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                    <select
                                        value={condition.operator}
                                        onChange={(e) => updateCondition(index, { operator: e.target.value })}
                                        className="px-3 py-2 border border-gray-300 rounded-lg"
                                    >
                                        {OPERATORS.map(op => (
                                            <option key={op.value} value={op.value}>{op.label}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Value"
                                        value={condition.value}
                                        onChange={(e) => updateCondition(index, { value: e.target.value })}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                    <button
                                        onClick={() => removeCondition(index)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={addCondition}
                            className="mt-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded flex items-center gap-1"
                        >
                            <Plus size={16} />
                            Add Condition
                        </button>
                    </div>

                    {/* Actions */}
                    <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-3">⚡ ACTIONS</h5>

                        <div className="space-y-2">
                            {rule.actions.map((action, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    {action.type === 'setVariable' && (
                                        <>
                                            <span className="text-sm text-gray-600">Set</span>
                                            <input
                                                type="text"
                                                placeholder="Variable name"
                                                value={action.variable}
                                                onChange={(e) => updateAction(index, { variable: e.target.value })}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                            />
                                            <span className="text-sm text-gray-600">=</span>
                                            <input
                                                type="text"
                                                placeholder="Value"
                                                value={action.value}
                                                onChange={(e) => updateAction(index, { value: e.target.value })}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                            />
                                        </>
                                    )}
                                    {action.type === 'routeTo' && (
                                        <>
                                            <span className="text-sm text-gray-600">Route to</span>
                                            <input
                                                type="text"
                                                placeholder="Node ID"
                                                value={action.targetNode}
                                                onChange={(e) => updateAction(index, { targetNode: e.target.value })}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                            />
                                        </>
                                    )}
                                    <button
                                        onClick={() => removeAction(index)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-2 flex gap-2">
                            <button
                                onClick={() => addAction('setVariable')}
                                className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                            >
                                + Set Variable
                            </button>
                            <button
                                onClick={() => addAction('routeTo')}
                                className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                            >
                                + Route To
                            </button>
                        </div>
                    </div>

                    {/* Test */}
                    <div className="border-t border-gray-200 pt-4">
                        <h5 className="text-sm font-semibold text-gray-900 mb-3">🧪 TEST RULE</h5>
                        <textarea
                            value={testInput}
                            onChange={(e) => setTestInput(e.target.value)}
                            placeholder='{"creditScore": 720, "income": 60000}'
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                            rows={3}
                        />
                        <button
                            onClick={testRule}
                            disabled={testing}
                            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            <Play size={16} />
                            {testing ? 'Testing...' : 'Run Test'}
                        </button>

                        {testResult && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <div className="text-sm font-medium mb-1">
                                    {testResult.matched ? '✅ Rule Matched!' : '❌ Rule Did Not Match'}
                                </div>
                                {testResult.outputData && (
                                    <pre className="text-xs text-gray-700 font-mono">
                                        {JSON.stringify(testResult.outputData, null, 2)}
                                    </pre>
                                )}
                                {testResult.error && (
                                    <div className="text-sm text-red-600">{testResult.error}</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
