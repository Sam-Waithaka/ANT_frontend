import { $patchStyleText, $setBlocksType } from '@lexical/selection';
import { $createHeadingNode } from '@lexical/rich-text';
import { $createParagraphNode, $createTextNode, $getSelection, $isRangeSelection, $isTextNode, $setSelection, type LexicalNode } from 'lexical';

export type BlockFormat = 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'paragraph';

const selectedTextNodeRange = () => {
  const selection = $getSelection();
  if (!$isRangeSelection(selection) || selection.isCollapsed()) return null;
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  if (!anchorNode.is(focusNode) || !$isTextNode(anchorNode)) return null;
  const topLevel = anchorNode.getTopLevelElement();
  if (!topLevel) return null;
  const start = Math.min(selection.anchor.offset, selection.focus.offset);
  const end = Math.max(selection.anchor.offset, selection.focus.offset);
  const source = anchorNode.getTextContent();
  if (start === 0 && end === source.length) return null;
  return { after: source.slice(end), before: source.slice(0, start), selected: source.slice(start, end), topLevel };
};

export const replacePartialSelectionWithBlock = (createBlock: (text: string) => LexicalNode) => {
  const range = selectedTextNodeRange();
  if (!range || !range.selected) return false;
  const replacement = createBlock(range.selected);
  $setSelection(null);
  if (range.before) {
    const before = $createParagraphNode();
    before.append($createTextNode(range.before));
    range.topLevel.insertBefore(before);
  }
  range.topLevel.replace(replacement);
  if (range.after) {
    const after = $createParagraphNode();
    after.append($createTextNode(range.after));
    replacement.insertAfter(after);
  }
  return true;
};

export const applyBlockFormat = (format: BlockFormat) => {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return;
  if (format !== 'paragraph' && replacePartialSelectionWithBlock((text) => {
    const heading = $createHeadingNode(format);
    heading.append($createTextNode(text));
    return heading;
  })) return;
  $setBlocksType(selection, () => format === 'paragraph' ? $createParagraphNode() : $createHeadingNode(format));
};

export const toggleEditorialEmphasis = () => {
  const selection = $getSelection();
  if (!$isRangeSelection(selection) || selection.isCollapsed()) return;
  const anchorNode = selection.anchor.getNode();
  const isActive = $isTextNode(anchorNode) && anchorNode.getStyle().includes('font-family: Georgia');
  $patchStyleText(selection, { 'font-family': isActive ? null : 'Georgia, Times New Roman, serif', 'font-size': isActive ? null : '1.125em' });
};
