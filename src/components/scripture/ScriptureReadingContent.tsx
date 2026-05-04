import type { ReactNode } from 'react';
import type { BibleChapterNote, BibleVerse } from '../../types/scripture';

type ScriptureReadingContentProps = {
  darkMode: boolean;
  footer?: ReactNode;
  footnotes: BibleChapterNote[];
  licenseNote?: BibleChapterNote;
  verses: BibleVerse[];
};

const ScriptureReadingContent = ({
  darkMode,
  footer,
  footnotes,
  licenseNote,
  verses,
}: ScriptureReadingContentProps) => (
  <div className="grid gap-5 pb-52 md:pb-36">
    {verses.map((verse) => (
      <p
        key={verse.id}
        className="grid grid-cols-[2rem_1fr] gap-4 font-serif text-xl leading-9 text-zinc-900 dark:text-stone-100 sm:text-2xl sm:leading-10"
      >
        <span className="pt-1 font-sans text-sm font-bold text-zinc-500 dark:text-stone-400">{verse.number}</span>
        <span>{verse.text}</span>
      </p>
    ))}
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

export default ScriptureReadingContent;
