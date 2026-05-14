import { Plus, Play } from 'lucide-react';
import type { AudioVisualItem } from '../../types/audioVisual';
import { formatDuration, formatMediaDate } from './mediaFormat';

type MediaFeaturedProps = {
  items: AudioVisualItem[];
};

const MediaFeatured = ({ items }: MediaFeaturedProps) => {
  const [featured, ...rest] = items;

  if (!featured) return null;

  return (
    <section className="rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(153,27,27,0.24),rgba(255,255,255,0.045))] p-5 shadow-xl shadow-black/20">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-sm font-black uppercase tracking-[0.16em] text-white">Featured Sermon</h2>
        <a href="#featured" className="text-sm font-black text-red-200 hover:text-white">View all featured</a>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1fr_0.85fr]">
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black">
          <img src={featured.thumbnailUrl || '/images/church-front-left-1920.jpg'} alt="" className="size-full object-cover opacity-85" />
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
          <h3 className="max-w-md text-3xl font-extrabold leading-tight tracking-normal text-white">{featured.title}</h3>
          <p className="mt-3 text-sm font-bold text-stone-400">
            {[featured.speaker, formatMediaDate(featured.publishedAt)].filter(Boolean).join(' • ')}
          </p>
          <p className="mt-5 max-w-md text-base leading-7 text-stone-200">{featured.descriptionExcerpt}</p>
          {featured.scriptureReference && <p className="mt-3 text-sm font-black uppercase tracking-[0.12em] text-red-200">{featured.scriptureReference}</p>}
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={featured.externalUrl || '#'} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-red-800 px-4 text-sm font-black text-white hover:bg-red-700">
              <Play size={16} fill="currentColor" />
              Watch now
            </a>
            <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 px-4 text-sm font-black text-stone-200 hover:bg-white/10">
              <Plus size={16} />
              My list
            </button>
          </div>
        </div>

        <div className="grid gap-3">
          {rest.slice(0, 3).map((item) => (
            <a key={item.slug} href={item.externalUrl || '#'} className="grid grid-cols-[5.5rem_1fr] gap-3 rounded-xl p-2 transition hover:bg-white/10">
              <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
                <img src={item.thumbnailUrl || '/images/church-front-left-1920.jpg'} alt="" className="size-full object-cover opacity-80" />
                {item.durationSeconds && <span className="absolute bottom-1 right-1 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-black text-white">{formatDuration(item.durationSeconds)}</span>}
              </div>
              <div>
                <h4 className="line-clamp-2 text-sm font-black text-white">{item.title}</h4>
                <p className="mt-1 text-xs text-stone-400">{formatMediaDate(item.publishedAt)}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MediaFeatured;
