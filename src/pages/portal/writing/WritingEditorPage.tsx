import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Archive, ArrowLeft, Save, Send } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import ArticleEditor from '../../../components/portal/writing/editor/ArticleEditor';
import { createEmptyLexicalContent, normalizeLexicalContent, type LexicalContentJson } from '../../../components/portal/writing/editor/serialization';
import WritingStatusBadge from '../../../components/portal/writing/WritingStatusBadge';
import WritingStudioShell from '../../../components/portal/writing/WritingStudioShell';
import { useAuth } from '../../../hooks/useAuth';
import { useDebouncedWritingSave } from '../../../hooks/useDebouncedWritingSave';
import { useTheme } from '../../../hooks/useTheme';
import { archiveWriting, fetchWriting, publishWriting, updateWriting } from '../../../services/writingApi';
import type { Writing, WritingUpdatePayload } from '../../../types/writing';
import { canArchiveWriting, canEditAnyWriting, canEditOwnWriting, canPublishWriting } from '../../../utils/permissions';

const canEdit = (permissions: string[], writing?: Writing | null) => {
  if (!writing) return false;
  if (canEditAnyWriting(permissions)) return true;
  return canEditOwnWriting(permissions) && ['DRAFT', 'IN_REVIEW', 'SCHEDULED'].includes(writing.status);
};

const WritingEditorPage = () => {
  const { id = '' } = useParams();
  const auth = useAuth();
  const { darkMode } = useTheme();
  const [contentJson, setContentJson] = useState<LexicalContentJson>(() => createEmptyLexicalContent());
  const [excerpt, setExcerpt] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [writing, setWriting] = useState<Writing | null>(null);
  const [actionSaving, setActionSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setMessage('');
    setWriting(null);

    fetchWriting(auth.accessToken, id, controller.signal)
      .then((nextWriting) => {
        setWriting(nextWriting);
        setTitle(nextWriting.title || '');
        setExcerpt(nextWriting.excerpt || '');
        setContentJson(normalizeLexicalContent(nextWriting.content_json));
      })
      .catch((err) => {
        if (!controller.signal.aborted) setMessage(err instanceof Error ? err.message : 'Unable to load writing.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [auth.accessToken, id]);

  const editable = canEdit(auth.permissions, writing);
  const draftPayload = useMemo<WritingUpdatePayload>(() => ({
    content_json: contentJson,
    excerpt,
    title,
  }), [contentJson, excerpt, title]);

  const persistDraft = useCallback(async (payload: WritingUpdatePayload) => {
    if (!writing) return;
    const nextWriting = await updateWriting(auth.accessToken, writing.id, payload);
    setWriting(nextWriting);
  }, [auth.accessToken, writing]);

  const { saveNow, saveState } = useDebouncedWritingSave({
    enabled: editable,
    onSave: persistDraft,
    ready: Boolean(writing),
    value: draftPayload,
  });

  const runAction = async (action: 'archive' | 'publish') => {
    if (!writing) return;
    setActionSaving(true);
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
      setActionSaving(false);
    }
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    await saveNow();
  };

  const surfaceClass = darkMode
    ? 'rounded-3xl border border-white/10 bg-zinc-950 p-5 shadow-lg shadow-black/25'
    : 'rounded-3xl border border-black/10 bg-white p-5 shadow-lg shadow-zinc-900/5';
  const fieldClass = darkMode
    ? 'w-full rounded-2xl border border-white/10 bg-[#171717] px-4 py-3 text-sm text-stone-100 outline-none focus:ring-2 focus:ring-red-800/30'
    : 'w-full rounded-2xl border border-black/10 bg-[#fffaf0] px-4 py-3 text-sm text-zinc-950 outline-none focus:ring-2 focus:ring-red-800/30';
  const mutedTextClass = darkMode ? 'text-stone-400' : 'text-zinc-600';

  return (
    <WritingStudioShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link className={darkMode ? 'inline-flex items-center gap-2 text-sm font-black text-stone-300' : 'inline-flex items-center gap-2 text-sm font-black text-zinc-700'} to="/portal/writing/articles">
          <ArrowLeft size={16} /> Articles
        </Link>
        <div className="flex flex-wrap gap-2">
          {canPublishWriting(auth.permissions) ? (
            <button className={darkMode ? 'inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-stone-100 hover:bg-[#171717]' : 'inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-black text-zinc-900 shadow-sm hover:bg-[#fffaf0]'} disabled={actionSaving} onClick={() => void runAction('publish')} type="button">
              <Send size={15} /> Publish
            </button>
          ) : null}
          {canArchiveWriting(auth.permissions) ? (
            <button className="inline-flex items-center gap-2 rounded-full border border-red-900/20 px-4 py-2 text-sm font-black text-red-800" disabled={actionSaving} onClick={() => void runAction('archive')} type="button">
              <Archive size={15} /> Archive
            </button>
          ) : null}
        </div>
      </div>

      {loading ? <p className={mutedTextClass}>Loading editor...</p> : null}

      {writing ? (
        <form className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]" onSubmit={handleSave}>
          <section className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <WritingStatusBadge status={writing.status} />
              <span className={'text-sm ' + mutedTextClass}>Draft saved through the Writing Studio.</span>
            </div>
            <label className="mb-4 grid gap-2 text-sm font-bold">
              Working title
              <input className={fieldClass} disabled={!editable} maxLength={120} onChange={(event) => setTitle(event.target.value)} value={title} />
            </label>
            <ArticleEditor
              contentJson={contentJson}
              darkMode={darkMode}
              editable={editable}
              onChange={(nextContent) => setContentJson(nextContent)}
              saveState={saveState}
            />
          </section>

          <aside className={'self-start ' + surfaceClass}>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800">Document Settings</p>
            <dl className={'mt-5 grid gap-4 text-sm ' + (darkMode ? 'text-stone-300' : 'text-zinc-700')}>
              <div><dt className="font-black">Status</dt><dd className="mt-1">{writing.status.replace('_', ' ')}</dd></div>
              <div><dt className="font-black">Resource type</dt><dd className="mt-1">{writing.resource_type_detail?.name || 'Not set'}</dd></div>
              <div><dt className="font-black">Reading time</dt><dd className="mt-1">{writing.reading_time_minutes || writing.readingTimeMinutes || 0} minutes</dd></div>
              <div><dt className="font-black">Last updated</dt><dd className="mt-1">{writing.updated_at ? new Date(writing.updated_at).toLocaleString() : 'Not available'}</dd></div>
            </dl>

            <label className="mt-6 grid gap-2 text-sm font-bold">
              Public excerpt
              <textarea className={fieldClass + ' min-h-28 resize-y leading-6'} disabled={!editable} maxLength={320} onChange={(event) => setExcerpt(event.target.value)} placeholder="A short invitation to read this resource." value={excerpt} />
            </label>

            <div className={'mt-6 border-t pt-5 ' + (darkMode ? 'border-white/10' : 'border-black/10')}>
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-800 px-4 py-3 text-sm font-black text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:opacity-60" disabled={!editable || saveState === 'saving'} type="submit">
                <Save size={16} /> {saveState === 'saving' ? 'Saving...' : 'Save draft'}
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