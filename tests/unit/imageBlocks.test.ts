import { describe, expect, it } from 'vitest';
import { extractImageBlocks } from '../../src/components/portal/writing/editor/imageBlocks';

describe('extractImageBlocks', () => {
  it('derives backend position hints and durable image formatting from Lexical JSON', () => {
    expect(extractImageBlocks({
      root: {
        children: [
          { type: 'paragraph', version: 1 },
          { data: { alignment: 'right', altText: 'Church entrance', caption: 'A.I.C Njoro Town', embedId: 7, kind: 'image', mediaAssetId: 8 }, type: 'church-block', version: 1 },
        ],
      },
    })).toEqual([{
      alignment: 'right', altText: 'Church entrance', caption: 'A.I.C Njoro Town', embedId: 7, mediaAssetId: 8, positionHint: 'root.children.1',
    }]);
  });

  it('ignores non-image church blocks', () => {
    expect(extractImageBlocks({ root: { children: [{ data: { kind: 'scripture' }, type: 'church-block' }] } })).toEqual([]);
  });
});
