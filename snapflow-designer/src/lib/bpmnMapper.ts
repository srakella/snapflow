import { AppNode } from '../store/useStore';
import { Edge } from '@xyflow/react';

export function mapToBPMN(nodes: AppNode[], edges: Edge[]): string {
    const processId = "SnapFlow_Process_" + Date.now();
    const processName = "SnapFlow Workflow";

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
                xml += `        <startEvent id="${id}" name="${name}" />\n`;
                break;
            case 'end':
                xml += `        <endEvent id="${id}" name="${name}" />\n`;
                break;
            case 'task':
                const formKey = (node.data as any).config?.formKey ? ` flowable:formKey="${(node.data as any).config.formKey}"` : '';
                xml += `        <userTask id="${id}" name="${name}"${formKey} />\n`;
                break;
            case 'aiAgent':
                xml += `        <serviceTask id="${id}" name="${name}" flowable:delegateExpression="\${aiAgentDelegate}" />\n`;
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
