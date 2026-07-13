import type { ReactNode } from 'react';
import { BookOpen, FileText, FolderOpen, LayoutDashboard, PenLine } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import SiteFooter from '../../SiteFooter';
import SiteHeader from '../../SiteHeader';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import {
  canAccessWritingStudio,
  canCreateWriting,
  canManageTaxonomy,
  canPublishWriting,
  canReviewWriting,
  canViewAnyDrafts,
} from '../../../utils/permissions';
import { portalSurface } from '../portalSurface';
import WritingAccessDenied from './WritingAccessDenied';

type WritingStudioShellProps = {
  children: ReactNode;
  compact?: boolean;
  hideNavigation?: boolean;
  intro?: ReactNode;
};

const canViewEditorial = (permissions: string[]) =>
  canReviewWriting(permissions) || canViewAnyDrafts(permissions) || canPublishWriting(permissions);

const navItems = [
  { href: '/portal/writing', icon: LayoutDashboard, label: 'Overview', show: () => true },
  { href: '/portal/writing/articles', icon: FileText, label: 'Articles', show: () => true },
  { href: '/portal/writing/new', icon: PenLine, label: 'New Article', show: canCreateWriting },
  { href: '/portal/writing/library', icon: FolderOpen, label: 'Library', show: canManageTaxonomy },
  { href: '/portal/writing/editorial', icon: BookOpen, label: 'Editorial', show: canViewEditorial },
];

const WritingStudioShell = ({ children, compact = false, hideNavigation = false, intro }: WritingStudioShellProps) => {
  const { darkMode, toggleTheme } = useTheme();
  const auth = useAuth();

  if (!canAccessWritingStudio(auth.permissions)) return <WritingAccessDenied />;

  const visibleNav = navItems.filter((item) => item.show(auth.permissions));
  const navSurfaceClass = darkMode
    ? 'border-white/10 bg-zinc-950/90 shadow-black/25'
    : 'border-[#eaded0] bg-[#fffaf0]/95 shadow-zinc-900/5';

  return (
    <div className={`flex min-h-screen flex-col overflow-x-clip transition-colors duration-500 ${portalSurface.page(darkMode)}`}>
      <SiteHeader darkMode={darkMode} onToggleTheme={toggleTheme} />
      <main className={`flex-1 px-4 sm:px-6 lg:px-8 ${compact ? 'py-6 sm:py-8' : 'py-10'}`}>
        <section className="w-full">
          {!compact && (intro ?? (
            <div className="max-w-4xl">
              <p className={`text-xs font-black uppercase tracking-[0.18em] ${darkMode ? 'text-red-100' : 'text-red-800'}`}>Writing Studio</p>
              <h1 className="mt-5 font-serif text-5xl leading-tight sm:text-6xl">Create. Review. <span className="text-red-800">Publish.</span> Curate.</h1>
              <p className={`mt-5 max-w-2xl text-lg leading-8 ${portalSurface.mutedText(darkMode)}`}>Build resources that strengthen the church, equip believers, and point people to Christ.</p>
            </div>
          ))}

          {!hideNavigation ? (
            <nav aria-label="Writing Studio sections" className={`${compact ? '' : 'mt-10'} -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0`}>
              <div className={`inline-flex min-w-max items-center gap-1 rounded-2xl border p-1.5 shadow-lg ${navSurfaceClass}`}>
                {visibleNav.map(({ href, icon: Icon, label }) => (
                  <NavLink
                    key={href}
                    to={href}
                    end={href === '/portal/writing'}
                    className={({ isActive }) => `inline-flex min-h-10 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-black transition focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 ${
                      isActive
                        ? 'bg-red-800 text-white shadow-md shadow-red-950/20 focus:ring-offset-[#fffaf0]'
                        : darkMode
                          ? 'text-stone-300 hover:bg-white/10 hover:text-stone-100 focus:ring-offset-[#080808]'
                          : 'text-zinc-700 hover:bg-white hover:text-zinc-950 focus:ring-offset-[#f8f1e7]'
                    }`}
                  >
                    <Icon size={15} />
                    {label}
                  </NavLink>
                ))}
              </div>
            </nav>
          ) : null}

          <div className={hideNavigation ? '' : compact ? 'mt-6' : 'mt-8'}>{children}</div>
        </section>
      </main>
      <SiteFooter darkMode={darkMode} />
    </div>
  );
};

export default WritingStudioShell;
