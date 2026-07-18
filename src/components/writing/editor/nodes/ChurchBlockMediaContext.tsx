import { createContext, useContext } from 'react';
import type { MediaAsset } from '../../../../services/mediaAssetsApi';

export type WritingMediaEmbedLike = {
  alt_text_override?: string;
  caption_override?: string;
  embed_id?: string;
  id: number | string;
  media_asset: number | string;
  media_asset_detail?: MediaAsset | null;
};

export const ChurchBlockMediaContext = createContext<Map<string, MediaAsset>>(new Map());

export const useChurchBlockMedia = (assetId?: number | string) => {
  const media = useContext(ChurchBlockMediaContext);
  return assetId === undefined ? undefined : media.get(String(assetId));
};

export const mediaEmbedMap = (embeds: WritingMediaEmbedLike[] = []) => new Map(
  embeds.flatMap((embed) => embed.media_asset_detail ? [[String(embed.media_asset), embed.media_asset_detail] as const] : []),
);


