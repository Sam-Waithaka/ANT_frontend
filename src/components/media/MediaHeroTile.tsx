import { Play } from 'lucide-react';
import { ScriptureIcon } from '../../constants/siteIcons';
import type { AudioVisualItem } from '../../types/audioVisual';
import { formatDuration, formatMediaDate } from './mediaFormat';
import { getMediaWatchPath } from './mediaLinks';

type MediaHeroTileProps = {
  badgeLabel?: string;
  darkMode: boolean;
  eyebrowLabel?: string;
  fallbackDescription?: string;
  fallbackThumbnailUrl?: string;
  fallbackTitle?: string;
  item: AudioVisualItem | null;
  linkAriaLabel?: string;
};

const MediaHeroTile = ({
  badgeLabel = 'Latest sermon',
  darkMode,
  eyebrowLabel = 'From the pulpit',
  fallbackDescription = 'The newest message from A.I.C Njoro Town Church will appear here when published.',
  fallbackThumbnailUrl,
  fallbackTitle = 'Latest sermon',
  item,
  linkAriaLabel,
}: MediaHeroTileProps) => {
  const thumbnailUrl = item?.thumbnailUrl || fallbackThumbnailUrl || '/images/church-front-left-1920.jpg';
  const meta = item ? [item.speaker, formatMediaDate(item.publishedAt)].filter(Boolean).join(' • ') : '';
  const duration = formatDuration(item?.durationSeconds);
  const description = item?.descriptionExcerpt || fallbackDescription;

  return (
    <a
      aria-label={linkAriaLabel}
      href={getMediaWatchPath(item)}
      className={`group overflow-hidden rounded-[2rem] border shadow-2xl backdrop-blur transition duration-300 hover:-translate-y-1 ${
        darkMode ? 'border-white/10 bg-black/55 shadow-black/40 hover:shadow-red-950/30' : 'border-black/10 bg-white/85 shadow-zinc-900/15 hover:shadow-zinc-900/20'
      }`}
    >
      <div className="relative aspect-video">
        <img src={thumbnailUrl} alt="" className="size-full object-contain opacity-95 transition duration-300 group-hover:opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
        <div className="absolute inset-0 grid place-items-center">
          <span className="grid size-20 place-items-center rounded-full border border-white/30 bg-black/45 text-white backdrop-blur transition group-hover:scale-105 group-hover:bg-red-800">
            <Play size={32} fill="currentColor" />
          </span>
        </div>
        {duration && (
          <span className="absolute bottom-4 right-4 rounded-full bg-black/70 px-3 py-1.5 text-xs font-black text-white backdrop-blur">
            {duration}
          </span>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-red-800 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-white">
          {badgeLabel}
        </span>
      </div>
      <div className="p-6 text-left">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-red-700">
          <ScriptureIcon size={15} />
          {eyebrowLabel}
        </div>
        <h2 className={`mt-3 text-2xl font-extrabold leading-tight tracking-normal ${darkMode ? 'text-white' : 'text-zinc-950'}`}>{item?.title || fallbackTitle}</h2>
        {meta && <p className={`mt-2 text-sm font-bold ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>{meta}</p>}
        {description && (
          <p className={`mt-3 line-clamp-2 text-sm leading-6 ${darkMode ? 'text-stone-300' : 'text-zinc-700'}`}>
            {description}
          </p>
        )}
        {item?.scriptureReference && (
          <p className={`mt-4 text-xs font-black uppercase tracking-[0.14em] ${darkMode ? 'text-red-200' : 'text-red-800'}`}>{item.scriptureReference}</p>
        )}
      </div>
    </a>
  );
};

export default MediaHeroTile;
