import type { ReactNode } from "react";
import type {
  PublicWritingDetail,
  WritingMediaAsset,
  WritingMediaEmbed,
} from "../../types/writing";
import WritingArticleSurface from "./WritingArticleSurface";
import WritingContentRenderer from "./WritingContentRenderer";
import type { WritingMediaEmbedLike } from "./editor/nodes/ChurchBlockMediaContext";

type WritingArticleReaderProps = {
  contentHtml?: string;
  contentJson?: unknown;
  coverImage?: WritingMediaAsset | null;
  darkMode: boolean;
  excerpt?: string;
  footer?: ReactNode;
  mediaEmbeds?: WritingMediaEmbed[];
  metadata?: ReactNode;
  title: string;
  writing?: PublicWritingDetail;
};

const coverImageUrl = (asset?: WritingMediaAsset | null) =>
  asset?.url || asset?.image || asset?.file || "";

const hasContentJson = (contentJson: unknown) => {
  if (!contentJson || typeof contentJson !== "object") return false;
  const root = (contentJson as { root?: { children?: unknown[] } }).root;
  return Array.isArray(root?.children);
};

const WritingArticleReader = ({
  contentHtml,
  contentJson,
  coverImage,
  darkMode,
  excerpt,
  footer,
  mediaEmbeds,
  metadata,
  title,
  writing,
}: WritingArticleReaderProps) => {
  const resolvedTitle = writing?.title || title || "Untitled article";
  const resolvedExcerpt = writing?.excerpt || excerpt || "";
  const resolvedCoverImage = writing?.og_image_detail || coverImage || null;
  const resolvedContentJson = writing?.content_json ?? contentJson;
  const resolvedContentHtml = writing?.content_html || contentHtml || "";
  const resolvedMediaEmbeds = writing?.media_embeds || mediaEmbeds || [];
  const rendererMediaEmbeds = resolvedMediaEmbeds as WritingMediaEmbedLike[];
  const imageUrl = coverImageUrl(resolvedCoverImage);
  const mutedTextClass = darkMode ? "text-stone-400" : "text-zinc-600";
  const dividerClass = darkMode ? "border-white/10" : "border-[#eaded0]";

  return (
    <WritingArticleSurface
      ariaLabel="Published writing"
      darkMode={darkMode}
      footer={footer}
      labelledBy="writing-article-reader-title"
    >
      <article className="mx-auto max-w-3xl">
        {imageUrl ? (
          <img
            alt={
              resolvedCoverImage?.alt_text ||
              resolvedCoverImage?.title ||
              "Article cover image"
            }
            className="mb-8 aspect-[16/8] w-full rounded-[1.25rem] border border-black/5 object-cover shadow-sm dark:border-white/10"
            src={imageUrl}
          />
        ) : null}
        {metadata ? (
          <div className={"mb-4 text-sm " + mutedTextClass}>{metadata}</div>
        ) : null}
        <h1
          id="writing-article-reader-title"
          className="font-serif text-4xl leading-tight sm:text-5xl"
        >
          {resolvedTitle}
        </h1>
        {resolvedExcerpt ? (
          <p className={"mt-5 max-w-2xl text-lg leading-8 " + mutedTextClass}>
            {resolvedExcerpt}
          </p>
        ) : null}
        <div className={"mt-8 border-t pt-8 " + dividerClass}>
          {hasContentJson(resolvedContentJson) ? (
            <WritingContentRenderer
              contentJson={resolvedContentJson}
              darkMode={darkMode}
              emptyMessage="This article does not have content yet."
              mediaEmbeds={rendererMediaEmbeds}
            />
          ) : resolvedContentHtml ? (
            <div
              className={darkMode ? "text-stone-100" : "text-zinc-950"}
              dangerouslySetInnerHTML={{ __html: resolvedContentHtml }}
            />
          ) : (
            <WritingContentRenderer
              contentJson={resolvedContentJson}
              darkMode={darkMode}
              emptyMessage="This article does not have content yet."
              mediaEmbeds={rendererMediaEmbeds}
            />
          )}
        </div>
      </article>
    </WritingArticleSurface>
  );
};

export default WritingArticleReader;
