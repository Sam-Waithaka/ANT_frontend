import { useEffect, useState } from 'react';
import {
  compareBibleChapter,
  getBibleChapters,
  getBibleGlossary,
  getBibleMarkers,
  getBibleNotes,
  getBibleResources,
} from '../../../services/scriptureApi';
import type {
  BibleBook,
  BibleChapter,
  BibleComparisonChapter,
  BibleMarkerStatus,
  BibleNoteType,
  BibleResourceType,
  BibleToolRecord,
  BibleVersion,
} from '../../../types/scripture';
import BibleToolsComparisonDialog from './BibleToolsComparisonDialog';
import BibleToolsTabs from './BibleToolsTabs';
import CompareTool from './CompareTool';
import OptionGridTool from './OptionGridTool';
import ToolResults from './ToolResults';
import {
  inputClass,
  markerStatuses,
  noteTypes,
  resourceTypes,
  type ComparePicker,
  type ToolKey,
} from './types';

type BibleToolsPanelProps = {
  books: BibleBook[];
  darkMode: boolean;
  embedded?: boolean;
  selectedBook?: BibleBook;
  selectedChapter?: BibleChapter;
  selectedVersion?: BibleVersion;
  versions: BibleVersion[];
};

const BibleToolsPanel = ({
  books,
  darkMode,
  embedded = false,
  selectedBook,
  selectedChapter,
  selectedVersion,
  versions,
}: BibleToolsPanelProps) => {
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
  const selectedVersionLabel = selectedVersion?.abbreviation || versionId;
  const getVersionLabel = (versionIdToFind: string) =>
    versions.find((version) => version.id.toLowerCase() === versionIdToFind.toLowerCase())?.abbreviation || versionIdToFind;
  const panelSurfaceClass = embedded
    ? 'min-w-0 p-0 shadow-none border-0 rounded-none bg-transparent'
    : `rounded-[2rem] border p-4 shadow-sm ${
        darkMode ? 'border-white/10 bg-zinc-950 shadow-black/25' : 'border-black/10 bg-white shadow-zinc-900/10'
      } min-w-0`;
  const resultsClass = embedded
    ? 'mt-3'
    : `mt-4 max-h-80 overflow-y-auto rounded-2xl p-3 ${darkMode ? 'bg-[#171717]' : 'bg-transparent'}`;

  useEffect(() => {
    if (versions.length === 0 || compareVersionIds.length > 0) return;

    const defaultVersions = [
      selectedVersion?.id,
      versions.find((version) => version.id !== selectedVersion?.id)?.id,
    ].filter(Boolean) as string[];

    setCompareVersionIds(defaultVersions.length >= 2 ? defaultVersions : versions.slice(0, 2).map((version) => version.id));
  }, [compareVersionIds.length, selectedVersion?.id, versions]);

  useEffect(() => {
    if (selectedBook?.id) setCompareBookId(selectedBook.id);
  }, [selectedBook?.id]);

  useEffect(() => {
    if (selectedChapter?.number) setCompareChapterNumber(selectedChapter.number);
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
        if (!cancelled) setCompareChapters([]);
      }
    };

    loadCompareChapters();

    return () => {
      cancelled = true;
    };
  }, [compareBookId, versionId]);

  useEffect(() => {
    if (!comparisonOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setComparisonOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [comparisonOpen]);

  const resetToolOutput = () => {
    setStatus('');
    setRecords([]);
    setComparison(null);
    setComparisonOpen(false);
  };

  const toggleCompareVersion = (versionIdToToggle: string) => {
    setCompareVersionIds((current) =>
      current.includes(versionIdToToggle)
        ? current.filter((id) => id !== versionIdToToggle)
        : [...current, versionIdToToggle],
    );
  };

  const runTool = async () => {
    setLoading(true);
    resetToolOutput();

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

      if (activeTool === 'resources') setRecords(await getBibleResources(versionId, resourceType || undefined));
      if (activeTool === 'glossary') setRecords(await getBibleGlossary(versionId, query));
      if (activeTool === 'markers') setRecords(await getBibleMarkers(versionId, markerStatus || undefined));
      if (activeTool === 'notes') setRecords(await getBibleNotes(versionId, noteType || undefined));
    } catch {
      setStatus('Unable to load this Bible tool right now. Confirm the backend is running and the endpoint is available.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className={panelSurfaceClass}>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">Bible tools</p>
        <BibleToolsTabs
          activeTool={activeTool}
          darkMode={darkMode}
          onChange={(tool) => {
            setActiveTool(tool);
            resetToolOutput();
          }}
        />

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
            <CompareTool
              books={books}
              compareBook={compareBook}
              compareBookId={compareBookId}
              compareChapter={compareChapter}
              compareChapterNumber={compareChapterNumber || chapterNumber}
              compareChapters={compareChapters}
              darkMode={darkMode}
              openComparePicker={openComparePicker}
              selectedBook={selectedBook}
              selectedCompareVersions={selectedCompareVersions}
              versions={versions}
              onBookChange={setCompareBookId}
              onChapterNumberChange={setCompareChapterNumber}
              onOpenComparePickerChange={setOpenComparePicker}
              onToggleVersion={toggleCompareVersion}
            />
          )}

          {activeTool === 'resources' && (
            <OptionGridTool
              allLabel="All Types"
              darkMode={darkMode}
              description="Load translation notes, copyright, prefaces, and study resources for the selected Bible version."
              options={resourceTypes}
              selectedVersionLabel={selectedVersionLabel}
              title="Resource type"
              value={resourceType}
              onChange={setResourceType}
            />
          )}

          {activeTool === 'markers' && (
            <OptionGridTool
              allLabel="All Statuses"
              darkMode={darkMode}
              description="Review omitted verses, empty markers, and source availability notes for this version."
              options={markerStatuses}
              selectedVersionLabel={selectedVersionLabel}
              title="Marker status"
              value={markerStatus}
              onChange={setMarkerStatus}
            />
          )}

          {activeTool === 'notes' && (
            <OptionGridTool
              allLabel="All Types"
              darkMode={darkMode}
              description="Browse footnotes, cross references, and textual variant notes for the selected Bible version."
              options={noteTypes}
              selectedVersionLabel={selectedVersionLabel}
              title="Note type"
              value={noteType}
              onChange={setNoteType}
            />
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

        <ToolResults
          comparison={comparison}
          comparisonHasVerses={comparisonHasVerses}
          darkMode={darkMode}
          records={records}
          resultsClass={resultsClass}
          selectedCompareVersions={selectedCompareVersions}
          status={status}
          onOpenComparison={() => setComparisonOpen(true)}
        />
      </section>

      {comparisonOpen && comparison ? (
        <BibleToolsComparisonDialog
          comparison={comparison}
          darkMode={darkMode}
          selectedCompareVersions={selectedCompareVersions}
          versionLabelFor={getVersionLabel}
          onClose={() => setComparisonOpen(false)}
        />
      ) : null}
    </>
  );
};

export default BibleToolsPanel;
