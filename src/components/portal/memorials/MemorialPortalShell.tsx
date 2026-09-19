import type { ReactNode } from 'react';
import { Archive, Heart, LayoutDashboard } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import SiteFooter from '../../navigation/SiteFooter';
import SiteHeader from '../../navigation/SiteHeader';
import { useTheme } from '../../../hooks/useTheme';
import { portalSurface } from '../portalSurface';

type MemorialPortalShellProps = {
  actions?: ReactNode;
  children: ReactNode;
  compact?: boolean;
  intro?: ReactNode;
};

const navItems = [
  {
    end: false,
    href: '/portal/memorials',
    icon: LayoutDashboard,
    label: 'Overview',
  },
];

const MemorialPortalShell = ({
  actions,
  children,
  compact = false,
  intro,
}: MemorialPortalShellProps) => {
  const { darkMode, toggleTheme } = useTheme();
  const navSurfaceClass = darkMode
    ? 'border-white/10 bg-zinc-950/90 shadow-black/25'
    : 'border-[#eaded0] bg-[#fffaf0]/95 shadow-zinc-900/5';

  return (
    <div
      className={`flex min-h-screen flex-col overflow-x-clip transition-colors duration-500 ${portalSurface.page(darkMode)}`}
    >
      <SiteHeader darkMode={darkMode} onToggleTheme={toggleTheme} />
      <main className={`flex-1 px-4 sm:px-6 lg:px-8 ${compact ? 'py-6 sm:py-8' : 'py-10'}`}>
        <section className="w-full">
          {!compact && (intro ?? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="max-w-4xl">
                <p className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] ${darkMode ? 'text-red-100' : 'text-red-800'}`}>
                  <Heart size={15} aria-hidden="true" />
                  Memorial Portal
                </p>
                <h1 className="mt-5 font-serif text-5xl leading-tight sm:text-6xl">
                  Honor. Curate. Publish.
                </h1>
                <p className={`mt-5 max-w-2xl text-lg leading-8 ${portalSurface.mutedText(darkMode)}`}>
                  A dedicated workspace for memorial pages, tributes, recordings, arrangements, and the stories entrusted to the church.
                </p>
              </div>
              {actions ? <div className="flex flex-wrap gap-3 lg:justify-end">{actions}</div> : null}
            </div>
          ))}

          <nav
            aria-label="Memorial Portal sections"
            className={`${compact ? '' : 'mt-10'} overflow-x-auto`}
          >
            <div className={`inline-flex min-w-max items-center gap-1 rounded-2xl border p-1.5 shadow-lg ${navSurfaceClass}`}>
              {navItems.map(({ end, href, icon: Icon, label }) => (
                <NavLink
                  className={({ isActive }) => `inline-flex min-h-10 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-black transition focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 ${
                    isActive
                      ? 'bg-red-800 text-white shadow-md shadow-red-950/20 focus:ring-offset-[#fffaf0]'
                      : darkMode
                        ? 'text-stone-300 hover:bg-white/10 hover:text-stone-100 focus:ring-offset-[#080808]'
                        : 'text-zinc-700 hover:bg-white hover:text-zinc-950 focus:ring-offset-[#f8f1e7]'
                  }`}
                  end={end}
                  key={href}
                  to={href}
                >
                  <Icon size={15} aria-hidden="true" />
                  {label}
                </NavLink>
              ))}
            </div>
          </nav>

          <div className={compact ? 'mt-6' : 'mt-8'}>{children}</div>
        </section>
      </main>
      <SiteFooter darkMode={darkMode} />
    </div>
  );
};

export const MemorialPortalEmptyState = ({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) => {
  const { darkMode } = useTheme();

  return (
    <section
      className={`rounded-3xl border p-8 text-center shadow-lg ${portalSurface.panel(darkMode)}`}
    >
      <span className={`mx-auto grid size-14 place-items-center rounded-2xl ${portalSurface.iconBadge(darkMode)}`}>
        <Archive size={22} aria-hidden="true" />
      </span>
      <h2 className="mt-5 font-serif text-3xl leading-tight">{title}</h2>
      <div className={`mx-auto mt-3 max-w-2xl text-sm leading-6 ${portalSurface.softMutedText(darkMode)}`}>
        {children}
      </div>
    </section>
  );
};

export default MemorialPortalShell;
