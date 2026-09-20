import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Layers3, ScrollText, UsersRound } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import MemorialPortalShell, { MemorialPortalEmptyState } from '../../../components/portal/memorials/MemorialPortalShell';
import MemorialPageSettingsPanel from '../../../components/portal/memorials/MemorialPageSettingsPanel';
import MemorialRichTextSectionsEditor from '../../../components/portal/memorials/MemorialRichTextSectionsEditor';
import MemorialSpecialistPanelsEditor from '../../../components/portal/memorials/MemorialSpecialistPanelsEditor';
import { portalSurface } from '../../../components/portal/portalSurface';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import { mediaAssetImageUrl } from '../../../services/mediaAssetsApi';
import { fetchMemorialEditorState } from '../../../services/memorialApi';
import type {
  MemorialEditorState,
  MemorialPage,
  MemorialWorkflowStatus,
} from '../../../types/memorial';
import {
  createMemorialEditorModel,
  type MemorialEditorModel,
} from '../../../utils/memorialEditorState';
import { getMemorialStatusLabel } from '../../../utils/memorialWorkflow';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  month: 'short',
  year: 'numeric',
});

const formatDate = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return dateFormatter.format(date);
};

const formatDateTime = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return dateTimeFormatter.format(date);
};

const joinPresent = (items: Array<string | number | null | undefined>, separator = ' · ') =>
  items.filter((item) => item !== undefined && item !== null && String(item).trim()).join(separator);

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

const StatusPill = ({
  darkMode,
  status,
}: {
  darkMode: boolean;
  status?: MemorialWorkflowStatus;
}) => {
  if (!status) return null;

  return (
    <span className={`inline-flex min-h-7 items-center rounded-full border px-3 text-[0.68rem] font-black uppercase tracking-[0.14em] ${statusClass(status, darkMode)}`}>
      {getMemorialStatusLabel(status)}
    </span>
  );
};

const CountCard = ({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) => (
  <div className="rounded-2xl border border-red-900/10 bg-red-950/[0.03] p-3 dark:border-red-200/10 dark:bg-white/[0.04] sm:p-4">
    <p className="font-serif text-3xl leading-none">{value}</p>
    <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-red-800 dark:text-red-100">
      {label}
    </p>
  </div>
);

const PageOverview = ({
  darkMode,
  model,
}: {
  darkMode: boolean;
  model: MemorialEditorModel;
}) => {
  const page = model.page as MemorialPage;
  const portraitUrl = mediaAssetImageUrl(page.portrait_image_detail || page.hero_image_detail, 'small');
  const lifeDates = joinPresent([formatDate(page.birth_date), formatDate(page.death_date)], ' - ');
  const populatedSections = model.sections.filter((section) => section.blocks.length).length;
  const structuredRecordCount =
    model.totals.ministryTributes
    + model.totals.personalTributes
    + model.totals.timelineEvents
    + model.totals.galleryItems
    + model.totals.recordingSections
    + model.totals.arrangements;

  return (
    <section className={`rounded-[1.5rem] border p-4 shadow-lg sm:rounded-3xl sm:p-5 ${portalSurface.panel(darkMode)}`}>
      <div className="grid gap-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-6">
        {portraitUrl ? (
          <img
            alt={page.portrait_image_detail?.alt_text || page.hero_image_detail?.alt_text || page.full_name}
            className="h-28 w-28 rounded-[1.5rem] object-cover shadow-lg shadow-zinc-900/10 sm:h-32 sm:w-32 lg:h-40 lg:w-40 lg:rounded-[2rem]"
            src={portraitUrl}
          />
        ) : (
          <span className={`grid h-28 w-28 place-items-center rounded-[1.5rem] sm:h-32 sm:w-32 lg:h-40 lg:w-40 lg:rounded-[2rem] ${portalSurface.iconBadge(darkMode)}`}>
            <UsersRound size={36} aria-hidden="true" />
          </span>
        )}
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill darkMode={darkMode} status={page.status} />
            {page.is_visible ? (
              <span className="text-xs font-black uppercase tracking-[0.14em] text-red-800 dark:text-red-100">
                Visible
              </span>
            ) : null}
          </div>
          <h1 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl lg:text-5xl">{page.full_name}</h1>
          {page.summary ? (
            <p className={`mt-4 max-w-3xl text-base leading-7 ${portalSurface.mutedText(darkMode)}`}>
              {page.summary}
            </p>
          ) : null}
          <dl className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div><dt className="text-xs font-black uppercase tracking-[0.14em] text-red-800 dark:text-red-100">Role</dt><dd className="mt-1 break-words text-sm font-bold">{page.role_title || 'Not set'}</dd></div>
            <div><dt className="text-xs font-black uppercase tracking-[0.14em] text-red-800 dark:text-red-100">Years</dt><dd className="mt-1 break-words text-sm font-bold">{page.years_of_service || lifeDates || 'Not set'}</dd></div>
            <div><dt className="text-xs font-black uppercase tracking-[0.14em] text-red-800 dark:text-red-100">Slug</dt><dd className="mt-1 break-words text-sm font-bold">{page.slug}</dd></div>
            <div><dt className="text-xs font-black uppercase tracking-[0.14em] text-red-800 dark:text-red-100">Updated</dt><dd className="mt-1 break-words text-sm font-bold">{formatDateTime(page.updated_at) || 'Not available'}</dd></div>
          </dl>
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <CountCard label="Sections with blocks" value={`${populatedSections}/${model.sections.length}`} />
        <CountCard label="Rich text blocks" value={model.totals.richTextBlocks} />
        <CountCard label="Media assets" value={model.totals.mediaEmbeds + model.totals.galleryItems} />
        <CountCard label="Structured records" value={structuredRecordCount} />
      </div>
    </section>
  );
};

const MemorialEditorPage = () => {
  const { id = '' } = useParams();
  const auth = useAuth();
  const { darkMode } = useTheme();
  const [editorState, setEditorState] = useState<MemorialEditorState | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setEditorState(null);

    fetchMemorialEditorState(auth.accessToken, id, controller.signal)
      .then(setEditorState)
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Unable to load memorial editor state.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [auth.accessToken, id]);

  const model = useMemo(
    () => editorState ? createMemorialEditorModel(editorState) : null,
    [editorState],
  );
  const updateEditorState = (updater: (current: MemorialEditorState) => MemorialEditorState) => {
    setEditorState((current) => current ? updater(current) : current);
  };

  return (
    <MemorialPortalShell compact>
      <header className="mb-5 flex flex-wrap items-start justify-between gap-5 sm:mb-6">
        <div>
          <Link
            className={darkMode ? 'inline-flex items-center gap-2 text-xs font-bold text-stone-400 transition hover:text-stone-100' : 'inline-flex items-center gap-2 text-xs font-bold text-[#786f66] transition hover:text-zinc-950'}
            to="/portal/memorials"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Back to memorials
          </Link>
          <p className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-red-800 dark:text-red-100">
            <Layers3 size={15} aria-hidden="true" />
            Memorial editor
          </p>
          <h1 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl lg:text-5xl">
            Memorial structure
          </h1>
          <p className={`mt-3 max-w-3xl text-sm leading-6 ${portalSurface.mutedText(darkMode)}`}>
            Bundled editor payload for the page shell, rich text sections, media, scripture,
            and specialist records that make up this memorial.
          </p>
        </div>
      </header>

      {loading ? (
        <p className={`rounded-3xl border p-5 text-sm ${portalSurface.panel(darkMode)}`}>
          Loading memorial editor state...
        </p>
      ) : null}

      {error ? (
        <p className="rounded-3xl bg-red-950/5 p-5 text-sm font-bold text-red-800">
          {error}
        </p>
      ) : null}

      {!loading && !error && !model?.page ? (
        <MemorialPortalEmptyState title="Memorial not found">
          The editor-state payload did not include a memorial page for id {id}.
        </MemorialPortalEmptyState>
      ) : null}

      {model?.page && editorState ? (
        <div className="grid gap-5 sm:gap-6">
          <PageOverview darkMode={darkMode} model={model} />
          <MemorialPageSettingsPanel
            onPageUpdated={(updatedPage) => setEditorState((current) => current ? { ...current, page: updatedPage } : current)}
            page={model.page}
          />
          <MemorialRichTextSectionsEditor
            darkMode={darkMode}
            model={model}
            onEditorStateChange={updateEditorState}
          />
          <section className="grid gap-5">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-red-800 dark:text-red-100">
                <ScrollText size={15} aria-hidden="true" />
                Specialist content
              </p>
              <h2 className="mt-2 font-serif text-3xl leading-tight">
                Structured memorial records
              </h2>
              <p className={`mt-2 max-w-3xl text-sm leading-6 ${portalSurface.mutedText(darkMode)}`}>
                Create, order, publish, hide, and remove the specialist child records without
                coupling them to Writing Studio internals.
              </p>
            </div>
            <MemorialSpecialistPanelsEditor
              darkMode={darkMode}
              editorState={editorState}
              onEditorStateChange={updateEditorState}
            />
          </section>
        </div>
      ) : null}
    </MemorialPortalShell>
  );
};

export default MemorialEditorPage;