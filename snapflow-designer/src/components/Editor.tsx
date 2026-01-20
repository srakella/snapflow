"use client";

import React, { useCallback, useRef, useEffect } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    BackgroundVariant,
    Panel,
    ReactFlowProvider,
    addEdge,
    useReactFlow,
    NodeTypes,
    MarkerType,
} from '@xyflow/react';
import { Rocket, LayoutGrid, Home, FileText, FilePlus, MessageSquare, Save } from 'lucide-react';
import Link from 'next/link';
import '@xyflow/react/dist/style.css';

import { useStore } from '../store/useStore';
import { mapToBPMN } from '../lib/bpmnMapper';
import { TaskNode } from './nodes/TaskNode';
import { GatewayNode } from './nodes/GatewayNode';
import { AIAgentNode } from './nodes/AIAgentNode';
import { StartNode } from './nodes/StartNode';
import { EndNode } from './nodes/EndNode';
import { EmailNode } from './nodes/EmailNode';
import { TimerNode } from './nodes/TimerNode';
import { SidePalette } from './SidePalette';
import { PropertiesSidebar } from './PropertiesSidebarNew';

import { LoadWorkflowButton } from './LoadWorkflowButton';
import { SaveWorkflowModal } from './SaveWorkflowModal';
import { workflowService } from '../services/workflowService';
import { UserTaskNode } from './nodes/UserTaskNode';
import { ServiceTaskNode } from './nodes/ServiceTaskNode';
import { RulesEngineNode } from './nodes/RulesEngineNode';
import { DynamicRouterNode } from './nodes/DynamicRouterNode';
import CommentsPanel from './CommentsPanel';

const nodeTypes: NodeTypes = {
    start: StartNode as any,
    end: EndNode as any,
    task: TaskNode as any,
    userTask: UserTaskNode as any,
    serviceTask: ServiceTaskNode as any,
    gateway: GatewayNode as any,
    aiAgent: AIAgentNode as any,
    email: EmailNode as any,
    timer: TimerNode as any,
    rulesEngine: RulesEngineNode as any,
    dynamicRouter: DynamicRouterNode as any,
};

const defaultEdgeOptions = {
    type: 'smoothstep',
    animated: false,
    style: {
        strokeWidth: 2,
        stroke: '#6b7280',
        strokeLinecap: 'round' as const,
    },
    markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#6b7280',
        width: 16,
        height: 16,
    },
};

function Flow() {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        addNode,
        setSelectedNode,
        setSelectedEdge,
        setNodes,
        setEdges,
        selectedNode,
        workflowMetadata,
        setWorkflowMetadata,
        resetWorkflow,
    } = useStore();

    // Handler for creating a new process
    const handleNewProcess = useCallback(() => {
        if (nodes.length > 0 || edges.length > 0) {
            const confirmed = window.confirm('Are you sure you want to start a new process? Any unsaved changes will be lost.');
            if (!confirmed) return;
        }
        resetWorkflow();
    }, [nodes.length, edges.length, resetWorkflow]);

    const { screenToFlowPosition, toObject } = useReactFlow();

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');

            if (!type) return;

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode = {
                id: `${type}-${Date.now()}`,
                type,
                position,
                data: { label: `New ${type}` },
            };

            addNode(newNode);
        },
        [screenToFlowPosition, addNode]
    );

    const onNodeClick = useCallback((_: React.MouseEvent, node: any) => {
        setSelectedNode(node);
    }, [setSelectedNode]);

    const onEdgeClick = useCallback((_: React.MouseEvent, edge: any) => {
        setSelectedEdge(edge);
    }, [setSelectedEdge]);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
        setSelectedEdge(null);
    }, [setSelectedNode, setSelectedEdge]);


    const [isSaveModalOpen, setIsSaveModalOpen] = React.useState(false);


    const handleDeploy = async (name: string) => {
        const flowObject = toObject();
        const xml = mapToBPMN(nodes, edges, name);

        console.log('Dual-Save: Saving JSON + XML...');

        try {
            const savedDoc = await workflowService.save({
                name,
                json: flowObject,
                xml,
            });
            return savedDoc;
        } catch (error) {
            console.error('Save failed:', error);
            throw error;
        }
    };

    return (
        <div className="flex h-full w-full bg-[#f4f4f4] overflow-hidden">
            <SidePalette />

            <div className="flex-grow relative" ref={reactFlowWrapper}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onNodeClick={onNodeClick}
                    onEdgeClick={onEdgeClick}
                    onPaneClick={onPaneClick}
                    nodeTypes={nodeTypes}
                    defaultEdgeOptions={defaultEdgeOptions}
                    snapToGrid={true}
                    snapGrid={[15, 15]}
                    connectionRadius={30}
                    connectionLineStyle={{
                        strokeWidth: 2,
                        stroke: '#6b7280',
                        strokeDasharray: '5,5',
                    }}
                    minZoom={0.2}
                    maxZoom={4}
                    defaultViewport={{ x: 250, y: 100, zoom: 0.8 }}
                    proOptions={{ hideAttribution: true }}
                >
                    <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#cbd5e1" />
                    <Controls />


                    <Panel position="top-left" className="bg-white/95 backdrop-blur-sm p-3 border-t-4 border-[#D41C2C] rounded-sm shadow-xl flex items-center gap-4">
                        <div className="flex flex-col">
                            <h2 className="text-lg font-bold text-gray-900 leading-none">Workflow Designer</h2>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                                {workflowMetadata.name ? `Editing: ${workflowMetadata.name} v${workflowMetadata.version}` : 'Editing: New Process'}
                            </span>
                        </div>

                        <div className="h-8 w-[1px] bg-gray-200" />

                        <div className="flex gap-2">
                            <button
                                onClick={handleNewProcess}
                                className="flex items-center gap-2 bg-white text-gray-700 px-4 py-1.5 rounded-sm text-sm font-bold shadow-sm hover:bg-gray-50 hover:shadow-md transition-all active:scale-95 border border-gray-200 uppercase tracking-wide"
                                title="Start a new process"
                            >
                                <FilePlus size={16} />
                                New
                            </button>

                            <LoadWorkflowButton
                                onLoad={(json: any, metadata: { name: string; id: string }) => {
                                    const { x, y, zoom } = json.viewport;
                                    setNodes(json.nodes || []);
                                    setEdges(json.edges || []);
                                    // Extract version from name (e.g., "Expense Approval v3" -> 3)
                                    const versionMatch = metadata.name.match(/v(\d+)$/);
                                    const version = versionMatch ? parseInt(versionMatch[1]) : 1;
                                    const baseName = metadata.name.replace(/\s*v\d+$/, '');
                                    setWorkflowMetadata({
                                        name: baseName,
                                        version: version,
                                        id: metadata.id,
                                    });
                                }}
                            />

                            <button
                                onClick={() => setIsSaveModalOpen(true)}
                                className="flex items-center gap-2 bg-[#D41C2C] text-white px-4 py-1.5 rounded-sm text-sm font-bold shadow-sm hover:bg-[#B81926] hover:shadow-md transition-all active:scale-95 group uppercase tracking-wide"
                            >
                                <Save size={16} />
                                Save
                            </button>


                        </div>
                    </Panel>
                </ReactFlow>

                <SaveWorkflowModal
                    isOpen={isSaveModalOpen}
                    onClose={() => setIsSaveModalOpen(false)}
                    onSave={handleDeploy}
                />
            </div >

            <PropertiesSidebar />
        </div >
    );
}

export default function Editor() {
    return (
        <ReactFlowProvider>
            <Flow />
        </ReactFlowProvider>
    );
}
