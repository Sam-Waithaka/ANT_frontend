import type {
  MemorialArrangement,
  MemorialGalleryItem,
  MemorialId,
  MemorialMinistryTribute,
  MemorialPersonalTribute,
  MemorialRecordingSection,
  MemorialRichTextBlock,
  MemorialRichTextMediaEmbed,
  MemorialRichTextScriptureReference,
  MemorialRichTextSectionKey,
  MemorialTimelineEvent,
  MemorialEditorState,
  MemorialPage,
} from '../types/memorial';
import { MEMORIAL_RICH_TEXT_SECTION_KEYS } from '../types/memorial';
import { memorialBlockPlainText } from './memorialAdapters';

export type MemorialEditorBlockChildren = {
  mediaEmbeds: MemorialRichTextMediaEmbed[];
  scriptureReferences: MemorialRichTextScriptureReference[];
};

export type MemorialEditorBlockModel = MemorialEditorBlockChildren & {
  block: MemorialRichTextBlock;
  plainText: string;
};

export type MemorialEditorSectionModel = {
  blocks: MemorialEditorBlockModel[];
  key: MemorialRichTextSectionKey;
  label: string;
};

export type MemorialEditorCollectionCounts = {
  arrangements: number;
  galleryItems: number;
  mediaEmbeds: number;
  ministryTributes: number;
  personalTributes: number;
  recordingSections: number;
  richTextBlocks: number;
  scriptureReferences: number;
  timelineEvents: number;
};

export type MemorialEditorModel = {
  arrangements: MemorialArrangement[];
  blockChildrenById: Record<string, MemorialEditorBlockChildren>;
  galleryItems: MemorialGalleryItem[];
  ministryTributes: MemorialMinistryTribute[];
  page: MemorialPage | null;
  personalTributes: MemorialPersonalTribute[];
  recordingSections: MemorialRecordingSection[];
  sections: MemorialEditorSectionModel[];
  timelineEvents: MemorialTimelineEvent[];
  totals: MemorialEditorCollectionCounts;
};

const sectionLabels: Record<MemorialRichTextSectionKey, string> = {
  ARRANGEMENTS: 'Arrangements',
  CLOSING_HOPE: 'Closing Hope',
  FAMILY: 'Family',
  GALLERY: 'Gallery',
  GENERAL: 'General',
  HERO: 'Hero',
  LCC_STATEMENT: 'LCC Statement',
  LEADERSHIP_TIMELINE: 'Leadership Timeline',
  LIFE_SERVICE: 'Life & Service',
  MINISTRY_LEGACY: 'Ministry Legacy',
  PERSONAL_TRIBUTES: 'Personal Tributes',
  RECORDINGS: 'Recordings',
};

export const memorialGalleryCategoryLabels = {
  CHURCH_MILESTONE: 'Church Milestone',
  CHURCH_SERVICE: 'Church Service',
  FAMILY: 'Family',
  FELLOWSHIP: 'Fellowship',
  LCC_LEADERSHIP: 'LCC Leadership',
  MINISTRY_EVENT: 'Ministry Event',
  OTHER: 'Other',
} as const;

export const memorialArrangementTypeLabels = {
  BURIAL: 'Burial',
  FUNERAL_SERVICE: 'Funeral Service',
  LIVESTREAM: 'Livestream',
  MEMORIAL_SERVICE: 'Memorial Service',
  NOTICE: 'Notice',
  OTHER: 'Other',
  PRAYER_MEETING: 'Prayer Meeting',
  PROGRAMME: 'Programme',
} as const;

const idKey = (value: MemorialId) => String(value);

const orderValue = (value?: number | null) =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const compareByOrderThenId = <T extends { id: MemorialId; order?: number | null }>(
  left: T,
  right: T,
) => {
  const orderDifference = orderValue(left.order) - orderValue(right.order);
  if (orderDifference !== 0) return orderDifference;
  return idKey(left.id).localeCompare(idKey(right.id));
};

const ordered = <T extends { id: MemorialId; order?: number | null }>(items: T[]) =>
  [...items].sort(compareByOrderThenId);

const uniqueSectionKeys = (
  preferred: MemorialRichTextSectionKey[],
  blocks: MemorialRichTextBlock[],
) => {
  const seen = new Set<MemorialRichTextSectionKey>();
  const keys: MemorialRichTextSectionKey[] = [];

  [...preferred, ...blocks.map((block) => block.section_key)].forEach((key) => {
    if (!MEMORIAL_RICH_TEXT_SECTION_KEYS.includes(key) || seen.has(key)) return;
    seen.add(key);
    keys.push(key);
  });

  return keys.length ? keys : [...MEMORIAL_RICH_TEXT_SECTION_KEYS];
};

const groupByBlock = <
  T extends { block: MemorialId; id: MemorialId; order?: number | null },
>(
  items: T[],
) =>
  ordered(items).reduce<Record<string, T[]>>((groups, item) => {
    const key = idKey(item.block);
    groups[key] = [...(groups[key] ?? []), item];
    return groups;
  }, {});

export const getMemorialSectionLabel = (key: MemorialRichTextSectionKey) =>
  sectionLabels[key];

export const createMemorialEditorModel = (
  state: MemorialEditorState,
): MemorialEditorModel => {
  const richTextBlocks = ordered(state.rich_text_blocks);
  const mediaEmbedsByBlock = groupByBlock(state.media_embeds);
  const scriptureReferencesByBlock = groupByBlock(state.scripture_references);
  const sectionKeys = uniqueSectionKeys(state.section_keys, richTextBlocks);
  const blockModels = richTextBlocks.map<MemorialEditorBlockModel>((block) => {
    const key = idKey(block.id);
    return {
      block,
      mediaEmbeds: mediaEmbedsByBlock[key] ?? [],
      plainText: memorialBlockPlainText(block),
      scriptureReferences: scriptureReferencesByBlock[key] ?? [],
    };
  });

  const blockChildrenById = blockModels.reduce<Record<string, MemorialEditorBlockChildren>>(
    (lookup, model) => {
      lookup[idKey(model.block.id)] = {
        mediaEmbeds: model.mediaEmbeds,
        scriptureReferences: model.scriptureReferences,
      };
      return lookup;
    },
    {},
  );

  return {
    arrangements: ordered(state.arrangements),
    blockChildrenById,
    galleryItems: ordered(state.gallery_items),
    ministryTributes: ordered(state.ministry_tributes),
    page: state.page,
    personalTributes: ordered(state.personal_tributes),
    recordingSections: ordered(state.recording_sections),
    sections: sectionKeys.map((key) => ({
      blocks: blockModels.filter((model) => model.block.section_key === key),
      key,
      label: getMemorialSectionLabel(key),
    })),
    timelineEvents: ordered(state.timeline_events),
    totals: {
      arrangements: state.arrangements.length,
      galleryItems: state.gallery_items.length,
      mediaEmbeds: state.media_embeds.length,
      ministryTributes: state.ministry_tributes.length,
      personalTributes: state.personal_tributes.length,
      recordingSections: state.recording_sections.length,
      richTextBlocks: state.rich_text_blocks.length,
      scriptureReferences: state.scripture_references.length,
      timelineEvents: state.timeline_events.length,
    },
  };
};
