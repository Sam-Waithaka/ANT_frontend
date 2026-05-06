import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import type { BibleChapterNote, BibleVerse } from '../../types/scripture';

type ScriptureReadingContentProps = {
  activeVerseNumber?: number | null;
  darkMode: boolean;
  footer?: ReactNode;
  footnotes: BibleChapterNote[];
  licenseNote?: BibleChapterNote;
  onVerseSelect?: (verse: BibleVerse) => void;
  verses: BibleVerse[];
};

const ScriptureReadingContent = ({
  activeVerseNumber,
  darkMode,
  footer,
  footnotes,
  licenseNote,
  onVerseSelect,
  verses,
}: ScriptureReadingContentProps) => {
  const activeVerseRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!activeVerseNumber) {
      return;
    }

    activeVerseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeVerseNumber]);

  return (
  <div className="grid gap-6 pb-52 md:pb-36">
    {verses.map((verse) => {
      const isActive = activeVerseNumber === verse.number;

      return (
      <button
        key={verse.id}
        ref={isActive ? activeVerseRef : null}
        type="button"
        onClick={() => onVerseSelect?.(verse)}
        className={`grid grid-cols-[2rem_1fr] gap-4 rounded-2xl text-left font-serif text-[1.35rem] leading-9 transition focus:outline-none focus:ring-2 focus:ring-red-700 sm:text-[1.55rem] sm:leading-10 ${
          darkMode ? 'text-stone-100 hover:bg-white/[0.04]' : 'text-zinc-900 hover:bg-white/60'
        } ${isActive ? (darkMode ? 'bg-white/[0.05]' : 'bg-white/75') : ''}`}
        data-verse-number={verse.number}
      >
        <span className="pt-1 font-sans text-sm font-bold text-zinc-500 dark:text-stone-500">{verse.number}</span>
        <span>{verse.text}</span>
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
