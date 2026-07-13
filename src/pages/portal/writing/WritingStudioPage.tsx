import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  ClipboardList,
  FileText,
  FolderOpen,
  PenLine,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { portalSurface } from '../../../components/portal/portalSurface';
import WritingStudioShell from '../../../components/portal/writing/WritingStudioShell';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import { fetchEditorialQueue, fetchWritings } from '../../../services/writingApi';
import type { EditorialQueueItem, PaginatedResponse, Writing, WritingStatus } from '../../../types/writing';
import {
  canCreateWriting,
  canEditAnyWriting,
  canEditOwnWriting,
  canManageTaxonomy,
  canPublishWriting,
  canReviewWriting,
  canViewAnyDrafts,
} from '../../../utils/permissions';

type StudioCardProps = {
  children: React.ReactNode;
  className?: string;
  darkMode: boolean;
  to?: string;
};

type DashboardState = {
  drafts?: PaginatedResponse<Writing>;
  inReview?: PaginatedResponse<Writing>;
  published?: PaginatedResponse<Writing>;
  editorial?: PaginatedResponse<EditorialQueueItem>;
  error?: string;
  loading: boolean;
};

const initialDashboardState: DashboardState = { loading: true };

const canViewEditorial = (permissions: string[]) => canReviewWriting(permissions) || canPublishWriting(permissions) || canViewAnyDrafts(permissions);
const canEditWriting = (permissions: string[]) => canCreateWriting(permissions) || canEditOwnWriting(permissions) || canEditAnyWriting(permissions);

const statusLabel = (status: WritingStatus) => ({
  ARCHIVED: 'Archived',
  DRAFT: 'Draft',
  IN_REVIEW: 'In Review',
  PUBLISHED: 'Published',
  SCHEDULED: 'Scheduled',
})[status];

const formatRelativeDate = (value?: string | null) => {
  if (!value) return 'Recently updated';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently updated';
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.round(diffMs / 60000));
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

const StudioCard = ({ children, className = '', darkMode, to }: StudioCardProps) => {
  const classes = `rounded-3xl border p-6 shadow-lg transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 ${
    darkMode
      ? 'border-white/10 bg-zinc-950 text-stone-100 shadow-black/30 hover:bg-[#171717]'
      : 'border-[#eaded0] bg-[#fffaf0] text-zinc-950 shadow-zinc-900/5 hover:bg-white'
  } ${className}`;

  return to ? <Link to={to} className={`block ${classes}`}>{children}</Link> : <section className={classes}>{children}</section>;
};

const CardKicker = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-800">{children}</p>
);

const IconTile = ({ children, darkMode }: { children: React.ReactNode; darkMode: boolean }) => (
  <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${portalSurface.iconBadge(darkMode)}`}>{children}</span>
);

const WritingStudioPage = () => {
  const auth = useAuth();
  const { darkMode } = useTheme();
  const permissions = auth.permissions;
  const accessToken = auth.accessToken;
  const mayCreate = canCreateWriting(permissions);
  const mayEdit = canEditWriting(permissions);
  const mayManageLibrary = canManageTaxonomy(permissions);
  const mayPublish = canPublishWriting(permissions);
  const mayViewEditorial = canViewEditorial(permissions);
  const [dashboard, setDashboard] = useState<DashboardState>(initialDashboardState);

  useEffect(() => {
    if (!accessToken) {
      setDashboard({ loading: false });
      return;
    }

    const controller = new AbortController();
    const requests: Array<Promise<unknown>> = [
      fetchWritings(accessToken, { page: 1, page_size: 1, status: 'DRAFT' }, controller.signal),
      fetchWritings(accessToken, { page: 1, page_size: 1, status: 'IN_REVIEW' }, controller.signal),
      fetchWritings(accessToken, { page: 1, page_size: 1, status: 'PUBLISHED' }, controller.signal),
    ];

    if (mayViewEditorial) requests.push(fetchEditorialQueue(accessToken, { page: 1, page_size: 1 }, controller.signal));

    setDashboard((current) => ({ ...current, loading: true, error: undefined }));

    Promise.all(requests)
      .then((results) => {
        setDashboard({
          drafts: results[0] as PaginatedResponse<Writing>,
          inReview: results[1] as PaginatedResponse<Writing>,
          published: results[2] as PaginatedResponse<Writing>,
          editorial: mayViewEditorial ? results[3] as PaginatedResponse<EditorialQueueItem> : undefined,
          loading: false,
        });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setDashboard({ error: error instanceof Error ? error.message : 'Unable to load the Writing Studio dashboard right now.', loading: false });
      });

    return () => controller.abort();
  }, [accessToken, mayViewEditorial]);

  const latestDraft = dashboard.drafts?.results[0];
  const latestEditorial = dashboard.editorial?.results[0];
  const continuation = useMemo(() => {
    if (mayViewEditorial && (dashboard.editorial?.count ?? 0) > 0) {
      return {
        action: 'Review Now',
        description: latestEditorial ? `Most recent: ${latestEditorial.title}` : 'Open submitted work that needs editorial attention.',
        href: '/portal/writing/editorial',
        icon: ClipboardList,
        kicker: mayPublish ? 'Publishing' : 'Editorial',
        title: `${dashboard.editorial?.count ?? 0} item${dashboard.editorial?.count === 1 ? '' : 's'} awaiting review`,
      };
    }

    if (mayEdit && latestDraft) {
      return {
        action: 'Continue Writing',
        description: `${statusLabel(latestDraft.status)} ? ${formatRelativeDate(latestDraft.updated_at || latestDraft.created_at)}`,
        href: `/portal/writing/${latestDraft.id}`,
        icon: PenLine,
        kicker: 'Writing Studio',
        title: latestDraft.title || 'Untitled Article',
      };
    }

    return null;
  }, [dashboard.editorial?.count, latestDraft, latestEditorial, mayEdit, mayPublish, mayViewEditorial]);

  const statusRows = [
    { count: dashboard.drafts?.count ?? 0, label: 'Drafts', tone: 'bg-amber-500' },
    { count: dashboard.inReview?.count ?? 0, label: 'In Review', tone: 'bg-red-800' },
    { count: dashboard.published?.count ?? 0, label: 'Published', tone: 'bg-green-700' },
  ];

  return (
    <WritingStudioShell>
      <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid gap-8">
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.62fr)] lg:items-start">
            <StudioCard darkMode={darkMode} className="min-h-[15rem]">
              <CardKicker>Continue where you left off</CardKicker>
              {dashboard.loading ? (
                <p className={`mt-6 text-sm ${portalSurface.softMutedText(darkMode)}`}>Loading your editorial workspace...</p>
              ) : continuation ? (
                <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <IconTile darkMode={darkMode}><continuation.icon size={22} /></IconTile>
                    <div className="min-w-0">
                      <CardKicker>{continuation.kicker}</CardKicker>
                      <h2 className="mt-1 font-serif text-3xl leading-tight">{continuation.title}</h2>
                      <p className={`mt-3 text-sm leading-6 ${portalSurface.softMutedText(darkMode)}`}>{continuation.description}</p>
                    </div>
                  </div>
                  <Link to={continuation.href} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-red-800 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 focus:ring-offset-[#f8f1e7] dark:focus:ring-offset-[#080808]">
                    {continuation.action} &rarr;
                  </Link>
                </div>
              ) : (
                <div className={`mt-5 rounded-2xl border p-5 ${portalSurface.mutedSurface(darkMode)}`}>
                  <h2 className="font-serif text-2xl">You're all caught up.</h2>
                  <p className={`mt-2 text-sm leading-6 ${portalSurface.softMutedText(darkMode)}`}>Choose an area below to continue.</p>
                </div>
              )}
              {dashboard.error ? <p className="mt-4 text-sm font-bold text-red-800">{dashboard.error}</p> : null}
            </StudioCard>
          </section>

          <section aria-labelledby="overview-heading">
            <h2 id="overview-heading" className="text-xs font-black uppercase tracking-[0.18em] text-red-800">Editorial overview</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {mayEdit ? (
                <StudioCard darkMode={darkMode} to={latestDraft ? `/portal/writing/${latestDraft.id}` : mayCreate ? '/portal/writing/new' : '/portal/writing/articles?status=DRAFT'}>
                  <div className="flex items-start gap-4">
                    <IconTile darkMode={darkMode}><PenLine size={21} /></IconTile>
                    <div>
                      <CardKicker>Continue Writing</CardKicker>
                      <h3 className="mt-2 text-xl font-black">{latestDraft?.title || 'No active draft'}</h3>
                      <p className={`mt-3 text-sm leading-6 ${portalSurface.softMutedText(darkMode)}`}>
                        {latestDraft ? `${statusLabel(latestDraft.status)} ? ${formatRelativeDate(latestDraft.updated_at || latestDraft.created_at)}` : "Start a new article when you're ready."}
                      </p>
                      <span className="mt-5 inline-flex text-sm font-black text-red-800">{latestDraft ? 'Continue Writing' : 'Create New'} &rarr;</span>
                    </div>
                  </div>
                </StudioCard>
              ) : null}

              {mayCreate ? (
                <StudioCard darkMode={darkMode} to="/portal/writing/new">
                  <div className="flex items-start gap-4">
                    <IconTile darkMode={darkMode}><Send size={21} /></IconTile>
                    <div>
                      <CardKicker>New Article</CardKicker>
                      <h3 className="mt-2 text-xl font-black">Start a resource</h3>
                      <p className={`mt-3 text-sm leading-6 ${portalSurface.softMutedText(darkMode)}`}>Begin a devotional, Bible study, pastoral letter, guide, or ministry charter.</p>
                      <span className="mt-5 inline-flex text-sm font-black text-red-800">Create New &rarr;</span>
                    </div>
                  </div>
                </StudioCard>
              ) : null}

              <StudioCard darkMode={darkMode} to="/portal/writing/articles">
                <div className="flex items-start gap-4">
                  <IconTile darkMode={darkMode}><FileText size={21} /></IconTile>
                  <div className="min-w-0 flex-1">
                    <CardKicker>{canViewAnyDrafts(permissions) ? 'All Articles' : 'Your Articles'}</CardKicker>
                    <div className="mt-4 grid gap-3">
                      {statusRows.map((row) => row.count > 0 ? (
                        <div key={row.label} className="flex items-center justify-between gap-4 text-sm">
                          <span className="inline-flex items-center gap-2"><span className={`size-2 rounded-full ${row.tone}`} />{row.label}</span>
                          <span className="font-black">{row.count}</span>
                        </div>
                      ) : null)}
                      {!statusRows.some((row) => row.count > 0) ? <p className={`text-sm leading-6 ${portalSurface.softMutedText(darkMode)}`}>Article status counts will appear here as writings are created.</p> : null}
                    </div>
                    <span className="mt-5 inline-flex text-sm font-black text-red-800">View Articles &rarr;</span>
                  </div>
                </div>
              </StudioCard>

              <StudioCard darkMode={darkMode} to={mayManageLibrary ? '/portal/writing/library' : '/resources'}>
                <div className="flex items-start gap-4">
                  <IconTile darkMode={darkMode}><FolderOpen size={21} /></IconTile>
                  <div>
                    <CardKicker>Library</CardKicker>
                    <h3 className="mt-2 text-xl font-black">{mayManageLibrary ? 'Curate discovery' : 'Browse resources'}</h3>
                    <p className={`mt-3 text-sm leading-6 ${portalSurface.softMutedText(darkMode)}`}>
                      {mayManageLibrary ? 'Organize resource types, categories, series, and tags.' : 'Browse published resources and collections.'}
                    </p>
                    <span className="mt-5 inline-flex text-sm font-black text-red-800">{mayManageLibrary ? 'Open Library' : 'Browse Resources'} &rarr;</span>
                  </div>
                </div>
              </StudioCard>

              {mayViewEditorial ? (
                <StudioCard darkMode={darkMode} to="/portal/writing/editorial">
                  <div className="flex items-start gap-4">
                    <IconTile darkMode={darkMode}><ShieldCheck size={21} /></IconTile>
                    <div>
                      <CardKicker>Editorial</CardKicker>
                      <h3 className="mt-2 text-xl font-black">Review queue</h3>
                      <p className={`mt-3 text-sm leading-6 ${portalSurface.softMutedText(darkMode)}`}>Review drafts, scheduled writings, featured resources, and published work.</p>
                      {(dashboard.editorial?.count ?? 0) > 0 ? <p className="mt-4 text-sm font-black text-red-800">{dashboard.editorial?.count} awaiting review</p> : null}
                      <span className="mt-5 inline-flex text-sm font-black text-red-800">Open Editorial Queue &rarr;</span>
                    </div>
                  </div>
                </StudioCard>
              ) : null}
            </div>
          </section>
        </div>

        <aside className="grid h-fit gap-4 xl:sticky xl:top-24">
          <StudioCard darkMode={darkMode}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Bell size={17} className="text-red-800" />
                <CardKicker>Recent Activity</CardKicker>
              </div>
              <Link to="/portal/writing/articles" className="text-xs font-black text-red-800 hover:underline">View all</Link>
            </div>
            <div className="mt-4 grid gap-3">
              {latestDraft ? (
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-green-700" />
                  <div>
                    <p className="text-sm font-black">Draft saved: {latestDraft.title || 'Untitled Article'}</p>
                    <p className={`mt-1 text-xs ${portalSurface.softMutedText(darkMode)}`}>{formatRelativeDate(latestDraft.updated_at || latestDraft.created_at)}</p>
                  </div>
                </div>
              ) : (
                <div className={`rounded-2xl border p-4 ${portalSurface.mutedSurface(darkMode)}`}>
                  <p className="text-sm font-black">You're all caught up.</p>
                  <p className={`mt-1 text-xs leading-5 ${portalSurface.softMutedText(darkMode)}`}>Recent Writing Studio activity will appear here when available.</p>
                </div>
              )}
              {latestEditorial ? (
                <div className="flex items-start gap-3">
                  <ClipboardList size={17} className="mt-0.5 shrink-0 text-red-800" />
                  <div>
                    <p className="text-sm font-black">Article submitted for review</p>
                    <p className={`mt-1 text-xs ${portalSurface.softMutedText(darkMode)}`}>{latestEditorial.title}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </StudioCard>
        </aside>
      </section>
    </WritingStudioShell>
  );
};

export default WritingStudioPage;
