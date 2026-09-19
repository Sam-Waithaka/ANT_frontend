import type { AudioVisualLookup } from './audioVisual';
import type {
  PaginatedResponse,
  PublicResourceMinistry,
  WritingMediaAsset,
} from './writing';

export type MemorialWorkflowStatus =
  | 'DRAFT'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'ARCHIVED';

export type MemorialWorkflowAction =
  | 'approve'
  | 'publish'
  | 'unpublish'
  | 'archive';

export const MEMORIAL_RICH_TEXT_SECTION_KEYS = [
  'HERO',
  'LCC_STATEMENT',
  'LIFE_SERVICE',
  'MINISTRY_LEGACY',
  'PERSONAL_TRIBUTES',
  'LEADERSHIP_TIMELINE',
  'GALLERY',
  'RECORDINGS',
  'ARRANGEMENTS',
  'FAMILY',
  'CLOSING_HOPE',
  'GENERAL',
] as const;

export type MemorialRichTextSectionKey =
  (typeof MEMORIAL_RICH_TEXT_SECTION_KEYS)[number];

export const MEMORIAL_GALLERY_CATEGORIES = [
  'FAMILY',
  'CHURCH_SERVICE',
  'LCC_LEADERSHIP',
  'MINISTRY_EVENT',
  'FELLOWSHIP',
  'CHURCH_MILESTONE',
  'OTHER',
] as const;

export type MemorialGalleryCategory =
  (typeof MEMORIAL_GALLERY_CATEGORIES)[number];

export const MEMORIAL_ARRANGEMENT_TYPES = [
  'PRAYER_MEETING',
  'MEMORIAL_SERVICE',
  'FUNERAL_SERVICE',
  'BURIAL',
  'LIVESTREAM',
  'PROGRAMME',
  'NOTICE',
  'OTHER',
] as const;

export type MemorialArrangementType =
  (typeof MEMORIAL_ARRANGEMENT_TYPES)[number];

export type MemorialId = number | string;

export type MemorialWorkflowFields = {
  approved_at?: string | null;
  approved_by?: MemorialId | null;
  created_at?: string;
  created_by?: MemorialId | null;
  is_visible: boolean;
  published_at?: string | null;
  status: MemorialWorkflowStatus;
  updated_at?: string;
  updated_by?: MemorialId | null;
};

export type MemorialScriptureBookDetail = {
  abbreviation?: string;
  id: MemorialId;
  name: string;
  number?: number;
  osis_id?: string;
  testament?: string;
};

export type MemorialAudioVisualSeriesDetail = AudioVisualLookup & {
  cover_image?: WritingMediaAsset | null;
  cover_image_detail?: WritingMediaAsset | null;
  item_count?: number;
  items_count?: number;
  title?: string;
};

export type MemorialPage = MemorialWorkflowFields & {
  birth_date?: string | null;
  death_date?: string | null;
  featured_at?: string | null;
  full_name: string;
  hero_image?: MemorialId | null;
  hero_image_detail?: WritingMediaAsset | null;
  id: MemorialId;
  is_featured?: boolean;
  meta_description?: string;
  meta_title?: string;
  portrait_image?: MemorialId | null;
  portrait_image_detail?: WritingMediaAsset | null;
  role_title?: string;
  slug: string;
  summary?: string;
  years_of_service?: string;
};

export type MemorialRichTextBlock = MemorialWorkflowFields & {
  content_html?: string;
  content_json: unknown;
  content_text?: string;
  content_version?: number;
  id: MemorialId;
  memorial: MemorialId;
  order: number;
  reading_time_minutes?: number;
  section_key: MemorialRichTextSectionKey;
  subtitle?: string;
  title?: string;
};

export type MemorialRichTextMediaEmbed = {
  alt_text_override?: string;
  block: MemorialId;
  caption_override?: string;
  created_at?: string;
  embed_id?: string;
  id: MemorialId;
  media_asset: MemorialId;
  media_asset_detail?: WritingMediaAsset | null;
  order?: number;
  position_hint?: string;
};

export type MemorialRichTextScriptureReference = {
  block: MemorialId;
  book: MemorialId;
  book_detail?: MemorialScriptureBookDetail | null;
  chapter_end?: number | null;
  chapter_start: number;
  created_at?: string;
  display_text: string;
  id: MemorialId;
  order?: number;
  passage_label?: string;
  verse_end?: number | null;
  verse_start: number;
  version?: string;
};

export type MemorialContentBlockBacked = {
  content_block?: MemorialId | null;
  content_block_detail?: MemorialRichTextBlock | null;
  memorial: MemorialId;
};

export type MemorialMinistryTribute = MemorialWorkflowFields &
  MemorialContentBlockBacked & {
    display_ministry_name?: string;
    id: MemorialId;
    ministry?: MemorialId | null;
    ministry_detail?: PublicResourceMinistry | null;
    ministry_name?: string;
    order: number;
    representative_photo?: MemorialId | null;
    representative_photo_detail?: WritingMediaAsset | null;
    speaker_name?: string;
    speaker_office?: string;
  };

export type MemorialPersonalTribute = MemorialWorkflowFields &
  MemorialContentBlockBacked & {
    author_name: string;
    author_photo?: MemorialId | null;
    author_photo_detail?: WritingMediaAsset | null;
    author_role?: string;
    id: MemorialId;
    order: number;
    related_ministry?: MemorialId | null;
    related_ministry_detail?: PublicResourceMinistry | null;
    related_ministry_name?: string;
    relationship_to_deceased?: string;
  };

export type MemorialTimelineEvent = MemorialWorkflowFields &
  MemorialContentBlockBacked & {
    date_label?: string;
    end_year?: number | null;
    event_date?: string | null;
    id: MemorialId;
    image?: MemorialId | null;
    image_detail?: WritingMediaAsset | null;
    order: number;
    start_year?: number | null;
    title: string;
  };

export type MemorialGalleryItem = MemorialWorkflowFields & {
  alt_text_override?: string;
  caption?: string;
  category: MemorialGalleryCategory;
  credit?: string;
  id: MemorialId;
  media_asset: MemorialId;
  media_asset_detail?: WritingMediaAsset | null;
  memorial: MemorialId;
  order: number;
  taken_at?: string | null;
};

export type MemorialRecordingSection = MemorialWorkflowFields &
  MemorialContentBlockBacked & {
    audio_visual_series?: MemorialId | null;
    audio_visual_series_detail?: MemorialAudioVisualSeriesDetail | null;
    id: MemorialId;
    max_items?: number;
    order: number;
    title: string;
  };

export type MemorialArrangement = MemorialWorkflowFields &
  MemorialContentBlockBacked & {
    address?: string;
    arrangement_type: MemorialArrangementType;
    display_until?: string | null;
    ends_at?: string | null;
    id: MemorialId;
    is_prominent?: boolean;
    livestream_url?: string;
    location_name?: string;
    order: number;
    programme_asset?: MemorialId | null;
    programme_asset_detail?: WritingMediaAsset | null;
    starts_at?: string | null;
    title: string;
  };

export type MemorialEditorState = {
  arrangements: MemorialArrangement[];
  gallery_items: MemorialGalleryItem[];
  media_embeds: MemorialRichTextMediaEmbed[];
  ministry_tributes: MemorialMinistryTribute[];
  page: MemorialPage | null;
  personal_tributes: MemorialPersonalTribute[];
  recording_sections: MemorialRecordingSection[];
  rich_text_blocks: MemorialRichTextBlock[];
  scripture_references: MemorialRichTextScriptureReference[];
  section_keys: MemorialRichTextSectionKey[];
  timeline_events: MemorialTimelineEvent[];
};

export type MemorialPageCreatePayload = {
  birth_date?: string | null;
  death_date?: string | null;
  full_name: string;
  hero_image?: MemorialId | null;
  is_featured?: boolean;
  is_visible?: boolean;
  meta_description?: string;
  meta_title?: string;
  portrait_image?: MemorialId | null;
  role_title?: string;
  slug?: string;
  status?: MemorialWorkflowStatus;
  summary?: string;
  years_of_service?: string;
};

export type MemorialPageUpdatePayload = Partial<MemorialPageCreatePayload>;

export type MemorialRichTextBlockCreatePayload = {
  content_json: unknown;
  is_visible?: boolean;
  memorial: MemorialId;
  order?: number;
  section_key: MemorialRichTextSectionKey;
  status?: MemorialWorkflowStatus;
  subtitle?: string;
  title?: string;
};

export type MemorialRichTextBlockUpdatePayload =
  Partial<Omit<MemorialRichTextBlockCreatePayload, 'memorial'>>;

export type MemorialRichTextMediaEmbedPayload = {
  alt_text_override?: string;
  block: MemorialId;
  caption_override?: string;
  media_asset: MemorialId;
  order?: number;
  position_hint?: string;
};

export type MemorialRichTextScriptureReferencePayload = {
  block: MemorialId;
  book: MemorialId;
  chapter_end?: number | null;
  chapter_start: number;
  display_text: string;
  order?: number;
  verse_end?: number | null;
  verse_start: number;
  version?: string;
};

export type MemorialTributeCreatePayload = {
  content_block?: MemorialId | null;
  is_visible?: boolean;
  memorial: MemorialId;
  order?: number;
  status?: MemorialWorkflowStatus;
};

export type MemorialMinistryTributeCreatePayload =
  MemorialTributeCreatePayload & {
    ministry?: MemorialId | null;
    ministry_name?: string;
    representative_photo?: MemorialId | null;
    speaker_name?: string;
    speaker_office?: string;
  };

export type MemorialMinistryTributeUpdatePayload =
  Partial<Omit<MemorialMinistryTributeCreatePayload, 'memorial'>>;

export type MemorialPersonalTributeCreatePayload =
  MemorialTributeCreatePayload & {
    author_name: string;
    author_photo?: MemorialId | null;
    author_role?: string;
    related_ministry?: MemorialId | null;
    related_ministry_name?: string;
    relationship_to_deceased?: string;
  };

export type MemorialPersonalTributeUpdatePayload =
  Partial<Omit<MemorialPersonalTributeCreatePayload, 'memorial'>>;

export type MemorialTimelineEventCreatePayload =
  MemorialTributeCreatePayload & {
    date_label?: string;
    end_year?: number | null;
    event_date?: string | null;
    image?: MemorialId | null;
    start_year?: number | null;
    title: string;
  };

export type MemorialTimelineEventUpdatePayload =
  Partial<Omit<MemorialTimelineEventCreatePayload, 'memorial'>>;

export type MemorialGalleryItemCreatePayload = {
  alt_text_override?: string;
  caption?: string;
  category?: MemorialGalleryCategory;
  credit?: string;
  is_visible?: boolean;
  media_asset: MemorialId;
  memorial: MemorialId;
  order?: number;
  status?: MemorialWorkflowStatus;
  taken_at?: string | null;
};

export type MemorialGalleryItemUpdatePayload =
  Partial<Omit<MemorialGalleryItemCreatePayload, 'memorial'>>;

export type MemorialRecordingSectionCreatePayload =
  MemorialTributeCreatePayload & {
    audio_visual_series?: MemorialId | null;
    max_items?: number;
    title: string;
  };

export type MemorialRecordingSectionUpdatePayload =
  Partial<Omit<MemorialRecordingSectionCreatePayload, 'memorial'>>;

export type MemorialArrangementCreatePayload =
  MemorialTributeCreatePayload & {
    address?: string;
    arrangement_type: MemorialArrangementType;
    display_until?: string | null;
    ends_at?: string | null;
    is_prominent?: boolean;
    livestream_url?: string;
    location_name?: string;
    programme_asset?: MemorialId | null;
    starts_at?: string | null;
    title: string;
  };

export type MemorialArrangementUpdatePayload =
  Partial<Omit<MemorialArrangementCreatePayload, 'memorial'>>;

export type MemorialListFilters = {
  block?: MemorialId;
  memorial?: MemorialId;
  page?: number;
  page_size?: number;
  search?: string;
  section_key?: MemorialRichTextSectionKey;
  status?: MemorialWorkflowStatus | 'ALL';
};

export type MemorialPageList = PaginatedResponse<MemorialPage>;
