import { ArrowLeft, ArrowRight, BookOpen, Check, Clock3, FolderOpen, Layers3, LibraryBig, Share2, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import ResourceCard from "../components/resources/ResourceCard";
import WritingArticleReader from "../components/writing/WritingArticleReader";
import { useTheme } from "../hooks/useTheme";
import { fetchPublicResourceDetail } from "../services/resourcesApi";
import { copyToClipboard } from "../utils/copyToClipboard";
import type { PublicWritingCard, PublicWritingDetail } from "../types/writing";

const articleAuthor = (writing: PublicWritingDetail) =>
  writing.byline ||
  writing.author_display ||
  writing.author_attributions?.[0]?.display_name ||
  "A.I.C Njoro Town";

const formatPublishedDate = (value?: string) => {
  if (!value) return "Published resource";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Published resource";
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};


type ContinueReadingSection = {
  href?: string;
  items: PublicWritingCard[];
  title: string;
};

const recommendationMasonryClass =
  "columns-2 gap-3 sm:gap-4 lg:columns-3 xl:columns-4";

const sectionShellClass = (darkMode: boolean) =>
  darkMode
    ? "rounded-[1.75rem] border border-white/10 bg-zinc-950/80 p-4 shadow-2xl shadow-black/30 sm:p-6"
    : "rounded-[1.75rem] border border-[#eaded0] bg-[#fffaf0]/85 p-4 shadow-xl shadow-zinc-900/5 sm:p-6";

const buildContinueReadingSections = (
  writing: PublicWritingDetail,
): ContinueReadingSection[] => {
  const recommendations = writing.continue_reading;
  if (!recommendations) return [];

  return [
    ...(recommendations.more_from_series ?? []).map((group) => ({
      href: `/resources/series/${group.series.slug}`,
      items: group.items,
      title: "More from this Series",
    })),
    ...(recommendations.more_from_categories ?? []).map((group) => ({
      href: `/resources/category/${group.category.slug}`,
      items: group.items,
      title: `More from ${group.category.name}`,
    })),
    ...(recommendations.study_same_scriptures ?? []).map((group) => ({
      href: `/resources/book/${group.book.osis_id}`,
      items: group.items,
      title: "Study the Same Scriptures",
    })),
    {
      href: "/resources",
      items: recommendations.more_resources ?? [],
      title: "More Resources",
    },
  ].filter((section) => section.items.length > 0);
};

const ResourceCatalog = ({
  darkMode,
  writing,
}: {
  darkMode: boolean;
  writing: PublicWritingDetail;
}) => {
  const links = [
    writing.resource_type_detail
      ? {
          href: `/resources/type/${writing.resource_type_detail.slug}`,
          icon: LibraryBig,
          label: writing.resource_type_detail.name,
          title: "Resource type",
        }
      : null,
    ...(writing.categories ?? []).map((category) => ({
      href: `/resources/category/${category.slug}`,
      icon: FolderOpen,
      label: category.name,
      title: "Category",
    })),
    ...(writing.series ?? []).map((series) => ({
      href: `/resources/series/${series.slug}`,
      icon: Layers3,
      label: series.title,
      title: "Series",
    })),
    ...(writing.scripture_references ?? [])
      .map((reference) => {
        const osisId = reference.book_detail?.osis_id || reference.book_osis;
        if (!osisId) return null;
        return {
          href: `/resources/book/${osisId}`,
          icon: BookOpen,
          label: reference.display_text || osisId,
          title: "Scripture",
        };
      })
      .filter(Boolean),
  ].filter(Boolean) as Array<{
    href: string;
    icon: typeof LibraryBig;
    label: string;
    title: string;
  }>;

  if (!links.length) return null;

  return (
    <section className={sectionShellClass(darkMode)} aria-labelledby="resource-catalog-title">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-800 dark:text-red-200">
            Catalog
          </p>
          <h2 id="resource-catalog-title" className="mt-1 font-serif text-2xl">
            About this Resource
          </h2>
        </div>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              className={
                darkMode
                  ? "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-stone-200 transition hover:border-red-200/40 hover:text-red-100"
                  : "inline-flex items-center gap-2 rounded-full border border-[#eaded0] bg-white px-3 py-2 text-sm font-bold text-zinc-800 shadow-sm transition hover:border-red-200 hover:text-red-800"
              }
              key={`${link.title}-${link.href}-${link.label}`}
              to={link.href}
            >
              <Icon size={15} aria-hidden="true" />
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-red-800 dark:text-red-200">
                {link.title}
              </span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

const PreviousNext = ({
  darkMode,
  writing,
}: {
  darkMode: boolean;
  writing: PublicWritingDetail;
}) => {
  const linkClass = darkMode
    ? "group rounded-[1.5rem] border border-white/10 bg-zinc-950/80 p-5 transition hover:border-red-200/30 hover:bg-white/5"
    : "group rounded-[1.5rem] border border-[#eaded0] bg-white p-5 shadow-lg shadow-zinc-900/5 transition hover:border-red-200 hover:bg-[#fffaf0]";
  const mutedClass = darkMode ? "text-stone-400" : "text-zinc-600";

  const hasSeriesContext = (writing.series ?? []).length > 0;

  if (!hasSeriesContext || (!writing.previous_article && !writing.next_article)) return null;

  return (
    <nav aria-label="Previous and next resources in this series" className="grid gap-4 md:grid-cols-2">
      {writing.previous_article ? (
        <Link className={linkClass} to={`/resources/${writing.previous_article.slug}`}>
          <span className={`text-xs font-black uppercase tracking-[0.18em] ${mutedClass}`}>
            Previous in Series
          </span>
          <span className="mt-2 block font-serif text-2xl leading-tight transition group-hover:text-red-800 dark:group-hover:text-red-100">
            {writing.previous_article.title}
          </span>
        </Link>
      ) : <span />}
      {writing.next_article ? (
        <Link className={`${linkClass} md:text-right`} to={`/resources/${writing.next_article.slug}`}>
          <span className={`text-xs font-black uppercase tracking-[0.18em] ${mutedClass}`}>
            Next in Series
          </span>
          <span className="mt-2 block font-serif text-2xl leading-tight transition group-hover:text-red-800 dark:group-hover:text-red-100">
            {writing.next_article.title}
          </span>
        </Link>
      ) : null}
    </nav>
  );
};

const ContinueReading = ({
  darkMode,
  writing,
}: {
  darkMode: boolean;
  writing: PublicWritingDetail;
}) => {
  const sections = buildContinueReadingSections(writing);
  if (!sections.length) return null;

  return (
    <section className="grid gap-6" aria-label="Continue reading recommendations">
      {sections.map((section) => (
        <div className={sectionShellClass(darkMode)} key={section.title}>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-3xl leading-tight">{section.title}</h2>
            {section.href ? (
              <Link
                className="inline-flex items-center gap-2 text-sm font-black text-red-800 transition hover:text-red-700 dark:text-red-100"
                to={section.href}
              >
                View more <ArrowRight size={15} aria-hidden="true" />
              </Link>
            ) : null}
          </div>
          <div className={recommendationMasonryClass} data-resource-detail-recommendations="masonry">
            {section.items.map((article) => (
              <ResourceCard
                article={article}
                className="mb-3 break-inside-avoid sm:mb-4"
                key={article.id}
                variant="masonry"
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
};

const ReaderSkeleton = () => (
  <div className="mx-auto grid max-w-5xl gap-4 px-4 py-10 sm:px-6 lg:px-8">
    <div className="h-8 w-36 animate-pulse rounded-full bg-black/10 dark:bg-white/10" />
    <div className="min-h-[32rem] animate-pulse rounded-2xl border border-black/10 bg-white/70 shadow-lg shadow-zinc-900/5 dark:border-white/10 dark:bg-white/5" />
  </div>
);

const ResourcesDetailPage = () => {
  const { slug = "" } = useParams<{ slug?: string }>();
  const [searchParams] = useSearchParams();
  const { darkMode, toggleTheme } = useTheme();
  const [writing, setWriting] = useState<PublicWritingDetail | null>(null);
  const [shareStatus, setShareStatus] = useState<'copied' | 'idle'>('idle');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const publishedAt = searchParams.get("published_at") || undefined;

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setWriting(null);

    fetchPublicResourceDetail(slug, publishedAt, controller.signal)
      .then(setWriting)
      .catch((err) => {
        if (
          controller.signal.aborted ||
          (err instanceof DOMException && err.name === "AbortError")
        ) {
          return;
        }
        setError("Unable to load this resource right now. Please try again shortly.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [publishedAt, slug]);

  const metadata = useMemo(() => {
    if (!writing) return null;

    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="inline-flex items-center gap-1.5 font-semibold">
          <UserRound size={15} aria-hidden="true" />
          {articleAuthor(writing)}
        </span>
        <span aria-hidden="true" className="opacity-60">&middot;</span>
        <span className="inline-flex items-center gap-1.5 font-semibold">
          <Clock3 size={15} aria-hidden="true" />
          {writing.reading_time_minutes || 1} min read
        </span>
        <span aria-hidden="true" className="opacity-60">&middot;</span>
        <span>{formatPublishedDate(writing.published_at)}</span>
      </div>
    );
  }, [writing]);


  const handleShare = async () => {
    if (!writing) return;

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const shareUrl = writing.canonical_url?.startsWith("http")
      ? writing.canonical_url
      : `${origin}/resources/${writing.slug}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: writing.og_title || writing.title,
          text: writing.og_description || writing.excerpt,
          url: shareUrl,
        });
        return;
      } catch {
        // Fall through to clipboard when native sharing is cancelled or unavailable.
      }
    }

    const copied = await copyToClipboard(shareUrl);
    if (copied) {
      setShareStatus("copied");
      window.setTimeout(() => setShareStatus("idle"), 2200);
    }
  };

  const shareAction = writing ? (
    <button
      aria-live="polite"
      className={
        darkMode
          ? "inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-sm font-black text-stone-100 transition hover:-translate-y-0.5 hover:border-red-200/30 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-red-200/50"
          : "inline-flex min-h-10 items-center gap-2 rounded-full border border-[#eaded0] bg-white px-4 text-sm font-black text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 focus:ring-offset-[#fffaf0]"
      }
      onClick={handleShare}
      type="button"
    >
      {shareStatus === "copied" ? <Check size={16} aria-hidden="true" /> : <Share2 size={16} aria-hidden="true" />}
      {shareStatus === "copied" ? "Link copied" : "Share"}
    </button>
  ) : null;

  return (
    <div
      className={`flex min-h-screen flex-col overflow-x-clip transition-colors duration-500 ${
        darkMode ? "bg-[#080808] text-stone-100" : "bg-[#f8f5ef] text-zinc-950"
      }`}
    >
      <SiteHeader
        activePath="/resources"
        darkMode={darkMode}
        onToggleTheme={toggleTheme}
      />
      <main
        className={`flex-1 ${
          darkMode
            ? "bg-[#080808]"
            : "bg-[linear-gradient(180deg,#f8f5ef,#fffaf0_42%,#f8f5ef)]"
        }`}
      >
        {loading ? <ReaderSkeleton /> : null}
        {!loading && error ? (
          <section className="mx-auto grid max-w-5xl gap-6 px-4 py-10 sm:px-6 lg:px-8">
            <Link
              to="/resources"
              className="inline-flex items-center gap-2 text-sm font-black text-red-800 transition hover:text-red-700 dark:text-red-100"
            >
              <ArrowLeft size={16} aria-hidden="true" /> Back to Resources
            </Link>
            <div className="rounded-2xl border border-red-900/15 bg-red-50 p-6 text-sm font-bold text-red-800 dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-100">
              {error}
            </div>
          </section>
        ) : null}
        {!loading && writing ? (
          <section className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:px-8">
            <Link
              to="/resources"
              className="inline-flex w-fit items-center gap-2 text-sm font-black text-red-800 transition hover:text-red-700 dark:text-red-100"
            >
              <ArrowLeft size={16} aria-hidden="true" /> Back to Resources
            </Link>
            <WritingArticleReader
              darkMode={darkMode}
              headerAction={shareAction}
              metadata={metadata}
              title={writing.title}
              writing={writing}
            />
            <ResourceCatalog darkMode={darkMode} writing={writing} />
            <PreviousNext darkMode={darkMode} writing={writing} />
            <ContinueReading darkMode={darkMode} writing={writing} />
          </section>
        ) : null}
      </main>
      <SiteFooter darkMode={darkMode} />
    </div>
  );
};

export default ResourcesDetailPage;
