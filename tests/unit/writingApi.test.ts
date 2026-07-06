import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../src/services/apiClient';
import {
  createCategorySeriesLink,
  createWritingSeriesItem,
  createResourceTypeCategoryLink,
  createWritingTag,
  deleteWritingSeriesItem,
  createWritingScriptureReference,
  deleteWritingScriptureReference,
  fetchCategorySeriesLinks,
  createWriting,
  fetchMediaAssetUsage,
  fetchResourceTypeCategoryLinks,
  fetchWritingSeriesItems,
  fetchWritingScriptureReferences,
  fetchWritingTags,
  fetchWritings,
  normalizePage,
  publishWriting,
  reorderWritingSeriesItems,
  updateWriting,
  updateWritingSeriesItem,
  updateWritingTag,
  updateWritingScriptureReference,
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

  it('fetches existing writing tags for rich metadata selection', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ results: [{ id: 4, name: 'Prayer', slug: 'prayer' }] }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchWritingTags('access-token')).resolves.toMatchObject({
      results: [{ id: 4, name: 'Prayer' }],
    });

    expect(fetchMock).toHaveBeenCalledWith('/v1/writing-tags/', expect.objectContaining({ method: 'GET' }));
  });

  it('creates and updates writing tags through the taxonomy API', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ id: 4, name: 'Prayer', slug: 'prayer' }))
      .mockResolvedValueOnce(jsonResponse({ id: 4, name: 'Deep Prayer', slug: 'deep-prayer' }));
    vi.stubGlobal('fetch', fetchMock);

    await createWritingTag('access-token', { name: 'Prayer', slug: 'prayer' });
    await updateWritingTag('access-token', 4, { name: 'Deep Prayer', slug: 'deep-prayer' });

    expect(fetchMock).toHaveBeenNthCalledWith(1, '/v1/writing-tags/', expect.objectContaining({
      body: JSON.stringify({ name: 'Prayer', slug: 'prayer' }),
      method: 'POST',
    }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/v1/writing-tags/4/', expect.objectContaining({
      body: JSON.stringify({ name: 'Deep Prayer', slug: 'deep-prayer' }),
      method: 'PATCH',
    }));
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

  it('reads and creates reusable taxonomy curation links with curation fields', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ results: [{ id: 1, resource_type: 2, category: 3 }] }))
      .mockResolvedValueOnce(jsonResponse({ results: [{ id: 4, category: 3, series: 8 }] }))
      .mockResolvedValueOnce(jsonResponse({ id: 5, resource_type: 2, category: 9 }))
      .mockResolvedValueOnce(jsonResponse({ id: 6, category: 9, series: 10 }));
    vi.stubGlobal('fetch', fetchMock);

    await fetchResourceTypeCategoryLinks('access-token');
    await fetchCategorySeriesLinks('access-token');
    await createResourceTypeCategoryLink('access-token', { resource_type: 2, category: 9, sort_order: 1, is_active: true, is_featured: true });
    await createCategorySeriesLink('access-token', { category: 9, series: 10, sort_order: 2, is_active: true, is_featured: false });

    expect(fetchMock).toHaveBeenNthCalledWith(1, '/v1/writing-resource-type-categories/', expect.objectContaining({ method: 'GET' }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/v1/writing-category-series/', expect.objectContaining({ method: 'GET' }));
    expect(fetchMock).toHaveBeenNthCalledWith(3, '/v1/writing-resource-type-categories/', expect.objectContaining({
      body: JSON.stringify({ resource_type: 2, category: 9, sort_order: 1, is_active: true, is_featured: true }),
      method: 'POST',
    }));
    expect(fetchMock).toHaveBeenNthCalledWith(4, '/v1/writing-category-series/', expect.objectContaining({
      body: JSON.stringify({ category: 9, series: 10, sort_order: 2, is_active: true, is_featured: false }),
      method: 'POST',
    }));
  });

  it('manages writing series items through dedicated series curation endpoints', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ results: [{ id: 10, series: 4, writing: 21, writing_title: 'First', order: 0 }] }))
      .mockResolvedValueOnce(jsonResponse({ id: 11, series: 4, writing: 22, writing_title: 'Second', order: 1 }))
      .mockResolvedValueOnce(jsonResponse({ id: 11, series: 4, writing: 22, writing_title: 'Second', order: 0 }))
      .mockResolvedValueOnce(jsonResponse([{ id: 11, order: 0 }, { id: 10, order: 1 }]))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);

    await fetchWritingSeriesItems('access-token', 4);
    await createWritingSeriesItem('access-token', { series: 4, writing: 22, order: 1 });
    await updateWritingSeriesItem('access-token', 11, { order: 0 });
    await reorderWritingSeriesItems('access-token', 4, [{ id: 11, order: 0 }, { id: 10, order: 1 }]);
    await deleteWritingSeriesItem('access-token', 10);

    expect(fetchMock).toHaveBeenNthCalledWith(1, '/v1/writing-series-items/?series=4', expect.objectContaining({ method: 'GET' }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/v1/writing-series-items/', expect.objectContaining({
      body: JSON.stringify({ series: 4, writing: 22, order: 1 }),
      method: 'POST',
    }));
    expect(fetchMock).toHaveBeenNthCalledWith(3, '/v1/writing-series-items/11/', expect.objectContaining({
      body: JSON.stringify({ order: 0 }),
      method: 'PATCH',
    }));
    expect(fetchMock).toHaveBeenNthCalledWith(4, '/v1/writing-series/4/reorder-items/', expect.objectContaining({
      body: JSON.stringify({ items: [{ id: 11, order: 0 }, { id: 10, order: 1 }] }),
      method: 'POST',
    }));
    expect(fetchMock).toHaveBeenNthCalledWith(5, '/v1/writing-series-items/10/', expect.objectContaining({ method: 'DELETE' }));
  });
  it('manages writing Scripture references with dedicated CRUD endpoints', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ results: [{ id: 11, writing: 4, book: 'John', chapter_start: 3, verse_start: 16, display_text: 'John 3:16', version: 'BSB' }] }))
      .mockResolvedValueOnce(jsonResponse({ id: 12, writing: 4, book: 'Ps', chapter_start: 95, verse_start: 6, display_text: 'Psalm 95:6', version: 'BSB' }))
      .mockResolvedValueOnce(jsonResponse({ id: 12, writing: 4, book: 'Ps', chapter_start: 95, verse_start: 7, display_text: 'Psalm 95:7', version: 'BSB' }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);

    await fetchWritingScriptureReferences('access-token', 4);
    await createWritingScriptureReference('access-token', { writing: 4, book_osis: 'Ps', chapter_start: 95, verse_start: 6, display_text: 'Psalm 95:6' });
    await updateWritingScriptureReference('access-token', 12, { book_osis: 'Ps', chapter_start: 95, verse_start: 7, display_text: 'Psalm 95:7' });
    await deleteWritingScriptureReference('access-token', 12);

    expect(fetchMock).toHaveBeenNthCalledWith(1, '/v1/writing-scripture-references/?writing=4', expect.objectContaining({ method: 'GET' }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/v1/writing-scripture-references/', expect.objectContaining({
      body: JSON.stringify({ writing: 4, book_osis: 'Ps', chapter_start: 95, verse_start: 6, display_text: 'Psalm 95:6' }),
      method: 'POST',
    }));
    expect(fetchMock).toHaveBeenNthCalledWith(3, '/v1/writing-scripture-references/12/', expect.objectContaining({
      body: JSON.stringify({ book_osis: 'Ps', chapter_start: 95, verse_start: 7, display_text: 'Psalm 95:7' }),
      method: 'PATCH',
    }));
    expect(fetchMock).toHaveBeenNthCalledWith(4, '/v1/writing-scripture-references/12/', expect.objectContaining({ method: 'DELETE' }));
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

