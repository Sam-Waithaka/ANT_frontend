import { useEffect, useState } from 'react';
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

type EditorToolbarProps = {
  darkMode: boolean;
};

type ToolbarButtonProps = {
  active?: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
};

const ToolbarButton = ({ active = false, children, disabled = false, label, onClick }: ToolbarButtonProps) => (
  <button
    aria-label={label}
    className={`grid size-9 place-items-center rounded-xl text-sm font-black transition focus:outline-none focus:ring-2 focus:ring-red-800/30 ${
      active ? 'bg-red-950/10 text-red-800' : 'hover:bg-black/5'
    } disabled:cursor-not-allowed disabled:opacity-40`}
    disabled={disabled}
    onClick={onClick}
    type="button"
  >
    {children}
  </button>
);

const EditorToolbar = ({ darkMode }: EditorToolbarProps) => {
  const [editor] = useLexicalComposerContext();
  const [canRedo, setCanRedo] = useState(false);
  const [canUndo, setCanUndo] = useState(false);

  useEffect(() => mergeRegister(
    editor.registerCommand(CAN_UNDO_COMMAND, (payload) => {
      setCanUndo(payload);
      return false;
    }, COMMAND_PRIORITY_LOW),
    editor.registerCommand(CAN_REDO_COMMAND, (payload) => {
      setCanRedo(payload);
      return false;
    }, COMMAND_PRIORITY_LOW),
  ), [editor]);

  const formatText = (format: 'bold' | 'italic' | 'underline') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const insertBlock = (block: 'h2' | 'h3' | 'paragraph' | 'quote') => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      if (block === 'paragraph') selection.insertNodes([$createParagraphNode()]);
      if (block === 'h2' || block === 'h3') selection.insertNodes([$createHeadingNode(block)]);
      if (block === 'quote') selection.insertNodes([$createQuoteNode()]);
    });
  };

  const toggleLink = () => {
    const url = window.prompt('Enter a URL');
    if (url === null) return;
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, url.trim() || null);
  };

  const surfaceClass = darkMode ? 'border-white/10 bg-[#171717] text-stone-100' : 'border-black/10 bg-white text-zinc-950';

  return (
    <div className={`flex flex-wrap items-center gap-1 border-b px-3 py-2 ${surfaceClass}`}>
      <select
        aria-label="Block type"
        className={`mr-2 rounded-xl border px-3 py-2 text-xs font-bold outline-none ${darkMode ? 'border-white/10 bg-zinc-950 text-stone-100' : 'border-black/10 bg-[#fffaf0] text-zinc-950'}`}
        defaultValue="paragraph"
        onChange={(event) => insertBlock(event.target.value as 'h2' | 'h3' | 'paragraph' | 'quote')}
      >
        <option value="paragraph">Paragraph</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
        <option value="quote">Blockquote</option>
      </select>
      <ToolbarButton label="Bold" onClick={() => formatText('bold')}><strong>B</strong></ToolbarButton>
      <ToolbarButton label="Italic" onClick={() => formatText('italic')}><em>I</em></ToolbarButton>
      <ToolbarButton label="Underline" onClick={() => formatText('underline')}><span className="underline">U</span></ToolbarButton>
      <ToolbarButton label="Add link" onClick={toggleLink}><span aria-hidden="true">Link</span></ToolbarButton>
      <ToolbarButton label="Bulleted list" onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}><span aria-hidden="true">UL</span></ToolbarButton>
      <ToolbarButton label="Numbered list" onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}><span aria-hidden="true">OL</span></ToolbarButton>
      <ToolbarButton label="Remove list" onClick={() => editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)}><span aria-hidden="true">PL</span></ToolbarButton>
      <span className={`mx-1 h-6 w-px ${darkMode ? 'bg-white/10' : 'bg-black/10'}`} />
      <ToolbarButton disabled={!canUndo} label="Undo" onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}><span aria-hidden="true">Undo</span></ToolbarButton>
      <ToolbarButton disabled={!canRedo} label="Redo" onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}><span aria-hidden="true">Redo</span></ToolbarButton>
    </div>
  );
};

export default EditorToolbar;
