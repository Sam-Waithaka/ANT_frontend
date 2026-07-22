import { ArrowRight, Clock3, Rss, ScrollText, UsersRound } from 'lucide-react';
import type { ReactNode } from 'react';
import ResourcesCategoryTabs from './ResourcesCategoryTabs';
import ResponsiveImage from '../media/ResponsiveImage';
import SiteButton from '../ui/SiteButton';
import { normalizeMediaAssetForDisplay } from '../../services/mediaAssetsApi';
import type {
  PublicCategoryRail,
  PublicResourceMinistry,
  PublicResourceSeries,
  PublicResourceTypeRail,
  PublicSeriesRail,
  PublicScriptureBook,
  PublicWritingCard,
  ResourcesHome,
  ResourcesNavigation,
} from '../../types/writing';

type ResourcesLandingProps = {
  darkMode: boolean;
  error?: string;
  home: ResourcesHome | null;
  loading: boolean;
  navigation: ResourcesNavigation | null;
};

type ImageBlockProps = {
  asset?: PublicWritingCard['og_image_detail'] | PublicResourceSeries['cover_image_detail'];
  className?: string;
  tone: string;
};

type BrowseItem = {
  count: number;
  href: string;
  icon: typeof ScrollText;
  label: string;
};

const fallbackTones = [
  'from-zinc-950 via-stone-800 to-amber-200',
  'from-stone-950 via-amber-900 to-stone-200',
  'from-zinc-950 via-[#4d3425] to-stone-300',
  'from-zinc-950 via-green-950 to-amber-100',
  'from-zinc-950 via-red-950 to-stone-200',
];

const sectionLabelClass = 'text-xs font-black uppercase tracking-[0.18em] text-red-800 dark:text-red-200';
const heroLabelClass = 'text-sm font-black uppercase tracking-[0.16em] text-red-700';
const centeredSectionHeaderClass = 'shrink-0 text-center text-sm font-black uppercase tracking-[0.16em] text-zinc-950 dark:text-stone-100';

const countLabel = (count?: number) => `${count ?? 0} ${(count ?? 0) === 1 ? 'Article' : 'Articles'}`;
const writingHref = (article: PublicWritingCard) => `/resources/${article.slug}`;
const toneFor = (seed: number | string) => fallbackTones[Math.abs(String(seed).split('').reduce((total, char) => total + char.charCodeAt(0), 0)) % fallbackTones.length];
const articleAccent = (article: PublicWritingCard) => article.resource_type_detail?.name || article.writing_type || 'Resource';
const articleAuthor = (article: PublicWritingCard) => article.byline || article.author_display || article.author_attributions?.[0]?.display_name || 'A.I.C Njoro Town';

const ImageBlock = ({ asset, className = '', tone }: ImageBlockProps) => {
  const responsiveAsset = normalizeMediaAssetForDisplay(asset);

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${tone} ${className}`}>
      {responsiveAsset ? <ResponsiveImage alt="" asset={responsiveAsset} className="absolute inset-0 size-full object-cover" preset="card" /> : null}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(255,255,255,0.46),transparent_20%),linear-gradient(180deg,transparent,rgba(0,0,0,0.52))]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(150deg,transparent_18%,rgba(255,255,255,0.18)_19%,transparent_20%,transparent_32%,rgba(255,255,255,0.12)_33%,transparent_34%)]" />
      <div className="absolute bottom-8 left-1/2 h-16 w-px -translate-x-1/2 bg-white/45" />
      <div className="absolute bottom-8 left-1/2 size-3 -translate-x-1/2 rounded-full border border-white/70" />
      <div className="absolute bottom-0 left-1/2 h-28 w-32 -translate-x-1/2 rounded-t-full bg-black/25 blur-xl" />
    </div>
  );
};

const MetaItem = ({ children, icon: Icon }: { children: ReactNode; icon: typeof Clock3 }) => (
  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-stone-400">
    <Icon size={14} aria-hidden="true" />
    {children}
  </span>
);

const SkeletonBlock = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded-2xl border border-black/10 bg-white/70 shadow-lg shadow-zinc-900/5 dark:border-white/10 dark:bg-white/5 ${className}`} />
);

const EmptyState = ({ children }: { children: ReactNode }) => (
  <div className="rounded-2xl border border-black/10 bg-white/70 p-6 text-sm font-semibold text-zinc-600 shadow-lg shadow-zinc-900/5 dark:border-white/10 dark:bg-white/5 dark:text-stone-400">
    {children}
  </div>
);

const FeaturedArticleCard = ({ article, darkMode, eyebrow = 'Featured Resource', loading }: { article?: PublicWritingCard | null; darkMode: boolean; eyebrow?: string; loading: boolean }) => {
  if (loading) return <SkeletonBlock className="min-h-[28rem] rounded-3xl" />;
  if (!article) {
    return (
      <div className="grid min-h-72 place-items-center rounded-3xl border border-black/10 bg-white/70 p-8 text-center shadow-2xl shadow-zinc-900/10 dark:border-white/10 dark:bg-zinc-950 dark:shadow-black/30 lg:min-h-[23rem]">
        <div>
          <p className={sectionLabelClass}>{eyebrow}</p>
          <h2 className="mt-4 font-serif text-3xl font-bold">No featured resource yet.</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-stone-400">Published featured writings will appear here once they are curated.</p>
        </div>
      </div>
    );
  }

  return (
    <article className="grid overflow-hidden rounded-3xl border border-black/10 bg-white shadow-2xl shadow-zinc-900/10 transition dark:border-white/10 dark:bg-zinc-950 dark:shadow-black/30 lg:grid-cols-[1.12fr_0.88fr]">
      <ImageBlock asset={article.og_image_detail} tone={toneFor(article.slug || article.id)} className="min-h-72 lg:min-h-[23rem]" />
      <div className="flex flex-col justify-between p-6 sm:p-8">
        <div>
          <p className={sectionLabelClass}>{eyebrow}</p>
          <h2 className="mt-4 max-w-sm text-3xl font-extrabold leading-tight tracking-normal text-zinc-950 dark:text-stone-100 sm:text-4xl">
            {article.title}
          </h2>
          <p className="mt-5 max-w-sm text-base leading-7 text-zinc-600 dark:text-stone-300">
            {article.excerpt || article.seo_description}
          </p>
        </div>
        <div className="mt-7 border-t border-black/10 pt-5 dark:border-white/10">
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <MetaItem icon={Clock3}>{article.reading_time_minutes || 1} min read</MetaItem>
            <MetaItem icon={UsersRound}>{articleAuthor(article)}</MetaItem>
          </div>
          <div className="mt-7">
            <SiteButton darkMode={darkMode} href={writingHref(article)} icon={ArrowRight} iconPosition="after" variant="tertiary">
              Read Article
            </SiteButton>
          </div>
        </div>
      </div>
    </article>
  );
};

const ResourceArticleCard = ({ article }: { article: PublicWritingCard }) => (
  <a href={writingHref(article)} className="grid min-w-0 grid-cols-[7rem_1fr] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg shadow-zinc-900/5 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 dark:border-white/10 dark:bg-zinc-950 dark:shadow-black/25">
    <ImageBlock asset={article.og_image_detail} tone={toneFor(article.slug || article.id)} className="min-h-[8.5rem]" />
    <div className="min-w-0 p-5">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-red-800 dark:text-red-200">{articleAccent(article)}</p>
      <h3 className="mt-3 text-lg font-black leading-snug tracking-normal text-zinc-950 dark:text-stone-100">{article.title}</h3>
      <div className="mt-4 grid gap-2">
        <MetaItem icon={Clock3}>{article.reading_time_minutes || 1} min read</MetaItem>
        <MetaItem icon={UsersRound}>{articleAuthor(article)}</MetaItem>
      </div>
    </div>
  </a>
);

const BrowseListCard = ({ emptyText, id, items, title }: { emptyText: string; id?: string; items: BrowseItem[]; title: string }) => (
  <section id={id} className="scroll-mt-28">
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className={sectionLabelClass}>{title}</h2>
      <a
        href="#resources-featured"
        className="inline-flex items-center gap-1 text-sm font-bold text-zinc-700 transition hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-700 dark:text-stone-300 dark:hover:text-red-100"
      >
        View all
        <ArrowRight size={14} aria-hidden="true" />
      </a>
    </div>
    {items.length ? (
      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg shadow-zinc-900/5 dark:border-white/10 dark:bg-zinc-950 dark:shadow-black/25">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <a
              href={item.href}
              key={`${item.href}-${item.label}`}
              className="flex min-h-12 items-center gap-3 border-b border-black/10 px-4 text-sm transition last:border-b-0 hover:bg-[#fffaf0] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-700 dark:border-white/10 dark:hover:bg-white/5"
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-red-950/5 text-red-800 dark:bg-red-950/35 dark:text-red-100">
                <Icon size={14} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1 truncate font-bold text-zinc-800 dark:text-stone-200">{item.label}</span>
              <span className="shrink-0 text-xs font-semibold text-zinc-500 dark:text-stone-400">{countLabel(item.count)}</span>
              <ArrowRight size={15} className="shrink-0 text-zinc-500 dark:text-stone-400" aria-hidden="true" />
            </a>
          );
        })}
      </div>
    ) : <EmptyState>{emptyText}</EmptyState>}
  </section>
);

const CenteredSectionHeader = ({ id, title }: { id?: string; title: string }) => (
  <div className="mb-5 flex items-center gap-4">
    <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
    <h2 id={id} className={centeredSectionHeaderClass}>{title}</h2>
    <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
  </div>
);


const FeaturedWritingCard = ({ article }: { article: PublicWritingCard }) => (
  <a href={writingHref(article)} className="grid min-w-0 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg shadow-zinc-900/5 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 dark:border-white/10 dark:bg-zinc-950 dark:shadow-black/25 sm:grid-cols-[9rem_1fr]">
    <ImageBlock asset={article.og_image_detail} tone={toneFor(article.slug || article.id)} className="min-h-44 sm:min-h-full" />
    <span className="min-w-0 p-5">
      <span className="text-[11px] font-black uppercase tracking-[0.16em] text-red-800 dark:text-red-200">Featured Article</span>
      <span className="mt-3 block text-xl font-black leading-snug tracking-normal text-zinc-950 dark:text-stone-100">{article.title}</span>
      <span className="mt-3 line-clamp-2 block text-sm leading-6 text-zinc-600 dark:text-stone-400">{article.excerpt || article.seo_description || 'Read this featured writing from the church library.'}</span>
      <span className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        <MetaItem icon={Clock3}>{article.reading_time_minutes || 1} min read</MetaItem>
        <MetaItem icon={UsersRound}>{articleAuthor(article)}</MetaItem>
      </span>
    </span>
  </a>
);

const FeaturedCategoryCard = ({ category }: { category: ResourcesHome['featured_categories'][number] }) => (
  <a href={`/resources/category/${category.slug}`} className="flex min-h-44 min-w-0 flex-col justify-between rounded-2xl border border-black/10 bg-white p-5 shadow-lg shadow-zinc-900/5 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 dark:border-white/10 dark:bg-zinc-950 dark:shadow-black/25">
    <span>
      <span className="text-[11px] font-black uppercase tracking-[0.16em] text-red-800 dark:text-red-200">Featured Collection</span>
      <span className="mt-3 block text-xl font-black leading-snug tracking-normal text-zinc-950 dark:text-stone-100">{category.name}</span>
      <span className="mt-3 line-clamp-3 block text-sm leading-6 text-zinc-600 dark:text-stone-400">{category.description || 'Browse writings gathered around this collection.'}</span>
    </span>
    <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-red-800 dark:text-red-100">
      Open collection
      <ArrowRight size={14} aria-hidden="true" />
    </span>
  </a>
);

const FeaturedSeriesCard = ({ series }: { series: PublicResourceSeries }) => (
  <a href={`/resources/series/${series.slug}`} className="grid min-w-0 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg shadow-zinc-900/5 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 dark:border-white/10 dark:bg-zinc-950 dark:shadow-black/25 sm:grid-cols-[9rem_1fr]">
    <ImageBlock asset={series.cover_image_detail} tone={toneFor(series.slug || series.id)} className="min-h-44 sm:min-h-full" />
    <span className="min-w-0 p-5">
      <span className="text-[11px] font-black uppercase tracking-[0.16em] text-red-800 dark:text-red-200">Featured Series</span>
      <span className="mt-3 block text-xl font-black leading-snug tracking-normal text-zinc-950 dark:text-stone-100">{series.title}</span>
      <span className="mt-3 line-clamp-2 block text-sm leading-6 text-zinc-600 dark:text-stone-400">{series.description || 'Follow this curated journey through the church library.'}</span>
      <span className="mt-4 block text-sm font-black text-zinc-600 dark:text-stone-400">{countLabel(series.writing_count)}</span>
    </span>
  </a>
);

const FeaturedShowcase = ({ articles, categories, series, loading }: { articles: PublicWritingCard[]; categories: ResourcesHome['featured_categories']; series: PublicResourceSeries[]; loading: boolean }) => {
  if (loading) {
    return <div className="grid min-w-0 gap-5 lg:grid-cols-2">{[0, 1, 2].map((item) => <SkeletonBlock key={item} className="h-44" />)}</div>;
  }

  if (!articles.length && !categories.length && !series.length) {
    return <EmptyState>Featured resources will appear here once they are curated.</EmptyState>;
  }

  return (
    <div className="grid min-w-0 gap-5 lg:grid-cols-2">
      {articles.map((article) => <FeaturedWritingCard article={article} key={`article-${article.id}`} />)}
      {categories.map((category) => <FeaturedCategoryCard category={category} key={`category-${category.id}`} />)}
      {series.map((item) => <FeaturedSeriesCard series={item} key={`series-${item.id}`} />)}
    </div>
  );
};

const ArticleGrid = ({ articles, emptyText, loading }: { articles: PublicWritingCard[]; emptyText: string; loading: boolean }) => {
  if (loading) {
    return <div className="grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">{[0, 1, 2, 3].map((item) => <SkeletonBlock key={item} className="h-36" />)}</div>;
  }
  if (!articles.length) return <EmptyState>{emptyText}</EmptyState>;
  return <div className="grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">{articles.map((article) => <ResourceArticleCard article={article} key={article.id} />)}</div>;
};


const ResourceTypePreviewRail = ({ rail }: { rail: PublicResourceTypeRail }) => {
  const resourceType = rail.resource_type;
  const count = rail.count ?? resourceType.writing_count ?? rail.items.length;

  return (
    <article className="rounded-[2rem] border border-[#eaded0] bg-[#fffaf0]/80 p-5 shadow-lg shadow-zinc-900/5 dark:border-white/10 dark:bg-white/[0.03] dark:shadow-black/25 sm:p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className={sectionLabelClass}>{resourceType.name}</p>
          <p className="mt-2 text-sm font-semibold text-zinc-600 dark:text-stone-400">
            {countLabel(count)} available
          </p>
        </div>
        <a
          href={`/resources/type/${resourceType.slug}`}
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#eaded0] bg-white px-4 py-2 text-sm font-black text-red-800 shadow-sm shadow-zinc-900/5 transition hover:-translate-y-0.5 hover:border-red-200 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-700 dark:border-white/10 dark:bg-white/5 dark:text-red-100 dark:hover:bg-white/10"
        >
          View more {resourceType.name}
          <ArrowRight size={14} aria-hidden="true" />
        </a>
      </div>
      <ArticleGrid articles={rail.items ?? []} emptyText={`Published ${resourceType.name.toLowerCase()} resources will appear here soon.`} loading={false} />
    </article>
  );
};

const CategoryPreviewRail = ({ rail }: { rail: PublicCategoryRail }) => {
  const category = rail.category;
  const count = rail.count ?? category.writing_count ?? rail.items.length;

  return (
    <article className="rounded-[2rem] border border-[#eaded0] bg-[#fffaf0]/80 p-5 shadow-lg shadow-zinc-900/5 dark:border-white/10 dark:bg-white/[0.03] dark:shadow-black/25 sm:p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className={sectionLabelClass}>{category.name}</p>
          <p className="mt-2 text-sm font-semibold text-zinc-600 dark:text-stone-400">
            {countLabel(count)} available
          </p>
        </div>
        <a
          href={`/resources/category/${category.slug}`}
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#eaded0] bg-white px-4 py-2 text-sm font-black text-red-800 shadow-sm shadow-zinc-900/5 transition hover:-translate-y-0.5 hover:border-red-200 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-700 dark:border-white/10 dark:bg-white/5 dark:text-red-100 dark:hover:bg-white/10"
        >
          View more {category.name}
          <ArrowRight size={14} aria-hidden="true" />
        </a>
      </div>
      <ArticleGrid articles={rail.items ?? []} emptyText={`Published ${category.name.toLowerCase()} resources will appear here soon.`} loading={false} />
    </article>
  );
};

const SeriesPreviewRail = ({ rail }: { rail: PublicSeriesRail }) => {
  const series = rail.series;
  const count = rail.count ?? series.writing_count ?? rail.items.length;

  return (
    <article className="rounded-[2rem] border border-[#eaded0] bg-[#fffaf0]/80 p-5 shadow-lg shadow-zinc-900/5 dark:border-white/10 dark:bg-white/[0.03] dark:shadow-black/25 sm:p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className={sectionLabelClass}>{series.title}</p>
          <p className="mt-2 text-sm font-semibold text-zinc-600 dark:text-stone-400">
            {countLabel(count)} available
          </p>
        </div>
        <a
          href={`/resources/series/${series.slug}`}
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#eaded0] bg-white px-4 py-2 text-sm font-black text-red-800 shadow-sm shadow-zinc-900/5 transition hover:-translate-y-0.5 hover:border-red-200 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-700 dark:border-white/10 dark:bg-white/5 dark:text-red-100 dark:hover:bg-white/10"
        >
          View more {series.title}
          <ArrowRight size={14} aria-hidden="true" />
        </a>
      </div>
      <ArticleGrid articles={rail.items ?? []} emptyText={`Published writings from ${series.title} will appear here soon.`} loading={false} />
    </article>
  );
};
const ResourcesSubscribeStrip = ({ darkMode }: { darkMode: boolean }) => (
  <section className="rounded-2xl border border-black/10 bg-[#fffaf0] p-5 shadow-lg shadow-zinc-900/5 dark:border-white/10 dark:bg-[#171717] dark:shadow-black/25">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-red-950/5 text-red-800 dark:bg-red-950/35 dark:text-red-100">
          <Rss size={22} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-black text-zinc-950 dark:text-stone-100">Stay updated with our latest resources.</h2>
          <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-stone-400">
            Subscribe to our RSS feed and never miss a new article.
          </p>
        </div>
      </div>
      <SiteButton
        className="w-full sm:w-auto"
        darkMode={darkMode}
        href="/resources/rss.xml"
        icon={ArrowRight}
        iconPosition="after"
        variant="tertiary"
      >
        Subscribe via RSS
      </SiteButton>
    </div>
  </section>
);

const ResourcesLanding = ({ darkMode, error = '', home, loading, navigation }: ResourcesLandingProps) => {
  const resourceTypes = navigation?.resource_types.length ? navigation.resource_types : home?.resource_types ?? [];
  const featuredArticles = home?.featured_articles ?? [];
  const featuredCategories = home?.featured_categories ?? [];
  const featuredSeries = home?.featured_series ?? [];
  const latestArticles = home?.latest_articles ?? [];
  const resourceTypeRails = home?.resource_type_rails ?? [];
  const categoryRails = home?.category_rails ?? [];
  const seriesRails = home?.series_rails ?? [];
  const heroArticle = home?.hero_featured || latestArticles[0] || null;
  const heroEyebrow = home?.hero_featured ? 'Featured Resource' : heroArticle ? 'Latest Resource' : 'Featured Resource';
  const scriptureBooks = home?.scripture_books.length ? home.scripture_books : navigation?.scripture_books ?? [];
  const ministries = home?.ministries.length ? home.ministries : navigation?.ministries ?? [];
  const scriptureItems = scriptureBooks.map((book: PublicScriptureBook) => ({
    count: book.writing_count,
    href: `/resources/book/${encodeURIComponent(book.osis_id)}`,
    icon: ScrollText,
    label: book.name,
  }));
  const ministryItems = ministries.map((ministry: PublicResourceMinistry) => ({
    count: ministry.writing_count,
    href: `/resources/ministry/${encodeURIComponent(ministry.slug)}`,
    icon: UsersRound,
    label: ministry.name,
  }));

  return (
    <main
      className={`flex-1 ${
        darkMode
          ? 'bg-[#080808] text-stone-100'
          : 'bg-[linear-gradient(180deg,#f8f5ef,#fffaf0_42%,#f8f5ef)] text-zinc-950'
      }`}
    >
      <section className="border-b border-black/10 px-4 py-16 dark:border-white/10 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(19rem,0.55fr)_minmax(0,1.2fr)] lg:items-center">
          <div className="max-w-xl xl:pl-16">
            <p className={heroLabelClass}>THE LIBRARY</p>
            <h1 className="mt-6 font-serif text-5xl font-bold leading-[0.98] tracking-normal text-zinc-950 dark:text-stone-100 sm:text-6xl lg:text-7xl">
              Read
            </h1>
            <p className="mt-8 max-w-lg font-serif text-4xl font-bold leading-[1.05] tracking-normal text-zinc-950 dark:text-stone-100 sm:text-5xl">
              Study deeply.
              <span className="block">Reflect faithfully.</span>
              <span className="block text-red-700">Live differently.</span>
            </p>
            <p className="mt-8 max-w-[30rem] text-lg leading-8 text-zinc-700 dark:text-stone-300">
              Articles, Bible studies, pastoral guidance, and devotional reflections.
            </p>
            <div className="mt-8 h-px w-16 bg-red-700" aria-hidden="true" />
            <div className="mt-8">
              <a
                href="#resources-featured"
                className="inline-flex items-center gap-2 text-sm font-black text-red-800 transition hover:translate-x-1 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-700 dark:text-red-100 dark:hover:text-red-200"
              >
                Explore the library
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
          </div>
          <FeaturedArticleCard article={heroArticle} darkMode={darkMode} eyebrow={heroEyebrow} loading={loading} />
        </div>
      </section>

      <ResourcesCategoryTabs darkMode={darkMode} resourceTypes={resourceTypes} />

      <div className="grid gap-10 px-4 py-10 sm:px-6 lg:px-8">
        {error ? (
          <div className="rounded-2xl border border-red-900/15 bg-red-50 p-5 text-sm font-bold text-red-800 dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-100">
            {error}
          </div>
        ) : null}


        <section id="resources-featured" className="scroll-mt-28" aria-labelledby="resources-featured-heading">
          <CenteredSectionHeader id="resources-featured-heading" title="Featured" />
          <FeaturedShowcase articles={featuredArticles} categories={featuredCategories} series={featuredSeries} loading={loading} />
        </section>

        <section aria-labelledby="resources-latest">
          <CenteredSectionHeader id="resources-latest" title="Latest" />
          <ArticleGrid articles={latestArticles} emptyText="Latest published writings will appear here soon." loading={loading} />
        </section>

        <section id="resources-resource-type-rails" className="scroll-mt-28" aria-labelledby="resources-resource-type-rails-heading">
          <CenteredSectionHeader id="resources-resource-type-rails-heading" title="Explore by Resource Type" />
          {loading ? (
            <div className="grid gap-6">
              {[0, 1, 2].map((item) => <SkeletonBlock key={item} className="h-56 rounded-[2rem]" />)}
            </div>
          ) : resourceTypeRails.length ? (
            <div className="grid gap-6">
              {resourceTypeRails.map((rail) => <ResourceTypePreviewRail key={rail.resource_type.id} rail={rail} />)}
            </div>
          ) : null}
        </section>

        <section id="resources-category-rails" className="scroll-mt-28" aria-labelledby="resources-category-rails-heading">
          <CenteredSectionHeader id="resources-category-rails-heading" title="Explore by Category" />
          {loading ? (
            <div className="grid gap-6">
              {[0, 1, 2].map((item) => <SkeletonBlock key={item} className="h-56 rounded-[2rem]" />)}
            </div>
          ) : categoryRails.length ? (
            <div className="grid gap-6">
              {categoryRails.map((rail) => <CategoryPreviewRail key={rail.category.id} rail={rail} />)}
            </div>
          ) : null}
        </section>

        <section id="resources-series-rails" className="scroll-mt-28" aria-labelledby="resources-series-rails-heading">
          <CenteredSectionHeader id="resources-series-rails-heading" title="Explore by Series" />
          {loading ? (
            <div className="grid gap-6">
              {[0, 1, 2].map((item) => <SkeletonBlock key={item} className="h-56 rounded-[2rem]" />)}
            </div>
          ) : seriesRails.length ? (
            <div className="grid gap-6">
              {seriesRails.map((rail) => <SeriesPreviewRail key={rail.series.id} rail={rail} />)}
            </div>
          ) : null}
        </section>

        <section className="grid min-w-0 gap-8 md:grid-cols-2">
          {loading ? <SkeletonBlock className="h-80" /> : <BrowseListCard emptyText="Scripture books will appear here once published articles reference them." id="resources-scripture" title="Browse Scripture" items={scriptureItems} />}
          {loading ? <SkeletonBlock className="h-80" /> : <BrowseListCard emptyText="Ministry resources will appear here once published writings are connected to ministries." id="resources-ministry" title="Browse Ministry" items={ministryItems} />}
        </section>

        <ResourcesSubscribeStrip darkMode={darkMode} />
      </div>
    </main>
  );
};

export default ResourcesLanding;



