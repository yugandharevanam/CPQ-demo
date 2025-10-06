// Simple mock auth service for local development without backend
import { TokenData } from '../utils/secureStorage';

type MockUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

// Generate a faux JWT-like string
const generateTokenString = (): string => {
  const random = Math.random().toString(36).slice(2);
  const ts = Date.now().toString(36);
  return `${random}.${ts}.${random}`;
};

const ONE_DAY_SECONDS = 24 * 60 * 60;

export const MockAuthService = {
  async login(): Promise<{ tokens: TokenData; user: MockUser }> {
    const tokens: TokenData = {
      access_token: generateTokenString(),
      refresh_token: generateTokenString(),
      expires_in: ONE_DAY_SECONDS,
      id_token: generateTokenString(),
      token_type: 'Bearer',
      scope: 'all openid'
    } as TokenData;

    const user: MockUser = {
      id: 'mock.user@local',
      name: 'Mock User',
      email: 'mock.user@local',
      role: 'Admin'
    };

    // Simulate small latency
    await new Promise((res) => setTimeout(res, 300));

    return { tokens, user };
  },

  async getUserProfile(): Promise<MockUser> {
    // Return the same mock user; in real mock you could read from storage
    await new Promise((res) => setTimeout(res, 100));
    return {
      id: 'mock.user@local',
      name: 'Mock User',
      email: 'mock.user@local',
      role: 'Admin'
    };
  },

  async refreshToken(current: TokenData): Promise<TokenData> {
    // Extend expiry, keep same refresh token
    await new Promise((res) => setTimeout(res, 100));
    return {
      ...current,
      access_token: generateTokenString(),
      expires_in: ONE_DAY_SECONDS
    } as TokenData;
  }
};



