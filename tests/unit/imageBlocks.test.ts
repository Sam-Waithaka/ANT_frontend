import { describe, expect, it } from 'vitest';
import { extractImageBlocks, imageBlockRecordId } from '../../src/components/writing/editor/imageBlocks';

describe('extractImageBlocks', () => {
  it('derives backend position hints and separates stable embed identity from record id', () => {
    expect(extractImageBlocks({
      root: {
        children: [
          { type: 'paragraph', version: 1 },
          { data: { alignment: 'right', altText: 'Church entrance', caption: 'A.I.C Njoro Town', embedRecordId: 7, embed_id: 'a3e7b43c-3563-4b7c-aefc-4e2f1f49c9b3', kind: 'image', mediaAssetId: 8 }, type: 'church-block', version: 1 },
        ],
      },
    })).toEqual([{
      alignment: 'right',
      altText: 'Church entrance',
      caption: 'A.I.C Njoro Town',
      embedId: undefined,
      embedRecordId: 7,
      embed_id: 'a3e7b43c-3563-4b7c-aefc-4e2f1f49c9b3',
      mediaAssetId: 8,
      positionHint: 'root.children.1',
    }]);
  });

  it('keeps legacy embedId blocks valid for record operations', () => {
    const [block] = extractImageBlocks({
      root: {
        children: [
          { data: { alignment: 'wide', embedId: 45, kind: 'image', mediaAssetId: 88 }, type: 'church-block', version: 1 },
        ],
      },
    });

    expect(block).toMatchObject({ embedId: 45, embedRecordId: 45, embed_id: undefined, mediaAssetId: 88 });
    expect(imageBlockRecordId(block)).toBe(45);
  });

  it('falls back to a legacy string embedId as stable identity and record id', () => {
    const [block] = extractImageBlocks({
      root: {
        children: [
          { data: { embedId: 'legacy-record-45', kind: 'image', mediaAssetId: 88 }, type: 'church-block', version: 1 },
        ],
      },
    });

    expect(block).toMatchObject({ embedId: 'legacy-record-45', embedRecordId: 'legacy-record-45', embed_id: 'legacy-record-45' });
    expect(imageBlockRecordId(block)).toBe('legacy-record-45');
  });

  it('ignores non-image church blocks', () => {
    expect(extractImageBlocks({ root: { children: [{ data: { kind: 'scripture' }, type: 'church-block' }] } })).toEqual([]);
  });
});
