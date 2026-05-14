import { Plus, Play } from 'lucide-react';
import type { AudioVisualItem } from '../../types/audioVisual';
import { formatDuration, formatMediaDate } from './mediaFormat';
import { getMediaWatchPath } from './mediaLinks';

type MediaFeaturedProps = {
  darkMode: boolean;
  items: AudioVisualItem[];
};

const MediaFeatured = ({ darkMode, items }: MediaFeaturedProps) => {
  const [featured, ...rest] = items;

  if (!featured) return null;

  return (
    <section
      className={`rounded-2xl border p-5 shadow-xl ${
        darkMode
          ? 'border-white/10 bg-[linear-gradient(135deg,rgba(153,27,27,0.24),rgba(255,255,255,0.045))] shadow-black/20'
          : 'border-black/10 bg-white shadow-zinc-900/10'
      }`}
    >
      <div className="mb-5 flex items-center gap-4">
        <div className={`h-px flex-1 ${darkMode ? 'bg-white/10' : 'bg-black/10'}`} />
        <h2 className={`shrink-0 text-center text-sm font-black uppercase tracking-[0.16em] ${darkMode ? 'text-white' : 'text-zinc-950'}`}>Featured Sermon</h2>
        <div className={`h-px flex-1 ${darkMode ? 'bg-white/10' : 'bg-black/10'}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1fr_0.85fr]">
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black">
          <img src={featured.thumbnailUrl || '/images/church-front-left-1920.jpg'} alt="" className="size-full object-contain opacity-95" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute inset-0 grid place-items-center">
            <span className="grid size-16 place-items-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur">
              <Play size={28} fill="currentColor" />
            </span>
          </div>
          {featured.durationSeconds && (
            <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-2.5 py-1 text-xs font-black text-white">
              {formatDuration(featured.durationSeconds)}
            </span>
          )}
        </div>

        <div className="self-center">
          <h3 className={`max-w-md text-3xl font-extrabold leading-tight tracking-normal ${darkMode ? 'text-white' : 'text-zinc-950'}`}>{featured.title}</h3>
          <p className={`mt-3 text-sm font-bold ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
            {[featured.speaker, formatMediaDate(featured.publishedAt)].filter(Boolean).join(' • ')}
          </p>
          <p className={`mt-5 max-w-md text-base leading-7 ${darkMode ? 'text-stone-200' : 'text-zinc-700'}`}>{featured.descriptionExcerpt}</p>
          {featured.scriptureReference && (
            <p className={`mt-3 text-sm font-black uppercase tracking-[0.12em] ${darkMode ? 'text-red-200' : 'text-red-800'}`}>{featured.scriptureReference}</p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={getMediaWatchPath(featured)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-red-800 px-4 text-sm font-black text-white hover:bg-red-700">
              <Play size={16} fill="currentColor" />
              Watch now
            </a>
            <button
              type="button"
              className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-black ${
                darkMode ? 'border-white/10 text-stone-200 hover:bg-white/10' : 'border-black/10 text-zinc-800 hover:bg-[#fffaf0]'
              }`}
            >
              <Plus size={16} />
              My list
            </button>
          </div>
        </div>

        <div className="grid gap-3">
          {rest.slice(0, 3).map((item) => (
            <a
              key={item.slug}
              href={getMediaWatchPath(item)}
              className={`grid grid-cols-[5.5rem_1fr] gap-3 rounded-xl p-2 transition ${darkMode ? 'hover:bg-white/10' : 'hover:bg-[#fffaf0]'}`}
            >
              <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
                <img src={item.thumbnailUrl || '/images/church-front-left-1920.jpg'} alt="" className="size-full object-contain opacity-95" />
                {item.durationSeconds && <span className="absolute bottom-1 right-1 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-black text-white">{formatDuration(item.durationSeconds)}</span>}
              </div>
              <div>
                <h4 className={`line-clamp-2 text-sm font-black ${darkMode ? 'text-white' : 'text-zinc-950'}`}>{item.title}</h4>
                <p className={`mt-1 text-xs ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>{formatMediaDate(item.publishedAt)}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MediaFeatured;
