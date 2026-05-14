import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { BookOpen, ExternalLink } from 'lucide-react';
import { getBibleVersesByReference } from '../../../services/scriptureApi';
import type { BibleVerse } from '../../../types/scripture';
import type { ParsedScriptureReference } from './mediaWatchUtils';
import { createScriptureUrl } from './mediaWatchUtils';

type ScriptureReferenceCardProps = {
  darkMode: boolean;
  reference: ParsedScriptureReference;
};

const DEFAULT_PREVIEW_VERSION = 'BSB';

const pickPreviewVerses = (verses: BibleVerse[], reference: ParsedScriptureReference) => {
  const presentVerses = verses.filter((verse) => verse.number > 0 && verse.isPresent !== false && verse.text.trim());
  const startVerse = reference.startVerse;
  const endVerse = reference.endVerse;

  if (presentVerses.length === 0) {
    return [];
  }

  const firstCandidate = startVerse
    ? presentVerses.find((verse) => verse.number >= startVerse)
    : presentVerses[0];
  const startIndex = firstCandidate ? presentVerses.findIndex((verse) => verse.number === firstCandidate.number) : 0;
  const rangeLimited = endVerse
    ? presentVerses.slice(startIndex).filter((verse) => verse.number <= endVerse)
    : presentVerses.slice(startIndex);
  const preview = rangeLimited.slice(0, 3);

  return preview.length > 0 ? preview : presentVerses.slice(0, 3);
};

const ScriptureReferenceCard = ({ darkMode, reference }: ScriptureReferenceCardProps) => {
  const location = useLocation();
  const [chapterVerses, setChapterVerses] = useState<BibleVerse[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [previewVerses, setPreviewVerses] = useState<BibleVerse[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'empty'>('loading');
  const returnTo = `${location.pathname}${location.search}`;
  const scriptureUrl = useMemo(() => createScriptureUrl(reference, returnTo), [reference, returnTo]);
  const visibleVerses = expanded ? chapterVerses : previewVerses;

  useEffect(() => {
    let active = true;

    setStatus('loading');
    setChapterVerses([]);
    setExpanded(false);
    setPreviewVerses([]);

    getBibleVersesByReference(DEFAULT_PREVIEW_VERSION, reference.book, reference.chapter)
      .then((verses) => {
        if (!active) return;

        const presentVerses = verses.filter((verse) => verse.number > 0 && verse.isPresent !== false && verse.text.trim());
        const nextPreview = pickPreviewVerses(presentVerses, reference);
        setChapterVerses(presentVerses);
        setPreviewVerses(nextPreview);
        setStatus(nextPreview.length > 0 ? 'ready' : 'empty');
      })
      .catch(() => {
        if (active) {
          setStatus('empty');
        }
      });

    return () => {
      active = false;
    };
  }, [reference]);

  return (
    <article
      className={`rounded-2xl border p-5 shadow-lg ${
        darkMode ? 'border-white/10 bg-zinc-950 shadow-black/25' : 'border-black/10 bg-white shadow-zinc-900/10'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`grid size-11 shrink-0 place-items-center rounded-full ${darkMode ? 'bg-red-950/50 text-red-100' : 'bg-red-50 text-red-800'}`}>
          <BookOpen size={19} />
        </div>
        <div className="min-w-0">
          <h3 className={`text-lg font-black ${darkMode ? 'text-white' : 'text-zinc-950'}`}>{reference.display}</h3>
          {status === 'loading' && (
            <p className={`mt-2 text-sm leading-6 ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
              Loading scripture preview...
            </p>
          )}
          {status === 'empty' && (
            <p className={`mt-2 text-sm leading-6 ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
              Open the full chapter in Scripture and keep the passage close to the message.
            </p>
          )}
        </div>
      </div>

      {visibleVerses.length > 0 && (
        <div className={`mt-5 rounded-2xl border p-4 ${
          darkMode ? 'border-white/10 bg-white/[0.04]' : 'border-black/10 bg-[#fffaf0]'
        }`}>
          <div className={`grid gap-3 pr-1 ${expanded ? 'max-h-96 overflow-y-auto' : ''}`}>
            {visibleVerses.map((verse) => (
              <p key={verse.id} className={`text-sm leading-7 ${darkMode ? 'text-stone-200' : 'text-zinc-800'}`}>
                <span className={`mr-2 font-black ${darkMode ? 'text-red-200' : 'text-red-800'}`}>{verse.number}</span>
                {verse.text}
              </p>
            ))}
          </div>
          {chapterVerses.length > previewVerses.length && (
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              className={`mt-4 inline-flex min-h-10 items-center rounded-full border px-4 text-xs font-black transition hover:-translate-y-0.5 ${
                darkMode ? 'border-white/10 bg-white/5 text-stone-100 hover:bg-white/10' : 'border-black/10 bg-white text-zinc-800 hover:bg-white'
              }`}
            >
              {expanded ? 'Show preview' : 'Show full chapter'}
            </button>
          )}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={scriptureUrl}
          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 text-sm font-black transition hover:-translate-y-0.5 ${
            darkMode ? 'border-white/10 bg-white/5 text-stone-100 hover:bg-white/10' : 'border-black/10 bg-white text-zinc-800 hover:bg-[#fffaf0]'
          }`}
        >
          Open in Scripture
          <ExternalLink size={15} />
        </a>
      </div>
    </article>
  );
};

export default ScriptureReferenceCard;
