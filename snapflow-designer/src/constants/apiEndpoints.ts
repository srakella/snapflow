export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

export const API_ENDPOINTS = {
    // Workflow endpoints
    WORKFLOWS: `${API_BASE_URL}/api/workflows`,
    WORKFLOW_SAVE: `${API_BASE_URL}/api/workflows/save`,
    WORKFLOW_BY_ID: (id: string) => `${API_BASE_URL}/api/workflows/${id}`,

    // Form endpoints
    FORMS: `${API_BASE_URL}/api/forms`,
    FORM_BY_ID: (id: string) => `${API_BASE_URL}/api/forms/${id}`,

    // Process endpoints
    PROCESSES: `${API_BASE_URL}/api/process`,
    PROCESS_START: `${API_BASE_URL}/api/process/start`,

    // Task endpoints
    TASKS: `${API_BASE_URL}/api/tasks`,
    TASK_BY_ID: (id: string) => `${API_BASE_URL}/api/tasks/${id}`,

    // Rules endpoints
    RULES: `${API_BASE_URL}/api/rules`,
    RULESETS: `${API_BASE_URL}/api/rules/rulesets`,
} as const;
