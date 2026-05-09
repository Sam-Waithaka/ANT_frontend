import type { BibleVerse, BibleVerseAnnotation } from '../../types/scripture';
import { buildVerseAnnotationView } from '../../utils/verseAnnotations';

type StudyAnnotationsSectionProps = {
  darkMode: boolean;
  verses: BibleVerse[];
};

const annotationTypeMeta = (annotation: BibleVerseAnnotation) => {
  switch (annotation.type) {
    case 'cross_reference':
      return {
        description: 'A related Scripture reference for comparing this thought with another passage.',
        label: 'Cross reference',
      };
    case 'textual_variant':
      return {
        description: 'A source or manuscript variation that may affect how this phrase is read.',
        label: 'Textual variant',
      };
    case 'word_study':
      return {
        description: 'A study note about the meaning, usage, or translation of a word or phrase.',
        label: 'Word study',
      };
    case 'translator_addition':
      return {
        description: 'A supplied word or phrase added by translators for readability.',
        label: 'Translator addition',
      };
    case 'section_heading':
      return {
        description: 'A heading supplied to help structure the passage.',
        label: 'Section heading',
      };
    case 'paragraph':
    case 'poetry':
    case 'speaker_label':
      return {
        description: 'A reader-formatting annotation that helps shape the passage presentation.',
        label: annotation.type.replaceAll('_', ' '),
      };
    case 'footnote':
      return {
        description: 'A reader note connected to this word, phrase, or verse.',
        label: 'Footnote',
      };
    default:
      return {
        description: 'A backend annotation attached to this verse.',
        label: annotation.type.replaceAll('_', ' '),
      };
  }
};

const StudyAnnotationsSection = ({ darkMode, verses }: StudyAnnotationsSectionProps) => {
  const annotatedVerses = verses
    .map((verse) => ({
      annotationView: buildVerseAnnotationView(verse.text, verse.annotations || [], { includeRawContent: true }),
      verse,
    }))
    .map(({ annotationView, verse }) => ({
      notes: [...annotationView.inlineNotes, ...annotationView.verseNumberNotes],
      verse,
    }))
    .filter(({ notes }) => notes.length > 0);

  if (annotatedVerses.length === 0) {
    return null;
  }

  return (
    <section className={`border-t pt-6 font-sans ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">Study Annotations</p>
      <div className="mt-4 grid gap-4">
        {annotatedVerses.flatMap(({ notes, verse }) =>
          notes.map((note) => (
            <article
              key={`${verse.id}-${note.id}`}
              className={`rounded-2xl border p-4 ${darkMode ? 'border-white/10 bg-white/[0.04]' : 'border-black/10 bg-white/70'}`}
            >
              <p className="text-xs font-black uppercase tracking-[0.14em] text-red-900 dark:text-red-200">
                Verse {verse.number} · Note {note.label}{note.offset !== undefined ? ` · Offset ${note.offset}` : ''}
              </p>
              <div className="mt-3 grid gap-3">
                {note.annotations.map((annotation) => {
                  const meta = annotationTypeMeta(annotation);

                  return (
                    <div key={annotation.id} className={`rounded-xl border p-3 ${darkMode ? 'border-white/10 bg-black/20' : 'border-black/10 bg-[#fffaf0]'}`}>
                      <p className={`text-sm font-black capitalize ${darkMode ? 'text-stone-100' : 'text-zinc-950'}`}>
                        {meta.label}
                      </p>
                      <p className={`mt-1 text-xs leading-5 ${darkMode ? 'text-stone-500' : 'text-zinc-500'}`}>
                        {meta.description}
                      </p>
                      <p className={`mt-3 text-sm leading-6 ${darkMode ? 'text-stone-300' : 'text-zinc-700'}`}>
                        {annotation.content}
                      </p>
                      {(annotation.anchorText || annotation.sourceMarker || annotation.rawContent) && (
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
                            <details className="mt-2">
                              <summary className="cursor-pointer font-black text-red-900 dark:text-red-200">Raw source</summary>
                              <pre className={`mt-2 overflow-x-auto whitespace-pre-wrap rounded-lg p-2 font-mono text-[11px] ${darkMode ? 'bg-black/35 text-stone-300' : 'bg-white text-zinc-700'}`}>
                                {annotation.rawContent}
                              </pre>
                            </details>
                          )}
                        </dl>
                      )}
                    </div>
                  );
                })}
              </div>
            </article>
          )),
        )}
      </div>
    </section>
  );
};

export default StudyAnnotationsSection;
