import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FileText, GalleryHorizontal, Plus, Save } from 'lucide-react';
import ArticleEditor from '../writing/editor/ArticleEditor';
import MemorialWorkflowControls from './MemorialWorkflowControls';
import WritingMediaEmbedPicker from '../writing/media/WritingMediaEmbedPicker';
import { portalSurface } from '../portalSurface';
import { useAuth } from '../../../hooks/useAuth';
import { useDebouncedWritingSave } from '../../../hooks/useDebouncedWritingSave';
import { usePortalToast } from '../PortalToast';
import type { MediaAsset } from '../../../services/mediaAssetsApi';
import {
  createMemorialRichTextBlock,
  createMemorialRichTextMediaEmbed,
  createMemorialRichTextScriptureReference,
  deleteMemorialRichTextMediaEmbed,
  deleteMemorialRichTextScriptureReference,
  updateMemorialRichTextBlock,
  updateMemorialRichTextMediaEmbed,
  updateMemorialRichTextScriptureReference,
} from '../../../services/memorialApi';
import type {
  MemorialEditorState,
  MemorialRichTextBlock,
  MemorialRichTextMediaEmbed,
  MemorialRichTextScriptureReference,
  MemorialRichTextSectionKey,
  MemorialWorkflowStatus,
} from '../../../types/memorial';
import {
  createEmptyLexicalContent,
  type LexicalContentJson,
} from '../../writing/editor/serialization';
import {
  extractImageBlocks,
  imageBlockRecordId,
  type ImageBlockMetadata,
} from '../../writing/editor/imageBlocks';
import type { WritingMediaEmbedLike } from '../../writing/editor/nodes/ChurchBlockMediaContext';
import type { ScriptureData } from '../../writing/editor/nodes/scriptureTypes';
import {
  findMemorialScriptureReference,
  memorialBlockContent,
  memorialMediaEmbedsForBlock,
  memorialScriptureReferenceToNodeData,
  scriptureDataToMemorialReferencePayload,
} from '../../../utils/memorialAdapters';
import {
  getMemorialSectionLabel,
  type MemorialEditorBlockModel,
  type MemorialEditorModel,
} from '../../../utils/memorialEditorState';
import {
  MEMORIAL_WORKFLOW_STATUSES,
  getMemorialStatusLabel,
} from '../../../utils/memorialWorkflow';
import { canUploadMedia } from '../../../utils/permissions';

export type MemorialEditorStateUpdater = (
  updater: (current: MemorialEditorState) => MemorialEditorState,
) => void;

type MemorialRichTextSectionsEditorProps = {
  darkMode: boolean;
  model: MemorialEditorModel;
  onEditorStateChange: MemorialEditorStateUpdater;
};

type MemorialRichTextBlockEditorProps = {
  blockModel: MemorialEditorBlockModel;
  darkMode: boolean;
  onEditorStateChange: MemorialEditorStateUpdater;
};

type BlockDraft = {
  content_json: LexicalContentJson;
  is_visible: boolean;
  status: MemorialWorkflowStatus;
  subtitle: string;
  title: string;
};

const idKey = (value: number | string) => String(value);

const recordIdsFromBlocks = (blocks: ImageBlockMetadata[]) =>
  blocks.flatMap((block) => {
    const recordId = imageBlockRecordId(block);
    return recordId === undefined ? [] : [idKey(recordId)];
  });

const replaceRecord = <T extends { id: number | string }>(items: T[], next: T) =>
  items.map((item) => idKey(item.id) === idKey(next.id) ? next : item);

const appendRecord = <T extends { id: number | string }>(items: T[], next: T) => {
  if (items.some((item) => idKey(item.id) === idKey(next.id))) {
    return replaceRecord(items, next);
  }
  return [...items, next];
};

const removeRecord = <T extends { id: number | string }>(
  items: T[],
  recordId: number | string,
) => items.filter((item) => idKey(item.id) !== idKey(recordId));

const editorMediaEmbed = (
  embed: MemorialRichTextMediaEmbed,
): WritingMediaEmbedLike => ({
  alt_text_override: embed.alt_text_override,
  caption_override: embed.caption_override,
  embed_id: embed.embed_id,
  id: embed.id,
  media_asset: embed.media_asset,
  media_asset_detail: embed.media_asset_detail as WritingMediaEmbedLike['media_asset_detail'],
});

const createBlockDraft = (block: MemorialRichTextBlock): BlockDraft => ({
  content_json: memorialBlockContent(block),
  is_visible: Boolean(block.is_visible),
  status: block.status,
  subtitle: block.subtitle || '',
  title: block.title || '',
});

const sectionEmptyText = (sectionKey: MemorialRichTextSectionKey) =>
  `No ${getMemorialSectionLabel(sectionKey).toLowerCase()} block has been created yet.`;

const MemorialRichTextBlockEditor = ({
  blockModel,
  darkMode,
  onEditorStateChange,
}: MemorialRichTextBlockEditorProps) => {
  const auth = useAuth();
  const { block } = blockModel;
  const [blockError, setBlockError] = useState('');
  const [draft, setDraft] = useState<BlockDraft>(() => createBlockDraft(block));
  const [mediaEmbeds, setMediaEmbeds] = useState(blockModel.mediaEmbeds);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [pendingMediaEmbed, setPendingMediaEmbed] = useState<WritingMediaEmbedLike | null>(null);
  const [scriptureReferences, setScriptureReferences] = useState(blockModel.scriptureReferences);
  const imageBlockSnapshot = useRef('');
  const knownImageEmbedIds = useRef(new Set<string>());

  useEffect(() => {
    const nextDraft = createBlockDraft(block);
    const imageBlocks = extractImageBlocks(nextDraft.content_json);
    setBlockError('');
    setDraft(nextDraft);
    setMediaEmbeds(blockModel.mediaEmbeds);
    setPendingMediaEmbed(null);
    setScriptureReferences(blockModel.scriptureReferences);
    imageBlockSnapshot.current = JSON.stringify(imageBlocks);
    knownImageEmbedIds.current = new Set(recordIdsFromBlocks(imageBlocks));
  }, [block.id]);

  const fieldClass = darkMode
    ? 'w-full rounded-2xl border border-white/10 bg-[#171717] px-4 py-3 text-sm text-stone-100 outline-none focus:ring-2 focus:ring-red-800/30'
    : 'w-full rounded-2xl border border-[#eaded0] bg-white px-4 py-3 text-sm text-zinc-950 outline-none focus:ring-2 focus:ring-red-800/30';
  const mutedTextClass = portalSurface.softMutedText(darkMode);

  const patchBlockState = useCallback((updated: MemorialRichTextBlock) => {
    onEditorStateChange((current) => ({
      ...current,
      rich_text_blocks: replaceRecord(current.rich_text_blocks, updated),
    }));
  }, [onEditorStateChange]);

  const handleWorkflowUpdated = useCallback((updated: MemorialRichTextBlock) => {
    patchBlockState(updated);
    setDraft(createBlockDraft(updated));
  }, [patchBlockState]);

  const patchMediaState = useCallback((
    updater: (items: MemorialRichTextMediaEmbed[]) => MemorialRichTextMediaEmbed[],
  ) => {
    setMediaEmbeds((current) => updater(current));
    onEditorStateChange((current) => ({
      ...current,
      media_embeds: updater(current.media_embeds),
    }));
  }, [onEditorStateChange]);

  const patchScriptureState = useCallback((
    updater: (
      items: MemorialRichTextScriptureReference[],
    ) => MemorialRichTextScriptureReference[],
  ) => {
    setScriptureReferences((current) => updater(current));
    onEditorStateChange((current) => ({
      ...current,
      scripture_references: updater(current.scripture_references),
    }));
  }, [onEditorStateChange]);

  const persistBlock = useCallback(async (nextDraft: BlockDraft) => {
    const updated = await updateMemorialRichTextBlock(auth.accessToken, block.id, {
      content_json: nextDraft.content_json,
      is_visible: nextDraft.is_visible,
      status: nextDraft.status,
      subtitle: nextDraft.subtitle.trim(),
      title: nextDraft.title.trim(),
    });
    patchBlockState(updated);
  }, [auth.accessToken, block.id, patchBlockState]);

  const { saveNow, saveState } = useDebouncedWritingSave({
    enabled: true,
    onSave: persistBlock,
    ready: true,
    value: draft,
  });

  const insertMediaEmbed = async (asset: MediaAsset) => {
    const created = await createMemorialRichTextMediaEmbed(auth.accessToken, {
      block: block.id,
      media_asset: asset.id,
      position_hint: 'root.children',
    });
    const nextEmbed: MemorialRichTextMediaEmbed = {
      ...created,
      media_asset_detail: created.media_asset_detail || asset,
    };
    patchMediaState((items) => appendRecord(items, nextEmbed));
    setPendingMediaEmbed(editorMediaEmbed(nextEmbed));
  };

  const syncImageBlocks = useCallback((blocks: ImageBlockMetadata[]) => {
    const snapshot = JSON.stringify(blocks);
    if (snapshot === imageBlockSnapshot.current) return;
    imageBlockSnapshot.current = snapshot;

    const currentIds = new Set(recordIdsFromBlocks(blocks));
    const removedIds = [...knownImageEmbedIds.current].filter((embedId) => !currentIds.has(embedId));
    knownImageEmbedIds.current = currentIds;

    void Promise.all([
      ...blocks.map((imageBlock) => {
        const recordId = imageBlockRecordId(imageBlock);
        if (recordId === undefined) return null;
        return updateMemorialRichTextMediaEmbed(auth.accessToken, recordId, {
          alt_text_override: imageBlock.altText,
          caption_override: imageBlock.caption,
          position_hint: imageBlock.positionHint,
        });
      }).filter((request): request is Promise<MemorialRichTextMediaEmbed> => Boolean(request)),
      ...removedIds.map(async (recordId) => {
        await deleteMemorialRichTextMediaEmbed(auth.accessToken, recordId);
        return { deletedId: recordId };
      }),
    ])
      .then((results) => {
        const updatedEmbeds = results.filter(
          (result): result is MemorialRichTextMediaEmbed => !('deletedId' in result),
        );
        const deletedIds = results.flatMap((result) =>
          'deletedId' in result ? [result.deletedId] : [],
        );
        patchMediaState((items) =>
          updatedEmbeds.reduce(
            (current, embed) => replaceRecord(current, embed),
            items.filter((embed) => !deletedIds.includes(idKey(embed.id))),
          ),
        );
      })
      .catch((err) => {
        setBlockError(err instanceof Error ? err.message : 'Unable to synchronize memorial media.');
      });
  }, [auth.accessToken, patchMediaState]);

  const createScriptureReferenceForNode = useCallback(async (data: ScriptureData) => {
    const payload = scriptureDataToMemorialReferencePayload(block.id, data);
    if (!payload) return data;
    const created = await createMemorialRichTextScriptureReference(auth.accessToken, payload);
    patchScriptureState((items) => appendRecord(items, created));
    return memorialScriptureReferenceToNodeData(created, data);
  }, [auth.accessToken, block.id, patchScriptureState]);

  const updateScriptureReferenceForNode = useCallback(async (
    data: ScriptureData,
    previousData?: ScriptureData,
  ) => {
    const payload = scriptureDataToMemorialReferencePayload(block.id, data);
    const existingReference = findMemorialScriptureReference(
      scriptureReferences,
      block.id,
      previousData || data,
    );

    if (!payload) {
      if (existingReference) {
        await deleteMemorialRichTextScriptureReference(auth.accessToken, existingReference.id);
        patchScriptureState((items) => removeRecord(items, existingReference.id));
      }
      return data;
    }

    if (!existingReference) {
      const created = await createMemorialRichTextScriptureReference(auth.accessToken, payload);
      patchScriptureState((items) => appendRecord(items, created));
      return memorialScriptureReferenceToNodeData(created, data);
    }

    const updated = await updateMemorialRichTextScriptureReference(
      auth.accessToken,
      existingReference.id,
      payload,
    );
    patchScriptureState((items) => replaceRecord(items, updated));
    return memorialScriptureReferenceToNodeData(updated, data);
  }, [auth.accessToken, block.id, patchScriptureState, scriptureReferences]);

  const deleteScriptureReferenceForNode = useCallback(async (data: ScriptureData) => {
    const existingReference = findMemorialScriptureReference(
      scriptureReferences,
      block.id,
      data,
    );
    if (!existingReference) return;
    await deleteMemorialRichTextScriptureReference(auth.accessToken, existingReference.id);
    patchScriptureState((items) => removeRecord(items, existingReference.id));
  }, [auth.accessToken, block.id, patchScriptureState, scriptureReferences]);

  const editorMediaEmbeds = useMemo(
    () => memorialMediaEmbedsForBlock(block.id, mediaEmbeds),
    [block.id, mediaEmbeds],
  );

  return (
    <article className={`rounded-3xl border p-5 ${portalSurface.card(darkMode)}`}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold">
            Section title
            <input
              className={fieldClass}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              value={draft.title}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Subtitle
            <input
              className={fieldClass}
              onChange={(event) => setDraft((current) => ({ ...current, subtitle: event.target.value }))}
              value={draft.subtitle}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Status
            <select
              className={fieldClass}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  status: event.target.value as MemorialWorkflowStatus,
                }))
              }
              value={draft.status}
            >
              {MEMORIAL_WORKFLOW_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {getMemorialStatusLabel(status)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-red-900/10 bg-red-950/[0.03] px-4 py-3 text-sm font-bold dark:border-red-200/10 dark:bg-white/[0.04]">
            <input
              checked={draft.is_visible}
              className="size-4 accent-red-800"
              onChange={(event) =>
                setDraft((current) => ({ ...current, is_visible: event.target.checked }))
              }
              type="checkbox"
            />
            Visible when published
          </label>
        </div>
        <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-red-800 px-5 text-sm font-black text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-red-700"
            onClick={() => void saveNow()}
            type="button"
          >
            <Save size={16} aria-hidden="true" />
            Save block
          </button>
          <MemorialWorkflowControls
            darkMode={darkMode}
            onRecordUpdated={handleWorkflowUpdated}
            record={block}
            resource="rich-text-blocks"
            showStatus={false}
          />
        </div>
      </div>

      <div className={`mt-4 rounded-2xl border border-red-900/10 bg-red-950/[0.03] p-4 text-sm dark:border-red-200/10 dark:bg-white/[0.04]`}>
        <h4 className="font-serif text-xl leading-tight">
          {draft.title || getMemorialSectionLabel(block.section_key)}
        </h4>
        <p className={`mt-1 text-xs font-bold ${mutedTextClass}`}>
          Block {block.id} · {editorMediaEmbeds.length} media · {scriptureReferences.length} scripture references
        </p>
        {mediaEmbeds.length ? (
          <p className={`mt-2 text-sm ${mutedTextClass}`}>
            Media: {mediaEmbeds.map((embed) => embed.caption_override || embed.media_asset_detail?.title || `Asset ${embed.media_asset}`).join(', ')}
          </p>
        ) : null}
        {scriptureReferences.length ? (
          <p className={`mt-2 text-sm ${mutedTextClass}`}>
            Scripture: {scriptureReferences.map((reference) => reference.passage_label || reference.display_text).join(', ')}
          </p>
        ) : null}
      </div>

      <div className="mt-5">
        <ArticleEditor
          contentJson={draft.content_json}
          darkMode={darkMode}
          editable
          mediaEmbeds={editorMediaEmbeds}
          onChange={(contentJson) =>
            setDraft((current) => ({ ...current, content_json: contentJson }))
          }
          onCreateScriptureReference={createScriptureReferenceForNode}
          onDeleteScriptureReference={deleteScriptureReferenceForNode}
          onImageBlocksChange={syncImageBlocks}
          onPendingMediaInserted={() => setPendingMediaEmbed(null)}
          onRequestMedia={() => setMediaPickerOpen(true)}
          onUpdateScriptureReference={updateScriptureReferenceForNode}
          pendingMediaEmbed={pendingMediaEmbed}
          placeholder={`Write the ${getMemorialSectionLabel(block.section_key).toLowerCase()} memorial section...`}
          saveState={saveState}
        />
      </div>

      {mediaPickerOpen ? (
        <WritingMediaEmbedPicker
          accessToken={auth.accessToken}
          canUpload={canUploadMedia(auth.permissions)}
          darkMode={darkMode}
          onClose={() => setMediaPickerOpen(false)}
          onSelect={insertMediaEmbed}
        />
      ) : null}

      {blockError ? (
        <p className="mt-4 rounded-2xl bg-red-950/5 p-3 text-sm font-bold text-red-800">
          {blockError}
        </p>
      ) : null}
    </article>
  );
};

const MemorialRichTextSectionsEditor = ({
  darkMode,
  model,
  onEditorStateChange,
}: MemorialRichTextSectionsEditorProps) => {
  const auth = useAuth();
  const toast = usePortalToast();
  const [creatingSection, setCreatingSection] = useState<MemorialRichTextSectionKey | null>(null);

  const createSectionBlock = async (
    sectionKey: MemorialRichTextSectionKey,
    existingCount: number,
  ) => {
    if (!model.page) return;
    setCreatingSection(sectionKey);
    try {
      const created = await createMemorialRichTextBlock(auth.accessToken, {
        content_json: createEmptyLexicalContent(),
        is_visible: false,
        memorial: model.page.id,
        order: existingCount + 1,
        section_key: sectionKey,
        status: 'DRAFT',
        title: getMemorialSectionLabel(sectionKey),
      });
      onEditorStateChange((current) => ({
        ...current,
        rich_text_blocks: appendRecord(current.rich_text_blocks, created),
      }));
      toast.success('Memorial section block created.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to create memorial section block.');
    } finally {
      setCreatingSection(null);
    }
  };

  return (
    <section className="grid gap-5">
      <div>
        <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-red-800 dark:text-red-100">
          <GalleryHorizontal size={15} aria-hidden="true" />
          Writing Studio engine
        </p>
        <h2 className="mt-2 font-serif text-3xl leading-tight">Rich text sections</h2>
        <p className={`mt-2 max-w-3xl text-sm leading-6 ${portalSurface.mutedText(darkMode)}`}>
          Each memorial section uses the shared article editor, while images and scripture
          references save through memorial-specific endpoints.
        </p>
      </div>

      <nav
        aria-label="Memorial editor sections"
        className={`rounded-3xl border p-3 shadow-lg ${portalSurface.panel(darkMode)}`}
      >
        <div className="flex gap-2 overflow-x-auto">
          {model.sections.map((section) => (
            <a
              className={`inline-flex min-h-10 min-w-max items-center gap-2 rounded-2xl px-3 text-xs font-black transition hover:bg-red-950/5 dark:hover:bg-white/10 ${portalSurface.softMutedText(darkMode)}`}
              href={`#memorial-section-${section.key}`}
              key={section.key}
            >
              {section.label}
              <span className="rounded-full bg-red-950/[0.08] px-2 py-0.5 text-red-800 dark:bg-white/10 dark:text-red-100">
                {section.blocks.length}
              </span>
            </a>
          ))}
        </div>
      </nav>

      {model.sections.map((section) => (
        <section
          className={`scroll-mt-24 rounded-3xl border p-5 shadow-lg ${portalSurface.panel(darkMode)}`}
          id={`memorial-section-${section.key}`}
          key={section.key}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-red-800 dark:text-red-100">
                {section.key}
              </p>
              <h3 className="mt-1 font-serif text-2xl leading-tight">{section.label}</h3>
            </div>
            <button
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-red-900/20 px-4 text-sm font-black text-red-800 transition hover:-translate-y-0.5 hover:bg-red-950/5 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-200/20 dark:text-red-100"
              disabled={creatingSection === section.key}
              onClick={() => void createSectionBlock(section.key, section.blocks.length)}
              type="button"
            >
              {section.blocks.length ? <Plus size={15} aria-hidden="true" /> : <FileText size={15} aria-hidden="true" />}
              {creatingSection === section.key
                ? 'Creating...'
                : section.blocks.length
                  ? 'Add block'
                  : 'Create block'}
            </button>
          </div>

          <div className="mt-5 grid gap-4">
            {section.blocks.length ? section.blocks.map((blockModel) => (
              <MemorialRichTextBlockEditor
                blockModel={blockModel}
                darkMode={darkMode}
                key={blockModel.block.id}
                onEditorStateChange={onEditorStateChange}
              />
            )) : (
              <p className={`rounded-2xl border border-dashed p-4 text-sm ${darkMode ? 'border-white/10 text-stone-400' : 'border-[#eaded0] text-[#786f66]'}`}>
                {sectionEmptyText(section.key)}
              </p>
            )}
          </div>
        </section>
      ))}
    </section>
  );
};

export default MemorialRichTextSectionsEditor;



