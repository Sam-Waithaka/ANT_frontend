import { $createParagraphNode, $createRangeSelection, $createTextNode, $getRoot, $setSelection, createEditor } from 'lexical';
import { HeadingNode } from '@lexical/rich-text';
import { describe, expect, it } from 'vitest';
import { applyBlockFormat } from '../../src/components/portal/writing/editor/blockFormatting';

describe('applyBlockFormat', () => {
  it('splits a partial paragraph selection into a standalone heading', () => {
    const editor = createEditor({ nodes: [HeadingNode] });
    editor.update(() => {
      const paragraph = $createParagraphNode();
      const text = $createTextNode('Before selected after');
      paragraph.append(text);
      $getRoot().append(paragraph);
      const selection = $createRangeSelection();
      selection.anchor.set(text.getKey(), 7, 'text');
      selection.focus.set(text.getKey(), 15, 'text');
      $setSelection(selection);
      applyBlockFormat('h3');
    }, { discrete: true });
    const children = (editor.getEditorState().toJSON() as { root: { children: unknown[] } }).root.children;
    expect(children).toEqual(expect.arrayContaining([expect.objectContaining({ type: 'heading', tag: 'h3' })]));
    expect(JSON.stringify(children)).toContain('selected');
    expect(JSON.stringify(children)).toContain('Before');
    expect(JSON.stringify(children)).toContain('after');
  });
});



