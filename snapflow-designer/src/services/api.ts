/**
 * Base API client with error handling and common configurations
 */

export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public data?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export interface ApiResponse<T> {
    data?: T;
    error?: string;
    status: number;
}

class ApiClient {
    private baseURL: string;

    constructor(baseURL: string = 'http://localhost:8081') {
        this.baseURL = baseURL;
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const errorText = await response.text();
            throw new ApiError(
                errorText || `HTTP ${response.status}: ${response.statusText}`,
                response.status,
                errorText
            );
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return response.json();
        }

        return response.text() as any;
    }

    async get<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return this.handleResponse<T>(response);
    }

    async post<T>(endpoint: string, data: any): Promise<T> {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        return this.handleResponse<T>(response);
    }

    async put<T>(endpoint: string, data: any): Promise<T> {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        return this.handleResponse<T>(response);
    }

    async delete<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return this.handleResponse<T>(response);
    }
}

export const apiClient = new ApiClient();
