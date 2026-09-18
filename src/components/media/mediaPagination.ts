import type { AudioVisualItem } from '../../types/audioVisual';

export const mergeUniqueMediaItems = (current: AudioVisualItem[], next: AudioVisualItem[]) => {
  const seen = new Set(current.map((item) => item.slug));
  return [...current, ...next.filter((item) => !seen.has(item.slug))];
};

export const hasMoreMediaItems = ({
  count,
  items,
  next,
}: {
  count: number;
  items: AudioVisualItem[];
  next?: string | null;
}) => Boolean(next) || items.length < count;
