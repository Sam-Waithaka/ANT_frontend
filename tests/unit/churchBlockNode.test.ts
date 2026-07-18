import { createEditor } from 'lexical';
import { describe, expect, it } from 'vitest';
import { $createChurchBlockNode, ChurchBlockNode } from '../../src/components/writing/editor/nodes/ChurchBlockNode';
import { mediaEmbedMap } from '../../src/components/writing/editor/nodes/ChurchBlockMediaContext';

describe('ChurchBlockNode', () => {
  it('serializes Scripture content as durable editor JSON', () => {
    const editor = createEditor({ nodes: [ChurchBlockNode] });
    let serialized: unknown;

    editor.update(() => {
      serialized = $createChurchBlockNode({
        body: 'Oh come, let us worship and bow down.',
        kind: 'scripture',
        reference: 'Psalm 95:6',
      }).exportJSON();
    });

    expect(serialized).toMatchObject({
      data: {
        body: 'Oh come, let us worship and bow down.',
        kind: 'scripture',
        reference: 'Psalm 95:6',
      },
      type: 'church-block',
      version: 1,
    });
  });

  it('maps resolved embed details by the durable media asset id', () => {
    const map = mediaEmbedMap([{
      id: 4,
      media_asset: 8,
      media_asset_detail: {
        caption: '', height: 360, id: 8, original_url: null, status: 'ready', title: 'Church', uuid: 'asset-8', variant_map: {}, variants: [], width: 640,
      },
    }]);

    expect(map.get('8')?.title).toBe('Church');
  });
});

