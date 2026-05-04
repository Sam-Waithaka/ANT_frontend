import { BookOpen, CalendarDays, Heart, HelpCircle, Home, Moon, Settings, Sun } from 'lucide-react';
import { assetPaths } from '../constants/assets';

export type SiteNavPath = '/' | '/scripture' | '/project52';

type SiteNavigationProps = {
  activePath?: SiteNavPath;
  darkMode: boolean;
  layout: 'top' | 'side';
  onToggleTheme: () => void;
  sticky?: boolean;
};

const navItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Scripture', href: '/scripture', icon: BookOpen },
  { label: 'Project 52', href: '/project52', icon: CalendarDays },
  { label: 'Giving', href: '#', icon: Heart },
] as const;

const SiteNavigation = ({
  activePath,
  darkMode,
  layout,
  onToggleTheme,
  sticky = true,
}: SiteNavigationProps) => {
  const isActive = (href: string) => href === activePath;

  if (layout === 'side') {
    return (
      <aside
        className={`hidden h-screen w-48 shrink-0 border-r px-4 py-5 lg:flex lg:flex-col ${
          darkMode ? 'border-white/10 bg-[#080808] text-stone-100' : 'border-black/10 bg-[#fffaf0] text-zinc-950'
        }`}
      >
        <a href="/" className="flex items-center gap-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-700">
          <img src={assetPaths.circleLogo} alt="" className="size-10 rounded-2xl bg-white object-contain p-1 shadow-sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-black leading-tight">AIC Njoro</p>
            <p className={`text-[10px] font-black uppercase tracking-[0.16em] ${darkMode ? 'text-stone-400' : 'text-zinc-500'}`}>
              Town
            </p>
          </div>
        </a>

        <nav className="mt-10 grid gap-2" aria-label="Site navigation">
          {navItems.map(({ href, icon: Icon, label }) => (
            <a
              key={label}
              href={href}
              className={`flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-bold transition ${
                isActive(href)
                  ? 'bg-red-800 text-white shadow-md shadow-red-950/20'
                  : darkMode
                    ? 'text-stone-300 hover:bg-white/10'
                    : 'text-zinc-700 hover:bg-white'
              }`}
            >
              <Icon size={17} />
              {label}
            </a>
          ))}
        </nav>

        <div className="mt-auto grid gap-2">
          <a className={`flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-bold ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`} href="#">
            <Settings size={17} />
            Settings
          </a>
          <button
            type="button"
            onClick={onToggleTheme}
            className={`ml-4 flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-bold transition ${
              darkMode ? 'text-stone-300 hover:bg-white/10' : 'text-zinc-700 hover:bg-white'
            }`}
          >
            {darkMode ? <Sun size={17} /> : <Moon size={17} />}
            {darkMode ? 'Light theme' : 'Dark theme'}
          </button>
          <a className={`flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-bold ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`} href="#">
            <HelpCircle size={17} />
            Help
          </a>
        </div>
      </aside>
    );
  }

  return (
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
          <img
            src={assetPaths.circleLogo}
            alt=""
            className={`size-12 shrink-0 rounded-2xl border object-contain p-1 shadow-sm ${
              darkMode ? 'border-red-400/30 bg-white' : 'border-red-900/15 bg-white'
            }`}
          />
          <div className="min-w-0">
            <p className="truncate text-lg font-extrabold leading-tight sm:text-xl">AIC Njoro Town</p>
            <p className={`truncate font-serif text-xs sm:text-sm ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
              Oh Come Let Us Worship - Psalm 95:6
            </p>
          </div>
        </a>
        <button
          type="button"
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
};

export default SiteNavigation;
