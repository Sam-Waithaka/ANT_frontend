import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearApiClientCaches } from '../../src/services/apiClient';
import { searchPublicAudioVisual, searchPublicWritings } from '../../src/services/publicSearchApi';

const jsonResponse = (payload: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
    ...init,
  });

describe('publicSearchApi', () => {
  beforeEach(() => {
    clearApiClientCaches();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    clearApiClientCaches();
    vi.unstubAllGlobals();
  });

  it('searches public writings without an auth token and preserves pagination', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({
      count: 2,
      next: '/v1/search/writings/?q=faith&page=2&page_size=1',
      previous: null,
      results: [{ id: 7, title: 'Faith That Endures', slug: 'faith-that-endures', status: 'PUBLISHED' }],
    }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchPublicWritings({ page: 1, page_size: 1, q: 'faith' })).resolves.toMatchObject({
      count: 2,
      next: '/v1/search/writings/?q=faith&page=2&page_size=1',
      results: [{ title: 'Faith That Endures' }],
    });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/v1/search/writings/?page=1&page_size=1&q=faith');
    expect(options).toMatchObject({ headers: { Accept: 'application/json' } });
    expect((options as RequestInit).headers).not.toHaveProperty('Authorization');
  });

  it('searches public audio-visual results and normalizes item fields', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({
      count: 1,
      next: null,
      previous: null,
      results: [{ id: 11, title: 'Sunday Sermon', slug: 'sunday-sermon', media_type: 'sermon', media_type_detail: { name: 'Sermon' }, speaker: 'Pastor' }],
    }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchPublicAudioVisual({ page: 1, page_size: 4, q: 'sermon' })).resolves.toMatchObject({
      count: 1,
      next: null,
      results: [{ mediaType: 'sermon', mediaTypeLabel: 'Sermon', title: 'Sunday Sermon' }],
    });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/v1/search/audio-visual/?page=1&page_size=4&q=sermon');
    expect((options as RequestInit).headers).not.toHaveProperty('Authorization');
  });
});
