import { Node, Edge } from '@xyflow/react';

export interface ValidationError {
    nodeId?: string;
    edgeId?: string;
    type: 'error' | 'warning';
    message: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
}

/**
 * Validate workflow for orphan tasks, unreachable nodes, and other issues
 */
export function validateWorkflow(nodes: Node[], edges: Edge[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Find start and end nodes
    const startNodes = nodes.filter(n => n.type === 'start');
    const endNodes = nodes.filter(n => n.type === 'end');

    // Validation 1: Must have exactly one start node
    if (startNodes.length === 0) {
        errors.push({
            type: 'error',
            message: 'Workflow must have a Start node'
        });
    } else if (startNodes.length > 1) {
        errors.push({
            type: 'error',
            message: 'Workflow can only have one Start node'
        });
    }

    // Validation 2: Must have at least one end node
    if (endNodes.length === 0) {
        errors.push({
            type: 'error',
            message: 'Workflow must have at least one End node'
        });
    }

    // Validation 3: Check for orphan tasks (no incoming connections)
    nodes.forEach(node => {
        if (node.type === 'start') return; // Start has no incoming

        const hasIncoming = edges.some(e => e.target === node.id);
        if (!hasIncoming) {
            errors.push({
                nodeId: node.id,
                type: 'error',
                message: `"${node.data.label || node.type}" has no incoming connection (orphan task)`
            });
        }
    });

    // Validation 4: Check for dead-end tasks (no outgoing connections)
    nodes.forEach(node => {
        if (node.type === 'end') return; // End has no outgoing

        const hasOutgoing = edges.some(e => e.source === node.id);
        if (!hasOutgoing) {
            errors.push({
                nodeId: node.id,
                type: 'error',
                message: `"${node.data.label || node.type}" has no outgoing connection (dead end)`
            });
        }
    });

    // Validation 5: Check for unreachable tasks
    if (startNodes.length === 1) {
        const reachable = findReachableNodes(startNodes[0].id, edges);
        nodes.forEach(node => {
            if (!reachable.has(node.id)) {
                errors.push({
                    nodeId: node.id,
                    type: 'error',
                    message: `"${node.data.label || node.type}" is unreachable from Start`
                });
            }
        });
    }

    // Validation 6: Check if all paths lead to an end
    if (endNodes.length > 0 && startNodes.length === 1) {
        const canReachEnd = nodes.every(node => {
            if (node.type === 'end') return true;
            return canReachAnyEnd(node.id, edges, endNodes.map(n => n.id));
        });

        if (!canReachEnd) {
            warnings.push({
                type: 'warning',
                message: 'Some tasks may not lead to an End node'
            });
        }
    }

    // Validation 7: Check dynamic routers have merge points
    const dynamicRouters = nodes.filter(n => n.type === 'dynamicRouter');
    dynamicRouters.forEach(router => {
        const outgoing = edges.filter(e => e.source === router.id);
        if (outgoing.length > 0) {
            const hasMerge = checkForMergePoint(router.id, edges, nodes);
            if (!hasMerge) {
                warnings.push({
                    nodeId: router.id,
                    type: 'warning',
                    message: `Dynamic router "${router.data.label}" should have a merge point to collect results`
                });
            }
        }
    });

    // Validation 8: Check gateways have multiple outgoing paths
    const gateways = nodes.filter(n => n.type === 'gateway');
    gateways.forEach(gateway => {
        const outgoing = edges.filter(e => e.source === gateway.id);
        if (outgoing.length < 2) {
            warnings.push({
                nodeId: gateway.id,
                type: 'warning',
                message: `Gateway "${gateway.data.label}" should have at least 2 outgoing paths`
            });
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Find all nodes reachable from a starting node
 */
function findReachableNodes(startNodeId: string, edges: Edge[]): Set<string> {
    const reachable = new Set<string>();
    const queue = [startNodeId];
    reachable.add(startNodeId);

    while (queue.length > 0) {
        const current = queue.shift()!;
        const outgoing = edges.filter(e => e.source === current);

        outgoing.forEach(edge => {
            if (!reachable.has(edge.target)) {
                reachable.add(edge.target);
                queue.push(edge.target);
            }
        });
    }

    return reachable;
}

/**
 * Check if a node can reach any end node
 */
function canReachAnyEnd(nodeId: string, edges: Edge[], endNodeIds: string[]): boolean {
    const visited = new Set<string>();
    const queue = [nodeId];

    while (queue.length > 0) {
        const current = queue.shift()!;
        if (visited.has(current)) continue;
        visited.add(current);

        if (endNodeIds.includes(current)) {
            return true;
        }

        const outgoing = edges.filter(e => e.source === current);
        outgoing.forEach(edge => {
            if (!visited.has(edge.target)) {
                queue.push(edge.target);
            }
        });
    }

    return false;
}

/**
 * Check if a dynamic router has a merge point
 */
function checkForMergePoint(routerId: string, edges: Edge[], nodes: Node[]): boolean {
    // Get all nodes that the router connects to
    const directTargets = edges
        .filter(e => e.source === routerId)
        .map(e => e.target);

    if (directTargets.length === 0) return false;

    // Find nodes that all direct targets eventually connect to (merge points)
    const pathsFromTargets = directTargets.map(targetId =>
        findReachableNodes(targetId, edges)
    );

    // Find intersection (common nodes)
    const intersection = pathsFromTargets.reduce((acc, path) => {
        const common = new Set<string>();
        path.forEach(nodeId => {
            if (acc.has(nodeId)) {
                common.add(nodeId);
            }
        });
        return common;
    });

    // Check if there's at least one merge point (excluding the router itself)
    return intersection.size > 0 && !intersection.has(routerId);
}

/**
 * Get validation status for a specific node
 */
export function getNodeValidationStatus(
    nodeId: string,
    validationResult: ValidationResult
): 'valid' | 'error' | 'warning' {
    const hasError = validationResult.errors.some(e => e.nodeId === nodeId);
    if (hasError) return 'error';

    const hasWarning = validationResult.warnings.some(w => w.nodeId === nodeId);
    if (hasWarning) return 'warning';

    return 'valid';
}

/**
 * Get CSS classes for node based on validation status
 */
export function getNodeValidationClasses(status: 'valid' | 'error' | 'warning'): string {
    switch (status) {
        case 'error':
            return 'ring-2 ring-red-500 ring-offset-2';
        case 'warning':
            return 'ring-2 ring-yellow-500 ring-offset-2';
        default:
            return '';
    }
}
