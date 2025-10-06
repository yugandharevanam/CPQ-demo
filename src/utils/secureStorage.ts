import CryptoJS from 'crypto-js';

// Generate a consistent encryption key based on browser fingerprint
const generateEncryptionKey = (): string => {
  // Use a more stable combination of browser characteristics
  const userAgent = navigator.userAgent;
  const language = navigator.language;
  const platform = navigator.platform;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Use a subset of characteristics that are less likely to change
  // Avoid screen resolution and other dynamic values
  const fingerprint = `${userAgent}${language}${platform}${timezone}`;
  
  // Add a fallback key if fingerprint generation fails
  try {
    return CryptoJS.SHA256(fingerprint).toString();
  } catch {
    console.warn('Failed to generate fingerprint-based key, using fallback');
    // Fallback to a simpler key based on domain
    return CryptoJS.SHA256(window.location.hostname + 'fallback').toString();
  }
};

// Encryption key - in production, this should be more sophisticated
const ENCRYPTION_KEY = generateEncryptionKey();

export interface TokenData {
  access_token: string;
  refresh_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  expires_at?: number;
}

/**
 * Secure storage utility with encryption
 * Encrypts sensitive data before storing in localStorage
 */
export const secureStorage = {
  /**
   * Encrypt and store data
   */
  setItem: (key: string, value: unknown): void => {
    try {
      const jsonString = JSON.stringify(value);
      const encrypted = CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Failed to encrypt and store data:', error);
      throw new Error('Failed to store data securely');
    }
  },

  /**
   * Retrieve and decrypt data
   */
  getItem: <T>(key: string): T | null => {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;

      const decrypted = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
      const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!jsonString) {
        // Decryption failed - possibly due to key change
        console.warn('Failed to decrypt stored data - removing corrupted data');
        localStorage.removeItem(key);
        return null;
      }

      return JSON.parse(jsonString) as T;
    } catch (error) {
      console.error('Failed to decrypt and retrieve data:', error);
      // Remove corrupted data
      localStorage.removeItem(key);
      return null;
    }
  },

  /**
   * Remove data
   */
  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  },

  /**
   * Clear all data
   */
  clear: (): void => {
    localStorage.clear();
  }
};

/**
 * Token-specific secure storage methods
 */
export const tokenStorage = {
  /**
   * Store tokens securely with encryption
   */
  storeTokens: (tokenData: TokenData): void => {
    try {
      // Calculate when the token will expire
      const expiresAt = Date.now() + tokenData.expires_in * 1000;
      const tokensToStore = {
        ...tokenData,
        expires_at: expiresAt,
      };
      
      secureStorage.setItem('frappe_tokens', tokensToStore);
    } catch (error) {
      console.error('Failed to store tokens securely:', error);
      throw new Error('Failed to store authentication tokens');
    }
  },

  /**
   * Retrieve stored tokens with decryption
   */
  getStoredTokens: (): TokenData | null => {
    try {
      return secureStorage.getItem<TokenData>('frappe_tokens');
    } catch (error) {
      console.error('Failed to retrieve tokens:', error);
      return null;
    }
  },

  /**
   * Clear stored tokens
   */
  clearTokens: (): void => {
    secureStorage.removeItem('frappe_tokens');
  },

  /**
   * Check if token is expired (strict check - no buffer)
   */
  isTokenExpired: (tokens: TokenData): boolean => {
    if (!tokens || !tokens.expires_at) return true;
    
    // Strict expiry check - only consider truly expired tokens
    // Buffer logic is now handled by TokenManager
    return Date.now() >= tokens.expires_at;
  },

  /**
   * Validate token structure
   */
  validateTokens: (tokens: unknown): tokens is TokenData => {
    return (
      tokens !== null &&
      typeof tokens === 'object' &&
      tokens !== undefined &&
       
      typeof (tokens as any).access_token === 'string' &&
       
      typeof (tokens as any).refresh_token === 'string' &&
       
      typeof (tokens as any).expires_in === 'number'
    );
  }
};

// Additional security utilities
export const securityUtils = {
  /**
   * Generate a random CSRF token
   */
  generateCSRFToken: (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Sanitize input to prevent XSS
   */
  sanitizeInput: (input: string): string => {
    if (!input) return '';
    
    // Basic sanitization - remove HTML tags and escape special characters
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  /**
   * Validate email format
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Check for potential malicious content
   */
  containsMaliciousContent: (input: string): boolean => {
    const maliciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /data:text\/html/i,
      /vbscript:/i
    ];

    return maliciousPatterns.some(pattern => pattern.test(input));
  }
};

export default secureStorage; 