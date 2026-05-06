import { describe, expect, it } from 'vitest';
import { buildChapterShareText, buildScriptureShareLink, buildVerseShareText } from './scriptureShare';

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
});
