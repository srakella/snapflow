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
import { convertToBPMN } from '../lib/bpmnConverter';
import { TaskNode } from './nodes/TaskNode';
import { GatewayNode } from './nodes/GatewayNode';
import { AIAgentNode } from './nodes/AIAgentNode';
import { StartNode } from './nodes/StartNode';
import { EndNode } from './nodes/EndNode';
import { SidePalette } from './SidePalette';
import { PropertiesSidebar } from './PropertiesSidebar';

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

    const handleDeploy = async () => {
        const xml = convertToBPMN(nodes, edges);
        console.log('Deploying BPMN:', xml);

        try {
            const response = await fetch('http://localhost:8081/api/deploy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: `snapflow_${Date.now()}`,
                    xml: xml
                }),
            });

            if (response.ok) {
                const data = await response.json();
                alert(`Successfully Deployed!\nDeployment ID: ${data.id}`);
            } else {
                throw new Error('Deployment failed');
            }
        } catch (error) {
            console.error('Deployment error:', error);
            alert('Error deploying workflow. Make sure the engine is running.');
        }
    };

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

                    <Panel position="top-left" className="bg-white/90 backdrop-blur-sm p-4 border rounded-xl shadow-lg flex items-center gap-6">
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                                SnapFlow Designer
                            </h1>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Workflow Engine v1.0</p>
                        </div>

                        <div className="h-8 w-[1px] bg-gray-200" />

                        <button
                            onClick={handleDeploy}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:shadow-indigo-500/20 hover:-translate-y-0.5 transition-all active:scale-95 group"
                        >
                            <Rocket size={16} className="group-hover:animate-bounce" />
                            Launch to Engine
                        </button>
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
