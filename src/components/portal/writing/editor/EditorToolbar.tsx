import { useEffect, useState } from 'react';
import {
  AlignLeft,
  Bold,
  ChevronDown,
  Image,
  Italic,
  Link2,
  List,
  ListOrdered,
  ListX,
  MessageSquareQuote,
  Minus,
  Redo2,
  ScrollText,
  Underline,
  Undo2,
} from 'lucide-react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND } from '@lexical/list';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $createDefaultChurchBlock } from './nodes/ChurchBlockNode';

type EditorToolbarProps = {
  darkMode: boolean;
  onRequestMedia?: () => void;
};

type ToolbarButtonProps = {
  active?: boolean;
  children: React.ReactNode;
  darkMode: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
};

const ToolbarButton = ({ active = false, children, darkMode, disabled = false, label, onClick }: ToolbarButtonProps) => {
  const stateClass = active
    ? darkMode
      ? 'border-red-900/50 bg-red-950/40 text-red-200'
      : 'border-red-200 bg-red-50 text-red-800'
    : darkMode
      ? 'border-transparent text-stone-200 hover:bg-white/10'
      : 'border-transparent text-zinc-700 hover:bg-black/5';

  return (
    <button aria-label={label} className={'grid size-9 place-items-center rounded-xl border transition focus:outline-none focus:ring-2 focus:ring-red-800/30 disabled:cursor-not-allowed disabled:opacity-40 ' + stateClass} disabled={disabled} onClick={onClick} title={label} type="button">
      {children}
    </button>
  );
};

const ToolbarGroup = ({ children, darkMode, separated = true }: { children: React.ReactNode; darkMode: boolean; separated?: boolean }) => (
  <div className={'flex items-center gap-1 ' + (separated ? 'border-l pl-2 ' + (darkMode ? 'border-white/10' : 'border-black/10') : '')}>{children}</div>
);

const EditorToolbar = ({ darkMode, onRequestMedia }: EditorToolbarProps) => {
  const [editor] = useLexicalComposerContext();
  const [activeFormats, setActiveFormats] = useState({ bold: false, italic: false, underline: false });
  const [canRedo, setCanRedo] = useState(false);
  const [canUndo, setCanUndo] = useState(false);

  useEffect(() => mergeRegister(
    editor.registerCommand(CAN_UNDO_COMMAND, (payload) => { setCanUndo(payload); return false; }, COMMAND_PRIORITY_LOW),
    editor.registerCommand(CAN_REDO_COMMAND, (payload) => { setCanRedo(payload); return false; }, COMMAND_PRIORITY_LOW),
    editor.registerUpdateListener(({ editorState }) => editorState.read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return setActiveFormats({ bold: false, italic: false, underline: false });
      setActiveFormats({ bold: selection.hasFormat('bold'), italic: selection.hasFormat('italic'), underline: selection.hasFormat('underline') });
    })),
  ), [editor]);

  const insertBlock = (block: 'h2' | 'h3' | 'paragraph' | 'quote') => editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;
    if (block === 'paragraph') selection.insertNodes([$createParagraphNode()]);
    if (block === 'h2' || block === 'h3') selection.insertNodes([$createHeadingNode(block)]);
    if (block === 'quote') selection.insertNodes([$createQuoteNode()]);
  });

  const insertChurchBlock = (kind: 'callout' | 'divider' | 'scripture') => editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) selection.insertNodes([$createDefaultChurchBlock(kind)]);
  });

  const toggleLink = () => {
    const url = window.prompt('Enter a URL');
    if (url !== null) editor.dispatchCommand(TOGGLE_LINK_COMMAND, url.trim() || null);
  };

  const surfaceClass = darkMode ? 'border-white/10 bg-[#171717] text-stone-100' : 'border-black/10 bg-white text-zinc-950';
  const selectClass = darkMode ? 'border-white/10 bg-zinc-950 text-stone-100' : 'border-black/10 bg-[#fffaf0] text-zinc-950';

  return (
    <div aria-label="Writing tools" className={'flex flex-wrap items-center gap-2 border-b px-3 py-2 ' + surfaceClass} role="toolbar">
      <div className={'relative flex items-center rounded-xl border ' + selectClass}>
        <AlignLeft aria-hidden="true" className="ml-3 size-4 text-red-800" />
        <select aria-label="Block type" className="appearance-none bg-transparent py-2 pl-2 pr-8 text-xs font-bold outline-none" defaultValue="paragraph" onChange={(event) => insertBlock(event.target.value as 'h2' | 'h3' | 'paragraph' | 'quote')}>
          <option value="paragraph">Paragraph</option><option value="h2">Heading 2</option><option value="h3">Heading 3</option><option value="quote">Blockquote</option>
        </select>
        <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-2 size-4" />
      </div>

      <ToolbarGroup darkMode={darkMode} separated={false}>
        <ToolbarButton active={activeFormats.bold} darkMode={darkMode} label="Bold" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}><Bold size={16} /></ToolbarButton>
        <ToolbarButton active={activeFormats.italic} darkMode={darkMode} label="Italic" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}><Italic size={16} /></ToolbarButton>
        <ToolbarButton active={activeFormats.underline} darkMode={darkMode} label="Underline" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}><Underline size={16} /></ToolbarButton>
        <ToolbarButton darkMode={darkMode} label="Add link" onClick={toggleLink}><Link2 size={16} /></ToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup darkMode={darkMode}>
        <ToolbarButton darkMode={darkMode} label="Bulleted list" onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}><List size={16} /></ToolbarButton>
        <ToolbarButton darkMode={darkMode} label="Numbered list" onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}><ListOrdered size={16} /></ToolbarButton>
        <ToolbarButton darkMode={darkMode} label="Clear list formatting" onClick={() => editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)}><ListX size={16} /></ToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup darkMode={darkMode}>
        <ToolbarButton darkMode={darkMode} label="Insert Scripture block" onClick={() => insertChurchBlock('scripture')}><ScrollText size={16} /></ToolbarButton>
        <ToolbarButton darkMode={darkMode} label="Insert devotional callout" onClick={() => insertChurchBlock('callout')}><MessageSquareQuote size={16} /></ToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup darkMode={darkMode}>
        <ToolbarButton darkMode={darkMode} label="Insert divider" onClick={() => insertChurchBlock('divider')}><Minus size={16} /></ToolbarButton>
        {onRequestMedia ? <ToolbarButton darkMode={darkMode} label="Insert image" onClick={onRequestMedia}><Image size={16} /></ToolbarButton> : null}
      </ToolbarGroup>

      <ToolbarGroup darkMode={darkMode}>
        <ToolbarButton darkMode={darkMode} disabled={!canUndo} label="Undo" onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}><Undo2 size={16} /></ToolbarButton>
        <ToolbarButton darkMode={darkMode} disabled={!canRedo} label="Redo" onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}><Redo2 size={16} /></ToolbarButton>
      </ToolbarGroup>
    </div>
  );
};

export default EditorToolbar;
