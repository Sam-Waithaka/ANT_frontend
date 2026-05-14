import { Images, ListVideo, Mic2, PlayCircle, Radio, Star, Tv } from 'lucide-react';

const tabs = [
  { label: 'Sermons', icon: PlayCircle },
  { label: 'Featured', icon: Star },
  { label: 'Series', icon: ListVideo },
  { label: 'Livestreams', icon: Tv },
  { label: 'Shorts', icon: Radio },
  { label: 'Gallery', icon: Images },
  { label: 'Podcasts', icon: Mic2 },
];

const MediaCategoryTabs = () => (
  <nav className="mx-auto -mt-7 max-w-6xl px-4 sm:px-6" aria-label="Media categories">
    <div className="relative z-10 grid gap-2 rounded-2xl border border-white/10 bg-black/55 p-2 shadow-2xl shadow-black/30 backdrop-blur-xl md:grid-cols-7">
      {tabs.map(({ icon: Icon, label }, index) => (
        <button
          key={label}
          type="button"
          className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold transition ${
            index === 0 ? 'bg-red-800 text-white shadow-md shadow-red-950/30' : 'text-stone-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Icon size={17} />
          {label}
        </button>
      ))}
    </div>
  </nav>
);

export default MediaCategoryTabs;
