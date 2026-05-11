import type { BibleBook, BibleChapter, BibleVersion } from '../../../types/scripture';
import BibleVersionPickerList from '../BibleVersionPickerList';
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
        <BibleVersionPickerList
          darkMode={darkMode}
          mode="multiple"
          noteClassName="mt-2"
          optionClassName="min-h-10 rounded-xl px-3"
          selectedVersionIds={selectedCompareVersions}
          versions={versions}
          onToggleVersion={onToggleVersion}
        />
      </div>
      <p className={`mt-2 text-xs leading-5 ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
        Comparing {compareBook?.name || selectedBook?.name || compareBookId} {compareChapterNumber}.
      </p>
    </div>
  </div>
);

export default CompareTool;
