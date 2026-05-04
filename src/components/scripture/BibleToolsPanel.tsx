import { useState } from 'react';
import {
  compareBibleChapter,
  getBibleGlossary,
  getBibleMarkers,
  getBibleNotes,
  getBibleResources,
  lookupBibleVerse,
  searchBible,
} from '../../services/scriptureApi';
import type {
  BibleBook,
  BibleChapter,
  BibleMarkerStatus,
  BibleNoteType,
  BibleResourceType,
  BibleToolRecord,
  BibleVersion,
  VerseLookupResult,
} from '../../types/scripture';

type ToolKey = 'search' | 'verse' | 'compare' | 'resources' | 'glossary' | 'markers' | 'notes';

type BibleToolsPanelProps = {
  darkMode: boolean;
  selectedBook?: BibleBook;
  selectedChapter?: BibleChapter;
  selectedVersion?: BibleVersion;
  versions: BibleVersion[];
};

const tools: Array<[ToolKey, string]> = [
  ['search', 'Search'],
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

const BibleToolsPanel = ({ darkMode, selectedBook, selectedChapter, selectedVersion, versions }: BibleToolsPanelProps) => {
  const [activeTool, setActiveTool] = useState<ToolKey>('search');
  const [query, setQuery] = useState('love');
  const [languageCode, setLanguageCode] = useState('');
  const [verseNumber, setVerseNumber] = useState(16);
  const [resourceType, setResourceType] = useState<BibleResourceType | ''>('');
  const [markerStatus, setMarkerStatus] = useState<BibleMarkerStatus | ''>('');
  const [noteType, setNoteType] = useState<BibleNoteType | ''>('');
  const [compareVersions, setCompareVersions] = useState('ASV,WEBP');
  const [records, setRecords] = useState<BibleToolRecord[]>([]);
  const [verseResult, setVerseResult] = useState<VerseLookupResult | null>(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const versionId = selectedVersion?.id || versions[0]?.id || 'ASV';
  const bookId = selectedBook?.id || 'John';
  const chapterNumber = selectedChapter?.number || 3;

  const runTool = async () => {
    setLoading(true);
    setStatus('');
    setRecords([]);
    setVerseResult(null);

    try {
      if (activeTool === 'search') {
        setRecords(await searchBible({ q: query, version: versionId, language_code: languageCode || undefined }));
      }

      if (activeTool === 'verse') {
        setVerseResult(await lookupBibleVerse(versionId, bookId, chapterNumber, verseNumber));
      }

      if (activeTool === 'compare') {
        setRecords(await compareBibleChapter(compareVersions.split(',').map((version) => version.trim()).filter(Boolean), bookId, chapterNumber));
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
            onClick={() => setActiveTool(key)}
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
        {(activeTool === 'search' || activeTool === 'glossary') && (
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={activeTool === 'glossary' ? 'Glossary term' : 'Search text'}
            className={inputClass}
          />
        )}

        {activeTool === 'search' && (
          <input
            value={languageCode}
            onChange={(event) => setLanguageCode(event.target.value)}
            placeholder="Optional language code, e.g. sw"
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
          <input
            value={compareVersions}
            onChange={(event) => setCompareVersions(event.target.value)}
            placeholder="ASV,WEBP,KJV"
            className={inputClass}
          />
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
          {loading ? 'Loading...' : 'Run tool'}
        </button>
      </div>

      <div className={`mt-4 max-h-80 overflow-y-auto rounded-2xl border p-3 ${darkMode ? 'border-white/10 bg-[#171717]' : 'border-black/10 bg-[#fffaf0]'}`}>
        {status ? <p className="text-sm leading-6 text-red-800 dark:text-red-200">{status}</p> : null}
        {verseResult ? (
          <div>
            <p className="text-sm font-black">{verseResult.reference}</p>
            <p className={`mt-2 text-sm leading-6 ${darkMode ? 'text-stone-300' : 'text-zinc-600'}`}>
              {verseResult.isPresent ? verseResult.text : verseResult.display || 'This verse is omitted in this version.'}
            </p>
          </div>
        ) : null}
        {!status && !verseResult && records.length === 0 ? (
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
