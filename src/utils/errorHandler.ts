// utils/errorHandler.ts


/**
 * Standard error response shape
 * Used to normalize error responses across the application
 */
export interface ApiError {
    message: string;
    statusCode?: number;
    details?: Record<string, unknown>;
}

/**
 * Handles API errors in a consistent way
 * @param error The error object from try/catch
 * @param defaultMessage Default message to show if error cannot be parsed
 * @returns Either throws a standardized ApiError or returns a default value
 */
export const handleApiError = (
    error: unknown,
    defaultMessage: string = 'An error occurred',
    defaultValue: any = null  
): never | any => {  
        // Check if this is an Axios error with response
    if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;  
        const statusCode = axiosError.response.status;
        let message = defaultMessage;
        
        // Extract error message from response
        if (axiosError.response.data) {
            if (typeof axiosError.response.data === 'string') {
                message = axiosError.response.data;
            } else if (typeof axiosError.response.data === 'object' && axiosError.response.data !== null) {
                const responseData = axiosError.response.data as Record<string, unknown>;
                if (typeof responseData.message === 'string') {
                    message = responseData.message;
                } else if (typeof responseData.error === 'string') {
                    message = responseData.error;
                }
            }
        }
        
        // Handle specific status codes
        switch (statusCode) {
            case 401:
                message = 'Unauthorized access. Please login again.';
                break;
            case 403:
                message = 'Access forbidden. You do not have permission to perform this action.';
                break;
            case 404:
                message = 'Resource not found.';
                break;
            case 500:
                message = 'Internal server error. Please try again later.';
                break;
            default:
                // Use extracted message or default
                break;
        }
        
        const apiError: ApiError = {
            message,
            statusCode,
            details: axiosError.response.data
        };
        
        throw apiError;
    }
    
    // Check if this is a network error
    if (error && typeof error === 'object' && 'request' in error) {
        const networkError = error as any;  
        const apiError: ApiError = {
            message: 'Network error. Please check your internet connection and try again.',
            statusCode: 0,
            details: networkError.request
        };
        
        throw apiError;
    }
    
    // Handle other errors
    if (error instanceof Error) {
        const apiError: ApiError = {
            message: error.message || defaultMessage,
            details: { name: error.name, message: error.message, stack: error.stack }
        };
        
        throw apiError;
    }
    
    // If we have a default value, return it instead of throwing
    if (defaultValue !== null) {
        return defaultValue;
    }
    
    // Final fallback - throw generic error
    const apiError: ApiError = {
        message: defaultMessage,
        details: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : { error: String(error) }
    };
    
    throw apiError;
};

/**
 * Helper to extract error message from various error types
 * @param error The error object
 * @returns A user-friendly error message
 */
export const getErrorMessage = (error: any): string => {  
    if (typeof error === 'string') {
        return error;
    }

    if (error instanceof Error) {
        return error.message;
    }

    if (error && error.message) {
        return error.message;
    }

    return 'An unknown error occurred';
};

export default {
    handleApiError,
    getErrorMessage
};