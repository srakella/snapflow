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
import '@xyflow/react/dist/style.css';

import { useStore } from '../store/useStore';
import { TaskNode } from './nodes/TaskNode';
import { GatewayNode } from './nodes/GatewayNode';
import { AIAgentNode } from './nodes/AIAgentNode';
import { SidePalette } from './SidePalette';
import { PropertiesSidebar } from './PropertiesSidebar';

const nodeTypes: NodeTypes = {
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
    } = useStore();

    const { screenToFlowPosition } = useReactFlow();

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

    return (
        <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
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

                    <Panel position="top-left" className="bg-white/80 backdrop-blur-sm p-3 border rounded-lg shadow-sm">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            SnapFlow Designer
                        </h1>
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Workflow Engine v1.0</p>
                    </Panel>
                </ReactFlow>
            </div>

            <PropertiesSidebar />
        </div>
    );
}

export default function Editor() {
    return (
        <ReactFlowProvider>
            <Flow />
        </ReactFlowProvider>
    );
}
