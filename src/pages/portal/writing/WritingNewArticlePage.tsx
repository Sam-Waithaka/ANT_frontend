import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import DocumentSettingsPanel from '../../../components/portal/writing/DocumentSettingsPanel';
import WritingPreview from '../../../components/portal/writing/WritingPreview';
import CoverImagePicker from '../../../components/portal/writing/media/CoverImagePicker';
import ArticleEditor from '../../../components/portal/writing/editor/ArticleEditor';
import { createEmptyLexicalContent, type LexicalContentJson } from '../../../components/portal/writing/editor/serialization';
import { extractScriptureReferencesFromContent } from '../../../components/portal/writing/editor/scriptureReferences';
import WritingStudioShell from '../../../components/portal/writing/WritingStudioShell';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import { fetchMediaAsset, type MediaAsset } from '../../../services/mediaAssetsApi';
import { createWriting, createWritingScriptureReference, fetchResourceTypes, fetchWritingTags } from '../../../services/writingApi';
import type { WritingAuthorAttribution, WritingResourceType, WritingTag } from '../../../types/writing';
import { canCreateWriting, canUploadMedia } from '../../../utils/permissions';

const RESOURCE_TYPES_ERROR = 'Resource types could not be loaded. Please refresh and try again.';

const WritingNewArticlePage = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [authorAttributions, setAuthorAttributions] = useState<WritingAuthorAttribution[]>([]);
  const [categoryIds, setCategoryIds] = useState<Array<number | string>>([]);
  const [contentJson, setContentJson] = useState<LexicalContentJson>(() => createEmptyLexicalContent());
  const [coverImage, setCoverImage] = useState<MediaAsset | null>(null);
  const [error, setError] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [ministryIds, setMinistryIds] = useState<Array<number | string>>([]);
  const [resourceType, setResourceType] = useState('');
  const [resourceTypes, setResourceTypes] = useState<WritingResourceType[]>([]);
  const [resourceTypesError, setResourceTypesError] = useState('');
  const [resourceTypesLoading, setResourceTypesLoading] = useState(true);
  const [seriesIds, setSeriesIds] = useState<Array<number | string>>([]);
  const [saving, setSaving] = useState(false);
  const [tagIds, setTagIds] = useState<Array<number | string>>([]);
  const [tagOptions, setTagOptions] = useState<WritingTag[]>([]);
  const [title, setTitle] = useState('');

  const fieldClass = darkMode
    ? 'w-full rounded-2xl border border-white/10 bg-[#171717] px-4 py-3 text-sm text-stone-100 outline-none focus:ring-2 focus:ring-red-800/30'
    : 'w-full rounded-2xl border border-black/10 bg-[#fffaf0] px-4 py-3 text-sm text-zinc-950 outline-none focus:ring-2 focus:ring-red-800/30';
  const mutedTextClass = darkMode ? 'text-stone-400' : 'text-zinc-600';

  useEffect(() => {
    const controller = new AbortController();
    setResourceTypesLoading(true);
    setResourceTypesError('');

    fetchResourceTypes(auth.accessToken, controller.signal)
      .then((page) => setResourceTypes(page.results))
      .catch(() => {
        if (!controller.signal.aborted) {
          setResourceTypes([]);
          setResourceTypesError(RESOURCE_TYPES_ERROR);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setResourceTypesLoading(false);
      });
    fetchWritingTags(auth.accessToken, controller.signal)
      .then((page) => setTagOptions(page.results))
      .catch(() => setTagOptions([]));

    return () => controller.abort();
  }, [auth.accessToken]);

  const refreshCoverImage = async () => {
    if (!coverImage) return null;
    const refreshedAsset = await fetchMediaAsset(auth.accessToken, coverImage.id);
    setCoverImage(refreshedAsset);
    return refreshedAsset;
  };

  const createDraft = async () => {
    if (!canCreateWriting(auth.permissions)) return;
    if (!resourceTypes.length) {
      setError(RESOURCE_TYPES_ERROR);
      return;
    }
    if (!title.trim() || !resourceType) {
      setError('Add a title and resource type before creating the draft.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const writing = await createWriting(auth.accessToken, {
        ...(authorAttributions.length ? { author_attributions: authorAttributions } : {}),
        category_ids: categoryIds.length ? categoryIds : undefined,
        content_json: contentJson,
        excerpt,
        ...(ministryIds.length ? { ministry_ids: ministryIds } : {}),
        og_image: coverImage?.id || null,
        resource_type: resourceType,
        ...(seriesIds.length ? { series_ids: seriesIds } : {}),
        status: 'DRAFT',
        ...(tagIds.length ? { tag_ids: tagIds } : {}),
        title: title.trim(),
      });
      const scriptureReferences = extractScriptureReferencesFromContent(contentJson);
      if (scriptureReferences.length) {
        await Promise.all(scriptureReferences.map((reference) => createWritingScriptureReference(auth.accessToken, { ...reference, writing: writing.id })));
      }
      navigate('/portal/writing/' + writing.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create draft.');
    } finally {
      setSaving(false);
    }
  };

  const intro = (
    <div className="max-w-4xl">
      <Link className={darkMode ? 'inline-flex text-sm font-bold text-red-300 transition hover:text-red-100' : 'inline-flex text-sm font-bold text-red-800 transition hover:text-red-700'} to="/portal/writing/articles">
        Back to Articles
      </Link>
      <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-red-800">New Article</p>
      <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">Write a New Article</h1>
      <p className={'mt-4 max-w-2xl leading-7 ' + mutedTextClass}>
        Give this resource a clear title, then begin shaping the message for the church community.
      </p>
    </div>
  );

  return (
    <WritingStudioShell hideNavigation intro={intro}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="min-w-0">
          {previewMode ? (
            <WritingPreview contentJson={contentJson} coverImage={coverImage} darkMode={darkMode} excerpt={excerpt} onCoverImageRefresh={refreshCoverImage} title={title} />
          ) : (
            <>
              <label className="mb-4 grid gap-2 text-sm font-bold">
                Working title
                <input autoFocus className={fieldClass} maxLength={120} onChange={(event) => setTitle(event.target.value)} placeholder="Give this resource a clear, pastoral title" value={title} />
              </label>
              <ArticleEditor contentJson={contentJson} darkMode={darkMode} mediaDisabledLabel="Save draft to insert images" onChange={(nextContent) => setContentJson(nextContent)} saveState="idle" />
            </>
          )}
        </section>

        <DocumentSettingsPanel
          actions={[
            {
              icon: <Eye size={16} />,
              label: previewMode ? 'Return to editor' : 'Preview',
              onClick: () => setPreviewMode((current) => !current),
              variant: 'secondary',
            },
            {
              disabled: saving || resourceTypesLoading || resourceTypes.length === 0 || !canCreateWriting(auth.permissions),
              label: saving ? 'Creating draft...' : 'Create draft',
              onClick: () => void createDraft(),
              variant: 'primary',
            },
          ]}
          authorAttributions={authorAttributions}
          canManageAuthors
          categoryIds={categoryIds}
          coverImageControl={<CoverImagePicker accessToken={auth.accessToken} canUpload={canUploadMedia(auth.permissions)} darkMode={darkMode} onChange={setCoverImage} selectedAsset={coverImage} />}
          darkMode={darkMode}
          excerpt={excerpt}
          ministryIds={ministryIds}
          onAuthorAttributionsChange={setAuthorAttributions}
          onCategoryIdsChange={setCategoryIds}
          onExcerptChange={setExcerpt}
          onMinistryIdsChange={setMinistryIds}
          onResourceTypeChange={setResourceType}
          onSeriesIdsChange={setSeriesIds}
          onTagIdsChange={setTagIds}
          resourceType={resourceType}
          resourceTypes={resourceTypes}
          seriesIds={seriesIds}
          status="DRAFT"
          tagIds={tagIds}
          tagOptions={tagOptions}
        />
      </div>

      {resourceTypesError ? <p className="mt-6 rounded-2xl bg-red-950/5 p-4 text-sm font-bold text-red-800">{resourceTypesError}</p> : null}
      {error ? <p className="mt-4 rounded-2xl bg-red-950/5 p-4 text-sm font-bold text-red-800">{error}</p> : null}
    </WritingStudioShell>
  );
};

export default WritingNewArticlePage;

