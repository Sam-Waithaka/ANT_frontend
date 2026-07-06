import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Archive, ArrowLeft, Eye, MoreHorizontal, PenLine, Rocket, Save, Send } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DocumentSettingsPanel, { type DocumentSettingsAction } from '../../../components/portal/writing/DocumentSettingsPanel';
import WritingPreview from '../../../components/portal/writing/WritingPreview';
import WritingWorkflowControls, { WritingPublishingPanel } from '../../../components/portal/writing/WritingWorkflowControls';
import WritingMediaEmbedPicker from '../../../components/portal/writing/media/WritingMediaEmbedPicker';
import CoverImagePicker from '../../../components/portal/writing/media/CoverImagePicker';
import ArticleEditor from '../../../components/portal/writing/editor/ArticleEditor';
import { createEmptyLexicalContent, normalizeLexicalContent, type LexicalContentJson } from '../../../components/portal/writing/editor/serialization';
import { extractImageBlocks, imageBlockRecordId, type ImageBlockMetadata } from '../../../components/portal/writing/editor/imageBlocks';
import { findWritingScriptureReference, scriptureDataToReferencePayload, scriptureReferenceToNodeData } from '../../../components/portal/writing/editor/scriptureReferences';
import WritingStatusBadge from '../../../components/portal/writing/WritingStatusBadge';
import WritingStudioShell from '../../../components/portal/writing/WritingStudioShell';
import { useAuth } from '../../../hooks/useAuth';
import { useDebouncedWritingSave } from '../../../hooks/useDebouncedWritingSave';
import { useTheme } from '../../../hooks/useTheme';
import { fetchMediaAsset, type MediaAsset } from '../../../services/mediaAssetsApi';
import { archiveWriting, createWritingMediaEmbed, createWritingRevision, createWritingScriptureReference, deleteWritingMediaEmbed, deleteWritingScriptureReference, fetchResourceTypes, fetchWriting, fetchWritingScriptureReferences, fetchWritingTags, publishWriting, returnWritingToDraft, scheduleWriting, submitWritingForReview, unscheduleWriting, updateWriting, updateWritingMediaEmbed, updateWritingScriptureReference } from '../../../services/writingApi';
import type { Writing, WritingAuthorAttribution, WritingResourceType, WritingTag, WritingUpdatePayload } from '../../../types/writing';
import type { WritingMediaEmbedLike } from '../../../components/portal/writing/editor/nodes/ChurchBlockMediaContext';
import type { ScriptureData } from '../../../components/portal/writing/editor/nodes/scriptureTypes';
import { canEditAnyWriting, canEditOwnWriting, canUploadMedia } from '../../../utils/permissions';
import { getWritingPublishingActions, getWritingWorkflowActions } from '../../../utils/writingActions';
import { buildWritingDraftPayload, type CoverImageChange } from '../../../utils/writingDraftPayload';

const canEdit = (permissions: string[], writing?: Writing | null) => {
  if (!writing) return false;
  if (writing.status === 'PUBLISHED') return false;
  if (canEditAnyWriting(permissions)) return true;
  return canEditOwnWriting(permissions) && ['DRAFT', 'IN_REVIEW', 'SCHEDULED'].includes(writing.status);
};

type WorkflowAction = 'returnToDraft' | 'schedule' | 'submitForReview' | 'unschedule';

const waitForMedia = (milliseconds: number) => new Promise((resolve) => globalThis.setTimeout(resolve, milliseconds));

const WritingEditorPage = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const { darkMode } = useTheme();
  const [actionSaving, setActionSaving] = useState(false);
  const [authorAttributions, setAuthorAttributions] = useState<WritingAuthorAttribution[]>([]);
  const [categoryIds, setCategoryIds] = useState<Array<number | string>>([]);
  const [contentJson, setContentJson] = useState<LexicalContentJson>(() => createEmptyLexicalContent());
  const [coverImage, setCoverImage] = useState<MediaAsset | null>(null);
  const [coverImageChange, setCoverImageChange] = useState<CoverImageChange>(undefined);
  const [coverImageId, setCoverImageId] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [mediaEmbeds, setMediaEmbeds] = useState<WritingMediaEmbedLike[]>([]);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);
  const [pendingMediaEmbed, setPendingMediaEmbed] = useState<WritingMediaEmbedLike | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [publishingPanelOpen, setPublishingPanelOpen] = useState(false);
  const [ministryIds, setMinistryIds] = useState<Array<number | string>>([]);
  const [resourceType, setResourceType] = useState('');
  const [resourceTypes, setResourceTypes] = useState<WritingResourceType[]>([]);
  const [seriesIds, setSeriesIds] = useState<Array<number | string>>([]);
  const [tagIds, setTagIds] = useState<Array<number | string>>([]);
  const [tagOptions, setTagOptions] = useState<WritingTag[]>([]);
  const [title, setTitle] = useState('');
  const [writing, setWriting] = useState<Writing | null>(null);
  const imageBlockSnapshot = useRef('');
  const knownImageEmbedIds = useRef(new Set<string>());

  useEffect(() => {
    const controller = new AbortController();
    fetchResourceTypes(auth.accessToken, controller.signal)
      .then((page) => setResourceTypes(page.results))
      .catch(() => setResourceTypes([]));
    fetchWritingTags(auth.accessToken, controller.signal)
      .then((page) => setTagOptions(page.results))
      .catch(() => setTagOptions([]));
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
        setCategoryIds((nextWriting.categories || []).map((item) => item.id));
        setSeriesIds((nextWriting.series || []).map((item) => item.id));
        setMinistryIds((nextWriting.ministries || []).map((item) => item.id));
        setTagIds((nextWriting.tags || []).map((item) => item.id));
        setAuthorAttributions(nextWriting.author_attributions || []);
        setSeriesIds((nextWriting.series || []).map((item) => item.id));
        setMinistryIds((nextWriting.ministries || []).map((item) => item.id));
        setTagIds((nextWriting.tags || []).map((item) => item.id));
        setAuthorAttributions(nextWriting.author_attributions || []);
        const normalizedContent = normalizeLexicalContent(nextWriting.content_json);
        setContentJson(normalizedContent);
        void fetchWritingScriptureReferences(auth.accessToken, nextWriting.id, controller.signal).then((page) => {
          setWriting((current) => current ? { ...current, scripture_references: page.results } : current);
        }).catch(() => undefined);
        setCoverImage((nextWriting.og_image_detail as MediaAsset | null) || null);
        setCoverImageChange(undefined);
        setCoverImageId(nextWriting.og_image ? String(nextWriting.og_image) : '');
        setMediaEmbeds((nextWriting.media_embeds || []) as WritingMediaEmbedLike[]);
        knownImageEmbedIds.current = new Set(extractImageBlocks(normalizedContent).flatMap((block) => { const recordId = imageBlockRecordId(block); return recordId === undefined ? [] : [String(recordId)]; }));
        imageBlockSnapshot.current = JSON.stringify(extractImageBlocks(normalizedContent));
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
  const draftPayload = useMemo<WritingUpdatePayload>(() => buildWritingDraftPayload({
    author_attributions: authorAttributions,
    category_ids: categoryIds,
    content_json: contentJson,
    excerpt,
    ministry_ids: ministryIds,
    resource_type: resourceType || null,
    series_ids: seriesIds,
    tag_ids: tagIds,
    title,
  }, coverImageChange), [authorAttributions, categoryIds, contentJson, coverImageChange, excerpt, ministryIds, resourceType, seriesIds, tagIds, title]);

  const persistDraft = useCallback(async (payload: WritingUpdatePayload) => {
    if (!writing) return;
    const nextWriting = await updateWriting(auth.accessToken, writing.id, payload);
    setWriting(nextWriting);
    if (Object.prototype.hasOwnProperty.call(payload, 'og_image')) setCoverImageChange(undefined);
  }, [auth.accessToken, writing]);

  const { saveNow, saveState } = useDebouncedWritingSave({
    enabled: editable,
    onSave: persistDraft,
    ready: Boolean(writing),
    value: draftPayload,
  });


  const runPublishNow = async (): Promise<boolean> => {
    if (!writing) return false;
    setActionSaving(true);
    setMessage('');
    try {
      await saveNow();
      setWriting(await publishWriting(auth.accessToken, writing.id));
      setMessage('Article published.');
      return true;
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to publish this article.');
      return false;
    } finally {
      setActionSaving(false);
    }
  };

  const runCreateRevision = async () => {
    if (!writing) return;
    setActionSaving(true);
    setMessage('');
    try {
      const revision = await createWritingRevision(auth.accessToken, writing.id);
      setMessage('Revision created. You can now modify the draft version.');
      navigate(`/portal/writing/${revision.id}`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to create a revision for this article.');
    } finally {
      setActionSaving(false);
    }
  };
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
    : 'w-full rounded-2xl border border-[#eaded0] bg-white px-4 py-3 text-sm text-zinc-950 outline-none focus:ring-2 focus:ring-red-800/30';
  const mutedTextClass = darkMode ? 'text-stone-400' : 'text-[#786f66]';
  const publishingActions = writing ? getWritingPublishingActions(auth.permissions, writing.status) : { canArchive: false, canPublish: false };
  const workflowActions = writing ? getWritingWorkflowActions(auth.permissions, writing.status) : { canPublish: false, canReturnToDraft: false, canSchedule: false, canSubmitForReview: false, canUnschedule: false };
  const canModifyPublished = Boolean(writing && writing.status === 'PUBLISHED' && canEditAnyWriting(auth.permissions));
  const showPublishingPanel = Boolean(writing && publishingPanelOpen && (workflowActions.canPublish || workflowActions.canSchedule));

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
    variant: 'secondary',
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
    setCoverImageChange(asset ? asset.id : null);
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

  const createScriptureReferenceForNode = useCallback(async (data: ScriptureData) => {
    if (!writing) return data;
    const payload = scriptureDataToReferencePayload(data);
    if (!payload) return data;
    const created = await createWritingScriptureReference(auth.accessToken, { ...payload, writing: writing.id });
    setWriting((current) => current ? { ...current, scripture_references: [...(current.scripture_references || []), created] } : current);
    return scriptureReferenceToNodeData(created, data);
  }, [auth.accessToken, writing]);

  const updateScriptureReferenceForNode = useCallback(async (data: ScriptureData, previousData?: ScriptureData) => {
    if (!writing) return data;
    const payload = scriptureDataToReferencePayload(data);
    const existingReference = findWritingScriptureReference(writing.scripture_references, previousData || data);
    if (!payload) {
      if (existingReference) {
        await deleteWritingScriptureReference(auth.accessToken, existingReference.id);
        setWriting((current) => current ? { ...current, scripture_references: (current.scripture_references || []).filter((reference) => String(reference.id) !== String(existingReference.id)) } : current);
      }
      return data;
    }
    if (!existingReference) {
      const created = await createWritingScriptureReference(auth.accessToken, { ...payload, writing: writing.id });
      setWriting((current) => current ? { ...current, scripture_references: [...(current.scripture_references || []), created] } : current);
      return scriptureReferenceToNodeData(created, data);
    }
    const updated = await updateWritingScriptureReference(auth.accessToken, existingReference.id, payload);
    setWriting((current) => current ? { ...current, scripture_references: (current.scripture_references || []).map((reference) => String(reference.id) === String(updated.id) ? updated : reference) } : current);
    return scriptureReferenceToNodeData(updated, data);
  }, [auth.accessToken, writing]);

  const deleteScriptureReferenceForNode = useCallback(async (data: ScriptureData) => {
    const existingReference = findWritingScriptureReference(writing?.scripture_references, data);
    if (!existingReference) return;
    await deleteWritingScriptureReference(auth.accessToken, existingReference.id);
    setWriting((current) => current ? { ...current, scripture_references: (current.scripture_references || []).filter((reference) => String(reference.id) !== String(existingReference.id)) } : current);
  }, [auth.accessToken, writing?.scripture_references]);
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
    const currentIds = new Set(blocks.flatMap((block) => { const recordId = imageBlockRecordId(block); return recordId === undefined ? [] : [String(recordId)]; }));
    const removedIds = [...knownImageEmbedIds.current].filter((embedId) => !currentIds.has(embedId));
    knownImageEmbedIds.current = currentIds;

    void Promise.all([
      ...blocks.map((block) => ({ block, recordId: imageBlockRecordId(block) })).filter((item): item is { block: ImageBlockMetadata; recordId: number | string } => item.recordId !== undefined).map(({ block, recordId }) => updateWritingMediaEmbed(auth.accessToken, recordId, {
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
  const saveStatusLabel = saveState === 'saved' ? 'Saved just now' : saveState === 'saving' ? 'Saving...' : saveState === 'error' ? 'Unable to save' : 'Draft changes are local';

  return (
    <WritingStudioShell compact hideNavigation>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-5 sm:mb-8">
        <div>
          <Link className={darkMode ? 'inline-flex items-center gap-2 text-xs font-bold text-stone-400 transition hover:text-stone-100' : 'inline-flex items-center gap-2 text-xs font-bold text-[#786f66] transition hover:text-zinc-950'} to="/portal/writing/articles"><ArrowLeft size={14} /> Back to Articles</Link>
          <h1 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">Writing Studio</h1>
          <p className={'mt-2 text-sm leading-6 ' + mutedTextClass}>Create and craft resources that strengthen the church.</p>
        </div>
        {writing ? <div className="flex flex-wrap items-center gap-3 pt-1"><WritingStatusBadge status={writing.status} /><span aria-live="polite" className={'inline-flex items-center gap-2 text-xs ' + mutedTextClass}><span className={'size-1.5 rounded-full ' + (saveState === 'error' ? 'bg-red-800' : saveState === 'saving' ? 'bg-amber-500' : 'bg-zinc-500')} />{saveStatusLabel}</span>{canModifyPublished ? <button className="inline-flex items-center gap-2 rounded-full border border-red-900/20 bg-white px-4 py-2 text-xs font-black text-red-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-red-950/5 disabled:cursor-not-allowed disabled:opacity-60" disabled={actionSaving} onClick={() => void runCreateRevision()} type="button"><PenLine size={15} /> Modify</button> : null}{publishingActions.canPublish ? <button className="inline-flex items-center gap-2 rounded-full bg-red-800 px-4 py-2 text-xs font-black text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60" disabled={actionSaving} onClick={() => setPublishingPanelOpen(true)} type="button"><Rocket size={15} /> Publish</button> : null}{publishingActions.canArchive ? <div className="relative"><button aria-expanded={moreActionsOpen} aria-haspopup="menu" className={darkMode ? 'inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs font-bold text-stone-200 hover:bg-white/10' : 'inline-flex items-center gap-2 rounded-full border border-[#eaded0] bg-white px-3 py-2 text-xs font-bold text-[#786f66] hover:bg-red-950/5'} onClick={() => setMoreActionsOpen((current) => !current)} type="button"><MoreHorizontal size={15} /> More actions</button>{moreActionsOpen ? <div className={darkMode ? 'absolute right-0 z-10 mt-2 w-36 rounded-2xl border border-white/10 bg-[#171717] p-2 shadow-xl' : 'absolute right-0 z-10 mt-2 w-36 rounded-2xl border border-[#eaded0] bg-white p-2 shadow-xl'} role="menu"><button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-red-800 hover:bg-red-950/5" disabled={actionSaving} onClick={() => { setMoreActionsOpen(false); void runArchive(); }} role="menuitem" type="button"><Archive size={14} /> Archive</button></div> : null}</div> : null}</div> : null}
      </header>
      {loading ? <p className={mutedTextClass}>Loading editor...</p> : null}
      {writing ? <div className={`grid gap-6 pb-24 lg:gap-8 lg:pb-0 ${showPublishingPanel ? 'lg:grid-cols-[minmax(0,1fr)_20rem_24rem]' : 'lg:grid-cols-[minmax(0,1fr)_20rem]'}`}>
        <section className="min-w-0">
          {previewMode ? <WritingPreview contentJson={contentJson} coverImage={coverImage} darkMode={darkMode} excerpt={excerpt} mediaEmbeds={mediaEmbeds} onCoverImageRefresh={refreshCoverImage} title={title} /> : <>
            <label className="mb-4 grid gap-2 text-sm font-bold"><span className="flex items-center justify-between gap-3">Working title <span className={'text-xs font-normal ' + mutedTextClass}>{title.length} / 120</span></span><input className={fieldClass} disabled={!editable} maxLength={120} onChange={(event) => setTitle(event.target.value)} placeholder="Give this resource a clear, pastoral title" value={title} /></label>
            {mediaPickerOpen ? <WritingMediaEmbedPicker accessToken={auth.accessToken} canUpload={canUploadMedia(auth.permissions)} darkMode={darkMode} onClose={() => setMediaPickerOpen(false)} onSelect={insertMediaEmbed} /> : null}
            <ArticleEditor contentJson={contentJson} darkMode={darkMode} editable={editable} mediaEmbeds={mediaEmbeds} onChange={(nextContent) => setContentJson(nextContent)} onCreateScriptureReference={createScriptureReferenceForNode} onDeleteScriptureReference={deleteScriptureReferenceForNode} onImageBlocksChange={syncImageBlocks} onPendingMediaInserted={() => setPendingMediaEmbed(null)} onRequestMedia={editable ? () => setMediaPickerOpen(true) : undefined} onUpdateScriptureReference={updateScriptureReferenceForNode} pendingMediaEmbed={pendingMediaEmbed} saveState={saveState} />
          </>}
        </section>
        <DocumentSettingsPanel actions={settingsActions} authorAttributions={authorAttributions} canManageAuthors={canEditAnyWriting(auth.permissions)} categoryIds={categoryIds} coverImageControl={<CoverImagePicker accessToken={auth.accessToken} canUpload={canUploadMedia(auth.permissions)} darkMode={darkMode} disabled={!editable} onChange={handleCoverImageChange} selectedAsset={coverImage} selectedAssetId={coverImageId} />} darkMode={darkMode} disabled={!editable} excerpt={excerpt} metadata={[{ label: 'Reading time', value: String(writing.reading_time_minutes || writing.readingTimeMinutes || 0) + ' minutes' }, { label: 'Last updated', value: writing.updated_at ? new Date(writing.updated_at).toLocaleString() : 'Not available' }]} ministryIds={ministryIds} onAuthorAttributionsChange={setAuthorAttributions} onCategoryIdsChange={setCategoryIds} onExcerptChange={setExcerpt} onMinistryIdsChange={setMinistryIds} onResourceTypeChange={setResourceType} onSeriesIdsChange={setSeriesIds} onTagIdsChange={setTagIds} resourceType={resourceType} resourceTypes={resourceTypes} seriesIds={seriesIds} status={writing.status} tagIds={tagIds} tagOptions={tagOptions} workflowControl={<WritingWorkflowControls canReturnToDraft={workflowActions.canReturnToDraft} canSubmitForReview={workflowActions.canSubmitForReview} canUnschedule={workflowActions.canUnschedule} darkMode={darkMode} onReturnToDraft={(note) => runWorkflowAction('returnToDraft', note)} onSubmitForReview={(note) => runWorkflowAction('submitForReview', note)} onUnschedule={() => runWorkflowAction('unschedule')} saving={actionSaving} scheduledFor={writing.scheduled_for} status={writing.status} workflowNotes={writing.workflow_notes} />} />
        {showPublishingPanel ? <div className="hidden lg:block"><WritingPublishingPanel canPublish={workflowActions.canPublish} canSchedule={workflowActions.canSchedule} darkMode={darkMode} onClose={() => setPublishingPanelOpen(false)} onPublish={runPublishNow} onSchedule={(scheduledFor) => runWorkflowAction('schedule', scheduledFor)} saving={actionSaving} scheduledFor={writing.scheduled_for} /></div> : null}
      </div> : null}
      {showPublishingPanel ? <div className="fixed inset-0 z-50 grid place-items-center p-3 lg:hidden" role="dialog" aria-modal="true" aria-label="Publishing"><button aria-label="Close publishing panel" className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setPublishingPanelOpen(false)} type="button" /><div className="relative z-10 max-h-[min(44rem,calc(100dvh-1.5rem))] w-full max-w-[34rem] overflow-y-auto rounded-[2rem]"><WritingPublishingPanel canPublish={workflowActions.canPublish} canSchedule={workflowActions.canSchedule} darkMode={darkMode} onClose={() => setPublishingPanelOpen(false)} onPublish={runPublishNow} onSchedule={(scheduledFor) => runWorkflowAction('schedule', scheduledFor)} saving={actionSaving} scheduledFor={writing?.scheduled_for} /></div></div> : null}
      {writing ? <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 px-4 lg:hidden"><div className={'pointer-events-auto mx-auto flex w-fit max-w-full items-center gap-2 rounded-[2rem] border p-2 shadow-2xl backdrop-blur-xl ' + (darkMode ? 'border-white/10 bg-zinc-950/90 shadow-black/40' : 'border-[#eaded0] bg-white/80 shadow-zinc-900/15')}><button aria-label="Save draft" className={darkMode ? 'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 text-sm font-bold text-stone-100 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40' : 'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#eaded0] bg-white/70 px-4 text-sm font-bold text-zinc-700 transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-40'} disabled={!editable || saveState === 'saving'} onClick={() => void saveNow()} type="button"><Save size={16} />{saveState === 'saving' ? 'Saving...' : 'Save'}</button><button aria-label={previewMode ? 'Back to editor' : 'Preview article'} className={previewMode ? 'inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-red-800 px-4 text-sm font-bold text-white shadow-lg shadow-red-950/20 transition hover:bg-red-700' : darkMode ? 'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 text-sm font-bold text-stone-100 transition hover:bg-white/15' : 'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-red-900/25 bg-white/80 px-4 text-sm font-bold text-red-800 transition hover:bg-red-950/5'} onClick={() => setPreviewMode((current) => !current)} type="button">{previewMode ? <ArrowLeft size={16} /> : <Eye size={16} />}{previewMode ? 'Editor' : 'Preview'}</button>{workflowActions.canSubmitForReview ? <button aria-label="Submit for review" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-red-800 px-5 text-sm font-bold text-white shadow-lg shadow-red-950/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50" disabled={actionSaving} onClick={() => void runWorkflowAction('submitForReview')} type="button"><Send size={16} />Submit</button> : <button aria-label="Open document settings" className={darkMode ? 'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 text-sm font-bold text-stone-100 transition hover:bg-white/15' : 'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#eaded0] bg-white/70 px-4 text-sm font-bold text-zinc-700 transition hover:bg-white/80'} onClick={() => document.querySelector('[aria-label="Document settings"]')?.scrollIntoView({ behavior: 'smooth' })} type="button"><MoreHorizontal size={16} />Settings</button>}</div></div> : null}
      {message ? <p className="mt-6 rounded-2xl bg-red-950/5 p-4 text-sm font-bold text-red-800">{message}</p> : null}
    </WritingStudioShell>
  );
};

export default WritingEditorPage;

