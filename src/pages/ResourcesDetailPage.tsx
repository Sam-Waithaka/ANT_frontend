import { ArrowLeft, Clock3, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import WritingArticleReader from "../components/writing/WritingArticleReader";
import { useTheme } from "../hooks/useTheme";
import { fetchPublicResourceDetail } from "../services/resourcesApi";
import type { PublicWritingDetail } from "../types/writing";

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
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="inline-flex items-center gap-1.5 font-semibold">
          <UserRound size={15} aria-hidden="true" />
          {articleAuthor(writing)}
        </span>
        <span className="inline-flex items-center gap-1.5 font-semibold">
          <Clock3 size={15} aria-hidden="true" />
          {writing.reading_time_minutes || 1} min read
        </span>
        <span>{formatPublishedDate(writing.published_at)}</span>
      </div>
    );
  }, [writing]);

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
              metadata={metadata}
              title={writing.title}
              writing={writing}
            />
          </section>
        ) : null}
      </main>
      <SiteFooter darkMode={darkMode} />
    </div>
  );
};

export default ResourcesDetailPage;
