import { CalendarDays, ExternalLink, Plus, Search, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import MemorialPortalShell, { MemorialPortalEmptyState } from '../../../components/portal/memorials/MemorialPortalShell';
import PortalModal from '../../../components/portal/PortalModal';
import { usePortalToast } from '../../../components/portal/PortalToast';
import { portalSurface } from '../../../components/portal/portalSurface';
import { createMemorialPublicRoute } from '../../../api/memorialPublic';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import {
  createMemorialPage,
  fetchMemorialPages,
} from '../../../services/memorialApi';
import type { MemorialPage, MemorialWorkflowStatus } from '../../../types/memorial';
import { MEMORIAL_WORKFLOW_STATUSES, getMemorialStatusLabel, isPubliclyVisibleMemorialRecord } from '../../../utils/memorialWorkflow';

const PAGE_SIZE = 24;
const statuses: Array<MemorialWorkflowStatus | 'ALL'> = ['ALL', ...MEMORIAL_WORKFLOW_STATUSES];

const readStatusParam = (value: string | null): MemorialWorkflowStatus | 'ALL' =>
  value && statuses.includes(value as MemorialWorkflowStatus | 'ALL')
    ? value as MemorialWorkflowStatus | 'ALL'
    : 'ALL';

const appendUniqueMemorials = (current: MemorialPage[], next: MemorialPage[]) => {
  const seen = new Set(current.map((item) => String(item.id)));
  return [
    ...current,
    ...next.filter((item) => {
      const key = String(item.id);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }),
  ];
};

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const formatDate = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const statusClass = (status: MemorialWorkflowStatus, darkMode: boolean) => {
  if (status === 'PUBLISHED') {
    return darkMode
      ? 'border-emerald-400/20 bg-emerald-950/30 text-emerald-200'
      : 'border-emerald-800/15 bg-emerald-50 text-emerald-800';
  }
  if (status === 'ARCHIVED') {
    return darkMode
      ? 'border-white/10 bg-white/5 text-stone-300'
      : 'border-black/10 bg-zinc-100 text-zinc-700';
  }
  if (status === 'APPROVED') {
    return darkMode
      ? 'border-sky-400/20 bg-sky-950/25 text-sky-200'
      : 'border-sky-800/15 bg-sky-50 text-sky-800';
  }
  return 'border-red-900/15 bg-red-950/[0.04] text-red-800 dark:border-red-200/20 dark:bg-red-950/25 dark:text-red-100';
};

const MemorialStatusPill = ({
  darkMode,
  status,
}: {
  darkMode: boolean;
  status: MemorialWorkflowStatus;
}) => (
  <span className={`inline-flex min-h-7 items-center rounded-full border px-3 text-[0.68rem] font-black uppercase tracking-[0.14em] ${statusClass(status, darkMode)}`}>
    {getMemorialStatusLabel(status)}
  </span>
);

const MemorialPageCard = ({
  darkMode,
  memorial,
}: {
  darkMode: boolean;
  memorial: MemorialPage;
}) => {
  const dateRange = [formatDate(memorial.birth_date), formatDate(memorial.death_date)]
    .filter(Boolean)
    .join(' - ');
  const canOpenPublicPage = isPubliclyVisibleMemorialRecord(memorial);
  const publicMemorialHref = createMemorialPublicRoute(memorial.slug);

  return (
    <article className={`rounded-[1.5rem] border p-4 shadow-lg sm:rounded-3xl sm:p-5 ${portalSurface.card(darkMode)}`}>
      <div className="flex items-start justify-between gap-4">
        <MemorialStatusPill darkMode={darkMode} status={memorial.status} />
        {memorial.is_visible ? (
          <span className="text-xs font-black uppercase tracking-[0.14em] text-red-800">
            Visible
          </span>
        ) : null}
      </div>
      <h3 className="mt-5 font-serif text-xl leading-tight sm:text-2xl">
        {memorial.full_name || 'Untitled memorial'}
      </h3>
      {memorial.role_title ? (
        <p className={`mt-2 text-sm font-bold ${portalSurface.softMutedText(darkMode)}`}>
          {memorial.role_title}
        </p>
      ) : null}
      <p className={`mt-4 line-clamp-3 text-sm leading-6 ${portalSurface.softMutedText(darkMode)}`}>
        {memorial.summary || 'No summary has been added yet.'}
      </p>
      <div className={`mt-5 grid gap-2 text-xs ${portalSurface.softMutedText(darkMode)}`}>
        {dateRange ? (
          <span className="inline-flex items-center gap-2">
            <CalendarDays size={14} aria-hidden="true" />
            {dateRange}
          </span>
        ) : null}
        <span className="inline-flex min-w-0 items-center gap-2 break-all">
          <UserRound size={14} aria-hidden="true" />
          {memorial.slug}
        </span>
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-red-800 px-5 text-sm font-black text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-700 sm:w-auto"
          to={`/portal/memorials/${memorial.id}`}
        >
          Open editor
        </Link>
        {canOpenPublicPage ? (
          <Link
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-red-900/20 px-5 text-sm font-black text-red-800 transition hover:-translate-y-0.5 hover:bg-red-950/5 focus:outline-none focus:ring-2 focus:ring-red-700 dark:border-red-200/20 dark:text-red-100 dark:hover:bg-white/10 sm:w-auto"
            rel="noreferrer"
            target="_blank"
            to={publicMemorialHref}
          >
            View public page
            <ExternalLink size={15} aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </article>
  );
};

type CreateMemorialModalProps = {
  darkMode: boolean;
  onClose: () => void;
  onCreated: (page: MemorialPage) => void;
};

const CreateMemorialModal = ({
  darkMode,
  onClose,
  onCreated,
}: CreateMemorialModalProps) => {
  const auth = useAuth();
  const navigate = useNavigate();
  const toast = usePortalToast();
  const [fullName, setFullName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const fieldClass = darkMode
    ? 'border-white/10 bg-[#171717] text-stone-100 placeholder:text-stone-500'
    : 'border-[#eaded0] bg-white text-zinc-950 placeholder:text-[#8a7d70]';
  const mutedTextClass = portalSurface.softMutedText(darkMode);

  const updateFullName = (value: string) => {
    setFullName(value);
    if (!slugEdited) setSlug(slugify(value));
  };

  const createShell = async () => {
    const trimmedName = fullName.trim();
    const trimmedSlug = slugify(slug || trimmedName);
    if (!trimmedName || !trimmedSlug) {
      toast.error('Add a full name before creating the memorial shell.');
      return;
    }

    setSaving(true);
    try {
      const created = await createMemorialPage(auth.accessToken, {
        full_name: trimmedName,
        is_visible: false,
        role_title: roleTitle.trim(),
        slug: trimmedSlug,
        status: 'DRAFT',
      });
      onCreated(created);
      toast.success('Memorial shell created.');
      onClose();
      navigate(`/portal/memorials/${created.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to create memorial shell.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PortalModal
      darkMode={darkMode}
      description="Start with the page identity. Rich sections, tributes, gallery, recordings, and arrangements come next."
      eyebrow="New memorial"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <button
            className={darkMode ? 'w-full rounded-full border border-white/10 px-5 py-3 text-sm font-bold text-stone-200 transition hover:bg-white/10 sm:w-auto' : 'w-full rounded-full border border-[#eaded0] bg-white px-5 py-3 text-sm font-bold text-zinc-700 transition hover:bg-[#fffaf0] sm:w-auto'}
            disabled={saving}
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-red-800 px-6 text-sm font-black text-white shadow-lg shadow-red-950/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            disabled={saving}
            onClick={() => void createShell()}
            type="button"
          >
            {saving ? 'Creating...' : 'Create shell'}
          </button>
        </div>
      }
      onClose={onClose}
      title="Create memorial shell"
    >
      <div className="grid gap-5">
        <label className="grid gap-2 text-sm font-bold">
          Full name
          <input
            autoFocus
            className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-red-800/25 ${fieldClass}`}
            maxLength={140}
            onChange={(event) => updateFullName(event.target.value)}
            placeholder="Rev. Jane Doe"
            value={fullName}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Role or title
          <input
            className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-red-800/25 ${fieldClass}`}
            maxLength={140}
            onChange={(event) => setRoleTitle(event.target.value)}
            placeholder="LCC Chairperson, Elder, Pastor..."
            value={roleTitle}
          />
          <span className={`text-xs font-normal ${mutedTextClass}`}>
            Optional. This appears below the person&apos;s name in cards and page headers.
          </span>
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Slug
          <input
            className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-red-800/25 ${fieldClass}`}
            maxLength={160}
            onChange={(event) => {
              setSlugEdited(true);
              setSlug(slugify(event.target.value));
            }}
            placeholder="rev-jane-doe"
            value={slug}
          />
          <span className={`text-xs font-normal ${mutedTextClass}`}>
            Used for the future public memorial URL.
          </span>
        </label>
      </div>
    </PortalModal>
  );
};

const MemorialPortalPage = () => {
  const auth = useAuth();
  const { darkMode } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [createOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState('');
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [memorials, setMemorials] = useState<MemorialPage[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState<MemorialWorkflowStatus | 'ALL'>(() =>
    readStatusParam(searchParams.get('status')),
  );

  useEffect(() => {
    const nextStatus = readStatusParam(searchParams.get('status'));
    const nextSearch = searchParams.get('search') || '';
    setStatus((current) => current === nextStatus ? current : nextStatus);
    setSearch((current) => current === nextSearch ? current : nextSearch);
    setPage(1);
  }, [searchParams]);

  const updateFilters = (next: { search?: string; status?: MemorialWorkflowStatus | 'ALL' }) => {
    const nextSearch = next.search ?? search;
    const nextStatus = next.status ?? status;
    setPage(1);
    setSearchParams((current) => {
      const params = new URLSearchParams(current);
      if (nextSearch.trim()) params.set('search', nextSearch.trim());
      else params.delete('search');
      if (nextStatus === 'ALL') params.delete('status');
      else params.set('status', nextStatus);
      return params;
    });
  };

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    fetchMemorialPages(auth.accessToken, {
      page,
      page_size: PAGE_SIZE,
      search,
      status,
    }, controller.signal)
      .then((resultPage) => {
        setMemorials((current) =>
          page === 1
            ? resultPage.results
            : appendUniqueMemorials(current, resultPage.results),
        );
        setHasNextPage(Boolean(resultPage.next));
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Unable to load memorial pages.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [auth.accessToken, page, search, status]);

  const loadingMore = loading && page > 1;
  const actions = (
    <button
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-red-800 px-5 text-sm font-black text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-700"
      onClick={() => setCreateOpen(true)}
      type="button"
    >
      <Plus size={16} aria-hidden="true" />
      New Memorial
    </button>
  );

  return (
    <MemorialPortalShell actions={actions}>
      <section className={`rounded-[1.5rem] border p-3 shadow-lg sm:rounded-3xl sm:p-4 ${portalSurface.panel(darkMode)}`}>
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <label className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${darkMode ? 'border-white/10 bg-white/5' : 'border-[#eaded0] bg-white'}`}>
            <Search size={18} aria-hidden="true" />
            <input
              className="w-full bg-transparent text-sm outline-none"
              onChange={(event) => updateFilters({ search: event.target.value })}
              placeholder="Search memorial pages"
              value={search}
            />
          </label>
          <select
            aria-label="Memorial status"
            className={`min-h-12 rounded-2xl border px-4 py-3 text-sm font-bold outline-none ${darkMode ? 'border-white/10 bg-zinc-950 text-stone-100' : 'border-[#eaded0] bg-white text-zinc-900'}`}
            onChange={(event) =>
              updateFilters({ status: event.target.value as MemorialWorkflowStatus | 'ALL' })
            }
            value={status}
          >
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item === 'ALL' ? 'All statuses' : getMemorialStatusLabel(item)}
              </option>
            ))}
          </select>
          <button
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-red-900/20 px-4 text-sm font-black text-red-800 transition hover:-translate-y-0.5 hover:bg-red-950/5 dark:border-red-200/20 dark:text-red-100"
            onClick={() => setCreateOpen(true)}
            type="button"
          >
            <Plus size={16} aria-hidden="true" />
            Create
          </button>
        </div>
      </section>

      {error ? (
        <p className="mt-6 rounded-2xl bg-red-950/5 p-4 text-sm font-bold text-red-800">
          {error}
        </p>
      ) : null}
      {loading && page === 1 ? (
        <p className={`mt-8 text-sm ${portalSurface.softMutedText(darkMode)}`}>
          Loading memorial pages...
        </p>
      ) : null}
      {!loading && memorials.length === 0 ? (
        <div className="mt-8">
          <MemorialPortalEmptyState title="No memorial pages yet">
            Create the first memorial shell to begin collecting identity, written sections,
            tributes, recordings, gallery items, and arrangements.
          </MemorialPortalEmptyState>
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {memorials.map((memorial) => (
          <MemorialPageCard darkMode={darkMode} key={memorial.id} memorial={memorial} />
        ))}
      </div>

      {hasNextPage ? (
        <div className="mt-8 flex justify-center">
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-red-800 px-6 text-sm font-black text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            disabled={loadingMore}
            onClick={() => setPage((current) => current + 1)}
            type="button"
          >
            {loadingMore ? 'Loading more...' : 'Load more'}
          </button>
        </div>
      ) : null}

      {createOpen ? (
        <CreateMemorialModal
          darkMode={darkMode}
          onClose={() => setCreateOpen(false)}
          onCreated={(pageRecord) => setMemorials((current) => [pageRecord, ...current])}
        />
      ) : null}
    </MemorialPortalShell>
  );
};

export default MemorialPortalPage;