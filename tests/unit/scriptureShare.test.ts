import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildChapterSharePayload,
  buildChapterShareText,
  buildSelectionSharePayload,
  buildScriptureShareLink,
  buildVerseSharePayload,
  buildVerseShareText,
  formatVerseNumbers,
  parseVerseSelection,
} from '../../src/utils/scriptureShare';

const book = { id: 'John', name: 'John' };
const chapter = { id: '20', number: 20, label: 'Chapter 20' };
const verse = { id: 'v1', number: 1, text: 'Early on the first day of the week Mary Magdalene went to the tomb.' };
const chapterVerses = [verse, { id: 'v2', number: 2, text: 'So she came running to Simon Peter and the other disciple.' }];
const version = { id: 'BSB', name: 'Berean Standard Bible', abbreviation: 'BSB' };

describe('scriptureShare', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      location: {
        origin: 'http://localhost:5173',
      },
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('builds a scripture share link with version chapter and verse', () => {
    expect(
      buildScriptureShareLink({ book, chapter, verse, version }),
    ).toBe('http://localhost:5173/scripture?book=John&chapter=20&verses=1&version=BSB');
  });

  it('uses the configured site base url when one is provided', () => {
    vi.stubEnv('VITE_SITE_BASE_URL', 'https://preview.aicnjoro.net/');

    expect(
      buildScriptureShareLink({ book, chapter, verse, version }),
    ).toBe('https://preview.aicnjoro.net/scripture?book=John&chapter=20&verses=1&version=BSB');
  });

  it('builds verse share text with the passage text and link', () => {
    expect(buildVerseShareText({ book, chapter, verse, version })).toContain(
      'John 20:1 (BSB)',
    );
    expect(buildVerseShareText({ book, chapter, verse, version })).toContain(
      'http://localhost:5173/scripture?book=John&chapter=20&verses=1&version=BSB',
    );
  });

  it('builds chapter share text with a chapter link', () => {
    expect(buildChapterShareText({ book, chapter, chapterVerses, version })).toContain('John 20 (BSB)');
    expect(buildChapterShareText({ book, chapter, chapterVerses, version })).toContain(
      'http://localhost:5173/scripture?book=John&chapter=20&version=BSB',
    );
    expect(buildChapterShareText({ book, chapter, chapterVerses, version })).toContain(
      '1. Early on the first day of the week Mary Magdalene went to the tomb.',
    );
  });

  it('builds a verse share payload with separate text and url fields', () => {
    expect(buildVerseSharePayload({ book, chapter, verse, version })).toEqual({
      title: 'John 20:1 (BSB)',
      text: 'Early on the first day of the week Mary Magdalene went to the tomb.\n\nJohn 20:1 (BSB)',
      url: 'http://localhost:5173/scripture?book=John&chapter=20&verses=1&version=BSB',
      copyText:
        'John 20:1 (BSB)\n\nEarly on the first day of the week Mary Magdalene went to the tomb.\n\nContinue reading on A.I.C Njoro Town Church:\nhttp://localhost:5173/scripture?book=John&chapter=20&verses=1&version=BSB',
    });
  });

  it('builds a chapter share payload with a canonical chapter url', () => {
    expect(buildChapterSharePayload({ book, chapter, chapterVerses, version })).toMatchObject({
      title: 'John 20 (BSB)',
      url: 'http://localhost:5173/scripture?book=John&chapter=20&version=BSB',
    });
  });

  it('builds a multi-verse share payload anchored to the first selected verse', () => {
    expect(buildSelectionSharePayload({ book, chapter, verses: chapterVerses, version })).toEqual({
      title: 'John 20:1-2 (BSB)',
      text:
        '1. Early on the first day of the week Mary Magdalene went to the tomb.\n2. So she came running to Simon Peter and the other disciple.\n\nJohn 20:1-2 (BSB)',
      url: 'http://localhost:5173/scripture?book=John&chapter=20&verses=1-2&version=BSB',
      copyText:
        'John 20:1-2 (BSB)\n\n1. Early on the first day of the week Mary Magdalene went to the tomb.\n2. So she came running to Simon Peter and the other disciple.\n\nContinue reading on A.I.C Njoro Town Church:\nhttp://localhost:5173/scripture?book=John&chapter=20&verses=1-2&version=BSB',
    });
  });

  it('formats verse ranges for links', () => {
    expect(formatVerseNumbers([11, 14, 15])).toBe('11, 14-15');
  });

  it('parses verse range query strings into verse numbers', () => {
    expect(parseVerseSelection('11,14-15')).toEqual([11, 14, 15]);
  });
});
