import { ArrowRight, Layers, Play } from 'lucide-react';
import SiteButton from '../ui/SiteButton';
import type { AudioVisualLookup } from '../../types/audioVisual';

type MediaSeriesRailProps = {
  darkMode: boolean;
  items: AudioVisualLookup[];
  onViewMore?: () => void;
  onSeriesSelect?: (series: AudioVisualLookup) => void;
  selectedSlug?: string;
};

const INITIAL_VISIBLE_SERIES = 10;

const MediaSeriesRail = ({ darkMode, items, onSeriesSelect, onViewMore, selectedSlug }: MediaSeriesRailProps) => {
  if (items.length === 0) return null;

  const visibleItems = items.slice(0, INITIAL_VISIBLE_SERIES);

  return (
    <section>
      <div className="mb-5 flex items-center gap-4">
        <div className={`h-px flex-1 ${darkMode ? 'bg-white/10' : 'bg-black/10'}`} />
        <h2 className={`shrink-0 text-center text-sm font-black uppercase tracking-[0.16em] ${darkMode ? 'text-white' : 'text-zinc-950'}`}>Sermon Series</h2>
        <div className={`h-px flex-1 ${darkMode ? 'bg-white/10' : 'bg-black/10'}`} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleItems.map((series) => (
          <button
            key={series.slug || series.name}
            type="button"
            onClick={() => onSeriesSelect?.(series)}
            className={`group block w-full overflow-hidden rounded-2xl border text-left shadow-lg transition duration-300 hover:-translate-y-1 ${
              selectedSlug && series.slug === selectedSlug
                ? darkMode
                  ? 'border-red-400/60 bg-red-950/25 shadow-red-950/30'
                  : 'border-red-800/45 bg-red-50 shadow-red-900/15'
                : darkMode
                  ? 'border-white/10 bg-zinc-950 shadow-black/25 hover:shadow-red-950/25'
                  : 'border-black/10 bg-white shadow-zinc-900/10 hover:shadow-zinc-900/15'
            }`}
          >
            <div className={`relative ${darkMode ? 'bg-[#171717]' : 'bg-[#ece7de]'}`}>
              {series.thumbnailUrl ? (
                <img src={series.thumbnailUrl} alt="" className="h-auto max-h-72 w-full object-contain opacity-95 transition duration-300 group-hover:opacity-100" />
              ) : (
                <div className="grid min-h-48 place-items-center">
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
          </button>
        ))}
      </div>
      {onViewMore && (
        <div className="mt-6 flex justify-center">
          <SiteButton darkMode={darkMode} icon={ArrowRight} iconPosition="after" variant="secondary" onClick={onViewMore}>
            View more
          </SiteButton>
        </div>
      )}
    </section>
  );
};

export default MediaSeriesRail;
