import type { MediaAsset } from "../../../services/mediaAssetsApi";
import ResponsiveImage from "../../media/ResponsiveImage";
import WritingArticleSurface from "../../writing/WritingArticleSurface";
import WritingContentRenderer from "../../writing/WritingContentRenderer";

type WritingPreviewProps = {
  contentJson?: unknown;
  coverImage?: MediaAsset | null;
  darkMode: boolean;
  excerpt?: string;
  onCoverImageRefresh?: () => Promise<MediaAsset | null>;
  title: string;
  mediaEmbeds?: import("../writing/editor/nodes/ChurchBlockMediaContext").WritingMediaEmbedLike[];
};

const WritingPreview = ({
  contentJson,
  coverImage,
  darkMode,
  excerpt,
  mediaEmbeds,
  onCoverImageRefresh,
  title,
}: WritingPreviewProps) => {
  const mutedTextClass = darkMode ? "text-stone-400" : "text-zinc-600";
  const dividerClass = darkMode ? "border-white/10" : "border-[#eaded0]";

  return (
    <WritingArticleSurface ariaLabel="Article preview" darkMode={darkMode} labelledBy="writing-preview-title">
      <div className="mx-auto max-w-3xl">
        {coverImage ? (
          <ResponsiveImage
            alt={coverImage.alt_text || coverImage.title || "Article cover image"}
            asset={coverImage}
            className="mb-8 aspect-[16/8] w-full rounded-[1.25rem] border border-black/5 object-cover shadow-sm dark:border-white/10"
            fetchPriority="high"
            loading="eager"
            onRefreshAsset={onCoverImageRefresh}
            preset="articleCover"
          />
        ) : null}
        <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800">
          Article Preview
        </p>
        <h1 id="writing-preview-title" className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
          {title || "Untitled article"}
        </h1>
        {excerpt ? (
          <p className={"mt-5 max-w-2xl text-lg leading-8 " + mutedTextClass}>
            {excerpt}
          </p>
        ) : null}
        <div className={"mt-8 border-t pt-8 " + dividerClass}>
          <WritingContentRenderer
            contentJson={contentJson}
            darkMode={darkMode}
            emptyMessage="Begin writing to see the article preview."
            mediaEmbeds={mediaEmbeds}
          />
        </div>
      </div>
    </WritingArticleSurface>
  );
};

export default WritingPreview;