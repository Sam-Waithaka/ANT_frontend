export type WritingStatus = 'DRAFT' | 'IN_REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

export type WritingWorkflowNote = {
  action: string;
  action_display: string;
  created_at: string;
  created_by: number | string;
  created_by_name: string;
  id: number | string;
  note: string;
};

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
  description?: string;
  is_active?: boolean;
  is_featured?: boolean;
  sort_order?: number;
};

export type WritingCategory = {
  id: number | string;
  name: string;
  slug: string;
  description?: string;
  is_active?: boolean;
  is_featured?: boolean;
  parent?: number | string | null;
  sort_order?: number;
};

export type WritingSeries = {
  id: number | string;
  title?: string;
  name?: string;
  slug: string;
  description?: string;
  is_active?: boolean;
  is_featured?: boolean;
  sort_order?: number;
};

export type WritingResourceTypeCategoryLink = {
  id: number | string;
  category: number | string;
  category_detail?: WritingCategory | null;
  is_active?: boolean;
  is_featured?: boolean;
  resource_type: number | string;
  resource_type_detail?: WritingResourceType | null;
  sort_order?: number;
};

export type WritingCategorySeriesLink = {
  id: number | string;
  category: number | string;
  category_detail?: WritingCategory | null;
  is_active?: boolean;
  is_featured?: boolean;
  series: number | string;
  series_detail?: WritingSeries | null;
  sort_order?: number;
};

export type ScriptureBookNavigationItem = {
  id?: number | string;
  name: string;
  osis_id?: string;
  osis?: string;
  slug?: string;
  writing_count?: number;
};

export type WritingAuthorAttribution = {
  display_name?: string;
  name?: string;
  role?: string;
  user?: number | string | null;
};

export type WritingMinistry = {
  id: number | string;
  name: string;
  slug?: string;
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
export type Writing = {
  id: number | string;
  title: string;
  slug?: string;
  excerpt?: string;
  content_json?: unknown;
  content_html?: string;
  content_text?: string;
  status: WritingStatus;
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
  og_image?: number | string | null;
  og_image_detail?: WritingMediaAsset | null;
  media_embeds?: WritingMediaEmbed[];
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
  ministries: WritingMinistry[];
  resource_type_category_links: WritingResourceTypeCategoryLink[];
  resource_types: WritingResourceType[];
  scripture_books: ScriptureBookNavigationItem[];
  series: WritingSeries[];
};

export type WritingCreatePayload = {
  category_ids?: Array<number | string>;
  content_json: unknown;
  excerpt?: string;
    og_image?: number | string | null;
  resource_type?: number | string;
  status?: WritingStatus;
  title: string;
  writing_type?: string;
};

export type WritingUpdatePayload = Partial<{
  author_attributions: WritingAuthorAttribution[];
  category_ids: Array<number | string>;
  content_json: unknown;
  excerpt: string;
  featured_at: string | null;
  og_image: number | string | null;
  resource_type: number | string | null;
  status: WritingStatus;
  title: string;
}>;
export type WritingAssignment = {
  id: number | string;
  title: string;
  assignment_type?: string;
  due_at?: string | null;
  status?: string;
  writing?: number | string | null;
  assignee?: number | string | null;
  notes?: string;
};

export type MediaAssetUsage = {
  can_delete?: boolean;
  references?: Array<{ id?: number | string; title?: string; type?: string }>;
  usage_count?: number;
};





