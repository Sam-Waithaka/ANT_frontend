import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { Archive, ArrowLeft, ImagePlus, Save, Send } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import WritingStatusBadge from '../../../components/portal/writing/WritingStatusBadge';
import WritingStudioShell from '../../../components/portal/writing/WritingStudioShell';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import { archiveWriting, fetchWriting, publishWriting, updateWriting } from '../../../services/writingApi';
import type { Writing } from '../../../types/writing';
import { canArchiveWriting, canEditAnyWriting, canEditOwnWriting, canPublishWriting, canUploadMedia } from '../../../utils/permissions';

const canEdit = (permissions: string[], writing?: Writing | null) => {
  if (!writing) return false;
  if (canEditAnyWriting(permissions)) return true;
  return canEditOwnWriting(permissions) && ['DRAFT', 'IN_REVIEW', 'SCHEDULED'].includes(writing.status);
};

const WritingEditorPage = () => {
  const { id = '' } = useParams();
  const auth = useAuth();
  const { darkMode } = useTheme();
  const [excerpt, setExcerpt] = useState('');
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [writing, setWriting] = useState<Writing | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetchWriting(auth.accessToken, id, controller.signal)
      .then((nextWriting) => {
        setWriting(nextWriting);
        setTitle(nextWriting.title || '');
        setExcerpt(nextWriting.excerpt || '');
      })
      .catch((err) => setMessage(err instanceof Error ? err.message : 'Unable to load writing.'))
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [auth.accessToken, id]);

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!writing || !canEdit(auth.permissions, writing)) return;
    setSaving(true);
    setMessage('');

    try {
      const nextWriting = await updateWriting(auth.accessToken, writing.id, { excerpt, title });
      setWriting(nextWriting);
      setMessage('Draft saved.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to save draft.');
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (action: 'archive' | 'publish') => {
    if (!writing) return;
    setSaving(true);
    setMessage('');

    try {
      const nextWriting = action === 'publish'
        ? await publishWriting(auth.accessToken, writing.id)
        : await archiveWriting(auth.accessToken, writing.id);
      setWriting(nextWriting);
      setMessage(action === 'publish' ? 'Article published.' : 'Article archived.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setSaving(false);
    }
  };

  const editable = canEdit(auth.permissions, writing);

  return (
    <WritingStudioShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link to="/portal/writing/articles" className={`inline-flex items-center gap-2 text-sm font-black ${darkMode ? 'text-stone-300' : 'text-zinc-700'}`}>
          <ArrowLeft size={16} /> Articles
        </Link>
        <div className="flex flex-wrap gap-2">
          {canPublishWriting(auth.permissions) ? (
            <button className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-black text-zinc-900 shadow-sm" onClick={() => void runAction('publish')} type="button">
              <Send size={15} /> Publish
            </button>
          ) : null}
          {canArchiveWriting(auth.permissions) ? (
            <button className="inline-flex items-center gap-2 rounded-full border border-red-900/20 px-4 py-2 text-sm font-black text-red-800" onClick={() => void runAction('archive')} type="button">
              <Archive size={15} /> Archive
            </button>
          ) : null}
        </div>
      </div>

      {loading ? <p className={darkMode ? 'text-stone-400' : 'text-zinc-600'}>Loading editor...</p> : null}

      {writing ? (
        <form onSubmit={handleSave} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <section className={`rounded-3xl border p-6 shadow-lg ${darkMode ? 'border-white/10 bg-zinc-950' : 'border-black/10 bg-white'}`}>
            <div className="flex flex-wrap items-center gap-3">
              <WritingStatusBadge status={writing.status} />
              <span className={`text-sm ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>Preview shell</span>
            </div>
            <input
              className="mt-6 w-full bg-transparent font-serif text-5xl leading-tight outline-none"
              disabled={!editable}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Untitled resource"
              value={title}
            />
            <textarea
              className={`mt-6 min-h-28 w-full rounded-2xl border px-4 py-3 leading-7 outline-none ${darkMode ? 'border-white/10 bg-white/5' : 'border-black/10 bg-[#f8f5ef]'}`}
              disabled={!editable}
              onChange={(event) => setExcerpt(event.target.value)}
              placeholder="Write a short excerpt for the public resource page."
              value={excerpt}
            />
            <div className={`mt-6 min-h-80 rounded-3xl border border-dashed p-6 ${darkMode ? 'border-white/10 bg-white/5 text-stone-400' : 'border-black/10 bg-[#f8f5ef] text-zinc-600'}`}>
              Rich text editor placeholder. This area is prepared for the Lexical document body from the backend.
            </div>
            <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-red-800 px-6 py-3 text-sm font-black text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:opacity-60" disabled={!editable || saving} type="submit">
              <Save size={16} /> {saving ? 'Saving...' : 'Save draft'}
            </button>
          </section>

          <aside className={`rounded-3xl border p-5 shadow-lg ${darkMode ? 'border-white/10 bg-zinc-950' : 'border-black/10 bg-white'}`}>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800">Metadata</p>
            <dl className={`mt-5 grid gap-4 text-sm ${darkMode ? 'text-stone-300' : 'text-zinc-700'}`}>
              <div><dt className="font-black">Type</dt><dd>{writing.resource_type_detail?.name || 'Not set'}</dd></div>
              <div><dt className="font-black">Reading time</dt><dd>{writing.reading_time_minutes || writing.readingTimeMinutes || 0} minutes</dd></div>
              <div><dt className="font-black">Last updated</dt><dd>{writing.updated_at ? new Date(writing.updated_at).toLocaleDateString() : 'Not available'}</dd></div>
            </dl>
            <div className="mt-8 grid gap-3">
              <button className="inline-flex items-center justify-center gap-2 rounded-full border border-red-900/20 px-4 py-3 text-sm font-black text-red-800 disabled:opacity-50" disabled={!canUploadMedia(auth.permissions)} type="button">
                <ImagePlus size={16} /> Upload Image
              </button>
              <button className="rounded-full border border-black/10 px-4 py-3 text-sm font-black disabled:opacity-50" disabled={!canUploadMedia(auth.permissions)} type="button">
                Choose Existing
              </button>
              <button className="rounded-full border border-black/10 px-4 py-3 text-sm font-black disabled:opacity-50" disabled={!canUploadMedia(auth.permissions)} type="button">
                Replace Image
              </button>
            </div>
          </aside>
        </form>
      ) : null}

      {message ? <p className="mt-6 rounded-2xl bg-red-950/5 p-4 text-sm font-bold text-red-800">{message}</p> : null}
    </WritingStudioShell>
  );
};

export default WritingEditorPage;
