import { apiClient } from './api';

export interface WorkflowSavePayload {
    name: string;
    json: any;
    xml: string;
}

export interface WorkflowDocument {
    id: string;
    name: string;
    json: any;
    xml: string;
    createdAt?: string;
    updatedAt?: string;
}

class WorkflowService {
    /**
     * Save a workflow (both JSON and XML)
     */
    async save(payload: WorkflowSavePayload): Promise<WorkflowDocument> {
        return apiClient.post<WorkflowDocument>('/api/workflows/save', payload);
    }

    /**
     * Get all workflows
     */
    async getAll(): Promise<WorkflowDocument[]> {
        return apiClient.get<WorkflowDocument[]>('/api/workflows');
    }

    /**
     * Get a specific workflow by ID
     */
    async getById(id: string): Promise<WorkflowDocument> {
        return apiClient.get<WorkflowDocument>(`/api/workflows/${id}`);
    }

    /**
     * Delete a workflow
     */
    async delete(id: string): Promise<void> {
        return apiClient.delete<void>(`/api/workflows/${id}`);
    }
}

export const workflowService = new WorkflowService();
