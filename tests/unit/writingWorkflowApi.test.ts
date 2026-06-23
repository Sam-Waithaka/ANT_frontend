import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createWritingMediaEmbed, returnWritingToDraft, scheduleWriting, submitWritingForReview, unscheduleWriting } from '../../src/services/writingApi';

const jsonResponse = (payload: unknown) => new Response(JSON.stringify(payload), {
  headers: { 'Content-Type': 'application/json' },
  status: 200,
});

describe('writing workflow API', () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  it('uses the signed-off workflow endpoints and bodies', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ id: 2, status: 'IN_REVIEW' }))
      .mockResolvedValueOnce(jsonResponse({ id: 2, status: 'DRAFT' }))
      .mockResolvedValueOnce(jsonResponse({ id: 2, status: 'SCHEDULED' }))
      .mockResolvedValueOnce(jsonResponse({ id: 2, status: 'IN_REVIEW' }))
      .mockResolvedValueOnce(jsonResponse({ id: 4, media_asset: 8, writing: 2 }));
    vi.stubGlobal('fetch', fetchMock);

    await submitWritingForReview('token', 2, 'Ready for review.');
    await returnWritingToDraft('token', 2, 'Please add a reference.');
    await scheduleWriting('token', 2, '2026-06-30T06:00:00.000Z');
    await unscheduleWriting('token', 2);
    await createWritingMediaEmbed('token', { media_asset: 8, position_hint: 'root.children', writing: 2 });

    expect(fetchMock.mock.calls[0]).toEqual(['/v1/writings/2/submit-for-review/', expect.objectContaining({
      body: JSON.stringify({ note: 'Ready for review.' }), method: 'POST',
    })]);
    expect(fetchMock.mock.calls[1]).toEqual(['/v1/writings/2/return-to-draft/', expect.objectContaining({
      body: JSON.stringify({ note: 'Please add a reference.' }), method: 'POST',
    })]);
    expect(fetchMock.mock.calls[2]).toEqual(['/v1/writings/2/schedule/', expect.objectContaining({
      body: JSON.stringify({ scheduled_for: '2026-06-30T06:00:00.000Z' }), method: 'POST',
    })]);
    expect(fetchMock.mock.calls[3]).toEqual(['/v1/writings/2/unschedule/', expect.objectContaining({ method: 'POST' })]);
    expect(fetchMock.mock.calls[4]).toEqual(['/v1/writing-media-embeds/', expect.objectContaining({
      body: JSON.stringify({ media_asset: 8, position_hint: 'root.children', writing: 2 }), method: 'POST',
    })]);
  });
});

