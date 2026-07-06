import type { DragEvent, FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { portalSurface } from '../../../components/portal/portalSurface';
import WritingStudioShell from '../../../components/portal/writing/WritingStudioShell';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import {
  createWritingSeriesItem,
  deleteWritingSeriesItem,
  fetchSeriesDetail,
  fetchWritings,
  reorderWritingSeriesItems,
} from '../../../services/writingApi';
import type { Writing, WritingSeries, WritingSeriesItem, WritingStatus } from '../../../types/writing';
import { canManageTaxonomy } from '../../../utils/permissions';

const writingStatuses: Array<{ label: string; value: WritingStatus | 'ALL' }> = [
  { label: 'All statuses', value: 'ALL' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'In review', value: 'IN_REVIEW' },
  { label: 'Scheduled', value: 'SCHEDULED' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Archived', value: 'ARCHIVED' },
];

const seriesName = (item?: WritingSeries | null) => item?.title || item?.name || item?.slug || 'Series';
const assetPreviewUrl = (asset?: Writing['og_image_detail'] | WritingSeries['cover_image']) => asset?.url || asset?.image || asset?.file || '';
const sortSeriesItems = (items: WritingSeriesItem[] = []) => [...items].sort((left, right) => left.order === right.order ? left.writing_title.localeCompare(right.writing_title) : left.order - right.order);
const formatStatus = (status?: string) => status ? status.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : 'Unknown';

const WritingSeriesAdminPage = () => {
  const { id } = useParams();
  const auth = useAuth();
  const { darkMode } = useTheme();
  const [draggedItemId, setDraggedItemId] = useState<number | string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Writing[]>([]);
  const [searching, setSearching] = useState(false);
  const [series, setSeries] = useState<WritingSeries | null>(null);
  const [status, setStatus] = useState<WritingStatus | 'ALL'>('ALL');

  const inputClass = `w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-red-800/25 ${darkMode ? 'border-white/10 bg-white/5 text-stone-100 placeholder:text-stone-500' : 'border-[#eaded0] bg-white text-zinc-950 placeholder:text-[#8a7d70]'}`;
  const actionButtonClass = darkMode
    ? 'rounded-full border border-white/10 px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.12em] text-stone-200 transition hover:bg-white/10 disabled:opacity-40'
    : 'rounded-full border border-[#eaded0] px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.12em] text-[#5f574f] transition hover:bg-[#fffaf0] disabled:opacity-40';
  const dangerButtonClass = darkMode
    ? 'rounded-full border border-red-400/20 px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.12em] text-red-200 transition hover:bg-red-950/30 disabled:opacity-40'
    : 'rounded-full border border-red-900/15 px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.12em] text-red-800 transition hover:bg-red-50 disabled:opacity-40';
  const labelClass = `text-[0.68rem] font-black uppercase tracking-[0.18em] ${darkMode ? 'text-red-200' : 'text-red-800'}`;
  const helperClass = `text-xs leading-5 ${portalSurface.softMutedText(darkMode)}`;
  const statusBadgeClass = (nextStatus?: string) => {
    const base = 'inline-flex rounded-full border px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.12em]';
    if (nextStatus === 'PUBLISHED') return `${base} ${darkMode ? 'border-green-400/20 bg-green-400/10 text-green-200' : 'border-green-700/15 bg-green-50 text-green-800'}`;
    if (nextStatus === 'IN_REVIEW') return `${base} ${darkMode ? 'border-amber-300/20 bg-amber-300/10 text-amber-100' : 'border-amber-700/15 bg-amber-50 text-amber-800'}`;
    if (nextStatus === 'SCHEDULED') return `${base} ${darkMode ? 'border-blue-300/20 bg-blue-300/10 text-blue-100' : 'border-blue-700/15 bg-blue-50 text-blue-800'}`;
    if (nextStatus === 'ARCHIVED') return `${base} ${darkMode ? 'border-white/10 bg-white/5 text-stone-400' : 'border-[#eaded0] bg-[#fffaf0] text-[#786f66]'}`;
    return `${base} ${darkMode ? 'border-red-400/20 bg-red-950/30 text-red-200' : 'border-red-900/15 bg-red-50 text-red-800'}`;
  };

  const loadSeries = () => {
    if (!id) return;
    setLoading(true);
    fetchSeriesDetail(auth.accessToken, id)
      .then((payload) => setSeries(payload))
      .catch((err) => setMessage(err instanceof Error ? err.message : 'Unable to load series.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSeries();
  }, [auth.accessToken, id]);

  const searchWritings = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!canManageTaxonomy(auth.permissions)) return;
    setSearching(true);
    try {
      const page = await fetchWritings(auth.accessToken, { page: 1, page_size: 24, search: query.trim() || undefined, status });
      setResults(page.results);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to search writings.');
    } finally {
      setSearching(false);
    }
  };

  const addWriting = async (writingId: number | string) => {
    if (!series || !canManageTaxonomy(auth.permissions)) return;
    try {
      await createWritingSeriesItem(auth.accessToken, { order: sortSeriesItems(series.items).length, series: series.id, writing: writingId });
      setQuery('');
      setResults([]);
      setMessage('Writing added to series.');
      loadSeries();
    } catch (err) {
      const detail = err instanceof Error ? err.message : '';
      setMessage(detail.toLowerCase().includes('duplicate') || detail.toLowerCase().includes('unique') || detail.includes('400') ? 'This writing is already in this series.' : detail || 'Unable to add writing to series.');
    }
  };

  const reorderItems = async (items: WritingSeriesItem[], fromIndex: number, toIndex: number) => {
    if (!series || !canManageTaxonomy(auth.permissions) || toIndex < 0 || toIndex >= items.length) return;
    const nextItems = [...items];
    const [movedItem] = nextItems.splice(fromIndex, 1);
    nextItems.splice(toIndex, 0, movedItem);
    try {
      await reorderWritingSeriesItems(auth.accessToken, series.id, nextItems.map((item, index) => ({ id: item.id, order: index })));
      setMessage('Series order updated.');
      loadSeries();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to reorder series items.');
      loadSeries();
    }
  };

  const dropItem = async (items: WritingSeriesItem[], targetIndex: number) => {
    if (draggedItemId === null) return;
    const fromIndex = items.findIndex((item) => String(item.id) === String(draggedItemId));
    setDraggedItemId(null);
    if (fromIndex < 0 || fromIndex === targetIndex) return;
    await reorderItems(items, fromIndex, targetIndex);
  };

  const removeItem = async (item: WritingSeriesItem) => {
    if (!window.confirm(`Remove ${item.writing_title} from this series?`)) return;
    try {
      await deleteWritingSeriesItem(auth.accessToken, item.id);
      setMessage('Writing removed from series.');
      loadSeries();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to remove writing from series.');
    }
  };

  const orderedItems = sortSeriesItems(series?.items || []);
  const coverUrl = assetPreviewUrl(series?.cover_image);

  return (
    <WritingStudioShell>
      <div className="grid gap-6">
        <Link className={actionButtonClass} to="/portal/writing/library">Back to Library</Link>
        <section className={`rounded-[2rem] border p-6 shadow-lg ${portalSurface.panel(darkMode)}`}>
          <p className={labelClass}>Series admin</p>
          <div className="mt-4 flex flex-wrap items-start gap-5">
            {coverUrl ? <img alt="" className="h-28 w-40 rounded-3xl border border-[#eaded0] object-cover dark:border-white/10" src={coverUrl} /> : null}
            <div className="min-w-0 flex-1">
              <h1 className="font-serif text-4xl leading-tight sm:text-5xl">{loading ? 'Loading series...' : seriesName(series)}</h1>
              {series?.slug ? <p className={`mt-2 break-all text-sm ${portalSurface.softMutedText(darkMode)}`}>/{series.slug}</p> : null}
              {series?.description ? <p className={`mt-4 max-w-3xl text-sm leading-7 ${portalSurface.mutedText(darkMode)}`}>{series.description}</p> : null}
              <div className="mt-4 flex flex-wrap gap-2">
                {series?.is_active ? <span className={statusBadgeClass('PUBLISHED')}>Active</span> : <span className={statusBadgeClass('ARCHIVED')}>Inactive</span>}
                {series?.is_featured ? <span className={statusBadgeClass('DRAFT')}>Featured</span> : null}
                {series?.slug ? <Link className={actionButtonClass} target="_blank" to={`/resources?series_slug=${encodeURIComponent(series.slug)}`}>Public preview</Link> : null}
              </div>
            </div>
          </div>
          {message ? <p className="mt-5 text-sm font-bold text-red-800">{message}</p> : null}
        </section>

        <section className={`rounded-[2rem] border p-6 shadow-lg ${portalSurface.panel(darkMode)}`}>
          <p className={labelClass}>Add writing</p>
          <form className="mt-3 grid gap-3 md:grid-cols-[1fr_14rem_auto]" onSubmit={(event) => void searchWritings(event)}>
            <input className={inputClass} onChange={(event) => setQuery(event.target.value)} placeholder="Search writings by title..." value={query} />
            <select className={inputClass} onChange={(event) => setStatus(event.target.value as WritingStatus | 'ALL')} value={status}>
              {writingStatuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
            <button className="rounded-full bg-red-800 px-5 py-3 text-sm font-black text-white disabled:opacity-50" disabled={searching} type="submit">{searching ? 'Searching...' : 'Search'}</button>
          </form>
          {results.length ? <div className="mt-4 grid gap-2">{results.map((writing) => {
            const alreadyAdded = orderedItems.some((item) => String(item.writing) === String(writing.id));
            const imageUrl = assetPreviewUrl(writing.og_image_detail);
            return <div key={writing.id} className={darkMode ? 'rounded-2xl border border-white/10 bg-white/[0.03] p-3' : 'rounded-2xl border border-[#eaded0] bg-white p-3'}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  {imageUrl ? <img alt="" className="h-12 w-16 rounded-2xl object-cover" src={imageUrl} /> : null}
                  <div className="min-w-0"><p className="text-sm font-black">{writing.title}</p><span className={statusBadgeClass(writing.status)}>{formatStatus(writing.status)}</span></div>
                </div>
                <button className={actionButtonClass} disabled={alreadyAdded} onClick={() => void addWriting(writing.id)} type="button">{alreadyAdded ? 'Already added' : 'Add'}</button>
              </div>
            </div>;
          })}</div> : null}
        </section>

        <section className={`rounded-[2rem] border p-6 shadow-lg ${portalSurface.panel(darkMode)}`}>
          <p className={labelClass}>Current journey</p>
          <p className={helperClass}>Drag items, or use Move up / Move down. Ordering is stored through the dedicated series reorder endpoint.</p>
          <ol className="mt-4 grid gap-3">
            {orderedItems.length ? orderedItems.map((item, index) => <li key={item.id} className={darkMode ? 'rounded-2xl border border-white/10 bg-white/[0.03] p-4' : 'rounded-2xl border border-[#eaded0] bg-white p-4'} draggable onDragEnd={() => setDraggedItemId(null)} onDragOver={(event: DragEvent<HTMLLIElement>) => event.preventDefault()} onDragStart={() => setDraggedItemId(item.id)} onDrop={() => void dropItem(orderedItems, index)}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0"><p className="text-sm font-black">{index + 1}. {item.writing_title}</p>{item.writing_detail?.status ? <span className={statusBadgeClass(item.writing_detail.status)}>{formatStatus(item.writing_detail.status)}</span> : null}</div>
                <div className="flex flex-wrap gap-2"><button className={actionButtonClass} disabled={index === 0} onClick={() => void reorderItems(orderedItems, index, index - 1)} type="button">Move up</button><button className={actionButtonClass} disabled={index === orderedItems.length - 1} onClick={() => void reorderItems(orderedItems, index, index + 1)} type="button">Move down</button><Link className={actionButtonClass} to={`/portal/writing/${item.writing}`}>Open</Link><button className={dangerButtonClass} onClick={() => void removeItem(item)} type="button">Remove</button></div>
              </div>
            </li>) : <p className={`text-sm ${portalSurface.softMutedText(darkMode)}`}>No writings in this series yet.</p>}
          </ol>
        </section>
      </div>
    </WritingStudioShell>
  );
};

export default WritingSeriesAdminPage;

