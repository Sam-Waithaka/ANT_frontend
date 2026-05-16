import { describe, expect, it } from 'vitest';
import { buildRelatedMediaQuery, defaultRelatedOrdering } from '../../src/components/media/mediaWatchContext';
import type { AudioVisualItem } from '../../src/types/audioVisual';

const item = (overrides: Partial<AudioVisualItem> = {}): AudioVisualItem => ({
  categories: [],
  collections: [],
  description: 'Description',
  descriptionExcerpt: 'Description',
  mediaType: 'sermon',
  mediaTypeLabel: 'Sermon',
  slug: 'current',
  thumbnailUrl: '',
  title: 'Current',
  ...overrides,
});

describe('media watch related context', () => {
  it('uses all music when the source context is the music all tab', () => {
    expect(buildRelatedMediaQuery(item({ mediaType: 'music' }), 'latest', { type: 'music' })).toEqual({
      ordering: 'latest',
      type: 'music',
    });
  });

  it('uses a music subcategory when the source context provides one', () => {
    expect(buildRelatedMediaQuery(item({ mediaType: 'music' }), 'latest', { musicSubcategory: 'choir', type: 'music' })).toEqual({
      musicSubcategory: 'choir',
      ordering: 'latest',
      type: 'music',
    });
  });

  it('falls back to item music subcategory when no source context exists', () => {
    expect(buildRelatedMediaQuery(item({ mediaType: 'music', musicSubcategory: 'pnw' }), 'oldest')).toEqual({
      musicSubcategory: 'pnw',
      ordering: 'oldest',
      type: 'music',
    });
  });

  it('prioritizes series and defaults series playback to oldest first', () => {
    const seriesItem = item({ series: { name: 'Dying Well', slug: 'dying-well' } });

    expect(buildRelatedMediaQuery(seriesItem, 'oldest')).toEqual({
      ordering: 'oldest',
      series: 'dying-well',
    });
    expect(defaultRelatedOrdering(seriesItem)).toBe('oldest');
  });

  it('falls back to category before media type', () => {
    expect(buildRelatedMediaQuery(item({ categories: [{ name: 'Teaching', slug: 'teaching' }], mediaType: 'teaching' }), 'latest')).toEqual({
      category: 'teaching',
      ordering: 'latest',
    });
  });
});
