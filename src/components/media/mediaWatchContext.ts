import type { AudioVisualItem, AudioVisualListQuery } from '../../types/audioVisual';

export type MediaWatchContext = Pick<AudioVisualListQuery, 'category' | 'musicSubcategory' | 'series' | 'type'> & {
  label?: string;
};

export type RelatedMediaOrdering = 'latest' | 'oldest';

export const relatedContextState = (context?: MediaWatchContext) => (context ? { relatedContext: context } : undefined);

export const buildRelatedMediaQuery = (
  item: AudioVisualItem,
  ordering: RelatedMediaOrdering,
  context?: MediaWatchContext
): AudioVisualListQuery => {
  if (context?.series) {
    return { ordering, series: context.series };
  }

  if (context?.type?.toLowerCase() === 'music') {
    return {
      ordering,
      type: 'music',
      ...(context.musicSubcategory ? { musicSubcategory: context.musicSubcategory } : {}),
    };
  }

  if (context?.category) {
    return { category: context.category, ordering };
  }

  if (context?.type) {
    return { ordering, type: context.type };
  }

  if (item.series?.slug) {
    return { ordering, series: item.series.slug };
  }

  if (item.mediaType.toLowerCase() === 'music') {
    return {
      ordering,
      type: 'music',
      ...(item.musicSubcategory ? { musicSubcategory: item.musicSubcategory } : {}),
    };
  }

  const categorySlug = item.categories[0]?.slug;
  if (categorySlug) {
    return { category: categorySlug, ordering };
  }

  return { ordering, type: item.mediaType };
};

export const defaultRelatedOrdering = (item: AudioVisualItem, context?: MediaWatchContext): RelatedMediaOrdering =>
  context?.series || item.series?.slug ? 'oldest' : 'latest';
