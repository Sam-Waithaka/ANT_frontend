import { Clock, PenLine, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Writing } from '../../../types/writing';
import { portalSurface } from '../portalSurface';
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
    className={`group block rounded-3xl border p-5 shadow-lg transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 ${portalSurface.card(darkMode)}`}
  >
    <div className="flex flex-wrap items-center gap-3">
      <WritingStatusBadge status={writing.status} />
      {writing.featured_at ? <span className="text-xs font-bold text-red-800">Featured</span> : null}
    </div>
    <h3 className="mt-5 font-serif text-2xl leading-tight">{writing.title || 'Untitled resource'}</h3>
    <p className={`mt-3 line-clamp-2 text-sm leading-6 ${portalSurface.softMutedText(darkMode)}`}>
      {writing.excerpt || 'No excerpt has been added yet.'}
    </p>
    <div className={`mt-5 grid gap-2 text-xs ${portalSurface.softMutedText(darkMode)}`}>
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
