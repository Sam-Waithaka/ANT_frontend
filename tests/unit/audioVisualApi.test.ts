import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearApiClientCaches } from '../../src/services/apiClient';
import {
  fetchAudioVisualCollectionDetail,
  fetchAudioVisualHome,
  fetchAudioVisualItemPage,
  fetchAudioVisualMediaTypes,
  fetchAudioVisualWatchItem,
  fetchLatestSermon,
  normalizeAudioVisualItem,
} from '../../src/services/audioVisualApi';

const jsonResponse = (payload: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
    ...init,
  });

describe('audioVisualApi', () => {
  beforeEach(() => {
    clearApiClientCaches();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    clearApiClientCaches();
    vi.unstubAllGlobals();
  });

  it('normalizes the documented watch item shape into frontend media fields', () => {
    const item = normalizeAudioVisualItem({
      id: 7,
      title: 'Walking in Faith, Not by Sight',
      slug: 'walking-in-faith',
      description: 'Learning to trust God when the path ahead is unclear.',
      description_excerpt: 'Learning to trust God.',
      thumbnail_url: 'https://img.youtube.com/vi/abc/maxresdefault.jpg',
      media_type: 'sermon',
      media_type_detail: { name: 'Sermon' },
      language: 'english',
      provider: 'youtube',
      duration_seconds: '1480',
      published_at: '2026-05-10T08:30:00Z',
      speaker: 'Rev. Harun Njuguna',
      scripture_reference: '2 Corinthians 5:7',
      external_url: 'https://youtube.com/watch?v=abc',
      embed_url: 'https://youtube.com/embed/abc',
      live_status: 'completed',
      series: { name: 'Walking in Faith', slug: 'walking-in-faith', item_count: 5 },
      categories: [{ name: 'Sermons', slug: 'sermons' }],
      collections: [{ name: 'Featured', slug: 'featured' }],
    });

    expect(item).toMatchObject({
      id: 7,
      title: 'Walking in Faith, Not by Sight',
      slug: 'walking-in-faith',
      description: 'Learning to trust God when the path ahead is unclear.',
      descriptionExcerpt: 'Learning to trust God.',
      thumbnailUrl: 'https://img.youtube.com/vi/abc/maxresdefault.jpg',
      mediaType: 'sermon',
      mediaTypeLabel: 'Sermon',
      durationSeconds: 1480,
      liveStatus: 'completed',
      series: { name: 'Walking in Faith', slug: 'walking-in-faith', itemCount: 5 },
      categories: [{ name: 'Sermons', slug: 'sermons' }],
      collections: [{ name: 'Featured', slug: 'featured' }],
    });
  });

  it('normalizes home payload rails and live CTA item', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({
      generated_at: '2026-05-13T12:00:00Z',
      hero: { title: 'Hero Sermon', slug: 'hero-sermon', media_type: 'sermon' },
      live: {
        cta_label: 'Join the service live',
        item: { title: 'Sunday Service', slug: 'sunday-service', media_type: 'livestream', live_status: 'live' },
      },
      rails: [
        {
          key: 'featured',
          title: 'Featured',
          items: [{ title: 'Featured Message', slug: 'featured-message', media_type: 'sermon' }],
        },
      ],
    })));

    await expect(fetchAudioVisualHome()).resolves.toMatchObject({
      generatedAt: '2026-05-13T12:00:00Z',
      hero: { title: 'Hero Sermon', slug: 'hero-sermon', mediaType: 'sermon' },
      live: {
        ctaLabel: 'Join the service live',
        item: { title: 'Sunday Service', slug: 'sunday-service', liveStatus: 'live' },
      },
      rails: [{ key: 'featured', title: 'Featured', items: [{ title: 'Featured Message' }] }],
    });
  });

  it('builds list query params for filters, pagination, live status, search, and ordering', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({
      count: 23,
      next: '/v1/audio-visual/?page=3',
      previous: '/v1/audio-visual/?page=1',
      results: [{ title: 'Grace Message', slug: 'grace-message', media_type: 'sermon' }],
    }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchAudioVisualItemPage({
      category: 'sermons',
      collection: 'latest-sermons',
      featured: true,
      language: 'english',
      liveStatus: 'live',
      musicSubcategory: 'choir',
      ordering: 'priority',
      page: 2,
      pageSize: 20,
      search: 'grace',
      series: 'walking-in-faith',
      type: 'sermon',
    })).resolves.toMatchObject({
      count: 23,
      items: [{ title: 'Grace Message', slug: 'grace-message' }],
      next: '/v1/audio-visual/?page=3',
      previous: '/v1/audio-visual/?page=1',
    });

    const requestedUrl = fetchMock.mock.calls[0][0] as string;
    const url = new URL(requestedUrl, 'http://test.local');

    expect(url.pathname).toBe('/v1/audio-visual/');
    expect(url.searchParams.get('category')).toBe('sermons');
    expect(url.searchParams.get('collection')).toBe('latest-sermons');
    expect(url.searchParams.get('featured')).toBe('true');
    expect(url.searchParams.get('language')).toBe('english');
    expect(url.searchParams.get('live_status')).toBe('live');
    expect(url.searchParams.get('music_subcategory')).toBe('choir');
    expect(url.searchParams.get('ordering')).toBe('priority');
    expect(url.searchParams.get('page')).toBe('2');
    expect(url.searchParams.get('page_size')).toBe('20');
    expect(url.searchParams.get('search')).toBe('grace');
    expect(url.searchParams.get('series')).toBe('walking-in-faith');
    expect(url.searchParams.get('type')).toBe('sermon');
  });

  it('normalizes lookup and group detail endpoints', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ results: [{ name: 'Sermon', slug: 'sermon', count: 12 }] }))
      .mockResolvedValueOnce(jsonResponse({
        name: 'Latest Sermons',
        slug: 'latest-sermons',
        description: 'Curated recent messages.',
        items: [{ title: 'Latest Message', slug: 'latest-message', media_type: 'sermon' }],
      }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchAudioVisualMediaTypes()).resolves.toEqual([
      { name: 'Sermon', slug: 'sermon', itemCount: 12, description: '', id: undefined, thumbnailUrl: '' },
    ]);
    await expect(fetchAudioVisualCollectionDetail('latest-sermons')).resolves.toMatchObject({
      name: 'Latest Sermons',
      slug: 'latest-sermons',
      items: [{ title: 'Latest Message' }],
    });
  });

  it('normalizes null latest sermon responses and watch detail responses', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(null))
      .mockResolvedValueOnce(jsonResponse({ title: 'Watch Detail', slug: 'watch-detail', media_type: 'sermon' }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchLatestSermon()).resolves.toBeNull();
    await expect(fetchAudioVisualWatchItem('watch-detail')).resolves.toMatchObject({
      title: 'Watch Detail',
      slug: 'watch-detail',
      mediaType: 'sermon',
    });
  });
});
