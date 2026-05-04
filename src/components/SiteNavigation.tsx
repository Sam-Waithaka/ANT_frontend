import { BookOpen, CalendarDays, Heart, HelpCircle, Home, Menu, Moon, Settings, Sun, X } from 'lucide-react';
import { useState } from 'react';
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

const churchWebsiteUrl = 'https://aicnjoro.org';

const SiteNavigation = ({
  activePath,
  darkMode,
  layout,
  onToggleTheme,
  sticky = true,
}: SiteNavigationProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const isActive = (href: string) => href === activePath;

  if (layout === 'side') {
    return (
      <aside
        className={`hidden h-screen w-48 shrink-0 border-r px-4 py-5 lg:flex lg:flex-col ${
          darkMode ? 'border-white/10 bg-[#080808] text-stone-100' : 'border-black/10 bg-[#fffaf0] text-zinc-950'
        }`}
      >
        <a
          href={churchWebsiteUrl}
          target='_blank'
          rel='noopener noreferrer'
          className="flex items-center gap-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-700"
          aria-label="Open the AIC Njoro Town website"
        >
          <img src={assetPaths.circleLogo} alt="" className="size-10 rounded-2xl bg-white object-contain p-1 shadow-sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-black leading-tight">
              A.I.C Njoro<br />
              Town
            </p>
            {/* <p className={`text-[10px] font-black uppercase tracking-[0.16em] ${darkMode ? 'text-stone-400' : 'text-zinc-500'}`}> 
              Town
            </p> */}
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
    <>
      <header
        className={`${sticky ? 'sticky top-0' : 'relative'} z-30 border-b backdrop-blur-xl transition-colors duration-300 ${
        darkMode ? 'border-white/10 bg-black/75' : 'border-black/10 bg-[#f8f5ef]/85'
      }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a
          href={churchWebsiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-w-0 items-center gap-3 rounded-2xl transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2"
          aria-label="Open the AIC Njoro Town website"
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
        <div className="flex shrink-0 items-center gap-3">
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Site navigation">
            {navItems.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-bold transition ${
                  isActive(href)
                    ? 'bg-red-800 text-white shadow-md shadow-red-950/20'
                    : darkMode
                      ? 'text-stone-300 hover:bg-white/10'
                      : 'text-zinc-700 hover:bg-white'
                }`}
              >
                <Icon size={16} />
                {label}
              </a>
            ))}
          </nav>
          <div className="relative">
            <button
              type="button"
              onClick={() => setSettingsOpen((current) => !current)}
              className={`hidden min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-bold transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 lg:inline-flex ${
                settingsOpen
                  ? 'bg-red-800 text-white shadow-md shadow-red-950/20'
                  : darkMode
                    ? 'border-white/10 bg-white/10 text-stone-100 focus:ring-offset-black hover:bg-white/15'
                    : 'border-black/10 bg-white text-zinc-700 shadow-sm focus:ring-offset-[#f8f5ef] hover:bg-[#fffaf0]'
              }`}
              aria-expanded={settingsOpen}
              aria-haspopup="menu"
            >
              <Settings size={17} />
              <span className="hidden sm:inline">Settings</span>
            </button>

            {settingsOpen && (
              <div
                className={`absolute right-0 top-full z-40 mt-3 w-56 rounded-2xl border p-2 shadow-2xl ${
                  darkMode
                    ? 'border-white/10 bg-zinc-950 text-stone-100 shadow-black/40'
                    : 'border-black/10 bg-white text-zinc-950 shadow-zinc-900/15'
                }`}
                role="menu"
              >
                <button
                  type="button"
                  onClick={() => {
                    onToggleTheme();
                    setSettingsOpen(false);
                  }}
                  className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-bold transition ${
                    darkMode ? 'text-stone-300 hover:bg-white/10' : 'text-zinc-700 hover:bg-[#fffaf0]'
                  }`}
                  role="menuitem"
                >
                  {darkMode ? <Sun size={17} /> : <Moon size={17} />}
                  {darkMode ? 'Light theme' : 'Dark theme'}
                </button>
                <a
                  className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold transition ${
                    darkMode ? 'text-stone-400 hover:bg-white/10' : 'text-zinc-600 hover:bg-[#fffaf0]'
                  }`}
                  href="#"
                  role="menuitem"
                >
                  <HelpCircle size={17} />
                  Help
                </a>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className={`grid size-11 shrink-0 place-items-center rounded-full border transition focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 lg:hidden ${
              darkMode
                ? 'border-white/10 bg-white/10 text-stone-100 focus:ring-offset-black'
                : 'border-black/10 bg-white text-zinc-900 shadow-sm focus:ring-offset-[#f8f5ef]'
            }`}
            aria-label="Open navigation menu"
          >
            <Menu size={21} />
          </button>
        </div>
      </div>
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close navigation menu"
          />
          <aside
            className={`absolute right-0 top-0 flex h-full w-[min(88vw,24rem)] flex-col border-l p-5 shadow-2xl ${
              darkMode
                ? 'border-white/10 bg-zinc-950 text-stone-100 shadow-black/40'
                : 'border-black/10 bg-[#fffaf0] text-zinc-950 shadow-zinc-900/15'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <a
                href={churchWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-0 items-center gap-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-700"
                aria-label="Open the AIC Njoro Town website"
              >
                <img src={assetPaths.circleLogo} alt="" className="size-12 rounded-2xl border border-red-900/15 bg-white object-contain p-1 shadow-sm" />
                <div className="min-w-0">
                  <p className="truncate text-lg font-extrabold leading-tight">AIC Njoro Town</p>
                  <p className={`truncate font-serif text-sm ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
                    Oh Come Let Us Worship - Psalm 95:6
                  </p>
                </div>
              </a>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className={`grid size-10 shrink-0 place-items-center rounded-full border ${
                  darkMode ? 'border-white/10 bg-white/10' : 'border-black/10 bg-white'
                }`}
                aria-label="Close navigation menu"
              >
                <X size={19} />
              </button>
            </div>

            <nav className="mt-8 grid gap-2" aria-label="Mobile site navigation">
              {navItems.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setDrawerOpen(false)}
                  className={`flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-bold transition ${
                    isActive(href)
                      ? 'bg-red-800 text-white shadow-md shadow-red-950/20'
                      : darkMode
                        ? 'text-stone-300 hover:bg-white/10'
                        : 'text-zinc-700 hover:bg-white'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </a>
              ))}
            </nav>

            <div className="mt-auto grid gap-2 border-t border-black/10 pt-4 dark:border-white/10">
              <div className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
                <Settings size={17} />
                Settings
              </div>
              <button
                type="button"
                onClick={() => {
                  onToggleTheme();
                  setDrawerOpen(false);
                }}
                className={`ml-4 flex min-h-11 items-center gap-3 rounded-xl px-3 text-left text-sm font-bold transition ${
                  darkMode ? 'text-stone-300 hover:bg-white/10' : 'text-zinc-700 hover:bg-white'
                }`}
              >
                {darkMode ? <Sun size={17} /> : <Moon size={17} />}
                {darkMode ? 'Light theme' : 'Dark theme'}
              </button>
              <a
                href="#"
                className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}
              >
                <HelpCircle size={17} />
                Help
              </a>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

export default SiteNavigation;
