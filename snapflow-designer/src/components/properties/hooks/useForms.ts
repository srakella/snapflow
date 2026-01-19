import { useState, useEffect } from 'react';
import { formService, FormDefinition } from '@/services/formService';

export function useForms(nodeType?: string) {
    const [forms, setForms] = useState<FormDefinition[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Only fetch forms for node types that need them
        if (nodeType === 'task' || nodeType === 'start' || nodeType === 'userTask') {
            fetchForms();
        }
    }, [nodeType]);

    const fetchForms = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await formService.getAll();
            setForms(data);
        } catch (err) {
            console.error('Failed to fetch forms:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch forms');
        } finally {
            setLoading(false);
        }
    };

    const refreshForms = () => {
        fetchForms();
    };

    return {
        forms,
        loading,
        error,
        refreshForms,
    };
}
