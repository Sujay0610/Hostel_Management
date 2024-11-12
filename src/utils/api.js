// Create a new file for API utilities
import { API_URL } from '../config';

export async function apiCall(endpoint, method = 'GET', body = null) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            ...(body && { body: JSON.stringify(body) })
        });

        // First check if the response exists
        if (!response) {
            throw new Error('No response from server');
        }

        // Try to parse the JSON response
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Server error');
        }

        return data;
    } catch (error) {
        console.error('API Call Error:', error);
        throw error;
    }
} 