import { createContext, useEffect, useState, useCallback } from 'react';
import { AuthState, AuthProviderState, User } from '../types/auth';
import { useNavigate } from 'react-router-dom';
import { getStoredTokens, storeTokens } from '../utils/storage';
import { tokenManager } from '../utils/tokenManager';
import { MockAuthService } from '../mocks/MockAuthService';

type AuthProviderProps = {
  children: React.ReactNode;
}

const initialAuthState: AuthProviderState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  error: null,
  loginWithOAuth: () => {},
  handleOAuthCallback: async () => {},
  logout: async () => {},
  getUser: async () => null,
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthProviderState>(initialAuthState);

const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();

  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null,
  });

  const getUser = useCallback(async (): Promise<User | null> => {
    try {
      const response = await MockAuthService.getUserProfile();
      return {
        id: response.email || '',
        name: response.name || '',
        email: response.email || '',
        role: response.role || '',
      };
    } catch (error) {
      console.error('Failed to get user', error);
      return null;
    }
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const tokens = getStoredTokens();

      if (!tokens) {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: null,
        });
        return;
      }

      // Check if token is expired first
      if (tokenManager.isTokenExpired(tokens)) {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: 'Session expired. Please log in again.',
        });
        navigate('/login');
        return;
      }

      // Use TokenManager to check if token needs refresh
      if (tokenManager.needsRefresh(tokens)) {
        try {
          const newTokens = await tokenManager.refreshTokenIfNeeded();
          
          if (newTokens) {
            const user = await getUser();
            setAuthState({
              isAuthenticated: true,
              isLoading: false,
              user: user,
              error: null,
            });
          } else {
            // Token refresh failed, user will be logged out
            setAuthState({
              isAuthenticated: false,
              isLoading: false,
              user: null,
              error: 'Session expired. Please log in again.',
            });
            navigate('/login');
          }
        } catch (error) {
          console.error('Failed to refresh token', error);
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            error: 'Session expired. Please log in again.',
          });
          navigate('/login');
        }
      } else {
        // Token is valid, fetch user
        try {
          const user = await getUser();
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user: user,
            error: null,
          });
        } catch (error) {
          console.error('Failed to get user', error);
          // Don't immediately logout on user fetch failure
          // The token might still be valid, just the user endpoint might be down
          setAuthState({
            isAuthenticated: true, // Keep authenticated if token is valid
            isLoading: false,
            user: null,
            error: 'Failed to fetch user profile, but you are still authenticated.',
          });
        }
      }
    };

    checkAuth();
  }, [navigate, getUser]);

  // Set up token expiry listener
  useEffect(() => {
    const handleTokenExpiry = () => {
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: 'Session expired. Please log in again.',
      });
      navigate('/login');
    };

    tokenManager.onTokenExpiry(handleTokenExpiry);

    // Don't start token monitoring here - it's already started in App.tsx
    // This prevents duplicate monitoring

    return () => {
      tokenManager.removeCallbacks();
    };
  }, [navigate]);

  const loginWithOAuth = useCallback(async () => {
    try {
      setAuthState((s) => ({ ...s, isLoading: true, error: null }));
      const { tokens, user } = await MockAuthService.login();
      storeTokens(tokens as any);
      setAuthState({ isAuthenticated: true, isLoading: false, user, error: null });
      navigate('/lift-plan');
    } catch (error) {
      console.error('Mock login failed', error);
      setAuthState((s) => ({ ...s, isLoading: false, error: 'Login failed' }));
    }
  }, [navigate]);

  const handleOAuthCallback = useCallback(async (_code: string): Promise<void> => {
    // In mock mode, just ignore the code and perform a mock login
    await loginWithOAuth();
  }, [loginWithOAuth]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      // Use TokenManager's logout method for complete cleanup
      await tokenManager.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Always update auth state
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null,
      });

      // Navigate to login
      navigate('/login');
    }
  }, [navigate]);

  const authContextValue = {
    ...authState,
    loginWithOAuth,
    handleOAuthCallback,
    logout,
    getUser
  };

  return (
    <AuthContext.Provider value={authContextValue} >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;