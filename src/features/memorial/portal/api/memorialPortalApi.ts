import { ApiError, createApiUrl } from '../../../../services/apiClient';
import { authenticatedFetch } from '../../../../services/authSession';
import { MEMORIAL_DISCOVERY_API, memorialApiRoot } from '../config';
import type {
  BorrowedImagePayload,
  ChildCreatePayload,
  ChildType,
  LexicalJson,
  MemorialId,
  ModerationObjectResponse,
  ModerationWorkspace,
  PageUpdatePayload,
  PortalWriteup,
  PortalWriteupIndex,
  PortalMemorialList,
  ReplacementPayload,
  SelectableAsset,
  UploadImagePayload,
  WriteupType,
} from '../types';

type RequestOptions = {
  accessToken: string;
  body?: FormData | unknown;
  method?: 'DELETE' | 'GET' | 'PATCH' | 'POST';
  signal?: AbortSignal;
};

export class MemorialApiError extends ApiError {
  payload: unknown;

  constructor(message: string, endpoint: string, status: number | undefined, payload: unknown) {
    super(message, { detail: message, endpoint, status });
    this.name = 'MemorialApiError';
    this.payload = payload;
  }
}

const readDetail = (payload: unknown) => {
  if (typeof payload === 'string' && payload.trim()) return payload.trim();
  if (!payload || typeof payload !== 'object') return undefined;
  const record = payload as Record<string, unknown>;
  const candidate = record.detail ?? record.error ?? record.message;
  if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  const firstField = Object.entries(record).find(([, value]) =>
    typeof value === 'string' || (Array.isArray(value) && typeof value[0] === 'string'),
  );
  if (!firstField) return undefined;
  const value = firstField[1];
  return `${firstField[0]}: ${Array.isArray(value) ? value[0] : value}`;
};

const parseBody = async (response: Response) => {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

const request = async <T>(path: string, options: RequestOptions): Promise<T> => {
  const endpoint = createApiUrl(path);
  const formData = options.body instanceof FormData;
  const requestBody: BodyInit | undefined = formData
    ? options.body as FormData
    : options.body === undefined
      ? undefined
      : JSON.stringify(options.body);
  const response = await authenticatedFetch(endpoint, options.accessToken, {
    body: requestBody,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${options.accessToken}`,
      ...(formData || options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    method: options.method ?? 'GET',
    signal: options.signal,
  });
  const payload = await parseBody(response);
  if (!response.ok) {
    throw new MemorialApiError(
      readDetail(payload) || `Memorial request failed with status ${response.status}.`,
      endpoint,
      response.status,
      payload,
    );
  }
  return payload as T;
};

const asFormData = (payload: Record<string, unknown>) => {
  const data = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined) return;
    if (value === null) data.append(key, '');
    else if (value instanceof Blob) data.append(key, value);
    else data.append(key, String(value));
  });
  return data;
};

export const isStaleMemorialError = (error: unknown) => {
  if (!(error instanceof MemorialApiError) || error.status !== 400) return false;
  return JSON.stringify(error.payload).toLowerCase().includes('stale') || error.message.toLowerCase().includes('another');
};

export const fetchPortalMemorials = (accessToken: string, signal?: AbortSignal) =>
  request<PortalMemorialList>(MEMORIAL_DISCOVERY_API, { accessToken, signal });

export const fetchMemorialWriteups = (accessToken: string, slug: string, signal?: AbortSignal) =>
  request<PortalWriteupIndex>(`${memorialApiRoot(slug)}/writeups/`, { accessToken, signal });

export const updateSingletonWriteup = (
  accessToken: string,
  slug: string,
  type: Exclude<WriteupType, 'tribute' | 'milestone' | 'service_event'>,
  contentJson: LexicalJson,
  expectedUpdatedAt: string,
) => request<PortalWriteup>(`${memorialApiRoot(slug)}/writeups/${type}/`, {
  accessToken,
  body: { content_json: contentJson, expected_updated_at: expectedUpdatedAt },
  method: 'PATCH',
});

export const createMemorialTribute = (
  accessToken: string,
  slug: string,
  body: {
    kind: 'ministry' | 'personal';
    ministry_name: string;
    author_name: string;
    author_role: string;
    content_json: LexicalJson;
    expected_page_updated_at: string;
  },
) => request<PortalWriteup>(`${memorialApiRoot(slug)}/writeups/tributes/`, { accessToken, body, method: 'POST' });

export const updateRepeatedWriteup = (
  accessToken: string,
  slug: string,
  type: Extract<WriteupType, 'tribute' | 'milestone' | 'service_event'>,
  objectId: MemorialId,
  body: { content_json: LexicalJson; expected_updated_at: string } & Record<string, unknown>,
) => request<PortalWriteup>(`${memorialApiRoot(slug)}/writeups/${type}/${objectId}/`, { accessToken, body, method: 'PATCH' });

export const fetchModerationWorkspace = (accessToken: string, slug: string, signal?: AbortSignal) =>
  request<ModerationWorkspace>(`${memorialApiRoot(slug)}/moderation/`, { accessToken, signal });

export const updateMemorialPage = (accessToken: string, slug: string, body: PageUpdatePayload) =>
  request<ModerationWorkspace>(`${memorialApiRoot(slug)}/moderation/page/`, { accessToken, body, method: 'PATCH' });

export const createMemorialChild = (accessToken: string, slug: string, type: ChildType, body: ChildCreatePayload) =>
  request<ModerationObjectResponse>(`${memorialApiRoot(slug)}/moderation/${type}/`, { accessToken, body, method: 'POST' });

export const updateMemorialChild = (
  accessToken: string,
  slug: string,
  type: ChildType,
  objectId: MemorialId,
  body: { expected_updated_at: string } & Record<string, unknown>,
) => request<ModerationObjectResponse>(`${memorialApiRoot(slug)}/moderation/${type}/${objectId}/`, { accessToken, body, method: 'PATCH' });

export const deleteMemorialChild = (accessToken: string, slug: string, type: ChildType, objectId: MemorialId, expectedUpdatedAt: string) =>
  request<null>(`${memorialApiRoot(slug)}/moderation/${type}/${objectId}/`, {
    accessToken,
    body: { expected_updated_at: expectedUpdatedAt },
    method: 'DELETE',
  });

export const setMemorialChildApproval = (
  accessToken: string,
  slug: string,
  type: ChildType,
  objectId: MemorialId,
  approved: boolean,
  expectedUpdatedAt: string,
) => request<ModerationObjectResponse>(`${memorialApiRoot(slug)}/moderation/${type}/${objectId}/approval/`, {
  accessToken,
  body: { approved, expected_updated_at: expectedUpdatedAt },
  method: 'POST',
});

export const transitionMemorialPublication = (accessToken: string, slug: string, action: 'publish' | 'unpublish', expectedUpdatedAt: string) =>
  request<ModerationWorkspace>(`${memorialApiRoot(slug)}/moderation/publication/`, {
    accessToken,
    body: { action, expected_updated_at: expectedUpdatedAt },
    method: 'POST',
  });

export const fetchSelectableAssets = (accessToken: string, slug: string, signal?: AbortSignal) =>
  request<{ assets: SelectableAsset[] }>(`${memorialApiRoot(slug)}/moderation/media/assets/`, { accessToken, signal });

export const attachBorrowedImage = (accessToken: string, slug: string, body: BorrowedImagePayload) =>
  request<ModerationObjectResponse>(`${memorialApiRoot(slug)}/moderation/media/images/borrowed/`, { accessToken, body, method: 'POST' });

export const uploadMemorialImage = (accessToken: string, slug: string, body: UploadImagePayload) =>
  request<ModerationObjectResponse>(`${memorialApiRoot(slug)}/moderation/media/images/upload/`, {
    accessToken,
    body: asFormData(body as unknown as Record<string, unknown>),
    method: 'POST',
  });

export const replaceWithBorrowedImage = (
  accessToken: string,
  slug: string,
  objectId: MemorialId,
  body: ReplacementPayload & { asset_uuid: string },
) => request<ModerationObjectResponse>(`${memorialApiRoot(slug)}/moderation/media/images/${objectId}/replace-borrowed/`, { accessToken, body, method: 'POST' });

export const replaceWithUploadedImage = (
  accessToken: string,
  slug: string,
  objectId: MemorialId,
  body: ReplacementPayload & { upload: File; title: string; public_availability_confirmed: true },
) => request<ModerationObjectResponse>(`${memorialApiRoot(slug)}/moderation/media/images/${objectId}/replace-upload/`, {
  accessToken,
  body: asFormData(body as unknown as Record<string, unknown>),
  method: 'POST',
});
