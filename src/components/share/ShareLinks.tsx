import { Copy, Mail, MessageCircle } from 'lucide-react';

type ShareLinksProps = {
  copyLabel?: string;
  darkMode: boolean;
  emailHref: string;
  onCopy: () => void;
  whatsappHref: string;
};

const ShareLinks = ({
  copyLabel = 'Copy link',
  darkMode,
  emailHref,
  onCopy,
  whatsappHref,
}: ShareLinksProps) => {
  const linkClass = darkMode
    ? 'inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-bold text-stone-300 transition hover:bg-white/5 hover:text-red-100 focus:outline-none focus:ring-2 focus:ring-red-200/40'
    : 'inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-bold text-zinc-700 transition hover:bg-white hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-700';

  return (
    <div className="grid gap-1">
      <button className={`${linkClass} text-left`} onClick={onCopy} type="button">
        <Copy size={14} aria-hidden="true" />
        {copyLabel}
      </button>
      <a className={linkClass} href={whatsappHref} rel="noreferrer" target="_blank">
        <MessageCircle size={14} aria-hidden="true" />
        WhatsApp
      </a>
      <a className={linkClass} href={emailHref}>
        <Mail size={14} aria-hidden="true" />
        Email
      </a>
    </div>
  );
};

export default ShareLinks;