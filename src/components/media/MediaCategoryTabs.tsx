import { BookOpenCheck, ChevronDown, Compass, Grid2X2, Layers, ListVideo, Music2, PlayCircle, Radio, Star, Tv, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { musicSubcategoryTabs } from './MusicSubcategoryTabs';
import type { MusicSubcategoryKey } from './MusicSubcategoryTabs';

export type MediaTabKey = 'all' | 'sermons' | 'featured' | 'teachings' | 'series' | 'livestreams' | 'music' | 'shorts' | 'explore';

const tabs: Array<{ icon: LucideIcon; key: MediaTabKey; label: string }> = [
  { label: 'All', icon: Grid2X2, key: 'all' },
  { label: 'Sermons', icon: PlayCircle, key: 'sermons' },
  { label: 'Featured', icon: Star, key: 'featured' },
  { label: 'Teachings', icon: BookOpenCheck, key: 'teachings' },
  { label: 'Series', icon: ListVideo, key: 'series' },
  { label: 'Livestreams', icon: Tv, key: 'livestreams' },
  { label: 'Music', icon: Music2, key: 'music' },
  { label: 'Shorts', icon: Radio, key: 'shorts' },
  { label: 'Explore', icon: Compass, key: 'explore' },
];

type MediaCategoryTabsProps = {
  activeTab: MediaTabKey;
  darkMode: boolean;
  activeMusicSubcategory?: MusicSubcategoryKey;
  onMusicSubcategoryChange?: (tab: MusicSubcategoryKey) => void;
  onTabChange: (tab: MediaTabKey) => void;
};

const MediaCategoryTabs = ({ activeMusicSubcategory = 'all', activeTab, darkMode, onMusicSubcategoryChange, onTabChange }: MediaCategoryTabsProps) => (
  <>
    <nav className="-mt-7 hidden px-4 sm:px-6 lg:block xl:px-8" aria-label="Media categories">
      <div className={`relative z-10 grid gap-2 rounded-2xl border p-2 shadow-2xl backdrop-blur-xl md:grid-cols-5 xl:grid-cols-9 ${
        darkMode ? 'border-white/10 bg-black/55 shadow-black/30' : 'border-black/10 bg-white/90 shadow-zinc-900/10'
      }`}>
        {tabs.map(({ icon: Icon, key, label }) => {
          const isActive = activeTab === key;

          return (
          <button
            key={key}
            type="button"
            aria-pressed={isActive}
            onClick={() => onTabChange(key)}
            className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold transition ${
              isActive
                ? 'bg-red-800 text-white shadow-md shadow-red-950/30'
                : darkMode
                  ? 'text-stone-300 hover:bg-white/10 hover:text-white'
                  : 'text-zinc-700 hover:bg-[#fffaf0] hover:text-zinc-950'
            }`}
          >
            <Icon size={17} />
            {label}
          </button>
          );
        })}
      </div>
    </nav>
    <MediaMobileCollections
      activeMusicSubcategory={activeMusicSubcategory}
      activeTab={activeTab}
      darkMode={darkMode}
      onMusicSubcategoryChange={onMusicSubcategoryChange}
      onTabChange={onTabChange}
    />
  </>
);

const MediaMobileCollections = ({
  activeMusicSubcategory = 'all',
  activeTab,
  darkMode,
  onMusicSubcategoryChange,
  onTabChange,
}: MediaCategoryTabsProps) => {
  const [open, setOpen] = useState(false);
  const [dockHidden, setDockHidden] = useState(false);
  const activeLabel = tabs.find((tab) => tab.key === activeTab)?.label || 'All';
  const activeMusicLabel = musicSubcategoryTabs.find((tab) => tab.key === activeMusicSubcategory)?.label || 'All';

  useEffect(() => {
    const footer = document.querySelector('[data-site-footer="true"]');

    if (!footer) {
      return;
    }

    let frame = 0;
    const updateDockVisibility = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = footer.getBoundingClientRect();
        setDockHidden(rect.top < window.innerHeight && rect.bottom > 0);
      });
    };
    const observer = new IntersectionObserver(
      ([entry]) => setDockHidden(entry.isIntersecting),
      {
        root: null,
        threshold: 0.08,
      }
    );

    observer.observe(footer);
    updateDockVisibility();
    window.addEventListener('scroll', updateDockVisibility, { passive: true });
    window.addEventListener('resize', updateDockVisibility);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', updateDockVisibility);
      window.removeEventListener('resize', updateDockVisibility);
    };
  }, []);

  const selectTab = (tab: MediaTabKey) => {
    onTabChange(tab);

    if (tab === 'music') {
      return;
    }

    setOpen(false);
  };

  const selectMusicSubcategory = (tab: MusicSubcategoryKey) => {
    onTabChange('music');
    onMusicSubcategoryChange?.(tab);
    setOpen(false);
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Media collections">
          <button
            type="button"
            aria-label="Close collections"
            className="absolute inset-0 bg-black/55"
            onClick={() => setOpen(false)}
          />
          <div className={`absolute inset-x-0 bottom-0 flex max-h-[min(76vh,38rem)] flex-col overflow-hidden rounded-t-3xl border p-4 shadow-2xl ${
            darkMode ? 'border-white/10 bg-[#080808] text-stone-100 shadow-black/50' : 'border-black/10 bg-[#f8f5ef] text-zinc-950 shadow-zinc-900/20'
          }`}>
            <div className="mb-4 flex shrink-0 items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-red-700">Media</p>
                <h2 className="text-xl font-black">Collections</h2>
              </div>
              <button
                type="button"
                aria-label="Close collections"
                onClick={() => setOpen(false)}
                className={`grid size-11 place-items-center rounded-full border ${
                  darkMode ? 'border-white/10 bg-white/10 text-white' : 'border-black/10 bg-white text-zinc-950'
                }`}
              >
                <X size={18} />
              </button>
            </div>
            <div className="min-h-0 overflow-y-auto overscroll-contain pr-1">
              <div className="grid gap-2">
              {tabs.map(({ icon: Icon, key, label }) => {
                const isActive = activeTab === key;

                return (
                  <div key={key} className="grid gap-2">
                    <button
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => selectTab(key)}
                      className={`flex min-h-12 items-center gap-3 rounded-2xl px-4 text-left text-sm font-black transition ${
                        isActive
                          ? 'bg-red-800 text-white shadow-md shadow-red-950/30'
                          : darkMode
                            ? 'text-stone-200 hover:bg-white/10'
                            : 'bg-white text-zinc-800 hover:bg-[#fffaf0]'
                      }`}
                    >
                      <Icon size={18} />
                      {label}
                      {key === 'music' && (
                        <ChevronDown size={15} className={`ml-auto transition ${isActive ? 'rotate-180' : ''}`} />
                      )}
                    </button>
                    {key === 'music' && isActive && (
                      <div className="ml-6 grid gap-2 border-l border-white/10 pl-3">
                        {musicSubcategoryTabs.map(({ icon: MusicIcon, key: musicKey, label: musicLabel }) => {
                          const isMusicActive = activeMusicSubcategory === musicKey;

                          return (
                            <button
                              key={musicKey}
                              type="button"
                              aria-label={`Music ${musicLabel}`}
                              aria-pressed={isMusicActive}
                              onClick={() => selectMusicSubcategory(musicKey)}
                              className={`flex min-h-11 items-center gap-3 rounded-full border px-4 text-left text-sm font-bold transition ${
                                isMusicActive
                                  ? darkMode
                                    ? 'border-red-200/25 bg-white/15 text-white'
                                    : 'border-red-900/15 bg-white/80 text-red-900 shadow-sm'
                                  : darkMode
                                    ? 'border-white/10 bg-white/5 text-stone-200 hover:bg-white/10'
                                    : 'border-white/60 bg-white/50 text-zinc-800 hover:bg-white'
                              }`}
                            >
                              <MusicIcon size={16} />
                              {musicLabel}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`fixed inset-x-0 bottom-0 z-40 px-4 py-3 transition duration-300 lg:hidden ${
        dockHidden ? 'invisible pointer-events-none translate-y-full opacity-0' : 'visible translate-y-0 opacity-100'
      }`}>
        <div className="mx-auto flex max-w-md items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-red-800 px-4 text-sm font-black text-white shadow-2xl shadow-red-950/30 transition hover:-translate-y-0.5 hover:bg-red-700"
          >
            <Layers size={18} />
            Collections
            <span className="rounded-full bg-white/15 px-2 py-1 text-[11px]">
              {activeTab === 'music' ? activeMusicLabel : activeLabel}
            </span>
            <ChevronDown size={16} />
          </button>
        </div>
      </div>
    </>
  );
};

export default MediaCategoryTabs;
