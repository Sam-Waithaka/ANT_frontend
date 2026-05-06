import { describe, expect, it } from 'vitest';
import {
  buildChapterSharePayload,
  buildChapterShareText,
  buildSelectionSharePayload,
  buildScriptureShareLink,
  buildVerseSharePayload,
  buildVerseShareText,
} from './scriptureShare';

const book = { id: 'John', name: 'John' };
const chapter = { id: '20', number: 20, label: 'Chapter 20' };
const verse = { id: 'v1', number: 1, text: 'Early on the first day of the week Mary Magdalene went to the tomb.' };
const chapterVerses = [verse, { id: 'v2', number: 2, text: 'So she came running to Simon Peter and the other disciple.' }];
const version = { id: 'BSB', name: 'Berean Standard Bible', abbreviation: 'BSB' };

describe('scriptureShare', () => {
  it('builds a scripture share link with version chapter and verse', () => {
    expect(
      buildScriptureShareLink({ book, chapter, verse, version }),
    ).toBe('https://aicnjoro.org/scripture?book=John&chapter=20&verse=1&version=BSB');
  });

  it('builds verse share text with the passage text and link', () => {
    expect(buildVerseShareText({ book, chapter, verse, version })).toContain(
      'John 20:1 (BSB)',
    );
    expect(buildVerseShareText({ book, chapter, verse, version })).toContain(
      'https://aicnjoro.org/scripture?book=John&chapter=20&verse=1&version=BSB',
    );
  });

  it('builds chapter share text with a chapter link', () => {
    expect(buildChapterShareText({ book, chapter, chapterVerses, version })).toContain('John 20 (BSB)');
    expect(buildChapterShareText({ book, chapter, chapterVerses, version })).toContain(
      'https://aicnjoro.org/scripture?book=John&chapter=20&version=BSB',
    );
    expect(buildChapterShareText({ book, chapter, chapterVerses, version })).toContain(
      '1. Early on the first day of the week Mary Magdalene went to the tomb.',
    );
  });

  it('builds a verse share payload with separate text and url fields', () => {
    expect(buildVerseSharePayload({ book, chapter, verse, version })).toEqual({
      title: 'John 20:1 (BSB)',
      text: 'Early on the first day of the week Mary Magdalene went to the tomb.\n\nJohn 20:1 (BSB)',
      url: 'https://aicnjoro.org/scripture?book=John&chapter=20&verse=1&version=BSB',
      copyText:
        'John 20:1 (BSB)\n\nEarly on the first day of the week Mary Magdalene went to the tomb.\n\nRead on AIC Njoro Town:\nhttps://aicnjoro.org/scripture?book=John&chapter=20&verse=1&version=BSB',
    });
  });

  it('builds a chapter share payload with a canonical chapter url', () => {
    expect(buildChapterSharePayload({ book, chapter, chapterVerses, version })).toMatchObject({
      title: 'John 20 (BSB)',
      url: 'https://aicnjoro.org/scripture?book=John&chapter=20&version=BSB',
    });
  });

  it('builds a multi-verse share payload anchored to the first selected verse', () => {
    expect(buildSelectionSharePayload({ book, chapter, verses: chapterVerses, version })).toEqual({
      title: 'John 20:1-2 (BSB)',
      text:
        '1. Early on the first day of the week Mary Magdalene went to the tomb.\n2. So she came running to Simon Peter and the other disciple.\n\nJohn 20:1-2 (BSB)',
      url: 'https://aicnjoro.org/scripture?book=John&chapter=20&verse=1&version=BSB',
      copyText:
        'John 20:1-2 (BSB)\n\n1. Early on the first day of the week Mary Magdalene went to the tomb.\n2. So she came running to Simon Peter and the other disciple.\n\nRead on AIC Njoro Town:\nhttps://aicnjoro.org/scripture?book=John&chapter=20&verse=1&version=BSB',
    });
  });
});
