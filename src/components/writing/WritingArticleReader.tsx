import type { ReactNode } from "react";
import ResponsiveImage from "../media/ResponsiveImage";
import { normalizeMediaAssetForDisplay } from "../../services/mediaAssetsApi";
import type {
  PublicWritingDetail,
  WritingMediaAsset,
  WritingMediaEmbed,
} from "../../types/writing";
import WritingArticleSurface from "./WritingArticleSurface";
import WritingContentRenderer from "./WritingContentRenderer";
import type { WritingMediaEmbedLike } from "./editor/nodes/ChurchBlockMediaContext";

type WritingArticleReaderProps = {
  contentJson?: unknown;
  coverImage?: WritingMediaAsset | null;
  darkMode: boolean;
  excerpt?: string;
  footer?: ReactNode;
  headerAction?: ReactNode;
  mediaEmbeds?: WritingMediaEmbed[];
  metadata?: ReactNode;
  title: string;
  writing?: PublicWritingDetail;
};

const hasContentJson = (contentJson: unknown) => {
  if (!contentJson || typeof contentJson !== "object") return false;
  const root = (contentJson as { root?: { children?: unknown[] } }).root;
  return Array.isArray(root?.children);
};

const WritingArticleReader = ({
  contentJson,
  coverImage,
  darkMode,
  excerpt,
  footer,
  headerAction,
  mediaEmbeds,
  metadata,
  title,
  writing,
}: WritingArticleReaderProps) => {
  const resolvedTitle = writing?.title || title || "Untitled article";
  const resolvedExcerpt = writing?.excerpt || excerpt || "";
  const resolvedCoverImage = writing?.og_image_detail || coverImage || null;
  const resolvedContentJson = writing?.content_json ?? contentJson;
  const resolvedMediaEmbeds = writing?.media_embeds || mediaEmbeds || [];
  const rendererMediaEmbeds = resolvedMediaEmbeds as WritingMediaEmbedLike[];
  const responsiveCoverImage = normalizeMediaAssetForDisplay(resolvedCoverImage);
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
        <header className="grid gap-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            {metadata ? (
              <div className={"min-w-0 text-sm " + mutedTextClass}>{metadata}</div>
            ) : <span />}
            {headerAction ? <div className="shrink-0 sm:ml-6">{headerAction}</div> : null}
          </div>
          <div>
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
          </div>
        </header>
        {responsiveCoverImage ? (
          <ResponsiveImage
            alt={
              resolvedCoverImage?.alt_text ||
              resolvedCoverImage?.title ||
              "Article cover image"
            }
            asset={responsiveCoverImage}
            className="mt-8 aspect-[16/7] w-full rounded-[1.25rem] border border-black/5 object-cover shadow-sm dark:border-white/10"
            fetchPriority="high"
            loading="eager"
            preset="articleCover"
          />
        ) : null}
        <div className={"mt-8 border-t pt-8 " + dividerClass}>
          <WritingContentRenderer
            contentJson={hasContentJson(resolvedContentJson) ? resolvedContentJson : null}
            darkMode={darkMode}
            emptyMessage="This article does not have content yet."
            mediaEmbeds={rendererMediaEmbeds}
          />
        </div>
      </article>
    </WritingArticleSurface>
  );
};

export default WritingArticleReader;
