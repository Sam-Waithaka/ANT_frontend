import { Images, ListVideo, Mic2, PlayCircle, Radio, Star, Tv } from 'lucide-react';
import type { AudioVisualLookup } from '../../types/audioVisual';

const tabs = [
  { label: 'Sermons', icon: PlayCircle },
  { label: 'Featured', icon: Star },
  { label: 'Series', icon: ListVideo },
  { label: 'Livestreams', icon: Tv },
  { label: 'Shorts', icon: Radio },
  { label: 'Gallery', icon: Images },
  { label: 'Podcasts', icon: Mic2 },
];

type MediaCategoryTabsProps = {
  darkMode: boolean;
  mediaTypes?: AudioVisualLookup[];
};

const MediaCategoryTabs = ({ darkMode, mediaTypes = [] }: MediaCategoryTabsProps) => {
  const dynamicTabs =
    mediaTypes.length > 0
      ? mediaTypes.slice(0, 7).map((item, index) => ({ label: item.name, icon: tabs[index]?.icon || PlayCircle }))
      : tabs;

  return (
    <nav className="-mt-7 px-4 sm:px-6 xl:px-8" aria-label="Media categories">
      <div className={`relative z-10 grid gap-2 rounded-2xl border p-2 shadow-2xl backdrop-blur-xl md:grid-cols-7 ${
        darkMode ? 'border-white/10 bg-black/55 shadow-black/30' : 'border-black/10 bg-white/90 shadow-zinc-900/10'
      }`}>
        {dynamicTabs.map(({ icon: Icon, label }, index) => (
          <button
            key={label}
            type="button"
            className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold transition ${
              index === 0
                ? 'bg-red-800 text-white shadow-md shadow-red-950/30'
                : darkMode
                  ? 'text-stone-300 hover:bg-white/10 hover:text-white'
                  : 'text-zinc-700 hover:bg-[#fffaf0] hover:text-zinc-950'
            }`}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default MediaCategoryTabs;
