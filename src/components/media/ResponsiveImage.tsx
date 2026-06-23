import { useEffect, useState } from 'react';
import { readyMediaVariants, type MediaAsset, type MediaVariant } from '../../services/mediaAssetsApi';

export type ResponsiveImagePreset = 'articleCover' | 'card' | 'hero' | 'thumbnail';

const imagePresets: Record<ResponsiveImagePreset, { sizes: string }> = {
  articleCover: { sizes: '(max-width: 1024px) 100vw, 56rem' },
  card: { sizes: '(max-width: 640px) 92vw, 20rem' },
  hero: { sizes: '100vw' },
  thumbnail: { sizes: '160px' },
};

const toSrcSet = (variants: MediaVariant[]) => variants.map((variant) => `${variant.url} ${variant.width}w`).join(', ');

const firstReadyVariant = (asset: MediaAsset) =>
  readyMediaVariants(asset, 'jpeg')[0]
  || readyMediaVariants(asset, 'webp')[0]
  || readyMediaVariants(asset, 'avif')[0];

type ResponsiveImageProps = {
  alt?: string;
  asset: MediaAsset | null | undefined;
  className?: string;
  fetchPriority?: 'high' | 'low' | 'auto';
  loading?: 'eager' | 'lazy';
  onRefreshAsset?: () => Promise<MediaAsset | null>;
  preset: ResponsiveImagePreset;
};

const ResponsiveImage = ({
  alt,
  asset,
  className,
  fetchPriority,
  loading = 'lazy',
  onRefreshAsset,
  preset,
}: ResponsiveImageProps) => {
  const [activeAsset, setActiveAsset] = useState(asset);
  const [hasRetried, setHasRetried] = useState(false);

  useEffect(() => {
    setActiveAsset(asset);
    setHasRetried(false);
  }, [asset]);

  if (!activeAsset || activeAsset.status !== 'ready') return null;

  const avif = readyMediaVariants(activeAsset, 'avif');
  const webp = readyMediaVariants(activeAsset, 'webp');
  const jpeg = readyMediaVariants(activeAsset, 'jpeg');
  const fallbackVariant = firstReadyVariant(activeAsset);
  const fallbackUrl = jpeg[0]?.url || fallbackVariant?.url || activeAsset.original_url;

  if (!fallbackUrl) return null;

  const width = activeAsset.width || fallbackVariant?.width;
  const height = activeAsset.height || fallbackVariant?.height;
  const resolvedAlt = alt ?? activeAsset.alt_text ?? activeAsset.title ?? '';

  const handleError = async () => {
    if (hasRetried || !onRefreshAsset) return;
    setHasRetried(true);
    try {
      const refreshedAsset = await onRefreshAsset();
      if (refreshedAsset) setActiveAsset(refreshedAsset);
    } catch {
      // The original image failure remains visible; do not retry indefinitely.
    }
  };

  return (
    <picture>
      {avif.length ? <source srcSet={toSrcSet(avif)} sizes={imagePresets[preset].sizes} type="image/avif" /> : null}
      {webp.length ? <source srcSet={toSrcSet(webp)} sizes={imagePresets[preset].sizes} type="image/webp" /> : null}
      <img
        alt={resolvedAlt}
        className={className}
        decoding="async"
        fetchPriority={fetchPriority}
        height={height}
        loading={loading}
        onError={() => { void handleError(); }}
        sizes={imagePresets[preset].sizes}
        src={fallbackUrl}
        srcSet={jpeg.length ? toSrcSet(jpeg) : undefined}
        width={width}
      />
    </picture>
  );
};

export default ResponsiveImage;



