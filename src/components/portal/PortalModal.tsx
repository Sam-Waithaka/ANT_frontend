import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { portalSurface } from './portalSurface';

type PortalModalProps = {
  children: ReactNode;
  darkMode: boolean;
  description?: string;
  eyebrow?: string;
  footer?: ReactNode;
  labelledBy?: string;
  onClose: () => void;
  title: string;
};

const PortalModal = ({
  children,
  darkMode,
  description,
  eyebrow,
  footer,
  labelledBy = 'portal-modal-title',
  onClose,
  title,
}: PortalModalProps) => {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  if (typeof document === 'undefined') return null;

  const shellClass = darkMode
    ? 'border-white/10 bg-[#111111] text-stone-100 shadow-black/60'
    : 'border-[#eaded0] bg-[#fffaf0] text-zinc-950 shadow-zinc-900/20';

  return createPortal(
    <div aria-labelledby={labelledBy} aria-modal="true" className="fixed inset-0 z-50 grid place-items-end bg-black/45 p-3 backdrop-blur-sm sm:place-items-center sm:p-5" role="dialog">
      <button aria-label="Close modal" className="absolute inset-0 cursor-default" onClick={onClose} type="button" />
      <section className={`relative z-10 flex max-h-[min(44rem,calc(100dvh-1.5rem))] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border shadow-2xl ${shellClass}`}>
        <header className="flex items-start justify-between gap-4 border-b border-[#eaded0] px-5 py-5 dark:border-white/10 sm:px-7">
          <div className="min-w-0">
            {eyebrow ? <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800 dark:text-red-200">{eyebrow}</p> : null}
            <h2 className="mt-2 font-serif text-3xl leading-tight sm:text-4xl" id={labelledBy}>{title}</h2>
            {description ? <p className={`mt-3 max-w-xl text-sm leading-6 ${portalSurface.softMutedText(darkMode)}`}>{description}</p> : null}
          </div>
          <button aria-label="Close" className={darkMode ? 'grid size-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 transition hover:bg-white/10' : 'grid size-10 shrink-0 place-items-center rounded-full border border-[#eaded0] bg-white transition hover:bg-[#fffaf0]'} onClick={onClose} type="button">
            <X size={18} />
          </button>
        </header>

        <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-7">
          {children}
        </div>

        {footer ? <footer className="border-t border-[#eaded0] px-5 py-4 dark:border-white/10 sm:px-7">{footer}</footer> : null}
      </section>
    </div>,
    document.body,
  );
};

export default PortalModal;
