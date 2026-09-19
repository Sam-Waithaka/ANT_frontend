import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../src/services/apiClient';
import {
  createMemorialPage,
  createMemorialRichTextBlock,
  createMemorialRichTextMediaEmbed,
  createMemorialRichTextScriptureReference,
  fetchMemorialEditorState,
  fetchMemorialPages,
  normalizeMemorialEditorState,
  normalizeMemorialPage,
  runMemorialWorkflowAction,
  updateMemorialPage,
} from '../../src/services/memorialApi';

const jsonResponse = (payload: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
    ...init,
  });

describe('memorialApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('normalizes direct list and paginated list payloads', () => {
    expect(normalizeMemorialPage([{ id: 1 }, { id: 2 }])).toEqual({
      count: 2,
      results: [{ id: 1 }, { id: 2 }],
    });

    expect(normalizeMemorialPage({
      count: 7,
      next: '/next',
      previous: null,
      results: [{ id: 4 }],
    })).toEqual({
      count: 7,
      next: '/next',
      previous: null,
      results: [{ id: 4 }],
    });
  });

  it('normalizes bundled editor-state payloads and filters unknown section keys', () => {
    const state = normalizeMemorialEditorState({
      arrangements: { count: 1, results: [{ id: 10, title: 'Service' }] },
      gallery_items: [{ id: 11 }],
      media_embeds: [{ id: 12, block: 5 }],
      page: { full_name: 'Rev. Jane', id: 1, slug: 'rev-jane' },
      rich_text_blocks: { results: [{ id: 5, section_key: 'HERO' }] },
      scripture_references: [{ id: 13, block: 5 }],
      section_keys: ['HERO', 'NOT_A_SECTION', 'GALLERY'],
    });

    expect(state.page).toMatchObject({ full_name: 'Rev. Jane' });
    expect(state.rich_text_blocks).toEqual([{ id: 5, section_key: 'HERO' }]);
    expect(state.media_embeds).toEqual([{ id: 12, block: 5 }]);
    expect(state.scripture_references).toEqual([{ id: 13, block: 5 }]);
    expect(state.arrangements).toEqual([{ id: 10, title: 'Service' }]);
    expect(state.gallery_items).toEqual([{ id: 11 }]);
    expect(state.section_keys).toEqual(['HERO', 'GALLERY']);
    expect(state.timeline_events).toEqual([]);
  });

  it('fetches memorial pages with documented filters and bearer auth', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({
      count: 1,
      results: [{ full_name: 'Rev. Jane', id: 9, status: 'PUBLISHED' }],
    }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchMemorialPages('access-token', {
      page: 2,
      search: 'jane',
      status: 'PUBLISHED',
    })).resolves.toMatchObject({
      count: 1,
      results: [{ id: 9 }],
    });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/v1/memorial/pages/?page=2&search=jane&status=PUBLISHED');
    expect(options).toMatchObject({
      headers: expect.objectContaining({
        Accept: 'application/json',
        Authorization: 'Bearer access-token',
      }),
      method: 'GET',
    });
  });

  it('creates, patches, and hydrates the memorial editor contract', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ full_name: 'Rev. Jane', id: 1 }))
      .mockResolvedValueOnce(jsonResponse({ full_name: 'Rev. Jane Doe', id: 1 }))
      .mockResolvedValueOnce(jsonResponse({ id: 5, memorial: 1, section_key: 'HERO' }))
      .mockResolvedValueOnce(jsonResponse({ id: 6, block: 5, media_asset: 22 }))
      .mockResolvedValueOnce(jsonResponse({ id: 7, block: 5, book: 'John' }))
      .mockResolvedValueOnce(jsonResponse({
        page: { full_name: 'Rev. Jane Doe', id: 1 },
        rich_text_blocks: [{ id: 5 }],
      }));
    vi.stubGlobal('fetch', fetchMock);

    await createMemorialPage('access-token', {
      full_name: 'Rev. Jane',
      slug: 'rev-jane',
    });
    await updateMemorialPage('access-token', 1, { full_name: 'Rev. Jane Doe' });
    await createMemorialRichTextBlock('access-token', {
      content_json: { root: { children: [], type: 'root' } },
      memorial: 1,
      section_key: 'HERO',
      title: 'Hero',
    });
    await createMemorialRichTextMediaEmbed('access-token', {
      block: 5,
      media_asset: 22,
      position_hint: 'root.children',
    });
    await createMemorialRichTextScriptureReference('access-token', {
      block: 5,
      book: 'John',
      chapter_start: 11,
      display_text: 'John 11:25',
      verse_start: 25,
    });
    await fetchMemorialEditorState('access-token', 1);

    expect(fetchMock).toHaveBeenNthCalledWith(1, '/v1/memorial/pages/', expect.objectContaining({
      body: JSON.stringify({ full_name: 'Rev. Jane', slug: 'rev-jane' }),
      method: 'POST',
    }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/v1/memorial/pages/1/', expect.objectContaining({
      body: JSON.stringify({ full_name: 'Rev. Jane Doe' }),
      method: 'PATCH',
    }));
    expect(fetchMock).toHaveBeenNthCalledWith(3, '/v1/memorial/rich-text-blocks/', expect.objectContaining({ method: 'POST' }));
    expect(fetchMock).toHaveBeenNthCalledWith(4, '/v1/memorial/rich-text-media-embeds/', expect.objectContaining({ method: 'POST' }));
    expect(fetchMock).toHaveBeenNthCalledWith(5, '/v1/memorial/rich-text-scripture-references/', expect.objectContaining({ method: 'POST' }));
    expect(fetchMock).toHaveBeenNthCalledWith(6, '/v1/memorial/pages/1/editor-state/', expect.objectContaining({ method: 'GET' }));
  });

  it('runs workflow actions through documented resource endpoints', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({
      id: 1,
      status: 'PUBLISHED',
    }));
    vi.stubGlobal('fetch', fetchMock);

    await runMemorialWorkflowAction('access-token', 'pages', 1, 'publish');

    expect(fetchMock).toHaveBeenCalledWith('/v1/memorial/pages/1/publish/', expect.objectContaining({
      method: 'POST',
    }));
  });

  it('preserves backend error detail and status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() =>
        Promise.resolve(jsonResponse({ detail: 'Not allowed.' }, { status: 403 })),
      ),
    );

    await expect(
      runMemorialWorkflowAction('access-token', 'pages', 1, 'publish'),
    ).rejects.toBeInstanceOf(ApiError);
    await expect(
      runMemorialWorkflowAction('access-token', 'pages', 1, 'publish'),
    ).rejects.toMatchObject({
      detail: 'Not allowed.',
      status: 403,
    });
  });
});
