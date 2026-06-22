import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../src/services/apiClient';
import { fetchResourcesNavigation, normalizeResourcesNavigation } from '../../src/services/resourcesApi';

const jsonResponse = (payload: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
    ...init,
  });

describe('resourcesApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('normalizes navigation payloads with optional curation links', () => {
    expect(normalizeResourcesNavigation({
      categories: [{ id: 1, name: 'Proverbs' }],
      category_series_links: [{ id: 2, category: 1, series: 4 }],
      ministries: [{ id: 3, name: 'Youth', writing_count: 5 }],
      resource_type_category_links: [{ id: 5, resource_type: 8, category: 1 }],
      resource_types: [{ id: 8, name: 'Bible Study' }],
      scripture_books: [{ osis_id: 'Prov', name: 'Proverbs', writing_count: 30 }],
      series: [{ id: 4, title: 'Proverbs Lessons' }],
    })).toMatchObject({
      categories: [{ name: 'Proverbs' }],
      category_series_links: [{ category: 1, series: 4 }],
      resource_type_category_links: [{ resource_type: 8, category: 1 }],
      series: [{ title: 'Proverbs Lessons' }],
    });
  });

  it('fetches narrowed resources navigation without auth headers', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({
      categories: [{ id: 1, name: 'Proverbs' }],
      series: [{ id: 2, title: 'Proverbs Lessons' }],
    }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchResourcesNavigation({
      category_slug: 'proverbs',
      resource_type_slug: 'bible-study',
    })).resolves.toMatchObject({
      categories: [{ name: 'Proverbs' }],
      series: [{ title: 'Proverbs Lessons' }],
    });

    expect(fetchMock).toHaveBeenCalledWith('/v1/resources/navigation/?category_slug=proverbs&resource_type_slug=bible-study', expect.objectContaining({
      headers: { Accept: 'application/json' },
    }));
  });

  it('preserves resources navigation error detail and status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => Promise.resolve(jsonResponse({ detail: 'Bad filter.' }, { status: 400 }))));

    await expect(fetchResourcesNavigation({ resource_type_slug: 'missing' })).rejects.toBeInstanceOf(ApiError);
    await expect(fetchResourcesNavigation({ resource_type_slug: 'missing' })).rejects.toMatchObject({
      detail: 'Bad filter.',
      status: 400,
    });
  });
});
