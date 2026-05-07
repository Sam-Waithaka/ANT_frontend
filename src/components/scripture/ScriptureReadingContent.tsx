import type { ReactNode } from 'react';
import { Fragment, useEffect, useRef, useState } from 'react';
import type { BibleChapterNote, BibleCredit, BibleVerse } from '../../types/scripture';

type ScriptureReadingContentProps = {
  darkMode: boolean;
  footer?: ReactNode;
  focusVerseNumber?: number | null;
  footnotes: BibleChapterNote[];
  chapterCredit?: BibleCredit;
  licenseNote?: BibleChapterNote;
  onVerseSelect?: (verse: BibleVerse) => void;
  selectedVerseNumbers?: number[];
  verses: BibleVerse[];
};

type ActiveFootnote = {
  id: string;
  label: number;
  text: string;
  verseNumber: number;
};

const getMissingVerseNotice = (verse: BibleVerse) =>
  verse.markers?.find((marker) => marker.note)?.note ||
  verse.notes?.find((note) => note.text)?.text ||
  'Verse not present in this source.';

const getFootnoteInsertionOffset = (note: BibleChapterNote) => {
  const placement = note.placement?.toLowerCase();
  const preferredOffset = placement === 'before'
    ? note.startOffset
    : note.endOffset ?? note.startOffset;

  return preferredOffset ?? 0;
};

const getOffsetFootnotes = (verse: BibleVerse) =>
  (verse.notes || [])
    .filter(
      (note) =>
        note.type === 'footnote' &&
        (typeof note.startOffset === 'number' || typeof note.endOffset === 'number') &&
        Number.isFinite(note.startOffset ?? note.endOffset),
    )
    .sort((left, right) => getFootnoteInsertionOffset(left) - getFootnoteInsertionOffset(right));

const renderVerseText = (
  verse: BibleVerse,
  darkMode: boolean,
  activeFootnoteId: string,
  onFootnoteClick: (footnote: ActiveFootnote) => void,
) => {
  if (!verse.isPresent || !verse.text) {
    return (
      <span className={`font-sans text-base italic leading-7 ${darkMode ? 'text-stone-400' : 'text-zinc-500'}`}>
        {getMissingVerseNotice(verse)}
      </span>
    );
  }

  const offsetFootnotes = getOffsetFootnotes(verse);

  if (offsetFootnotes.length === 0) {
    return verse.text;
  }

  const content: ReactNode[] = [];
  let cursor = 0;

  offsetFootnotes.forEach((note, index) => {
    const offset = Math.max(0, Math.min(getFootnoteInsertionOffset(note), verse.text.length));
    const label = index + 1;

    if (offset > cursor) {
      content.push(
        <Fragment key={`${note.id}-text`}>
          {verse.text.slice(cursor, offset)}
        </Fragment>,
      );
    }

    content.push(
      <button
        key={note.id}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onFootnoteClick({
            id: note.id,
            label,
            text: note.text,
            verseNumber: verse.number,
          });
        }}
        className={`mx-0.5 inline-flex translate-y-[-0.45em] items-center rounded-full px-1 font-sans text-xs font-black leading-none transition focus:outline-none focus:ring-2 focus:ring-red-700 ${
          activeFootnoteId === note.id
            ? darkMode
              ? 'bg-red-200 text-red-950'
              : 'bg-red-900 text-white'
            : 'text-red-900 hover:bg-red-900/10 dark:text-red-200 dark:hover:bg-red-200/10'
        }`}
        aria-label={`Show footnote ${label} for verse ${verse.number}`}
        aria-pressed={activeFootnoteId === note.id}
      >
        {label}
      </button>,
    );
    cursor = offset;
  });

  if (cursor < verse.text.length) {
    content.push(
      <Fragment key="remaining-text">
        {verse.text.slice(cursor)}
      </Fragment>,
    );
  }

  return content;
};

const ScriptureReadingContent = ({
  darkMode,
  footer,
  focusVerseNumber,
  footnotes,
  chapterCredit,
  licenseNote,
  onVerseSelect,
  selectedVerseNumbers = [],
  verses,
}: ScriptureReadingContentProps) => {
  const [activeFootnote, setActiveFootnote] = useState<ActiveFootnote | null>(null);
  const activeVerseRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!focusVerseNumber) {
      return;
    }

    activeVerseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [focusVerseNumber]);

  useEffect(() => {
    if (!activeFootnote) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveFootnote(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFootnote]);

  const toggleFootnote = (footnote: ActiveFootnote) => {
    setActiveFootnote((current) => (current?.id === footnote.id ? null : footnote));
  };

  const selectVerse = (verse: BibleVerse) => {
    onVerseSelect?.(verse);
    setActiveFootnote(null);
  };

  return (
    <div className="grid gap-6 pb-52 md:pb-36">
      {verses.map((verse) => {
        const isSelected = selectedVerseNumbers.includes(verse.number);
        const isMissing = !verse.isPresent || !verse.text;

        return (
          <div
            key={verse.id}
            ref={verse.number === focusVerseNumber ? activeVerseRef : null}
            role="button"
            tabIndex={0}
            onClick={() => selectVerse(verse)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                selectVerse(verse);
              }
            }}
            aria-pressed={isSelected}
            className="w-full cursor-pointer appearance-none border-0 bg-transparent p-0 text-left focus:outline-none focus:ring-2 focus:ring-red-700"
            data-verse-number={verse.number}
          >
            <span
              className={`grid grid-cols-[2rem_1fr] gap-4 font-serif text-[1.35rem] leading-9 transition sm:text-[1.55rem] sm:leading-10 ${
                isMissing
                  ? darkMode
                    ? 'text-stone-400'
                    : 'text-zinc-500'
                  : darkMode
                    ? 'text-stone-100'
                    : 'text-zinc-900'
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
                className={`${isMissing ? 'font-sans' : 'font-serif'} transition ${
                  isSelected
                    ? darkMode
                      ? 'border-l border-red-200/40 pl-3'
                      : 'border-l border-red-900/35 pl-3'
                    : ''
                }`}
              >
                {renderVerseText(verse, darkMode, activeFootnote?.id || '', toggleFootnote)}
              </span>
            </span>
          </div>
        );
      })}
      {activeFootnote && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-30 cursor-default bg-transparent"
            onClick={() => setActiveFootnote(null)}
            aria-label="Close footnote"
          />
          <div
            className={`fixed inset-x-4 bottom-4 z-40 rounded-3xl border p-5 font-sans shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:bottom-8 sm:left-1/2 sm:w-[min(28rem,calc(100vw-3rem))] sm:-translate-x-1/2 ${
              darkMode
                ? 'border-white/10 bg-zinc-950/95 text-stone-100'
                : 'border-black/10 bg-white/95 text-zinc-950'
            }`}
            role="dialog"
            aria-label={`Footnote ${activeFootnote.label} for verse ${activeFootnote.verseNumber}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">
                  Verse {activeFootnote.verseNumber} Footnote {activeFootnote.label}
                </p>
                <p className={`mt-3 text-sm leading-6 ${darkMode ? 'text-stone-200' : 'text-zinc-700'}`}>
                  {activeFootnote.text}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveFootnote(null)}
                className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full border text-lg font-black transition focus:outline-none focus:ring-2 focus:ring-red-700 ${
                  darkMode ? 'border-white/10 bg-white/10 hover:bg-white/15' : 'border-black/10 bg-zinc-50 hover:bg-zinc-100'
                }`}
                aria-label="Close footnote"
              >
                x
              </button>
            </div>
          </div>
        </>
      )}
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
      {chapterCredit && (
        <section className={`border-t pt-6 font-sans ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">
            Source & License
          </p>
          <div className={`mt-4 grid gap-2 text-sm leading-6 ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
            {chapterCredit.source && (
              <p>
                <span className="font-bold text-zinc-900 dark:text-stone-200">Source:</span>{' '}
                {chapterCredit.sourceUrl ? (
                  <a
                    href={chapterCredit.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-red-900 underline decoration-red-900/30 underline-offset-4 transition hover:text-red-700 dark:text-red-200 dark:decoration-red-200/30"
                  >
                    {chapterCredit.source}
                  </a>
                ) : (
                  chapterCredit.source
                )}
              </p>
            )}
            {chapterCredit.licenseType && (
              <p>
                <span className="font-bold text-zinc-900 dark:text-stone-200">License:</span>{' '}
                {chapterCredit.licenseType}
              </p>
            )}
            {chapterCredit.licenseNotes && (
              <p className="whitespace-pre-line">{chapterCredit.licenseNotes}</p>
            )}
          </div>
        </section>
      )}
      {footer}
    </div>
  );
};

export default ScriptureReadingContent;
