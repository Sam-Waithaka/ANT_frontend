import { describe, expect, it } from 'vitest';
import {
  createScriptureUrl,
  getPlayableMediaUrl,
  parseScriptureReferences,
  toScriptureSlug,
} from '../../src/components/media/watch/mediaWatchUtils';

describe('mediaWatchUtils', () => {
  it('parses scripture references with verse ranges and deduplicates chapter links', () => {
    expect(parseScriptureReferences('2 Corinthians 5:7; John 3:16-17; John 3:18')).toEqual([
      {
        book: '2 Corinthians',
        chapter: 5,
        display: '2 Corinthians 5',
        endVerse: 7,
        startVerse: 7,
      },
      {
        book: 'John',
        chapter: 3,
        display: 'John 3',
        endVerse: 17,
        startVerse: 16,
      },
    ]);
  });

  it('creates scripture links with returnTo so media playback context can be restored', () => {
    expect(createScriptureUrl({
      book: '2 Corinthians',
      chapter: 5,
      display: '2 Corinthians 5',
      startVerse: 7,
    }, '/media/watch/dying-well')).toBe('/scripture?book=2-corinthians&chapter=5&returnTo=%2Fmedia%2Fwatch%2Fdying-well');
  });

  it('turns readable book names into route slugs', () => {
    expect(toScriptureSlug('Song of Songs')).toBe('song-of-songs');
  });

  it('prefers embed URLs but falls back to external URLs for playable media', () => {
    expect(getPlayableMediaUrl({
      categories: [],
      collections: [],
      description: '',
      descriptionExcerpt: '',
      embedUrl: 'https://youtube.com/embed/abc',
      externalUrl: 'https://youtube.com/watch?v=abc',
      mediaType: 'sermon',
      mediaTypeLabel: 'Sermon',
      slug: 'message',
      thumbnailUrl: '',
      title: 'Message',
    })).toBe('https://youtube.com/embed/abc');
    expect(getPlayableMediaUrl({
      categories: [],
      collections: [],
      description: '',
      descriptionExcerpt: '',
      externalUrl: 'https://youtube.com/watch?v=abc',
      mediaType: 'sermon',
      mediaTypeLabel: 'Sermon',
      slug: 'message',
      thumbnailUrl: '',
      title: 'Message',
    })).toBe('https://youtube.com/watch?v=abc');
  });
});
