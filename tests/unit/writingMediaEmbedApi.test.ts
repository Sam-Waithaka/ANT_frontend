import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { deleteWritingMediaEmbed, updateWritingMediaEmbed } from '../../src/services/writingApi';

const jsonResponse = (payload: unknown, status = 200) => new Response(JSON.stringify(payload), {
  headers: { 'Content-Type': 'application/json' }, status,
});

describe('writing media embed updates', () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  it('persists image layout metadata and removes a discarded image relationship', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ id: 7, media_asset: 8, writing: 2 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);

    await updateWritingMediaEmbed('token', 7, {
      alt_text_override: 'Church entrance', caption_override: 'A.I.C Njoro Town', position_hint: 'root.children.1',
    });
    await deleteWritingMediaEmbed('token', 7);

    expect(fetchMock.mock.calls[0]).toEqual(['/v1/writing-media-embeds/7/', expect.objectContaining({
      body: JSON.stringify({ alt_text_override: 'Church entrance', caption_override: 'A.I.C Njoro Town', position_hint: 'root.children.1' }), method: 'PATCH',
    })]);
    expect(fetchMock.mock.calls[1]).toEqual(['/v1/writing-media-embeds/7/', expect.objectContaining({ method: 'DELETE' })]);
  });
});
