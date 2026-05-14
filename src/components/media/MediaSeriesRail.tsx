import { useState } from 'react';
import { Layers, Play } from 'lucide-react';
import type { AudioVisualLookup } from '../../types/audioVisual';

type MediaSeriesRailProps = {
  darkMode: boolean;
  items: AudioVisualLookup[];
};

const INITIAL_VISIBLE_SERIES = 10;

const MediaSeriesRail = ({ darkMode, items }: MediaSeriesRailProps) => {
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) return null;

  const canExpand = items.length > INITIAL_VISIBLE_SERIES;
  const visibleItems = expanded ? items : items.slice(0, INITIAL_VISIBLE_SERIES);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className={`text-sm font-black uppercase tracking-[0.16em] ${darkMode ? 'text-white' : 'text-zinc-950'}`}>Sermon Series</h2>
        {canExpand && (
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className={`text-sm font-black ${darkMode ? 'text-red-200 hover:text-white' : 'text-red-800 hover:text-zinc-950'}`}
          >
            {expanded ? 'Show less' : 'View more'}
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {visibleItems.map((series) => (
          <a
            key={series.slug || series.name}
            href={series.slug ? `/media/series/${series.slug}` : '#'}
            className={`group overflow-hidden rounded-2xl border shadow-lg transition duration-300 hover:-translate-y-1 ${
              darkMode ? 'border-white/10 bg-zinc-950 shadow-black/25 hover:shadow-red-950/25' : 'border-black/10 bg-white shadow-zinc-900/10 hover:shadow-zinc-900/15'
            }`}
          >
            <div className={`relative aspect-[16/11] ${darkMode ? 'bg-[#171717]' : 'bg-[#ece7de]'}`}>
              {series.thumbnailUrl ? (
                <img src={series.thumbnailUrl} alt="" className="size-full object-cover opacity-85 transition duration-500 group-hover:scale-105 group-hover:opacity-100" />
              ) : (
                <div className="grid size-full place-items-center">
                  <Layers size={34} className={darkMode ? 'text-stone-500' : 'text-zinc-500'} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <span className="absolute left-3 top-3 rounded-full bg-black/65 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white backdrop-blur">
                Series
              </span>
              <span className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-full bg-red-800 text-white opacity-0 shadow-xl shadow-red-950/35 transition group-hover:opacity-100">
                <Play size={18} fill="currentColor" />
              </span>
            </div>

            <div className="p-4">
              <h3 className={`line-clamp-2 text-lg font-black leading-snug ${darkMode ? 'text-white' : 'text-zinc-950'}`}>{series.name}</h3>
              {series.description && (
                <p className={`mt-2 line-clamp-2 text-sm leading-5 ${darkMode ? 'text-stone-300' : 'text-zinc-700'}`}>{series.description}</p>
              )}
              {typeof series.itemCount === 'number' && (
                <p className={`mt-3 text-xs font-black uppercase tracking-[0.12em] ${darkMode ? 'text-red-200' : 'text-red-800'}`}>
                  {series.itemCount} {series.itemCount === 1 ? 'message' : 'messages'}
                </p>
              )}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default MediaSeriesRail;
