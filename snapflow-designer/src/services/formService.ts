import { apiClient } from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export interface FormField {
    id: string;
    type: string;
    label: string;
    required?: boolean;
    options?: string[];
    validation?: any;
}

export interface FormDefinition {
    id: string;
    name: string;
    description?: string;
    fields: FormField[];
    createdAt?: string;
    updatedAt?: string;
}

class FormService {
    /**
     * Fetch all available forms
     */
    async getAll(): Promise<FormDefinition[]> {
        return apiClient.get<FormDefinition[]>('/api/forms');
    }

    /**
     * Fetch a specific form by ID
     */
    async getById(id: string): Promise<FormDefinition> {
        return apiClient.get<FormDefinition>(`/api/forms/${id}`);
    }

    /**
     * Create a new form
     */
    async create(form: Omit<FormDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<FormDefinition> {
        return apiClient.post<FormDefinition>('/api/forms', form);
    }

    /**
     * Update an existing form
     */
    async update(id: string, form: Partial<FormDefinition>): Promise<FormDefinition> {
        return apiClient.put<FormDefinition>(`/api/forms/${id}`, form);
    }

    /**
     * Delete a form
     */
    async delete(id: string): Promise<void> {
        return apiClient.delete<void>(`/api/forms/${id}`);
    }
}

export const formService = new FormService();
