import { Radio, Share2 } from 'lucide-react';
import type { AudioVisualHomePayload } from '../../types/audioVisual';

type MediaHeroProps = {
  home: AudioVisualHomePayload;
};

const MediaHero = ({ home }: MediaHeroProps) => {
  const hero = home.hero;
  const background = hero?.thumbnailUrl || '/images/church-front-left-1920.jpg';

  return (
    <section className="relative overflow-hidden px-4 py-16 sm:px-6 lg:py-24">
      <div className="absolute inset-0">
        <img src={background} alt="" className="size-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_15%,rgba(153,27,27,0.38),transparent_34%),linear-gradient(90deg,#050505_0%,rgba(5,5,5,0.92)_32%,rgba(5,5,5,0.44)_68%,rgba(5,5,5,0.84)_100%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <p className="text-sm font-bold text-stone-300">Home / Media</p>
        <div className="mt-8 max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-200">Media</p>
          <h1 className="mt-4 text-5xl font-extrabold leading-tight tracking-normal text-white sm:text-6xl">Watch, listen, and be nourished.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-stone-200">
            Explore sermons, livestreams, worship moments, and short reflections from A.I.C Njoro Town Church.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={home.live?.item?.externalUrl || '#'}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-red-800 px-5 text-sm font-black text-white shadow-lg shadow-red-950/30 transition hover:-translate-y-0.5 hover:bg-red-700"
            >
              <Radio size={17} />
              {home.live?.ctaLabel || 'Watch live'}
            </a>
            <button
              type="button"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 text-sm font-black text-white backdrop-blur transition hover:bg-white/15"
            >
              <Share2 size={17} />
              Share
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MediaHero;
