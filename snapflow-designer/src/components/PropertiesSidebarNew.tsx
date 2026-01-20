"use client";

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { PropertiesHeader } from './properties/PropertiesHeader';
import { PropertiesTabs } from './properties/PropertiesTabs';
import { PropertiesFooter } from './properties/PropertiesFooter';
import { GeneralTab } from './properties/tabs/GeneralTab';
import { ConfigTab } from './properties/tabs/ConfigTab';
import { DataTab } from './properties/tabs/DataTab';
import { EdgeData } from './properties/data/EdgeData';
import { useForms } from './properties/hooks/useForms';

type TabId = 'general' | 'config' | 'data';

export function PropertiesSidebar() {
    const { selectedNode, setSelectedNode, updateNodeData, selectedEdge, setSelectedEdge, updateEdgeData } = useStore();
    const [activeTab, setActiveTab] = useState<TabId>('general');

    // Fetch forms using custom hook
    const { forms, loading: formsLoading } = useForms(selectedNode?.type);

    if (!selectedNode && !selectedEdge) return null;

    const handleClose = () => {
        setSelectedNode(null);
        setSelectedEdge(null);
    };

    const handleDelete = () => {
        if (selectedNode) {
            if (confirm('Are you sure you want to delete this node?')) {
                const { nodes, setNodes } = useStore.getState();
                setNodes(nodes.filter((n) => n.id !== selectedNode.id));
                setSelectedNode(null);
            }
        } else if (selectedEdge) {
            if (confirm('Are you sure you want to delete this connection?')) {
                const { edges, setEdges } = useStore.getState();
                setEdges(edges.filter((e) => e.id !== selectedEdge.id));
                setSelectedEdge(null);
            }
        }
    };

    return (
        <aside className="w-96 border-l bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300 z-20">
            <PropertiesHeader
                title={selectedNode ? 'Node Settings' : 'Connection'}
                subtitle={selectedNode ? (selectedNode.type || 'unknown') : 'Flow Logic'}
                onClose={handleClose}
            />

            {selectedNode && (
                <PropertiesTabs activeTab={activeTab} onTabChange={setActiveTab} />
            )}

            <div className="p-6 flex-1 overflow-y-auto bg-gray-50/30">
                {selectedNode ? (
                    <>
                        {activeTab === 'general' && (
                            <GeneralTab
                                node={selectedNode}
                                onUpdate={(data) => updateNodeData(selectedNode.id, data)}
                            />
                        )}

                        {activeTab === 'config' && (
                            <ConfigTab
                                node={selectedNode}
                                onUpdate={(data) => updateNodeData(selectedNode.id, data)}
                            />
                        )}

                        {activeTab === 'data' && (
                            <DataTab
                                node={selectedNode}
                                onUpdate={(data) => updateNodeData(selectedNode.id, data)}
                                forms={forms}
                                formsLoading={formsLoading}
                            />
                        )}
                    </>
                ) : selectedEdge ? (
                    <EdgeData
                        label={(selectedEdge.label as string) || ''}
                        condition={(selectedEdge.data?.condition as string) || ''}
                        onUpdate={(updates) => {
                            // updates is { label?: string, data?: { condition?: string } }
                            // We need to be careful not to wipe out existing data
                            const currentData = selectedEdge.data || {};
                            const newData = updates.data ? { ...currentData, ...updates.data } : currentData;

                            updateEdgeData(selectedEdge.id, {
                                ...updates,
                                data: newData
                            });
                        }}
                    />
                ) : null}
            </div>

            <PropertiesFooter
                itemType={selectedNode ? 'node' : 'edge'}
                onDelete={handleDelete}
            />
        </aside>
    );
}
