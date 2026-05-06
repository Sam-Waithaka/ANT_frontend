import { BookText, Copy, Share2, X } from 'lucide-react';

type ScriptureActionSheetProps = {
  darkMode: boolean;
  description: string;
  open: boolean;
  title: string;
  onClose: () => void;
  onCopyChapter: () => void;
  onCopyVerse: () => void;
  onShareChapter: () => void;
  onShareVerse: () => void;
};

const actionButtonBase =
  'flex min-h-12 w-full items-center gap-3 rounded-2xl border px-4 text-left text-sm font-bold transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700';

const ScriptureActionSheet = ({
  darkMode,
  description,
  open,
  title,
  onClose,
  onCopyChapter,
  onCopyVerse,
  onShareChapter,
  onShareVerse,
}: ScriptureActionSheetProps) => {
  if (!open) {
    return null;
  }

  const surfaceClass = darkMode
    ? 'border-white/10 bg-[#080808] text-stone-100'
    : 'border-black/10 bg-[#f8f5ef] text-zinc-950';
  const buttonClass = darkMode
    ? 'border-white/10 bg-white/[0.05] text-stone-100 hover:bg-white/10'
    : 'border-black/10 bg-white text-zinc-900 hover:bg-[#fffaf0]';

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/55 p-3 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="scripture-action-sheet-title"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className={`w-full max-w-xl rounded-[2rem] border shadow-2xl ${surfaceClass}`}
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
          <button type="button" onClick={onShareVerse} className={`${actionButtonBase} ${buttonClass}`}>
            <Share2 size={18} />
            Share verse
          </button>
          <button type="button" onClick={onCopyVerse} className={`${actionButtonBase} ${buttonClass}`}>
            <Copy size={18} />
            Copy verse
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
  );
};

export default ScriptureActionSheet;
