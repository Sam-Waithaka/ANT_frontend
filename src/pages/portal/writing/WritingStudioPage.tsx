import { BookOpen, FileText, FolderOpen, PenLine, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import WritingStudioShell from '../../../components/portal/writing/WritingStudioShell';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import {
  canCreateWriting,
  canManageTaxonomy,
  canPublishWriting,
  canViewAnyDrafts,
} from '../../../utils/permissions';

const allCards = [
  {
    description: 'Return to recent resource drafts and continue shaping them for the church.',
    href: '/portal/writing/articles?status=DRAFT',
    icon: PenLine,
    label: 'Continue Draft',
    show: () => true,
  },
  {
    description: 'Begin a devotional, Bible study, pastoral letter, guide, or ministry charter.',
    href: '/portal/writing/new',
    icon: Send,
    label: 'New Article',
    show: canCreateWriting,
  },
  {
    description: 'Search, filter, review, and maintain the full Library writing queue.',
    href: '/portal/writing/articles',
    icon: FileText,
    label: 'Articles',
    show: () => true,
  },
  {
    description: 'Organize resource types, categories, collections, and future tags.',
    href: '/portal/writing/library',
    icon: FolderOpen,
    label: 'Library',
    show: canManageTaxonomy,
  },
  {
    description: 'Review drafts, scheduled writings, featured resources, and published work.',
    href: '/portal/writing/editorial',
    icon: BookOpen,
    label: 'Editorial',
    show: (permissions: string[]) => canViewAnyDrafts(permissions) || canPublishWriting(permissions),
  },
];

const WritingStudioPage = () => {
  const auth = useAuth();
  const { darkMode } = useTheme();
  const cards = allCards.filter((card) => card.show(auth.permissions));

  return (
    <WritingStudioShell>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ description, href, icon: Icon, label }) => (
          <Link
            key={label}
            to={href}
            className={`group rounded-3xl border p-6 shadow-lg transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 ${
              darkMode
                ? 'border-white/10 bg-zinc-950 shadow-black/25 hover:bg-white/[0.04]'
                : 'border-black/10 bg-white shadow-zinc-900/5 hover:bg-[#fffaf0]'
            }`}
          >
            <span className={`grid size-12 place-items-center rounded-2xl ${darkMode ? 'bg-white/10 text-red-100' : 'bg-red-950/5 text-red-800'}`}>
              <Icon size={22} />
            </span>
            <h2 className="mt-5 text-xl font-black">{label}</h2>
            <p className={`mt-3 text-sm leading-6 ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>{description}</p>
          </Link>
        ))}
      </div>
    </WritingStudioShell>
  );
};

export default WritingStudioPage;

