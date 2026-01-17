import { AppNode } from '../store/useStore';
import { Edge } from '@xyflow/react';

export function mapToBPMN(nodes: AppNode[], edges: Edge[], processName: string = "SnapFlow Workflow"): string {
    // Sanitize name for ID (remove spaces/special chars)
    const sanitizedName = processName.replace(/[^a-zA-Z0-9]/g, '_');
    const processId = `Process_${sanitizedName}_${Date.now()}`;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xmlns:flowable="http://flowable.org/bpmn"
             xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
             xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC"
             xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI"
             typeLanguage="http://www.w3.org/2001/XMLSchema"
             expressionLanguage="http://www.w3.org/1999/XPath"
             targetNamespace="http://www.flowable.org/processdef">
    <process id="${processId}" name="${processName}" isExecutable="true">
`;

    // Map Nodes
    nodes.forEach(node => {
        const id = node.id.replace(/-/g, '_');
        const name = node.data.label || 'Unnamed Step';

        switch (node.type) {
            case 'start':
                const startFormKey = (node.data as any).config?.formKey ? ` flowable:formKey="${(node.data as any).config.formKey}"` : '';
                xml += `        <startEvent id="${id}" name="${name}"${startFormKey} />\n`;
                break;
            case 'end':
                xml += `        <endEvent id="${id}" name="${name}" />\n`;
                break;
            case 'task':
                const assignee = (node.data as any).config?.assignee ? ` flowable:assignee="${(node.data as any).config.assignee}"` : '';
                const formKey = (node.data as any).config?.formKey ? ` flowable:formKey="${(node.data as any).config.formKey}"` : '';
                const isReview = (node.data as any).config?.viewPreviousData ? ` flowable:isReviewStep="true"` : '';
                xml += `        <userTask id="${id}" name="${name}"${assignee}${formKey}${isReview} />\n`;
                break;
            case 'aiAgent':
                const aiConfig = (node.data as any).config || {};
                xml += `        <serviceTask id="${id}" name="${name}" flowable:delegateExpression="\${aiAgentDelegate}">\n`;
                xml += `            <extensionElements>\n`;
                xml += `                <flowable:field name="systemPrompt" stringValue="${aiConfig.systemPrompt || ''}" />\n`;
                xml += `                <flowable:field name="inputVariableName" stringValue="${aiConfig.inputVariableName || ''}" />\n`;
                xml += `                <flowable:field name="outputVariableName" stringValue="${aiConfig.outputVariableName || ''}" />\n`;
                xml += `            </extensionElements>\n`;
                xml += `        </serviceTask>\n`;
                break;
            case 'gateway':
                xml += `        <exclusiveGateway id="${id}" name="${name}" />\n`;
                break;
        }
    });

    // Map Edges (Sequence Flows)
    edges.forEach(edge => {
        const id = edge.id.replace(/-/g, '_');
        const sourceRef = edge.source.replace(/-/g, '_');
        const targetRef = edge.target.replace(/-/g, '_');
        xml += `        <sequenceFlow id="${id}" sourceRef="${sourceRef}" targetRef="${targetRef}" />\n`;
    });

    xml += `    </process>
</definitions>`;

    return xml.trim();
}
