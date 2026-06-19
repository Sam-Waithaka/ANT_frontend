import { BookOpen, FileText, PenLine, PlayCircle, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { canAccessWritingStudio } from '../utils/permissions';

type PortalCard = {
  description: string;
  href: string;
  icon: typeof UserCircle;
  label?: string;
  title: string;
};

const portalCards: PortalCard[] = [
  {
    description: 'Review your contact details and church profile information.',
    href: '/portal#profile',
    icon: UserCircle,
    title: 'Profile',
  },
  {
    description: 'Continue the weekly Bible reading rhythm with Project 52.',
    href: '/project52',
    icon: BookOpen,
    title: 'Project 52',
  },
  {
    description: 'Return to passages and study moments as saved Scripture features grow.',
    href: '/scripture',
    icon: FileText,
    title: 'Saved Scripture',
  },
  {
    description: 'Pick up recent sermons, worship, and church media.',
    href: '/media',
    icon: PlayCircle,
    title: 'Recent Media',
  },
];

const PortalPage = () => {
  const { darkMode, toggleTheme } = useTheme();
  const auth = useAuth();
  const name = [auth.user?.firstName, auth.user?.lastName].filter(Boolean).join(' ') || auth.user?.username || 'Church family';
  const cards: PortalCard[] = canAccessWritingStudio(auth.permissions)
    ? [
        {
          description: 'Create, review, publish, and curate Library resources.',
          href: '/portal/writing',
          icon: PenLine,
          label: 'For website articles and resources',
          title: 'Writing Studio',
        },
        ...portalCards,
      ]
    : portalCards;

  return (
    <div className={`flex min-h-screen flex-col overflow-x-clip transition-colors duration-500 ${darkMode ? 'bg-[#080808] text-stone-100' : 'bg-[#f8f5ef] text-zinc-950'}`}>
      <SiteHeader darkMode={darkMode} onToggleTheme={toggleTheme} />

      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <section className="mx-auto grid max-w-6xl gap-10">
          <div className="max-w-3xl">
            <p className={`text-xs font-black uppercase tracking-[0.18em] ${darkMode ? 'text-red-100' : 'text-red-800'}`}>
              Portal Dashboard
            </p>
            <h1 className="mt-5 font-serif text-5xl leading-tight sm:text-6xl">Welcome, {name}</h1>
            <p className={`mt-5 max-w-2xl text-lg leading-8 ${darkMode ? 'text-stone-300' : 'text-zinc-700'}`}>
              Your church account brings together profile, reading, Scripture, and media touchpoints in one calm place.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(({ description, href, icon: Icon, label, title }) => (
              <Link
                key={title}
                to={href}
                className={`group rounded-3xl border p-5 shadow-lg transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 ${
                  darkMode
                    ? 'border-white/10 bg-zinc-950 text-stone-100 shadow-black/25 hover:bg-white/[0.04]'
                    : 'border-black/10 bg-white text-zinc-950 shadow-zinc-900/5 hover:bg-[#fffaf0]'
                }`}
              >
                <span className={`grid size-12 place-items-center rounded-2xl ${darkMode ? 'bg-white/10 text-red-100' : 'bg-red-950/5 text-red-800'}`}>
                  <Icon size={22} />
                </span>
                {label ? <p className="mt-5 text-[11px] font-black uppercase tracking-[0.16em] text-red-800">{label}</p> : null}
                <h2 className="mt-5 text-xl font-black">{title}</h2>
                <p className={`mt-3 text-sm leading-6 ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>{description}</p>
                {title === 'Writing Studio' ? <span className="mt-5 inline-flex text-sm font-black text-red-800">Open Studio</span> : null}
              </Link>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter darkMode={darkMode} />
    </div>
  );
};

export default PortalPage;
