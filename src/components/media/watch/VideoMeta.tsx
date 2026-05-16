import { CalendarDays, Check, Clock, Layers, Share2, UserRound } from 'lucide-react';
import type { AudioVisualItem } from '../../../types/audioVisual';
import { formatDuration, formatMediaDate } from '../mediaFormat';

type VideoMetaProps = {
  darkMode: boolean;
  item: AudioVisualItem;
  onShare?: () => void;
  shareStatus?: 'copied' | 'idle';
};

const limitWords = (value: string, maxWords: number) => {
  const words = value.trim().split(/\s+/).filter(Boolean);

  if (words.length <= maxWords) {
    return value.trim();
  }

  return `${words.slice(0, maxWords).join(' ')}...`;
};

const VideoMeta = ({ darkMode, item, onShare, shareStatus = 'idle' }: VideoMetaProps) => {
  const description = limitWords(item.description || item.descriptionExcerpt, 70);
  const metaItems = [
    item.speaker ? { icon: UserRound, label: item.speaker } : null,
    item.publishedAt ? { icon: CalendarDays, label: formatMediaDate(item.publishedAt) } : null,
    item.durationSeconds ? { icon: Clock, label: formatDuration(item.durationSeconds) } : null,
    item.series?.name || item.mediaTypeLabel ? { icon: Layers, label: item.series?.name || item.mediaTypeLabel } : null,
  ].filter(Boolean) as Array<{ icon: typeof UserRound; label: string }>;

  return (
    <section className="grid gap-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-red-700">Now Playing</p>
        <h1 className={`mt-3 max-w-5xl text-4xl font-extrabold leading-tight tracking-normal md:text-5xl ${darkMode ? 'text-white' : 'text-zinc-950'}`}>
          {item.title}
        </h1>
      </div>

      {metaItems.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {onShare && (
            <button
              type="button"
              onClick={onShare}
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-red-800 px-4 text-sm font-black text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 dark:focus:ring-offset-black"
              aria-live="polite"
            >
              {shareStatus === 'copied' ? <Check size={16} /> : <Share2 size={16} />}
              {shareStatus === 'copied' ? 'Link copied' : 'Share'}
            </button>
          )}
          {metaItems.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3 text-sm font-bold ${
                darkMode ? 'border-white/10 bg-white/5 text-stone-300' : 'border-black/10 bg-white text-zinc-700'
              }`}
            >
              <Icon size={16} />
              {label}
            </span>
          ))}
        </div>
      )}

      {description && (
        <p className={`max-w-3xl text-base leading-7 ${darkMode ? 'text-stone-300' : 'text-zinc-700'}`}>
          {description}
        </p>
      )}
    </section>
  );
};

export default VideoMeta;
