import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PortalModal from '../../../components/portal/PortalModal';
import { portalSurface } from '../../../components/portal/portalSurface';
import WritingStudioShell from '../../../components/portal/writing/WritingStudioShell';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import {
  approveWriting,
  createWorkflowNote,
  deleteWorkflowNote,
  fetchEditorialQueue,
  fetchWorkflowNotes,
  updateWorkflowNote,
} from '../../../services/writingApi';
import type { EditorialQueueItem, WritingStatus, WritingWorkflowNote } from '../../../types/writing';
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

const noteAuthorLabel = (note: WritingWorkflowNote) =>
  note.created_by_detail?.name || note.created_by_name || 'Editorial note';

const WritingEditorialPage = () => {
  const auth = useAuth();
  const { darkMode } = useTheme();
  const [items, setItems] = useState<EditorialQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [approvingId, setApprovingId] = useState<number | string | null>(null);
  const [notesWriting, setNotesWriting] = useState<EditorialQueueItem | null>(null);
  const [notes, setNotes] = useState<WritingWorkflowNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesMessage, setNotesMessage] = useState('');
  const [noteDraft, setNoteDraft] = useState('');
  const [noteActionDraft, setNoteActionDraft] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<number | string | null>(null);
  const [editingNoteDraft, setEditingNoteDraft] = useState('');
  const [editingNoteActionDraft, setEditingNoteActionDraft] = useState('');
  const [mutatingNote, setMutatingNote] = useState(false);

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

  const loadNotes = async (writingId: number | string, showLoading = true) => {
    if (showLoading) setNotesLoading(true);
    try {
      const page = await fetchWorkflowNotes(auth.accessToken, writingId);
      setNotes([...page.results].sort((left, right) => new Date(left.created_at).getTime() - new Date(right.created_at).getTime()));
    } catch {
      setNotesMessage('Unable to load editorial notes right now.');
    } finally {
      if (showLoading) setNotesLoading(false);
    }
  };

  const openNotes = async (writing: EditorialQueueItem) => {
    setNotesWriting(writing);
    setNotes([]);
    setNotesMessage('');
    setNoteDraft('');
    setNoteActionDraft('');
    setEditingNoteId(null);
    setEditingNoteDraft('');
    setEditingNoteActionDraft('');
    await loadNotes(writing.id);
  };

  const closeNotes = () => {
    setNotesWriting(null);
    setNotes([]);
    setNotesMessage('');
    setNotesLoading(false);
    setNoteDraft('');
    setNoteActionDraft('');
    setEditingNoteId(null);
    setEditingNoteDraft('');
    setEditingNoteActionDraft('');
    setMutatingNote(false);
  };

  const refreshOpenNotes = async () => {
    if (!notesWriting) return;
    await loadNotes(notesWriting.id, false);
  };

  const handleCreateNote = async () => {
    if (!notesWriting || !noteDraft.trim()) return;
    setMutatingNote(true);
    setNotesMessage('');
    try {
      await createWorkflowNote(auth.accessToken, {
        writing: notesWriting.id,
        note: noteDraft.trim(),
        ...(noteActionDraft.trim() ? { action: noteActionDraft.trim() } : {}),
      });
      setNoteDraft('');
      setNoteActionDraft('');
      await refreshOpenNotes();
    } catch {
      setNotesMessage('Unable to create workflow note right now.');
    } finally {
      setMutatingNote(false);
    }
  };

  const beginEditNote = (note: WritingWorkflowNote) => {
    setEditingNoteId(note.id);
    setEditingNoteDraft(note.note);
    setEditingNoteActionDraft(note.action || '');
    setNotesMessage('');
  };

  const cancelEditNote = () => {
    setEditingNoteId(null);
    setEditingNoteDraft('');
    setEditingNoteActionDraft('');
  };

  const handleUpdateNote = async (noteId: number | string) => {
    if (!editingNoteDraft.trim()) return;
    setMutatingNote(true);
    setNotesMessage('');
    try {
      await updateWorkflowNote(auth.accessToken, noteId, {
        note: editingNoteDraft.trim(),
        action: editingNoteActionDraft.trim(),
      });
      cancelEditNote();
      await refreshOpenNotes();
    } catch {
      setNotesMessage('Unable to update workflow note right now.');
    } finally {
      setMutatingNote(false);
    }
  };

  const handleDeleteNote = async (note: WritingWorkflowNote) => {
    if (!window.confirm('Delete this workflow note? This cannot be undone.')) return;
    setMutatingNote(true);
    setNotesMessage('');
    try {
      await deleteWorkflowNote(auth.accessToken, note.id);
      await refreshOpenNotes();
    } catch {
      setNotesMessage('Unable to delete workflow note right now.');
    } finally {
      setMutatingNote(false);
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
  const fieldClass = darkMode
    ? 'w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-red-300/50 focus:bg-white/[0.07]'
    : 'w-full rounded-2xl border border-[#eaded0] bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition placeholder:text-[#9b9186] focus:border-red-800/30 focus:bg-[#fffaf0]';
  const canManageOpenNotes = notesWriting
    ? getEditorialWritingCapabilities({ id: auth.user?.id, permissions: auth.permissions }, notesWriting).canManageNotes
    : false;

  return (
    <WritingStudioShell>
      {notesWriting ? (
        <PortalModal
          darkMode={darkMode}
          description="Read the editorial history and review context for this writing."
          eyebrow="Editorial Notes"
          onClose={closeNotes}
          title={`Notes for ${notesWriting.title}`}
        >
          <div className="grid gap-4">
            {canManageOpenNotes ? (
              <section className={`rounded-3xl border p-4 ${darkMode ? 'border-white/10 bg-white/[0.03]' : 'border-[#eaded0] bg-[#fffaf0]'}`}>
                <h3 className="text-xs font-black uppercase tracking-[0.16em] text-red-800 dark:text-red-200">Add workflow note</h3>
                <div className="mt-3 grid gap-3">
                  <input
                    className={fieldClass}
                    onChange={(event) => setNoteActionDraft(event.target.value)}
                    placeholder="Optional action label"
                    value={noteActionDraft}
                  />
                  <textarea
                    className={`${fieldClass} min-h-28 resize-y`}
                    onChange={(event) => setNoteDraft(event.target.value)}
                    placeholder="Write an editorial note..."
                    value={noteDraft}
                  />
                  <div className="flex justify-end">
                    <button
                      className={actionButtonClass}
                      disabled={mutatingNote || !noteDraft.trim()}
                      onClick={() => void handleCreateNote()}
                      type="button"
                    >
                      {mutatingNote ? 'Saving...' : 'Add note'}
                    </button>
                  </div>
                </div>
              </section>
            ) : null}
            {notesLoading ? <div className={`h-28 animate-pulse rounded-3xl border ${darkMode ? 'border-white/10 bg-white/[0.04]' : 'border-[#eaded0] bg-white/70'}`} /> : null}
            {notesMessage ? <p className="rounded-2xl border border-red-900/15 bg-red-50 p-4 text-sm font-bold text-red-800 dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-100">{notesMessage}</p> : null}
            {!notesLoading && !notesMessage && notes.length === 0 ? (
              <div className={`rounded-3xl border p-6 text-center ${darkMode ? 'border-white/10 bg-white/[0.03]' : 'border-[#eaded0] bg-[#fffaf0]'}`}>
                <h3 className="font-serif text-2xl">No editorial notes yet.</h3>
                <p className={`mt-2 text-sm ${portalSurface.softMutedText(darkMode)}`}>Notes added during review, approval, publishing, or archive actions will appear here.</p>
              </div>
            ) : null}
            {!notesLoading && notes.length ? (
              <ol className="grid gap-3">
                {notes.map((note) => (
                  <li key={note.id} className={`rounded-3xl border p-4 ${darkMode ? 'border-white/10 bg-white/[0.04]' : 'border-[#eaded0] bg-[#fffaf0]'}`}>
                    <div className="flex flex-wrap items-center gap-2">
                      {note.action ? <span className={statusBadgeClass(notesWriting.status)}>{note.action}</span> : null}
                      <span className={`text-xs font-bold ${portalSurface.softMutedText(darkMode)}`}>{noteAuthorLabel(note)}{' ? '}{formatDate(note.created_at)}</span>
                    </div>
                    {editingNoteId === note.id ? (
                      <div className="mt-3 grid gap-3">
                        <input
                          className={fieldClass}
                          onChange={(event) => setEditingNoteActionDraft(event.target.value)}
                          placeholder="Optional action label"
                          value={editingNoteActionDraft}
                        />
                        <textarea
                          className={`${fieldClass} min-h-28 resize-y`}
                          onChange={(event) => setEditingNoteDraft(event.target.value)}
                          value={editingNoteDraft}
                        />
                        <div className="flex flex-wrap justify-end gap-2">
                          <button className={actionButtonClass} disabled={mutatingNote} onClick={cancelEditNote} type="button">Cancel edit</button>
                          <button className={actionButtonClass} disabled={mutatingNote || !editingNoteDraft.trim()} onClick={() => void handleUpdateNote(note.id)} type="button">Save note</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="mt-3 text-sm leading-6">{note.note}</p>
                        {canManageOpenNotes ? (
                          <div className="mt-3 flex flex-wrap justify-end gap-2">
                            <button className={actionButtonClass} disabled={mutatingNote} onClick={() => beginEditNote(note)} type="button">Edit note</button>
                            <button className={actionButtonClass} disabled={mutatingNote} onClick={() => void handleDeleteNote(note)} type="button">Delete note</button>
                          </div>
                        ) : null}
                      </>
                    )}
                  </li>
                ))}
              </ol>
            ) : null}
            <div className="flex justify-end border-t border-[#eaded0] pt-4 dark:border-white/10">
              <button className={actionButtonClass} onClick={closeNotes} type="button">Close</button>
            </div>
          </div>
        </PortalModal>
      ) : null}
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
                              <p className={`mt-2 text-xs ${portalSurface.softMutedText(darkMode)}`}>{noteAuthorLabel(writing.latest_workflow_note)}{' ? '}{formatDate(writing.latest_workflow_note.created_at)}</p>
                            </div>
                          ) : null}
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2 lg:max-w-56 lg:justify-end">
                          <Link className={actionButtonClass} to={`/portal/writing/${writing.id}`}>Open</Link>
                          {capabilities.canEdit ? <Link className={actionButtonClass} to={`/portal/writing/${writing.id}`}>Edit</Link> : null}
                          <button className={actionButtonClass} onClick={() => void openNotes(writing)} type="button">View notes</button>
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
