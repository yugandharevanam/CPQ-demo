// File: src/api/axios.ts
import axios from 'axios';
import { getStoredTokens } from '../utils/storage';
import { securityUtils } from '../utils/secureStorage';

// CSRF token management
let csrfToken: string | null = null;

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

/**
 * Generate and store CSRF token
 */
const generateCSRFToken = (): string => {
  if (!csrfToken) {
    csrfToken = securityUtils.generateCSRFToken();
  }
  return csrfToken;
};

/**
 * Get current CSRF token
 */
export const getCSRFToken = (): string => {
  return generateCSRFToken();
};

// Add request interceptor to attach authentication token and CSRF protection
axiosInstance.interceptors.request.use(
  (config) => {
    const tokens = getStoredTokens();
    
    // Add authentication token
    if (tokens?.access_token) {
      config.headers.Authorization = `Bearer ${tokens.access_token}`;
    }
    
    // Add CSRF protection for state-changing requests
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
      config.headers['X-CSRF-Token'] = generateCSRFToken();
    }
    
    // Add additional security headers
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle authentication errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 errors by attempting token refresh first
    if (error.response?.status === 401) {
      // Check if this is a logout-related request to prevent infinite loops
      const isLogoutRequest = error.config?.url?.includes('revoke_token') || 
                             error.config?.url?.includes('logout') ||
                             (error.config?.method === 'post' && error.config?.url?.includes('oauth2') && error.config?.url?.includes('revoke'));
      
      if (!isLogoutRequest) {
        try {
          // Import TokenManager dynamically to avoid circular dependencies
          const { tokenManager } = await import('../utils/tokenManager');
          
          // Attempt to refresh the token
          const newTokens = await tokenManager.refreshTokenIfNeeded(true);
          
          if (newTokens) {
            // Retry the original request with new token
            const originalRequest = error.config;
            originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;
            return axiosInstance(originalRequest);
          } else {
            // Token refresh failed, logout user
            await tokenManager.logout();
            
            // Check if we're not already on login page
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }
        } catch (refreshError) {
          console.error('Token refresh error:', refreshError);
          // Import TokenManager dynamically to avoid circular dependencies
          const { tokenManager } = await import('../utils/tokenManager');
          
          // Clear all data and redirect to login
          await tokenManager.logout();
          
          // Check if we're not already on login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      } else {
        // For logout requests that fail with 401, just log the error and continue
        console.warn('Logout request failed with 401 - token may already be invalid:', error.config?.url);
      }
    }
    
    // Handle CSRF token validation errors
    if (error.response?.status === 403) {
      console.error('CSRF token validation failed');
      // Regenerate CSRF token for next request
      csrfToken = null;
    }
    
    return Promise.reject(error);
  }
);

// Additional security: Validate response integrity
axiosInstance.interceptors.response.use(
  (response) => {
    // Basic response validation
    if (response.data && typeof response.data === 'object') {
      // Check for potential security issues in response
      const responseString = JSON.stringify(response.data);
      if (securityUtils.containsMaliciousContent(responseString)) {
        console.warn('Potentially malicious content detected in API response');
        // You might want to handle this more strictly in production
      }
    }
    return response;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;