import { createEditor } from 'lexical';
import { describe, expect, it } from 'vitest';
import { $createEditableBlockQuoteNode, EditableBlockQuoteNode } from '../../src/components/portal/writing/editor/nodes/EditableBlockQuoteNode';

describe('EditableBlockQuoteNode', () => {
  it('serializes and updates a dedicated editor blockquote', () => {
    const editor = createEditor({ nodes: [EditableBlockQuoteNode] });
    let serialized: unknown;
    editor.update(() => {
      const node = $createEditableBlockQuoteNode({ content: 'A quiet quotation.' });
      node.setData({ content: 'An updated quotation.' });
      serialized = node.exportJSON();
    });
    expect(serialized).toMatchObject({ data: { content: 'An updated quotation.' }, type: 'editorial-blockquote' });
  });

  it('persists quotation attribution and context separately from the quote text', () => {
    const editor = createEditor({ nodes: [EditableBlockQuoteNode] });
    let serialized: unknown;
    editor.update(() => {
      serialized = $createEditableBlockQuoteNode({
        attribution: 'Tim Keller',
        content: 'To be loved and to be known.',
        context: 'On prayer',
      }).exportJSON();
    });
    expect(serialized).toMatchObject({
      data: {
        attribution: 'Tim Keller',
        content: 'To be loved and to be known.',
        context: 'On prayer',
      },
      type: 'editorial-blockquote',
    });
  });
});
