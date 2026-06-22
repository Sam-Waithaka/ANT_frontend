import { useCallback, useEffect, useMemo, useState } from 'react';
import { Archive, ArrowLeft, Eye, Save, Send } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import DocumentSettingsPanel, { type DocumentSettingsAction } from '../../../components/portal/writing/DocumentSettingsPanel';
import WritingPreview from '../../../components/portal/writing/WritingPreview';
import CoverImagePicker from '../../../components/portal/writing/media/CoverImagePicker';
import ArticleEditor from '../../../components/portal/writing/editor/ArticleEditor';
import { createEmptyLexicalContent, normalizeLexicalContent, type LexicalContentJson } from '../../../components/portal/writing/editor/serialization';
import WritingStatusBadge from '../../../components/portal/writing/WritingStatusBadge';
import WritingStudioShell from '../../../components/portal/writing/WritingStudioShell';
import { useAuth } from '../../../hooks/useAuth';
import { useDebouncedWritingSave } from '../../../hooks/useDebouncedWritingSave';
import { useTheme } from '../../../hooks/useTheme';
import type { MediaAsset } from '../../../services/mediaAssetsApi';
import { archiveWriting, fetchResourceTypes, fetchWriting, publishWriting, updateWriting } from '../../../services/writingApi';
import type { Writing, WritingResourceType, WritingUpdatePayload } from '../../../types/writing';
import { canEditAnyWriting, canEditOwnWriting, canUploadMedia } from '../../../utils/permissions';
import { getWritingPublishingActions } from '../../../utils/writingActions';

const canEdit = (permissions: string[], writing?: Writing | null) => {
  if (!writing) return false;
  if (canEditAnyWriting(permissions)) return true;
  return canEditOwnWriting(permissions) && ['DRAFT', 'IN_REVIEW', 'SCHEDULED'].includes(writing.status);
};

const WritingEditorPage = () => {
  const { id = '' } = useParams();
  const auth = useAuth();
  const { darkMode } = useTheme();
  const [actionSaving, setActionSaving] = useState(false);
  const [category, setCategory] = useState('');
  const [contentJson, setContentJson] = useState<LexicalContentJson>(() => createEmptyLexicalContent());
  const [coverImage, setCoverImage] = useState<MediaAsset | null>(null);
  const [coverImageId, setCoverImageId] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [resourceType, setResourceType] = useState('');
  const [resourceTypes, setResourceTypes] = useState<WritingResourceType[]>([]);
  const [title, setTitle] = useState('');
  const [writing, setWriting] = useState<Writing | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchResourceTypes(auth.accessToken, controller.signal)
      .then((page) => setResourceTypes(page.results))
      .catch(() => setResourceTypes([]));
    return () => controller.abort();
  }, [auth.accessToken]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setMessage('');
    setWriting(null);

    fetchWriting(auth.accessToken, id, controller.signal)
      .then((nextWriting) => {
        setWriting(nextWriting);
        setTitle(nextWriting.title || '');
        setExcerpt(nextWriting.excerpt || '');
        setResourceType(nextWriting.resource_type ? String(nextWriting.resource_type) : '');
        setCategory(nextWriting.categories?.[0] ? String(nextWriting.categories[0].id) : '');
        setContentJson(normalizeLexicalContent(nextWriting.content_json));
        setCoverImage((nextWriting.og_image_detail as MediaAsset | null) || null);
        setCoverImageId(nextWriting.og_image ? String(nextWriting.og_image) : '');
      })
      .catch((err) => {
        if (!controller.signal.aborted) setMessage(err instanceof Error ? err.message : 'Unable to load writing.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [auth.accessToken, id]);

  const editable = canEdit(auth.permissions, writing);
  const draftPayload = useMemo<WritingUpdatePayload>(() => ({
    category_ids: category ? [category] : [],
    content_json: contentJson,
    excerpt,
    og_image: coverImageId || null,
    resource_type: resourceType || null,
    title,
  }), [category, contentJson, coverImageId, excerpt, resourceType, title]);

  const persistDraft = useCallback(async (payload: WritingUpdatePayload) => {
    if (!writing) return;
    const nextWriting = await updateWriting(auth.accessToken, writing.id, payload);
    setWriting(nextWriting);
  }, [auth.accessToken, writing]);

  const { saveNow, saveState } = useDebouncedWritingSave({
    enabled: editable,
    onSave: persistDraft,
    ready: Boolean(writing),
    value: draftPayload,
  });

  const runAction = async (action: 'archive' | 'publish') => {
    if (!writing) return;
    setActionSaving(true);
    setMessage('');

    try {
      const nextWriting = action === 'publish'
        ? await publishWriting(auth.accessToken, writing.id)
        : await archiveWriting(auth.accessToken, writing.id);
      setWriting(nextWriting);
      setMessage(action === 'publish' ? 'Article published.' : 'Article archived.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setActionSaving(false);
    }
  };

  const fieldClass = darkMode
    ? 'w-full rounded-2xl border border-white/10 bg-[#171717] px-4 py-3 text-sm text-stone-100 outline-none focus:ring-2 focus:ring-red-800/30'
    : 'w-full rounded-2xl border border-black/10 bg-[#fffaf0] px-4 py-3 text-sm text-zinc-950 outline-none focus:ring-2 focus:ring-red-800/30';
  const mutedTextClass = darkMode ? 'text-stone-400' : 'text-zinc-600';
  const publishingActions = writing ? getWritingPublishingActions(auth.permissions, writing.status) : { canArchive: false, canPublish: false };

  const settingsActions: DocumentSettingsAction[] = [{
    icon: <Eye size={16} />,
    label: previewMode ? 'Return to editor' : 'Preview',
    onClick: () => setPreviewMode((current) => !current),
    variant: 'secondary',
  }];
  if (publishingActions.canPublish) {
    settingsActions.push({
      disabled: actionSaving,
      icon: <Send size={16} />,
      label: 'Publish',
      onClick: () => void runAction('publish'),
      variant: 'primary',
    });
  }
  settingsActions.push({
    disabled: !editable || saveState === 'saving',
    icon: <Save size={16} />,
    label: saveState === 'saving' ? 'Saving...' : 'Save draft',
    onClick: () => void saveNow(),
    variant: publishingActions.canPublish ? 'secondary' : 'primary',
  });
  if (publishingActions.canArchive) {
    settingsActions.push({
      disabled: actionSaving,
      icon: <Archive size={16} />,
      label: 'Archive',
      onClick: () => void runAction('archive'),
      variant: 'danger',
    });
  }

  const handleCoverImageChange = (asset: MediaAsset | null) => {
    setCoverImage(asset);
    setCoverImageId(asset ? String(asset.id) : '');
  };

  return (
    <WritingStudioShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link className={darkMode ? 'inline-flex items-center gap-2 text-sm font-black text-stone-300' : 'inline-flex items-center gap-2 text-sm font-black text-zinc-700'} to="/portal/writing/articles">
          <ArrowLeft size={16} /> Articles
        </Link>
      </div>

      {loading ? <p className={mutedTextClass}>Loading editor...</p> : null}

      {writing ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <section className="min-w-0">
            {previewMode ? (
              <WritingPreview contentJson={contentJson} coverImage={coverImage} darkMode={darkMode} excerpt={excerpt} title={title} />
            ) : (
              <>
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <WritingStatusBadge status={writing.status} />
                  <span className={'text-sm ' + mutedTextClass}>Draft saved through the Writing Studio.</span>
                </div>
                <label className="mb-4 grid gap-2 text-sm font-bold">
                  Working title
                  <input className={fieldClass} disabled={!editable} maxLength={120} onChange={(event) => setTitle(event.target.value)} value={title} />
                </label>
                <ArticleEditor contentJson={contentJson} darkMode={darkMode} editable={editable} onChange={(nextContent) => setContentJson(nextContent)} saveState={saveState} />
              </>
            )}
          </section>

          <DocumentSettingsPanel
            actions={settingsActions}
            category={category}
            coverImageControl={<CoverImagePicker accessToken={auth.accessToken} canUpload={canUploadMedia(auth.permissions)} darkMode={darkMode} disabled={!editable} onChange={handleCoverImageChange} selectedAsset={coverImage} selectedAssetId={coverImageId} />}
            darkMode={darkMode}
            disabled={!editable}
            excerpt={excerpt}
            metadata={[
              { label: 'Reading time', value: String(writing.reading_time_minutes || writing.readingTimeMinutes || 0) + ' minutes' },
              { label: 'Last updated', value: writing.updated_at ? new Date(writing.updated_at).toLocaleString() : 'Not available' },
            ]}
            onCategoryChange={setCategory}
            onExcerptChange={setExcerpt}
            onResourceTypeChange={setResourceType}
            resourceType={resourceType}
            resourceTypes={resourceTypes}
            status={writing.status}
          />
        </div>
      ) : null}

      {message ? <p className="mt-6 rounded-2xl bg-red-950/5 p-4 text-sm font-bold text-red-800">{message}</p> : null}
    </WritingStudioShell>
  );
};

export default WritingEditorPage;
