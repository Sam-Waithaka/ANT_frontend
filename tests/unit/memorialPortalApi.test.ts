import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  attachBorrowedImage,
  createMemorialChild,
  createMemorialTribute,
  deleteMemorialChild,
  fetchMemorialWriteups,
  fetchModerationWorkspace,
  fetchPortalMemorials,
  fetchSelectableAssets,
  isStaleMemorialError,
  MemorialApiError,
  replaceWithBorrowedImage,
  replaceWithUploadedImage,
  setMemorialChildApproval,
  transitionMemorialPublication,
  updateMemorialChild,
  updateMemorialPage,
  updateRepeatedWriteup,
  updateSingletonWriteup,
  uploadMemorialImage,
} from '../../src/features/memorial/portal/api/memorialPortalApi';
import { emptyLexicalDocument } from '../../src/features/memorial/portal/types';

const jsonResponse = (payload: unknown = {}, init: ResponseInit = {}) => new Response(JSON.stringify(payload), {
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  status: 200,
  ...init,
});

describe('memorialPortalApi', () => {
  const slug = 'elder-geoffrey-kirungu';
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  it('discovers memorial identity before opening a slug workspace', async () => {
    const payload = { memorials: [{ id: '1', slug, display_name: 'Elder Geoffrey Kirungu', status: 'draft', updated_at: '2026-09-19T08:00:00Z', public_path: `/in-memory/${slug}` }] };
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(payload));
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchPortalMemorials('token')).resolves.toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith('/v1/memorials/portal/', expect.objectContaining({ method: 'GET' }));
  });

  it('constructs all four authenticated Writing API operations exactly', async () => {
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(jsonResponse({ writeups: [] })));
    vi.stubGlobal('fetch', fetchMock);
    const content = emptyLexicalDocument();

    await fetchMemorialWriteups('token', slug);
    await updateSingletonWriteup('token', slug, 'family', content, 'page-v1');
    await createMemorialTribute('token', slug, { author_name: 'Name', author_role: 'Role', content_json: content, expected_page_updated_at: 'page-v2', kind: 'personal', ministry_name: '' });
    await updateRepeatedWriteup('token', slug, 'tribute', '14', { content_json: content, expected_updated_at: 'child-v1' });

    expect(fetchMock).toHaveBeenNthCalledWith(1, '/v1/memorials/portal/elder-geoffrey-kirungu/writeups/', expect.objectContaining({ method: 'GET' }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/v1/memorials/portal/elder-geoffrey-kirungu/writeups/family/', expect.objectContaining({ body: JSON.stringify({ content_json: content, expected_updated_at: 'page-v1' }), method: 'PATCH' }));
    expect(fetchMock).toHaveBeenNthCalledWith(3, '/v1/memorials/portal/elder-geoffrey-kirungu/writeups/tributes/', expect.objectContaining({ method: 'POST' }));
    expect(fetchMock).toHaveBeenNthCalledWith(4, '/v1/memorials/portal/elder-geoffrey-kirungu/writeups/tribute/14/', expect.objectContaining({ method: 'PATCH' }));
    expect(fetchMock.mock.calls.every(([, options]) => (options as RequestInit).headers && new Headers((options as RequestInit).headers).get('Authorization') === 'Bearer token')).toBe(true);
  });

  it('constructs moderation, page, child, approval and publication operations', async () => {
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(jsonResponse({})));
    vi.stubGlobal('fetch', fetchMock);
    const content = emptyLexicalDocument();

    await fetchModerationWorkspace('token', slug);
    await updateMemorialPage('token', slug, { display_name: 'Elder Geoffrey Kirungu', expected_updated_at: 'page-v1' });
    await createMemorialChild('token', slug, 'milestone', { content_json: content, date_label: '2012', expected_page_updated_at: 'page-v2', occurred_on: null, position: 0, title: 'Called to serve' });
    await updateMemorialChild('token', slug, 'milestone', '2', { expected_updated_at: 'child-v1', position: 1 });
    await deleteMemorialChild('token', slug, 'milestone', '2', 'child-v2');
    await setMemorialChildApproval('token', slug, 'milestone', '2', true, 'child-v3');
    await transitionMemorialPublication('token', slug, 'publish', 'page-v3');

    const calls = fetchMock.mock.calls.map(([url, options]) => [url, (options as RequestInit).method]);
    expect(calls).toEqual([
      ['/v1/memorials/portal/elder-geoffrey-kirungu/moderation/', 'GET'],
      ['/v1/memorials/portal/elder-geoffrey-kirungu/moderation/page/', 'PATCH'],
      ['/v1/memorials/portal/elder-geoffrey-kirungu/moderation/milestone/', 'POST'],
      ['/v1/memorials/portal/elder-geoffrey-kirungu/moderation/milestone/2/', 'PATCH'],
      ['/v1/memorials/portal/elder-geoffrey-kirungu/moderation/milestone/2/', 'DELETE'],
      ['/v1/memorials/portal/elder-geoffrey-kirungu/moderation/milestone/2/approval/', 'POST'],
      ['/v1/memorials/portal/elder-geoffrey-kirungu/moderation/publication/', 'POST'],
    ]);
  });

  it('constructs selectable, borrowed, upload and both replacement media operations', async () => {
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(jsonResponse({ assets: [] })));
    vi.stubGlobal('fetch', fetchMock);
    const upload = new File(['image'], 'portrait.jpg', { type: 'image/jpeg' });
    const base = { alt_text: 'Portrait', caption: '', credit: '', expected_page_updated_at: 'page-v1', milestone_id: null, position: 0, purpose: 'hero' as const, tribute_id: null };

    await fetchSelectableAssets('token', slug);
    await attachBorrowedImage('token', slug, { ...base, asset_uuid: 'asset-1' });
    await uploadMemorialImage('token', slug, { ...base, public_availability_confirmed: true, title: 'Portrait', upload });
    await replaceWithBorrowedImage('token', slug, '8', { alt_text: 'New portrait', asset_uuid: 'asset-2', caption: null, credit: null, expected_link_updated_at: 'link-v1', expected_page_updated_at: 'page-v2' });
    await replaceWithUploadedImage('token', slug, '9', { alt_text: 'New portrait', caption: null, credit: null, expected_link_updated_at: 'link-v2', expected_page_updated_at: 'page-v3', public_availability_confirmed: true, title: 'Replacement', upload });

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      '/v1/memorials/portal/elder-geoffrey-kirungu/moderation/media/assets/',
      '/v1/memorials/portal/elder-geoffrey-kirungu/moderation/media/images/borrowed/',
      '/v1/memorials/portal/elder-geoffrey-kirungu/moderation/media/images/upload/',
      '/v1/memorials/portal/elder-geoffrey-kirungu/moderation/media/images/8/replace-borrowed/',
      '/v1/memorials/portal/elder-geoffrey-kirungu/moderation/media/images/9/replace-upload/',
    ]);
    const uploadOptions = fetchMock.mock.calls[2][1] as RequestInit;
    expect(uploadOptions.body).toBeInstanceOf(FormData);
    expect(new Headers(uploadOptions.headers).has('Content-Type')).toBe(false);
    expect((uploadOptions.body as FormData).get('public_availability_confirmed')).toBe('true');
  });

  it('preserves validation payloads and recognizes backend stale-write 400 responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ expected_updated_at: ['This content is stale.'] }, { status: 400 })));
    const error = await updateMemorialPage('token', slug, { expected_updated_at: 'old' }).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(MemorialApiError);
    expect(error).toMatchObject({ status: 400 });
    expect(isStaleMemorialError(error)).toBe(true);
  });
});
