export type AudioVisualLookup = {
  description?: string;
  id?: number | string;
  itemCount?: number;
  name: string;
  slug?: string;
  thumbnailUrl?: string;
};

export type AudioVisualItem = {
  id?: number | string;
  title: string;
  slug: string;
  description: string;
  descriptionExcerpt: string;
  thumbnailUrl: string;
  mediaType: string;
  mediaTypeLabel: string;
  language?: string;
  provider?: string;
  durationSeconds?: number;
  publishedAt?: string;
  speaker?: string;
  scriptureReference?: string;
  externalUrl?: string;
  embedUrl?: string;
  liveStatus?: string;
  series?: AudioVisualLookup | null;
  categories: AudioVisualLookup[];
  collections: AudioVisualLookup[];
};

export type AudioVisualRail = {
  key: string;
  title: string;
  items: AudioVisualItem[];
};

export type AudioVisualLiveCta = {
  ctaLabel: string;
  item: AudioVisualItem | null;
};

export type AudioVisualGroupDetail = AudioVisualLookup & {
  description?: string;
  items: AudioVisualItem[];
};

export type AudioVisualHomePayload = {
  generatedAt?: string;
  hero: AudioVisualItem | null;
  live: AudioVisualLiveCta | null;
  rails: AudioVisualRail[];
};

export type AudioVisualListQuery = {
  category?: string;
  collection?: string;
  featured?: boolean;
  language?: string;
  liveStatus?: string;
  ordering?: 'latest' | 'oldest' | 'priority' | 'title';
  search?: string;
  series?: string;
  type?: string;
};
