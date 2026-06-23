export type ImageAlignment = 'center' | 'left' | 'right' | 'wide';

export type ImageBlockMetadata = {
  alignment: ImageAlignment;
  altText: string;
  caption: string;
  embedId?: number | string;
  mediaAssetId: number | string;
  positionHint: string;
};

export const extractImageBlocks = (content: unknown): ImageBlockMetadata[] => {
  const root = content && typeof content === 'object' ? (content as { root?: { children?: unknown[] } }).root : undefined;
  if (!Array.isArray(root?.children)) return [];

  return root.children.flatMap((child, index) => {
    if (!child || typeof child !== 'object') return [];
    const record = child as { data?: Record<string, unknown>; type?: string };
    const data = record.data;
    if (record.type !== 'church-block' || data?.kind !== 'image' || (typeof data.mediaAssetId !== 'number' && typeof data.mediaAssetId !== 'string')) return [];

    return [{
      alignment: data.alignment === 'left' || data.alignment === 'right' || data.alignment === 'wide' ? data.alignment : 'center',
      altText: typeof data.altText === 'string' ? data.altText : '',
      caption: typeof data.caption === 'string' ? data.caption : '',
      embedId: typeof data.embedId === 'number' || typeof data.embedId === 'string' ? data.embedId : undefined,
      mediaAssetId: data.mediaAssetId,
      positionHint: `root.children.${index}`,
    }];
  });
};
