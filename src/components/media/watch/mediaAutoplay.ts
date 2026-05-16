import type { AudioVisualItem } from '../../../types/audioVisual';
import type { MediaWatchContext, RelatedMediaOrdering } from '../mediaWatchContext';

export type AutoplayMode = 'general' | 'music' | 'series' | 'sermon' | 'shorts';

export type AutoplayDecision =
  | { type: 'none' }
  | { type: 'load-more' }
  | { item: AudioVisualItem; type: 'next' }
  | { item: AudioVisualItem; type: 'still-watching' };

export const autoplayModeForItem = (item: AudioVisualItem | null, context?: MediaWatchContext): AutoplayMode => {
  if (item?.mediaType.toLowerCase() === 'short') return 'shorts';
  if (context?.series || item?.series?.slug) return 'series';
  if (context?.type?.toLowerCase() === 'music' || item?.mediaType.toLowerCase() === 'music') return 'music';
  if (item?.mediaType.toLowerCase() === 'sermon') return 'sermon';
  return 'general';
};

export const shouldDefaultAutoplay = (item: AudioVisualItem | null, context?: MediaWatchContext) => {
  const mode = autoplayModeForItem(item, context);
  return mode === 'shorts' || mode === 'series';
};

export const autoplayLimitReached = (mode: AutoplayMode, startedAt: number, count: number, now = Date.now()) => {
  const elapsedMinutes = (now - startedAt) / 60000;

  if (mode === 'shorts') return count >= 20 || elapsedMinutes >= 30;
  if (mode === 'series' || mode === 'sermon') return count >= 3 || elapsedMinutes >= 180;
  if (mode === 'music') return elapsedMinutes >= 90;
  return count >= 5 || elapsedMinutes >= 120;
};

const mediaTime = (item?: AudioVisualItem | null) => {
  const time = item?.publishedAt ? new Date(item.publishedAt).getTime() : Number.NaN;
  return Number.isFinite(time) ? time : 0;
};

export const orderAutoplayQueue = (items: AudioVisualItem[], ordering: RelatedMediaOrdering) =>
  [...items].sort((first, second) => {
    const firstTime = mediaTime(first);
    const secondTime = mediaTime(second);

    if (firstTime === secondTime) {
      return first.title.localeCompare(second.title);
    }

    return ordering === 'oldest' ? firstTime - secondTime : secondTime - firstTime;
  });

export const buildAutoplayQueue = (
  current: AudioVisualItem,
  relatedItems: AudioVisualItem[],
  ordering: RelatedMediaOrdering
) => {
  const bySlug = new Map<string, AudioVisualItem>();
  [current, ...relatedItems].forEach((item) => {
    if (item.slug) {
      bySlug.set(item.slug, item);
    }
  });

  return orderAutoplayQueue(Array.from(bySlug.values()), ordering);
};

export const selectNextAutoplayItem = ({
  allowWrap = false,
  current,
  hasMore = false,
  ordering,
  relatedItems,
}: {
  allowWrap?: boolean;
  current: AudioVisualItem;
  hasMore?: boolean;
  ordering: RelatedMediaOrdering;
  relatedItems: AudioVisualItem[];
}): AutoplayDecision => {
  const queue = buildAutoplayQueue(current, relatedItems, ordering);
  const currentIndex = queue.findIndex((item) => item.slug === current.slug);

  if (currentIndex === -1) {
    return queue[0] ? { item: queue[0], type: 'next' } : { type: hasMore ? 'load-more' : 'none' };
  }

  const nextItem = queue[currentIndex + 1];
  if (nextItem) {
    return { item: nextItem, type: 'next' };
  }

  if (hasMore) {
    return { type: 'load-more' };
  }

  if (allowWrap && queue.length > 1) {
    return { item: queue[0], type: 'next' };
  }

  return { type: 'none' };
};

export const resolveAutoplayDecision = ({
  allowWrap = false,
  count,
  current,
  hasMore = false,
  mode,
  ordering,
  relatedItems,
  startedAt,
}: {
  allowWrap?: boolean;
  count: number;
  current: AudioVisualItem;
  hasMore?: boolean;
  mode: AutoplayMode;
  ordering: RelatedMediaOrdering;
  relatedItems: AudioVisualItem[];
  startedAt: number;
}): AutoplayDecision => {
  const next = selectNextAutoplayItem({ allowWrap, current, hasMore, ordering, relatedItems });

  if (next.type !== 'next') {
    return next;
  }

  if (autoplayLimitReached(mode, startedAt || Date.now(), count)) {
    return { item: next.item, type: 'still-watching' };
  }

  return next;
};
