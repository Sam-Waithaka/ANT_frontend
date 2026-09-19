import type { AudioVisualHomePayload, AudioVisualItem } from '../../types/audioVisual';
import MediaHeroTile from './MediaHeroTile';

type MediaHeroProps = {
  darkMode: boolean;
  heroItem: AudioVisualItem | null;
  home: AudioVisualHomePayload;
};

const MediaHero = ({ darkMode, heroItem, home }: MediaHeroProps) => {
  const sermon = heroItem;
  const background = sermon?.thumbnailUrl || home.hero?.thumbnailUrl || '/images/church-front-left-1920.jpg';

  return (
    <section className={`relative overflow-hidden px-4 pb-16 pt-12 sm:px-6 lg:pb-20 lg:pt-16 ${darkMode ? 'bg-[#050505]' : 'bg-[#f8f5ef]'}`}>
      <div className="absolute inset-0">
        <img src={background} alt="" className={`size-full object-cover ${darkMode ? 'opacity-28' : 'opacity-12'}`} />
        <div
          className={`absolute inset-0 ${
            darkMode
              ? 'bg-[radial-gradient(circle_at_68%_18%,rgba(153,27,27,0.34),transparent_28%),linear-gradient(90deg,#050505_0%,rgba(5,5,5,0.94)_46%,rgba(5,5,5,0.86)_100%)]'
              : 'bg-[radial-gradient(circle_at_68%_18%,rgba(153,27,27,0.11),transparent_28%),linear-gradient(90deg,#f8f5ef_0%,rgba(248,245,239,0.97)_48%,rgba(236,231,222,0.92)_100%)]'
          }`}
        />
      </div>

      <div className="relative">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(26rem,0.78fr)] lg:items-center">
          <div className="mx-auto max-w-4xl text-left lg:mx-0">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-red-700">A.I.C Njoro Town</p>
            <h1 className={`mt-4 max-w-4xl font-serif text-5xl font-bold leading-[0.98] tracking-normal sm:text-6xl lg:text-7xl ${darkMode ? 'text-white' : 'text-zinc-950'}`}>
              Exalting Christ.
              <span className="block text-red-700">Equipping His People.</span>
              <span className="block">Transforming Lives.</span>
            </h1>
            <div className="mt-6 h-px w-16 bg-red-700" />
            <p className={`mt-5 max-w-2xl text-lg leading-8 ${darkMode ? 'text-stone-300' : 'text-zinc-700'}`}>
              Centered on God&apos;s Word. Led by the Holy Spirit. Watch, listen and be strengthened in faith.
            </p>
          </div>

          <MediaHeroTile
            darkMode={darkMode}
            fallbackThumbnailUrl={home.hero?.thumbnailUrl}
            item={sermon}
          />
        </div>
      </div>
    </section>
  );
};

export default MediaHero;
