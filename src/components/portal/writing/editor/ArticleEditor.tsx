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
import { ChurchBlockMediaContext, mediaEmbedMap, type WritingMediaEmbedLike } from './nodes/ChurchBlockMediaContext';
import { countLexicalWords, lexicalContentToText, normalizeLexicalContent, type LexicalContentJson } from './serialization';
import type { LexicalSelectionBookmark } from './selectionBookmark';

type PendingMediaEmbed = WritingMediaEmbedLike | null;

type ArticleEditorProps = {
  contentJson?: unknown;
  darkMode: boolean;
  editable?: boolean;
  mediaEmbeds?: WritingMediaEmbedLike[];
  mediaDisabledLabel?: string;
  onChange?: (contentJson: LexicalContentJson, plainText: string) => void;
  onImageBlocksChange?: (blocks: ImageBlockMetadata[]) => void;
  onPendingMediaInserted?: () => void;
  onRequestMedia?: () => void;
  pendingMediaEmbed?: PendingMediaEmbed;
  placeholder?: string;
  saveState?: EditorSaveState;
};

const PendingMediaInsertion = ({ insertionPoint, mediaEmbed, onInserted }: { insertionPoint: LexicalSelectionBookmark | null; mediaEmbed: PendingMediaEmbed; onInserted?: () => void }) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!mediaEmbed) return;
    editor.update(() => {
      const node = $createChurchBlockNode({
        alignment: 'center', altText: mediaEmbed.alt_text_override || mediaEmbed.media_asset_detail?.alt_text || '',
        caption: mediaEmbed.caption_override || '', embedId: mediaEmbed.id, kind: 'image', mediaAssetId: mediaEmbed.media_asset,
      });
      if (insertionPoint) {
        const restoredSelection = $createRangeSelection();
        restoredSelection.anchor.set(insertionPoint.anchor.key, insertionPoint.anchor.offset, insertionPoint.anchor.type);
        restoredSelection.focus.set(insertionPoint.focus.key, insertionPoint.focus.offset, insertionPoint.focus.type);
        $setSelection(restoredSelection);
      }
      const selection = $getSelection();
      if ($isRangeSelection(selection)) selection.insertNodes([node]); else $getRoot().append(node);
    });
    onInserted?.();
  }, [editor, insertionPoint, mediaEmbed, onInserted]);
  return null;
};

const ImageBlockDragPlugin = () => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => editor.registerRootListener((rootElement, previousRootElement) => {
    const removeListeners = (element: HTMLElement | null) => {
      if (!element) return;
      element.removeEventListener('dragover', onDragOver);
      element.removeEventListener('drop', onDrop);
    };
    const onDragOver = (event: DragEvent) => {
      if (event.dataTransfer?.types.includes('application/x-aic-writing-image')) event.preventDefault();
    };
    const onDrop = (event: DragEvent) => {
      const sourceKey = event.dataTransfer?.getData('application/x-aic-writing-image');
      if (!sourceKey) return;
      event.preventDefault();
      const targetElement = (event.target as HTMLElement | null)?.closest('[data-lexical-node-key]') as HTMLElement | null;
      const targetKey = targetElement?.getAttribute('data-lexical-node-key');
      editor.update(() => {
        const source = $getNodeByKey(sourceKey);
        if (!source || !$getNodeByKey(sourceKey)) return;
        const sourceTop = source.getTopLevelElementOrThrow();
        const target = targetKey ? $getNodeByKey(targetKey) : null;
        const targetTop = target?.getTopLevelElementOrThrow();
        if (!targetTop || targetTop.is(sourceTop)) { $getRoot().append(sourceTop); return; }
        const rect = targetElement?.getBoundingClientRect();
        if (rect && event.clientY > rect.top + rect.height / 2) targetTop.insertAfter(sourceTop);
        else targetTop.insertBefore(sourceTop);
      });
    };
    removeListeners(previousRootElement);
    if (rootElement) { rootElement.addEventListener('dragover', onDragOver); rootElement.addEventListener('drop', onDrop); }
    return () => removeListeners(rootElement);
  }), [editor]);
  return null;
};

const ArticleEditor = ({ contentJson, darkMode, editable = true, mediaDisabledLabel, mediaEmbeds = [], onChange, onImageBlocksChange, onPendingMediaInserted, onRequestMedia, pendingMediaEmbed, placeholder = 'Type "/" for commands (scripture, callout, image, divider)', saveState = 'idle' }: ArticleEditorProps) => {
  const initialContent = useMemo(() => normalizeLexicalContent(contentJson), [contentJson]);
  const [plainText, setPlainText] = useState(() => lexicalContentToText(initialContent));
  const mediaInsertionPoint = useRef<LexicalSelectionBookmark | null>(null);
  const media = useMemo(() => mediaEmbedMap(mediaEmbeds), [mediaEmbeds]);
  const surfaceClass = darkMode ? 'border-white/10 bg-zinc-950 text-stone-100' : 'border-black/10 bg-white text-zinc-950';
  const contentClass = darkMode ? 'text-stone-100 placeholder:text-stone-500' : 'text-zinc-950 placeholder:text-zinc-400';
  const initialConfig = useMemo(() => ({ editorState: JSON.stringify(initialContent), namespace: 'aic-njoro-writing-studio', nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, AutoLinkNode, ChurchBlockNode], onError: (error: Error) => { throw error; }, theme: writingEditorTheme }), [initialContent]);

  return (
    <ChurchBlockMediaContext.Provider value={media}>
      <LexicalComposer initialConfig={initialConfig}>
        <section aria-label="Article body editor" className={'overflow-hidden rounded-2xl border shadow-lg ' + surfaceClass}>
          {editable ? <EditorToolbar darkMode={darkMode} mediaDisabledLabel={mediaDisabledLabel} onRequestMedia={(bookmark) => { mediaInsertionPoint.current = bookmark; onRequestMedia?.(); }} /> : null}
          <div className="relative min-h-[55vh] px-5 py-6 sm:px-8 sm:py-8 lg:min-h-96">
            <RichTextPlugin ErrorBoundary={LexicalErrorBoundary} contentEditable={<ContentEditable aria-label="Article body" className={'min-h-[48vh] whitespace-pre-wrap break-words text-base leading-8 outline-none sm:min-h-80 lg:text-lg ' + contentClass} contentEditable={editable} />} placeholder={<p className={'pointer-events-none absolute left-5 top-6 pr-5 sm:left-8 sm:top-8 ' + (darkMode ? 'text-stone-500' : 'text-zinc-400')}>{placeholder}</p>} />
          </div>
          <OnChangePlugin onChange={(editorState) => { const nextContent = normalizeLexicalContent(editorState.toJSON()); const nextText = editorState.read(() => $getRoot().getTextContent()); setPlainText(nextText); onChange?.(nextContent, nextText); onImageBlocksChange?.(extractImageBlocks(nextContent)); }} />
          <PendingMediaInsertion insertionPoint={mediaInsertionPoint.current} mediaEmbed={pendingMediaEmbed || null} onInserted={() => { mediaInsertionPoint.current = null; onPendingMediaInserted?.(); }} />
          <ImageBlockDragPlugin /><HistoryPlugin /><ListPlugin /><LinkPlugin />
          <EditorStatus characterCount={plainText.length} darkMode={darkMode} saveState={saveState} wordCount={countLexicalWords(plainText)} />
        </section>
      </LexicalComposer>
    </ChurchBlockMediaContext.Provider>
  );
};

export default ArticleEditor;
