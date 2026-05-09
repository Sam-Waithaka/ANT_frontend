import { useEffect, useState } from 'react';
import {
  getBibleGlossary,
  getBibleMarkers,
  getBibleNotes,
  getBibleResources,
} from '../../../services/scriptureApi';
import { useBibleComparison } from '../../../hooks/useBibleComparison';
import type {
  BibleBook,
  BibleChapter,
  BibleMarkerStatus,
  BibleNoteType,
  BibleResourceType,
  BibleToolRecord,
  BibleVersion,
} from '../../../types/scripture';
import ScriptureComparisonModal from '../ScriptureComparisonModal';
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
  const [openComparePicker, setOpenComparePicker] = useState<ComparePicker>(null);
  const [query, setQuery] = useState('love');
  const [resourceType, setResourceType] = useState<BibleResourceType | ''>('');
  const [markerStatus, setMarkerStatus] = useState<BibleMarkerStatus | ''>('');
  const [noteType, setNoteType] = useState<BibleNoteType | ''>('');
  const [records, setRecords] = useState<BibleToolRecord[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const bibleComparison = useBibleComparison({
    books,
    selectedBook,
    selectedChapter,
    selectedVersion,
    versions,
  });
  const versionId = selectedVersion?.id || versions[0]?.id || 'ASV';
  const selectedVersionLabel = selectedVersion?.abbreviation || versionId;
  const panelSurfaceClass = embedded
    ? 'min-w-0 p-0 shadow-none border-0 rounded-none bg-transparent'
    : `rounded-[2rem] border p-4 shadow-sm ${
        darkMode ? 'border-white/10 bg-zinc-950 shadow-black/25' : 'border-black/10 bg-white shadow-zinc-900/10'
      } min-w-0`;
  const resultsClass = embedded
    ? 'mt-3'
    : `mt-4 max-h-80 overflow-y-auto rounded-2xl p-3 ${darkMode ? 'bg-[#171717]' : 'bg-transparent'}`;

  const setComparisonOpen = bibleComparison.setOpen;

  useEffect(() => {
    if (!bibleComparison.open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setComparisonOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bibleComparison.open, setComparisonOpen]);

  const resetToolOutput = () => {
    setStatus('');
    setRecords([]);
    bibleComparison.resetOutput();
  };

  const runTool = async () => {
    setLoading(true);
    resetToolOutput();

    try {
      if (activeTool === 'compare') {
        await bibleComparison.loadComparison({ openModal: true });
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
              compareBook={bibleComparison.compareBook}
              compareBookId={bibleComparison.bookId}
              compareChapter={bibleComparison.compareChapter}
              compareChapterNumber={bibleComparison.chapterNumber || selectedChapter?.number || 1}
              compareChapters={bibleComparison.chapters}
              darkMode={darkMode}
              openComparePicker={openComparePicker}
              selectedBook={selectedBook}
              selectedCompareVersions={bibleComparison.selectedVersions}
              versions={versions}
              onBookChange={bibleComparison.setBookId}
              onChapterNumberChange={bibleComparison.setChapterNumber}
              onOpenComparePickerChange={setOpenComparePicker}
              onToggleVersion={bibleComparison.toggleVersion}
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
            {(loading || (activeTool === 'compare' && bibleComparison.loading))
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
          comparison={bibleComparison.comparison}
          comparisonHasVerses={bibleComparison.comparisonHasVerses}
          darkMode={darkMode}
          records={records}
          resultsClass={resultsClass}
          selectedCompareVersions={bibleComparison.selectedVersions}
          status={status || bibleComparison.status}
          onOpenComparison={() => setComparisonOpen(true)}
        />
      </section>

      <ScriptureComparisonModal
        books={books}
        chapters={bibleComparison.chapters}
        comparison={bibleComparison.comparison}
        comparisonNavigationLoading={loading || bibleComparison.loading}
        darkMode={darkMode}
        open={bibleComparison.open}
        selectedBookId={bibleComparison.bookId || selectedBook?.id}
        selectedChapterNumber={bibleComparison.chapterNumber || selectedChapter?.number}
        selectedCompareVersions={bibleComparison.selectedVersions}
        versions={versions}
        versionLabelFor={bibleComparison.versionLabelFor}
        onClose={() => setComparisonOpen(false)}
        onComparisonReferenceChange={bibleComparison.changeReference}
        onSelectedCompareVersionsChange={bibleComparison.changeVersions}
      />
    </>
  );
};

export default BibleToolsPanel;
