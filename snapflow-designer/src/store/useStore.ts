import { create } from 'zustand';
import {
    Connection,
    Edge,
    EdgeChange,
    Node,
    NodeChange,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    OnNodesChange,
    OnEdgesChange,
} from '@xyflow/react';

export type NodeData = {
    label: string;
    description?: string;
    config?: Record<string, any>;
};

export type AppNode = Node<NodeData>;

export type AppState = {
    nodes: AppNode[];
    edges: Edge[];
    selectedNode: AppNode | null;
    selectedEdge: Edge | null;
    workflowMetadata: {
        name: string | null;
        version: number;
        id: string | null;
    };
    isCollaborationPanelOpen: boolean;
    toggleCollaborationPanel: () => void;
    onNodesChange: OnNodesChange<AppNode>;
    onEdgesChange: OnEdgesChange;
    onConnect: (connection: Connection) => void;
    setNodes: (nodes: AppNode[]) => void;
    setEdges: (edges: Edge[]) => void;
    setSelectedNode: (node: AppNode | null) => void;
    setSelectedEdge: (edge: Edge | null) => void;
    addNode: (node: AppNode) => void;
    updateNodeData: (nodeId: string, data: Partial<NodeData>) => void;
    updateEdgeData: (edgeId: string, data: Partial<Record<string, any>>) => void;
    setWorkflowMetadata: (metadata: { name: string | null; version: number; id: string | null }) => void;
    resetWorkflow: () => void;
};

export const useStore = create<AppState>((set, get) => ({
    nodes: [],
    edges: [],
    selectedNode: null,
    selectedEdge: null,
    workflowMetadata: {
        name: null,
        version: 1,
        id: null,
    },
    isCollaborationPanelOpen: false,
    toggleCollaborationPanel: () => set((state) => ({ isCollaborationPanelOpen: !state.isCollaborationPanelOpen })),
    onNodesChange: (changes) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes) as AppNode[],
        });
    },
    onEdgesChange: (changes: EdgeChange[]) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });
    },
    onConnect: (connection: Connection) => {
        set({
            edges: addEdge(connection, get().edges),
        });
    },
    setNodes: (nodes: AppNode[]) => set({ nodes }),
    setEdges: (edges: Edge[]) => set({ edges }),
    setSelectedNode: (node: AppNode | null) => set({ selectedNode: node, selectedEdge: null }),
    setSelectedEdge: (edge: Edge | null) => set({ selectedEdge: edge, selectedNode: null }),
    addNode: (node: AppNode) => set({ nodes: [...get().nodes, node] }),
    updateNodeData: (nodeId: string, data: Partial<NodeData>) => {
        const { nodes, selectedNode } = get();
        const updatedNodes = nodes.map((node) => {
            if (node.id === nodeId) {
                return { ...node, data: { ...node.data, ...data } };
            }
            return node;
        });

        set({
            nodes: updatedNodes,
            selectedNode: selectedNode?.id === nodeId
                ? { ...selectedNode, data: { ...selectedNode.data, ...data } }
                : selectedNode,
        });
    },
    updateEdgeData: (edgeId: string, data: Partial<Record<string, any>>) => {
        const { edges, selectedEdge } = get();
        const updatedEdges = edges.map((edge) => {
            if (edge.id === edgeId) {
                return { ...edge, ...data };
            }
            return edge;
        });

        set({
            edges: updatedEdges,
            selectedEdge: selectedEdge?.id === edgeId
                ? { ...selectedEdge, ...data }
                : selectedEdge,
        });
    },
    setWorkflowMetadata: (metadata) => set({ workflowMetadata: metadata }),
    resetWorkflow: () => set({
        nodes: [],
        edges: [],
        selectedNode: null,
        selectedEdge: null,
        workflowMetadata: {
            name: null,
            version: 1,
            id: null,
        },
    }),
}));
