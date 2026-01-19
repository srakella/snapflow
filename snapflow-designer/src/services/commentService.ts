import { API_BASE_URL } from '../constants/apiEndpoints';

export interface Comment {
    id: string;
    workflowId: string;
    nodeId?: string | null;
    text: string;
    author: {
        id: string;
        name: string;
        avatarUrl?: string;
    };
    mentions: string[];
    parentId?: string;
    resolved: boolean;
    createdAt: string;
}

export const commentService = {
    // Get all comments for a workflow
    getComments: async (workflowId: string): Promise<Comment[]> => {
        const response = await fetch(`${API_BASE_URL}/comments/workflow/${workflowId}`);
        if (!response.ok) throw new Error('Failed to fetch comments');
        return response.json();
    },

    // Create a new comment
    createComment: async (comment: Partial<Comment>): Promise<Comment> => {
        const response = await fetch(`${API_BASE_URL}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(comment),
        });
        if (!response.ok) throw new Error('Failed to create comment');
        return response.json();
    },

    // Resolve a comment
    resolveComment: async (commentId: string, userId: string): Promise<Comment> => {
        const response = await fetch(`${API_BASE_URL}/comments/${commentId}/resolve`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
        });
        if (!response.ok) throw new Error('Failed to resolve comment');
        return response.json();
    },

    // Delete a comment
    deleteComment: async (commentId: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete comment');
    }
};
