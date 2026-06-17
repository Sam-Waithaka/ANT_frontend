import { ArrowRight, Clock3, Rss, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import SiteButton from '../ui/SiteButton';
import {
  mockCollections,
  mockFeaturedArticle,
  mockFeaturedArticles,
  mockLatestArticles,
  mockMinistries,
  mockResourceTypes,
  mockScriptureBooks,
  resourceArrowIcon,
  type BrowseItem,
  type ResourceArticle,
  type ResourceCollection,
  type ResourceType,
} from '../../data/resourcesContent';

type ResourcesLandingProps = {
  darkMode: boolean;
};

type ImageBlockProps = {
  className?: string;
  tone: string;
};

const ArrowIcon = resourceArrowIcon;

const sectionLabelClass = 'text-xs font-black uppercase tracking-[0.18em] text-red-800 dark:text-red-200';
const heroLabelClass = 'text-sm font-black uppercase tracking-[0.16em] text-red-700';
const centeredSectionHeaderClass = 'shrink-0 text-center text-sm font-black uppercase tracking-[0.16em] text-zinc-950 dark:text-stone-100';

const ImageBlock = ({ className = '', tone }: ImageBlockProps) => (
  <div className={`relative overflow-hidden bg-gradient-to-br ${tone} ${className}`}>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(255,255,255,0.46),transparent_20%),linear-gradient(180deg,transparent,rgba(0,0,0,0.52))]" />
    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(150deg,transparent_18%,rgba(255,255,255,0.18)_19%,transparent_20%,transparent_32%,rgba(255,255,255,0.12)_33%,transparent_34%)]" />
    <div className="absolute bottom-8 left-1/2 h-16 w-px -translate-x-1/2 bg-white/45" />
    <div className="absolute bottom-8 left-1/2 size-3 -translate-x-1/2 rounded-full border border-white/70" />
    <div className="absolute bottom-0 left-1/2 h-28 w-32 -translate-x-1/2 rounded-t-full bg-black/25 blur-xl" />
  </div>
);

const MetaItem = ({ children, icon: Icon }: { children: ReactNode; icon: typeof Clock3 }) => (
  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-stone-400">
    <Icon size={14} aria-hidden="true" />
    {children}
  </span>
);

const FeaturedArticleCard = ({ darkMode }: { darkMode: boolean }) => (
  <article className="grid overflow-hidden rounded-3xl border border-black/10 bg-white shadow-2xl shadow-zinc-900/10 transition dark:border-white/10 dark:bg-zinc-950 dark:shadow-black/30 lg:grid-cols-[1.12fr_0.88fr]">
    <ImageBlock tone={mockFeaturedArticle.imageTone} className="min-h-72 lg:min-h-[23rem]" />
    <div className="flex flex-col justify-between p-6 sm:p-8">
      <div>
        <p className={sectionLabelClass}>{mockFeaturedArticle.type}</p>
        <h2 className="mt-4 max-w-sm text-3xl font-extrabold leading-tight tracking-normal text-zinc-950 dark:text-stone-100 sm:text-4xl">
          {mockFeaturedArticle.title}
        </h2>
        <p className="mt-5 max-w-sm text-base leading-7 text-zinc-600 dark:text-stone-300">
          {mockFeaturedArticle.excerpt}
        </p>
      </div>
      <div className="mt-7 border-t border-black/10 pt-5 dark:border-white/10">
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <MetaItem icon={Clock3}>{mockFeaturedArticle.minutes} min read</MetaItem>
          <MetaItem icon={UserRound}>{mockFeaturedArticle.authors.join(', ')}</MetaItem>
        </div>
        <div className="mt-7">
          <SiteButton darkMode={darkMode} href="#featured" icon={ArrowRight} iconPosition="after" variant="tertiary">
            Read Article
          </SiteButton>
        </div>
      </div>
    </div>
  </article>
);

const ResourceArticleCard = ({ article }: { article: ResourceArticle }) => (
  <article className="grid min-w-0 grid-cols-[7rem_1fr] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg shadow-zinc-900/5 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-zinc-950 dark:shadow-black/25">
    <ImageBlock tone={article.imageTone} className="min-h-[8.5rem]" />
    <div className="min-w-0 p-5">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-red-800 dark:text-red-200">{article.accent}</p>
      <h3 className="mt-3 text-lg font-black leading-snug tracking-normal text-zinc-950 dark:text-stone-100">{article.title}</h3>
      <div className="mt-4 grid gap-2">
        <MetaItem icon={Clock3}>{article.minutes} min read</MetaItem>
        <MetaItem icon={UserRound}>{article.author}</MetaItem>
      </div>
    </div>
  </article>
);

const ResourceTypeCard = ({ resourceType }: { resourceType: ResourceType }) => {
  const Icon = resourceType.icon;

  return (
    <a
      href="#featured"
      className="flex min-h-24 min-w-0 items-center gap-4 rounded-2xl border border-black/10 bg-white p-5 shadow-lg shadow-zinc-900/5 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 dark:border-white/10 dark:bg-zinc-950 dark:shadow-black/25"
    >
      <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-red-950/5 text-red-800 dark:bg-red-950/35 dark:text-red-100">
        <Icon size={24} aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-base font-black text-zinc-950 dark:text-stone-100">{resourceType.name}</span>
        <span className="mt-1 block text-sm font-semibold text-zinc-600 dark:text-stone-400">{resourceType.count} Articles</span>
      </span>
    </a>
  );
};

const CollectionCard = ({ collection }: { collection: ResourceCollection }) => (
  <a
    href="#featured"
    className={`relative flex min-h-64 overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-br ${collection.imageTone} p-5 shadow-lg shadow-zinc-900/10 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 dark:border-white/10 dark:shadow-black/30`}
  >
    <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-white/10" />
    <span className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(140deg,transparent_24%,rgba(255,255,255,0.13)_25%,transparent_26%,transparent_44%,rgba(255,255,255,0.1)_45%,transparent_46%)]" />
    <span className="relative mt-auto min-w-0 text-white">
      <span className="block text-xl font-black">{collection.title}</span>
      <span className="mt-2 block max-w-48 text-sm font-semibold leading-6 text-white/90">{collection.description}</span>
      <span className="mt-4 block text-sm font-black">{collection.count} Articles</span>
    </span>
  </a>
);

const BrowseListCard = ({ items, title }: { items: BrowseItem[]; title: string }) => (
  <section>
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className={sectionLabelClass}>{title}</h2>
      <a
        href="#featured"
        className="inline-flex items-center gap-1 text-sm font-bold text-zinc-700 transition hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-700 dark:text-stone-300 dark:hover:text-red-100"
      >
        View all
        <ArrowRight size={14} aria-hidden="true" />
      </a>
    </div>
    <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg shadow-zinc-900/5 dark:border-white/10 dark:bg-zinc-950 dark:shadow-black/25">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <a
            href="#featured"
            key={item.label}
            className="flex min-h-12 items-center gap-3 border-b border-black/10 px-4 text-sm transition last:border-b-0 hover:bg-[#fffaf0] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-700 dark:border-white/10 dark:hover:bg-white/5"
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-red-950/5 text-red-800 dark:bg-red-950/35 dark:text-red-100">
              <Icon size={14} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1 truncate font-bold text-zinc-800 dark:text-stone-200">{item.label}</span>
            <span className="shrink-0 text-xs font-semibold text-zinc-500 dark:text-stone-400">{item.count} Articles</span>
            <ArrowIcon size={15} className="shrink-0 text-zinc-500 dark:text-stone-400" aria-hidden="true" />
          </a>
        );
      })}
    </div>
  </section>
);

const CenteredSectionHeader = ({ id, title }: { id?: string; title: string }) => (
  <div className="mb-5 flex items-center gap-4">
    <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
    <h2 id={id} className={centeredSectionHeaderClass}>{title}</h2>
    <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
  </div>
);

const LatestArticlesSection = () => (
  <section aria-labelledby="resources-latest">
    <CenteredSectionHeader id="resources-latest" title="Latest" />
    <div className="grid min-w-0 gap-5 md:grid-cols-3">
      {mockLatestArticles.map((article) => (
        <ResourceArticleCard article={article} key={article.title} />
      ))}
    </div>
  </section>
);

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
        href="#featured"
        icon={ArrowRight}
        iconPosition="after"
        variant="tertiary"
      >
        Subscribe via RSS
      </SiteButton>
    </div>
  </section>
);

const ResourcesLanding = ({ darkMode }: ResourcesLandingProps) => (
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
              href="#featured"
              className="inline-flex items-center gap-2 text-sm font-black text-red-800 transition hover:translate-x-1 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-700 dark:text-red-100 dark:hover:text-red-200"
            >
              Explore the library
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
        <FeaturedArticleCard darkMode={darkMode} />
      </div>
    </section>

    <div className="grid gap-10 px-4 py-10 sm:px-6 lg:px-8">
      <section id="featured" aria-labelledby="resources-featured">
        <CenteredSectionHeader id="resources-featured" title="Featured" />
        <div className="grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {mockFeaturedArticles.map((article) => (
            <ResourceArticleCard article={article} key={article.title} />
          ))}
        </div>
      </section>

      <section aria-labelledby="resources-types">
        <CenteredSectionHeader id="resources-types" title="Explore by Type" />
        <div className="mt-5 grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {mockResourceTypes.map((resourceType) => (
            <ResourceTypeCard key={resourceType.name} resourceType={resourceType} />
          ))}
        </div>
      </section>

      <section className="grid min-w-0 gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className={sectionLabelClass}>Featured Collections</h2>
            <a
              href="#featured"
              className="inline-flex items-center gap-1 text-sm font-bold text-zinc-700 transition hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-700 dark:text-stone-300 dark:hover:text-red-100"
            >
              View all collections
              <ArrowRight size={14} aria-hidden="true" />
            </a>
          </div>
          <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
            {mockCollections.map((collection) => (
              <CollectionCard collection={collection} key={collection.title} />
            ))}
          </div>
        </div>

        <div className="grid min-w-0 gap-8 md:grid-cols-2 xl:grid-cols-2">
          <BrowseListCard title="Browse Scripture" items={mockScriptureBooks} />
          <BrowseListCard title="Browse Ministry" items={mockMinistries} />
        </div>
      </section>

      <LatestArticlesSection />

      <ResourcesSubscribeStrip darkMode={darkMode} />
    </div>
  </main>
);

export default ResourcesLanding;
