import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import type { BibleChapterNote, BibleVerse } from '../../types/scripture';

type ScriptureReadingContentProps = {
  darkMode: boolean;
  footer?: ReactNode;
  focusVerseNumber?: number | null;
  footnotes: BibleChapterNote[];
  licenseNote?: BibleChapterNote;
  onVerseSelect?: (verse: BibleVerse) => void;
  selectedVerseNumbers?: number[];
  verses: BibleVerse[];
};

const ScriptureReadingContent = ({
  darkMode,
  footer,
  focusVerseNumber,
  footnotes,
  licenseNote,
  onVerseSelect,
  selectedVerseNumbers = [],
  verses,
}: ScriptureReadingContentProps) => {
  const activeVerseRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!focusVerseNumber) {
      return;
    }

    activeVerseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [focusVerseNumber]);

  return (
    <div className="grid gap-6 pb-52 md:pb-36">
      {verses.map((verse) => {
        const isSelected = selectedVerseNumbers.includes(verse.number);

        return (
          <button
            key={verse.id}
            ref={verse.number === focusVerseNumber ? activeVerseRef : null}
            type="button"
            onClick={() => onVerseSelect?.(verse)}
            aria-pressed={isSelected}
            className="w-full appearance-none border-0 bg-transparent p-0 text-left focus:outline-none"
            data-verse-number={verse.number}
          >
            <span
              className={`grid grid-cols-[2rem_1fr] gap-4 font-serif text-[1.35rem] leading-9 transition sm:text-[1.55rem] sm:leading-10 ${
                darkMode ? 'text-stone-100' : 'text-zinc-900'
              }`}
            >
              <span
                className={`pt-1 font-sans text-sm font-bold transition ${
                  isSelected ? 'text-red-900 dark:text-red-200' : 'text-zinc-500 dark:text-stone-500'
                }`}
              >
                {verse.number}
              </span>
              <span
                className={`font-serif transition ${
                  isSelected
                    ? darkMode
                      ? 'border-l border-red-200/40 pl-3'
                      : 'border-l border-red-900/35 pl-3'
                    : ''
                }`}
              >
                {verse.text}
              </span>
            </span>
          </button>
        );
      })}
      {footnotes.length > 0 && (
        <section className={`mt-8 border-t pt-6 font-sans ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">Footnotes</p>
          <div className="mt-4 grid gap-3">
            {footnotes.map((note) => (
              <p key={note.id} className={`text-sm leading-6 ${darkMode ? 'text-stone-300' : 'text-zinc-600'}`}>
                <span className="font-black text-red-900 dark:text-red-200">{note.verseNumber}</span>
                <span className="ml-2">{note.text}</span>
              </p>
            ))}
          </div>
        </section>
      )}
      {licenseNote && (
        <section className={`border-t pt-6 font-sans ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">License Notes</p>
          <p className={`mt-4 whitespace-pre-line text-sm leading-6 ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
            {licenseNote.text}
          </p>
        </section>
      )}
      {footer}
    </div>
  );
};

export default ScriptureReadingContent;
