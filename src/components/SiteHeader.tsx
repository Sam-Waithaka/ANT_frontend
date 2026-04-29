import { Moon, Sun } from 'lucide-react';

type SiteHeaderProps = {
  darkMode: boolean;
  onToggleTheme: () => void;
  sticky?: boolean;
  subtitle?: string;
};

const SiteHeader = ({
  darkMode,
  onToggleTheme,
  sticky = true,
  subtitle = 'Official website launching soon',
}: SiteHeaderProps) => (
  <header
    className={`${sticky ? 'sticky top-0' : 'relative'} z-30 border-b backdrop-blur-xl transition-colors duration-300 ${
      darkMode ? 'border-white/10 bg-black/75' : 'border-black/10 bg-[#f8f5ef]/85'
    }`}
  >
    <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
      <a
        href="/"
        className="flex min-w-0 items-center gap-3 rounded-2xl transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2"
        aria-label="Go to AIC Njoro Town home"
      >
        <div
          className={`grid size-12 shrink-0 place-items-center rounded-2xl border text-xs font-black tracking-[0.18em] shadow-sm ${
            darkMode ? 'border-red-400/30 bg-white/5 text-red-200' : 'border-red-900/15 bg-white text-red-900'
          }`}
          aria-label="AIC Njoro Town logo placeholder"
        >
          AIC
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold uppercase tracking-[0.16em]">AIC Njoro Town</p>
          <p className={`truncate text-xs ${darkMode ? 'text-stone-400' : 'text-zinc-500'}`}>{subtitle}</p>
        </div>
      </a>
      <button
        onClick={onToggleTheme}
        className={`grid size-11 shrink-0 place-items-center rounded-full border transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 ${
          darkMode
            ? 'border-white/10 bg-white/10 text-amber-200 focus:ring-offset-black'
            : 'border-black/10 bg-white text-zinc-900 shadow-sm focus:ring-offset-[#f8f5ef]'
        }`}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </div>
  </header>
);

export default SiteHeader;
