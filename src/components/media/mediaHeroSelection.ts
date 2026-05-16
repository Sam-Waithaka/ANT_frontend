import type { AudioVisualHomePayload, AudioVisualItem } from '../../types/audioVisual';
import { fallbackMediaHome } from './mediaContent';

export const isSundayServiceWindowInEastAfrica = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    hour12: false,
    timeZone: 'Africa/Nairobi',
    weekday: 'short',
  }).formatToParts(date);
  const weekday = parts.find((part) => part.type === 'weekday')?.value;
  const hour = Number(parts.find((part) => part.type === 'hour')?.value);

  return weekday === 'Sun' && Number.isFinite(hour) && hour >= 8;
};

export const selectMediaHeroItem = ({
  date = new Date(),
  home,
  latestSermon,
  useFallback,
}: {
  date?: Date;
  home: AudioVisualHomePayload;
  latestSermon: AudioVisualItem | null;
  useFallback: boolean;
}) => {
  if (isSundayServiceWindowInEastAfrica(date) && home.live?.item) {
    return home.live.item;
  }

  return latestSermon || home.hero || (useFallback ? fallbackMediaHome.hero : null);
};
