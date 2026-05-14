import { Search, SlidersHorizontal } from 'lucide-react';

const browseItems = ['All Sermons', 'Featured', 'Series', 'Speakers', 'Topics', 'Years'];
const filters = ['Topic', 'Speaker', 'Series', 'Year'];

const MediaSidebar = () => (
  <aside className="rounded-2xl border border-white/10 bg-white/[0.045] text-stone-200 shadow-xl shadow-black/20 backdrop-blur">
    <div className="p-5">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-stone-400">Browse</p>
      <div className="mt-4 grid gap-2">
        {browseItems.map((item, index) => (
          <button
            key={item}
            type="button"
            className={`min-h-11 rounded-xl px-3 text-left text-sm font-bold transition ${
              index === 0 ? 'bg-red-800 text-white' : 'hover:bg-white/10'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>

    <div className="border-t border-white/10 p-5">
      <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-stone-400">
        <SlidersHorizontal size={15} />
        Filter
      </p>
      <div className="mt-4 grid gap-3">
        {filters.map((filter) => (
          <label key={filter} className="grid gap-1 text-xs font-bold text-stone-400">
            {filter}
            <select className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-sm font-bold text-stone-200 outline-none focus:ring-2 focus:ring-red-700">
              <option>All {filter}s</option>
            </select>
          </label>
        ))}
      </div>
    </div>

    <div className="border-t border-white/10 p-5">
      <h2 className="text-base font-black text-white">Can&apos;t find what you&apos;re looking for?</h2>
      <p className="mt-2 text-sm leading-6 text-stone-400">Search by sermon, scripture, topic, or speaker.</p>
      <label className="mt-4 flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-black/35 px-3">
        <input className="min-w-0 flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder:text-stone-500" placeholder="Search media" />
        <Search size={17} className="text-stone-400" />
      </label>
    </div>
  </aside>
);

export default MediaSidebar;
