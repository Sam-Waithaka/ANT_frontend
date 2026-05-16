import { Compass, MicVocal, Music2, UsersRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type MusicSubcategoryKey = 'all' | 'choir' | 'pnw' | 'other';

const musicTabs: Array<{ icon: LucideIcon; key: MusicSubcategoryKey; label: string }> = [
  { label: 'All', icon: Music2, key: 'all' },
  { label: 'Choir', icon: UsersRound, key: 'choir' },
  { label: 'Praise and Worship', icon: MicVocal, key: 'pnw' },
  { label: 'Explore', icon: Compass, key: 'other' },
];

type MusicSubcategoryTabsProps = {
  activeTab: MusicSubcategoryKey;
  darkMode: boolean;
  onTabChange: (tab: MusicSubcategoryKey) => void;
};

const MusicSubcategoryTabs = ({ activeTab, darkMode, onTabChange }: MusicSubcategoryTabsProps) => (
  <div
    aria-label="Music subcategories"
    role="navigation"
    className={`rounded-3xl border p-2 shadow-2xl backdrop-blur-xl ${
      darkMode ? 'border-white/10 bg-white/[0.045] shadow-black/30' : 'border-black/10 bg-white/85 shadow-zinc-900/10'
    }`}
  >
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {musicTabs.map(({ icon: Icon, key, label }) => {
        const isActive = activeTab === key;

        return (
          <button
            key={key}
            type="button"
            aria-pressed={isActive}
            onClick={() => onTabChange(key)}
            className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-black transition ${
              isActive
                ? 'bg-red-800 text-white shadow-lg shadow-red-950/25'
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
  </div>
);

export default MusicSubcategoryTabs;
