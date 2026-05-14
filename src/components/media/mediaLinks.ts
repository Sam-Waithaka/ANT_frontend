import type { AudioVisualItem } from '../../types/audioVisual';

export const getMediaWatchPath = (item: Pick<AudioVisualItem, 'slug'> | null | undefined) =>
  item?.slug ? `/media/watch/${encodeURIComponent(item.slug)}` : '#';
