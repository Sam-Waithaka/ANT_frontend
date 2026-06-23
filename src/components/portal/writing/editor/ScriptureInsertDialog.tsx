import { BookOpenText, LoaderCircle, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getBibleBooks, getBibleChapters, getBibleVerses, getBibleVersions } from '../../../../services/scriptureApi';
import type { BibleBook, BibleChapter, BibleVerse, BibleVersion } from '../../../../types/scripture';
import type { ScriptureData, ScriptureDisplay } from './nodes/scriptureTypes';

type ScriptureInsertDialogProps = {
  darkMode: boolean;
  onClose: () => void;
  onInsert: (data: ScriptureData) => void;
};

type Mode = 'library' | 'manual';

const ScriptureInsertDialog = ({ darkMode, onClose, onInsert }: ScriptureInsertDialogProps) => {
  const [mode, setMode] = useState<Mode>('library');
  const [display, setDisplay] = useState<ScriptureDisplay>('block');
  const [versions, setVersions] = useState<BibleVersion[]>([]);
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [chapters, setChapters] = useState<BibleChapter[]>([]);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [versionId, setVersionId] = useState('');
  const [bookId, setBookId] = useState('');
  const [chapter, setChapter] = useState('');
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [manualReference, setManualReference] = useState('');
  const [manualVersion, setManualVersion] = useState('');
  const [manualText, setManualText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getBibleVersions().then((next) => {
      if (cancelled) return;
      setVersions(next);
      setVersionId(next[0]?.id || '');
    }).catch(() => !cancelled && setError('Bible versions could not be loaded. You can still use Manual Entry.')).finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!versionId) return;
    let cancelled = false;
    setBooks([]); setChapters([]); setVerses([]); setBookId(''); setChapter(''); setSelectedNumbers([]);
    setLoading(true);
    getBibleBooks(versionId).then((next) => { if (!cancelled) { setBooks(next); setBookId(next[0]?.id || ''); } }).catch(() => !cancelled && setError('Books could not be loaded for this version.')).finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [versionId]);

  useEffect(() => {
    if (!versionId || !bookId) return;
    let cancelled = false;
    setChapters([]); setVerses([]); setChapter(''); setSelectedNumbers([]);
    setLoading(true);
    getBibleChapters(versionId, bookId).then((next) => { if (!cancelled) { setChapters(next); setChapter(next[0] ? String(next[0].number) : ''); } }).catch(() => !cancelled && setError('Chapters could not be loaded.')).finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [bookId, versionId]);

  useEffect(() => {
    const chapterNumber = Number(chapter);
    if (!versionId || !bookId || !chapterNumber) return;
    let cancelled = false;
    setVerses([]); setSelectedNumbers([]);
    setLoading(true);
    getBibleVerses(versionId, bookId, chapter, chapterNumber).then((next) => { if (!cancelled) { setVerses(next.filter((verse) => verse.number > 0 && verse.text)); setSelectedNumbers(next[0]?.number ? [next[0].number] : []); } }).catch(() => !cancelled && setError('Verses could not be loaded.')).finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [bookId, chapter, versionId]);

  const selectedVersion = versions.find((item) => item.id === versionId);
  const selectedBook = books.find((item) => item.id === bookId);
  const selectedVerses = useMemo(() => verses.filter((verse) => selectedNumbers.includes(verse.number)), [selectedNumbers, verses]);
  const toggleVerse = (number: number) => setSelectedNumbers((current) => current.includes(number) ? current.filter((item) => item !== number) : [...current, number].sort((left, right) => left - right));
  const selectedReference = selectedNumbers.length ? `${selectedBook?.name || bookId} ${chapter}:${selectedNumbers[0]}${selectedNumbers.length > 1 ? `-${selectedNumbers.at(-1)}` : ''}` : '';
  const inputClass = darkMode ? 'w-full rounded-xl border border-white/10 bg-[#080808] px-3 py-2 text-sm text-stone-100 outline-none focus:ring-2 focus:ring-red-800/30' : 'w-full rounded-xl border border-black/10 bg-[#fffaf0] px-3 py-2 text-sm text-zinc-950 outline-none focus:ring-2 focus:ring-red-800/30';
  const surfaceClass = darkMode ? 'border-white/10 bg-[#171717] text-stone-100' : 'border-black/10 bg-white text-zinc-950';

  const insert = () => {
    if (mode === 'manual') {
      if (!manualReference.trim() || !manualText.trim()) { setError('Reference and Scripture text are required.'); return; }
      onInsert({ display, reference: manualReference.trim(), source: 'manual', text: manualText.trim(), version: manualVersion.trim() });
      return;
    }
    if (!selectedReference || selectedVerses.length === 0) { setError('Choose at least one verse.'); return; }
    onInsert({ display, reference: selectedReference, source: 'api', sourceId: `${versionId}:${bookId}:${chapter}:${selectedNumbers.join(',')}`, text: selectedVerses.map((verse) => verse.text).join('\n'), version: selectedVersion?.abbreviation || selectedVersion?.name || versionId, verses: selectedVerses.map((verse) => ({ number: verse.number, text: verse.text })) });
  };

  return <div aria-modal="true" className="fixed inset-0 z-50 grid place-items-end bg-black/45 p-4 sm:place-items-center" role="dialog"><section aria-labelledby="scripture-dialog-title" className={'max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border p-5 shadow-2xl sm:p-6 ' + surfaceClass}><header className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-red-800 dark:text-red-200">Insert Scripture</p><h2 className="mt-2 font-serif text-2xl" id="scripture-dialog-title">Set apart the passage</h2></div><button aria-label="Close Scripture dialog" className="grid size-10 place-items-center rounded-full border border-black/10 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10" onClick={onClose} type="button"><X size={18} /></button></header><div className="mt-5 flex gap-2 border-b border-black/10 pb-3 dark:border-white/10"><button className={mode === 'library' ? 'rounded-full bg-red-800 px-4 py-2 text-sm font-bold text-white' : 'rounded-full px-4 py-2 text-sm font-bold'} onClick={() => setMode('library')} type="button">Bible Library</button><button className={mode === 'manual' ? 'rounded-full bg-red-800 px-4 py-2 text-sm font-bold text-white' : 'rounded-full px-4 py-2 text-sm font-bold'} onClick={() => setMode('manual')} type="button">Manual Entry</button></div><div className="mt-5 grid gap-4">{mode === 'library' ? <><div className="grid gap-3 sm:grid-cols-3"><label className="grid gap-1 text-xs font-bold">Version<select className={inputClass} onChange={(event) => setVersionId(event.target.value)} value={versionId}>{versions.map((item) => <option key={item.id} value={item.id}>{item.abbreviation || item.name}</option>)}</select></label><label className="grid gap-1 text-xs font-bold">Book<select className={inputClass} onChange={(event) => setBookId(event.target.value)} value={bookId}>{books.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="grid gap-1 text-xs font-bold">Chapter<select className={inputClass} onChange={(event) => setChapter(event.target.value)} value={chapter}>{chapters.map((item) => <option key={item.id} value={item.number}>{item.number}</option>)}</select></label></div><div className="max-h-52 overflow-y-auto rounded-xl border border-black/10 p-2 dark:border-white/10">{loading ? <p className="flex items-center gap-2 p-3 text-sm text-zinc-600 dark:text-stone-300"><LoaderCircle className="size-4 animate-spin" /> Loading Scripture...</p> : verses.map((verse) => <label className="flex cursor-pointer gap-3 rounded-lg px-3 py-2 text-sm hover:bg-red-950/5" key={verse.number}><input checked={selectedNumbers.includes(verse.number)} onChange={() => toggleVerse(verse.number)} type="checkbox" /><span><strong className="mr-2 text-red-800 dark:text-red-200">{verse.number}</strong>{verse.text}</span></label>)}</div><p className="text-sm text-zinc-600 dark:text-stone-300">{selectedReference || 'Choose verses to preview the saved passage.'}</p></> : <><label className="grid gap-1 text-xs font-bold">Reference<input className={inputClass} onChange={(event) => setManualReference(event.target.value)} placeholder="Psalm 119:105" value={manualReference} /></label><label className="grid gap-1 text-xs font-bold">Version label<input className={inputClass} onChange={(event) => setManualVersion(event.target.value)} placeholder="NIV" value={manualVersion} /></label><label className="grid gap-1 text-xs font-bold">Scripture text<textarea className={inputClass + ' min-h-32 resize-y leading-7'} onChange={(event) => setManualText(event.target.value)} placeholder="Your word is a lamp to my feet..." value={manualText} /></label></>}<fieldset className="grid gap-2"><legend className="text-sm font-bold">How should this appear?</legend><div className="grid gap-2 sm:grid-cols-3">{([{ value: 'inline', label: 'Reference only' }, { value: 'block', label: 'Scripture block' }, { value: 'passage', label: 'Scripture passage' }] as const).map((item) => <label className={'cursor-pointer rounded-xl border p-3 text-sm ' + (display === item.value ? 'border-red-800 bg-red-950/5' : 'border-black/10 dark:border-white/10')} key={item.value}><input checked={display === item.value} className="sr-only" name="scripture-display" onChange={() => setDisplay(item.value)} type="radio" value={item.value} />{item.label}</label>)}</div></fieldset>{error ? <p className="text-sm text-red-800 dark:text-red-200">{error}</p> : null}<footer className="flex justify-end gap-3 border-t border-black/10 pt-4 dark:border-white/10"><button className="rounded-full px-4 py-2 text-sm font-bold" onClick={onClose} type="button">Cancel</button><button className="inline-flex items-center gap-2 rounded-full bg-red-800 px-5 py-2 text-sm font-bold text-white" disabled={loading} onClick={insert} type="button"><BookOpenText size={16} /> Insert Scripture</button></footer></div></section></div>;
};

export default ScriptureInsertDialog;


