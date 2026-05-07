import type { BibleBook, BibleChapter, BibleVersion } from '../../../types/scripture';
import ScriptureReferencePickerGroup from '../ScriptureReferencePickerGroup';
import type { ComparePicker } from './types';

type CompareToolProps = {
  books: BibleBook[];
  compareBook?: BibleBook;
  compareBookId: string;
  compareChapter?: BibleChapter;
  compareChapterNumber: number;
  compareChapters: BibleChapter[];
  darkMode: boolean;
  openComparePicker: ComparePicker;
  selectedBook?: BibleBook;
  selectedCompareVersions: string[];
  versions: BibleVersion[];
  onBookChange: (bookId: string) => void;
  onChapterNumberChange: (chapterNumber: number) => void;
  onOpenComparePickerChange: (picker: ComparePicker) => void;
  onToggleVersion: (versionId: string) => void;
};

const CompareTool = ({
  books,
  compareBook,
  compareBookId,
  compareChapter,
  compareChapterNumber,
  compareChapters,
  darkMode,
  openComparePicker,
  selectedBook,
  selectedCompareVersions,
  versions,
  onBookChange,
  onChapterNumberChange,
  onOpenComparePickerChange,
  onToggleVersion,
}: CompareToolProps) => (
  <div className="grid gap-3">
    <ScriptureReferencePickerGroup
      bookGridClassName="grid max-h-64 grid-cols-2 gap-1 overflow-y-auto"
      bookMenuClassName="left-0 w-[min(20rem,calc(100vw-3rem))]"
      books={books}
      chapterGridClassName="grid max-h-64 grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-4"
      chapterLabelStyle="number"
      chapterMenuClassName="right-0 w-[min(18rem,calc(100vw-3rem))]"
      chapters={compareChapters}
      className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_8rem]"
      darkMode={darkMode}
      fullWidth
      openMenu={openComparePicker}
      placement="bottom"
      selectedBookId={compareBookId}
      selectedChapterId={compareChapter?.id || ''}
      onBookChange={onBookChange}
      onChapterChange={(chapterId) => {
        const nextChapter = compareChapters.find((chapter) => chapter.id === chapterId);
        onChapterNumberChange(nextChapter?.number || 1);
      }}
      onOpenMenuChange={onOpenComparePickerChange}
    />

    <div>
      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">Versions</p>
      <div className={`max-h-32 overflow-y-auto overflow-x-hidden rounded-2xl border p-2 sm:max-h-40 ${darkMode ? 'border-white/10 bg-[#171717]' : 'border-black/10 bg-[#f8f5ef]'}`}>
        <div className="grid gap-1">
          {versions.map((version) => {
            const checked = selectedCompareVersions.includes(version.id);

            return (
              <label
                key={version.id}
                className={`flex min-h-10 min-w-0 cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-bold transition ${
                  checked
                    ? 'bg-red-800 text-white shadow-md shadow-red-950/20'
                    : darkMode
                      ? 'text-stone-300 hover:bg-white/10'
                      : 'text-zinc-700 hover:bg-white'
                }`}
              >
                <input
                  checked={checked}
                  onChange={() => onToggleVersion(version.id)}
                  type="checkbox"
                  className="size-4 accent-red-800"
                />
                <span className="min-w-12 shrink-0 font-black">{version.abbreviation || version.id}</span>
                <span className={`min-w-0 truncate text-xs ${checked ? 'text-white/75' : darkMode ? 'text-stone-400' : 'text-zinc-500'}`}>{version.name}</span>
              </label>
            );
          })}
        </div>
      </div>
      <p className={`mt-2 text-xs leading-5 ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
        Comparing {compareBook?.name || selectedBook?.name || compareBookId} {compareChapterNumber}.
      </p>
    </div>
  </div>
);

export default CompareTool;
