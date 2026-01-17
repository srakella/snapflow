"use client";

import React, { useCallback, useRef } from 'react';
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
import { Rocket } from 'lucide-react';
import '@xyflow/react/dist/style.css';

import { useStore } from '../store/useStore';
import { mapToBPMN } from '../lib/bpmnMapper';
import { TaskNode } from './nodes/TaskNode';
import { GatewayNode } from './nodes/GatewayNode';
import { AIAgentNode } from './nodes/AIAgentNode';
import { StartNode } from './nodes/StartNode';
import { EndNode } from './nodes/EndNode';
import { SidePalette } from './SidePalette';
import { PropertiesSidebar } from './PropertiesSidebar';

import { LoadWorkflowButton } from './LoadWorkflowButton';
import { SaveWorkflowModal } from './SaveWorkflowModal';

const nodeTypes: NodeTypes = {
    start: StartNode as any,
    end: EndNode as any,
    task: TaskNode as any,
    gateway: GatewayNode as any,
    aiAgent: AIAgentNode as any,
};

const defaultEdgeOptions = {
    type: 'step',
    animated: true,
    style: { strokeWidth: 2, stroke: '#94a3b8' },
    markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#94a3b8',
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
    } = useStore();

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

    // inside Flow component
    const handleDeploy = async (name: string) => {
        const flowObject = toObject();
        const xml = mapToBPMN(nodes, edges);

        console.log('Dual-Save: Saving JSON + XML...');

        const response = await fetch('http://localhost:8081/api/workflows/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name,
                json: flowObject,
                xml: xml
            }),
        });

        if (response.ok) {
            return await response.json();
        } else {
            const errorData = await response.text();
            throw new Error(errorData || 'Save failed');
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#f4f4f4] overflow-hidden">
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
                    fitView
                >
                    <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#cbd5e1" />
                    <Controls />
                    <MiniMap zoomable pannable />

                    <Panel position="top-left" className="bg-white/95 backdrop-blur-sm p-5 border-t-4 border-[#D41C2C] rounded-sm shadow-xl flex items-center gap-6">
                        <div>
                            <h1 className="text-2xl font-serif font-bold text-[#D41C2C] leading-none tracking-tight">
                                SnapFlow
                            </h1>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Enterprise Workflow Engine</p>
                        </div>

                        <div className="h-10 w-[1px] bg-gray-200" />

                        <div className="flex gap-3">
                            <LoadWorkflowButton
                                onLoad={(json: any) => {
                                    const { x, y, zoom } = json.viewport;
                                    setNodes(json.nodes || []);
                                    setEdges(json.edges || []);
                                }}
                            />

                            <button
                                onClick={() => setIsSaveModalOpen(true)}
                                className="flex items-center gap-2 bg-[#D41C2C] text-white px-5 py-2 rounded-sm text-sm font-bold shadow-sm hover:bg-[#B81926] hover:shadow-md transition-all active:scale-95 group uppercase tracking-wide"
                            >
                                <Rocket size={16} className="group-hover:animate-bounce" />
                                Save & Launch
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
