import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlignLeft, Bold, ChevronDown, Image, Italic, Link2, List, ListOrdered, ListX, MessageSquareQuote, Minus, Redo2, ScrollText, Strikethrough, Subscript, Superscript, Type, Underline, Undo2, X } from 'lucide-react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import { $createRangeSelection, $createTextNode, $getRoot, $getSelection, $isRangeSelection, $setSelection, CAN_REDO_COMMAND, CAN_UNDO_COMMAND, COMMAND_PRIORITY_LOW, FORMAT_TEXT_COMMAND, REDO_COMMAND, UNDO_COMMAND } from 'lexical';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND } from '@lexical/list';
import { $createLinkNode, $toggleLink, formatUrl } from '@lexical/link';
import { $createDefaultChurchBlock } from './nodes/ChurchBlockNode';
import { applyBlockFormat, toggleEditorialEmphasis, type BlockFormat } from './blockFormatting';
import type { LexicalSelectionBookmark } from './selectionBookmark';

type EditorToolbarProps = { darkMode: boolean; onRequestMedia?: (bookmark: LexicalSelectionBookmark | null) => void; onRequestScripture?: (bookmark: LexicalSelectionBookmark | null) => void; onRequestPastoral?: (bookmark: LexicalSelectionBookmark | null) => void; mediaDisabledLabel?: string; };
type ToolbarButtonProps = { active?: boolean; children: React.ReactNode; darkMode: boolean; disabled?: boolean; label: string; onClick: () => void; };
type LinkDialogState = { bookmark: LexicalSelectionBookmark | null; error: string; newTab: boolean; selectedText: string; text: string; url: string };
const emptyLinkDialog = (bookmark: LexicalSelectionBookmark | null, selectedText = ''): LinkDialogState => ({ bookmark, error: '', newTab: true, selectedText, text: selectedText, url: '' });

const ToolbarButton = ({ active = false, children, darkMode, disabled = false, label, onClick }: ToolbarButtonProps) => {
  const stateClass = active ? darkMode ? 'border-red-900/50 bg-red-950/40 text-red-200' : 'border-red-200 bg-red-50 text-red-800' : darkMode ? 'border-transparent text-stone-200 hover:bg-white/10' : 'border-transparent text-zinc-700 hover:bg-black/5';
  return <button aria-label={label} className={'grid size-10 place-items-center rounded-xl border transition focus:outline-none focus:ring-2 focus:ring-red-800/30 disabled:cursor-not-allowed disabled:opacity-40 ' + stateClass} disabled={disabled} onClick={onClick} title={label} type="button">{children}</button>;
};
const ToolbarGroup = ({ children, darkMode, separated = true }: { children: React.ReactNode; darkMode: boolean; separated?: boolean }) => <div className={'flex shrink-0 items-center gap-1 ' + (separated ? 'border-l pl-2 ' + (darkMode ? 'border-white/10' : 'border-black/10') : '')}>{children}</div>;
const blockOptions: Array<{ label: string; value: BlockFormat }> = [{ label: 'Paragraph', value: 'paragraph' }, { label: 'Heading 2', value: 'h2' }, { label: 'Heading 3', value: 'h3' }, { label: 'Heading 4', value: 'h4' }, { label: 'Heading 5', value: 'h5' }, { label: 'Heading 6', value: 'h6' }];

const EditorToolbar = ({ darkMode, mediaDisabledLabel, onRequestMedia, onRequestPastoral, onRequestScripture }: EditorToolbarProps) => {
  const [editor] = useLexicalComposerContext();
  const [activeFormats, setActiveFormats] = useState({ bold: false, italic: false, strikethrough: false, subscript: false, superscript: false, underline: false });
  const [canRedo, setCanRedo] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [activeBlock, setActiveBlock] = useState<BlockFormat>('paragraph');
  const [blockMenuOpen, setBlockMenuOpen] = useState(false);
  const [linkDialog, setLinkDialog] = useState<LinkDialogState | null>(null);
  const [blockMenuPosition, setBlockMenuPosition] = useState({ left: 0, top: 0 });
  const blockTriggerRef = useRef<HTMLButtonElement>(null);
  const blockMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => mergeRegister(editor.registerCommand(CAN_UNDO_COMMAND, (payload) => { setCanUndo(payload); return false; }, COMMAND_PRIORITY_LOW), editor.registerCommand(CAN_REDO_COMMAND, (payload) => { setCanRedo(payload); return false; }, COMMAND_PRIORITY_LOW), editor.registerUpdateListener(({ editorState }) => editorState.read(() => { const selection = $getSelection(); if (!$isRangeSelection(selection)) return setActiveFormats({ bold: false, italic: false, strikethrough: false, subscript: false, superscript: false, underline: false }); setActiveFormats({ bold: selection.hasFormat('bold'), italic: selection.hasFormat('italic'), strikethrough: selection.hasFormat('strikethrough'), subscript: selection.hasFormat('subscript'), superscript: selection.hasFormat('superscript'), underline: selection.hasFormat('underline') }); }))), [editor]);
  const captureBookmark = () => { let bookmark: LexicalSelectionBookmark | null = null; editor.getEditorState().read(() => { const selection = $getSelection(); if ($isRangeSelection(selection)) bookmark = { anchor: { key: selection.anchor.key, offset: selection.anchor.offset, type: selection.anchor.type }, focus: { key: selection.focus.key, offset: selection.focus.offset, type: selection.focus.type } }; }); return bookmark; };
  const restoreBookmark = (bookmark: LexicalSelectionBookmark | null) => { if (!bookmark) return; const selection = $createRangeSelection(); selection.anchor.set(bookmark.anchor.key, bookmark.anchor.offset, bookmark.anchor.type); selection.focus.set(bookmark.focus.key, bookmark.focus.offset, bookmark.focus.type); $setSelection(selection); };
  const selectedTextForLink = () => { let text = ''; editor.getEditorState().read(() => { const selection = $getSelection(); if ($isRangeSelection(selection)) text = selection.getTextContent(); }); return text; };
  const formatBlock = (block: BlockFormat) => editor.update(() => { applyBlockFormat(block); });
  const updateBlockMenuPosition = () => {
    const bounds = blockTriggerRef.current?.getBoundingClientRect();
    if (bounds) setBlockMenuPosition({ left: bounds.left, top: bounds.bottom + 8 });
  };
  const toggleBlockMenu = () => {
    if (blockMenuOpen) { setBlockMenuOpen(false); return; }
    updateBlockMenuPosition();
    setBlockMenuOpen(true);
  };
  useEffect(() => {
    if (!blockMenuOpen) return;
    const closeIfOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!blockMenuRef.current?.contains(target) && !blockTriggerRef.current?.contains(target)) setBlockMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setBlockMenuOpen(false); };
    window.addEventListener('scroll', updateBlockMenuPosition, true);
    window.addEventListener('resize', updateBlockMenuPosition);
    document.addEventListener('pointerdown', closeIfOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      window.removeEventListener('scroll', updateBlockMenuPosition, true);
      window.removeEventListener('resize', updateBlockMenuPosition);
      document.removeEventListener('pointerdown', closeIfOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [blockMenuOpen]);
  useEffect(() => {
    if (!linkDialog) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setLinkDialog(null); };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [linkDialog]);
  const insertChurchBlock = (kind: 'divider') => editor.update(() => { const selection = $getSelection(); if ($isRangeSelection(selection)) selection.insertNodes([$createDefaultChurchBlock(kind)]); });
  const openLinkDialog = () => setLinkDialog(emptyLinkDialog(captureBookmark(), selectedTextForLink()));
  const applyLink = () => {
    if (!linkDialog) return;
    const rawUrl = linkDialog.url.trim();
    const textLabel = linkDialog.text.trim();
    if (!rawUrl) { setLinkDialog({ ...linkDialog, error: 'Add a URL before inserting the link.' }); return; }
    if (!linkDialog.selectedText && !textLabel) { setLinkDialog({ ...linkDialog, error: 'Add text to display for this link.' }); return; }
    const url = formatUrl(rawUrl);
    const attributes = { rel: linkDialog.newTab ? 'noopener noreferrer' : null, target: linkDialog.newTab ? '_blank' : null, url };
    editor.update(() => {
      restoreBookmark(linkDialog.bookmark);
      const selection = $getSelection();
      if ($isRangeSelection(selection) && !selection.isCollapsed()) {
        $toggleLink(attributes);
        return;
      }
      const linkNode = $createLinkNode(url, { rel: attributes.rel, target: attributes.target });
      linkNode.append($createTextNode(textLabel || url));
      if ($isRangeSelection(selection)) selection.insertNodes([linkNode]);
      else $getRoot().append(linkNode);
    });
    setLinkDialog(null);
  };
  const linkDialogModal = linkDialog && typeof document !== 'undefined' ? createPortal(
    <div aria-label="Insert link" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog">
      <button aria-label="Close link dialog" className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setLinkDialog(null)} type="button" />
      <form className={'relative z-10 w-full max-w-lg rounded-[2rem] border p-5 shadow-2xl sm:p-6 ' + (darkMode ? 'border-white/10 bg-[#171717] text-stone-100 shadow-black/40' : 'border-black/10 bg-white text-zinc-950 shadow-zinc-900/15')} onSubmit={(event) => { event.preventDefault(); applyLink(); }}>
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800 dark:text-red-200">Insert link</p>
            <h2 className="mt-2 font-serif text-2xl">Add a thoughtful reference</h2>
            <p className={darkMode ? 'mt-2 text-sm leading-6 text-stone-300' : 'mt-2 text-sm leading-6 text-zinc-600'}>Links open in a new tab by default so readers do not lose their place.</p>
          </div>
          <button aria-label="Close" className="grid size-10 place-items-center rounded-full border border-black/10 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10" onClick={() => setLinkDialog(null)} type="button"><X size={18} /></button>
        </header>
        <div className="mt-5 grid gap-4">
          <label className="grid gap-1 text-xs font-black uppercase tracking-[0.12em] text-red-800 dark:text-red-200">URL<input autoFocus className={darkMode ? 'w-full rounded-2xl border border-white/10 bg-[#080808] px-4 py-3 text-sm text-stone-100 outline-none focus:ring-2 focus:ring-red-800/30' : 'w-full rounded-2xl border border-black/10 bg-[#fffaf0] px-4 py-3 text-sm text-zinc-950 outline-none focus:ring-2 focus:ring-red-800/30'} onChange={(event) => setLinkDialog({ ...linkDialog, error: '', url: event.target.value })} placeholder="https://example.com" value={linkDialog.url} /></label>
          {!linkDialog.selectedText ? <label className="grid gap-1 text-xs font-black uppercase tracking-[0.12em] text-red-800 dark:text-red-200">Text to display<input className={darkMode ? 'w-full rounded-2xl border border-white/10 bg-[#080808] px-4 py-3 text-sm text-stone-100 outline-none focus:ring-2 focus:ring-red-800/30' : 'w-full rounded-2xl border border-black/10 bg-[#fffaf0] px-4 py-3 text-sm text-zinc-950 outline-none focus:ring-2 focus:ring-red-800/30'} onChange={(event) => setLinkDialog({ ...linkDialog, error: '', text: event.target.value })} placeholder="Read more" value={linkDialog.text} /></label> : <p className={darkMode ? 'rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-stone-300' : 'rounded-2xl border border-black/10 bg-[#fffaf0] px-4 py-3 text-sm text-zinc-600'}>Selected text: <span className="font-bold">{linkDialog.selectedText}</span></p>}
          <label className={darkMode ? 'flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold' : 'flex items-center justify-between gap-4 rounded-2xl border border-black/10 bg-[#fffaf0] px-4 py-3 text-sm font-bold'}><span>Open in new tab</span><input checked={linkDialog.newTab} className="size-5 accent-red-800" onChange={(event) => setLinkDialog({ ...linkDialog, newTab: event.target.checked })} type="checkbox" /></label>
          {linkDialog.error ? <p className="text-sm font-bold text-red-800 dark:text-red-200">{linkDialog.error}</p> : null}
        </div>
        <footer className="mt-6 flex flex-wrap justify-end gap-3 border-t border-black/10 pt-4 dark:border-white/10">
          <button className="rounded-full px-4 py-2 text-sm font-bold" onClick={() => setLinkDialog(null)} type="button">Cancel</button>
          <button className="inline-flex items-center gap-2 rounded-full bg-red-800 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-red-950/20 transition hover:bg-red-700" type="submit"><Link2 size={16} /> Insert link</button>
        </footer>
      </form>
    </div>,
    document.body,
  ) : null;
  const surfaceClass = darkMode ? 'border-white/10 bg-[#171717] text-stone-100' : 'border-black/10 bg-white text-zinc-950';
  const menuClass = darkMode ? 'border-white/10 bg-[#171717] text-stone-100 shadow-black/40' : 'border-black/10 bg-white text-zinc-950 shadow-zinc-900/15';
  const blockMenu = blockMenuOpen && typeof document !== 'undefined' ? createPortal(
    <div className={'fixed z-50 w-44 rounded-2xl border p-1.5 shadow-xl ' + menuClass} ref={blockMenuRef} role="listbox" style={{ left: blockMenuPosition.left, top: blockMenuPosition.top }}>
      {blockOptions.map((option) => <button aria-selected={activeBlock === option.value} className={'flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ' + (activeBlock === option.value ? 'bg-red-800 text-white' : darkMode ? 'text-stone-200 hover:bg-white/10' : 'text-zinc-700 hover:bg-red-950/5')} key={option.value} onClick={() => { formatBlock(option.value); setActiveBlock(option.value); setBlockMenuOpen(false); }} role="option" type="button">{option.label}</button>)}
    </div>,
    document.body,
  ) : null;
  return <>{blockMenu}{linkDialogModal}<div className="sticky top-[4.75rem] z-20 overflow-x-auto border-b border-black/10 shadow-sm dark:border-white/10"><div aria-label="Writing tools" className={'flex min-w-max items-center gap-2 px-3 py-2 ' + surfaceClass} role="toolbar"><div className="relative shrink-0"><button aria-expanded={blockMenuOpen} aria-haspopup="listbox" aria-label="Text style" ref={blockTriggerRef} className={darkMode ? 'inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-zinc-950 px-3 text-xs font-bold text-stone-100 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-red-800/30' : 'inline-flex h-10 items-center gap-2 rounded-xl border border-black/10 bg-[#fffaf0] px-3 text-xs font-bold text-zinc-950 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-red-800/30'} onClick={toggleBlockMenu} type="button"><AlignLeft aria-hidden="true" className="size-4 text-red-800" /><span>{blockOptions.find((option) => option.value === activeBlock)?.label}</span><ChevronDown aria-hidden="true" className={'size-4 transition ' + (blockMenuOpen ? 'rotate-180' : '')} /></button></div><ToolbarGroup darkMode={darkMode} separated={false}><ToolbarButton active={activeFormats.bold} darkMode={darkMode} label="Bold" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}><Bold size={16} /></ToolbarButton><ToolbarButton active={activeFormats.italic} darkMode={darkMode} label="Italic" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}><Italic size={16} /></ToolbarButton><ToolbarButton active={activeFormats.underline} darkMode={darkMode} label="Underline" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}><Underline size={16} /></ToolbarButton><ToolbarButton active={activeFormats.strikethrough} darkMode={darkMode} label="Strikethrough" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}><Strikethrough size={16} /></ToolbarButton><ToolbarButton active={activeFormats.superscript} darkMode={darkMode} label="Superscript" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript')}><Superscript size={16} /></ToolbarButton><ToolbarButton active={activeFormats.subscript} darkMode={darkMode} label="Subscript" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript')}><Subscript size={16} /></ToolbarButton><ToolbarButton darkMode={darkMode} label="Editorial emphasis" onClick={() => editor.update(toggleEditorialEmphasis)}><Type size={16} /></ToolbarButton><ToolbarButton darkMode={darkMode} label="Add link" onClick={openLinkDialog}><Link2 size={16} /></ToolbarButton></ToolbarGroup><ToolbarGroup darkMode={darkMode}><ToolbarButton darkMode={darkMode} label="Bulleted list" onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}><List size={16} /></ToolbarButton><ToolbarButton darkMode={darkMode} label="Numbered list" onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}><ListOrdered size={16} /></ToolbarButton><ToolbarButton darkMode={darkMode} label="Clear list formatting" onClick={() => editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)}><ListX size={16} /></ToolbarButton></ToolbarGroup><ToolbarGroup darkMode={darkMode}>{onRequestScripture ? <ToolbarButton darkMode={darkMode} label="Insert Scripture" onClick={() => onRequestScripture(captureBookmark())}><ScrollText size={16} /></ToolbarButton> : null}<ToolbarButton darkMode={darkMode} label="Insert reflection, prayer, application, or quotation" onClick={() => onRequestPastoral?.(captureBookmark())}><MessageSquareQuote size={16} /></ToolbarButton></ToolbarGroup><ToolbarGroup darkMode={darkMode}><ToolbarButton darkMode={darkMode} label="Insert divider" onClick={() => insertChurchBlock('divider')}><Minus size={16} /></ToolbarButton>{onRequestMedia ? <ToolbarButton darkMode={darkMode} label="Insert image" onClick={() => onRequestMedia(captureBookmark())}><Image size={16} /></ToolbarButton> : mediaDisabledLabel ? <ToolbarButton darkMode={darkMode} disabled label={mediaDisabledLabel} onClick={() => undefined}><Image size={16} /></ToolbarButton> : null}</ToolbarGroup><ToolbarGroup darkMode={darkMode}><ToolbarButton darkMode={darkMode} disabled={!canUndo} label="Undo" onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}><Undo2 size={16} /></ToolbarButton><ToolbarButton darkMode={darkMode} disabled={!canRedo} label="Redo" onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}><Redo2 size={16} /></ToolbarButton></ToolbarGroup></div></div></>;
};
export default EditorToolbar;

