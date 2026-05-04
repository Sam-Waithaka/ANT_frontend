import { useEffect, useState } from 'react';
import {
  compareBibleChapter,
  getBibleChapters,
  getBibleGlossary,
  getBibleMarkers,
  getBibleNotes,
  getBibleResources,
  lookupBibleVerse,
} from '../../services/scriptureApi';
import type {
  BibleBook,
  BibleChapter,
  BibleComparisonChapter,
  BibleMarkerStatus,
  BibleNoteType,
  BibleResourceType,
  BibleToolRecord,
  BibleVersion,
  VerseLookupResult,
} from '../../types/scripture';

type ToolKey = 'verse' | 'compare' | 'resources' | 'glossary' | 'markers' | 'notes';

type BibleToolsPanelProps = {
  books: BibleBook[];
  darkMode: boolean;
  selectedBook?: BibleBook;
  selectedChapter?: BibleChapter;
  selectedVersion?: BibleVersion;
  versions: BibleVersion[];
};

const tools: Array<[ToolKey, string]> = [
  ['verse', 'Verse'],
  ['compare', 'Compare'],
  ['resources', 'Resources'],
  ['glossary', 'Glossary'],
  ['markers', 'Markers'],
  ['notes', 'Notes'],
];

const resourceTypes: BibleResourceType[] = ['preface', 'copyright', 'study_help', 'translation_review', 'glossary', 'front_matter', 'other'];
const markerStatuses: BibleMarkerStatus[] = ['omitted', 'empty_marker', 'source_unavailable'];
const noteTypes: BibleNoteType[] = ['footnote', 'cross_reference', 'textual_variant'];
const inputClass =
  'h-11 rounded-full border border-black/10 bg-white px-4 text-sm font-bold text-zinc-950 outline-none placeholder:text-zinc-500 focus:border-red-800 dark:border-white/15 dark:bg-white/10 dark:text-stone-100 dark:placeholder:text-stone-500';

const BibleToolsPanel = ({ books, darkMode, selectedBook, selectedChapter, selectedVersion, versions }: BibleToolsPanelProps) => {
  const [activeTool, setActiveTool] = useState<ToolKey>('compare');
  const [compareBookId, setCompareBookId] = useState('');
  const [compareChapterNumber, setCompareChapterNumber] = useState(1);
  const [compareChapters, setCompareChapters] = useState<BibleChapter[]>([]);
  const [compareVersionIds, setCompareVersionIds] = useState<string[]>([]);
  const [query, setQuery] = useState('love');
  const [verseNumber, setVerseNumber] = useState(16);
  const [resourceType, setResourceType] = useState<BibleResourceType | ''>('');
  const [markerStatus, setMarkerStatus] = useState<BibleMarkerStatus | ''>('');
  const [noteType, setNoteType] = useState<BibleNoteType | ''>('');
  const [records, setRecords] = useState<BibleToolRecord[]>([]);
  const [comparison, setComparison] = useState<BibleComparisonChapter | null>(null);
  const [verseResult, setVerseResult] = useState<VerseLookupResult | null>(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const versionId = selectedVersion?.id || versions[0]?.id || 'ASV';
  const bookId = selectedBook?.id || 'John';
  const chapterNumber = selectedChapter?.number || 3;
  const selectedCompareVersions = compareVersionIds.filter((id) => versions.some((version) => version.id === id));
  const compareBook = books.find((book) => book.id === compareBookId);

  useEffect(() => {
    if (versions.length === 0 || compareVersionIds.length > 0) {
      return;
    }

    const defaultVersions = [
      selectedVersion?.id,
      versions.find((version) => version.id !== selectedVersion?.id)?.id,
    ].filter(Boolean) as string[];

    setCompareVersionIds(defaultVersions.length >= 2 ? defaultVersions : versions.slice(0, 2).map((version) => version.id));
  }, [compareVersionIds.length, selectedVersion?.id, versions]);

  useEffect(() => {
    if (selectedBook?.id) {
      setCompareBookId(selectedBook.id);
    }
  }, [selectedBook?.id]);

  useEffect(() => {
    if (selectedChapter?.number) {
      setCompareChapterNumber(selectedChapter.number);
    }
  }, [selectedChapter?.number]);

  useEffect(() => {
    if (!versionId || !compareBookId) return;

    let cancelled = false;

    const loadCompareChapters = async () => {
      try {
        const nextChapters = await getBibleChapters(versionId, compareBookId);
        if (!cancelled) {
          setCompareChapters(nextChapters);
          setCompareChapterNumber((current) =>
            nextChapters.some((chapter) => chapter.number === current) ? current : nextChapters[0]?.number || 1,
          );
        }
      } catch {
        if (!cancelled) {
          setCompareChapters([]);
        }
      }
    };

    loadCompareChapters();

    return () => {
      cancelled = true;
    };
  }, [compareBookId, versionId]);

  const toggleCompareVersion = (versionIdToToggle: string) => {
    setCompareVersionIds((current) =>
      current.includes(versionIdToToggle)
        ? current.filter((id) => id !== versionIdToToggle)
        : [...current, versionIdToToggle],
    );
  };

  const runTool = async () => {
    setLoading(true);
    setStatus('');
    setRecords([]);
    setComparison(null);
    setVerseResult(null);

    try {
      if (activeTool === 'verse') {
        setVerseResult(await lookupBibleVerse(versionId, bookId, chapterNumber, verseNumber));
      }

      if (activeTool === 'compare') {
        if (selectedCompareVersions.length < 2) {
          setStatus('Choose at least two Bible versions to compare.');
          return;
        }

        setComparison(await compareBibleChapter(selectedCompareVersions, compareBookId || bookId, compareChapterNumber || chapterNumber));
      }

      if (activeTool === 'resources') {
        setRecords(await getBibleResources(versionId, resourceType || undefined));
      }

      if (activeTool === 'glossary') {
        setRecords(await getBibleGlossary(versionId, query));
      }

      if (activeTool === 'markers') {
        setRecords(await getBibleMarkers(versionId, markerStatus || undefined));
      }

      if (activeTool === 'notes') {
        setRecords(await getBibleNotes(versionId, noteType || undefined));
      }
    } catch {
      setStatus('Unable to load this Bible tool right now. Confirm the backend is running and the endpoint is available.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className={`rounded-[2rem] border p-4 shadow-sm ${
        darkMode ? 'border-white/10 bg-zinc-950 shadow-black/25' : 'border-black/10 bg-white shadow-zinc-900/10'
      }`}
    >
      <p className="text-xs font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">Bible tools</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {tools.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setActiveTool(key);
              setStatus('');
              setRecords([]);
              setComparison(null);
              setVerseResult(null);
            }}
            className={`rounded-full px-3 py-2 text-xs font-black transition ${
              activeTool === key
                ? 'bg-red-800 text-white'
                : darkMode
                  ? 'bg-white/10 text-stone-300 hover:bg-white/15'
                  : 'border border-black/10 bg-[#fffaf0] text-zinc-700 shadow-sm hover:bg-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3">
        {activeTool === 'glossary' && (
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Glossary term"
            className={inputClass}
          />
        )}

        {activeTool === 'verse' && (
          <input
            value={verseNumber}
            min={1}
            onChange={(event) => setVerseNumber(Number(event.target.value))}
            type="number"
            className={inputClass}
          />
        )}

        {activeTool === 'compare' && (
          <div className="grid gap-3">
            <div className="grid gap-2 sm:grid-cols-[1fr_7rem]">
              <select
                value={compareBookId}
                onChange={(event) => setCompareBookId(event.target.value)}
                className={inputClass}
                aria-label="Comparison book"
              >
                {books.map((book) => (
                  <option key={book.id} value={book.id}>{book.name}</option>
                ))}
              </select>
              <select
                value={compareChapterNumber}
                onChange={(event) => setCompareChapterNumber(Number(event.target.value))}
                className={inputClass}
                aria-label="Comparison chapter"
              >
                {compareChapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.number}>Chapter {chapter.number}</option>
                ))}
              </select>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">Versions</p>
              <div className={`max-h-40 overflow-y-auto rounded-2xl border p-2 ${darkMode ? 'border-white/10 bg-[#171717]' : 'border-black/10 bg-[#f8f5ef]'}`}>
                <div className="grid gap-1">
                  {versions.map((version) => {
                    const checked = selectedCompareVersions.includes(version.id);

                    return (
                      <label
                        key={version.id}
                        className={`flex min-h-10 cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-bold transition ${
                          checked
                            ? 'bg-red-800 text-white shadow-md shadow-red-950/20'
                            : darkMode
                              ? 'text-stone-300 hover:bg-white/10'
                              : 'text-zinc-700 hover:bg-white'
                        }`}
                      >
                        <input
                          checked={checked}
                          onChange={() => toggleCompareVersion(version.id)}
                          type="checkbox"
                          className="size-4 accent-red-800"
                        />
                        <span className="min-w-12 font-black">{version.abbreviation || version.id}</span>
                        <span className={`text-xs ${checked ? 'text-white/75' : darkMode ? 'text-stone-400' : 'text-zinc-500'}`}>{version.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <p className={`mt-2 text-xs leading-5 ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
                Comparing {compareBook?.name || selectedBook?.name || bookId} {compareChapterNumber || chapterNumber}.
              </p>
            </div>
          </div>
        )}

        {activeTool === 'resources' && (
          <select
            value={resourceType}
            onChange={(event) => setResourceType(event.target.value as BibleResourceType | '')}
            className={inputClass}
          >
            <option value="">All resource types</option>
            {resourceTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        )}

        {activeTool === 'markers' && (
          <select
            value={markerStatus}
            onChange={(event) => setMarkerStatus(event.target.value as BibleMarkerStatus | '')}
            className={inputClass}
          >
            <option value="">All marker statuses</option>
            {markerStatuses.map((statusOption) => <option key={statusOption} value={statusOption}>{statusOption}</option>)}
          </select>
        )}

        {activeTool === 'notes' && (
          <select
            value={noteType}
            onChange={(event) => setNoteType(event.target.value as BibleNoteType | '')}
            className={inputClass}
          >
            <option value="">All note types</option>
            {noteTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        )}

        <button
          type="button"
          onClick={runTool}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-red-800 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-red-700"
        >
          {loading ? 'Loading...' : activeTool === 'compare' ? 'Run comparison' : 'Run tool'}
        </button>
      </div>

      <div className={`mt-4 max-h-80 overflow-y-auto rounded-2xl border p-3 ${darkMode ? 'border-white/10 bg-[#171717]' : 'border-black/10 bg-[#fffaf0]'}`}>
        {status ? <p className="text-sm leading-6 text-red-800 dark:text-red-200">{status}</p> : null}
        {comparison && comparison.verses.length > 0 ? (
          <div className="grid gap-4">
            {comparison.verses.map((verse) => (
              <section key={verse.verseNumber} className={`rounded-2xl border p-3 ${darkMode ? 'border-white/10 bg-white/[0.045]' : 'border-black/10 bg-white'}`}>
                <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">
                  Verse {verse.verseNumber}
                </p>
                <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
                  {selectedCompareVersions.map((version) => {
                    const reading = verse.readings.find((item) => item.version === version);

                    return (
                      <article key={version} className={`rounded-2xl border p-3 ${darkMode ? 'border-white/10 bg-[#171717]' : 'border-black/10 bg-[#fffaf0]'}`}>
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-red-900 dark:text-red-200">{version}</p>
                        <p className={`mt-2 text-sm leading-6 ${darkMode ? 'text-stone-300' : 'text-zinc-700'}`}>
                          {reading?.text || 'This verse is not available in this version.'}
                        </p>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : null}
        {verseResult ? (
          <div>
            <p className="text-sm font-black">{verseResult.reference}</p>
            <p className={`mt-2 text-sm leading-6 ${darkMode ? 'text-stone-300' : 'text-zinc-600'}`}>
              {verseResult.isPresent ? verseResult.text : verseResult.display || 'This verse is omitted in this version.'}
            </p>
          </div>
        ) : null}
        {!status && !comparison && !verseResult && records.length === 0 ? (
          <p className={`text-sm leading-6 ${darkMode ? 'text-stone-400' : 'text-zinc-500'}`}>
            Run a tool to view API results here.
          </p>
        ) : null}
        <div className="grid gap-3">
          {records.map((record) => (
            <article key={record.id} className={`rounded-2xl border p-3 ${darkMode ? 'border-white/10 bg-white/[0.045]' : 'border-black/10 bg-white'}`}>
              <p className="text-sm font-black">{record.title}</p>
              {record.subtitle ? <p className="mt-1 text-xs font-bold text-red-800 dark:text-red-200">{record.subtitle}</p> : null}
              {record.body ? <p className={`mt-2 text-sm leading-6 ${darkMode ? 'text-stone-300' : 'text-zinc-600'}`}>{record.body}</p> : null}
              {record.meta ? <p className={`mt-2 text-xs ${darkMode ? 'text-stone-500' : 'text-zinc-500'}`}>{record.meta}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BibleToolsPanel;
