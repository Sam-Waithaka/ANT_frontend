import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Archive, ArrowLeft, Eye, Save } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import DocumentSettingsPanel, { type DocumentSettingsAction } from '../../../components/portal/writing/DocumentSettingsPanel';
import WritingPreview from '../../../components/portal/writing/WritingPreview';
import WritingWorkflowControls from '../../../components/portal/writing/WritingWorkflowControls';
import WritingMediaEmbedPicker from '../../../components/portal/writing/media/WritingMediaEmbedPicker';
import CoverImagePicker from '../../../components/portal/writing/media/CoverImagePicker';
import ArticleEditor from '../../../components/portal/writing/editor/ArticleEditor';
import { createEmptyLexicalContent, normalizeLexicalContent, type LexicalContentJson } from '../../../components/portal/writing/editor/serialization';
import { extractImageBlocks, type ImageBlockMetadata } from '../../../components/portal/writing/editor/imageBlocks';
import WritingStatusBadge from '../../../components/portal/writing/WritingStatusBadge';
import WritingStudioShell from '../../../components/portal/writing/WritingStudioShell';
import { useAuth } from '../../../hooks/useAuth';
import { useDebouncedWritingSave } from '../../../hooks/useDebouncedWritingSave';
import { useTheme } from '../../../hooks/useTheme';
import { fetchMediaAsset, type MediaAsset } from '../../../services/mediaAssetsApi';
import { archiveWriting, createWritingMediaEmbed, deleteWritingMediaEmbed, fetchResourceTypes, fetchWriting, returnWritingToDraft, scheduleWriting, submitWritingForReview, unscheduleWriting, updateWriting, updateWritingMediaEmbed } from '../../../services/writingApi';
import type { Writing, WritingResourceType, WritingUpdatePayload } from '../../../types/writing';
import type { WritingMediaEmbedLike } from '../../../components/portal/writing/editor/nodes/ChurchBlockMediaContext';
import { canEditAnyWriting, canEditOwnWriting, canUploadMedia } from '../../../utils/permissions';
import { getWritingPublishingActions, getWritingWorkflowActions } from '../../../utils/writingActions';

const canEdit = (permissions: string[], writing?: Writing | null) => {
  if (!writing) return false;
  if (canEditAnyWriting(permissions)) return true;
  return canEditOwnWriting(permissions) && ['DRAFT', 'IN_REVIEW', 'SCHEDULED'].includes(writing.status);
};

type WorkflowAction = 'returnToDraft' | 'schedule' | 'submitForReview' | 'unschedule';

const waitForMedia = (milliseconds: number) => new Promise((resolve) => globalThis.setTimeout(resolve, milliseconds));

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
  const [mediaEmbeds, setMediaEmbeds] = useState<WritingMediaEmbedLike[]>([]);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [pendingMediaEmbed, setPendingMediaEmbed] = useState<WritingMediaEmbedLike | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [resourceType, setResourceType] = useState('');
  const [resourceTypes, setResourceTypes] = useState<WritingResourceType[]>([]);
  const [title, setTitle] = useState('');
  const [writing, setWriting] = useState<Writing | null>(null);
  const imageBlockSnapshot = useRef('');
  const knownImageEmbedIds = useRef(new Set<string>());

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
        setMediaEmbeds((nextWriting.media_embeds || []) as WritingMediaEmbedLike[]);
        knownImageEmbedIds.current = new Set(extractImageBlocks(nextWriting.content_json).flatMap((block) => block.embedId === undefined ? [] : [String(block.embedId)]));
        imageBlockSnapshot.current = JSON.stringify(extractImageBlocks(nextWriting.content_json));
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

  const runArchive = async () => {
    if (!writing) return;
    setActionSaving(true);
    setMessage('');
    try {
      setWriting(await archiveWriting(auth.accessToken, writing.id));
      setMessage('Article archived.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to archive this article.');
    } finally {
      setActionSaving(false);
    }
  };

  const runWorkflowAction = async (action: WorkflowAction, value = ''): Promise<boolean> => {
    if (!writing) return false;
    setActionSaving(true);
    setMessage('');
    try {
      const nextWriting = action === 'submitForReview'
        ? await submitWritingForReview(auth.accessToken, writing.id, value)
        : action === 'returnToDraft'
          ? await returnWritingToDraft(auth.accessToken, writing.id, value)
          : action === 'schedule'
            ? await scheduleWriting(auth.accessToken, writing.id, value)
            : await unscheduleWriting(auth.accessToken, writing.id);
      setWriting(nextWriting);
      setMessage(action === 'submitForReview' ? 'Article submitted for review.' : action === 'returnToDraft' ? 'Article returned to draft.' : action === 'schedule' ? 'Publication scheduled.' : 'Scheduling cancelled.');
      return true;
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Editorial action failed.');
      return false;
    } finally {
      setActionSaving(false);
    }
  };

  const fieldClass = darkMode
    ? 'w-full rounded-2xl border border-white/10 bg-[#171717] px-4 py-3 text-sm text-stone-100 outline-none focus:ring-2 focus:ring-red-800/30'
    : 'w-full rounded-2xl border border-black/10 bg-[#fffaf0] px-4 py-3 text-sm text-zinc-950 outline-none focus:ring-2 focus:ring-red-800/30';
  const mutedTextClass = darkMode ? 'text-stone-400' : 'text-zinc-600';
  const publishingActions = writing ? getWritingPublishingActions(auth.permissions, writing.status) : { canArchive: false, canPublish: false };
  const workflowActions = writing ? getWritingWorkflowActions(auth.permissions, writing.status) : { canReturnToDraft: false, canSchedule: false, canSubmitForReview: false, canUnschedule: false };

  const settingsActions: DocumentSettingsAction[] = [{
    icon: <Eye size={16} />,
    label: previewMode ? 'Return to editor' : 'Preview',
    onClick: () => setPreviewMode((current) => !current),
    variant: 'secondary',
  }, {
    disabled: !editable || saveState === 'saving',
    icon: <Save size={16} />,
    label: saveState === 'saving' ? 'Saving...' : 'Save draft',
    onClick: () => void saveNow(),
    variant: 'primary',
  }];
  if (publishingActions.canArchive) {
    settingsActions.push({
      disabled: actionSaving,
      icon: <Archive size={16} />,
      label: 'Archive',
      onClick: () => void runArchive(),
      variant: 'danger',
    });
  }

  const handleCoverImageChange = (asset: MediaAsset | null) => {
    setCoverImage(asset);
    setCoverImageId(asset ? String(asset.id) : '');
  };

  const refreshCoverImage = useCallback(async () => {
    if (!coverImage) return null;
    const refreshedAsset = await fetchMediaAsset(auth.accessToken, coverImage.id);
    setCoverImage(refreshedAsset);
    return refreshedAsset;
  }, [auth.accessToken, coverImage]);

  const refreshInlineMedia = useCallback(async (assetId: number | string) => {
    for (let attempt = 0; attempt < 30; attempt += 1) {
      await waitForMedia(2_000);
      const asset = await fetchMediaAsset(auth.accessToken, assetId);
      if (asset.status === 'ready') {
        setMediaEmbeds((current) => current.map((embed) => String(embed.media_asset) === String(assetId) ? { ...embed, media_asset_detail: asset } : embed));
        return;
      }
      if (asset.status === 'failed') {
        setMessage('The uploaded image could not be processed.');
        return;
      }
    }
  }, [auth.accessToken]);

  const insertMediaEmbed = async (asset: MediaAsset) => {
    if (!writing) return;
    const created = await createWritingMediaEmbed(auth.accessToken, {
      media_asset: asset.id,
      position_hint: 'root.children',
      writing: writing.id,
    });
    const mediaEmbed = { ...created, media_asset_detail: created.media_asset_detail || asset } as unknown as WritingMediaEmbedLike;
    setMediaEmbeds((current) => [...current, mediaEmbed]);
    setPendingMediaEmbed(mediaEmbed);
    if (asset.status !== 'ready') void refreshInlineMedia(asset.id).catch(() => setMessage('Unable to refresh the uploaded image.'));
  };
  const syncImageBlocks = useCallback((blocks: ImageBlockMetadata[]) => {
    if (!writing) return;
    const snapshot = JSON.stringify(blocks);
    if (snapshot === imageBlockSnapshot.current) return;
    imageBlockSnapshot.current = snapshot;
    const currentIds = new Set(blocks.flatMap((block) => block.embedId === undefined ? [] : [String(block.embedId)]));
    const removedIds = [...knownImageEmbedIds.current].filter((embedId) => !currentIds.has(embedId));
    knownImageEmbedIds.current = currentIds;

    void Promise.all([
      ...blocks.filter((block) => block.embedId !== undefined).map((block) => updateWritingMediaEmbed(auth.accessToken, block.embedId as number | string, {
        alt_text_override: block.altText,
        caption_override: block.caption,
        position_hint: block.positionHint,
      })),
      ...removedIds.map((embedId) => deleteWritingMediaEmbed(auth.accessToken, embedId)),
    ]).then(() => {
      setMediaEmbeds((current) => current.filter((embed) => currentIds.has(String(embed.id))));
    }).catch((err) => {
      setMessage(err instanceof Error ? err.message : 'Unable to synchronize inline media.');
    });
  }, [auth.accessToken, writing]);
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
              <WritingPreview contentJson={contentJson} coverImage={coverImage} darkMode={darkMode} excerpt={excerpt} mediaEmbeds={mediaEmbeds} onCoverImageRefresh={refreshCoverImage} title={title} />
            ) : (
              <>
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <WritingStatusBadge status={writing.status} />
                  <span className={'text-sm ' + mutedTextClass}>Writing Studio saves changes quietly as you work.</span>
                </div>
                <label className="mb-4 grid gap-2 text-sm font-bold">
                  Working title
                  <input className={fieldClass} disabled={!editable} maxLength={120} onChange={(event) => setTitle(event.target.value)} value={title} />
                </label>
                {mediaPickerOpen ? <WritingMediaEmbedPicker accessToken={auth.accessToken} canUpload={canUploadMedia(auth.permissions)} darkMode={darkMode} onClose={() => setMediaPickerOpen(false)} onSelect={insertMediaEmbed} /> : null}
                <ArticleEditor contentJson={contentJson} darkMode={darkMode} editable={editable} mediaEmbeds={mediaEmbeds} onChange={(nextContent) => setContentJson(nextContent)} onImageBlocksChange={syncImageBlocks} onPendingMediaInserted={() => setPendingMediaEmbed(null)} onRequestMedia={editable ? () => setMediaPickerOpen(true) : undefined} pendingMediaEmbed={pendingMediaEmbed} saveState={saveState} />
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
            workflowControl={<WritingWorkflowControls {...workflowActions} darkMode={darkMode} onReturnToDraft={(note) => runWorkflowAction('returnToDraft', note)} onSchedule={(scheduledFor) => runWorkflowAction('schedule', scheduledFor)} onSubmitForReview={(note) => runWorkflowAction('submitForReview', note)} onUnschedule={() => runWorkflowAction('unschedule')} saving={actionSaving} scheduledFor={writing.scheduled_for} status={writing.status} workflowNotes={writing.workflow_notes} />}
          />
        </div>
      ) : null}

      {message ? <p className="mt-6 rounded-2xl bg-red-950/5 p-4 text-sm font-bold text-red-800">{message}</p> : null}
    </WritingStudioShell>
  );
};

export default WritingEditorPage;








