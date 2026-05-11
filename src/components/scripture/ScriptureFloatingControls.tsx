import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { BibleBook, BibleChapter, BibleVersion } from '../../types/scripture';
import BibleVersionPickerList from './BibleVersionPickerList';
import ScriptureReferencePickerGroup from './ScriptureReferencePickerGroup';

type ScriptureFloatingControlsProps = {
  books: BibleBook[];
  canGoNext: boolean;
  canGoPrevious: boolean;
  chapters: BibleChapter[];
  darkMode: boolean;
  selectedBookId: string;
  selectedChapterId: string;
  selectedVersionId: string;
  versions: BibleVersion[];
  onBookChange: (value: string) => void;
  onChapterChange: (value: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  onVersionChange: (value: string) => void;
};

type OpenMenu = 'version' | 'book' | 'chapter' | null;

const pillBase =
  'relative inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-bold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-red-700';

const menuBase =
  'absolute bottom-full mb-3 rounded-3xl border p-4 shadow-2xl';

const ScriptureFloatingControls = ({
  books,
  canGoNext,
  canGoPrevious,
  chapters,
  darkMode,
  selectedBookId,
  selectedChapterId,
  selectedVersionId,
  versions,
  onBookChange,
  onChapterChange,
  onNext,
  onPrevious,
  onVersionChange,
}: ScriptureFloatingControlsProps) => {
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const selectedVersion = versions.find((version) => version.id === selectedVersionId);
  const controlSurfaceClass = darkMode
    ? 'border-white/10 bg-zinc-950/10 text-stone-100 shadow-black/40 backdrop-blur-xl'
    : 'border-black/10 bg-white/10 text-zinc-950 shadow-zinc-900/15 backdrop-blur-xl';
  const menuSurfaceClass = darkMode
    ? 'border-white/10 bg-zinc-950 text-stone-100 shadow-black/40'
    : 'border-black/10 bg-white text-zinc-950 shadow-zinc-900/15';
  const neutralPillClass = darkMode
    ? 'border-white/15 bg-white/10 text-stone-100 backdrop-blur-xl hover:bg-white/15'
    : 'border-black/10 bg-[#fffaf0]/70 text-zinc-700 backdrop-blur-xl hover:bg-white/80';
  const closeMenu = () => setOpenMenu(null);

  useEffect(() => {
    if (!openMenu) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (controlsRef.current?.contains(event.target as Node)) return;
      closeMenu();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [openMenu]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40 px-4 md:left-44 md:right-0 md:px-6 lg:left-[23rem] xl:bottom-6 xl:right-96 2xl:right-[26rem]">
      <div
        ref={controlsRef}
        className={`pointer-events-auto mx-auto flex w-fit max-w-full items-center gap-2 rounded-[2rem] border p-2 shadow-2xl ${controlSurfaceClass}`}
      >
        <button
          type="button"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-red-800 text-white shadow-lg shadow-red-950/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-35"
          aria-label="Previous chapter"
        >
          <ChevronLeft size={22} />
        </button>

        <div className="flex min-w-0 flex-wrap items-center justify-center gap-2">
          <div className="relative hidden md:block">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === 'version' ? null : 'version')}
              className={`${pillBase} ${neutralPillClass} min-w-[4.75rem]`}
            >
              <span className="max-w-[6ch] truncate">{selectedVersion?.abbreviation || selectedVersion?.id || 'Bible'}</span>
              <ChevronDown size={15} className="shrink-0 text-red-800 dark:text-red-200" />
            </button>
            {openMenu === 'version' && (
              <div className={`${menuBase} ${menuSurfaceClass} left-0 w-80`}>
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">Version</p>
                <div className="grid max-h-72 gap-1.5 overflow-y-auto">
                  <BibleVersionPickerList
                    darkMode={darkMode}
                    mode="single"
                    noteClassName="mt-4 border-t border-black/10 pt-4 dark:border-white/10"
                    optionClassName="min-h-10 rounded-xl px-3 py-2"
                    selectedVersionIds={[selectedVersionId]}
                    versions={versions}
                    onToggleVersion={(versionId) => {
                      onVersionChange(versionId);
                      closeMenu();
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <ScriptureReferencePickerGroup
            bookMenuClassName="left-[calc(50%+2.875rem)] w-[min(84vw,34rem)] -translate-x-1/2 md:left-1/2 md:w-[min(90vw,34rem)]"
            books={books}
            chapterMenuClassName="left-[calc(50%-2.875rem)] w-[min(84vw,20rem)] -translate-x-1/2 sm:w-80 md:left-auto md:right-0 md:translate-x-0"
            chapters={chapters}
            darkMode={darkMode}
            selectedBookId={selectedBookId}
            selectedChapterId={selectedChapterId}
            onBookChange={onBookChange}
            onChapterChange={onChapterChange}
            onOpenMenuChange={setOpenMenu}
            openMenu={openMenu === 'version' ? null : openMenu}
          />
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-red-800 text-white shadow-lg shadow-red-950/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-35"
          aria-label="Next chapter"
        >
          <ChevronRight size={22} />
        </button>
      </div>
    </div>
  );
};

export default ScriptureFloatingControls;
