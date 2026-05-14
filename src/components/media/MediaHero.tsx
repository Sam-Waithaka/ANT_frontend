import { Play, Radio, Share2 } from 'lucide-react';
import type { AudioVisualHomePayload, AudioVisualItem } from '../../types/audioVisual';
import { formatDuration, formatMediaDate } from './mediaFormat';

type MediaHeroProps = {
  darkMode: boolean;
  heroItem: AudioVisualItem | null;
  home: AudioVisualHomePayload;
  mode: 'latest' | 'live';
};

const MediaHero = ({ darkMode, heroItem, home, mode }: MediaHeroProps) => {
  const hero = heroItem || home.hero;
  const background = hero?.thumbnailUrl || '/images/church-front-left-1920.jpg';
  const meta = hero ? [hero.speaker, formatMediaDate(hero.publishedAt)].filter(Boolean).join(' • ') : '';
  const ctaHref =
    mode === 'live'
      ? home.live?.item?.externalUrl || home.live?.item?.embedUrl || '#'
      : hero?.externalUrl || hero?.embedUrl || '#';
  const ctaLabel = mode === 'live' ? home.live?.ctaLabel || 'Watch live' : 'Watch latest sermon';
  const duration = formatDuration(hero?.durationSeconds);

  return (
    <section className={`relative overflow-hidden px-4 py-14 sm:px-6 lg:py-20 ${darkMode ? 'bg-[#050505]' : 'bg-[#f8f5ef]'}`}>
      <div className="absolute inset-0">
        <img src={background} alt="" className={`size-full object-cover ${darkMode ? 'opacity-45' : 'opacity-18'}`} />
        <div
          className={`absolute inset-0 ${
            darkMode
              ? 'bg-[radial-gradient(circle_at_76%_22%,rgba(153,27,27,0.36),transparent_32%),linear-gradient(90deg,#050505_0%,rgba(5,5,5,0.94)_34%,rgba(5,5,5,0.62)_62%,rgba(5,5,5,0.9)_100%)]'
              : 'bg-[radial-gradient(circle_at_76%_22%,rgba(153,27,27,0.12),transparent_32%),linear-gradient(90deg,#f8f5ef_0%,rgba(248,245,239,0.96)_38%,rgba(248,245,239,0.78)_68%,rgba(236,231,222,0.94)_100%)]'
          }`}
        />
      </div>

      <div className="relative grid gap-10 lg:grid-cols-[0.9fr_1fr] lg:items-end">
        <div>
          <p className={`text-sm font-bold ${darkMode ? 'text-stone-300' : 'text-zinc-600'}`}>Home / Media</p>
          <h1 className={`mt-8 text-5xl font-extrabold leading-tight tracking-normal sm:text-6xl ${darkMode ? 'text-white' : 'text-zinc-950'}`}>Media</h1>
          <p className={`mt-5 max-w-xl text-base leading-7 ${darkMode ? 'text-stone-200' : 'text-zinc-700'}`}>
            Watch, listen and be inspired. Explore sermons, featured messages, worship moments, and more from A.I.C Njoro Town Church.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={home.live?.item?.externalUrl || home.live?.item?.embedUrl || '#'}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-red-800 px-5 text-sm font-black text-white shadow-lg shadow-red-950/30 transition hover:-translate-y-0.5 hover:bg-red-700"
            >
              <Radio size={17} />
              {home.live?.ctaLabel || 'Watch live'}
            </a>
            <button
              type="button"
              className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full border px-5 text-sm font-black backdrop-blur transition ${
                darkMode ? 'border-white/10 bg-white/10 text-white hover:bg-white/15' : 'border-black/10 bg-white text-zinc-950 shadow-lg shadow-zinc-900/10 hover:bg-[#fffaf0]'
              }`}
            >
              <Share2 size={17} />
              Share
            </button>
          </div>
        </div>

        <a
          href={ctaHref}
          className={`group relative overflow-hidden rounded-[2rem] border shadow-2xl backdrop-blur transition duration-300 hover:-translate-y-1 ${
            darkMode ? 'border-white/10 bg-black/50 shadow-black/40 hover:shadow-red-950/30' : 'border-black/10 bg-white/80 shadow-zinc-900/15 hover:shadow-zinc-900/20'
          }`}
        >
          <div className="relative aspect-video">
            <img src={background} alt="" className="size-full object-cover opacity-85 transition duration-500 group-hover:scale-105 group-hover:opacity-100" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
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
              {mode === 'live' ? 'Livestream' : 'Latest sermon'}
            </span>
          </div>
          <div className="p-5">
            <h2 className={`text-2xl font-extrabold leading-tight tracking-normal ${darkMode ? 'text-white' : 'text-zinc-950'}`}>{hero?.title || 'Latest message'}</h2>
            {meta && <p className={`mt-2 text-sm font-bold ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>{meta}</p>}
            <p className={`mt-3 line-clamp-2 text-sm leading-6 ${darkMode ? 'text-stone-300' : 'text-zinc-700'}`}>
              {hero?.descriptionExcerpt || 'A curated message from A.I.C Njoro Town Church.'}
            </p>
            {hero?.scriptureReference && (
              <p className={`mt-3 text-xs font-black uppercase tracking-[0.14em] ${darkMode ? 'text-red-200' : 'text-red-800'}`}>{hero.scriptureReference}</p>
            )}
            <p className={`mt-5 inline-flex items-center gap-2 text-sm font-black ${darkMode ? 'text-red-200' : 'text-red-800'}`}>
              <Play size={15} fill="currentColor" />
              {ctaLabel}
            </p>
          </div>
        </a>
      </div>
    </section>
  );
};

export default MediaHero;
