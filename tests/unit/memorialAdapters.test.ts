import { describe, expect, it } from 'vitest';
import {
  extractMemorialScriptureReferencesFromContent,
  findMemorialScriptureReference,
  memorialArrangementToAudioVisualItem,
  memorialBlockPlainText,
  memorialMediaEmbedsForBlock,
  memorialRecordingSeriesToLookup,
  memorialScriptureReferenceToNodeData,
  scriptureDataToMemorialReferencePayload,
} from '../../src/utils/memorialAdapters';
import type {
  MemorialArrangement,
  MemorialPage,
  MemorialRecordingSection,
  MemorialRichTextBlock,
  MemorialRichTextMediaEmbed,
  MemorialRichTextScriptureReference,
} from '../../src/types/memorial';

const workflowFields = {
  created_at: '2026-09-19T09:00:00Z',
  is_visible: true,
  status: 'DRAFT' as const,
  updated_at: '2026-09-19T09:00:00Z',
};

describe('memorialAdapters', () => {
  it('normalizes rich text content and derives plain text when needed', () => {
    const block = {
      content_json: {
        root: {
          children: [{
            children: [{ text: 'Blessed are those who mourn.', type: 'text' }],
            type: 'paragraph',
          }],
          type: 'root',
        },
      },
    } as MemorialRichTextBlock;

    expect(memorialBlockPlainText(block)).toBe('Blessed are those who mourn.');
    expect(memorialBlockPlainText({ ...block, content_text: 'Cached text' })).toBe('Cached text');
  });

  it('adapts block media embeds into the Writing Studio renderer shape', () => {
    const embeds: MemorialRichTextMediaEmbed[] = [
      {
        block: 8,
        id: 1,
        media_asset: 30,
        order: 2,
      },
      {
        alt_text_override: 'Portrait at church',
        block: 7,
        caption_override: 'Serving faithfully',
        embed_id: 'embed-2',
        id: 2,
        media_asset: 31,
        media_asset_detail: { id: 31, title: 'Portrait', url: '/portrait.jpg' },
        order: 1,
      },
    ];

    expect(memorialMediaEmbedsForBlock(7, embeds)).toEqual([
      {
        alt_text_override: 'Portrait at church',
        caption_override: 'Serving faithfully',
        embed_id: 'embed-2',
        id: 2,
        media_asset: 31,
        media_asset_detail: { id: 31, title: 'Portrait', url: '/portrait.jpg' },
      },
    ]);
  });

  it('maps ScriptureData to memorial scripture payloads and back', () => {
    const payload = scriptureDataToMemorialReferencePayload(5, {
      book_osis: 'John',
      chapter_start: 11,
      display: 'block',
      reference: 'John 11:25',
      source: 'api',
      text: 'I am the resurrection and the life.',
      verse_start: 25,
      version: 'BSB',
    });

    expect(payload).toEqual({
      block: 5,
      book: 'John',
      chapter_end: null,
      chapter_start: 11,
      display_text: 'John 11:25',
      verse_end: null,
      verse_start: 25,
      version: 'BSB',
    });

    const reference: MemorialRichTextScriptureReference = {
      block: 5,
      book: 43,
      book_detail: { id: 43, name: 'John', osis_id: 'John' },
      chapter_start: 11,
      display_text: 'John 11:25',
      id: 9,
      passage_label: 'John 11:25 BSB',
      verse_start: 25,
      version: 'BSB',
    };

    expect(memorialScriptureReferenceToNodeData(reference)).toMatchObject({
      bookLabel: 'John',
      book_osis: 'John',
      chapter_start: 11,
      reference: 'John 11:25 BSB',
      verse_start: 25,
    });
  });

  it('extracts unique memorial scripture references from Lexical content', () => {
    const content = {
      root: {
        children: [
          {
            data: {
              book_osis: 'John',
              chapter_start: 11,
              display: 'block',
              reference: 'John 11:25',
              source: 'api',
              text: 'I am the resurrection and the life.',
              verse_start: 25,
              version: 'BSB',
            },
            type: 'scripture-block',
          },
          {
            data: {
              book_osis: 'John',
              chapter_start: 11,
              display: 'inline',
              reference: 'John 11:25',
              source: 'api',
              text: 'I am the resurrection and the life.',
              verse_start: 25,
              version: 'BSB',
            },
            type: 'scripture-reference',
          },
        ],
        type: 'root',
      },
    };

    expect(extractMemorialScriptureReferencesFromContent(5, content)).toHaveLength(1);
    expect(
      findMemorialScriptureReference(
        [{
          block: 5,
          book: 'John',
          chapter_start: 11,
          display_text: 'John 11:25',
          id: 10,
          verse_start: 25,
          version: 'BSB',
        }],
        5,
        {
          book_osis: 'John',
          chapter_start: 11,
          display: 'block',
          reference: 'John 11:25',
          source: 'api',
          text: '',
          verse_start: 25,
          version: 'BSB',
        },
      )?.id,
    ).toBe(10);
  });

  it('adapts recording sections and livestream arrangements to media contracts', () => {
    const recording = {
      ...workflowFields,
      audio_visual_series: 4,
      audio_visual_series_detail: {
        description: 'Sermons and recordings',
        id: 4,
        item_count: 8,
        name: 'Legacy Recordings',
        slug: 'legacy-recordings',
      },
      id: 1,
      max_items: 4,
      memorial: 2,
      order: 1,
      title: 'Messages',
    } satisfies MemorialRecordingSection;
    const page = {
      ...workflowFields,
      full_name: 'Rev. Jane Doe',
      hero_image_detail: { id: 55, title: 'Hero', url: '/hero.jpg' },
      id: 2,
      slug: 'rev-jane-doe',
    } satisfies MemorialPage;
    const arrangement = {
      ...workflowFields,
      arrangement_type: 'LIVESTREAM',
      id: 3,
      livestream_url: 'https://youtube.com/watch?v=abc',
      memorial: 2,
      order: 1,
      starts_at: '2026-09-20T07:00:00Z',
      title: 'Memorial Service Livestream',
    } satisfies MemorialArrangement;

    expect(memorialRecordingSeriesToLookup(recording)).toMatchObject({
      id: 4,
      itemCount: 8,
      name: 'Legacy Recordings',
      slug: 'legacy-recordings',
    });
    expect(memorialArrangementToAudioVisualItem(arrangement, page)).toMatchObject({
      embedUrl: 'https://youtube.com/watch?v=abc',
      mediaType: 'livestream',
      speaker: 'Rev. Jane Doe',
      thumbnailUrl: '/hero.jpg',
      title: 'Memorial Service Livestream',
    });
  });
});
