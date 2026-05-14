import { CalendarDays, ChevronDown, Grid2X2, Layers, ListVideo, Music2, PlayCircle, Radio, Star, Tv, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';

export type MediaTabKey = 'all' | 'sermons' | 'featured' | 'series' | 'livestreams' | 'shorts' | 'conferences' | 'music';

const tabs: Array<{ icon: LucideIcon; key: MediaTabKey; label: string }> = [
  { label: 'All', icon: Grid2X2, key: 'all' },
  { label: 'Sermons', icon: PlayCircle, key: 'sermons' },
  { label: 'Featured', icon: Star, key: 'featured' },
  { label: 'Series', icon: ListVideo, key: 'series' },
  { label: 'Livestreams', icon: Tv, key: 'livestreams' },
  { label: 'Shorts', icon: Radio, key: 'shorts' },
  { label: 'Conferences', icon: CalendarDays, key: 'conferences' },
  { label: 'Music', icon: Music2, key: 'music' },
];

type MediaCategoryTabsProps = {
  activeTab: MediaTabKey;
  darkMode: boolean;
  onTabChange: (tab: MediaTabKey) => void;
};

const MediaCategoryTabs = ({ activeTab, darkMode, onTabChange }: MediaCategoryTabsProps) => (
  <>
    <nav className="-mt-7 hidden px-4 sm:px-6 lg:block xl:px-8" aria-label="Media categories">
      <div className={`relative z-10 grid gap-2 rounded-2xl border p-2 shadow-2xl backdrop-blur-xl md:grid-cols-4 xl:grid-cols-8 ${
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
    <MediaMobileCollections activeTab={activeTab} darkMode={darkMode} onTabChange={onTabChange} />
  </>
);

const MediaMobileCollections = ({ activeTab, darkMode, onTabChange }: MediaCategoryTabsProps) => {
  const [open, setOpen] = useState(false);
  const activeLabel = tabs.find((tab) => tab.key === activeTab)?.label || 'All';

  const selectTab = (tab: MediaTabKey) => {
    onTabChange(tab);
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
          <div className={`absolute inset-x-0 bottom-0 rounded-t-3xl border p-4 shadow-2xl ${
            darkMode ? 'border-white/10 bg-[#080808] text-stone-100 shadow-black/50' : 'border-black/10 bg-[#f8f5ef] text-zinc-950 shadow-zinc-900/20'
          }`}>
            <div className="mb-4 flex items-center justify-between">
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
            <div className="grid gap-2">
              {tabs.map(({ icon: Icon, key, label }) => {
                const isActive = activeTab === key;

                return (
                  <button
                    key={key}
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
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className={`mx-auto flex max-w-md items-center gap-2 rounded-2xl border p-2 shadow-2xl ${
          darkMode ? 'border-white/10 bg-black/70 shadow-black/40' : 'border-black/10 bg-white/90 shadow-zinc-900/15'
        }`}>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-red-800 px-4 text-sm font-black text-white shadow-lg shadow-red-950/25"
          >
            <Layers size={18} />
            Collections
            <span className="rounded-full bg-white/15 px-2 py-1 text-[11px]">{activeLabel}</span>
            <ChevronDown size={16} />
          </button>
        </div>
      </div>
    </>
  );
};

export default MediaCategoryTabs;
