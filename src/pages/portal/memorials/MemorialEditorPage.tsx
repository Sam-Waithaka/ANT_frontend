import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  FileImage,
  GalleryHorizontal,
  Layers3,
  Mic2,
  PlayCircle,
  ScrollText,
  UsersRound,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import MemorialPortalShell, { MemorialPortalEmptyState } from '../../../components/portal/memorials/MemorialPortalShell';
import { portalSurface } from '../../../components/portal/portalSurface';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import { mediaAssetImageUrl } from '../../../services/mediaAssetsApi';
import { fetchMemorialEditorState } from '../../../services/memorialApi';
import type {
  MemorialEditorState,
  MemorialPage,
  MemorialRichTextBlock,
  MemorialWorkflowStatus,
} from '../../../types/memorial';
import type { WritingMediaAsset } from '../../../types/writing';
import { memorialBlockPlainText } from '../../../utils/memorialAdapters';
import {
  createMemorialEditorModel,
  getMemorialSectionLabel,
  memorialArrangementTypeLabels,
  memorialGalleryCategoryLabels,
  type MemorialEditorBlockModel,
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

const MediaThumb = ({
  alt,
  asset,
}: {
  alt: string;
  asset?: WritingMediaAsset | null;
}) => {
  const imageUrl = mediaAssetImageUrl(asset, 'thumb');
  if (!imageUrl) return null;

  return (
    <img
      alt={alt}
      className="h-20 w-20 rounded-2xl object-cover ring-1 ring-black/10 dark:ring-white/10"
      loading="lazy"
      src={imageUrl}
    />
  );
};

const CountCard = ({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) => (
  <div className="rounded-2xl border border-red-900/10 bg-red-950/[0.03] p-4 dark:border-red-200/10 dark:bg-white/[0.04]">
    <p className="font-serif text-3xl leading-none">{value}</p>
    <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-red-800 dark:text-red-100">
      {label}
    </p>
  </div>
);

const EmptyPanel = ({
  children,
  darkMode,
}: {
  children: ReactNode;
  darkMode: boolean;
}) => (
  <p className={`rounded-2xl border border-dashed p-4 text-sm ${darkMode ? 'border-white/10 text-stone-400' : 'border-[#eaded0] text-[#786f66]'}`}>
    {children}
  </p>
);

const ContentBlockPreview = ({
  block,
  darkMode,
}: {
  block?: MemorialRichTextBlock | null;
  darkMode: boolean;
}) => {
  if (!block) return null;
  const plainText = memorialBlockPlainText(block);

  return (
    <div className={`mt-3 rounded-2xl border p-3 text-sm ${portalSurface.mutedSurface(darkMode)}`}>
      <p className="font-bold">{block.title || getMemorialSectionLabel(block.section_key)}</p>
      {plainText ? (
        <p className={`mt-1 line-clamp-2 ${portalSurface.softMutedText(darkMode)}`}>
          {plainText}
        </p>
      ) : null}
    </div>
  );
};

type StructureItem = {
  asset?: WritingMediaAsset | null;
  contentBlock?: MemorialRichTextBlock | null;
  description?: string;
  eyebrow?: string;
  href?: string;
  id: string | number;
  meta?: string;
  status?: MemorialWorkflowStatus;
  title: string;
};

type StructurePanel = {
  empty: string;
  icon: ReactNode;
  items: StructureItem[];
  title: string;
};

const StructureRecordCard = ({
  darkMode,
  item,
}: {
  darkMode: boolean;
  item: StructureItem;
}) => (
  <article className={`rounded-2xl border p-4 ${portalSurface.card(darkMode)}`}>
    <div className="flex items-start gap-3">
      <MediaThumb alt={item.title} asset={item.asset} />
      <div className="min-w-0 flex-1">
        {item.eyebrow ? (
          <p className="text-xs font-black uppercase tracking-[0.14em] text-red-800 dark:text-red-100">
            {item.eyebrow}
          </p>
        ) : null}
        <h3 className="mt-1 font-serif text-xl leading-tight">{item.title}</h3>
        {item.description ? (
          <p className={`mt-1 text-sm ${portalSurface.softMutedText(darkMode)}`}>
            {item.description}
          </p>
        ) : null}
        {item.meta ? (
          <p className={`mt-1 text-xs font-bold ${portalSurface.softMutedText(darkMode)}`}>
            {item.meta}
          </p>
        ) : null}
        {item.href ? (
          <a
            className="mt-2 inline-flex text-sm font-bold text-red-800 underline-offset-4 hover:underline dark:text-red-100"
            href={item.href}
            rel="noreferrer"
            target="_blank"
          >
            Open link
          </a>
        ) : null}
        <div className="mt-2">
          <StatusPill darkMode={darkMode} status={item.status} />
        </div>
      </div>
    </div>
    <ContentBlockPreview block={item.contentBlock} darkMode={darkMode} />
  </article>
);

const StructureCollectionPanel = ({
  darkMode,
  panel,
}: {
  darkMode: boolean;
  panel: StructurePanel;
}) => (
  <section className={`rounded-3xl border p-5 shadow-lg ${portalSurface.panel(darkMode)}`}>
    <div className="flex items-center gap-3">
      <span className={`grid size-11 place-items-center rounded-2xl ${portalSurface.iconBadge(darkMode)}`}>
        {panel.icon}
      </span>
      <div>
        <h2 className="font-serif text-2xl leading-tight">{panel.title}</h2>
        <p className={`text-xs font-bold ${portalSurface.softMutedText(darkMode)}`}>
          {panel.items.length} record{panel.items.length === 1 ? '' : 's'}
        </p>
      </div>
    </div>
    <div className="mt-5 grid gap-3">
      {panel.items.length ? panel.items.map((item) => (
        <StructureRecordCard darkMode={darkMode} item={item} key={item.id} />
      )) : (
        <EmptyPanel darkMode={darkMode}>{panel.empty}</EmptyPanel>
      )}
    </div>
  </section>
);

const RichTextBlockCard = ({
  darkMode,
  model,
}: {
  darkMode: boolean;
  model: MemorialEditorBlockModel;
}) => {
  const { block, mediaEmbeds, plainText, scriptureReferences } = model;

  return (
    <article className={`rounded-3xl border p-5 ${portalSurface.card(darkMode)}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-2xl leading-tight">
            {block.title || getMemorialSectionLabel(block.section_key)}
          </h3>
          {block.subtitle ? (
            <p className={`mt-1 text-sm font-bold ${portalSurface.softMutedText(darkMode)}`}>
              {block.subtitle}
            </p>
          ) : null}
        </div>
        <StatusPill darkMode={darkMode} status={block.status} />
      </div>
      <p className={`mt-4 line-clamp-4 text-sm leading-6 ${portalSurface.softMutedText(darkMode)}`}>
        {plainText || 'No rich text content has been added yet.'}
      </p>
      <div className={`mt-4 flex flex-wrap gap-2 text-xs font-bold ${portalSurface.softMutedText(darkMode)}`}>
        <span>{block.reading_time_minutes || 0} min read</span>
        <span>{mediaEmbeds.length} media</span>
        <span>{scriptureReferences.length} scripture</span>
      </div>
      {mediaEmbeds.length ? (
        <div className="mt-4">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-red-800 dark:text-red-100">
            Inline media
          </p>
          <ul className={`mt-2 grid gap-2 text-sm ${portalSurface.softMutedText(darkMode)}`}>
            {mediaEmbeds.map((embed) => (
              <li key={embed.id} className="flex items-center gap-3 rounded-2xl border border-red-900/10 bg-red-950/[0.03] p-3 dark:border-red-200/10 dark:bg-white/[0.04]">
                <MediaThumb
                  alt={embed.alt_text_override || embed.media_asset_detail?.alt_text || embed.media_asset_detail?.title || 'Memorial media'}
                  asset={embed.media_asset_detail}
                />
                <span>
                  {embed.caption_override || embed.media_asset_detail?.title || `Media asset ${embed.media_asset}`}
                  {embed.position_hint ? <span className="block text-xs">Position: {embed.position_hint}</span> : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {scriptureReferences.length ? (
        <div className="mt-4">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-red-800 dark:text-red-100">
            Scripture
          </p>
          <ul className={`mt-2 grid gap-2 text-sm ${portalSurface.softMutedText(darkMode)}`}>
            {scriptureReferences.map((reference) => (
              <li key={reference.id} className="rounded-2xl border border-red-900/10 bg-red-950/[0.03] px-3 py-2 dark:border-red-200/10 dark:bg-white/[0.04]">
                {reference.passage_label || reference.display_text}
                {reference.version ? <span className="ml-2 text-xs font-bold">({reference.version})</span> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
};

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

  return (
    <section className={`rounded-3xl border p-5 shadow-lg ${portalSurface.panel(darkMode)}`}>
      <div className="grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)]">
        {portraitUrl ? (
          <img
            alt={page.portrait_image_detail?.alt_text || page.hero_image_detail?.alt_text || page.full_name}
            className="h-40 w-40 rounded-[2rem] object-cover shadow-lg shadow-zinc-900/10"
            src={portraitUrl}
          />
        ) : (
          <span className={`grid h-40 w-40 place-items-center rounded-[2rem] ${portalSurface.iconBadge(darkMode)}`}>
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
          <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">{page.full_name}</h1>
          {page.summary ? (
            <p className={`mt-4 max-w-3xl text-base leading-7 ${portalSurface.mutedText(darkMode)}`}>
              {page.summary}
            </p>
          ) : null}
          <dl className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div><dt className="text-xs font-black uppercase tracking-[0.14em] text-red-800 dark:text-red-100">Role</dt><dd className="mt-1 text-sm font-bold">{page.role_title || 'Not set'}</dd></div>
            <div><dt className="text-xs font-black uppercase tracking-[0.14em] text-red-800 dark:text-red-100">Years</dt><dd className="mt-1 text-sm font-bold">{page.years_of_service || lifeDates || 'Not set'}</dd></div>
            <div><dt className="text-xs font-black uppercase tracking-[0.14em] text-red-800 dark:text-red-100">Slug</dt><dd className="mt-1 text-sm font-bold">{page.slug}</dd></div>
            <div><dt className="text-xs font-black uppercase tracking-[0.14em] text-red-800 dark:text-red-100">Updated</dt><dd className="mt-1 text-sm font-bold">{formatDateTime(page.updated_at) || 'Not available'}</dd></div>
          </dl>
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <CountCard label="Sections with blocks" value={`${populatedSections}/${model.sections.length}`} />
        <CountCard label="Rich text blocks" value={model.totals.richTextBlocks} />
        <CountCard label="Media assets" value={model.totals.mediaEmbeds + model.totals.galleryItems} />
        <CountCard label="Structured records" value={model.totals.ministryTributes + model.totals.personalTributes + model.totals.timelineEvents + model.totals.recordingSections + model.totals.arrangements} />
      </div>
    </section>
  );
};

const RichTextSections = ({
  darkMode,
  model,
}: {
  darkMode: boolean;
  model: MemorialEditorModel;
}) => (
  <section className="grid gap-5">
    <div>
      <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-red-800 dark:text-red-100">
        <GalleryHorizontal size={15} aria-hidden="true" />
        Section structure
      </p>
      <h2 className="mt-2 font-serif text-3xl leading-tight">Rich text sections</h2>
    </div>
    <nav
      aria-label="Memorial editor sections"
      className={`rounded-3xl border p-3 shadow-lg ${portalSurface.panel(darkMode)}`}
    >
      <div className="flex gap-2 overflow-x-auto">
        {model.sections.map((section) => (
          <a
            className={`inline-flex min-h-10 min-w-max items-center gap-2 rounded-2xl px-3 text-xs font-black transition hover:bg-red-950/5 dark:hover:bg-white/10 ${portalSurface.softMutedText(darkMode)}`}
            href={`#memorial-section-${section.key}`}
            key={section.key}
          >
            {section.label}
            <span className="rounded-full bg-red-950/[0.08] px-2 py-0.5 text-red-800 dark:bg-white/10 dark:text-red-100">
              {section.blocks.length}
            </span>
          </a>
        ))}
      </div>
    </nav>
    {model.sections.map((section) => (
      <article
        className={`scroll-mt-24 rounded-3xl border p-5 shadow-lg ${portalSurface.panel(darkMode)}`}
        id={`memorial-section-${section.key}`}
        key={section.key}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-red-800 dark:text-red-100">
              {section.key}
            </p>
            <h3 className="mt-1 font-serif text-2xl leading-tight">{section.label}</h3>
          </div>
          <span className={`text-sm font-bold ${portalSurface.softMutedText(darkMode)}`}>
            {section.blocks.length} block{section.blocks.length === 1 ? '' : 's'}
          </span>
        </div>
        <div className="mt-5 grid gap-4">
          {section.blocks.length ? section.blocks.map((blockModel) => (
            <RichTextBlockCard darkMode={darkMode} key={blockModel.block.id} model={blockModel} />
          )) : (
            <EmptyPanel darkMode={darkMode}>No rich text block has been created for this section yet.</EmptyPanel>
          )}
        </div>
      </article>
    ))}
  </section>
);

const timelineLabel = (event: { date_label?: string; end_year?: number | null; event_date?: string | null; start_year?: number | null }) =>
  event.date_label || joinPresent([event.start_year, event.end_year], ' - ') || formatDate(event.event_date) || 'Undated';

const arrangementSchedule = (arrangement: { ends_at?: string | null; starts_at?: string | null }) =>
  joinPresent([formatDateTime(arrangement.starts_at), formatDateTime(arrangement.ends_at)], ' - ');

const buildStructurePanels = (model: MemorialEditorModel): StructurePanel[] => ([
  {
    empty: 'No ministry tributes have been linked yet.',
    icon: <UsersRound size={20} aria-hidden="true" />,
    items: model.ministryTributes.map((tribute) => ({
      asset: tribute.representative_photo_detail,
      contentBlock: tribute.content_block_detail,
      description: joinPresent([tribute.speaker_name, tribute.speaker_office]) || 'No speaker assigned',
      eyebrow: 'Ministry tribute',
      id: tribute.id,
      meta: tribute.ministry_detail?.name || tribute.ministry_name,
      status: tribute.status,
      title: tribute.display_ministry_name || tribute.ministry_detail?.name || tribute.ministry_name || 'Ministry tribute',
    })),
    title: 'Ministry tributes',
  },
  {
    empty: 'No personal tributes have been added yet.',
    icon: <BookOpen size={20} aria-hidden="true" />,
    items: model.personalTributes.map((tribute) => ({
      asset: tribute.author_photo_detail,
      contentBlock: tribute.content_block_detail,
      description: joinPresent([tribute.relationship_to_deceased, tribute.author_role]),
      eyebrow: 'Personal tribute',
      id: tribute.id,
      meta: tribute.related_ministry_detail?.name || tribute.related_ministry_name,
      status: tribute.status,
      title: tribute.author_name,
    })),
    title: 'Personal tributes',
  },
  {
    empty: 'No timeline events have been created yet.',
    icon: <CalendarDays size={20} aria-hidden="true" />,
    items: model.timelineEvents.map((event) => ({
      asset: event.image_detail,
      contentBlock: event.content_block_detail,
      description: timelineLabel(event),
      eyebrow: 'Timeline event',
      id: event.id,
      status: event.status,
      title: event.title,
    })),
    title: 'Leadership timeline',
  },
  {
    empty: 'No gallery items have been attached yet.',
    icon: <FileImage size={20} aria-hidden="true" />,
    items: model.galleryItems.map((item) => ({
      asset: item.media_asset_detail,
      description: joinPresent([formatDate(item.taken_at), item.credit]) || `Media asset ${item.media_asset}`,
      eyebrow: memorialGalleryCategoryLabels[item.category],
      id: item.id,
      status: item.status,
      title: item.caption || item.media_asset_detail?.title || `Gallery item ${item.id}`,
    })),
    title: 'Gallery',
  },
  {
    empty: 'No recording sections have been connected yet.',
    icon: <Mic2 size={20} aria-hidden="true" />,
    items: model.recordingSections.map((recording) => {
      const series = recording.audio_visual_series_detail;
      const seriesTitle = series?.name || series?.title || series?.slug || 'No series linked';
      return {
        asset: series?.cover_image_detail || series?.cover_image,
        contentBlock: recording.content_block_detail,
        description: joinPresent([seriesTitle, recording.max_items ? `${recording.max_items} max items` : undefined]),
        eyebrow: 'Recording section',
        id: recording.id,
        status: recording.status,
        title: recording.title,
      };
    }),
    title: 'Recordings',
  },
  {
    empty: 'No arrangements have been added yet.',
    icon: <PlayCircle size={20} aria-hidden="true" />,
    items: model.arrangements.map((arrangement) => ({
      asset: arrangement.programme_asset_detail,
      contentBlock: arrangement.content_block_detail,
      description: joinPresent([
        arrangementSchedule(arrangement),
        arrangement.location_name,
        arrangement.address,
      ]) || 'No schedule details',
      eyebrow: memorialArrangementTypeLabels[arrangement.arrangement_type],
      href: arrangement.livestream_url,
      id: arrangement.id,
      status: arrangement.status,
      title: arrangement.title,
    })),
    title: 'Arrangements',
  },
]);

const SpecialistPanels = ({
  darkMode,
  model,
}: {
  darkMode: boolean;
  model: MemorialEditorModel;
}) => {
  const panels = buildStructurePanels(model);

  return (
    <section className="grid gap-5 xl:grid-cols-2">
      {panels.map((panel) => (
        <StructureCollectionPanel darkMode={darkMode} key={panel.title} panel={panel} />
      ))}
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

  return (
    <MemorialPortalShell compact>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-5">
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
            Editor state hydration
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
            Memorial structure
          </h1>
          <p className={`mt-3 max-w-3xl text-sm leading-6 ${portalSurface.mutedText(darkMode)}`}>
            Read-only view of the bundled editor payload. This confirms the page, sections,
            block children, media, scripture, and specialist records before edit controls are added.
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

      {model?.page ? (
        <div className="grid gap-6">
          <PageOverview darkMode={darkMode} model={model} />
          <RichTextSections darkMode={darkMode} model={model} />
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
                These records are loaded with the page bundle and grouped separately from the
                rich text sections they may reference.
              </p>
            </div>
            <SpecialistPanels darkMode={darkMode} model={model} />
          </section>
        </div>
      ) : null}
    </MemorialPortalShell>
  );
};

export default MemorialEditorPage;
