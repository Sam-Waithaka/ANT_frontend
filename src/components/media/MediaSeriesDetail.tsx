import type { AudioVisualGroupDetail } from '../../types/audioVisual';
import MediaRail from './MediaRail';

type MediaSeriesDetailProps = {
  darkMode: boolean;
  series: AudioVisualGroupDetail | null;
  status: 'idle' | 'loading' | 'ready' | 'error';
};

const MediaSeriesDetail = ({ darkMode, series, status }: MediaSeriesDetailProps) => {
  if (status === 'idle') {
    return null;
  }

  if (status === 'loading') {
    return (
      <section className={`rounded-2xl border px-4 py-3 text-sm font-bold ${
        darkMode ? 'border-white/10 bg-white/[0.04] text-stone-300' : 'border-black/10 bg-white text-zinc-700 shadow-sm shadow-zinc-900/5'
      }`}>
        Loading this series...
      </section>
    );
  }

  if (status === 'error' || !series) {
    return (
      <section className={`rounded-2xl border px-4 py-3 text-sm font-bold ${
        darkMode ? 'border-white/10 bg-white/[0.04] text-stone-300' : 'border-black/10 bg-white text-zinc-700 shadow-sm shadow-zinc-900/5'
      }`}>
        We could not load this series right now.
      </section>
    );
  }

  return (
    <section className={`rounded-3xl border p-5 shadow-xl ${
      darkMode
        ? 'border-white/10 bg-[linear-gradient(135deg,rgba(153,27,27,0.16),rgba(255,255,255,0.035))] shadow-black/25'
        : 'border-black/10 bg-white shadow-zinc-900/10'
    }`}>
      <div className="mb-6 max-w-4xl">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-red-700">Selected Series</p>
        <h2 className={`mt-2 text-3xl font-extrabold tracking-normal ${darkMode ? 'text-white' : 'text-zinc-950'}`}>{series.name}</h2>
        {series.description && (
          <p className={`mt-3 text-base leading-7 ${darkMode ? 'text-stone-300' : 'text-zinc-700'}`}>{series.description}</p>
        )}
        <p className={`mt-3 text-sm font-bold ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
          {series.items.length} {series.items.length === 1 ? 'message' : 'messages'} in this series
        </p>
      </div>

      <MediaRail
        darkMode={darkMode}
        items={series.items}
        relatedContext={{ label: series.name, series: series.slug }}
        title={`${series.name} Messages`}
      />
    </section>
  );
};

export default MediaSeriesDetail;
