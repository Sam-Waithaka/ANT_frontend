import { Check, Share2 } from 'lucide-react';
import type { ShareStatus } from './useShareAction';

type ShareButtonProps = {
  copiedLabel?: string;
  darkMode: boolean;
  label?: string;
  onShare: () => void;
  shareStatus?: ShareStatus;
  variant?: 'outline' | 'primary';
};

const ShareButton = ({
  copiedLabel = 'Link copied',
  darkMode,
  label = 'Share',
  onShare,
  shareStatus = 'idle',
  variant = 'outline',
}: ShareButtonProps) => {
  const className = variant === 'primary'
    ? 'inline-flex min-h-10 items-center gap-2 rounded-full bg-red-800 px-4 text-sm font-black text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 dark:focus:ring-offset-black'
    : darkMode
      ? 'inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-sm font-black text-stone-100 transition hover:-translate-y-0.5 hover:border-red-200/30 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-red-200/50'
      : 'inline-flex min-h-10 items-center gap-2 rounded-full border border-[#eaded0] bg-white px-4 text-sm font-black text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 focus:ring-offset-[#fffaf0]';

  return (
    <button aria-live="polite" className={className} onClick={onShare} type="button">
      {shareStatus === 'copied' ? <Check size={16} aria-hidden="true" /> : <Share2 size={16} aria-hidden="true" />}
      {shareStatus === 'copied' ? copiedLabel : label}
    </button>
  );
};

export default ShareButton;