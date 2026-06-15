import { createContext } from 'react';
import type { AuthStatus, AuthTokens, AuthUser } from '../types/auth';

export type AuthContextType = {
  accessToken: string;
  groups: string[];
  hasGroup: (group: string) => boolean;
  hasPermission: (permission: string) => boolean;
  hasPortalAccess: boolean;
  permissions: string[];
  refreshSession: () => Promise<AuthUser | null>;
  signIn: (identifier: string, password: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  status: AuthStatus;
  tokens: AuthTokens | null;
  user: AuthUser | null;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
