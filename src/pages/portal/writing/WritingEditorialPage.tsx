import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PortalModal from '../../../components/portal/PortalModal';
import { portalSurface } from '../../../components/portal/portalSurface';
import WritingStudioShell from '../../../components/portal/writing/WritingStudioShell';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import {
  approveWriting,
  archiveWriting,
  createWorkflowNote,
  deleteWorkflowNote,
  fetchEditorialQueue,
  fetchWritings,
  fetchWorkflowNotes,
  publishWriting,
  returnWritingToDraft,
  submitWritingForReview,
  updateWorkflowNote,
} from '../../../services/writingApi';
import type { EditorialAction, EditorialQueueFilters, EditorialQueueItem, Writing, WritingStatus, WritingWorkflowNote } from '../../../types/writing';
import { getEditorialWritingCapabilities } from '../../../utils/permissions';

const statusLabels: Record<WritingStatus, string> = {
  ARCHIVED: 'Archived',
  DRAFT: 'Draft',
  IN_REVIEW: 'In review',
  PUBLISHED: 'Published',
  SCHEDULED: 'Scheduled',
};

const writingStatuses: WritingStatus[] = ['DRAFT', 'IN_REVIEW', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'];

const emptyStatusCounts = (): Record<WritingStatus, number> => ({
  ARCHIVED: 0,
  DRAFT: 0,
  IN_REVIEW: 0,
  PUBLISHED: 0,
  SCHEDULED: 0,
});

const formatDate = (value?: string | null) => {
  if (!value) return 'Not yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not yet';
  return new Intl.DateTimeFormat('en-KE', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

const authorLabel = (writing: EditorialQueueItem) => {
  const primary = writing.author_attributions?.find((item) => item.is_primary) || writing.author_attributions?.[0];
  return writing.author_display || writing.byline || writing.authors?.[0]?.display_name || primary?.display_name || primary?.name || (writing.is_author ? 'You' : 'Unknown author');
};

const noteAuthorLabel = (note: WritingWorkflowNote) =>
  note.author_display || note.author?.display_name || note.created_by_detail?.name || note.created_by_name || 'Editorial note';

const noteBody = (note: WritingWorkflowNote) => note.note || note.body || '';

const hasAction = (writing: EditorialQueueItem, action: EditorialAction) =>
  writing.available_actions?.includes(action) ?? false;

const WritingEditorialPage = () => {
  const auth = useAuth();
  const { darkMode } = useTheme();
  const [items, setItems] = useState<EditorialQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [message, setMessage] = useState('');
  const [queueCount, setQueueCount] = useState(0);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<WritingStatus | 'ALL'>('ALL');
  const [searchFilter, setSearchFilter] = useState('');
  const [approvingId, setApprovingId] = useState<number | string | null>(null);
  const [publishingId, setPublishingId] = useState<number | string | null>(null);
  const [archivingId, setArchivingId] = useState<number | string | null>(null);
  const [returningId, setReturningId] = useState<number | string | null>(null);
  const [submittingId, setSubmittingId] = useState<number | string | null>(null);
  const [statusCounts, setStatusCounts] = useState<Record<WritingStatus, number>>(emptyStatusCounts);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryMessage, setSummaryMessage] = useState('');
  const [recentDrafts, setRecentDrafts] = useState<Writing[]>([]);
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

  const buildQueueFilters = useCallback((page: number): EditorialQueueFilters => {
    const filters: EditorialQueueFilters = { page, page_size: 24 };
    if (statusFilter !== 'ALL') filters.status = statusFilter;
    if (searchFilter.trim()) filters.search = searchFilter.trim();
    return filters;
  }, [searchFilter, statusFilter]);

  const loadDeskSummary = useCallback(async (signal?: AbortSignal) => {
    setSummaryLoading(true);
    setSummaryMessage('');

    try {
      const pages = await Promise.all(
        writingStatuses.map((status) => fetchWritings(auth.accessToken, { page: 1, page_size: 3, status }, signal)),
      );
      const nextCounts = emptyStatusCounts();
      writingStatuses.forEach((status, index) => {
        nextCounts[status] = pages[index].count ?? pages[index].results.length;
      });
      setStatusCounts(nextCounts);
      setRecentDrafts(pages[0].results);
    } catch (err) {
      if (signal?.aborted || err instanceof DOMException && err.name === 'AbortError') return;
      setSummaryMessage('Unable to load writing status summary right now.');
    } finally {
      if (!signal?.aborted) setSummaryLoading(false);
    }
  }, [auth.accessToken]);

  const loadQueue = useCallback(async (
    signal?: AbortSignal,
    options: { append?: boolean; clearMessage?: boolean; page?: number; showLoading?: boolean; showLoadingMore?: boolean } = {},
  ) => {
    const { append = false, clearMessage = false, page: pageNumber = 1, showLoading = false, showLoadingMore = false } = options;
    if (showLoading) setLoading(true);
    if (showLoadingMore) setLoadingMore(true);
    if (clearMessage) setMessage('');

    try {
      const page = await fetchEditorialQueue(auth.accessToken, buildQueueFilters(pageNumber), signal);
      setItems((current) => (append ? [...current, ...page.results] : page.results));
      setQueueCount(page.count ?? page.results.length);
      setNextPageUrl(page.next ?? null);
      setCurrentPage(pageNumber);
    } catch (err) {
      if (signal?.aborted || err instanceof DOMException && err.name === 'AbortError') return;
      setMessage('Unable to load the editorial queue right now.');
    } finally {
      if (!signal?.aborted && showLoading) setLoading(false);
      if (!signal?.aborted && showLoadingMore) setLoadingMore(false);
    }
  }, [auth.accessToken, buildQueueFilters]);

  useEffect(() => {
    if (!canAccessEditorialQueue) {
      setLoading(false);
      setSummaryLoading(false);
      return;
    }

    const controller = new AbortController();
    void loadDeskSummary(controller.signal);
    void loadQueue(controller.signal, { clearMessage: true, page: 1, showLoading: true });

    return () => controller.abort();
  }, [canAccessEditorialQueue, loadDeskSummary, loadQueue]);

  const refreshDesk = async () => {
    await Promise.all([
      loadDeskSummary(),
      loadQueue(undefined, { clearMessage: false, page: 1, showLoading: false }),
    ]);
  };

  const handleApprove = async (writing: EditorialQueueItem) => {
    setApprovingId(writing.id);
    setMessage('');

    try {
      await approveWriting(auth.accessToken, writing.id);
      await refreshDesk();
    } catch {
      setMessage('Unable to approve this writing. Your permissions may have changed, or the writing may no longer be ready for review.');
      await loadQueue(undefined, { clearMessage: false, page: 1, showLoading: false });
    } finally {
      setApprovingId(null);
    }
  };

  const handlePublish = async (writing: EditorialQueueItem) => {
    setPublishingId(writing.id);
    setMessage('');

    try {
      await publishWriting(auth.accessToken, writing.id);
      await refreshDesk();
    } catch {
      setMessage('Unable to publish this writing right now. Your permissions may have changed, or the writing may not be ready to publish.');
      await loadQueue(undefined, { clearMessage: false, page: 1, showLoading: false });
    } finally {
      setPublishingId(null);
    }
  };

  const handleArchive = async (writing: EditorialQueueItem) => {
    if (!window.confirm('Archive this writing?')) return;
    setArchivingId(writing.id);
    setMessage('');

    try {
      await archiveWriting(auth.accessToken, writing.id);
      await refreshDesk();
    } catch {
      setMessage('Unable to archive this writing right now. Your permissions may have changed.');
      await loadQueue(undefined, { clearMessage: false, page: 1, showLoading: false });
    } finally {
      setArchivingId(null);
    }
  };

  const handleReturnToDraft = async (writing: EditorialQueueItem) => {
    setReturningId(writing.id);
    setMessage('');

    try {
      await returnWritingToDraft(auth.accessToken, writing.id);
      await refreshDesk();
    } catch {
      setMessage('Unable to return this writing to draft. It may already have changed state, or your permissions may have changed.');
      await loadQueue(undefined, { clearMessage: false, page: 1, showLoading: false });
    } finally {
      setReturningId(null);
    }
  };

  const handleSubmitForReview = async (writing: EditorialQueueItem) => {
    setSubmittingId(writing.id);
    setMessage('');

    try {
      await submitWritingForReview(auth.accessToken, writing.id);
      await refreshDesk();
    } catch {
      setMessage('Unable to submit this writing for review. It may already have changed state, or your permissions may have changed.');
      await loadQueue(undefined, { clearMessage: false, page: 1, showLoading: false });
    } finally {
      setSubmittingId(null);
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

  const handleLoadMore = async () => {
    if (!nextPageUrl || loadingMore) return;
    await loadQueue(undefined, { append: true, clearMessage: false, page: currentPage + 1, showLoadingMore: true });
  };

  const groupedItems = useMemo(() => {
    const groups: Array<{ key: string; title: string; description: string; items: EditorialQueueItem[] }> = [
      { key: 'in_review', title: 'In review', description: 'Submitted writings waiting for editorial attention.', items: [] },
      { key: 'drafts_actionable', title: 'Drafts I can publish/review', description: 'Drafts where your permissions allow the next editorial step.', items: [] },
      { key: 'scheduled', title: 'Scheduled', description: 'Approved writings already waiting for publication time.', items: [] },
      { key: 'recent', title: 'Recently reviewed or published', description: 'Recently handled items still visible in the queue.', items: [] },
      { key: 'other', title: 'Other queue items', description: 'Additional writings returned by the editorial queue.', items: [] },
    ];
    const byKey = new Map(groups.map((group) => [group.key, group]));

    items.forEach((writing) => {
      if (writing.status === 'IN_REVIEW') byKey.get('in_review')?.items.push(writing);
      else if (writing.status === 'DRAFT' && (hasAction(writing, 'publish') || hasAction(writing, 'submit_for_review') || hasAction(writing, 'edit'))) byKey.get('drafts_actionable')?.items.push(writing);
      else if (writing.status === 'SCHEDULED') byKey.get('scheduled')?.items.push(writing);
      else if (writing.status === 'PUBLISHED' || writing.status === 'ARCHIVED' || writing.reviewed_at) byKey.get('recent')?.items.push(writing);
      else byKey.get('other')?.items.push(writing);
    });

    return groups.filter((group) => group.items.length > 0);
  }, [items]);


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
  const compactFieldClass = darkMode
    ? 'rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-red-300/50 focus:bg-white/[0.07]'
    : 'rounded-2xl border border-[#eaded0] bg-white px-4 py-2.5 text-sm text-zinc-950 outline-none transition placeholder:text-[#9b9186] focus:border-red-800/30 focus:bg-[#fffaf0]';
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
                      <span className={`text-xs font-bold ${portalSurface.softMutedText(darkMode)}`}>{noteAuthorLabel(note)} <span aria-hidden="true">&middot;</span> {formatDate(note.created_at)}</span>
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
                        <p className="mt-3 text-sm leading-6">{noteBody(note)}</p>
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
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800">Editorial Desk</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">Track the writing workflow.</h1>
          <p className={`mt-4 max-w-3xl text-sm leading-7 sm:text-base ${portalSurface.mutedText(darkMode)}`}>
            See every writing status at a glance, then focus on submissions, scheduled work, stale drafts, and editorial notes that need action.
          </p>
        </section>

        {!canAccessEditorialQueue ? (
          <section className={`rounded-3xl border p-6 shadow-lg ${portalSurface.panel(darkMode)}`}>
            <p className="text-sm font-bold text-red-800">Editorial review requires draft, review, publishing, or archive permissions.</p>
          </section>
        ) : null}

        {canAccessEditorialQueue ? (
          <section className={`rounded-[2rem] border p-5 shadow-lg sm:p-6 ${portalSurface.panel(darkMode)}`} aria-labelledby="editorial-summary-heading">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800">Desk Summary</p>
                <h2 id="editorial-summary-heading" className="mt-2 font-serif text-3xl">Writing status landscape</h2>
              </div>
              {summaryLoading ? <span className={`rounded-full border px-3 py-1 text-xs font-bold ${darkMode ? 'border-white/10 bg-white/5 text-stone-300' : 'border-[#eaded0] bg-white text-[#786f66]'}`}>Loading counts...</span> : null}
            </div>
            {summaryMessage ? <p className="mt-4 rounded-2xl border border-red-900/15 bg-red-50 p-4 text-sm font-bold text-red-800 dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-100">{summaryMessage}</p> : null}
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {writingStatuses.map((status) => (
                <div key={status} className={`rounded-3xl border p-4 ${darkMode ? 'border-white/10 bg-white/[0.04]' : 'border-[#eaded0] bg-[#fffaf0]'}`}>
                  <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-red-800">{statusLabels[status]}</p>
                  <p className="mt-2 font-serif text-4xl leading-none">{statusCounts[status]}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {canAccessEditorialQueue && recentDrafts.length ? (
          <section className={`rounded-[2rem] border p-5 shadow-lg sm:p-6 ${portalSurface.panel(darkMode)}`} aria-labelledby="recent-drafts-heading">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800">Recently Updated Drafts</p>
                <h2 id="recent-drafts-heading" className="mt-2 font-serif text-3xl">Drafts editors may need to watch</h2>
              </div>
              <Link className={actionButtonClass} to="/portal/writing/articles?status=DRAFT">View drafts</Link>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {recentDrafts.map((draft) => (
                <Link key={draft.id} to={`/portal/writing/${draft.id}`} className={`rounded-3xl border p-4 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 ${darkMode ? 'border-white/10 bg-white/[0.04] hover:bg-white/[0.07]' : 'border-[#eaded0] bg-[#fffaf0] hover:bg-white'}`}>
                  <span className={statusBadgeClass('DRAFT')}>Draft</span>
                  <h3 className="mt-3 font-serif text-2xl leading-tight">{draft.title || 'Untitled Article'}</h3>
                  <p className={`mt-2 text-xs ${portalSurface.softMutedText(darkMode)}`}>Updated <span aria-hidden="true">&middot;</span> {formatDate(draft.updated_at || draft.created_at)}</p>
                </Link>
              ))}
            </div>
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
                <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800">Needs Attention</p>
                <h2 className="mt-2 font-serif text-3xl">Workflow queue</h2>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${darkMode ? 'border-white/10 bg-white/5 text-stone-300' : 'border-[#eaded0] bg-white text-[#786f66]'}`}>{items.length} of {queueCount} writings</span>
            </div>

            <div className={`mt-5 grid gap-3 rounded-3xl border p-4 sm:grid-cols-[minmax(0,1fr)_14rem] ${darkMode ? 'border-white/10 bg-white/[0.03]' : 'border-[#eaded0] bg-[#fffaf0]'}`}>
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.14em] text-red-800" htmlFor="editorial-search-filter">
                Search
                <input
                  className={compactFieldClass}
                  id="editorial-search-filter"
                  onChange={(event) => setSearchFilter(event.target.value)}
                  placeholder="Search title, author, or note..."
                  type="search"
                  value={searchFilter}
                />
              </label>
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.14em] text-red-800" htmlFor="editorial-status-filter">
                Status
                <select
                  className={compactFieldClass}
                  id="editorial-status-filter"
                  onChange={(event) => setStatusFilter(event.target.value as WritingStatus | 'ALL')}
                  value={statusFilter}
                >
                  <option value="ALL">All statuses</option>
                  <option value="DRAFT">Draft</option>
                  <option value="IN_REVIEW">In review</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </label>
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

            {!loading && groupedItems.length ? (
              <div className="mt-6 grid gap-5">
                {groupedItems.map((group) => (
                  <section key={group.key} className="grid gap-3">
                    <div>
                      <h3 className="font-serif text-2xl">{group.title}</h3>
                      <p className={`mt-1 text-sm ${portalSurface.softMutedText(darkMode)}`}>{group.description}</p>
                    </div>
                    {group.items.map((writing) => {
                      const capabilities = getEditorialWritingCapabilities({ id: auth.user?.id, permissions: auth.permissions }, writing);
                      return (
                        <article key={writing.id} className={`rounded-3xl border p-5 ${darkMode ? 'border-white/10 bg-white/[0.04]' : 'border-[#eaded0] bg-white shadow-sm shadow-zinc-900/5'}`}>
                          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={statusBadgeClass(writing.status)}>{statusLabels[writing.status]}</span>
                                {capabilities.isAuthor ? <span className={darkMode ? 'rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-stone-300' : 'rounded-full border border-[#eaded0] bg-[#fffaf0] px-3 py-1 text-xs font-bold text-[#786f66]'}>Your writing</span> : null}
                              </div>
                              <h4 className="mt-3 font-serif text-3xl leading-tight">{writing.title}</h4>
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
                                  <p className="mt-2 text-sm leading-6">{noteBody(writing.latest_workflow_note)}</p>
                                  <p className={`mt-2 text-xs ${portalSurface.softMutedText(darkMode)}`}>{noteAuthorLabel(writing.latest_workflow_note)} <span aria-hidden="true">&middot;</span> {formatDate(writing.latest_workflow_note.created_at)}</p>
                                </div>
                              ) : null}
                            </div>

                            <div className="flex shrink-0 flex-wrap gap-2 lg:max-w-56 lg:justify-end">
                              {hasAction(writing, 'open') || hasAction(writing, 'edit') ? <Link className={actionButtonClass} to={`/portal/writing/${writing.id}`}>Open</Link> : null}
                              {hasAction(writing, 'edit') ? <Link className={actionButtonClass} to={`/portal/writing/${writing.id}`}>Edit</Link> : null}
                              <button className={actionButtonClass} onClick={() => void openNotes(writing)} type="button">View notes</button>
                              {hasAction(writing, 'submit_for_review') ? <button className={actionButtonClass} disabled={String(submittingId) === String(writing.id)} onClick={() => void handleSubmitForReview(writing)} type="button">{String(submittingId) === String(writing.id) ? 'Submitting...' : 'Submit for review'}</button> : null}
                              {hasAction(writing, 'approve') ? <button className={actionButtonClass} disabled={String(approvingId) === String(writing.id)} onClick={() => void handleApprove(writing)} type="button">{String(approvingId) === String(writing.id) ? 'Approving...' : 'Approve'}</button> : null}
                              {hasAction(writing, 'return_to_draft') ? <button className={actionButtonClass} disabled={String(returningId) === String(writing.id)} onClick={() => void handleReturnToDraft(writing)} type="button">{String(returningId) === String(writing.id) ? 'Returning...' : 'Return to draft'}</button> : null}
                              {hasAction(writing, 'publish') ? <button className={actionButtonClass} disabled={String(publishingId) === String(writing.id)} onClick={() => void handlePublish(writing)} type="button">{String(publishingId) === String(writing.id) ? 'Publishing...' : 'Publish'}</button> : null}
                              {hasAction(writing, 'archive') ? <button className={actionButtonClass} disabled={String(archivingId) === String(writing.id)} onClick={() => void handleArchive(writing)} type="button">{String(archivingId) === String(writing.id) ? 'Archiving...' : 'Archive'}</button> : null}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </section>
                ))}
                {nextPageUrl ? (
                  <div className="flex justify-center pt-2">
                    <button className={actionButtonClass} disabled={loadingMore} onClick={() => void handleLoadMore()} type="button">{loadingMore ? 'Loading...' : 'Load more'}</button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>
        ) : null}
      </div>
    </WritingStudioShell>
  );
};

export default WritingEditorialPage;
