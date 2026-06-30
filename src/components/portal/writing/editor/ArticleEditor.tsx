import { useEffect, useMemo, useRef, useState } from 'react';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { $createRangeSelection, $getNodeByKey, $getRoot, $getSelection, $isRangeSelection, $setSelection } from 'lexical';
import { writingEditorTheme } from '../../../writing/lexicalTheme';
import EditorStatus, { type EditorSaveState } from './EditorStatus';
import EditorToolbar from './EditorToolbar';
import { extractImageBlocks, type ImageBlockMetadata } from './imageBlocks';
import { $createChurchBlockNode, ChurchBlockNode } from './nodes/ChurchBlockNode';
import { $createEditableBlockQuoteNode, $isEditableBlockQuoteNode, EditableBlockQuoteNode, type BlockQuoteData } from './nodes/EditableBlockQuoteNode';
import { $createScriptureBlockNode, ScriptureBlockNode } from './nodes/ScriptureBlockNode';
import { $createScriptureReferenceNode, ScriptureReferenceNode } from './nodes/ScriptureReferenceNode';
import type { ScriptureData } from './nodes/scriptureTypes';
import { $createReflectionBlockNode, ReflectionBlockNode } from './nodes/ReflectionBlockNode';
import { $createPrayerBlockNode, PrayerBlockNode } from './nodes/PrayerBlockNode';
import { $createApplicationBlockNode, ApplicationBlockNode } from './nodes/ApplicationBlockNode';
import type { PastoralBlockData, PastoralBlockKind } from './nodes/pastoralTypes';
import { SpecialBlockEditorContext } from './nodes/SpecialBlockEditorContext';
import { ChurchBlockMediaContext, mediaEmbedMap, type WritingMediaEmbedLike } from './nodes/ChurchBlockMediaContext';
import { countLexicalWords, lexicalContentToText, normalizeLexicalContent, type LexicalContentJson } from './serialization';
import type { LexicalSelectionBookmark } from './selectionBookmark';
import ScriptureInsertDialog from './ScriptureInsertDialog';
import PastoralBlockInsertDialog from './PastoralBlockInsertDialog';

type PendingMediaEmbed = WritingMediaEmbedLike | null;
type PendingPastoralBlock = { data: PastoralBlockData; kind: PastoralBlockKind } | null;
type PendingQuotationEdit = { data: BlockQuoteData; nodeKey: string } | null;
 type PendingScriptureEdit = { data: ScriptureData; nodeKey: string } | null;
type PendingPastoralEdit = { data: PastoralBlockData; kind: PastoralBlockKind; nodeKey: string } | null;
type ArticleEditorProps = { contentJson?: unknown; darkMode: boolean; editable?: boolean; mediaEmbeds?: WritingMediaEmbedLike[]; mediaDisabledLabel?: string; onChange?: (contentJson: LexicalContentJson, plainText: string) => void; onCreateScriptureReference?: (data: ScriptureData) => Promise<ScriptureData>; onDeleteScriptureReference?: (data: ScriptureData) => Promise<void> | void; onImageBlocksChange?: (blocks: ImageBlockMetadata[]) => void; onPendingMediaInserted?: () => void; onRequestMedia?: () => void; onUpdateScriptureReference?: (data: ScriptureData, previousData?: ScriptureData) => Promise<ScriptureData>; pendingMediaEmbed?: PendingMediaEmbed; placeholder?: string; saveState?: EditorSaveState; };

const restoreSelection = (insertionPoint: LexicalSelectionBookmark | null) => {
  if (!insertionPoint) return;
  const selection = $createRangeSelection();
  selection.anchor.set(insertionPoint.anchor.key, insertionPoint.anchor.offset, insertionPoint.anchor.type);
  selection.focus.set(insertionPoint.focus.key, insertionPoint.focus.offset, insertionPoint.focus.type);
  $setSelection(selection);
};

const PendingMediaInsertion = ({ insertionPoint, mediaEmbed, onInserted }: { insertionPoint: LexicalSelectionBookmark | null; mediaEmbed: PendingMediaEmbed; onInserted?: () => void }) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => { if (!mediaEmbed) return; editor.update(() => { const node = $createChurchBlockNode({ alignment: 'center', altText: mediaEmbed.alt_text_override || mediaEmbed.media_asset_detail?.alt_text || '', caption: mediaEmbed.caption_override || '', embedRecordId: mediaEmbed.id, embed_id: mediaEmbed.embed_id, kind: 'image', mediaAssetId: mediaEmbed.media_asset }); restoreSelection(insertionPoint); const selection = $getSelection(); if ($isRangeSelection(selection)) selection.insertNodes([node]); else $getRoot().append(node); }); onInserted?.(); }, [editor, insertionPoint, mediaEmbed, onInserted]);
  return null;
};

const PendingQuotationInsertion = ({ data, insertionPoint, onInserted }: { data: BlockQuoteData | null; insertionPoint: LexicalSelectionBookmark | null; onInserted: () => void }) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => { if (!data) return; editor.update(() => { restoreSelection(insertionPoint); const selection = $getSelection(); const node = $createEditableBlockQuoteNode(data); if ($isRangeSelection(selection)) selection.insertNodes([node]); else $getRoot().append(node); }); onInserted(); }, [data, editor, insertionPoint, onInserted]);
  return null;
};

const PendingQuotationEditPlugin = ({ edit, onApplied }: { edit: PendingQuotationEdit; onApplied: () => void }) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => { if (!edit) return; editor.update(() => { const node = $getNodeByKey(edit.nodeKey); if ($isEditableBlockQuoteNode(node)) node.setData(edit.data); }); onApplied(); }, [edit, editor, onApplied]);
  return null;
};

const PendingScriptureInsertion = ({ data, insertionPoint, onInserted }: { data: ScriptureData | null; insertionPoint: LexicalSelectionBookmark | null; onInserted: () => void }) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => { if (!data) return; editor.update(() => { restoreSelection(insertionPoint); const selection = $getSelection(); const node = data.display === 'inline' ? $createScriptureReferenceNode(data) : $createScriptureBlockNode(data); if ($isRangeSelection(selection)) selection.insertNodes([node]); else $getRoot().append(node); }); onInserted(); }, [data, editor, insertionPoint, onInserted]);
  return null;
};

const PendingPastoralInsertion = ({ data, insertionPoint, onInserted }: { data: PendingPastoralBlock; insertionPoint: LexicalSelectionBookmark | null; onInserted: () => void }) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => { if (!data) return; editor.update(() => { restoreSelection(insertionPoint); const selection = $getSelection(); const node = data.kind === 'reflection' ? $createReflectionBlockNode(data.data) : data.kind === 'prayer' ? $createPrayerBlockNode(data.data) : $createApplicationBlockNode(data.data); if ($isRangeSelection(selection)) selection.insertNodes([node]); else $getRoot().append(node); }); onInserted(); }, [data, editor, insertionPoint, onInserted]);
  return null;
};
const PendingScriptureEditPlugin = ({ edit, onApplied }: { edit: PendingScriptureEdit; onApplied: () => void }) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => { if (!edit) return; editor.update(() => { const node = $getNodeByKey(edit.nodeKey); if (node instanceof ScriptureBlockNode || node instanceof ScriptureReferenceNode) node.setData(edit.data); }); onApplied(); }, [edit, editor, onApplied]);
  return null;
};

const PendingPastoralEditPlugin = ({ edit, onApplied }: { edit: PendingPastoralEdit; onApplied: () => void }) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => { if (!edit) return; editor.update(() => { const node = $getNodeByKey(edit.nodeKey); if (edit.kind === 'reflection' && node instanceof ReflectionBlockNode) node.setData(edit.data); if (edit.kind === 'prayer' && node instanceof PrayerBlockNode) node.setData(edit.data); if (edit.kind === 'application' && node instanceof ApplicationBlockNode) node.setData(edit.data); }); onApplied(); }, [edit, editor, onApplied]);
  return null;
};
const ImageBlockDragPlugin = () => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => editor.registerRootListener((rootElement, previousRootElement) => {
    const removeListeners = (element: HTMLElement | null) => { if (!element) return; element.removeEventListener('dragover', onDragOver); element.removeEventListener('drop', onDrop); };
    const onDragOver = (event: DragEvent) => { if (event.dataTransfer?.types.includes('application/x-aic-writing-image') || event.dataTransfer?.types.includes('application/x-aic-writing-block')) event.preventDefault(); };
    const onDrop = (event: DragEvent) => { const sourceKey = event.dataTransfer?.getData('application/x-aic-writing-block') || event.dataTransfer?.getData('application/x-aic-writing-image'); if (!sourceKey) return; event.preventDefault(); const targetElement = (event.target as HTMLElement | null)?.closest('[data-lexical-node-key]') as HTMLElement | null; const targetKey = targetElement?.getAttribute('data-lexical-node-key'); editor.update(() => { const source = $getNodeByKey(sourceKey); if (!source) return; const sourceTop = source.getTopLevelElementOrThrow(); const target = targetKey ? $getNodeByKey(targetKey) : null; const targetTop = target?.getTopLevelElementOrThrow(); if (!targetTop || targetTop.is(sourceTop)) { $getRoot().append(sourceTop); return; } const rect = targetElement?.getBoundingClientRect(); if (rect && event.clientY > rect.top + rect.height / 2) targetTop.insertAfter(sourceTop); else targetTop.insertBefore(sourceTop); }); };
    removeListeners(previousRootElement); if (rootElement) { rootElement.addEventListener('dragover', onDragOver); rootElement.addEventListener('drop', onDrop); } return () => removeListeners(rootElement);
  }), [editor]);
  return null;
};

const ArticleEditor = ({ contentJson, darkMode, editable = true, mediaDisabledLabel, mediaEmbeds = [], onChange, onCreateScriptureReference, onDeleteScriptureReference, onImageBlocksChange, onPendingMediaInserted, onRequestMedia, onUpdateScriptureReference, pendingMediaEmbed, placeholder = 'Type "/" for commands (scripture, callout, image, divider)', saveState = 'idle' }: ArticleEditorProps) => {
  const initialContent = useMemo(() => normalizeLexicalContent(contentJson), [contentJson]);
  const [plainText, setPlainText] = useState(() => lexicalContentToText(initialContent));
  const mediaInsertionPoint = useRef<LexicalSelectionBookmark | null>(null);
  const scriptureInsertionPoint = useRef<LexicalSelectionBookmark | null>(null);
  const pastoralInsertionPoint = useRef<LexicalSelectionBookmark | null>(null);
  const [pendingScripture, setPendingScripture] = useState<ScriptureData | null>(null);
  const [scriptureDialogOpen, setScriptureDialogOpen] = useState(false);
  const [pastoralDialogOpen, setPastoralDialogOpen] = useState(false);
  const [scriptureError, setScriptureError] = useState('');
  const [editingQuotation, setEditingQuotation] = useState<PendingQuotationEdit>(null);
  const [editingScripture, setEditingScripture] = useState<PendingScriptureEdit>(null);
  const [editingPastoral, setEditingPastoral] = useState<PendingPastoralEdit>(null);
  const [pendingQuotation, setPendingQuotation] = useState<BlockQuoteData | null>(null);
  const [pendingQuotationEdit, setPendingQuotationEdit] = useState<PendingQuotationEdit>(null);
  const [pendingScriptureEdit, setPendingScriptureEdit] = useState<PendingScriptureEdit>(null);
  const [pendingPastoralEdit, setPendingPastoralEdit] = useState<PendingPastoralEdit>(null);
  const [pendingPastoral, setPendingPastoral] = useState<PendingPastoralBlock>(null);
  const media = useMemo(() => mediaEmbedMap(mediaEmbeds), [mediaEmbeds]);
  const surfaceClass = darkMode ? 'border-white/10 bg-zinc-950 text-stone-100' : 'border-black/10 bg-white text-zinc-950';
  const contentClass = darkMode ? 'text-stone-100 placeholder:text-stone-500' : 'text-zinc-950 placeholder:text-zinc-400';
  const initialConfig = useMemo(() => ({ editorState: JSON.stringify(initialContent), namespace: 'aic-njoro-writing-studio', nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, AutoLinkNode, ChurchBlockNode, EditableBlockQuoteNode, ScriptureBlockNode, ScriptureReferenceNode, ReflectionBlockNode, PrayerBlockNode, ApplicationBlockNode], onError: (error: Error) => { throw error; }, theme: writingEditorTheme }), [initialContent]);
  const persistScriptureInsertion = async (data: ScriptureData) => onCreateScriptureReference ? onCreateScriptureReference(data) : data;
  const persistScriptureEdit = async (data: ScriptureData, previousData?: ScriptureData) => onUpdateScriptureReference ? onUpdateScriptureReference(data, previousData) : data;
  const removeScriptureReference = async (data: ScriptureData) => { if (onDeleteScriptureReference) await onDeleteScriptureReference(data); };
  return <SpecialBlockEditorContext.Provider value={{ onRemoveScripture: removeScriptureReference, onEditPastoral: (request) => { setEditingPastoral(request); setPastoralDialogOpen(true); }, onEditQuotation: (request) => { setEditingQuotation(request); setPastoralDialogOpen(true); }, onEditScripture: (request) => { setEditingScripture(request); setScriptureDialogOpen(true); } }}><ChurchBlockMediaContext.Provider value={media}><LexicalComposer initialConfig={initialConfig}><section aria-label="Article body editor" className={'overflow-visible rounded-2xl border shadow-lg ' + surfaceClass}>{editable ? <EditorToolbar darkMode={darkMode} mediaDisabledLabel={mediaDisabledLabel} onRequestMedia={(bookmark) => { mediaInsertionPoint.current = bookmark; onRequestMedia?.(); }} onRequestScripture={(bookmark) => { scriptureInsertionPoint.current = bookmark; setScriptureDialogOpen(true); }} onRequestPastoral={(bookmark) => { pastoralInsertionPoint.current = bookmark; setPastoralDialogOpen(true); }} /> : null}<div className="relative min-h-[55vh] px-5 py-6 sm:px-8 sm:py-8 lg:min-h-96"><RichTextPlugin ErrorBoundary={LexicalErrorBoundary} contentEditable={<ContentEditable aria-label="Article body" className={'min-h-[48vh] whitespace-pre-wrap break-words text-base leading-8 outline-none sm:min-h-80 lg:text-lg ' + contentClass} contentEditable={editable} />} placeholder={<p className={'pointer-events-none absolute left-5 top-6 pr-5 sm:left-8 sm:top-8 ' + (darkMode ? 'text-stone-500' : 'text-zinc-400')}>{placeholder}</p>} /></div><OnChangePlugin onChange={(editorState) => { const nextContent = normalizeLexicalContent(editorState.toJSON()); const nextText = editorState.read(() => $getRoot().getTextContent()); setPlainText(nextText); onChange?.(nextContent, nextText); onImageBlocksChange?.(extractImageBlocks(nextContent)); }} />{scriptureDialogOpen ? <ScriptureInsertDialog darkMode={darkMode} initialData={editingScripture?.data} onClose={() => { setScriptureDialogOpen(false); setEditingScripture(null); }} onInsert={(data) => { void (async () => { try { setScriptureError(''); const persisted = editingScripture ? await persistScriptureEdit(data, editingScripture.data) : await persistScriptureInsertion(data); if (editingScripture) { setPendingScriptureEdit({ ...editingScripture, data: persisted }); setEditingScripture(null); } else setPendingScripture(persisted); setScriptureDialogOpen(false); } catch (err) { setScriptureError(err instanceof Error ? err.message : 'Unable to save Scripture reference.'); } })(); }} /> : null}{pastoralDialogOpen ? <PastoralBlockInsertDialog darkMode={darkMode} initialData={editingQuotation?.data || editingPastoral?.data} initialKind={editingQuotation ? 'quotation' : editingPastoral?.kind} onClose={() => { setPastoralDialogOpen(false); setEditingPastoral(null); setEditingQuotation(null); }} onInsert={(kind, data) => { if (kind === 'quotation') { const quote = data as BlockQuoteData; if (editingQuotation) { setPendingQuotationEdit({ ...editingQuotation, data: quote }); setEditingQuotation(null); } else setPendingQuotation(quote); } else { const pastoral = data as PastoralBlockData; if (editingPastoral) { setPendingPastoralEdit({ ...editingPastoral, data: pastoral, kind }); setEditingPastoral(null); } else setPendingPastoral({ kind, data: pastoral }); } setPastoralDialogOpen(false); }} /> : null}{scriptureError ? <p className="px-5 py-3 text-sm font-bold text-red-800 dark:text-red-200">{scriptureError}</p> : null}<PendingQuotationEditPlugin edit={pendingQuotationEdit} onApplied={() => setPendingQuotationEdit(null)} /><PendingQuotationInsertion data={pendingQuotation} insertionPoint={pastoralInsertionPoint.current} onInserted={() => { pastoralInsertionPoint.current = null; setPendingQuotation(null); }} /><PendingScriptureEditPlugin edit={pendingScriptureEdit} onApplied={() => setPendingScriptureEdit(null)} /><PendingPastoralEditPlugin edit={pendingPastoralEdit} onApplied={() => setPendingPastoralEdit(null)} /><PendingPastoralInsertion data={pendingPastoral} insertionPoint={pastoralInsertionPoint.current} onInserted={() => { pastoralInsertionPoint.current = null; setPendingPastoral(null); }} /><PendingScriptureInsertion data={pendingScripture} insertionPoint={scriptureInsertionPoint.current} onInserted={() => { scriptureInsertionPoint.current = null; setPendingScripture(null); }} /><PendingMediaInsertion insertionPoint={mediaInsertionPoint.current} mediaEmbed={pendingMediaEmbed || null} onInserted={() => { mediaInsertionPoint.current = null; onPendingMediaInserted?.(); }} /><ImageBlockDragPlugin /><HistoryPlugin /><ListPlugin /><LinkPlugin /><EditorStatus characterCount={plainText.length} darkMode={darkMode} saveState={saveState} wordCount={countLexicalWords(plainText)} /></section></LexicalComposer></ChurchBlockMediaContext.Provider></SpecialBlockEditorContext.Provider>;
};
export default ArticleEditor;

