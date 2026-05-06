import { useEffect, useState } from 'react';
import {
  compareBibleChapter,
  getBibleChapters,
  getBibleGlossary,
  getBibleMarkers,
  getBibleNotes,
  getBibleResources,
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
} from '../../types/scripture';
import { ScriptureBookPicker, ScriptureChapterPicker } from './ScriptureReferencePickers';

type ToolKey = 'compare' | 'resources' | 'glossary' | 'markers' | 'notes';
type ComparePicker = 'book' | 'chapter' | null;

type BibleToolsPanelProps = {
  books: BibleBook[];
  darkMode: boolean;
  selectedBook?: BibleBook;
  selectedChapter?: BibleChapter;
  selectedVersion?: BibleVersion;
  versions: BibleVersion[];
};

const tools: Array<[ToolKey, string]> = [
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
  'h-11 min-w-0 w-full rounded-full border border-black/10 bg-white px-4 text-sm font-bold text-zinc-950 outline-none placeholder:text-zinc-500 focus:border-red-800 dark:border-white/15 dark:bg-white/10 dark:text-stone-100 dark:placeholder:text-stone-500';
const formatToolLabel = (value: string) =>
  value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const BibleToolsPanel = ({ books, darkMode, selectedBook, selectedChapter, selectedVersion, versions }: BibleToolsPanelProps) => {
  const [activeTool, setActiveTool] = useState<ToolKey>('compare');
  const [compareBookId, setCompareBookId] = useState('');
  const [compareChapterNumber, setCompareChapterNumber] = useState(1);
  const [compareChapters, setCompareChapters] = useState<BibleChapter[]>([]);
  const [openComparePicker, setOpenComparePicker] = useState<ComparePicker>(null);
  const [compareVersionIds, setCompareVersionIds] = useState<string[]>([]);
  const [query, setQuery] = useState('love');
  const [resourceType, setResourceType] = useState<BibleResourceType | ''>('');
  const [markerStatus, setMarkerStatus] = useState<BibleMarkerStatus | ''>('');
  const [noteType, setNoteType] = useState<BibleNoteType | ''>('');
  const [records, setRecords] = useState<BibleToolRecord[]>([]);
  const [comparison, setComparison] = useState<BibleComparisonChapter | null>(null);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const versionId = selectedVersion?.id || versions[0]?.id || 'ASV';
  const bookId = selectedBook?.id || 'John';
  const chapterNumber = selectedChapter?.number || 3;
  const selectedCompareVersions = compareVersionIds.filter((id) => versions.some((version) => version.id === id));
  const compareBook = books.find((book) => book.id === compareBookId);
  const compareChapter = compareChapters.find((chapter) => chapter.number === compareChapterNumber);
  const comparisonHasVerses = Boolean(comparison?.verses.length);
  const getVersionLabel = (versionIdToFind: string) =>
    versions.find((version) => version.id.toLowerCase() === versionIdToFind.toLowerCase())?.abbreviation || versionIdToFind;

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

  useEffect(() => {
    if (!comparisonOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setComparisonOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [comparisonOpen]);

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

    try {
      if (activeTool === 'compare') {
        if (selectedCompareVersions.length < 2) {
          setStatus('Choose at least two Bible versions to compare.');
          return;
        }

        const nextComparison = await compareBibleChapter(
          selectedCompareVersions,
          compareBookId || bookId,
          compareChapterNumber || chapterNumber,
        );
        setComparison(nextComparison);

        if (nextComparison.verses.length > 0) {
          setComparisonOpen(true);
        } else {
          setStatus('No comparison text was returned for this chapter. Try another version pair or confirm the compare endpoint response shape.');
        }
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
    <>
      <section
        className={`rounded-[2rem] border p-4 shadow-sm ${
          darkMode ? 'border-white/10 bg-zinc-950 shadow-black/25' : 'border-black/10 bg-white shadow-zinc-900/10'
        } min-w-0`}
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
              setComparisonOpen(false);
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

        {activeTool === 'compare' && (
          <div className="grid gap-3">
            <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_8rem]">
              <ScriptureBookPicker
                books={books}
                darkMode={darkMode}
                fullWidth
                gridClassName="grid max-h-64 grid-cols-2 gap-1 overflow-y-auto"
                menuClassName="left-0 w-[min(20rem,calc(100vw-3rem))]"
                open={openComparePicker === 'book'}
                placement="bottom"
                selectedBookId={compareBookId}
                onBookChange={setCompareBookId}
                onOpenChange={(open) => setOpenComparePicker(open ? 'book' : null)}
              />
              <ScriptureChapterPicker
                chapters={compareChapters}
                darkMode={darkMode}
                fullWidth
                gridClassName="grid max-h-64 grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-4"
                labelStyle="number"
                menuClassName="right-0 w-[min(18rem,calc(100vw-3rem))]"
                open={openComparePicker === 'chapter'}
                placement="bottom"
                selectedChapterId={compareChapter?.id || ''}
                onChapterChange={(chapterId) => {
                  const nextChapter = compareChapters.find((chapter) => chapter.id === chapterId);
                  setCompareChapterNumber(nextChapter?.number || 1);
                }}
                onOpenChange={(open) => setOpenComparePicker(open ? 'chapter' : null)}
              />
            </div>

            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">Versions</p>
              <div className={`max-h-40 overflow-y-auto overflow-x-hidden rounded-2xl border p-2 ${darkMode ? 'border-white/10 bg-[#171717]' : 'border-black/10 bg-[#f8f5ef]'}`}>
                <div className="grid gap-1">
                  {versions.map((version) => {
                    const checked = selectedCompareVersions.includes(version.id);

                    return (
                      <label
                        key={version.id}
                        className={`flex min-h-10 min-w-0 cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-bold transition ${
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
                        <span className="min-w-12 shrink-0 font-black">{version.abbreviation || version.id}</span>
                        <span className={`min-w-0 truncate text-xs ${checked ? 'text-white/75' : darkMode ? 'text-stone-400' : 'text-zinc-500'}`}>{version.name}</span>
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
          <div className="grid gap-3">
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">Resource type</p>
                <p className={`text-[11px] font-bold ${darkMode ? 'text-stone-500' : 'text-zinc-500'}`}>
                  {selectedVersion?.abbreviation || versionId}
                </p>
              </div>
              <div className={`rounded-[1.35rem] border p-2 ${darkMode ? 'border-white/10 bg-[#171717]' : 'border-black/10 bg-[#f8f5ef]'}`}>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setResourceType('')}
                    className={`min-h-10 rounded-full px-3 text-xs font-black transition ${
                      resourceType === ''
                        ? 'bg-red-800 text-white shadow-md shadow-red-950/20'
                        : darkMode
                          ? 'bg-white/10 text-stone-300 hover:bg-white/15'
                          : 'bg-white text-zinc-700 shadow-sm hover:bg-[#ece7de]'
                    }`}
                  >
                    All Types
                  </button>
                  {resourceTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setResourceType(type)}
                      className={`min-h-10 rounded-full px-3 text-xs font-black transition ${
                        resourceType === type
                          ? 'bg-red-800 text-white shadow-md shadow-red-950/20'
                          : darkMode
                            ? 'bg-white/10 text-stone-300 hover:bg-white/15'
                            : 'bg-white text-zinc-700 shadow-sm hover:bg-[#ece7de]'
                      }`}
                    >
                      {formatToolLabel(type)}
                    </button>
                  ))}
                </div>
              </div>
              <p className={`mt-2 text-xs leading-5 ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
                Load translation notes, copyright, prefaces, and study resources for the selected Bible version.
              </p>
            </div>
          </div>
        )}

        {activeTool === 'markers' && (
          <div className="grid gap-3">
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">Marker status</p>
                <p className={`text-[11px] font-bold ${darkMode ? 'text-stone-500' : 'text-zinc-500'}`}>
                  {selectedVersion?.abbreviation || versionId}
                </p>
              </div>
              <div className={`rounded-[1.35rem] border p-2 ${darkMode ? 'border-white/10 bg-[#171717]' : 'border-black/10 bg-[#f8f5ef]'}`}>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setMarkerStatus('')}
                    className={`min-h-10 rounded-full px-3 text-xs font-black transition ${
                      markerStatus === ''
                        ? 'bg-red-800 text-white shadow-md shadow-red-950/20'
                        : darkMode
                          ? 'bg-white/10 text-stone-300 hover:bg-white/15'
                          : 'bg-white text-zinc-700 shadow-sm hover:bg-[#ece7de]'
                    }`}
                  >
                    All Statuses
                  </button>
                  {markerStatuses.map((statusOption) => (
                    <button
                      key={statusOption}
                      type="button"
                      onClick={() => setMarkerStatus(statusOption)}
                      className={`min-h-10 rounded-full px-3 text-xs font-black transition ${
                        markerStatus === statusOption
                          ? 'bg-red-800 text-white shadow-md shadow-red-950/20'
                          : darkMode
                            ? 'bg-white/10 text-stone-300 hover:bg-white/15'
                            : 'bg-white text-zinc-700 shadow-sm hover:bg-[#ece7de]'
                      }`}
                    >
                      {formatToolLabel(statusOption)}
                    </button>
                  ))}
                </div>
              </div>
              <p className={`mt-2 text-xs leading-5 ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
                Review omitted verses, empty markers, and source availability notes for this version.
              </p>
            </div>
          </div>
        )}

        {activeTool === 'notes' && (
          <div className="grid gap-3">
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">Note type</p>
                <p className={`text-[11px] font-bold ${darkMode ? 'text-stone-500' : 'text-zinc-500'}`}>
                  {selectedVersion?.abbreviation || versionId}
                </p>
              </div>
              <div className={`rounded-[1.35rem] border p-2 ${darkMode ? 'border-white/10 bg-[#171717]' : 'border-black/10 bg-[#f8f5ef]'}`}>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setNoteType('')}
                    className={`min-h-10 rounded-full px-3 text-xs font-black transition ${
                      noteType === ''
                        ? 'bg-red-800 text-white shadow-md shadow-red-950/20'
                        : darkMode
                          ? 'bg-white/10 text-stone-300 hover:bg-white/15'
                          : 'bg-white text-zinc-700 shadow-sm hover:bg-[#ece7de]'
                    }`}
                  >
                    All Types
                  </button>
                  {noteTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNoteType(type)}
                      className={`min-h-10 rounded-full px-3 text-xs font-black transition ${
                        noteType === type
                          ? 'bg-red-800 text-white shadow-md shadow-red-950/20'
                          : darkMode
                            ? 'bg-white/10 text-stone-300 hover:bg-white/15'
                            : 'bg-white text-zinc-700 shadow-sm hover:bg-[#ece7de]'
                      }`}
                    >
                      {formatToolLabel(type)}
                    </button>
                  ))}
                </div>
              </div>
              <p className={`mt-2 text-xs leading-5 ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
                Browse footnotes, cross references, and textual variant notes for the selected Bible version.
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={runTool}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-red-800 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-red-700"
        >
          {loading
            ? 'Loading...'
            : activeTool === 'compare'
              ? 'Run comparison'
              : activeTool === 'resources'
                ? 'Load resources'
                : activeTool === 'markers'
                  ? 'Load markers'
                  : activeTool === 'notes'
                    ? 'Load notes'
                    : 'Run tool'}
        </button>
      </div>

      <div className={`mt-4 max-h-80 overflow-y-auto rounded-2xl p-3 ${darkMode ? 'bg-[#171717]' : 'bg-transparent'}`}>
        {status ? <p className="text-sm leading-6 text-red-800 dark:text-red-200">{status}</p> : null}
        {comparisonHasVerses ? (
          <div className={`rounded-2xl border p-3 ${darkMode ? 'border-white/10 bg-white/[0.045]' : 'border-black/10 bg-white'}`}>
            <p className="text-sm font-black">
              {comparison?.book} {comparison?.chapter}
            </p>
            <p className={`mt-1 text-xs leading-5 ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
              {comparison?.verses.length} verses compared across {selectedCompareVersions.length} versions.
            </p>
            <button
              type="button"
              onClick={() => setComparisonOpen(true)}
              className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-full bg-red-800 px-4 text-sm font-bold text-white transition hover:bg-red-700"
            >
              View comparison
            </button>
          </div>
        ) : null}
        {!status && !comparison && records.length === 0 ? (
          <p className={`px-1 text-sm leading-6 ${darkMode ? 'text-stone-500' : 'text-zinc-400'}`}>
            Run a tool to view API results here.
          </p>
        ) : null}
        <div className="grid gap-3">
          {records.map((record) => (
            <article key={record.id} className={`rounded-2xl border p-3 ${darkMode ? 'border-white/10 bg-white/[0.045]' : 'border-black/10 bg-white'}`}>
              <p className="text-sm font-black">{record.title}</p>
              {record.subtitle ? <p className="mt-1 text-xs font-bold text-red-800 dark:text-red-200">{formatToolLabel(record.subtitle)}</p> : null}
              {record.body ? <p className={`mt-2 text-sm leading-6 ${darkMode ? 'text-stone-300' : 'text-zinc-600'}`}>{record.body}</p> : null}
              {record.meta ? <p className={`mt-2 text-xs ${darkMode ? 'text-stone-500' : 'text-zinc-500'}`}>{formatToolLabel(record.meta)}</p> : null}
            </article>
          ))}
        </div>
      </div>
      </section>

      {comparisonOpen && comparison ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="comparison-title"
        >
          <div
            className={`flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border shadow-2xl ${
              darkMode ? 'border-white/10 bg-[#080808] text-stone-100' : 'border-black/10 bg-[#f8f5ef] text-zinc-950'
            }`}
          >
            <div className={`flex items-start justify-between gap-4 border-b p-5 ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-red-900 dark:text-red-200">Chapter comparison</p>
                <h2 id="comparison-title" className="mt-2 text-2xl font-black sm:text-3xl">
                  {comparison.book} {comparison.chapter}
                </h2>
                <p className={`mt-1 text-sm ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
                  {selectedCompareVersions.map(getVersionLabel).join(', ')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setComparisonOpen(false)}
                className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full border text-xl font-black transition ${
                  darkMode ? 'border-white/10 bg-white/10 hover:bg-white/15' : 'border-black/10 bg-white hover:bg-[#fffaf0]'
                }`}
                aria-label="Close comparison"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto p-5">
              {comparison.verses.length > 0 ? (
                <div className="grid gap-5">
                  {comparison.verses.map((verse) => (
                    <section
                      key={verse.verseNumber}
                      className={`rounded-3xl border p-4 ${darkMode ? 'border-white/10 bg-[#171717]' : 'border-black/10 bg-white'}`}
                    >
                      <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">
                        Verse {verse.verseNumber}
                      </p>
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {selectedCompareVersions.map((version) => {
                          const reading = verse.readings.find((item) => item.version.toLowerCase() === version.toLowerCase());

                          return (
                            <article
                              key={version}
                              className={`rounded-2xl border p-4 ${
                                darkMode ? 'border-white/10 bg-[#080808]' : 'border-black/10 bg-[#fffaf0]'
                              }`}
                            >
                              <p className="text-xs font-black uppercase tracking-[0.14em] text-red-900 dark:text-red-200">
                                {getVersionLabel(version)}
                              </p>
                              <p className={`mt-3 text-base leading-8 ${darkMode ? 'text-stone-200' : 'text-zinc-800'}`}>
                                {reading?.text || 'This verse is not available in this version.'}
                              </p>
                            </article>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <div className={`rounded-3xl border p-6 text-center ${darkMode ? 'border-white/10 bg-[#171717]' : 'border-black/10 bg-white'}`}>
                  <p className="text-sm font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">No comparison text</p>
                  <p className={`mt-2 text-sm leading-6 ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
                    The compare endpoint responded, but no verse text was found for this chapter.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default BibleToolsPanel;
