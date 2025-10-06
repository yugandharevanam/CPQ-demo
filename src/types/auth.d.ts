export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
}

export interface AuthProviderState extends AuthState {
  loginWithOAuth: () => void;
  handleOAuthCallback: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  getUser: () => Promise<User | null>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}
