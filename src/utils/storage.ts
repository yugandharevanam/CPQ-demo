// File: src/utils/storage.ts
// Updated to use secure encrypted storage
import { tokenStorage, TokenData } from './secureStorage';
import { formStateManager } from './formStateManager';

// Re-export TokenData for backward compatibility
export type { TokenData };

/**
 * Get stored tokens with decryption
 * @returns TokenData or null if not found or invalid
 */
export const getStoredTokens = (): TokenData | null => {
  return tokenStorage.getStoredTokens();
};

/**
 * Store tokens securely with encryption
 * @param tokenData Token data to store
 */
export const storeTokens = (tokenData: TokenData): void => {
  tokenStorage.storeTokens(tokenData);
};

/**
 * Clear stored tokens
 */
export const clearTokens = (): void => {
  tokenStorage.clearTokens();
};

/**
 * Check if token is expired
 * @param tokens Token data to check
 * @returns true if expired, false otherwise
 */
export const isTokenExpired = (tokens: TokenData): boolean => {
  return tokenStorage.isTokenExpired(tokens);
};

/**
 * Validate token structure
 * @param tokens Tokens to validate
 * @returns true if valid token structure
 */
export const validateTokens = (tokens: unknown): tokens is TokenData => {
  return tokenStorage.validateTokens(tokens);
};

/**
 * Complete session cleanup - clears all stored data
 * This should be called during logout to ensure no data remains
 */
export const clearAllSessionData = (): void => {
  // Clear tokens
  clearTokens();
  
  // Clear form state manager data
  try {
    formStateManager.clearFormData();
  } catch {
    // Ignore errors if formStateManager is not available
  }
  
  // Clear any customer cache or other app-specific data
  try {
    // Clear any cached customer data
    const customerCacheKeys = Object.keys(localStorage).filter(key => 
      key.includes('customer') || key.includes('Customer')
    );
    customerCacheKeys.forEach(key => localStorage.removeItem(key));
  } catch {
    // Ignore errors in cleanup
  }
  
  // Clear localStorage completely
  localStorage.clear();
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Clear any cookies
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
  
  // Clear cache storage (PWA cache)
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        caches.delete(cacheName);
      });
    }).catch(() => {
      // Ignore errors in cleanup
    });
  }
  
  // Clear any indexedDB data if used
  if ('indexedDB' in window) {
    indexedDB.databases().then(databases => {
      databases.forEach(db => {
        if (db.name) {
          indexedDB.deleteDatabase(db.name);
        }
      });
    }).catch(() => {
      // Ignore errors in cleanup
    });
  }
  
  // Clear any service worker registrations in development to avoid caching issues
  if (import.meta && import.meta.env && import.meta.env.DEV) {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister();
        });
      }).catch(() => {
        // Ignore errors in cleanup
      });
    }
  }
};