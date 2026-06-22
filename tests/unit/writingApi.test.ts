import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../src/services/apiClient';
import {
  createCategorySeriesLink,
  createResourceTypeCategoryLink,
  fetchCategorySeriesLinks,
  createWriting,
  fetchMediaAssetUsage,
  fetchResourceTypeCategoryLinks,
  fetchWritings,
  normalizePage,
  publishWriting,
  updateWriting,
} from '../../src/services/writingApi';

const jsonResponse = (payload: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
    ...init,
  });

describe('writingApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('normalizes array and paginated payloads', () => {
    expect(normalizePage([{ id: 1 }, { id: 2 }])).toEqual({
      count: 2,
      results: [{ id: 1 }, { id: 2 }],
    });
    expect(normalizePage({ count: 12, next: '/next', previous: null, results: [{ id: 3 }] })).toEqual({
      count: 12,
      next: '/next',
      previous: null,
      results: [{ id: 3 }],
    });
  });

  it('fetches writings with documented filters and bearer auth', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({
      count: 1,
      results: [{ id: 9, status: 'DRAFT', title: 'Mercy Every Morning' }],
    }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchWritings('access-token', {
      featured: true,
      page: 2,
      page_size: 20,
      resource_type_slug: 'devotional',
      search: 'mercy',
      status: 'DRAFT',
    })).resolves.toMatchObject({
      count: 1,
      results: [{ id: 9 }],
    });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/v1/writings/?featured=true&page=2&page_size=20&resource_type_slug=devotional&search=mercy&status=DRAFT');
    expect(options).toMatchObject({
      headers: expect.objectContaining({
        Accept: 'application/json',
        Authorization: 'Bearer access-token',
      }),
      method: 'GET',
    });
  });

  it('creates a draft with documented Lexical JSON content', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ id: 7, status: 'DRAFT', title: 'Grace' }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(createWriting('access-token', {
      content_json: { root: { children: [], type: 'root' } },
      status: 'DRAFT',
      title: 'Grace',
    })).resolves.toMatchObject({ id: 7 });

    expect(fetchMock).toHaveBeenCalledWith('/v1/writings/', expect.objectContaining({
      body: JSON.stringify({
        content_json: { root: { children: [], type: 'root' } },
        status: 'DRAFT',
        title: 'Grace',
      }),
      method: 'POST',
    }));
  });

  it('patches, publishes, and checks media usage on documented endpoints', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ id: 4, title: 'Updated' }))
      .mockResolvedValueOnce(jsonResponse({ id: 4, status: 'PUBLISHED' }))
      .mockResolvedValueOnce(jsonResponse({ usage_count: 2 }));
    vi.stubGlobal('fetch', fetchMock);

    await updateWriting('access-token', 4, { title: 'Updated' });
    await publishWriting('access-token', 4);
    await fetchMediaAssetUsage('access-token', 22);

    expect(fetchMock).toHaveBeenNthCalledWith(1, '/v1/writings/4/', expect.objectContaining({ method: 'PATCH' }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/v1/writings/4/publish/', expect.objectContaining({ method: 'POST' }));
    expect(fetchMock).toHaveBeenNthCalledWith(3, '/v1/media-assets/22/usage/', expect.objectContaining({ method: 'GET' }));
  });

  it('reads and creates reusable taxonomy curation links', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ results: [{ id: 1, resource_type: 2, category: 3 }] }))
      .mockResolvedValueOnce(jsonResponse({ results: [{ id: 4, category: 3, series: 8 }] }))
      .mockResolvedValueOnce(jsonResponse({ id: 5, resource_type: 2, category: 9 }))
      .mockResolvedValueOnce(jsonResponse({ id: 6, category: 9, series: 10 }));
    vi.stubGlobal('fetch', fetchMock);

    await fetchResourceTypeCategoryLinks('access-token');
    await fetchCategorySeriesLinks('access-token');
    await createResourceTypeCategoryLink('access-token', { resource_type: 2, category: 9, sort_order: 1, is_active: true });
    await createCategorySeriesLink('access-token', { category: 9, series: 10, sort_order: 1, is_active: true });

    expect(fetchMock).toHaveBeenNthCalledWith(1, '/v1/writing-resource-type-categories/', expect.objectContaining({ method: 'GET' }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/v1/writing-category-series/', expect.objectContaining({ method: 'GET' }));
    expect(fetchMock).toHaveBeenNthCalledWith(3, '/v1/writing-resource-type-categories/', expect.objectContaining({
      body: JSON.stringify({ resource_type: 2, category: 9, sort_order: 1, is_active: true }),
      method: 'POST',
    }));
    expect(fetchMock).toHaveBeenNthCalledWith(4, '/v1/writing-category-series/', expect.objectContaining({
      body: JSON.stringify({ category: 9, series: 10, sort_order: 1, is_active: true }),
      method: 'POST',
    }));
  });

  it('preserves backend error detail and status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => Promise.resolve(jsonResponse({ detail: 'Not allowed.' }, { status: 403 }))));

    await expect(publishWriting('access-token', 4)).rejects.toBeInstanceOf(ApiError);
    await expect(publishWriting('access-token', 4)).rejects.toMatchObject({
      detail: 'Not allowed.',
      status: 403,
    });
  });
});
