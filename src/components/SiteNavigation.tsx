import {
  BookOpen,
  CalendarDays,
  Heart,
  HelpCircle,
  Home,
  Info,
  Menu,
  Moon,
  Phone,
  PlayCircle,
  Radio,
  Settings,
  Sun,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { assetPaths } from '../constants/assets';
import { useCompactHeader } from '../hooks/useCompactHeader';

export type SiteNavPath =
  | '/'
  | '/about'
  | '/contact'
  | '/give'
  | '/media'
  | '/ministries'
  | '/scripture'
  | '/project52';

type SiteNavigationProps = {
  activePath?: SiteNavPath;
  darkMode: boolean;
  layout: 'top' | 'side';
  onToggleTheme: () => void;
  sticky?: boolean;
};

type SiteNavItem = {
  label: string;
  href: string;
  icon: typeof Home;
};

const navItems: SiteNavItem[] = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Scripture', href: '/scripture', icon: BookOpen },
  { label: 'Project 52', href: '/project52', icon: CalendarDays },
  { label: 'Media', href: '/media', icon: PlayCircle },
  { label: 'Ministries', href: '/ministries', icon: Users },
  { label: 'About', href: '/about', icon: Info },
  { label: 'Contact', href: '/contact', icon: Phone },
];
const giveNavItem: SiteNavItem = { label: 'Give', href: '/give', icon: Heart };
const mobileNavSections: { title: string; items: SiteNavItem[] }[] = [
  {
    title: 'Explore',
    items: [
      { label: 'Home', href: '/', icon: Home },
      { label: 'About', href: '/about', icon: Info },
      { label: 'Contact', href: '/contact', icon: Phone },
    ],
  },
  {
    title: 'Spiritual Growth',
    items: [
      { label: 'Scripture', href: '/scripture', icon: BookOpen },
      { label: 'Project 52', href: '/project52', icon: CalendarDays },
      { label: 'Media', href: '/media', icon: PlayCircle },
    ],
  },
  {
    title: 'Community',
    items: [
      { label: 'Ministries', href: '/ministries', icon: Users },
      { label: 'Events', href: '#', icon: CalendarDays },
    ],
  },
  {
    title: 'Actions',
    items: [
      giveNavItem,
      { label: 'Watch Live', href: '/media', icon: Radio },
    ],
  },
];

const churchWebsiteUrl = 'https://aicnjoro.org';
const isRouteHref = (href: string) => href.startsWith('/');

const SiteNavigation = ({
  activePath,
  darkMode,
  layout,
  onToggleTheme,
  sticky = true,
}: SiteNavigationProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const compactSmallHeader = useCompactHeader(layout === 'top');
  const isActive = (href: string) => href === activePath;
  const getNavItemClass = (active: boolean, shape: 'side' | 'top' | 'drawer') => {
    const shapeClass = {
      side: 'flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-bold transition',
      top: 'inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-bold transition',
      drawer: 'flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-bold transition',
    }[shape];
    const stateClass = active
      ? 'bg-red-800 text-white shadow-md shadow-red-950/20'
      : darkMode
        ? 'text-stone-300 hover:bg-white/10'
        : 'text-zinc-700 hover:bg-white';

    return `${shapeClass} ${stateClass}`;
  };
  const renderNavItem = (
    { href, icon: Icon, label }: SiteNavItem,
    shape: 'side' | 'top' | 'drawer',
    onClick?: () => void,
  ) => {
    if (isRouteHref(href)) {
      return (
        <NavLink
          key={label}
          to={href}
          end={href === '/'}
          onClick={onClick}
          className={({ isActive: routeActive }) => getNavItemClass(routeActive, shape)}
        >
          {shape !== 'top' && <Icon size={shape === 'drawer' ? 18 : 17} />}
          {label}
        </NavLink>
      );
    }

    return (
      <a key={label} href={href} onClick={onClick} className={getNavItemClass(isActive(href), shape)}>
        {shape !== 'top' && <Icon size={shape === 'drawer' ? 18 : 17} />}
        {label}
      </a>
    );
  };
  const renderGiveButton = (shape: 'side' | 'top' | 'drawer', onClick?: () => void) => (
    <NavLink
      key={giveNavItem.label}
      to={giveNavItem.href}
      onClick={onClick}
      className={({ isActive: routeActive }) => {
        const shapeClass = {
          side: 'flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-bold transition',
          top: 'inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-black transition hover:-translate-y-0.5',
          drawer: 'flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-black transition',
        }[shape];
        const stateClass = routeActive
          ? 'bg-red-700 text-white shadow-md shadow-red-950/25'
          : 'bg-red-800 text-white shadow-md shadow-red-950/20 hover:bg-red-700';

        return `${shapeClass} ${stateClass}`;
      }}
    >
      <Heart size={shape === 'top' ? 16 : shape === 'drawer' ? 18 : 17} />
      {giveNavItem.label}
    </NavLink>
  );
  const renderMobileSectionTitle = (title: string) => (
    <p
      id={`mobile-nav-${title.toLowerCase().replace(/\s+/g, '-')}`}
      className={`mb-2 px-2 text-[11px] font-black uppercase tracking-[0.16em] ${
        darkMode ? 'text-stone-500' : 'text-zinc-500'
      }`}
    >
      {title}
    </p>
  );
  const mobileUtilityItemClass = `flex min-h-12 w-full items-center gap-3 rounded-2xl px-4 text-left text-sm font-bold transition ${
    darkMode ? 'text-stone-300 hover:bg-white/10' : 'text-zinc-700 hover:bg-white'
  }`;
  const mobileNestedUtilityItemClass = `ml-6 flex min-h-11 w-[calc(100%-1.5rem)] items-center gap-3 rounded-2xl px-4 text-left text-sm font-bold transition ${
    darkMode ? 'text-stone-300 hover:bg-white/10' : 'text-zinc-700 hover:bg-white'
  }`;

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
          {navItems.map((item) => renderNavItem(item, 'side'))}
          {renderGiveButton('side')}
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
      <div
        className={`pointer-events-none fixed inset-x-0 top-0 z-[60] flex items-center justify-between px-4 py-3 transition-all duration-300 ease-out md:hidden ${
          drawerOpen
            ? '-translate-y-3 opacity-0'
            : compactSmallHeader
              ? 'translate-y-0 opacity-100'
              : '-translate-y-3 opacity-0'
        }`}
        aria-hidden={!compactSmallHeader || drawerOpen}
      >
          <a
            href={churchWebsiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${compactSmallHeader ? 'pointer-events-auto' : 'pointer-events-none'} rounded-2xl transition-transform duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-red-700`}
            aria-label="Open the AIC Njoro Town website"
          >
            <img
              src={assetPaths.circleLogo}
              alt=""
              className={`size-11 rounded-2xl border object-contain p-1 shadow-md ${
                darkMode ? 'border-red-400/30 bg-white' : 'border-red-900/15 bg-white'
              }`}
            />
          </a>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className={`${compactSmallHeader ? 'pointer-events-auto' : 'pointer-events-none'} grid size-11 shrink-0 place-items-center rounded-full border shadow-lg backdrop-blur-xl transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 ${
              darkMode
                ? 'border-white/15 bg-white/10 text-stone-100 shadow-black/25 focus:ring-offset-black hover:bg-white/15'
                : 'border-black/10 bg-white/70 text-zinc-900 shadow-zinc-900/15 focus:ring-offset-[#f8f5ef] hover:bg-white/85'
            }`}
            aria-label="Open navigation menu"
          >
            <Menu size={21} />
          </button>
        </div>
      <header
        className={`${sticky ? 'sticky top-0' : 'relative'} z-30 border-b backdrop-blur-xl transition-all duration-300 ease-out ${
        drawerOpen
          ? 'max-md:max-h-0 max-md:-translate-y-full max-md:overflow-hidden max-md:border-b-0 max-md:opacity-0'
          : compactSmallHeader
            ? 'max-md:max-h-0 max-md:-translate-y-full max-md:overflow-hidden max-md:border-b-0 max-md:opacity-0'
            : 'max-md:max-h-24 max-md:translate-y-0 max-md:opacity-100'
      } ${
        darkMode ? 'border-white/10 bg-black/75' : 'border-black/10 bg-[#f8f5ef]/85'
      }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
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
            <p className="truncate text-lg font-extrabold leading-tight sm:text-xl">A.I.C Njoro Town</p>
            <p className={`truncate font-serif text-xs sm:text-sm ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
              Oh Come Let Us Worship - Psalm 95:6
            </p>
          </div>
        </a>
        <div className="flex shrink-0 items-center gap-3">
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Site navigation">
            {navItems.map((item) => renderNavItem(item, 'top'))}
          </nav>
          <div className="hidden lg:block">{renderGiveButton('top')}</div>
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
            aria-hidden={compactSmallHeader || drawerOpen}
            tabIndex={compactSmallHeader || drawerOpen ? -1 : undefined}
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
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
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

            <nav className="mt-8 grid gap-6 overflow-y-auto pb-4" aria-label="Mobile site navigation">
              {mobileNavSections.map((section) => (
                <section key={section.title} aria-labelledby={`mobile-nav-${section.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  {renderMobileSectionTitle(section.title)}
                  <div className="grid gap-2">
                    {section.items.map((item) =>
                      item.href === giveNavItem.href
                        ? renderGiveButton('drawer', () => setDrawerOpen(false))
                        : renderNavItem(item, 'drawer', () => setDrawerOpen(false)),
                    )}
                  </div>
                </section>
              ))}

              <section aria-labelledby="mobile-nav-preferences">
                {renderMobileSectionTitle('Preferences')}
                <div className="grid gap-2">
                  <a href="#" className={mobileUtilityItemClass}>
                    <Settings size={18} />
                    Settings
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      onToggleTheme();
                      setDrawerOpen(false);
                    }}
                    className={mobileNestedUtilityItemClass}
                  >
                    {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                    {darkMode ? 'Light theme' : 'Dark theme'}
                  </button>
                  <a href="#" className={mobileUtilityItemClass}>
                    <HelpCircle size={18} />
                    Help
                  </a>
                </div>
              </section>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
};

export default SiteNavigation;
