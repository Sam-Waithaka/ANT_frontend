import { describe, expect, it } from 'vitest';
import {
  autoplayLimitReached,
  autoplayModeForItem,
  buildAutoplayQueue,
  resolveAutoplayDecision,
  selectNextAutoplayItem,
  shouldDefaultAutoplay,
  shouldEnableAutoplayOnLoad,
} from '../../src/components/media/watch/mediaAutoplay';
import type { AudioVisualItem } from '../../src/types/audioVisual';

const publishedAt = (day: number) => `2026-05-${String(day).padStart(2, '0')}T08:30:00Z`;

const item = (day: number, overrides: Partial<AudioVisualItem> = {}): AudioVisualItem => ({
  categories: [],
  collections: [],
  description: `Description ${day}`,
  descriptionExcerpt: `Description ${day}`,
  mediaType: 'sermon',
  mediaTypeLabel: 'Sermon',
  publishedAt: publishedAt(day),
  slug: `message-${day}`,
  thumbnailUrl: '',
  title: `Message ${day}`,
  ...overrides,
});

describe('media autoplay', () => {
  it('keeps the current position in a latest-first queue instead of jumping to the newest item', () => {
    const queue = Array.from({ length: 10 }, (_, index) => item(index + 1));
    const orderedQueue = buildAutoplayQueue(queue[6], queue, 'latest');
    const currentIndex = orderedQueue.findIndex((candidate) => candidate.slug === queue[6].slug);
    const decision = selectNextAutoplayItem({
      current: queue[6],
      ordering: 'latest',
      relatedItems: queue,
    });

    expect(currentIndex).toBe(3);
    expect(decision).toMatchObject({ item: orderedQueue[currentIndex + 1], type: 'next' });
    expect(decision).not.toMatchObject({ item: queue[9], type: 'next' });
  });

  it('keeps the current position in an oldest-first queue', () => {
    const queue = Array.from({ length: 10 }, (_, index) => item(index + 1));
    const decision = selectNextAutoplayItem({
      current: queue[6],
      ordering: 'oldest',
      relatedItems: queue,
    });

    expect(decision).toMatchObject({ item: queue[7], type: 'next' });
  });

  it('asks the watch page to load more when the current item is last and the API has another page', () => {
    const queue = Array.from({ length: 3 }, (_, index) => item(index + 1));

    expect(selectNextAutoplayItem({
      current: queue[0],
      hasMore: true,
      ordering: 'latest',
      relatedItems: queue,
    })).toEqual({ type: 'load-more' });
  });

  it('wraps shorts only after the queue and API pages are exhausted', () => {
    const queue = [
      item(1, { mediaType: 'short', mediaTypeLabel: 'Short' }),
      item(2, { mediaType: 'short', mediaTypeLabel: 'Short' }),
    ];

    expect(selectNextAutoplayItem({
      allowWrap: true,
      current: queue[0],
      ordering: 'latest',
      relatedItems: queue,
    })).toMatchObject({ item: queue[1], type: 'next' });
  });

  it('does not wrap long-form media at the end of the queue', () => {
    const queue = [item(1), item(2)];

    expect(selectNextAutoplayItem({
      current: queue[0],
      ordering: 'latest',
      relatedItems: queue,
    })).toEqual({ type: 'none' });
  });

  it('turns the next item into a still-watching checkpoint when mode limits are reached', () => {
    const queue = [item(1), item(2), item(3)];
    const decision = resolveAutoplayDecision({
      count: 3,
      current: queue[2],
      mode: 'series',
      ordering: 'latest',
      relatedItems: queue,
      startedAt: Date.now(),
    });

    expect(decision).toMatchObject({ item: queue[1], type: 'still-watching' });
  });

  it('enforces mode-specific autoplay limits', () => {
    const now = Date.UTC(2026, 4, 16, 12, 0, 0);

    expect(autoplayLimitReached('shorts', now, 20, now)).toBe(true);
    expect(autoplayLimitReached('shorts', now - 30 * 60000, 1, now)).toBe(true);
    expect(autoplayLimitReached('series', now, 3, now)).toBe(true);
    expect(autoplayLimitReached('series', now - 180 * 60000, 1, now)).toBe(true);
    expect(autoplayLimitReached('sermon', now, 3, now)).toBe(true);
    expect(autoplayLimitReached('sermon', now - 180 * 60000, 1, now)).toBe(true);
    expect(autoplayLimitReached('music', now - 90 * 60000, 1, now)).toBe(true);
    expect(autoplayLimitReached('general', now, 5, now)).toBe(true);
    expect(autoplayLimitReached('general', now - 120 * 60000, 1, now)).toBe(true);
  });

  it('defaults autoplay on for shorts and series, but not music or general media', () => {
    expect(shouldDefaultAutoplay(item(1, { mediaType: 'short' }))).toBe(true);
    expect(shouldDefaultAutoplay(item(1, { series: { name: 'Dying Well', slug: 'dying-well' } }))).toBe(true);
    expect(shouldDefaultAutoplay(item(1, { mediaType: 'music' }))).toBe(false);
    expect(shouldDefaultAutoplay(item(1, { mediaType: 'sermon' }))).toBe(false);
  });

  it('keeps music autoplay enabled across autoplay-driven route changes', () => {
    const musicItem = item(1, { mediaType: 'music', mediaTypeLabel: 'Music' });

    expect(shouldEnableAutoplayOnLoad(musicItem, { type: 'music' }, false)).toBe(false);
    expect(shouldEnableAutoplayOnLoad(musicItem, { type: 'music' }, true)).toBe(true);
  });

  it('uses the source context to detect music and series queues', () => {
    expect(autoplayModeForItem(item(1, { mediaType: 'sermon' }), { type: 'music' })).toBe('music');
    expect(autoplayModeForItem(item(1), { series: 'dying-well' })).toBe('series');
    expect(autoplayModeForItem(item(1, { mediaType: 'sermon' }))).toBe('sermon');
  });
});
