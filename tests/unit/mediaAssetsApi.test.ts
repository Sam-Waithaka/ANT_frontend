import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchMediaAsset, fetchMediaAssets, mediaAssetImageUrl, uploadMediaAsset } from '../../src/services/mediaAssetsApi';

const jsonResponse = (payload: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
    ...init,
  });

describe('mediaAssetsApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('lists media assets with bearer authentication', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ results: [{ id: 1, title: 'Church front' }] }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchMediaAssets('access-token')).resolves.toMatchObject({ results: [{ id: 1 }] });
    expect(fetchMock).toHaveBeenCalledWith('/v1/media-assets/', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer access-token' }),
    }));
  });

  it('fetches a fresh media detail when a signed URL needs renewal', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ id: 8, status: 'ready' }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchMediaAsset('access-token', 8)).resolves.toMatchObject({ id: 8 });
    expect(fetchMock).toHaveBeenCalledWith('/v1/media-assets/8/', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer access-token' }),
    }));
  });

  it('uploads cover assets as documented multipart form data', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ id: 2, title: 'Worship' }));
    vi.stubGlobal('fetch', fetchMock);
    const file = new File(['image-data'], 'worship.jpg', { type: 'image/jpeg' });

    await uploadMediaAsset('access-token', file, { altText: 'Church worship', title: 'Worship' });

    const [, options] = fetchMock.mock.calls[0];
    const body = options.body as FormData;
    expect(options.method).toBe('POST');
    expect(body.get('original_file')).toBe(file);
    expect(body.get('title')).toBe('Worship');
    expect(body.get('alt_text')).toBe('Church worship');
  });

  it('prefers a processed WebP variant for rendering', () => {
    expect(mediaAssetImageUrl({
      caption: '',
      height: 360,
      id: 3,
      original_url: 'https://example.com/original.jpg',
      status: 'ready',
      title: 'Church',
      uuid: 'asset-3',
      variant_map: { webp: { small: { file_size: null, format: 'webp', generated_at: null, height: 360, id: 1, quality: 78, size_name: 'small', status: 'ready', url: 'https://example.com/small.webp', width: 640 } } },
      variants: [],
      width: 640,
    })).toBe('https://example.com/small.webp');
  });
});

