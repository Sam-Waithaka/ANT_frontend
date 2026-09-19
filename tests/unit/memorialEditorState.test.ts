import { describe, expect, it } from 'vitest';
import type { MemorialEditorState } from '../../src/types/memorial';
import { createMemorialEditorModel } from '../../src/utils/memorialEditorState';

const baseWorkflow = {
  is_visible: false,
  status: 'DRAFT' as const,
};

describe('memorialEditorState', () => {
  it('builds a stable model grouped by section and rich text block', () => {
    const state: MemorialEditorState = {
      arrangements: [],
      gallery_items: [{ ...baseWorkflow, category: 'FAMILY', id: 7, media_asset: 77, memorial: 1, order: 2 }],
      media_embeds: [
        { block: 2, id: 'media-b', media_asset: 22, order: 2 },
        { block: 1, id: 'media-a', media_asset: 11, order: 1 },
      ],
      ministry_tributes: [],
      page: { ...baseWorkflow, full_name: 'Rev. Jane Doe', id: 1, slug: 'rev-jane-doe' },
      personal_tributes: [],
      recording_sections: [],
      rich_text_blocks: [
        {
          ...baseWorkflow,
          content_json: { root: { children: [], type: 'root' } },
          content_text: 'Second hero block',
          id: 2,
          memorial: 1,
          order: 2,
          section_key: 'HERO',
        },
        {
          ...baseWorkflow,
          content_json: { root: { children: [], type: 'root' } },
          content_text: 'First hero block',
          id: 1,
          memorial: 1,
          order: 1,
          section_key: 'HERO',
        },
      ],
      scripture_references: [
        {
          block: 1,
          book: 'John',
          chapter_start: 11,
          display_text: 'John 11:25',
          id: 9,
          order: 1,
          verse_start: 25,
        },
      ],
      section_keys: ['HERO', 'GALLERY'],
      timeline_events: [],
    };

    const model = createMemorialEditorModel(state);

    expect(model.page?.full_name).toBe('Rev. Jane Doe');
    expect(model.sections.map((section) => section.key)).toEqual(['HERO', 'GALLERY']);
    expect(model.sections[0].blocks.map((block) => block.block.id)).toEqual([1, 2]);
    expect(model.sections[0].blocks[0].plainText).toBe('First hero block');
    expect(model.blockChildrenById['1'].mediaEmbeds).toEqual([
      expect.objectContaining({ id: 'media-a' }),
    ]);
    expect(model.blockChildrenById['1'].scriptureReferences).toEqual([
      expect.objectContaining({ display_text: 'John 11:25' }),
    ]);
    expect(model.galleryItems.map((item) => item.id)).toEqual([7]);
    expect(model.totals).toMatchObject({
      galleryItems: 1,
      mediaEmbeds: 2,
      richTextBlocks: 2,
      scriptureReferences: 1,
    });
  });
});
