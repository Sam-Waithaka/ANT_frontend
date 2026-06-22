import type { MediaAsset } from '../../../services/mediaAssetsApi';
import { mediaAssetImageUrl } from '../../../services/mediaAssetsApi';
import WritingContentRenderer from '../../writing/WritingContentRenderer';

type WritingPreviewProps = {
  contentJson?: unknown;
  coverImage?: MediaAsset | null;
  darkMode: boolean;
  excerpt?: string;
  title: string;
};

const WritingPreview = ({ contentJson, coverImage, darkMode, excerpt, title }: WritingPreviewProps) => {
  const coverImageUrl = mediaAssetImageUrl(coverImage);
  const surfaceClass = darkMode ? 'border-white/10 bg-zinc-950 text-stone-100 shadow-black/25' : 'border-black/10 bg-white text-zinc-950 shadow-zinc-900/5';
  const mutedTextClass = darkMode ? 'text-stone-400' : 'text-zinc-600';

  return (
    <article aria-label="Article preview" className={'overflow-hidden rounded-3xl border shadow-lg ' + surfaceClass}>
      {coverImageUrl ? <img alt={coverImage?.alt_text || coverImage?.title || 'Article cover image'} className="aspect-[16/8] w-full object-cover" src={coverImageUrl} /> : null}
      <div className="mx-auto max-w-3xl px-6 py-8 sm:px-10 sm:py-12">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800">Article Preview</p>
        <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">{title || 'Untitled article'}</h1>
        {excerpt ? <p className={'mt-5 max-w-2xl text-lg leading-8 ' + mutedTextClass}>{excerpt}</p> : null}
        <div className={'mt-8 border-t pt-8 ' + (darkMode ? 'border-white/10' : 'border-black/10')}>
          <WritingContentRenderer contentJson={contentJson} darkMode={darkMode} emptyMessage="Begin writing to see the article preview." />
        </div>
      </div>
    </article>
  );
};

export default WritingPreview;