import { describe, expect, it } from 'vitest';
import { buildVerseAnnotationView } from '../../src/utils/verseAnnotations';

describe('verseAnnotations', () => {
  it('inserts grouped markers after matching offsets', () => {
    const view = buildVerseAnnotationView('In the beginning God created.', [
      {
        content: 'Or at first.',
        endOffset: 16,
        id: 'a1',
        type: 'footnote',
      },
      {
        content: 'Hebrew word study.',
        endOffset: 16,
        id: 'a2',
        type: 'word_study',
      },
    ]);

    expect(view.segments).toEqual([
      { text: 'In the beginning' },
      { markerLabels: [1], text: '' },
      { text: ' God created.' },
    ]);
    expect(view.inlineNotes).toEqual([
      {
        annotations: [
          expect.objectContaining({ content: 'Or at first.', id: 'a1' }),
          expect.objectContaining({ content: 'Hebrew word study.', id: 'a2' }),
        ],
        id: 'offset-16',
        label: 1,
        offset: 16,
      },
    ]);
  });

  it('attaches annotations without offsets to verse-number notes', () => {
    const view = buildVerseAnnotationView('Jesus wept.', [
      {
        content: 'Shortest verse in many English translations.',
        id: 'a1',
        rawContent: '<note>Do not render this raw note.</note>',
        type: 'footnote',
      },
    ]);

    expect(view.segments).toEqual([{ text: 'Jesus wept.' }]);
    expect(view.verseNumberNotes).toEqual([
      {
        annotations: [expect.objectContaining({ content: 'Shortest verse in many English translations.' })],
        id: 'verse-a1',
        label: 1,
      },
    ]);
    expect(JSON.stringify(view)).not.toContain('<note>');
  });

  it('clamps offsets to the verse text length', () => {
    const view = buildVerseAnnotationView('Peace.', [
      {
        content: 'Closing note.',
        endOffset: 100,
        id: 'a1',
        type: 'footnote',
      },
    ]);

    expect(view.segments).toEqual([
      { text: 'Peace.' },
      { markerLabels: [1], text: '' },
    ]);
  });
});
