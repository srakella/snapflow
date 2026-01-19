'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Upload, Download, Filter } from 'lucide-react';
import Link from 'next/link';

interface RuleSet {
    id: string;
    name: string;
    description: string;
    version: string;
    status: 'draft' | 'active' | 'archived';
    category: string;
    visibility: 'public' | 'private' | 'team';
    rulesCount: number;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export default function RulesPage() {
    const [ruleSets, setRuleSets] = useState<RuleSet[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [visibilityFilter, setVisibilityFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        fetchRuleSets();
    }, []);

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

    const filteredRuleSets = ruleSets.filter(rs => {
        const matchesSearch = searchQuery.length < 3 ||
            rs.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            rs.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesVisibility = visibilityFilter === 'all' || rs.visibility === visibilityFilter;
        const matchesStatus = statusFilter === 'all' || rs.status === statusFilter;
        return matchesSearch && matchesVisibility && matchesStatus;
    });

    const getVisibilityIcon = (visibility: string) => {
        switch (visibility) {
            case 'public': return '🔓';
            case 'private': return '🔒';
            case 'team': return '👥';
            default: return '📁';
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            active: 'bg-green-100 text-green-800 border-green-200',
            draft: 'bg-gray-100 text-gray-800 border-gray-200',
            archived: 'bg-red-100 text-red-800 border-red-200',
        };
        return styles[status as keyof typeof styles] || styles.draft;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                ⚙️ Business Rules
                            </h1>
                            <p className="text-gray-600 mt-1">Create and manage decision rules for your workflows</p>
                        </div>
                        <div className="flex gap-3">
                            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                                <Upload size={18} />
                                Import Excel
                            </button>
                            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                                <Download size={18} />
                                Export
                            </button>
                            <Link href="/rules/new">
                                <button className="px-4 py-2 bg-[#D41C2C] text-white rounded-lg hover:bg-[#B81926] flex items-center gap-2">
                                    <Plus size={18} />
                                    New Rule Set
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search rule sets..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>

                        {/* Visibility Filter */}
                        <select
                            value={visibilityFilter}
                            onChange={(e) => setVisibilityFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        >
                            <option value="all">All Visibility</option>
                            <option value="public">🔓 Public</option>
                            <option value="private">🔒 Private</option>
                            <option value="team">👥 Team Only</option>
                        </select>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="draft">Draft</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Rule Sets List */}
            <div className="max-w-7xl mx-auto px-6 pb-12">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#D41C2C]"></div>
                        <p className="text-gray-600 mt-4">Loading rule sets...</p>
                    </div>
                ) : filteredRuleSets.length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <div className="text-6xl mb-4">⚙️</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No rule sets found</h3>
                        <p className="text-gray-600 mb-6">Get started by creating your first rule set</p>
                        <Link href="/rules/new">
                            <button className="px-6 py-3 bg-[#D41C2C] text-white rounded-lg hover:bg-[#B81926]">
                                Create Rule Set
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredRuleSets.map((ruleSet) => (
                            <div
                                key={ruleSet.id}
                                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-semibold text-gray-900">
                                                {getVisibilityIcon(ruleSet.visibility)} {ruleSet.name}
                                            </h3>
                                            <span className="text-sm text-gray-500">v{ruleSet.version}</span>
                                            <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusBadge(ruleSet.status)}`}>
                                                {ruleSet.status.charAt(0).toUpperCase() + ruleSet.status.slice(1)}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mb-3">{ruleSet.description}</p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span>{ruleSet.rulesCount} rules</span>
                                            <span>•</span>
                                            <span>{ruleSet.category}</span>
                                            <span>•</span>
                                            <span>Created by {ruleSet.createdBy}</span>
                                            <span>•</span>
                                            <span>{new Date(ruleSet.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/rules/${ruleSet.id}`}>
                                            <button className="px-4 py-2 text-[#D41C2C] hover:bg-red-50 rounded-lg">
                                                Edit
                                            </button>
                                        </Link>
                                        <button className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                                            Duplicate
                                        </button>
                                        <button className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                                            ⋮
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
