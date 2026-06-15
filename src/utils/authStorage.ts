import type { AuthTokens } from '../types/auth';

const ACCESS_TOKEN_KEY = 'aic.auth.access';
const REFRESH_TOKEN_KEY = 'aic.auth.refresh';

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

export const readStoredAuthTokens = (): AuthTokens | null => {
  if (!canUseStorage()) return null;

  const access = window.localStorage.getItem(ACCESS_TOKEN_KEY);
  const refresh = window.localStorage.getItem(REFRESH_TOKEN_KEY);

  return access && refresh ? { access, refresh } : null;
};

export const storeAuthTokens = ({ access, refresh }: AuthTokens) => {
  if (!canUseStorage()) return;

  window.localStorage.setItem(ACCESS_TOKEN_KEY, access);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
};

export const clearStoredAuthTokens = () => {
  if (!canUseStorage()) return;

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
};
