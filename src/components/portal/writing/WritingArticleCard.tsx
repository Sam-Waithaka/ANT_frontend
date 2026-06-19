import { Clock, PenLine, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Writing } from '../../../types/writing';
import WritingStatusBadge from './WritingStatusBadge';

type WritingArticleCardProps = {
  darkMode: boolean;
  writing: Writing;
};

const getAuthors = (writing: Writing) => {
  const names = writing.author_attributions
    ?.map((author) => author.display_name || author.name)
    .filter(Boolean);

  return names?.length ? names.join(', ') : 'Unassigned';
};

const WritingArticleCard = ({ darkMode, writing }: WritingArticleCardProps) => (
  <Link
    to={`/portal/writing/${writing.id}`}
    className={`group block rounded-3xl border p-5 shadow-lg transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 ${
      darkMode
        ? 'border-white/10 bg-zinc-950 shadow-black/25 hover:bg-white/[0.04]'
        : 'border-black/10 bg-white shadow-zinc-900/5 hover:bg-[#fffaf0]'
    }`}
  >
    <div className="flex flex-wrap items-center gap-3">
      <WritingStatusBadge status={writing.status} />
      {writing.featured_at ? <span className="text-xs font-bold text-red-800">Featured</span> : null}
    </div>
    <h3 className="mt-5 font-serif text-2xl leading-tight">{writing.title || 'Untitled resource'}</h3>
    <p className={`mt-3 line-clamp-2 text-sm leading-6 ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
      {writing.excerpt || 'No excerpt has been added yet.'}
    </p>
    <div className={`mt-5 grid gap-2 text-xs ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
      <span className="flex items-center gap-2">
        <PenLine size={14} /> {writing.resource_type_detail?.name || 'Resource'}
      </span>
      <span className="flex items-center gap-2">
        <Clock size={14} /> {writing.reading_time_minutes || writing.readingTimeMinutes || 0} min read
      </span>
      <span className="flex items-center gap-2">
        <Users size={14} /> {getAuthors(writing)}
      </span>
    </div>
  </Link>
);

export default WritingArticleCard;
