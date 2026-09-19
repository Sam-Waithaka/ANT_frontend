import { useEffect, useState, type ReactNode } from 'react';
import { CalendarClock, FilePenLine, Images, LayoutDashboard, Menu, Quote, Rocket, Settings2, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import SiteFooter from '../../../../components/navigation/SiteFooter';
import SiteHeader from '../../../../components/navigation/SiteHeader';
import { portalSurface } from '../../../../components/portal/portalSurface';
import { useTheme } from '../../../../hooks/useTheme';
import { useMemorialPortal } from '../hooks/useMemorialPortal';

const MemorialPortalShell = ({ children }: { children: ReactNode }) => {
  const { darkMode, toggleTheme } = useTheme();
  const { loading, memorial, moderation, routes } = useMemorialPortal();
  const [mobileOpen, setMobileOpen] = useState(false);
  const caps = moderation?.capabilities;
  const items = [
    { href: routes.overview, icon: LayoutDashboard, label: 'Overview', visible: true },
    { href: routes.page, icon: Settings2, label: 'Page', visible: Boolean(caps?.page.view) },
    { href: routes.writing, icon: FilePenLine, label: 'Writing', visible: true },
    { href: routes.tributes, icon: Quote, label: 'Tributes', visible: Boolean(caps?.children.tribute.view) },
    { href: routes.timeline, icon: CalendarClock, label: 'Timeline', visible: Boolean(caps?.children.milestone.view) },
    { href: routes.media, icon: Images, label: 'Media', visible: Boolean(caps?.children.media.view || caps?.media.select || caps?.media.upload) },
    { href: routes.arrangements, icon: CalendarClock, label: 'Arrangements', visible: Boolean(caps?.children.service_event.view) },
    { href: routes.review, icon: Rocket, label: 'Review', visible: Boolean(caps?.page.view) },
  ].filter((item) => item.visible);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [mobileOpen]);

  const navigation = (
    <nav aria-label="Memorial workspaces" className="grid gap-1 sm:flex sm:flex-wrap">
      {items.map(({ href, icon: Icon, label }) => (
        <NavLink
          className={({ isActive }) => `inline-flex min-h-11 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-black transition ${isActive ? 'bg-red-800 text-white' : darkMode ? 'text-stone-300 hover:bg-white/10' : 'text-zinc-700 hover:bg-white'}`}
          key={href}
          onClick={() => setMobileOpen(false)}
          to={href}
        >
          <Icon size={16} />{label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className={`flex min-h-screen flex-col ${portalSurface.page(darkMode)}`}>
      <SiteHeader darkMode={darkMode} onToggleTheme={toggleTheme} />
      <main className="flex-1 px-4 py-7 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[92rem]">
          <header className="flex items-start justify-between gap-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800 dark:text-red-200">Memorial</p>
              <h1 className="mt-2 font-serif text-4xl leading-tight sm:text-5xl">{moderation?.page.display_name ?? memorial?.display_name ?? 'Memorial workspace'}</h1>
              <p className={`mt-2 text-sm ${portalSurface.softMutedText(darkMode)}`}>Write, review, approve and publish the memorial with care.</p>
            </div>
            <button aria-expanded={mobileOpen} aria-label="Open memorial navigation" className="grid size-12 place-items-center rounded-full bg-red-800 text-white sm:hidden" onClick={() => setMobileOpen(true)} type="button"><Menu /></button>
          </header>

          <div className={`mt-6 hidden rounded-2xl border p-1.5 shadow-lg sm:block ${portalSurface.nav(darkMode)}`}>{navigation}</div>
          {mobileOpen ? (
            <div className="fixed inset-0 z-50 sm:hidden">
              <button aria-label="Close memorial navigation" className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} type="button" />
              <section className={`absolute inset-x-3 bottom-3 rounded-3xl border p-5 shadow-2xl ${portalSurface.panel(darkMode)}`}>
                <div className="mb-4 flex items-center justify-between"><h2 className="font-serif text-2xl">Memorial workspaces</h2><button aria-label="Close" className="grid size-10 place-items-center rounded-full border border-current/10" onClick={() => setMobileOpen(false)} type="button"><X size={18} /></button></div>
                {navigation}
              </section>
            </div>
          ) : null}
          <div className="mt-7">{loading ? <p className="py-12 text-center text-sm font-bold" role="status">Loading memorial data...</p> : children}</div>
        </div>
      </main>
      <SiteFooter darkMode={darkMode} />
    </div>
  );
};

export default MemorialPortalShell;
