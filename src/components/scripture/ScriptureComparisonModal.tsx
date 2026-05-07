import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { BibleComparisonChapter } from '../../types/scripture';

type ScriptureComparisonModalProps = {
  comparison: BibleComparisonChapter | null;
  darkMode: boolean;
  highlightedVerseNumber?: number | null;
  highlightedVerseNumbers?: number[];
  open: boolean;
  selectedCompareVersions: string[];
  versionLabelFor: (versionId: string) => string;
  onClose: () => void;
};

const ScriptureComparisonModal = ({
  comparison,
  darkMode,
  highlightedVerseNumber = null,
  highlightedVerseNumbers = [],
  open,
  selectedCompareVersions,
  versionLabelFor,
  onClose,
}: ScriptureComparisonModalProps) => {
  const highlightedVerseRef = useRef<HTMLElement | null>(null);
  const highlightedNumbers =
    highlightedVerseNumbers.length > 0
      ? highlightedVerseNumbers
      : highlightedVerseNumber
        ? [highlightedVerseNumber]
        : [];
  const firstHighlightedVerseNumber = highlightedNumbers[0] || null;

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  useEffect(() => {
    if (!open || !firstHighlightedVerseNumber) {
      return;
    }

    highlightedVerseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [firstHighlightedVerseNumber, open]);

  if (!open || !comparison) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 pb-4 pt-20 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="comparison-title"
    >
      <div
        className={`flex max-h-[calc(100vh-6rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border shadow-2xl sm:max-h-[90vh] ${
          darkMode ? 'border-white/10 bg-[#080808] text-stone-100' : 'border-black/10 bg-[#f8f5ef] text-zinc-950'
        }`}
      >
        <div className={`flex items-start justify-between gap-4 border-b p-5 ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-900 dark:text-red-200">Chapter comparison</p>
            <h2 id="comparison-title" className="mt-2 text-2xl font-black sm:text-3xl">
              {comparison.book} {comparison.chapter}
            </h2>
            <p className={`mt-1 text-sm ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
              {selectedCompareVersions.map(versionLabelFor).join(', ')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full border text-xl font-black transition ${
              darkMode ? 'border-white/10 bg-white/10 hover:bg-white/15' : 'border-black/10 bg-white hover:bg-[#fffaf0]'
            }`}
            aria-label="Close comparison"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          {comparison.verses.length > 0 ? (
            <div className="grid gap-5">
              {comparison.verses.map((verse) => {
                const isHighlighted = highlightedNumbers.includes(verse.verseNumber);

                return (
                  <section
                    key={verse.verseNumber}
                    ref={verse.verseNumber === firstHighlightedVerseNumber ? highlightedVerseRef : null}
                    data-highlighted={isHighlighted || undefined}
                    data-verse-number={verse.verseNumber}
                    className={`rounded-3xl border p-4 ${
                      isHighlighted
                        ? darkMode
                          ? 'border-red-200/45 bg-red-950/15'
                          : 'border-red-900/25 bg-red-50/70'
                        : darkMode
                          ? 'border-white/10 bg-[#171717]'
                          : 'border-black/10 bg-white'
                    }`}
                  >
                    <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">
                      Verse {verse.verseNumber}
                    </p>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {selectedCompareVersions.map((version) => {
                        const reading = verse.readings.find((item) => item.version.toLowerCase() === version.toLowerCase());

                        return (
                          <article
                            key={version}
                            className={`rounded-2xl border p-4 ${
                              darkMode ? 'border-white/10 bg-[#080808]' : 'border-black/10 bg-[#fffaf0]'
                            }`}
                          >
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-red-900 dark:text-red-200">
                              {versionLabelFor(version)}
                            </p>
                            <p className={`mt-3 text-base leading-8 ${darkMode ? 'text-stone-200' : 'text-zinc-800'}`}>
                              {reading?.text || 'This verse is not available in this version.'}
                            </p>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <div className={`rounded-3xl border p-6 text-center ${darkMode ? 'border-white/10 bg-[#171717]' : 'border-black/10 bg-white'}`}>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">No comparison text</p>
              <p className={`mt-2 text-sm leading-6 ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
                The compare endpoint responded, but no verse text was found for this chapter.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScriptureComparisonModal;
