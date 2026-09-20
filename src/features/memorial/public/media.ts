import type { MemorialMediaAsset } from "../../../types/memorialPublic";

export type MemorialPublicImageSize = "thumb" | "small" | "medium" | "large";

export type MemorialPublicImageVariant = {
  format: string;
  height: number | null;
  sizeName: string;
  url: string;
  width: number | null;
};

const formatPreference = ["avif", "webp", "jpeg"];

export function getBestMemorialImageVariant(
  asset: MemorialMediaAsset | null,
  preferredSize: MemorialPublicImageSize,
  { allowOriginal = true }: { allowOriginal?: boolean } = {},
): MemorialPublicImageVariant | null {
  if (!asset) {
    return null;
  }

  const sizePreference = getImageSizePreference(preferredSize);

  for (const format of formatPreference) {
    const variants = asset.variant_map?.[format];

    for (const size of sizePreference) {
      const variant = variants?.[size];

      if (variant?.url) {
        return {
          format: variant.format || format,
          height: variant.height,
          sizeName: variant.size_name || size,
          url: variant.url,
          width: variant.width,
        };
      }
    }
  }

  if (!allowOriginal || !asset.original_url) {
    return null;
  }

  return {
    format: "original",
    height: asset.height,
    sizeName: "original",
    url: asset.original_url,
    width: asset.width,
  };
}

function getImageSizePreference(preferredSize: MemorialPublicImageSize) {
  if (preferredSize === "large") {
    return ["large", "medium", "small", "thumb"];
  }

  if (preferredSize === "medium") {
    return ["medium", "large", "small", "thumb"];
  }

  if (preferredSize === "small") {
    return ["small", "thumb", "medium", "large"];
  }

  return ["thumb", "small", "medium", "large"];
}