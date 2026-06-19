export type WritingStatus = 'DRAFT' | 'IN_REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

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
};

export type WritingCategory = {
  id: number | string;
  name: string;
  slug: string;
  description?: string;
};

export type WritingSeries = {
  id: number | string;
  title?: string;
  name?: string;
  slug: string;
  description?: string;
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
};

export type WritingMediaAsset = {
  id: number | string;
  alt_text?: string;
  file?: string;
  image?: string;
  title?: string;
  url?: string;
};

export type Writing = {
  id: number | string;
  title: string;
  slug?: string;
  excerpt?: string;
  content?: unknown;
  status: WritingStatus;
  reading_time_minutes?: number;
  readingTimeMinutes?: number;
  featured_at?: string | null;
  published_at?: string | null;
  scheduled_for?: string | null;
  updated_at?: string;
  created_at?: string;
  resource_type?: number | string | null;
  resource_type_detail?: WritingResourceType | null;
  author_attributions?: WritingAuthorAttribution[];
  ministries?: WritingMinistry[];
  series?: WritingSeries[];
  og_image?: number | string | null;
  og_image_detail?: WritingMediaAsset | null;
  media_embeds?: Array<{ media_asset?: number | string; media_asset_detail?: WritingMediaAsset | null }>;
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

export type WritingCreatePayload = {
  content: unknown;
  excerpt?: string;
  resource_type?: number | string;
  status?: WritingStatus;
  title: string;
};

export type WritingUpdatePayload = Partial<{
  author_attributions: WritingAuthorAttribution[];
  content: unknown;
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
