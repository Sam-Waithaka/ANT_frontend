import { describe, expect, it } from 'vitest';
import type { BibleBook, BibleChapter, ScriptureReferenceIntent } from '../types/scripture';
import {
  findBookIdForIntent,
  findChapterIdForIntent,
  resolveApiBookReference,
} from './scriptureIntent';

const books: BibleBook[] = [
  { id: 'Genesis', name: 'Genesis', testament: 'old' },
  { id: '1Sam', name: '1 Samuel', testament: 'old' },
  { id: 'John', name: 'John', testament: 'new' },
];

const chapters: BibleChapter[] = [
  { id: '1Sam.14', number: 14, label: 'Chapter 14' },
  { id: '1Sam.15', number: 15, label: 'Chapter 15' },
  { id: 'John.20', number: 20, label: 'Chapter 20' },
];

describe('scripture intent resolution', () => {
  it('resolves a book id from a Project 52 reading intent', () => {
    const intent: ScriptureReferenceIntent = { book: '1 Samuel', chapter: 14 };

    expect(findBookIdForIntent(books, intent)).toBe('1Sam');
  });

  it('resolves a chapter id from a Project 52 reading intent', () => {
    const intent: ScriptureReferenceIntent = { book: 'John', chapter: 20 };

    expect(findChapterIdForIntent(chapters, intent)).toBe('John.20');
  });

  it('returns empty strings when no match is found', () => {
    const intent: ScriptureReferenceIntent = { book: 'Romans', chapter: 8 };

    expect(findBookIdForIntent(books, intent)).toBe('');
    expect(findChapterIdForIntent(chapters, intent)).toBe('');
  });

  it('maps canonical Project 52 book names to API book references', () => {
    expect(resolveApiBookReference('1 Samuel')).toBe('1Sam');
    expect(resolveApiBookReference('John')).toBe('John');
    expect(resolveApiBookReference('Psalms')).toBe('Ps');
  });
});
