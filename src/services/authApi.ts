import { ApiError, createApiUrl } from './apiClient';

type AuthPayload = Record<string, unknown>;

const readMessage = (payload: unknown) => {
  if (!payload || typeof payload !== 'object') return undefined;
  const record = payload as AuthPayload;
  const message = record.detail || record.message || record.error;
  return typeof message === 'string' && message.trim() ? message.trim() : undefined;
};

const postAuth = async (path: string, body: AuthPayload) => {
  const endpoint = createApiUrl(path);
  const response = await fetch(endpoint, {
    body: JSON.stringify(body),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });
  const text = await response.text();
  const payload = text.trim() ? JSON.parse(text) as AuthPayload : {};

  if (!response.ok) {
    const detail = readMessage(payload);
    throw new ApiError(detail || 'Authentication request failed.', {
      detail,
      endpoint,
      status: response.status,
    });
  }

  return payload;
};

export const signIn = async (email: string, password: string) => {
  const payload = await postAuth('/v1/auth/sign-in/', { email, password });
  const user = payload.user && typeof payload.user === 'object' ? payload.user as AuthPayload : payload;
  const isStaff = Boolean(user.is_staff ?? user.isStaff ?? user.staff);

  return { isStaff };
};

export const requestPasswordReset = (email: string) =>
  postAuth('/v1/auth/password-reset/', { email });
