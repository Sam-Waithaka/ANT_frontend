import { createEditor } from 'lexical';
import { describe, expect, it } from 'vitest';
import { $createScriptureBlockNode, ScriptureBlockNode } from '../../src/components/writing/editor/nodes/ScriptureBlockNode';
import { $createScriptureReferenceNode, ScriptureReferenceNode } from '../../src/components/writing/editor/nodes/ScriptureReferenceNode';

describe('Scripture Lexical nodes', () => {
  it('serializes an offline-safe API Scripture passage snapshot', () => {
    const editor = createEditor({ nodes: [ScriptureBlockNode] });
    let serialized: unknown;
    editor.update(() => {
      serialized = $createScriptureBlockNode({
        display: 'passage', reference: 'John 15:1-2', source: 'api', sourceId: 'BSB:John:15:1,2', text: 'I am the true vine.\nEvery branch in me that bears no fruit...', version: 'BSB', verses: [{ number: 1, text: 'I am the true vine.' }, { number: 2, text: 'Every branch in me that bears no fruit...' }],
      }).exportJSON();
    });
    expect(serialized).toMatchObject({ data: { display: 'passage', reference: 'John 15:1-2', source: 'api', sourceId: 'BSB:John:15:1,2', version: 'BSB', verses: expect.arrayContaining([expect.objectContaining({ number: 1 })]) }, type: 'scripture-block' });
  });

  it('serializes a manual inline citation without relying on the Bible API', () => {
    const editor = createEditor({ nodes: [ScriptureReferenceNode] });
    let serialized: unknown;
    editor.update(() => {
      serialized = $createScriptureReferenceNode({ display: 'inline', reference: 'Psalm 119:105', source: 'manual', text: 'Your word is a lamp to my feet.', version: 'AMP' }).exportJSON();
    });
    expect(serialized).toMatchObject({ data: { display: 'inline', reference: 'Psalm 119:105', source: 'manual', text: 'Your word is a lamp to my feet.', version: 'AMP' }, type: 'scripture-reference' });
  });
});

