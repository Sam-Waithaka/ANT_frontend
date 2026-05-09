import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import type { BibleChapterCredit, BibleChapterNote, BibleVerse } from '../../types/scripture';
import { buildVerseAnnotationView } from '../../utils/verseAnnotations';

type ScriptureReadingContentProps = {
  chapterCredit?: BibleChapterCredit;
  darkMode: boolean;
  footer?: ReactNode;
  focusVerseNumber?: number | null;
  footnotes: BibleChapterNote[];
  licenseNote?: BibleChapterNote;
  onVerseSelect?: (verse: BibleVerse) => void;
  selectedVerseNumbers?: number[];
  studyMode?: boolean;
  verses: BibleVerse[];
};

const getUnavailableVerseNotice = (verse: BibleVerse) =>
  // Omitted verses can still carry backend-authored notes; surface those instead of inventing text.
  verse.markers?.map((marker) => marker.note).find(Boolean) ||
  verse.footnotes?.[0]?.text ||
  verse.notes?.find((note) => note.type === 'footnote')?.text ||
  'This verse is not present in this source.';

const ScriptureReadingContent = ({
  chapterCredit,
  darkMode,
  footer,
  focusVerseNumber,
  footnotes,
  licenseNote,
  onVerseSelect,
  selectedVerseNumbers = [],
  studyMode = false,
  verses,
}: ScriptureReadingContentProps) => {
  const activeVerseRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!focusVerseNumber) {
      return;
    }

    activeVerseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [focusVerseNumber]);

  const renderVerseText = (verse: BibleVerse) => {
    const annotationView = buildVerseAnnotationView(verse.text, verse.annotations || []);

    return annotationView.segments.map((segment, index) => (
      <span key={`${verse.id}-segment-${index}`}>
        {segment.text}
        {segment.markerLabels?.map((label) => (
          <sup
            key={label}
            aria-hidden="true"
            data-footnote-marker={`${verse.number}-${label}`}
            title={`Footnote ${label} for verse ${verse.number}`}
            className="ml-0.5 align-super font-sans text-[0.58em] font-black leading-none text-red-900 dark:text-red-200"
          >
            {label}
          </sup>
        ))}
      </span>
    ));
  };

  return (
    <div className="grid gap-6 pb-52 md:pb-36">
      {verses.map((verse) => {
        const isSelected = selectedVerseNumbers.includes(verse.number);
        const isUnavailable = verse.isPresent === false;

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
                {isUnavailable ? (
                  <span
                    className={`block rounded-2xl border px-4 py-3 font-sans text-sm italic leading-6 ${
                      darkMode
                        ? 'border-white/10 bg-white/[0.04] text-stone-400'
                        : 'border-black/10 bg-white/60 text-zinc-600'
                    }`}
                  >
                    {getUnavailableVerseNotice(verse)}
                  </span>
                ) : (
                  renderVerseText(verse)
                )}
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
      {studyMode && verses.some((verse) => (verse.annotations || []).length > 0) && (
        <section className={`border-t pt-6 font-sans ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">Study Annotations</p>
          <div className="mt-4 grid gap-4">
            {verses.flatMap((verse) => {
              const annotationView = buildVerseAnnotationView(verse.text, verse.annotations || [], { includeRawContent: true });
              const notes = [...annotationView.inlineNotes, ...annotationView.verseNumberNotes];

              return notes.map((note) => (
                <article
                  key={`${verse.id}-${note.id}`}
                  className={`rounded-2xl border p-4 ${darkMode ? 'border-white/10 bg-white/[0.04]' : 'border-black/10 bg-white/70'}`}
                >
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-red-900 dark:text-red-200">
                    Verse {verse.number} · Note {note.label}{note.offset !== undefined ? ` · Offset ${note.offset}` : ''}
                  </p>
                  <div className="mt-3 grid gap-3">
                    {note.annotations.map((annotation) => (
                      <div key={annotation.id} className={`rounded-xl border p-3 ${darkMode ? 'border-white/10 bg-black/20' : 'border-black/10 bg-[#fffaf0]'}`}>
                        <p className={`text-sm font-black ${darkMode ? 'text-stone-100' : 'text-zinc-950'}`}>
                          {annotation.type.replaceAll('_', ' ')}
                        </p>
                        <p className={`mt-1 text-sm leading-6 ${darkMode ? 'text-stone-300' : 'text-zinc-700'}`}>
                          {annotation.content}
                        </p>
                        <dl className={`mt-3 grid gap-1 text-xs leading-5 ${darkMode ? 'text-stone-500' : 'text-zinc-500'}`}>
                          {annotation.anchorText && (
                            <div>
                              <dt className="inline font-black">Anchor: </dt>
                              <dd className="inline">{annotation.anchorText}</dd>
                            </div>
                          )}
                          {annotation.sourceMarker && (
                            <div>
                              <dt className="inline font-black">Source marker: </dt>
                              <dd className="inline">{annotation.sourceMarker}</dd>
                            </div>
                          )}
                          {annotation.rawContent && (
                            <div>
                              <dt className="font-black">Raw text</dt>
                              <dd className={`mt-1 overflow-x-auto rounded-lg p-2 font-mono text-[11px] ${darkMode ? 'bg-black/35 text-stone-300' : 'bg-white text-zinc-700'}`}>
                                {annotation.rawContent}
                              </dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    ))}
                  </div>
                </article>
              ));
            })}
          </div>
        </section>
      )}
      {licenseNote && !chapterCredit && (
        <section className={`border-t pt-6 font-sans ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">License Notes</p>
          <p className={`mt-4 whitespace-pre-line text-sm leading-6 ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
            {licenseNote.text}
          </p>
        </section>
      )}
      {chapterCredit && (
        <section className={`border-t pt-6 font-sans ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">Source & License</p>
          <div className={`mt-4 grid gap-2 text-sm leading-6 ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
            {chapterCredit.source && (
              <p>
                <span className="font-bold">Source: </span>
                {chapterCredit.sourceUrl ? (
                  <a className="underline decoration-red-900/40 underline-offset-4 dark:decoration-red-200/50" href={chapterCredit.sourceUrl}>
                    {chapterCredit.source}
                  </a>
                ) : (
                  chapterCredit.source
                )}
              </p>
            )}
            {chapterCredit.licenseType && (
              <p>
                <span className="font-bold">License: </span>
                {chapterCredit.licenseUrl ? (
                  <a className="underline decoration-red-900/40 underline-offset-4 dark:decoration-red-200/50" href={chapterCredit.licenseUrl}>
                    {chapterCredit.licenseType}
                  </a>
                ) : (
                  chapterCredit.licenseType
                )}
              </p>
            )}
            {chapterCredit.licenseNotes && <p className="whitespace-pre-line">{chapterCredit.licenseNotes}</p>}
          </div>
        </section>
      )}
      {footer}
    </div>
  );
};

export default ScriptureReadingContent;
