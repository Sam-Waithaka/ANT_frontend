import { describe, expect, it } from 'vitest';
import { isSundayServiceWindowInEastAfrica, selectMediaHeroItem } from '../../src/components/media/mediaHeroSelection';
import type { AudioVisualHomePayload, AudioVisualItem } from '../../src/types/audioVisual';

const item = (title: string, slug: string): AudioVisualItem => ({
  categories: [],
  collections: [],
  description: title,
  descriptionExcerpt: title,
  mediaType: 'sermon',
  mediaTypeLabel: 'Sermon',
  slug,
  thumbnailUrl: '',
  title,
});

const latestSermon = item('Latest Sermon', 'latest-sermon');
const homeHero = item('Home Hero', 'home-hero');
const liveService = item('Live Service', 'live-service');

const homePayload = (liveItem: AudioVisualItem | null = liveService): AudioVisualHomePayload => ({
  generatedAt: '2026-05-16T12:00:00Z',
  hero: homeHero,
  live: liveItem ? { ctaLabel: 'Watch live', item: liveItem } : null,
  rails: [],
});

describe('media hero selection', () => {
  it('detects the Sunday service window in East African Time from 8 AM', () => {
    expect(isSundayServiceWindowInEastAfrica(new Date('2026-05-17T04:59:00Z'))).toBe(false);
    expect(isSundayServiceWindowInEastAfrica(new Date('2026-05-17T05:00:00Z'))).toBe(true);
  });

  it('prioritizes the live endpoint on Sunday after 8 AM EAT', () => {
    expect(
      selectMediaHeroItem({
        date: new Date('2026-05-17T05:30:00Z'),
        home: homePayload(),
        latestSermon,
        useFallback: false,
      })
    ).toBe(liveService);
  });

  it('falls back to latest sermon on Sunday when the live endpoint has no item', () => {
    expect(
      selectMediaHeroItem({
        date: new Date('2026-05-17T05:30:00Z'),
        home: homePayload(null),
        latestSermon,
        useFallback: false,
      })
    ).toBe(latestSermon);
  });

  it('keeps latest sermon first outside the Sunday service window', () => {
    expect(
      selectMediaHeroItem({
        date: new Date('2026-05-16T10:00:00Z'),
        home: homePayload(),
        latestSermon,
        useFallback: false,
      })
    ).toBe(latestSermon);
  });
});
