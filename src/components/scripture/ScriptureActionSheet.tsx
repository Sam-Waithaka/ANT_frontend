import { BookText, ChevronDown, ChevronUp, Copy, Share2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type ScriptureActionSheetProps = {
  copySelectionLabel?: string;
  darkMode: boolean;
  description: string;
  open: boolean;
  onCopySelection: () => void;
  title: string;
  onClose: () => void;
  onCopyChapter: () => void;
  onShareSelection: () => void;
  onShareChapter: () => void;
  shareSelectionLabel?: string;
};

const actionButtonBase =
  'flex min-h-12 w-full items-center gap-3 rounded-2xl border px-4 text-left text-sm font-bold transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700';

const ScriptureActionSheet = ({
  copySelectionLabel = 'Copy verse',
  darkMode,
  description,
  open,
  onCopySelection,
  title,
  onClose,
  onCopyChapter,
  onShareSelection,
  onShareChapter,
  shareSelectionLabel = 'Share verse',
}: ScriptureActionSheetProps) => {
  if (!open) {
    return null;
  }

  const [mobileExpanded, setMobileExpanded] = useState(false);

  useEffect(() => {
    if (!open) {
      setMobileExpanded(false);
    }
  }, [open]);

  const surfaceClass = darkMode
    ? 'border-white/10 bg-[#080808] text-stone-100'
    : 'border-black/10 bg-[#f8f5ef] text-zinc-950';
  const buttonClass = darkMode
    ? 'border-white/10 bg-white/[0.05] text-stone-100 hover:bg-white/10'
    : 'border-black/10 bg-white text-zinc-900 hover:bg-[#fffaf0]';
  const subtleButtonClass = darkMode
    ? 'border-white/10 bg-white/[0.04] text-stone-200 hover:bg-white/[0.08]'
    : 'border-black/10 bg-white/85 text-zinc-700 hover:bg-white';

  return (
    <>
      <div
        className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] hidden justify-center px-4 md:flex"
        role="dialog"
        aria-modal="false"
        aria-labelledby="scripture-action-sheet-title"
      >
        <div
          className={`pointer-events-auto w-full max-w-xl rounded-[2rem] border shadow-2xl backdrop-blur-xl ${
            darkMode ? 'bg-[#080808]/96' : 'bg-[#f8f5ef]/96'
          } ${surfaceClass}`}
        >
          <div className={`flex items-start justify-between gap-4 border-b px-5 py-4 ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">
                Scripture actions
              </p>
              <h2 id="scripture-action-sheet-title" className="mt-2 text-xl font-black">
                {title}
              </h2>
              <p className={`mt-2 whitespace-pre-line text-sm leading-6 ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
                {description}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={`grid size-11 shrink-0 place-items-center rounded-full border transition ${buttonClass}`}
              aria-label="Close Scripture actions"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid gap-3 p-5">
            <button type="button" onClick={onShareSelection} className={`${actionButtonBase} ${buttonClass}`}>
              <Share2 size={18} />
              {shareSelectionLabel}
            </button>
            <button type="button" onClick={onCopySelection} className={`${actionButtonBase} ${buttonClass}`}>
              <Copy size={18} />
              {copySelectionLabel}
            </button>
            <button type="button" onClick={onShareChapter} className={`${actionButtonBase} ${buttonClass}`}>
              <BookText size={18} />
              Share chapter
            </button>
            <button type="button" onClick={onCopyChapter} className={`${actionButtonBase} ${buttonClass}`}>
              <Copy size={18} />
              Copy chapter
            </button>
          </div>
        </div>
      </div>
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] px-3 pb-3 md:hidden"
        role="dialog"
        aria-modal="false"
        aria-labelledby="scripture-action-sheet-title-mobile"
      >
        <div
          className={`pointer-events-auto mx-auto w-full max-w-lg rounded-[1.75rem] border shadow-2xl backdrop-blur-xl ${surfaceClass} ${
            darkMode ? 'bg-[#080808]/92' : 'bg-[#f8f5ef]/92'
          }`}
        >
          <div className={`flex items-start gap-3 border-b px-4 py-3 ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">
                Scripture actions
              </p>
              <h2 id="scripture-action-sheet-title-mobile" className="mt-1 truncate text-lg font-black">
                {title}
              </h2>
              <p className={`mt-1 line-clamp-2 text-sm leading-5 ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
                {description}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileExpanded((current) => !current)}
                className={`grid size-10 place-items-center rounded-full border transition ${subtleButtonClass}`}
                aria-label={mobileExpanded ? 'Collapse Scripture actions' : 'Expand Scripture actions'}
                aria-expanded={mobileExpanded}
              >
                {mobileExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              <button
                type="button"
                onClick={onClose}
                className={`grid size-10 place-items-center rounded-full border transition ${subtleButtonClass}`}
                aria-label="Close Scripture actions"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="grid gap-3 p-4">
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={onShareSelection} className={`${actionButtonBase} ${buttonClass} min-h-11 justify-center px-3 text-center text-[0.95rem]`}>
                <Share2 size={17} />
                {shareSelectionLabel}
              </button>
              <button type="button" onClick={onCopySelection} className={`${actionButtonBase} ${buttonClass} min-h-11 justify-center px-3 text-center text-[0.95rem]`}>
                <Copy size={17} />
                {copySelectionLabel}
              </button>
            </div>

            {mobileExpanded ? (
              <div className="grid gap-3 border-t pt-3 dark:border-white/10">
                <button type="button" onClick={onShareChapter} className={`${actionButtonBase} ${buttonClass}`}>
                  <BookText size={18} />
                  Share chapter
                </button>
                <button type="button" onClick={onCopyChapter} className={`${actionButtonBase} ${buttonClass}`}>
                  <Copy size={18} />
                  Copy chapter
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default ScriptureActionSheet;
