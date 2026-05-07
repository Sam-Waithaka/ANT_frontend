import type { BibleBook, BibleChapter } from '../../types/scripture';
import { ScriptureBookPicker, ScriptureChapterPicker } from './ScriptureReferencePickers';

export type ReferencePickerMenu = 'book' | 'chapter' | null;

type ScriptureReferencePickerGroupProps = {
  bookButtonAriaLabel?: string;
  bookGridClassName?: string;
  bookMenuClassName: string;
  books: BibleBook[];
  chapterButtonAriaLabel?: string;
  chapterGridClassName?: string;
  chapterLabelStyle?: 'number' | 'chapter';
  chapterMenuClassName: string;
  chapters: BibleChapter[];
  className?: string;
  darkMode: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  openMenu: ReferencePickerMenu;
  placement?: 'top' | 'bottom';
  selectedBookId: string;
  selectedChapterId: string;
  onBookChange: (bookId: string) => void;
  onChapterChange: (chapterId: string) => void;
  onOpenMenuChange: (menu: ReferencePickerMenu) => void;
};

const ScriptureReferencePickerGroup = ({
  bookButtonAriaLabel,
  bookGridClassName,
  bookMenuClassName,
  books,
  chapterButtonAriaLabel,
  chapterGridClassName,
  chapterLabelStyle,
  chapterMenuClassName,
  chapters,
  className = 'flex min-w-0 flex-wrap items-center justify-center gap-2',
  darkMode,
  disabled = false,
  fullWidth = false,
  openMenu,
  placement = 'top',
  selectedBookId,
  selectedChapterId,
  onBookChange,
  onChapterChange,
  onOpenMenuChange,
}: ScriptureReferencePickerGroupProps) => (
  <div className={className}>
    <ScriptureBookPicker
      books={books}
      buttonAriaLabel={bookButtonAriaLabel}
      darkMode={darkMode}
      disabled={disabled}
      fullWidth={fullWidth}
      gridClassName={bookGridClassName}
      menuClassName={bookMenuClassName}
      open={openMenu === 'book'}
      placement={placement}
      selectedBookId={selectedBookId}
      onBookChange={onBookChange}
      onOpenChange={(open) => onOpenMenuChange(open ? 'book' : null)}
    />

    <ScriptureChapterPicker
      buttonAriaLabel={chapterButtonAriaLabel}
      chapters={chapters}
      darkMode={darkMode}
      disabled={disabled}
      fullWidth={fullWidth}
      gridClassName={chapterGridClassName}
      labelStyle={chapterLabelStyle}
      menuClassName={chapterMenuClassName}
      open={openMenu === 'chapter'}
      placement={placement}
      selectedChapterId={selectedChapterId}
      onChapterChange={onChapterChange}
      onOpenChange={(open) => onOpenMenuChange(open ? 'chapter' : null)}
    />
  </div>
);

export default ScriptureReferencePickerGroup;
