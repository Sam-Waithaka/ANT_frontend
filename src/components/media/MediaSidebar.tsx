import { Search, SlidersHorizontal } from 'lucide-react';
import type { AudioVisualLookup } from '../../types/audioVisual';

const browseItems = ['All Sermons', 'Featured', 'Series', 'Speakers', 'Topics', 'Years'];

type MediaSidebarProps = {
  categories?: AudioVisualLookup[];
  collections?: AudioVisualLookup[];
  darkMode: boolean;
  languages?: AudioVisualLookup[];
  mediaTypes?: AudioVisualLookup[];
  series?: AudioVisualLookup[];
};

const MediaSidebar = ({
  categories = [],
  collections = [],
  darkMode,
  languages = [],
  mediaTypes = [],
  series = [],
}: MediaSidebarProps) => (
  <aside
    className={`rounded-2xl border shadow-xl backdrop-blur ${
      darkMode ? 'border-white/10 bg-white/[0.045] text-stone-200 shadow-black/20' : 'border-black/10 bg-white text-zinc-800 shadow-zinc-900/10'
    }`}
  >
    <div className="p-5">
      <p className={`text-xs font-black uppercase tracking-[0.16em] ${darkMode ? 'text-stone-400' : 'text-zinc-500'}`}>Browse</p>
      <div className="mt-4 grid gap-2">
        {browseItems.map((item, index) => (
          <button
            key={item}
            type="button"
            className={`min-h-11 rounded-xl px-3 text-left text-sm font-bold transition ${
              index === 0 ? 'bg-red-800 text-white' : darkMode ? 'hover:bg-white/10' : 'hover:bg-[#fffaf0]'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>

    <div className={`border-t p-5 ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
      <p className={`flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] ${darkMode ? 'text-stone-400' : 'text-zinc-500'}`}>
        <SlidersHorizontal size={15} />
        Filter
      </p>
      <div className="mt-4 grid gap-3">
        {[
          { label: 'Topic', options: categories },
          { label: 'Series', options: series },
          { label: 'Collection', options: collections },
          { label: 'Language', options: languages },
          { label: 'Media Type', options: mediaTypes },
          { label: 'Year', options: [] },
        ].map(({ label, options }) => (
          <label key={label} className={`grid gap-1 text-xs font-bold ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
            {label}
            <select
              className={`h-11 rounded-xl border px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-red-700 ${
                darkMode ? 'border-white/10 bg-black/30 text-stone-200' : 'border-black/10 bg-[#fffaf0] text-zinc-800'
              }`}
            >
              <option>All {label}s</option>
              {options.map((option) => (
                <option key={option.slug || option.name} value={option.slug || option.name}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </div>

    <div className={`border-t p-5 ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
      <h2 className={`text-base font-black ${darkMode ? 'text-white' : 'text-zinc-950'}`}>Can&apos;t find what you&apos;re looking for?</h2>
      <p className={`mt-2 text-sm leading-6 ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>Search by sermon, scripture, topic, or speaker.</p>
      <label className={`mt-4 flex h-12 items-center gap-2 rounded-xl border px-3 ${darkMode ? 'border-white/10 bg-black/35' : 'border-black/10 bg-[#fffaf0]'}`}>
        <input
          className={`min-w-0 flex-1 bg-transparent text-sm font-bold outline-none ${
            darkMode ? 'text-white placeholder:text-stone-500' : 'text-zinc-950 placeholder:text-zinc-400'
          }`}
          placeholder="Search media"
        />
        <Search size={17} className={darkMode ? 'text-stone-400' : 'text-zinc-500'} />
      </label>
    </div>
  </aside>
);

export default MediaSidebar;
