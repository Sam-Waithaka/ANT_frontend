import { ArrowRight, Clock3, UsersRound } from 'lucide-react';
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
  presentation?: 'default' | 'hero';
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
  const title = taxonomy.find((level) => level.kind === 'article')?.label || article.title;
  const description = article.excerpt || article.seo_description;

  return (
    <div
      aria-label={`${article.title} editorial cover`}
      className={`relative isolate flex min-h-full overflow-hidden rounded-[1.15rem] ${className}`}
      data-editorial-book-object="true"
      data-resource-card-cover="editorial"
      style={{
        backgroundColor: palette.paper,
        backgroundImage: [
          'linear-gradient(90deg, rgba(0,0,0,0.18), transparent 7%, transparent 92%, rgba(0,0,0,0.12))',
          'repeating-linear-gradient(90deg, rgba(255,255,255,0.038) 0, rgba(255,255,255,0.038) 1px, transparent 1px, transparent 5px)',
          'repeating-linear-gradient(0deg, rgba(0,0,0,0.026) 0, rgba(0,0,0,0.026) 1px, transparent 1px, transparent 6px)',
        ].join(', '),
        boxShadow: `inset 0 0 0 1px ${palette.border}, inset 0 1px 0 rgba(255,255,255,0.12), inset 18px 0 24px rgba(0,0,0,0.22), 0 18px 36px ${palette.glow}`,
        color: palette.text,
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-7 sm:w-8"
        style={{
          background: `linear-gradient(90deg, rgba(0,0,0,0.24), ${palette.spine} 38%, rgba(255,255,255,0.08) 58%, transparent)`,
          boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.12), inset 1px 0 0 rgba(0,0,0,0.34)',
        }}
      />
      <div aria-hidden="true" className="absolute inset-y-0 left-6 w-px bg-white/16 sm:left-7" />
      <div aria-hidden="true" className="absolute inset-y-0 left-9 w-px bg-black/24 sm:left-10" />
      <div aria-hidden="true" className="absolute inset-x-4 top-4 h-px bg-white/12" />
      <div aria-hidden="true" className="absolute inset-x-4 bottom-4 h-px bg-black/18" />

      <div className="relative z-10 flex min-h-full w-full flex-col px-5 py-6 pl-11 sm:px-7 sm:py-8 sm:pl-14">
        <div className="max-w-[13rem] text-[10px] font-black uppercase leading-[1.15] tracking-[0.24em] sm:text-[11px]" style={{ color: palette.text }}>
          {resource?.label || articleAccent(article)}
        </div>

        <div className="mt-6 h-px w-10 sm:mt-7" style={{ backgroundColor: palette.accent }} />

        {category ? (
          <div className="mt-4 max-w-[13rem] font-serif text-base leading-snug sm:mt-5 sm:text-lg" style={{ color: palette.accent }}>
            {category.label}
          </div>
        ) : null}

        {series ? (
          <div className="mt-4 max-w-[13rem] text-[9px] font-black uppercase leading-[1.35] tracking-[0.2em] opacity-90 sm:text-[10px]">
            {series.label}
          </div>
        ) : null}

        <div className="mt-4 h-px w-9 sm:mt-5" style={{ backgroundColor: palette.accent }} />

        <h3 className="mt-4 max-w-[14rem] font-serif text-[1.65rem] font-semibold leading-[1.04] tracking-[-0.02em] sm:text-[2rem]">
          {title}
        </h3>

        {description ? (
          <p className="mt-5 line-clamp-4 max-w-[14rem] text-xs font-medium leading-5 opacity-86 sm:text-sm sm:leading-6">
            {description}
          </p>
        ) : null}

        <div className="mt-auto pt-8">
          <div className="h-px w-full bg-white/18" />
          <div className="mt-4 grid gap-2 text-xs font-bold opacity-92">
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

const hasArticleCover = (article: PublicWritingCard) => Boolean(normalizeMediaAssetForDisplay(article.og_image_detail));

const Cover = ({ article, className = '' }: { article: PublicWritingCard; className?: string }) => (
  hasArticleCover(article) ? <PhotographyCover article={article} className={className} /> : <EditorialCover article={article} className={className} />
);

const ResourceCard = ({ article, className = '', eyebrow, presentation = 'default', variant = 'compact' }: ResourceCardProps) => {
  const hasCover = hasArticleCover(article);
  const isHero = presentation === 'hero';

  if (variant === 'feature') {
    return (
      <a href={writingHref(article)} className={`grid overflow-hidden rounded-3xl border border-[#eaded0] bg-white shadow-2xl shadow-zinc-900/10 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 dark:border-[#3a2b20] dark:bg-[#1a1510] dark:shadow-black/50 lg:grid-cols-[1.12fr_0.88fr] ${!hasCover ? (isHero ? 'lg:grid-cols-[minmax(24rem,0.86fr)_minmax(0,1fr)]' : 'lg:grid-cols-[minmax(22rem,0.92fr)_minmax(0,0.78fr)]') : ''} ${className}`}>
        <Cover article={article} className={hasCover ? 'min-h-72 lg:min-h-[23rem]' : (isHero ? 'min-h-[30rem] lg:min-h-[36rem]' : 'min-h-[28rem] lg:min-h-[32rem]')} />
        <span className={`flex flex-col justify-between p-6 sm:p-8 ${isHero && !hasCover ? 'lg:p-10' : ''}`}>
          <span>
            <span className="text-xs font-black uppercase tracking-[0.18em] text-red-800 dark:text-red-200">{eyebrow || 'Featured Resource'}</span>
            <span className={`mt-4 block max-w-sm font-extrabold leading-tight tracking-normal text-zinc-950 dark:text-stone-100 ${isHero && !hasCover ? 'text-4xl sm:text-5xl' : 'text-3xl sm:text-4xl'}`}>{article.title}</span>
            <span className={`mt-5 block max-w-sm text-zinc-600 dark:text-stone-300 ${isHero && !hasCover ? 'text-lg leading-8' : 'text-base leading-7'}`}>{article.excerpt || article.seo_description}</span>
          </span>
          <span className="mt-7 border-t border-black/10 pt-5 dark:border-[#3a2b20]">
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
      <a href={writingHref(article)} className={`grid min-w-0 grid-cols-[8.5rem_1fr] overflow-hidden sm:grid-cols-[11rem_1fr] rounded-2xl border border-[#eaded0] bg-white shadow-lg shadow-zinc-900/5 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 dark:border-[#3a2b20] dark:bg-[#1a1510] dark:shadow-black/45 ${!hasCover ? 'grid-cols-[13rem_1fr] sm:grid-cols-[16rem_1fr]' : ''} ${className}`}>
        <Cover article={article} className={hasCover ? 'min-h-[13rem] sm:min-h-[15rem]' : 'min-h-[22rem] sm:min-h-[25rem]'} />
        <span className="min-w-0 p-5 sm:p-6">
          <span className="text-[11px] font-black uppercase tracking-[0.16em] text-red-800 dark:text-red-200">{eyebrow || articleAccent(article)}</span>
          <span className="mt-3 block text-xl font-black leading-snug tracking-normal text-zinc-950 dark:text-stone-100 sm:text-2xl">{article.title}</span>
          <span className="mt-4 grid gap-2">
            <MetaItem icon={Clock3}>{article.reading_time_minutes || 1} min read</MetaItem>
            <MetaItem icon={UsersRound}>{articleAuthor(article)}</MetaItem>
          </span>
        </span>
      </a>
    );
  }

  return (
    <a href={writingHref(article)} className={`grid min-w-0 overflow-hidden rounded-2xl border border-[#eaded0] bg-white shadow-lg shadow-zinc-900/5 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 dark:border-[#3a2b20] dark:bg-[#1a1510] dark:shadow-black/45 sm:grid-cols-[9rem_1fr] ${!hasCover ? 'sm:grid-cols-[17rem_1fr]' : ''} ${className}`}>
      <Cover article={article} className={hasCover ? 'min-h-44 sm:min-h-full' : 'min-h-[22rem] sm:min-h-full'} />
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
