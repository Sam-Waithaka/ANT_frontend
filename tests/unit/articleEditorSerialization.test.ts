import { describe, expect, it } from 'vitest';
import {
  countLexicalWords,
  createEmptyLexicalContent,
  lexicalContentToText,
  normalizeLexicalContent,
} from '../../src/components/writing/editor/serialization';

describe('article editor serialization', () => {
  it('creates and restores a safe empty Lexical document for invalid input', () => {
    expect(createEmptyLexicalContent()).toEqual({
      root: { children: [{ children: [], direction: null, format: '', indent: 0, type: 'paragraph', version: 1 }], direction: null, format: '', indent: 0, type: 'root', version: 1 },
    });
    expect(normalizeLexicalContent('{bad json')).toEqual(createEmptyLexicalContent());
    expect(normalizeLexicalContent({ root: { children: [] } })).toEqual(createEmptyLexicalContent());
  });

  it('normalizes stringified editor content and preserves valid root children', () => {
    const value = JSON.stringify({
      root: {
        children: [{ children: [{ text: 'Oh Come Let Us Worship', type: 'text', version: 1 }], type: 'paragraph', version: 1 }],
        direction: null,
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    });

    expect(normalizeLexicalContent(value).root.children).toHaveLength(1);
  });

  it('derives readable text and word counts without rendering HTML', () => {
    const content = normalizeLexicalContent({
      root: {
        children: [
          { children: [{ text: 'Oh Come', type: 'text' }, { text: ' Let Us Worship', type: 'text' }], type: 'paragraph' },
          { children: [{ text: 'Psalm 95:6', type: 'text' }], type: 'quote' },
        ],
        type: 'root',
      },
    });

    const text = lexicalContentToText(content);
    expect(text).toBe('Oh Come Let Us Worship Psalm 95:6');
    expect(countLexicalWords(text)).toBe(7);
  });
});
