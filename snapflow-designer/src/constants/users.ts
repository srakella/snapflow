export interface User {
    id: string;
    name: string;
    email: string;
}

export const AVAILABLE_USERS: User[] = [
    { id: 'jdoe', name: 'John Doe', email: 'john@example.com' },
    { id: 'asmith', name: 'Alice Smith', email: 'alice@example.com' },
    { id: 'admin', name: 'System Admin', email: 'admin@snapflow.com' },
    { id: 'hr_manager', name: 'HR Manager', email: 'hr@example.com' },
    { id: 'bwayne', name: 'Bruce Wayne', email: 'bruce@wayne.com' },
    { id: 'clark', name: 'Clark Kent', email: 'clark@dailyplanet.com' },
    { id: 'diana', name: 'Diana Prince', email: 'diana@themyscira.com' },
];

export const CANDIDATE_GROUPS = [
    { value: '', label: 'Select Group...' },
    { value: 'admins', label: 'Administrators' },
    { value: 'approvers', label: 'Approvers Team' },
    { value: 'hr', label: 'HR Department' },
    { value: 'managers', label: 'Managers' },
    { value: 'users', label: 'All Users' },
] as const;
