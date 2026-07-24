import { ArrowLeft, ArrowRight, BookOpen, Check, Clock3, Copy, Mail, MessageCircle, Share2, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import ResponsiveImage from "../components/media/ResponsiveImage";
import WritingArticleReader from "../components/writing/WritingArticleReader";
import { useTheme } from "../hooks/useTheme";
import { normalizeMediaAssetForDisplay } from "../services/mediaAssetsApi";
import { fetchPublicResourceDetail } from "../services/resourcesApi";
import { copyToClipboard } from "../utils/copyToClipboard";
import type { PublicWritingCard, PublicWritingDetail } from "../types/writing";

const articleAuthor = (writing: PublicWritingCard) =>
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

const railSectionClass = (darkMode: boolean) =>
  darkMode
    ? "border-t border-white/10 py-5 first:border-t-0 first:pt-0"
    : "border-t border-[#eaded0] py-5 first:border-t-0 first:pt-0";

const railHeadingClass = "mb-3 text-sm font-black text-zinc-950 dark:text-stone-100";

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

const scriptureBookOsis = (reference: PublicWritingDetail['scripture_references'][number]) =>
  reference.book_detail?.osis_id || reference.book_osis || reference.book;

const scriptureResourceUrl = (reference: PublicWritingDetail['scripture_references'][number]) =>
  `/resources/book/${encodeURIComponent(scriptureBookOsis(reference))}`;

const uniqueScriptureReferences = (writing: PublicWritingDetail) => {
  const seen = new Set<string>();
  return (writing.scripture_references ?? []).filter((reference) => {
    const key = [
      scriptureBookOsis(reference),
      reference.chapter_start,
      reference.verse_start,
      reference.chapter_end ?? '',
      reference.verse_end ?? '',
      reference.version ?? '',
    ].join(':');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const ReferencedScripturesSection = ({
  darkMode,
  writing,
}: {
  darkMode: boolean;
  writing: PublicWritingDetail;
}) => {
  const [expanded, setExpanded] = useState(false);
  const references = uniqueScriptureReferences(writing);
  if (!references.length) return null;

  const hasMore = references.length > 3;
  const visibleReferences = expanded ? references : references.slice(0, 3);

  return (
    <section className={railSectionClass(darkMode)} aria-labelledby="referenced-scriptures-title">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 id="referenced-scriptures-title" className={railHeadingClass}>Referenced Scriptures</h2>
        {hasMore ? (
          <button
            aria-expanded={expanded}
            className={
              darkMode
                ? "rounded-full px-2 py-1 text-xs font-black text-red-100 transition hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-red-200/40"
                : "rounded-full px-2 py-1 text-xs font-black text-red-800 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-red-700"
            }
            onClick={() => setExpanded((current) => !current)}
            type="button"
          >
            {expanded ? 'Show fewer' : `Show more (${references.length - 3})`}
          </button>
        ) : null}
      </div>
      <div className="grid gap-1">
        {visibleReferences.map((reference) => (
          <Link
            className={
              darkMode
                ? "group flex items-center justify-between gap-3 rounded-xl px-2 py-2 text-sm font-bold text-stone-200 transition hover:bg-white/5 hover:text-red-100 focus:outline-none focus:ring-2 focus:ring-red-200/40"
                : "group flex items-center justify-between gap-3 rounded-xl px-2 py-2 text-sm font-bold text-zinc-800 transition hover:bg-white hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-700"
            }
            key={`${reference.id}-${reference.display_text}`}
            to={scriptureResourceUrl(reference)}
          >
            <span className="inline-flex min-w-0 items-center gap-2">
              <BookOpen className="shrink-0 text-red-800 dark:text-red-200" size={15} aria-hidden="true" />
              <span className="truncate">{reference.display_text}</span>
            </span>
            <ArrowRight className="shrink-0 transition group-hover:translate-x-0.5" size={14} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
};
const AboutResourceSection = ({
  darkMode,
  writing,
}: {
  darkMode: boolean;
  writing: PublicWritingDetail;
}) => {
  const rows = [
    writing.resource_type_detail
      ? {
          href: `/resources/type/${writing.resource_type_detail.slug}`,
          label: 'Resource Type',
          value: writing.resource_type_detail.name,
        }
      : null,
    ...(writing.categories ?? []).map((category) => ({
      href: `/resources/category/${category.slug}`,
      label: 'Category',
      value: category.name,
    })),
    ...(writing.series ?? []).map((series) => ({
      href: `/resources/series/${series.slug}`,
      label: 'Series',
      value: series.title,
    })),
    writing.published_at
      ? {
          label: 'Published',
          value: formatPublishedDate(writing.published_at),
        }
      : null,
  ].filter(Boolean) as Array<{ href?: string; label: string; value: string }>;

  if (!rows.length) return null;

  return (
    <section className={railSectionClass(darkMode)} aria-labelledby="about-resource-title">
      <h2 id="about-resource-title" className={railHeadingClass}>About this Resource</h2>
      <dl className="grid gap-3">
        {rows.map((row) => (
          <div key={`${row.label}-${row.value}`}>
            <dt className="text-[10px] font-black uppercase tracking-[0.12em] text-zinc-500 dark:text-stone-500">{row.label}</dt>
            <dd className="mt-1 text-sm font-bold leading-5 text-zinc-900 dark:text-stone-200">
              {row.href ? (
                <Link className="transition hover:text-red-800 dark:hover:text-red-100" to={row.href}>{row.value}</Link>
              ) : row.value}
            </dd>
          </div>
        ))}
      </dl>
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

const CompactRecommendation = ({ article }: { article: PublicWritingCard }) => {
  const asset = normalizeMediaAssetForDisplay(article.og_image_detail);

  return (
    <Link
      className="group grid grid-cols-[3.25rem_1fr] gap-3 rounded-xl py-2 transition hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-700 dark:hover:text-red-100"
      to={`/resources/${article.slug}`}
    >
      <span className="relative overflow-hidden rounded-lg border border-black/10 bg-[#fffaf0] dark:border-white/10 dark:bg-white/5">
        {asset ? (
          <ResponsiveImage alt="" asset={asset} className="aspect-square size-full object-cover transition group-hover:scale-[1.03]" preset="card" />
        ) : (
          <span className="flex aspect-square size-full items-center justify-center bg-red-900/10 text-red-800 dark:bg-red-200/10 dark:text-red-100">
            <BookOpen size={16} aria-hidden="true" />
          </span>
        )}
      </span>
      <span className="min-w-0">
        <span className="line-clamp-2 text-sm font-black leading-5 text-zinc-950 transition group-hover:text-red-800 dark:text-stone-100 dark:group-hover:text-red-100">{article.title}</span>
        <span className="mt-1 block text-xs font-semibold text-zinc-500 dark:text-stone-500">{article.resource_type_detail?.name || article.writing_type}</span>
      </span>
    </Link>
  );
};

const ShareLinksSection = ({
  copyLabel,
  darkMode,
  emailHref,
  onCopy,
  whatsappHref,
}: {
  copyLabel: string;
  darkMode: boolean;
  emailHref: string;
  onCopy: () => void;
  whatsappHref: string;
}) => {
  const linkClass = darkMode
    ? "inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-bold text-stone-300 transition hover:bg-white/5 hover:text-red-100 focus:outline-none focus:ring-2 focus:ring-red-200/40"
    : "inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-bold text-zinc-700 transition hover:bg-white hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-700";

  return (
    <section className={railSectionClass(darkMode)} aria-labelledby="share-article-title">
      <h2 id="share-article-title" className={railHeadingClass}>Share this article</h2>
      <div className="grid gap-1">
        <button className={`${linkClass} text-left`} onClick={onCopy} type="button">
          <Copy size={14} aria-hidden="true" />
          {copyLabel}
        </button>
        <a className={linkClass} href={whatsappHref} rel="noreferrer" target="_blank">
          <MessageCircle size={14} aria-hidden="true" />
          WhatsApp
        </a>
        <a className={linkClass} href={emailHref}>
          <Mail size={14} aria-hidden="true" />
          Email
        </a>
      </div>
    </section>
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
    <section className={railSectionClass(darkMode)} aria-label="Continue reading recommendations">
      <h2 className={railHeadingClass}>Continue Reading</h2>
      <div className="grid gap-4">
        {sections.map((section) => (
          <div key={section.title}>
            <div className="mb-1 flex items-center justify-between gap-3">
              <h3 className="text-xs font-black uppercase tracking-[0.12em] text-red-800 dark:text-red-200">{section.title}</h3>
              {section.href ? (
                <Link
                  aria-label={`View more ${section.title}`}
                  className="inline-flex items-center gap-1 text-xs font-black text-red-800 transition hover:text-red-700 dark:text-red-100"
                  to={section.href}
                >
                  View more <ArrowRight size={12} aria-hidden="true" />
                </Link>
              ) : null}
            </div>
            <div className="grid gap-1">
              {section.items.slice(0, 4).map((article) => (
                <CompactRecommendation article={article} key={article.id} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const ArticleSupportingRail = ({
  copyLabel,
  darkMode,
  emailHref,
  onCopy,
  whatsappHref,
  writing,
}: {
  copyLabel: string;
  darkMode: boolean;
  emailHref: string;
  onCopy: () => void;
  whatsappHref: string;
  writing: PublicWritingDetail;
}) => (
  <aside className="grid gap-0 xl:sticky xl:top-28" data-resource-detail-supporting-rail="true">
    <ShareLinksSection copyLabel={copyLabel} darkMode={darkMode} emailHref={emailHref} onCopy={onCopy} whatsappHref={whatsappHref} />
    <AboutResourceSection darkMode={darkMode} writing={writing} />
    <ContinueReading darkMode={darkMode} writing={writing} />
    <ReferencedScripturesSection darkMode={darkMode} writing={writing} />
  </aside>
);

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


  const shareUrl = useMemo(() => {
    if (!writing) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return writing.canonical_url?.startsWith("http")
      ? writing.canonical_url
      : `${origin}/resources/${writing.slug}`;
  }, [writing]);

  const copyShareUrl = async () => {
    if (!shareUrl) return;
    const copied = await copyToClipboard(shareUrl);
    if (copied) {
      setShareStatus("copied");
      window.setTimeout(() => setShareStatus("idle"), 2200);
    }
  };

  const handleShare = async () => {
    if (!writing || !shareUrl) return;

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

    await copyShareUrl();
  };

  const encodedShareUrl = encodeURIComponent(shareUrl);
  const encodedShareTitle = encodeURIComponent(writing?.title || "A.I.C Njoro Town resource");
  const whatsappHref = `https://wa.me/?text=${encodedShareTitle}%20${encodedShareUrl}`;
  const emailHref = `mailto:?subject=${encodedShareTitle}&body=${encodedShareUrl}`;

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
            <div className="grid gap-8 xl:grid-cols-[minmax(0,48rem)_minmax(18rem,21rem)] xl:items-start xl:gap-10">
              <div className="grid min-w-0 gap-6">
                <WritingArticleReader
                  darkMode={darkMode}
                  headerAction={shareAction}
                  metadata={metadata}
                  title={writing.title}
                  writing={writing}
                />
                <PreviousNext darkMode={darkMode} writing={writing} />
              </div>
              <ArticleSupportingRail
                copyLabel={shareStatus === "copied" ? "Link copied" : "Copy link"}
                darkMode={darkMode}
                emailHref={emailHref}
                onCopy={copyShareUrl}
                whatsappHref={whatsappHref}
                writing={writing}
              />
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter darkMode={darkMode} />
    </div>
  );
};

export default ResourcesDetailPage;
