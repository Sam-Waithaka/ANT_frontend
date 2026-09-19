import type { AudioVisualItem, AudioVisualLookup } from '../types/audioVisual';
import type {
  MemorialArrangement,
  MemorialAudioVisualSeriesDetail,
  MemorialId,
  MemorialPage,
  MemorialRecordingSection,
  MemorialRichTextBlock,
  MemorialRichTextMediaEmbed,
  MemorialRichTextScriptureReference,
  MemorialRichTextScriptureReferencePayload,
} from '../types/memorial';
import {
  lexicalContentToText,
  normalizeLexicalContent,
  type LexicalContentJson,
} from '../components/writing/editor/serialization';
import type { ScriptureData } from '../components/writing/editor/nodes/scriptureTypes';
import type { WritingMediaEmbedLike } from '../components/writing/editor/nodes/ChurchBlockMediaContext';

type LexicalLikeNode = {
  children?: unknown;
  data?: ScriptureData;
  type?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === 'object');

const readPositiveNumber = (value: unknown) => {
  const number = typeof value === 'number'
    ? value
    : typeof value === 'string'
      ? Number(value)
      : 0;
  return Number.isFinite(number) && number > 0 ? number : undefined;
};

const idKey = (value: MemorialId) => String(value);

const mediaAssetUrl = (
  asset?: {
    file?: string;
    image?: string;
    original_url?: string | null;
    url?: string;
  } | null,
) => asset?.url || asset?.image || asset?.file || asset?.original_url || '';

export const memorialBlockContent = (
  block: Pick<MemorialRichTextBlock, 'content_json'>,
): LexicalContentJson => normalizeLexicalContent(block.content_json);

export const memorialBlockPlainText = (
  block: Pick<MemorialRichTextBlock, 'content_json' | 'content_text'>,
) => block.content_text?.trim() || lexicalContentToText(memorialBlockContent(block));

export const memorialMediaEmbedsForBlock = (
  blockId: MemorialId,
  embeds: MemorialRichTextMediaEmbed[],
): WritingMediaEmbedLike[] =>
  embeds
    .filter((embed) => idKey(embed.block) === idKey(blockId))
    .sort((left, right) => (left.order ?? 0) - (right.order ?? 0))
    .map((embed) => ({
      alt_text_override: embed.alt_text_override,
      caption_override: embed.caption_override,
      embed_id: embed.embed_id,
      id: embed.id,
      media_asset: embed.media_asset,
      media_asset_detail:
        embed.media_asset_detail as WritingMediaEmbedLike['media_asset_detail'],
    }));

export const groupMemorialMediaEmbedsByBlock = (
  embeds: MemorialRichTextMediaEmbed[],
) =>
  embeds.reduce<Map<string, WritingMediaEmbedLike[]>>((groups, embed) => {
    const key = idKey(embed.block);
    const current = groups.get(key) ?? [];
    groups.set(key, [
      ...current,
      {
        alt_text_override: embed.alt_text_override,
        caption_override: embed.caption_override,
        embed_id: embed.embed_id,
        id: embed.id,
        media_asset: embed.media_asset,
        media_asset_detail:
          embed.media_asset_detail as WritingMediaEmbedLike['media_asset_detail'],
      },
    ]);
    return groups;
  }, new Map());

export const scriptureDataToMemorialReferencePayload = (
  block: MemorialId,
  data: ScriptureData,
): MemorialRichTextScriptureReferencePayload | null => {
  const book = data.book === undefined || data.book === null || data.book === ''
    ? ''
    : data.book;
  const chapter_start = readPositiveNumber(data.chapter_start);
  const verse_start = readPositiveNumber(data.verse_start);

  if (!book || !chapter_start || !verse_start) return null;

  const chapter_end = readPositiveNumber(data.chapter_end) ?? null;
  const verse_end = readPositiveNumber(data.verse_end) ?? null;
  const display_text = (data.display_text || data.reference || '').trim();
  const bookLabel = data.bookLabel || data.book_osis || String(book);

  return {
    block,
    book,
    chapter_end,
    chapter_start,
    display_text:
      display_text
      || `${bookLabel} ${chapter_start}:${verse_start}${
        verse_end ? `-${verse_end}` : ''
      }`,
    verse_end,
    verse_start,
    version: (data.version || 'BSB').trim() || 'BSB',
  };
};

export const memorialScriptureReferenceToNodeData = (
  reference: MemorialRichTextScriptureReference,
  current?: ScriptureData,
): ScriptureData => ({
  ...current,
  book: reference.book,
  book_osis: reference.book_detail?.osis_id || String(reference.book),
  bookLabel: reference.book_detail?.name || current?.bookLabel || String(reference.book),
  chapter_end: reference.chapter_end ?? null,
  chapter_start: reference.chapter_start,
  display: current?.display || 'block',
  display_text: reference.display_text,
  reference: reference.passage_label || reference.display_text,
  source: current?.source || 'api',
  sourceId: current?.sourceId,
  text: current?.text || '',
  verse_end: reference.verse_end ?? null,
  verse_start: reference.verse_start,
  version: reference.version || current?.version || 'BSB',
  verses: current?.verses,
});

export const memorialReferenceKey = (
  reference: MemorialRichTextScriptureReferencePayload,
) =>
  [
    reference.block,
    reference.book,
    reference.chapter_start,
    reference.verse_start,
    reference.chapter_end ?? '',
    reference.verse_end ?? '',
    reference.version || 'BSB',
  ].join('|');

export const findMemorialScriptureReference = (
  references: MemorialRichTextScriptureReference[] | undefined,
  block: MemorialId,
  data: ScriptureData,
) => {
  const payload = scriptureDataToMemorialReferencePayload(block, data);
  if (!payload) return undefined;
  const key = memorialReferenceKey(payload);

  return references?.find((reference) => {
    const candidate = scriptureDataToMemorialReferencePayload(
      reference.block,
      memorialScriptureReferenceToNodeData(reference),
    );
    return candidate ? memorialReferenceKey(candidate) === key : false;
  });
};

const walkMemorialScriptureNodes = (
  block: MemorialId,
  node: unknown,
  references: MemorialRichTextScriptureReferencePayload[],
) => {
  if (!isRecord(node)) return;

  const lexicalNode = node as LexicalLikeNode;
  if (
    (lexicalNode.type === 'scripture-block'
      || lexicalNode.type === 'scripture-reference')
    && lexicalNode.data
  ) {
    const reference = scriptureDataToMemorialReferencePayload(
      block,
      lexicalNode.data,
    );
    if (reference) references.push(reference);
  }

  if (Array.isArray(lexicalNode.children)) {
    lexicalNode.children.forEach((child) =>
      walkMemorialScriptureNodes(block, child, references),
    );
  }
};

export const extractMemorialScriptureReferencesFromContent = (
  block: MemorialId,
  content: unknown,
) => {
  const references: MemorialRichTextScriptureReferencePayload[] = [];
  const startNode = isRecord(content) && isRecord(content.root)
    ? content.root
    : content;

  walkMemorialScriptureNodes(block, startNode, references);

  const seen = new Set<string>();
  return references.filter((reference) => {
    const key = memorialReferenceKey(reference);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const seriesName = (series: MemorialAudioVisualSeriesDetail) =>
  series.name || series.title || series.slug || 'Recordings';

export const memorialRecordingSeriesToLookup = (
  section: MemorialRecordingSection,
): AudioVisualLookup | null => {
  const series = section.audio_visual_series_detail;
  if (!series) return null;
  const name = seriesName(series);

  return {
    description: series.description,
    id: series.id,
    itemCount: series.itemCount ?? series.item_count ?? series.items_count,
    name,
    slug: series.slug || name.toLowerCase().replace(/\s+/g, '-'),
    thumbnailUrl:
      series.thumbnailUrl
      || mediaAssetUrl(series.cover_image_detail)
      || mediaAssetUrl(series.cover_image),
  };
};

export const memorialArrangementToAudioVisualItem = (
  arrangement: MemorialArrangement,
  page?: MemorialPage | null,
): AudioVisualItem | null => {
  const playableUrl = arrangement.livestream_url?.trim();
  if (!playableUrl) return null;

  const title = arrangement.title || `${page?.full_name || 'Memorial'} livestream`;
  const summary = [
    page?.summary,
    arrangement.location_name,
    arrangement.address,
  ].filter(Boolean).join(' ');

  return {
    categories: [],
    collections: [],
    description: summary,
    descriptionExcerpt: summary,
    embedUrl: playableUrl,
    externalUrl: playableUrl,
    id: arrangement.id,
    liveStatus: arrangement.arrangement_type === 'LIVESTREAM'
      ? 'scheduled'
      : undefined,
    mediaType: 'livestream',
    mediaTypeLabel: 'Livestream',
    publishedAt: arrangement.starts_at || undefined,
    series: null,
    slug: `memorial-arrangement-${arrangement.id}`,
    speaker: page?.full_name,
    thumbnailUrl:
      mediaAssetUrl(page?.hero_image_detail)
      || mediaAssetUrl(page?.portrait_image_detail),
    title,
  };
};
