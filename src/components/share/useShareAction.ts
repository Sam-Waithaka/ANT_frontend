import { useCallback, useState } from 'react';
import { copyToClipboard } from '../../utils/copyToClipboard';

export type ShareStatus = 'copied' | 'idle';

export type SharePayload = {
  text?: string;
  title: string;
  url: string;
};

export const buildWhatsAppShareHref = ({ title, url }: SharePayload) =>
  `https://wa.me/?text=${encodeURIComponent(title)}%20${encodeURIComponent(url)}`;

export const buildEmailShareHref = ({ title, url }: SharePayload) =>
  `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;

export const useShareAction = (payload: SharePayload | null | undefined, resetMs = 2200) => {
  const [shareStatus, setShareStatus] = useState<ShareStatus>('idle');

  const copyShareUrl = useCallback(async () => {
    if (!payload?.url) return false;

    const copied = await copyToClipboard(payload.url);
    if (copied) {
      setShareStatus('copied');
      window.setTimeout(() => setShareStatus('idle'), resetMs);
    }

    return copied;
  }, [payload?.url, resetMs]);

  const share = useCallback(async () => {
    if (!payload?.url) return false;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(payload);
        return true;
      } catch {
        // Fall through to clipboard when native sharing is cancelled or unavailable.
      }
    }

    return copyShareUrl();
  }, [copyShareUrl, payload]);

  return { copyShareUrl, share, shareStatus };
};