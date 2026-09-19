import type { AudioVisualHomePayload, AudioVisualItem } from '../../types/audioVisual';
import MediaHeroSurface from './MediaHeroSurface';
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
    <MediaHeroSurface
      backgroundUrl={background}
      className="px-4 pb-16 pt-12 sm:px-6 lg:pb-20 lg:pt-16"
      darkMode={darkMode}
    >
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
    </MediaHeroSurface>
  );
};

export default MediaHero;
