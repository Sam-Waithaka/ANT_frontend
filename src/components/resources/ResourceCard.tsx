import { ArrowRight, BookOpen, Clock3, UsersRound } from 'lucide-react';
import type { ReactNode } from 'react';
import ResponsiveImage from '../media/ResponsiveImage';
import { normalizeMediaAssetForDisplay } from '../../services/mediaAssetsApi';
import type { PublicWritingCard } from '../../types/writing';
import { getEditorialCoverPresentation } from '../../utils/resourceEditorialPresentation';

export type ResourceCardVariant = 'compact' | 'feature' | 'rail';

type ResourceCardProps = {
  article: PublicWritingCard;
  className?: string;
  eyebrow?: string;
  variant?: ResourceCardVariant;
};

const writingHref = (article: PublicWritingCard) => `/resources/${article.slug}`;
const articleAuthor = (article: PublicWritingCard) => article.byline || article.author_display || article.author_attributions?.[0]?.display_name || 'A.I.C Njoro Town';
const articleAccent = (article: PublicWritingCard) => article.resource_type_detail?.name || article.writing_type || 'Resource';

const MetaItem = ({ children, icon: Icon }: { children: ReactNode; icon: typeof Clock3 }) => (
  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-stone-400">
    <Icon size={14} aria-hidden="true" />
    {children}
  </span>
);

const EditorialCover = ({ article, className = '' }: { article: PublicWritingCard; className?: string }) => {
  const presentation = getEditorialCoverPresentation({
    categories: article.categories,
    resourceType: article.resource_type_detail,
    series: article.series,
    title: article.title,
  });
  const { palette, taxonomy } = presentation;
  const resource = taxonomy.find((level) => level.kind === 'resource');
  const category = taxonomy.find((level) => level.kind === 'category');
  const series = taxonomy.find((level) => level.kind === 'series');

  return (
    <div
      aria-label={`${article.title} editorial cover`}
      className={`relative isolate flex min-h-full overflow-hidden ${className}`}
      data-resource-card-cover="editorial"
      style={{
        backgroundColor: palette.paper,
        boxShadow: `inset 0 0 0 1px ${palette.border}, inset 10px 0 0 ${palette.spine}, 0 22px 46px ${palette.glow}`,
        color: palette.text,
      }}
    >
      <div className="absolute inset-0 opacity-[0.18] mix-blend-soft-light bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.8),transparent_18%),radial-gradient(circle_at_80%_80%,rgba(0,0,0,0.6),transparent_24%)]" />
      <div className="absolute inset-0 opacity-[0.10] bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.35)_0,rgba(255,255,255,0.35)_1px,transparent_1px,transparent_5px)]" />
      <div className="absolute inset-y-0 left-5 w-px bg-white/20" />
      <div className="relative z-10 flex min-h-full w-full flex-col p-5 sm:p-6">
        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: palette.text }}>
          <BookOpen size={16} aria-hidden="true" style={{ color: palette.accent }} />
          <span>{resource?.label || articleAccent(article)}</span>
        </div>
        <div className="mt-7 h-px w-10" style={{ backgroundColor: palette.accent }} />
        {category ? <div className="mt-5 font-serif text-base leading-snug" style={{ color: palette.accent }}>{category.label}</div> : null}
        {series ? <div className="mt-3 text-[11px] font-black uppercase tracking-[0.18em] opacity-80">{series.label}</div> : null}
        <h3 className="mt-5 max-w-[15rem] font-serif text-2xl font-semibold leading-[1.08] tracking-normal sm:text-3xl">
          {article.title}
        </h3>
        {article.excerpt || article.seo_description ? (
          <p className="mt-5 line-clamp-3 max-w-[14rem] text-sm leading-6 opacity-85">{article.excerpt || article.seo_description}</p>
        ) : null}
        <div className="mt-auto pt-8">
          <div className="h-px w-full bg-white/20" />
          <div className="mt-4 grid gap-2 text-xs font-semibold opacity-90">
            <span>{article.reading_time_minutes || 1} min read</span>
            <span>{articleAuthor(article)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const PhotographyCover = ({ article, className = '' }: { article: PublicWritingCard; className?: string }) => {
  const responsiveAsset = normalizeMediaAssetForDisplay(article.og_image_detail);

  return (
    <div className={`relative overflow-hidden bg-stone-900 ${className}`} data-resource-card-cover="photography">
      {responsiveAsset ? <ResponsiveImage alt="" asset={responsiveAsset} className="absolute inset-0 size-full object-cover" preset="card" /> : null}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(255,255,255,0.34),transparent_20%),linear-gradient(180deg,transparent,rgba(0,0,0,0.58))]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(150deg,transparent_18%,rgba(255,255,255,0.16)_19%,transparent_20%,transparent_32%,rgba(255,255,255,0.11)_33%,transparent_34%)]" />
    </div>
  );
};

const Cover = ({ article, className = '' }: { article: PublicWritingCard; className?: string }) => {
  const hasCover = Boolean(normalizeMediaAssetForDisplay(article.og_image_detail));
  return hasCover ? <PhotographyCover article={article} className={className} /> : <EditorialCover article={article} className={className} />;
};

const ResourceCard = ({ article, className = '', eyebrow, variant = 'compact' }: ResourceCardProps) => {
  if (variant === 'feature') {
    return (
      <a href={writingHref(article)} className={`grid overflow-hidden rounded-3xl border border-black/10 bg-white shadow-2xl shadow-zinc-900/10 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 dark:border-white/10 dark:bg-zinc-950 dark:shadow-black/30 lg:grid-cols-[1.12fr_0.88fr] ${className}`}>
        <Cover article={article} className="min-h-72 lg:min-h-[23rem]" />
        <span className="flex flex-col justify-between p-6 sm:p-8">
          <span>
            <span className="text-xs font-black uppercase tracking-[0.18em] text-red-800 dark:text-red-200">{eyebrow || 'Featured Resource'}</span>
            <span className="mt-4 block max-w-sm text-3xl font-extrabold leading-tight tracking-normal text-zinc-950 dark:text-stone-100 sm:text-4xl">{article.title}</span>
            <span className="mt-5 block max-w-sm text-base leading-7 text-zinc-600 dark:text-stone-300">{article.excerpt || article.seo_description}</span>
          </span>
          <span className="mt-7 border-t border-black/10 pt-5 dark:border-white/10">
            <span className="flex flex-wrap gap-x-6 gap-y-3">
              <MetaItem icon={Clock3}>{article.reading_time_minutes || 1} min read</MetaItem>
              <MetaItem icon={UsersRound}>{articleAuthor(article)}</MetaItem>
            </span>
            <span className="mt-7 inline-flex items-center gap-2 text-sm font-black text-red-800 dark:text-red-100">
              Read Article
              <ArrowRight size={15} aria-hidden="true" />
            </span>
          </span>
        </span>
      </a>
    );
  }

  if (variant === 'rail') {
    return (
      <a href={writingHref(article)} className={`grid min-w-0 grid-cols-[8.5rem_1fr] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg shadow-zinc-900/5 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 dark:border-white/10 dark:bg-zinc-950 dark:shadow-black/25 ${className}`}>
        <Cover article={article} className="min-h-[10rem]" />
        <span className="min-w-0 p-5">
          <span className="text-[11px] font-black uppercase tracking-[0.16em] text-red-800 dark:text-red-200">{eyebrow || articleAccent(article)}</span>
          <span className="mt-3 block text-lg font-black leading-snug tracking-normal text-zinc-950 dark:text-stone-100">{article.title}</span>
          <span className="mt-4 grid gap-2">
            <MetaItem icon={Clock3}>{article.reading_time_minutes || 1} min read</MetaItem>
            <MetaItem icon={UsersRound}>{articleAuthor(article)}</MetaItem>
          </span>
        </span>
      </a>
    );
  }

  return (
    <a href={writingHref(article)} className={`grid min-w-0 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg shadow-zinc-900/5 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 dark:border-white/10 dark:bg-zinc-950 dark:shadow-black/25 sm:grid-cols-[9rem_1fr] ${className}`}>
      <Cover article={article} className="min-h-44 sm:min-h-full" />
      <span className="min-w-0 p-5">
        <span className="text-[11px] font-black uppercase tracking-[0.16em] text-red-800 dark:text-red-200">{eyebrow || articleAccent(article)}</span>
        <span className="mt-3 block text-xl font-black leading-snug tracking-normal text-zinc-950 dark:text-stone-100">{article.title}</span>
        <span className="mt-3 line-clamp-2 block text-sm leading-6 text-zinc-600 dark:text-stone-400">{article.excerpt || article.seo_description || 'Read this writing from the church library.'}</span>
        <span className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          <MetaItem icon={Clock3}>{article.reading_time_minutes || 1} min read</MetaItem>
          <MetaItem icon={UsersRound}>{articleAuthor(article)}</MetaItem>
        </span>
      </span>
    </a>
  );
};

export default ResourceCard;
