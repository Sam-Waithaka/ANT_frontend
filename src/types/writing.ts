export type WritingStatus = 'DRAFT' | 'IN_REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

export type EditorialAction =
  | 'open'
  | 'edit'
  | 'approve'
  | 'publish'
  | 'archive'
  | 'return_to_draft'
  | 'submit_for_review';

export type WritingWorkflowNote = {
  action?: string;
  action_display?: string;
  created_at: string;
  created_by?: number | string;
  created_by_detail?: {
    email?: string;
    id: number | string;
    name?: string;
  } | null;
  created_by_name?: string;
  author_display?: string | null;
  body?: string;
  author?: {
    id: number | string;
    display_name: string;
  } | null;
  id: number | string;
  note: string;
  updated_at?: string;
  writing?: number | string;
};

export type WritingWorkflowNoteCreatePayload = {
  action?: string;
  note: string;
  writing: number | string;
};

export type WritingWorkflowNoteUpdatePayload = Partial<Pick<WritingWorkflowNoteCreatePayload, 'action' | 'note'>>;

export type PaginatedResponse<T> = {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
};

export type WritingResourceType = {
  id: number | string;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
  is_featured: boolean;
  is_active: boolean;
  writing_count?: number;
};

export type WritingCategory = {
  id: number | string;
  name: string;
  slug: string;
  description: string;
  parent: number | string | null;
  children: Array<number | string>;
  sort_order: number;
  is_featured: boolean;
  is_active: boolean;
};

export type WritingSeriesItem = {
  id: number | string;
  series: number | string;
  series_detail?: {
    id: number | string;
    slug: string;
    title: string;
  };
  writing: number | string;
  writing_detail?: {
    id: number | string;
    slug: string;
    status: string;
    title: string;
  };
  writing_title: string;
  order: number;
  created_at?: string;
};

export type WritingSeries = {
  id: number | string;
  title: string;
  name?: string;
  slug: string;
  description: string;
  sort_order: number;
  is_featured: boolean;
  is_active: boolean;
  cover_image?: WritingMediaAsset | null;
  items: WritingSeriesItem[];
};

export type WritingTag = {
  id: number | string;
  name: string;
  slug: string;
  writing_count?: number;
};

export type WritingResourceTypeCategoryLink = {
  id: number | string;
  resource_type: number | string;
  resource_type_detail: WritingResourceType;
  category: number | string;
  category_detail: WritingCategory;
  sort_order: number;
  is_featured: boolean;
  is_active: boolean;
};

export type WritingCategorySeriesLink = {
  id: number | string;
  category: number | string;
  category_detail: WritingCategory;
  series: number | string;
  series_detail: WritingSeries;
  sort_order: number;
  is_featured: boolean;
  is_active: boolean;
};
export type ScriptureBookNavigationItem = {
  abbreviation?: string;
  id?: number | string;
  name: string;
  number?: number;
  osis_id?: string;
  osis?: string;
  slug?: string;
  testament?: string;
  writing_count?: number;
};

export type WritingAuthorRole = 'AUTHOR' | 'CONTRIBUTOR' | 'EDITOR' | 'REVIEWER' | 'COMPILER' | 'TRANSLATOR';

export type WritingAuthorAttribution = {
  display_name?: string;
  is_primary?: boolean;
  name?: string;
  order?: number;
  role?: WritingAuthorRole;
  user?: number | string | null;
};

export type WritingMinistry = {
  id: number | string;
  name: string;
  slug?: string;
  summary?: string;
  writing_count?: number;
};

export type WritingMediaAsset = {
  id: number | string;
  alt_text?: string;
  file?: string;
  image?: string;
  title?: string;
  url?: string;
};

export type PublicResourceType = WritingResourceType;

export type PublicWritingCategory = {
  description: string;
  id: number | string;
  is_active: boolean;
  is_featured: boolean;
  name: string;
  parent: number | string | null;
  slug: string;
  sort_order: number;
  writing_count: number | null;
};

export type PublicResourceSeries = {
  cover_image_detail?: WritingMediaAsset | null;
  description: string;
  id: number | string;
  slug: string;
  title: string;
  writing_count: number;
};

export type PublicScriptureBook = {
  abbreviation: string;
  id: number | string;
  name: string;
  number: number;
  osis_id: string;
  testament: string;
  writing_count: number;
};

export type PublicResourceMinistry = {
  id: number | string;
  name: string;
  slug: string;
  summary: string;
  writing_count: number;
};

export type WritingScriptureReferencePayload = {
  book_osis: string;
  chapter_start: number;
  verse_start: number;
  chapter_end?: number | null;
  verse_end?: number | null;
  version?: string;
  display_text: string;
};

export type WritingScriptureReferenceCreatePayload = WritingScriptureReferencePayload & {
  writing: number | string;
};

export type WritingScriptureReference = WritingScriptureReferencePayload & {
  id: number | string;
  writing: number | string;
  book: string;
  book_ref?: number | string | null;
  book_detail?: {
    id: number;
    name: string;
    abbreviation: string;
    osis_id: string;
    number: number;
    testament: 'OT' | 'NT';
  } | null;
  version: string;
  created_at?: string;
};
export type WritingMediaEmbed = {
  alt_text_override?: string;
  caption_override?: string;
  embed_id?: string;
  id: number | string;
  media_asset: number | string;
  media_asset_detail?: WritingMediaAsset | null;
  position_hint?: string;
  writing: number | string;
};
export type PublicWritingCard = {
  author_attributions: Array<{
    display_name: string;
    id: number | string;
    is_primary: boolean;
    order: number;
    role: string;
  }>;
  author_display: string;
  byline: string;
  categories: WritingCategory[];
  excerpt: string;
  id: number | string;
  ministries: PublicResourceMinistry[];
  og_image_detail: WritingMediaAsset | null;
  published_at: string;
  reading_time_minutes: number;
  resource_type_detail: PublicResourceType | null;
  scripture_references: WritingScriptureReference[];
  seo_description: string;
  seo_title: string;
  series: PublicResourceSeries[];
  slug: string;
  tags: WritingTag[];
  title: string;
  writing_type: string;
};

export type PublicResourceTypeRail = {
  count: number;
  items: PublicWritingCard[];
  resource_type: PublicResourceType;
};

export type PublicCategoryRail = {
  category: PublicWritingCategory;
  count: number;
  items: PublicWritingCard[];
};

export type PublicSeriesRail = {
  count: number;
  items: PublicWritingCard[];
  series: PublicResourceSeries;
};

export type PublicWritingNeighbor = {
  published_at: string;
  slug: string;
  title: string;
};

export type PublicWritingDetail = PublicWritingCard & {
  canonical_lookup: {
    published_at: string;
    slug: string;
  };
  canonical_url: string;
  content_html: string;
  content_json: unknown;
  content_text: string;
  content_version: number;
  media_embeds: WritingMediaEmbed[];
  next_article: PublicWritingNeighbor | null;
  og_description: string;
  og_title: string;
  previous_article: PublicWritingNeighbor | null;
  slug_variants: PublicWritingCard[];
};

export type Writing = {
  id: number | string;
  title: string;
  slug?: string;
  excerpt?: string;
  content_json?: unknown;
  content_html?: string;
  content_text?: string;
  status: WritingStatus;
  author_ids?: Array<number | string>;
  is_author?: boolean;
  submitted_at?: string | null;
  reviewed_at?: string | null;
  workflow_notes_count?: number;
  latest_workflow_note?: WritingWorkflowNote | null;
  reading_time_minutes?: number;
  readingTimeMinutes?: number;
  featured_at?: string | null;
  published_at?: string | null;
  scheduled_for?: string | null;
  updated_at?: string;
  workflow_notes?: WritingWorkflowNote[];
  created_at?: string;
  resource_type?: number | string | null;
  resource_type_detail?: WritingResourceType | null;
  author_attributions?: WritingAuthorAttribution[];
  categories?: WritingCategory[];
  ministries?: WritingMinistry[];
  series?: WritingSeries[];
  tags?: WritingTag[];
  scripture_references?: WritingScriptureReference[];
  og_image?: number | string | null;
  og_image_detail?: WritingMediaAsset | null;
  media_embeds?: WritingMediaEmbed[];
};

export type EditorialQueueItem = Writing & {
  author_display?: string;
  authors?: Array<{ id: number | string; display_name: string }>;
  author_ids?: Array<number | string>;
  available_actions?: EditorialAction[];
  byline?: string;
  categories?: unknown[];
  created_at?: string;
  is_author?: boolean;
  latest_workflow_note?: WritingWorkflowNote | null;
  resource_type_detail?: unknown | null;
  reviewed_at?: string | null;
  submitted_at?: string | null;
  workflow_notes_count?: number;
  writing_type?: string;
};

export type EditorialQueueFilters = {
  author?: number | string;
  page?: number;
  page_size?: number;
  search?: string;
  status?: WritingStatus | 'ALL';
};

export type WritingFilters = {
  category_slug?: string;
  featured?: boolean;
  ministry_slug?: string;
  page?: number;
  page_size?: number;
  resource_type_slug?: string;
  scripture_book_osis?: string;
  search?: string;
  series_slug?: string;
  status?: WritingStatus | 'ALL';
};

export type ResourcesNavigationFilters = {
  category?: number | string;
  category_slug?: string;
  resource_type?: number | string;
  resource_type_slug?: string;
};

export type ResourcesNavigation = {
  categories: WritingCategory[];
  category_series_links: WritingCategorySeriesLink[];
  ministries: PublicResourceMinistry[];
  resource_type_category_links: WritingResourceTypeCategoryLink[];
  resource_types: PublicResourceType[];
  scripture_books: PublicScriptureBook[];
  series: PublicResourceSeries[];
};

export type ResourcesHome = {
  category_rails: PublicCategoryRail[];
  featured_articles: PublicWritingCard[];
  featured_categories: WritingCategory[];
  featured_series: PublicResourceSeries[];
  hero_featured: PublicWritingCard | null;
  latest_articles: PublicWritingCard[];
  ministries: PublicResourceMinistry[];
  resource_type_rails: PublicResourceTypeRail[];
  resource_types: PublicResourceType[];
  scripture_books: PublicScriptureBook[];
  series_rails: PublicSeriesRail[];
};

export type WritingCreatePayload = {
  author_attributions?: WritingAuthorAttribution[];
  category_ids?: Array<number | string>;
  content_json: unknown;
  excerpt?: string;
  ministry_ids?: Array<number | string>;
  og_image?: number | string | null;
  resource_type?: number | string;
  series_ids?: Array<number | string>;
  scripture_references?: WritingScriptureReferencePayload[];
  status?: WritingStatus;
  tag_ids?: Array<number | string>;
  title: string;
  writing_type?: string;
};

export type WritingUpdatePayload = Partial<{
  author_attributions: WritingAuthorAttribution[];
  category_ids: Array<number | string>;
  content_json: unknown;
  excerpt: string;
  featured_at: string | null;
  ministry_ids: Array<number | string>;
  og_image: number | string | null;
  resource_type: number | string | null;
  series_ids: Array<number | string>;
  scripture_references: WritingScriptureReferencePayload[];
  status: WritingStatus;
  tag_ids: Array<number | string>;
  title: string;
}>;
export type MediaAssetUsage = {
  can_delete?: boolean;
  references?: Array<{ id?: number | string; title?: string; type?: string }>;
  usage_count?: number;
};





