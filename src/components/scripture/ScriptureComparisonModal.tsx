import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { assetPaths } from '../../constants/assets';
import type { BibleBook, BibleChapter, BibleComparisonChapter, BibleVersion } from '../../types/scripture';
import BibleVersionPickerList from './BibleVersionPickerList';
import ScriptureReferencePickerGroup from './ScriptureReferencePickerGroup';

type ComparisonReferenceChange = {
  bookId: string;
  chapterNumber: number;
};

type ComparisonMenu = 'version' | 'book' | 'chapter' | null;

type ScriptureComparisonModalProps = {
  books?: BibleBook[];
  chapters?: BibleChapter[];
  comparison: BibleComparisonChapter | null;
  comparisonNavigationLoading?: boolean;
  darkMode: boolean;
  highlightedVerseNumber?: number | null;
  highlightedVerseNumbers?: number[];
  open: boolean;
  selectedBookId?: string;
  selectedChapterNumber?: number;
  selectedCompareVersions: string[];
  versions: BibleVersion[];
  versionLabelFor: (versionId: string) => string;
  onClose: () => void;
  onComparisonReferenceChange?: (reference: ComparisonReferenceChange) => void | Promise<void>;
  onSelectedCompareVersionsChange?: (versionIds: string[]) => void | Promise<void>;
};

const ScriptureComparisonModal = ({
  books = [],
  chapters = [],
  comparison,
  comparisonNavigationLoading = false,
  darkMode,
  highlightedVerseNumber = null,
  highlightedVerseNumbers = [],
  open,
  selectedBookId,
  selectedChapterNumber,
  selectedCompareVersions,
  versions,
  versionLabelFor,
  onClose,
  onComparisonReferenceChange,
  onSelectedCompareVersionsChange,
}: ScriptureComparisonModalProps) => {
  const highlightedVerseRef = useRef<HTMLElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const pickerControlsRef = useRef<HTMLDivElement | null>(null);
  const [openMenu, setOpenMenu] = useState<ComparisonMenu>(null);
  const highlightedNumbers =
    highlightedVerseNumbers.length > 0
      ? highlightedVerseNumbers
      : highlightedVerseNumber
        ? [highlightedVerseNumber]
        : [];
  const firstHighlightedVerseNumber = highlightedNumbers[0] || null;

  const handleClose = useCallback(() => {
    setOpenMenu(null);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose, open]);

  useEffect(() => {
    if (!open || !firstHighlightedVerseNumber) {
      return;
    }

    highlightedVerseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [firstHighlightedVerseNumber, open]);

  useEffect(() => {
    if (!openMenu) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (pickerControlsRef.current?.contains(event.target as Node)) return;
      setOpenMenu(null);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [openMenu]);

  if (!open || !comparison) {
    return null;
  }

  const toggleVersion = (versionId: string) => {
    const nextVersions = selectedCompareVersions.includes(versionId)
      ? selectedCompareVersions.filter((id) => id !== versionId)
      : [...selectedCompareVersions, versionId];

    if (nextVersions.length === 0) {
      return;
    }

    void onSelectedCompareVersionsChange?.(nextVersions);
  };
  const canNavigateComparison = books.length > 0 && Boolean(onComparisonReferenceChange);
  const activeBookId =
    selectedBookId || books.find((book) => book.name.toLowerCase() === comparison.book.toLowerCase())?.id || '';
  const activeChapterNumber = selectedChapterNumber || comparison.chapter;
  const chapterOptions = chapters.length > 0
    ? chapters
    : [{ id: String(comparison.chapter), label: `Chapter ${comparison.chapter}`, number: comparison.chapter }];
  const activeChapterId =
    chapterOptions.find((chapter) => chapter.number === activeChapterNumber)?.id || String(activeChapterNumber);
  const handleBookChange = (bookId: string) => {
    void onComparisonReferenceChange?.({ bookId, chapterNumber: activeChapterNumber });
  };
  const handleChapterChange = (chapterId: string) => {
    const chapterNumber =
      chapterOptions.find((chapter) => chapter.id === chapterId)?.number || Number(chapterId);

    if (!Number.isFinite(chapterNumber)) {
      return;
    }

    void onComparisonReferenceChange?.({ bookId: activeBookId, chapterNumber });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 pb-4 pt-20 backdrop-blur-sm sm:items-center sm:p-4"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="comparison-title"
    >
      <div
        ref={modalRef}
        className={`flex max-h-[calc(100vh-6rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border shadow-2xl sm:max-h-[90vh] ${
          darkMode ? 'border-white/10 bg-[#080808] text-stone-100' : 'border-black/10 bg-[#f8f5ef] text-zinc-950'
        }`}
      >
        <div className={`grid grid-cols-[1fr_auto] items-start gap-4 border-b p-5 md:grid-cols-[auto_1fr_auto] md:items-center ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
          <a
            href="https://aicnjoro.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-700 md:block"
            aria-label="Open the AIC Njoro Town website"
          >
            <img
              src={assetPaths.circleLogo}
              alt=""
              className={`size-14 rounded-2xl border object-contain p-1 shadow-sm ${
                darkMode ? 'border-red-400/30 bg-white' : 'border-red-900/15 bg-white'
              }`}
            />
          </a>
          <div className="min-w-0 md:text-center">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-900 dark:text-red-200">Chapter comparison</p>
            <h2 id="comparison-title" className="mt-2 text-2xl font-black sm:text-3xl">
              {comparison.book} {comparison.chapter}
            </h2>
            <div ref={pickerControlsRef} className="relative mt-2 flex flex-wrap items-center gap-2 md:justify-center">
              {canNavigateComparison ? (
                <ScriptureReferencePickerGroup
                  bookButtonAriaLabel="Comparison book"
                  bookGridClassName="grid max-h-72 grid-cols-2 gap-1 overflow-y-auto md:grid-cols-3"
                  bookMenuClassName="left-1/2 w-[min(84vw,34rem)] -translate-x-1/2"
                  books={books}
                  chapterButtonAriaLabel="Comparison chapter"
                  chapterMenuClassName="left-1/2 w-[min(80vw,20rem)] -translate-x-1/2 sm:w-80"
                  chapters={chapterOptions}
                  className="contents"
                  darkMode={darkMode}
                  disabled={comparisonNavigationLoading}
                  openMenu={openMenu === 'version' ? null : openMenu}
                  placement="bottom"
                  selectedBookId={activeBookId}
                  selectedChapterId={activeChapterId}
                  onBookChange={handleBookChange}
                  onChapterChange={handleChapterChange}
                  onOpenMenuChange={setOpenMenu}
                />
              ) : null}
              <div className="relative inline-block max-w-full">
              <button
                type="button"
                onClick={() => setOpenMenu(openMenu === 'version' ? null : 'version')}
                className={`inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-red-700 ${
                  darkMode
                    ? 'border-white/10 bg-white/10 text-stone-200 hover:bg-white/15'
                    : 'border-black/10 bg-white text-zinc-700 shadow-sm hover:bg-[#fffaf0]'
                }`}
                aria-expanded={openMenu === 'version'}
                aria-haspopup="menu"
              >
                <span className="truncate">{selectedCompareVersions.map(versionLabelFor).join(', ')}</span>
                {openMenu === 'version' ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
              {openMenu === 'version' ? (
                <div
                  className={`absolute left-0 z-20 mt-2 max-h-72 w-[min(20rem,calc(100vw-3rem))] overflow-y-auto rounded-2xl border p-2 text-left shadow-2xl md:left-1/2 md:-translate-x-1/2 ${
                    darkMode
                      ? 'border-white/10 bg-zinc-950 text-stone-100 shadow-black/40'
                      : 'border-black/10 bg-white text-zinc-950 shadow-zinc-900/15'
                  }`}
                  role="menu"
                >
                  <BibleVersionPickerList
                    darkMode={darkMode}
                    mode="multiple"
                    noteClassName="mt-3 border-t border-black/10 pt-3 dark:border-white/10"
                    optionClassName="min-h-11 rounded-xl px-3"
                    selectedVersionIds={selectedCompareVersions}
                    versions={versions}
                    onToggleVersion={toggleVersion}
                  />
                </div>
              ) : null}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
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
                            data-comparison-version={version}
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
