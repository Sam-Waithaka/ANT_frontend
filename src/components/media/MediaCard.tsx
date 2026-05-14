import { Play } from 'lucide-react';
import type { AudioVisualItem } from '../../types/audioVisual';
import { formatDuration, formatMediaDate } from './mediaFormat';

type MediaCardProps = {
  item: AudioVisualItem;
  variant?: 'landscape' | 'portrait' | 'compact';
};

const variantClass = {
  compact: 'aspect-[16/9]',
  landscape: 'aspect-[16/10]',
  portrait: 'aspect-[9/14]',
};

const MediaCard = ({ item, variant = 'landscape' }: MediaCardProps) => {
  const duration = formatDuration(item.durationSeconds);
  const date = formatMediaDate(item.publishedAt);
  const href = item.externalUrl || item.embedUrl || '#';

  return (
    <a
      href={href}
      target={href === '#' ? undefined : '_blank'}
      rel={href === '#' ? undefined : 'noopener noreferrer'}
      className="group block min-w-0"
    >
      <article className="grid gap-3">
        <div
          className={`relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-lg shadow-black/25 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-red-950/25 ${variantClass[variant]}`}
        >
          {item.thumbnailUrl ? (
            <img src={item.thumbnailUrl} alt="" className="size-full object-cover opacity-85 transition duration-500 group-hover:scale-105 group-hover:opacity-100" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
          <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white backdrop-blur">
            {item.series?.name || item.mediaTypeLabel}
          </div>
          {duration && (
            <div className="absolute bottom-3 right-3 rounded-full bg-black/70 px-2.5 py-1 text-xs font-black text-white backdrop-blur">
              {duration}
            </div>
          )}
          <div className="absolute inset-0 grid place-items-center opacity-0 transition duration-300 group-hover:opacity-100">
            <span className="grid size-14 place-items-center rounded-full bg-red-800 text-white shadow-xl shadow-red-950/35">
              <Play size={24} fill="currentColor" />
            </span>
          </div>
          {variant === 'portrait' && (
            <div className="absolute inset-x-0 bottom-0 p-4">
              <h3 className="text-lg font-black leading-tight text-white">{item.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm leading-5 text-stone-200">{item.descriptionExcerpt}</p>
            </div>
          )}
        </div>

        {variant !== 'portrait' && (
          <div>
            <h3 className="line-clamp-2 text-base font-black leading-snug text-white">{item.title}</h3>
            <p className="mt-1 truncate text-sm text-stone-400">
              {[item.speaker, date].filter(Boolean).join(' • ')}
            </p>
            <p className="mt-2 line-clamp-2 text-sm leading-5 text-stone-300">{item.descriptionExcerpt}</p>
            {item.scriptureReference && (
              <p className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-red-200">{item.scriptureReference}</p>
            )}
          </div>
        )}
      </article>
    </a>
  );
};

export default MediaCard;
