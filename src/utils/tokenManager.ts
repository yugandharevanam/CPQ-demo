import { TokenData } from './secureStorage';
import { getStoredTokens, storeTokens, clearAllSessionData } from './storage';

// Token refresh configuration
const TOKEN_CONFIG = {
  // Refresh token when it has 10 minutes left (more conservative)
  REFRESH_BUFFER_MS: 10 * 60 * 1000, // 10 minutes
  // No warnings needed for 1 day tokens
  WARNING_BUFFER_MS: 0, // Disabled
  // Maximum retry attempts for token refresh
  MAX_REFRESH_RETRIES: 3, // Increased retries
  // Retry delay (exponential backoff)
  RETRY_DELAY_BASE: 1000, // 1 second base delay
  // Minimum time between refresh attempts
  MIN_REFRESH_INTERVAL: 30 * 1000, // 30 seconds
};

interface TokenRefreshState {
  isRefreshing: boolean;
  refreshPromise: Promise<TokenData | null> | null;
  retryCount: number;
  lastRefreshAttempt: number;
}

interface TokenWarningState {
  hasWarned: boolean;
  warningShown: number;
}

class TokenManager {
  private refreshState: TokenRefreshState = {
    isRefreshing: false,
    refreshPromise: null,
    retryCount: 0,
    lastRefreshAttempt: 0,
  };

  private warningState: TokenWarningState = {
    hasWarned: false,
    warningShown: 0,
  };

  private refreshCallbacks: Array<(tokens: TokenData | null) => void> = [];
  private expiryCallbacks: Array<() => void> = [];
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  /**
   * Check if token needs refresh (5 minutes before expiry)
   */
  needsRefresh(tokens: TokenData | null): boolean {
    if (!tokens?.expires_at) return true;
    return Date.now() > (tokens.expires_at - TOKEN_CONFIG.REFRESH_BUFFER_MS);
  }

  /**
   * Check if token needs warning (disabled for 1 day tokens)
   */
  needsWarning(_tokens: TokenData | null): boolean {
    // Warnings disabled for long-lived tokens
    return false;
  }

  /**
   * Get time until token expires in minutes
   */
  getTimeUntilExpiry(tokens: TokenData | null): number {
    if (!tokens?.expires_at) return 0;
    const timeLeft = tokens.expires_at - Date.now();
    return Math.max(0, Math.floor(timeLeft / (60 * 1000)));
  }

  /**
   * Enhanced token expiry check with better buffer
   */
  isTokenExpired(_tokens: TokenData | null): boolean {
    if (!_tokens?.expires_at) return true;
    // Only consider truly expired (no buffer for this check)
    return Date.now() >= _tokens.expires_at;
  }

  /**
   * Automatic token refresh with retry logic and race condition prevention
   */
  async refreshTokenIfNeeded(forceRefresh = false): Promise<TokenData | null> {
    const currentTokens = getStoredTokens();
    
    if (!currentTokens) {
      return null;
    }

    // Check if refresh is actually needed
    if (!forceRefresh && !this.needsRefresh(currentTokens)) {
      return currentTokens;
    }

    // Check if we're already refreshing
    if (this.refreshState.isRefreshing && this.refreshState.refreshPromise) {
      return this.refreshState.refreshPromise;
    }

    // Rate limiting - prevent too frequent refresh attempts
    const timeSinceLastAttempt = Date.now() - this.refreshState.lastRefreshAttempt;
    if (timeSinceLastAttempt < TOKEN_CONFIG.MIN_REFRESH_INTERVAL && !forceRefresh) {
      return currentTokens;
    }

    this.refreshState.isRefreshing = true;
    this.refreshState.lastRefreshAttempt = Date.now();
    
    this.refreshState.refreshPromise = this.performTokenRefresh(currentTokens);
    
    try {
      const newTokens = await this.refreshState.refreshPromise;
      this.refreshState.retryCount = 0; // Reset retry count on success
      
      // Notify all callbacks
      this.refreshCallbacks.forEach(callback => callback(newTokens));
      
      return newTokens;
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      // If it's a 400 error, don't retry - tokens are likely expired
      if ((error as any)?.response?.status === 400) {
        this.handleTokenExpiry();
        return null;
      }
      
      this.refreshState.retryCount++;
      
      if (this.refreshState.retryCount >= TOKEN_CONFIG.MAX_REFRESH_RETRIES) {
        this.handleTokenExpiry();
        return null;
      }
      
      // Exponential backoff for retry
      const delay = TOKEN_CONFIG.RETRY_DELAY_BASE * Math.pow(2, this.refreshState.retryCount - 1);
      
      setTimeout(() => {
        this.refreshState.isRefreshing = false;
        this.refreshState.refreshPromise = null;
      }, delay);
      
      return currentTokens;
    } finally {
      this.refreshState.isRefreshing = false;
      this.refreshState.refreshPromise = null;
    }
  }

  /**
   * Perform the actual token refresh API call
   */
  private async performTokenRefresh(tokens: TokenData): Promise<TokenData | null> {
    // Mock refresh: extend expiry and rotate access token
    try {
      const { MockAuthService } = await import('../mocks/MockAuthService');
      const newTokens = await MockAuthService.refreshToken(tokens);
      storeTokens(newTokens);
      this.warningState.hasWarned = false;
      this.warningState.warningShown = 0;
      return newTokens;
    } catch (error) {
      console.error('Mock token refresh failed', error);
      this.handleTokenExpiry();
      return null;
    }
  }

  /**
   * Handle token expiry with complete cleanup
   */
  private handleTokenExpiry(): void {
    // Clear all stored data
    this.clearAllData();
    
    // Notify expiry callbacks
    this.expiryCallbacks.forEach(callback => callback());
  }

  /**
   * Complete logout - clear all data and session
   */
  async logout(): Promise<void> {
    // In mock mode, just clear all data locally
    this.clearAllData();
  }

  /**
   * Clear all stored data and session information
   */
  private clearAllData(): void {
    // Stop token monitoring
    this.stopTokenMonitoring();
    
    // Use the comprehensive cleanup function
    clearAllSessionData();
    
    // Reset internal state
    this.refreshState = {
      isRefreshing: false,
      refreshPromise: null,
      retryCount: 0,
      lastRefreshAttempt: 0,
    };
    
    this.warningState = {
      hasWarned: false,
      warningShown: 0,
    };
    
    // Clear callbacks
    this.refreshCallbacks = [];
    this.expiryCallbacks = [];
  }

  /**
   * Check for token warnings (disabled for long-lived tokens)
   */
  checkTokenWarning(): void {
    // Warning functionality disabled for 1 day tokens
    return;
  }

  /**
   * Start automatic token monitoring (conservative approach)
   */
  startTokenMonitoring(): void {
    // Prevent duplicate monitoring
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;

    // Check every 30 minutes (more conservative for long-lived tokens)
    this.monitoringInterval = setInterval(() => {
      const tokens = getStoredTokens();
      
      if (!tokens) {
        this.stopTokenMonitoring();
        return;
      }
      
      // Auto-refresh only when really needed (10 minutes left)
      if (this.needsRefresh(tokens)) {
        this.refreshTokenIfNeeded().catch((error) => {
          console.error('Auto token refresh failed:', error);
        });
      }
    }, 30 * 60 * 1000); // Check every 30 minutes

    // Initial check - but don't auto-refresh on startup unless really needed
    setTimeout(() => {
      const tokens = getStoredTokens();
      if (tokens && this.isTokenExpired(tokens)) {
        this.handleTokenExpiry();
      }
    }, 2000); // Wait 2 seconds after startup
  }

  /**
   * Stop token monitoring
   */
  stopTokenMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
  }

  /**
   * Register callback for token refresh events
   */
  onTokenRefresh(callback: (tokens: TokenData | null) => void): void {
    this.refreshCallbacks.push(callback);
  }

  /**
   * Register callback for token warning events (disabled)
   */
  onTokenWarning(_callback: (minutesLeft: number) => void): void {
    // Warning callbacks disabled for long-lived tokens
    return;
  }

  /**
   * Register callback for token expiry events
   */
  onTokenExpiry(callback: () => void): void {
    this.expiryCallbacks.push(callback);
  }

  /**
   * Remove callbacks
   */
  removeCallbacks(): void {
    this.refreshCallbacks = [];
    this.expiryCallbacks = [];
  }

  /**
   * Get current token status
   */
  getTokenStatus(): {
    isValid: boolean;
    needsRefresh: boolean;
    needsWarning: boolean;
    minutesUntilExpiry: number;
    isRefreshing: boolean;
    isMonitoring: boolean;
  } {
    const tokens = getStoredTokens();
    
    return {
      isValid: !!tokens && !this.isTokenExpired(tokens),
      needsRefresh: this.needsRefresh(tokens),
      needsWarning: this.needsWarning(tokens),
      minutesUntilExpiry: this.getTimeUntilExpiry(tokens),
      isRefreshing: this.refreshState.isRefreshing,
      isMonitoring: this.isMonitoring,
    };
  }

  /**
   * Force token refresh
   */
  async forceRefresh(): Promise<TokenData | null> {
    return await this.refreshTokenIfNeeded(true);
  }
}

// Create singleton instance
export const tokenManager = new TokenManager();

// Hook for React components
export const useTokenManager = () => {
  return {
    refreshTokenIfNeeded: tokenManager.refreshTokenIfNeeded.bind(tokenManager),
    getTokenStatus: tokenManager.getTokenStatus.bind(tokenManager),
    onTokenRefresh: tokenManager.onTokenRefresh.bind(tokenManager),
    onTokenWarning: tokenManager.onTokenWarning.bind(tokenManager),
    onTokenExpiry: tokenManager.onTokenExpiry.bind(tokenManager),
    forceRefresh: tokenManager.forceRefresh.bind(tokenManager),
    startMonitoring: tokenManager.startTokenMonitoring.bind(tokenManager),
    stopMonitoring: tokenManager.stopTokenMonitoring.bind(tokenManager),
    logout: tokenManager.logout.bind(tokenManager),
  };
}; 