import { describe, expect, it } from 'vitest';
import { extractScriptureReferencesFromContent, scriptureReferenceToNodeData } from '../../src/components/portal/writing/editor/scriptureReferences';

describe('extractScriptureReferencesFromContent', () => {
  it('derives backend scripture references from canonical Scripture nodes only', () => {
    const content = {
      root: {
        type: 'root',
        children: [
          {
            type: 'scripture-block',
            data: {
              book_osis: 'John',
              bookLabel: 'John',
              chapter_start: 3,
              display: 'block',
              display_text: 'John 3:16-18',
              reference: 'John 3:16-18',
              source: 'api',
              text: 'For God so loved the world...',
              verse_end: 18,
              verse_start: 16,
              version: 'BSB',
            },
          },
          {
            type: 'scripture-block',
            data: {
              display: 'block',
              reference: 'Psalm 95:6',
              source: 'manual',
              text: 'Come, let us worship and bow down.',
              version: 'BSB',
            },
          },
        ],
      },
    };

    expect(extractScriptureReferencesFromContent(content)).toEqual([
      {
        book_osis: 'John',
        chapter_start: 3,
        chapter_end: null,
        display_text: 'John 3:16-18',
        verse_start: 16,
        verse_end: 18,
        version: 'BSB',
      },
    ]);
  });

  it('deduplicates repeated Scripture block references', () => {
    const scriptureBlock = {
      type: 'scripture-block',
      data: {
        book_osis: 'Ps',
        chapter_start: 95,
        display: 'block',
        display_text: 'Psalm 95:6',
        reference: 'Psalm 95:6',
        source: 'api',
        text: 'Come, let us worship and bow down.',
        verse_start: 6,
        version: 'BSB',
      },
    };

    expect(extractScriptureReferencesFromContent({ root: { children: [scriptureBlock, scriptureBlock] } })).toHaveLength(1);
  });

  it('maps backend references into strict Scripture node data', () => {
    const data = scriptureReferenceToNodeData({
      id: 12,
      writing: 4,
      book: 'John',
      book_osis: 'John',
      chapter_start: 3,
      display_text: 'John 3:16',
      verse_start: 16,
      version: 'BSB',
    });

    expect(data).toMatchObject({
      book_osis: 'John',
      chapter_start: 3,
      reference: 'John 3:16',
      verse_start: 16,
    });
  });
});

