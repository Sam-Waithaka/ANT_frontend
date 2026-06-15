// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest';
import {
  clearStoredAuthTokens,
  readStoredAuthTokens,
  storeAuthTokens,
} from '../../src/utils/authStorage';

describe('authStorage', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('stores, reads, and clears namespaced auth tokens', () => {
    expect(readStoredAuthTokens()).toBeNull();

    storeAuthTokens({ access: 'access-token', refresh: 'refresh-token' });

    expect(readStoredAuthTokens()).toEqual({ access: 'access-token', refresh: 'refresh-token' });
    expect(window.localStorage.getItem('aic.auth.access')).toBe('access-token');
    expect(window.localStorage.getItem('aic.auth.refresh')).toBe('refresh-token');

    clearStoredAuthTokens();

    expect(readStoredAuthTokens()).toBeNull();
  });

  it('returns null when only one token is present', () => {
    window.localStorage.setItem('aic.auth.access', 'access-token');

    expect(readStoredAuthTokens()).toBeNull();
  });
});
