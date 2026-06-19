import type { ReactNode } from 'react';
import { BookOpen, ClipboardList, FileText, FolderOpen, LayoutDashboard, PenLine } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import SiteFooter from '../../SiteFooter';
import SiteHeader from '../../SiteHeader';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import {
  canAccessWritingStudio,
  canCreateWriting,
  canManageAssignments,
  canManageTaxonomy,
  canPublishWriting,
  canViewAnyDrafts,
} from '../../../utils/permissions';
import WritingAccessDenied from './WritingAccessDenied';

type WritingStudioShellProps = {
  children: ReactNode;
  intro?: ReactNode;
};

const navItems = [
  { href: '/portal/writing', icon: LayoutDashboard, label: 'Overview', show: () => true },
  { href: '/portal/writing/articles', icon: FileText, label: 'Articles', show: () => true },
  { href: '/portal/writing/new', icon: PenLine, label: 'New Article', show: canCreateWriting },
  { href: '/portal/writing/library', icon: FolderOpen, label: 'Library', show: canManageTaxonomy },
  {
    href: '/portal/writing/editorial',
    icon: BookOpen,
    label: 'Editorial',
    show: (permissions: string[]) => canViewAnyDrafts(permissions) || canPublishWriting(permissions),
  },
  { href: '/portal/writing/assignments', icon: ClipboardList, label: 'Assignments', show: canManageAssignments },
];

const WritingStudioShell = ({ children, intro }: WritingStudioShellProps) => {
  const { darkMode, toggleTheme } = useTheme();
  const auth = useAuth();

  if (!canAccessWritingStudio(auth.permissions)) {
    return <WritingAccessDenied />;
  }

  const visibleNav = navItems.filter((item) => item.show(auth.permissions));

  return (
    <div className={`flex min-h-screen flex-col overflow-x-clip transition-colors duration-500 ${darkMode ? 'bg-[#080808] text-stone-100' : 'bg-[#f8f5ef] text-zinc-950'}`}>
      <SiteHeader darkMode={darkMode} onToggleTheme={toggleTheme} />

      <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-7xl">
          {intro ?? (
            <div className="max-w-4xl">
              <p className={`text-xs font-black uppercase tracking-[0.18em] ${darkMode ? 'text-red-100' : 'text-red-800'}`}>
                Writing Studio
              </p>
              <h1 className="mt-5 font-serif text-5xl leading-tight sm:text-6xl">
                Create. Review. <span className="text-red-800">Publish.</span> Curate.
              </h1>
              <p className={`mt-5 max-w-2xl text-lg leading-8 ${darkMode ? 'text-stone-300' : 'text-zinc-700'}`}>
                Build resources that strengthen the church, equip believers, and point people to Christ.
              </p>
            </div>
          )}

          <nav className={`mt-10 overflow-x-auto rounded-3xl border p-2 shadow-lg ${darkMode ? 'border-white/10 bg-zinc-950' : 'border-black/10 bg-white'}`}>
            <div className="flex min-w-max gap-2">
              {visibleNav.map(({ href, icon: Icon, label }) => (
                <NavLink
                  key={href}
                  to={href}
                  end={href === '/portal/writing'}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition ${
                      isActive
                        ? 'bg-red-800 text-white shadow-md shadow-red-950/20'
                        : darkMode
                          ? 'text-stone-300 hover:bg-white/10'
                          : 'text-zinc-700 hover:bg-red-950/5'
                    }`
                  }
                >
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}
            </div>
          </nav>

          <div className="mt-8">{children}</div>
        </section>
      </main>

      <SiteFooter darkMode={darkMode} />
    </div>
  );
};

export default WritingStudioShell;
