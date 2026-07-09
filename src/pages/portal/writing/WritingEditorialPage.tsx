import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { portalSurface } from '../../../components/portal/portalSurface';
import WritingStudioShell from '../../../components/portal/writing/WritingStudioShell';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import { approveWriting, fetchEditorialQueue } from '../../../services/writingApi';
import type { EditorialQueueItem, WritingStatus } from '../../../types/writing';
import { getEditorialWritingCapabilities } from '../../../utils/permissions';

const statusLabels: Record<WritingStatus, string> = {
  ARCHIVED: 'Archived',
  DRAFT: 'Draft',
  IN_REVIEW: 'In review',
  PUBLISHED: 'Published',
  SCHEDULED: 'Scheduled',
};

const formatDate = (value?: string | null) => {
  if (!value) return 'Not yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not yet';
  return new Intl.DateTimeFormat('en-KE', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

const authorLabel = (writing: EditorialQueueItem) => {
  const primary = writing.author_attributions?.find((item) => item.is_primary) || writing.author_attributions?.[0];
  return primary?.display_name || primary?.name || (writing.is_author ? 'You' : 'Unknown author');
};

const noteAuthorLabel = (note: NonNullable<EditorialQueueItem['latest_workflow_note']>) =>
  note.created_by_detail?.name || note.created_by_name || 'Editorial note';

const WritingEditorialPage = () => {
  const auth = useAuth();
  const { darkMode } = useTheme();
  const [items, setItems] = useState<EditorialQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [approvingId, setApprovingId] = useState<number | string | null>(null);

  const canAccessEditorialQueue = useMemo(
    () => auth.permissions.some((permission) => [
      'writings.view_any_draft_writing',
      'writings.view_own_draft_writing',
      'writings.edit_any_writing',
      'writings.edit_own_writing',
      'writings.review_writing',
      'writings.publish_writing',
      'writings.archive_writing',
    ].includes(permission)),
    [auth.permissions],
  );

  const loadQueue = useCallback(async (signal?: AbortSignal, options: { clearMessage?: boolean; showLoading?: boolean } = {}) => {
    const { clearMessage = false, showLoading = false } = options;
    if (showLoading) setLoading(true);
    if (clearMessage) setMessage('');

    try {
      const page = await fetchEditorialQueue(auth.accessToken, { page: 1, page_size: 24 }, signal);
      setItems(page.results);
    } catch (err) {
      if (signal?.aborted || err instanceof DOMException && err.name === 'AbortError') return;
      setMessage('Unable to load the editorial queue right now.');
    } finally {
      if (!signal?.aborted && showLoading) setLoading(false);
    }
  }, [auth.accessToken]);

  useEffect(() => {
    if (!canAccessEditorialQueue) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    void loadQueue(controller.signal, { clearMessage: true, showLoading: true });

    return () => controller.abort();
  }, [canAccessEditorialQueue, loadQueue]);

  const handleApprove = async (writing: EditorialQueueItem) => {
    setApprovingId(writing.id);
    setMessage('');

    try {
      await approveWriting(auth.accessToken, writing.id);
      await loadQueue(undefined, { clearMessage: false, showLoading: false });
    } catch {
      setMessage('Unable to approve this writing. Your permissions may have changed, or the writing may no longer be ready for review.');
      await loadQueue(undefined, { clearMessage: false, showLoading: false });
    } finally {
      setApprovingId(null);
    }
  };

  const statusBadgeClass = (status: WritingStatus) => {
    const base = 'rounded-full border px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.14em]';
    if (status === 'IN_REVIEW') return `${base} ${darkMode ? 'border-amber-300/20 bg-amber-300/10 text-amber-100' : 'border-amber-700/15 bg-amber-50 text-amber-800'}`;
    if (status === 'SCHEDULED') return `${base} ${darkMode ? 'border-blue-300/20 bg-blue-300/10 text-blue-100' : 'border-blue-700/15 bg-blue-50 text-blue-800'}`;
    if (status === 'PUBLISHED') return `${base} ${darkMode ? 'border-green-400/20 bg-green-400/10 text-green-200' : 'border-green-700/15 bg-green-50 text-green-800'}`;
    if (status === 'ARCHIVED') return `${base} ${darkMode ? 'border-white/10 bg-white/5 text-stone-400' : 'border-[#eaded0] bg-[#fffaf0] text-[#786f66]'}`;
    return `${base} ${darkMode ? 'border-red-400/20 bg-red-950/30 text-red-200' : 'border-red-900/15 bg-red-50 text-red-800'}`;
  };

  const actionButtonClass = darkMode
    ? 'rounded-full border border-white/10 px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.12em] text-stone-200 transition hover:bg-white/10 disabled:opacity-40'
    : 'rounded-full border border-[#eaded0] px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.12em] text-[#5f574f] transition hover:bg-[#fffaf0] disabled:opacity-40';

  return (
    <WritingStudioShell>
      <div className="grid gap-8">
        <section className={`rounded-[2rem] border p-6 shadow-lg sm:p-8 ${portalSurface.panel(darkMode)}`}>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800">Editorial Workflow</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">Review what needs attention.</h1>
          <p className={`mt-4 max-w-3xl text-sm leading-7 sm:text-base ${portalSurface.mutedText(darkMode)}`}>
            Track submitted writings, review context, and editorial notes from the dedicated workflow queue.
          </p>
        </section>

        {!canAccessEditorialQueue ? (
          <section className={`rounded-3xl border p-6 shadow-lg ${portalSurface.panel(darkMode)}`}>
            <p className="text-sm font-bold text-red-800">Editorial review requires draft, review, publishing, or archive permissions.</p>
          </section>
        ) : null}

        {message ? (
          <section className="rounded-3xl border border-red-900/15 bg-red-50 p-6 text-sm font-bold text-red-800 dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-100">
            {message}
          </section>
        ) : null}

        {canAccessEditorialQueue ? (
          <section className={`rounded-[2rem] border p-5 shadow-lg sm:p-6 ${portalSurface.panel(darkMode)}`}>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800">Review Queue</p>
                <h2 className="mt-2 font-serif text-3xl">Editorial desk</h2>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${darkMode ? 'border-white/10 bg-white/5 text-stone-300' : 'border-[#eaded0] bg-white text-[#786f66]'}`}>{items.length} writings</span>
            </div>

            {loading ? (
              <div className="mt-6 grid gap-3">
                {[0, 1, 2].map((item) => <div key={item} className={`h-28 animate-pulse rounded-3xl border ${darkMode ? 'border-white/10 bg-white/[0.04]' : 'border-[#eaded0] bg-white/70'}`} />)}
              </div>
            ) : null}

            {!loading && !message && items.length === 0 ? (
              <div className={`mt-6 rounded-3xl border p-8 text-center ${darkMode ? 'border-white/10 bg-white/[0.03]' : 'border-[#eaded0] bg-white'}`}>
                <h3 className="font-serif text-3xl">No writings need editorial attention.</h3>
                <p className={`mx-auto mt-3 max-w-xl text-sm leading-6 ${portalSurface.softMutedText(darkMode)}`}>
                  When writings are submitted for review or need publishing attention, they will appear here.
                </p>
              </div>
            ) : null}

            {!loading && items.length ? (
              <div className="mt-6 grid gap-3">
                {items.map((writing) => {
                  const capabilities = getEditorialWritingCapabilities({ id: auth.user?.id, permissions: auth.permissions }, writing);
                  return (
                    <article key={writing.id} className={`rounded-3xl border p-5 ${darkMode ? 'border-white/10 bg-white/[0.04]' : 'border-[#eaded0] bg-white shadow-sm shadow-zinc-900/5'}`}>
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={statusBadgeClass(writing.status)}>{statusLabels[writing.status]}</span>
                            {capabilities.isAuthor ? <span className={darkMode ? 'rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-stone-300' : 'rounded-full border border-[#eaded0] bg-[#fffaf0] px-3 py-1 text-xs font-bold text-[#786f66]'}>Your writing</span> : null}
                          </div>
                          <h3 className="mt-3 font-serif text-3xl leading-tight">{writing.title}</h3>
                          <p className={`mt-2 text-sm ${portalSurface.softMutedText(darkMode)}`}>By {authorLabel(writing)}</p>

                          <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                              <dt className="font-black uppercase tracking-[0.12em] text-red-800">Submitted</dt>
                              <dd className={portalSurface.softMutedText(darkMode)}>{formatDate(writing.submitted_at)}</dd>
                            </div>
                            <div>
                              <dt className="font-black uppercase tracking-[0.12em] text-red-800">Reviewed</dt>
                              <dd className={portalSurface.softMutedText(darkMode)}>{formatDate(writing.reviewed_at)}</dd>
                            </div>
                            <div>
                              <dt className="font-black uppercase tracking-[0.12em] text-red-800">Notes</dt>
                              <dd className={portalSurface.softMutedText(darkMode)}>{writing.workflow_notes_count ?? 0} notes</dd>
                            </div>
                          </dl>

                          {writing.latest_workflow_note ? (
                            <div className={`mt-4 rounded-2xl border p-4 ${darkMode ? 'border-white/10 bg-black/20' : 'border-[#eaded0] bg-[#fffaf0]'}`}>
                              <p className="text-xs font-black uppercase tracking-[0.14em] text-red-800">Latest note</p>
                              <p className="mt-2 text-sm leading-6">{writing.latest_workflow_note.note}</p>
                              <p className={`mt-2 text-xs ${portalSurface.softMutedText(darkMode)}`}>{noteAuthorLabel(writing.latest_workflow_note)} ? {formatDate(writing.latest_workflow_note.created_at)}</p>
                            </div>
                          ) : null}
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2 lg:max-w-56 lg:justify-end">
                          <Link className={actionButtonClass} to={`/portal/writing/${writing.id}`}>Open</Link>
                          {capabilities.canEdit ? <Link className={actionButtonClass} to={`/portal/writing/${writing.id}`}>Edit</Link> : null}
                          {capabilities.canReview ? <button className={actionButtonClass} disabled={String(approvingId) === String(writing.id)} onClick={() => void handleApprove(writing)} type="button">{String(approvingId) === String(writing.id) ? 'Approving...' : 'Approve'}</button> : null}
                          {capabilities.canPublish ? <button className={actionButtonClass} type="button">Publish</button> : null}
                          {capabilities.canArchive ? <button className={actionButtonClass} type="button">Archive</button> : null}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : null}
          </section>
        ) : null}
      </div>
    </WritingStudioShell>
  );
};

export default WritingEditorialPage;
