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
    className="flex flex-wrap justify-center gap-3"
  >
    {musicTabs.map(({ icon: Icon, key, label }) => {
      const isActive = activeTab === key;

      return (
        <button
          key={key}
          type="button"
          aria-pressed={isActive}
          onClick={() => onTabChange(key)}
          className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-bold transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 ${
            isActive
              ? darkMode
                ? 'border-red-200/25 bg-white/15 text-white shadow-lg shadow-red-950/20 focus:ring-offset-[#080808]'
                : 'border-red-900/15 bg-white/70 text-red-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_16px_34px_rgba(127,29,29,0.13)] focus:ring-offset-[#f8f5ef]'
              : darkMode
                ? 'border-white/15 bg-white/10 text-stone-100 hover:bg-white/15 focus:ring-offset-[#080808]'
                : 'border-white/55 bg-white/10 text-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_16px_34px_rgba(24,24,27,0.10)] hover:bg-white/20 focus:ring-offset-[#f8f5ef]'
          }`}
        >
          <Icon size={17} />
          {label}
        </button>
      );
    })}
  </div>
);

export default MusicSubcategoryTabs;
