import { useEffect, useState } from 'react';
import {
  getBibleGlossary,
  getBibleMarkers,
  getBibleNotes,
  getBibleResources,
  searchBible,
} from '../../../services/scriptureApi';
import { useBibleComparison } from '../../../hooks/useBibleComparison';
import { useScriptureReaderContext } from '../../../contexts/ScriptureReaderStore';
import type {
  BibleBook,
  BibleChapter,
  BibleMarkerStatus,
  BibleNoteType,
  BibleResourceType,
  BibleSearchResponse,
  BibleSearchResult,
  BibleToolResponse,
  BibleVersion,
} from '../../../types/scripture';
import ScriptureComparisonModal from '../ScriptureComparisonModal';
import BibleToolsTabs from './BibleToolsTabs';
import CompareTool from './CompareTool';
import OptionGridTool from './OptionGridTool';
import SearchTool, { type SearchScope } from './SearchTool';
import StudyModeTool from './StudyModeTool';
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
  studyMode: boolean;
  versions: BibleVersion[];
  onStudyModeChange: (enabled: boolean) => void;
};

const BibleToolsPanel = ({
  books,
  darkMode,
  embedded = false,
  selectedBook,
  selectedChapter,
  selectedVersion,
  studyMode,
  versions,
  onStudyModeChange,
}: BibleToolsPanelProps) => {
  const [activeTool, setActiveTool] = useState<ToolKey>('compare');
  const [openComparePicker, setOpenComparePicker] = useState<ComparePicker>(null);
  const [query, setQuery] = useState('love');
  const [searchScope, setSearchScope] = useState<SearchScope>('selected');
  const [searchVersionIds, setSearchVersionIds] = useState<string[]>([]);
  const [searchBookId, setSearchBookId] = useState('');
  const [searchLanguageCode, setSearchLanguageCode] = useState('');
  const [searchTestament, setSearchTestament] = useState('');
  const [searchFuzzy, setSearchFuzzy] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [searchResponse, setSearchResponse] = useState<BibleSearchResponse | null>(null);
  const [resourceType, setResourceType] = useState<BibleResourceType | ''>('');
  const [markerStatus, setMarkerStatus] = useState<BibleMarkerStatus | ''>('');
  const [noteType, setNoteType] = useState<BibleNoteType | ''>('');
  const [toolResponse, setToolResponse] = useState<BibleToolResponse | null>(null);
  const [toolPage, setToolPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const bibleComparison = useBibleComparison({
    books,
    selectedBook,
    selectedChapter,
    selectedVersion,
    versions,
  });
  const { openScripture } = useScriptureReaderContext();
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
    setToolPage(1);
    setToolResponse(null);
    setSearchResponse(null);
    bibleComparison.resetOutput();
  };

  const resetSearchPagination = () => {
    setSearchPage(1);
    setSearchResponse(null);
    setStatus('');
  };

  const runSearch = async (page = searchPage) => {
    if (query.trim().length < 2) {
      setStatus('Search query must be at least 2 characters.');
      setSearchResponse(null);
      return;
    }

    const params = {
      book: searchBookId || undefined,
      fuzzy: searchFuzzy || undefined,
      language_code: searchLanguageCode || undefined,
      page,
      page_size: 25,
      q: query.trim(),
      testament: searchTestament || undefined,
      version: searchScope === 'selected' ? versionId : undefined,
      versions: searchScope === 'versions' ? (searchVersionIds.length > 0 ? searchVersionIds.join(',') : versionId) : undefined,
    };

    setLoading(true);
    setStatus('');
    setToolResponse(null);
    bibleComparison.resetOutput();

    try {
      const response = await searchBible(params);
      setSearchPage(page);
      setSearchResponse(response);
    } catch {
      setSearchResponse(null);
      setStatus('Unable to search Scripture right now. Confirm the backend is running and the endpoint is available.');
    } finally {
      setLoading(false);
    }
  };

  const loadPaginatedTool = async (page = 1, append = false) => {
    const nextResponse =
      activeTool === 'resources'
        ? await getBibleResources(versionId, resourceType || undefined, page)
        : activeTool === 'glossary'
          ? await getBibleGlossary(versionId, query, page)
          : activeTool === 'markers'
            ? await getBibleMarkers(versionId, markerStatus || undefined, page)
            : activeTool === 'notes'
              ? await getBibleNotes(versionId, noteType || undefined, page)
              : null;

    if (!nextResponse) {
      return;
    }

    setToolPage(page);
    setToolResponse((current) =>
      append && current
        ? {
            ...nextResponse,
            results: [...current.results, ...nextResponse.results],
          }
        : nextResponse,
    );
  };

  const runTool = async () => {
    setLoading(true);
    resetToolOutput();

    try {
      if (activeTool === 'compare') {
        await bibleComparison.loadComparison({ openModal: true });
      }

      if (activeTool === 'search') {
        await runSearch(1);
      }
      if (['resources', 'glossary', 'markers', 'notes'].includes(activeTool)) {
        await loadPaginatedTool(1);
      }
    } catch {
      setStatus('Unable to load this Bible tool right now. Confirm the backend is running and the endpoint is available.');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreToolResults = async () => {
    if (!toolResponse?.next || loadingMore) {
      return;
    }

    setLoadingMore(true);
    setStatus('');

    try {
      await loadPaginatedTool(toolPage + 1, true);
    } catch {
      setStatus('Unable to load more results for this Bible tool right now.');
    } finally {
      setLoadingMore(false);
    }
  };

  const openSearchResult = (result: BibleSearchResult) => {
    if (!result.book.osisId || !result.chapter) {
      return;
    }

    openScripture({
      book: result.book.osisId,
      chapter: result.chapter,
      verse: result.verseNumber,
      versionId: result.version || versionId,
    });
  };

  const toggleSearchVersion = (nextVersionId: string) => {
    resetSearchPagination();
    setSearchVersionIds((current) =>
      current.includes(nextVersionId)
        ? current.filter((item) => item !== nextVersionId)
        : [...current, nextVersionId],
    );
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

          {activeTool === 'search' && (
            <SearchTool
              books={books}
              darkMode={darkMode}
              fuzzy={searchFuzzy}
              languageCode={searchLanguageCode}
              page={searchPage}
              query={query}
              response={searchResponse}
              scope={searchScope}
              selectedBookId={searchBookId}
              selectedVersionIds={searchVersionIds}
              selectedVersionLabel={selectedVersionLabel}
              testament={searchTestament}
              versions={versions}
              onBookChange={(bookId) => {
                resetSearchPagination();
                setSearchBookId(bookId);
              }}
              onFuzzyChange={(value) => {
                resetSearchPagination();
                setSearchFuzzy(value);
              }}
              onLanguageCodeChange={(languageCode) => {
                resetSearchPagination();
                setSearchLanguageCode(languageCode);
              }}
              onPageChange={(page) => void runSearch(page)}
              onQueryChange={(nextQuery) => {
                resetSearchPagination();
                setQuery(nextQuery);
              }}
              onResultOpen={openSearchResult}
              onScopeChange={(scope) => {
                resetSearchPagination();
                setSearchScope(scope);
              }}
              onTestamentChange={(testament) => {
                resetSearchPagination();
                setSearchTestament(testament);
              }}
              onToggleVersion={toggleSearchVersion}
            />
          )}

          {activeTool === 'study' && (
            <StudyModeTool
              darkMode={darkMode}
              enabled={studyMode}
              onChange={onStudyModeChange}
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

          {activeTool !== 'study' && (
            <button
              type="button"
              onClick={runTool}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-red-800 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-red-700"
            >
              {(loading || (activeTool === 'compare' && bibleComparison.loading))
                ? 'Loading...'
                : activeTool === 'compare'
                  ? 'Run comparison'
                  : activeTool === 'search'
                    ? 'Run search'
                  : activeTool === 'resources'
                    ? 'Load resources'
                    : activeTool === 'markers'
                      ? 'Load markers'
                      : activeTool === 'notes'
                        ? 'Load notes'
                        : 'Run tool'}
            </button>
          )}
        </div>

        {activeTool === 'study' ? null : activeTool === 'search' ? (
          status ? <p className="mt-4 text-sm leading-6 text-red-800 dark:text-red-200">{status}</p> : null
        ) : (
          <ToolResults
            activeTool={activeTool}
            comparison={bibleComparison.comparison}
            comparisonHasVerses={bibleComparison.comparisonHasVerses}
            darkMode={darkMode}
            loadingMore={loadingMore}
            records={toolResponse?.results || []}
            resultsClass={resultsClass}
            selectedCompareVersions={bibleComparison.selectedVersions}
            status={status || bibleComparison.status}
            toolResponse={toolResponse}
            onLoadMore={loadMoreToolResults}
            onOpenComparison={() => setComparisonOpen(true)}
          />
        )}
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
