export type MemorialImageVariantFormat = "avif" | "webp" | "jpeg" | string;

export type MemorialImageVariantSize = "thumb" | "small" | "medium" | "large" | string;

export type MemorialImageVariant = {
  id: number | string;
  format: MemorialImageVariantFormat;
  size_name: MemorialImageVariantSize;
  url: string;
  width: number | null;
  height: number | null;
  file_size: number | null;
  quality: number | null;
};

export type MemorialVariantMap = Partial<
  Record<MemorialImageVariantFormat, Partial<Record<MemorialImageVariantSize, MemorialImageVariant>>>
>;

export type MemorialMediaAsset = {
  id: number | string;
  uuid: string;
  title: string;
  alt_text: string;
  caption: string;
  original_url: string;
  width: number | null;
  height: number | null;
  variant_map: MemorialVariantMap | null;
};

export type MemorialScriptureBook = {
  id: number | string;
  name: string;
  abbreviation: string;
  osis_id: string;
  number: number | null;
  testament: string;
};

export type MemorialScriptureReference = {
  id: number | string;
  book: MemorialScriptureBook;
  chapter_start: number;
  verse_start: number;
  chapter_end: number | null;
  verse_end: number | null;
  version: string;
  display_text: string;
  passage_label: string;
  order: number;
};

export type MemorialMediaEmbed = {
  id: number | string;
  embed_id: string;
  media_asset: MemorialMediaAsset;
  position_hint: string;
  alt_text_override: string;
  caption_override: string;
  order: number;
};

export type MemorialRichText = {
  id: number | string;
  section_key: string;
  title: string;
  subtitle: string;
  content_json: unknown;
  content_html: string;
  content_text: string;
  reading_time_minutes: number | null;
  media_embeds: MemorialMediaEmbed[];
  scripture_references: MemorialScriptureReference[];
};

export type MemorialPageIdentity = {
  id: number | string;
  full_name: string;
  slug: string;
  role_title: string;
  years_of_service: string;
  birth_date: string | null;
  death_date: string | null;
  summary: string;
  portrait_image: MemorialMediaAsset | null;
  hero_image: MemorialMediaAsset | null;
  meta_title: string;
  meta_description: string;
  published_at: string | null;
  featured_at: string | null;
};

export type PublicMemorialBanner = MemorialPageIdentity & {
  banner_starts_at: string | null;
  banner_ends_at: string | null;
  banner_active: boolean;
};

export type MemorialBaseSection = {
  section_key?: string;
  label?: string;
};

export type MemorialSimpleSection = MemorialBaseSection & {
  blocks: MemorialRichText[];
};

export type MemorialMinistrySummary = {
  id: number | string;
  name: string;
  slug: string;
  summary: string;
};

export type MinistryLegacyItem = {
  id: number | string;
  display_ministry_name: string;
  ministry_name: string;
  ministry: MemorialMinistrySummary | null;
  speaker_name: string;
  speaker_office: string;
  representative_photo: MemorialMediaAsset | null;
  content: MemorialRichText | null;
  order: number;
};

export type PersonalTributeItem = {
  id: number | string;
  author_name: string;
  author_role: string;
  related_ministry: MemorialMinistrySummary | null;
  related_ministry_name: string;
  relationship_to_deceased: string;
  author_photo: MemorialMediaAsset | null;
  content: MemorialRichText | null;
  order: number;
};

export type LeadershipTimelineItem = {
  id: number | string;
  title: string;
  date_label: string;
  event_date: string | null;
  start_year: number | null;
  end_year: number | null;
  image: MemorialMediaAsset | null;
  content: MemorialRichText | null;
  order: number;
};

export type GalleryItem = {
  id: number | string;
  media_asset: MemorialMediaAsset;
  category: string;
  category_label: string;
  caption: string;
  alt_text_override: string;
  credit: string;
  taken_at: string | null;
  order: number;
};

export type RecordingSeries = {
  id: number | string;
  title: string;
  slug: string;
  description: string;
  cover_image: MemorialMediaAsset | null;
};

export type RecordingItem = {
  id: number | string;
  title: string;
  slug: string;
  description: string;
  description_excerpt: string;
  thumbnail_url: string;
  media_type: string | null;
  language: string | null;
  provider: string;
  duration_seconds: number | null;
  published_at: string | null;
  live_status: string;
  scheduled_start_time: string | null;
  actual_start_time: string | null;
  actual_end_time: string | null;
  speaker: string;
  scripture_reference: string;
  external_url: string;
  embed_url: string;
  priority: number | null;
};

export type RecordingSectionGroup = {
  id: number | string;
  title: string;
  content: MemorialRichText | null;
  series: RecordingSeries | null;
  items: RecordingItem[];
  max_items: number | null;
  order: number;
};

export type ArrangementItem = {
  id: number | string;
  arrangement_type: string;
  arrangement_type_label: string;
  title: string;
  starts_at: string | null;
  ends_at: string | null;
  location_name: string;
  address: string;
  livestream_url: string;
  programme_asset: MemorialMediaAsset | null;
  is_prominent: boolean;
  display_until: string | null;
  content: MemorialRichText | null;
  order: number;
};

export type MemorialSectionWithItems<TItem> = MemorialBaseSection & {
  blocks: MemorialRichText[];
  items: TItem[];
};

export type MemorialPublicSections = {
  hero: MemorialSimpleSection;
  official_statement: MemorialSimpleSection;
  life_service: MemorialSimpleSection;
  ministry_legacy: MemorialSectionWithItems<MinistryLegacyItem>;
  personal_tributes: MemorialSectionWithItems<PersonalTributeItem>;
  leadership_timeline: MemorialSectionWithItems<LeadershipTimelineItem>;
  gallery: MemorialSectionWithItems<GalleryItem>;
  recordings: MemorialBaseSection & {
    blocks: MemorialRichText[];
    items: RecordingSectionGroup[];
  };
  arrangements: MemorialSectionWithItems<ArrangementItem>;
  family: MemorialSimpleSection;
  closing_hope: MemorialSimpleSection;
};

export type MemorialPublicPayload = {
  page: MemorialPageIdentity;
  sections: MemorialPublicSections;
};