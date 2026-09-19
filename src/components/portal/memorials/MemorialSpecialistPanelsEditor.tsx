import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  BookOpen,
  CalendarDays,
  FileImage,
  Mic2,
  Pencil,
  PlayCircle,
  Plus,
  Trash2,
  UsersRound,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ResponsiveImage from '../../media/ResponsiveImage';
import { formatDuration, formatMediaDate } from '../../media/mediaFormat';
import { getMediaWatchPath } from '../../media/mediaLinks';
import PortalModal from '../PortalModal';
import { usePortalToast } from '../PortalToast';
import { portalSurface } from '../portalSurface';
import { useAuth } from '../../../hooks/useAuth';
import {
  fetchAudioVisualItemPage,
  fetchAudioVisualSeries,
  fetchAudioVisualSeriesDetail,
} from '../../../services/audioVisualApi';
import {
  createMemorialArrangement,
  createMemorialGalleryItem,
  createMemorialMinistryTribute,
  createMemorialPersonalTribute,
  createMemorialRecordingSection,
  createMemorialTimelineEvent,
  deleteMemorialArrangement,
  deleteMemorialGalleryItem,
  deleteMemorialMinistryTribute,
  deleteMemorialPersonalTribute,
  deleteMemorialRecordingSection,
  deleteMemorialTimelineEvent,
  runMemorialWorkflowAction,
  updateMemorialArrangement,
  updateMemorialGalleryItem,
  updateMemorialMinistryTribute,
  updateMemorialPersonalTribute,
  updateMemorialRecordingSection,
  updateMemorialTimelineEvent,
  type MemorialWorkflowResource,
} from '../../../services/memorialApi';
import type { AudioVisualGroupDetail, AudioVisualItem, AudioVisualLookup } from '../../../types/audioVisual';
import type {
  MemorialEditorState,
  MemorialId,
  MemorialRecordingSection,
  MemorialRichTextBlock,
  MemorialWorkflowStatus,
} from '../../../types/memorial';
import {
  MEMORIAL_ARRANGEMENT_TYPES,
  MEMORIAL_GALLERY_CATEGORIES,
} from '../../../types/memorial';
import type { WritingMediaAsset } from '../../../types/writing';
import {
  memorialBlockPlainText,
  memorialRecordingSeriesToLookup,
} from '../../../utils/memorialAdapters';
import {
  memorialArrangementTypeLabels,
  memorialGalleryCategoryLabels,
} from '../../../utils/memorialEditorState';
import {
  MEMORIAL_WORKFLOW_STATUSES,
  getAvailableMemorialWorkflowActions,
  getMemorialStatusLabel,
  getMemorialWorkflowActionLabel,
} from '../../../utils/memorialWorkflow';

type MemorialEditorStateUpdater = (
  updater: (current: MemorialEditorState) => MemorialEditorState,
) => void;

type SpecialistRecord = Record<string, unknown> & {
  id: MemorialId;
  is_visible: boolean;
  order: number;
  status: MemorialWorkflowStatus;
};

type CollectionKey =
  | 'arrangements'
  | 'gallery_items'
  | 'ministry_tributes'
  | 'personal_tributes'
  | 'recording_sections'
  | 'timeline_events';

type FormValue = boolean | string;
type FormValues = Record<string, FormValue>;

type FieldOption = {
  label: string;
  value: string;
};

type FieldConfig = {
  helpText?: string;
  kind?: 'audio-series' | 'checkbox' | 'date' | 'datetime-local' | 'number' | 'select' | 'text' | 'textarea';
  label: string;
  name: string;
  options?: FieldOption[];
  required?: boolean;
};

type PanelConfig = {
  collectionKey: CollectionKey;
  create: (accessToken: string, payload: Record<string, unknown>) => Promise<SpecialistRecord>;
  delete: (accessToken: string, id: MemorialId) => Promise<unknown>;
  descriptionFor: (record: SpecialistRecord) => string;
  empty: string;
  fields: FieldConfig[];
  icon: ReactNode;
  id: string;
  items: (state: MemorialEditorState) => SpecialistRecord[];
  resource: MemorialWorkflowResource;
  title: string;
  titleFor: (record: SpecialistRecord) => string;
  toForm: (record?: SpecialistRecord) => FormValues;
  toPayload: (values: FormValues, memorialId: MemorialId, mode: 'create' | 'update') => Record<string, unknown>;
  update: (accessToken: string, id: MemorialId, payload: Record<string, unknown>) => Promise<SpecialistRecord>;
  visualFor?: (record: SpecialistRecord) => WritingMediaAsset | null | undefined;
};

type ActiveModal = {
  config: PanelConfig;
  record?: SpecialistRecord;
};

type MemorialSpecialistPanelsEditorProps = {
  darkMode: boolean;
  editorState: MemorialEditorState;
  onEditorStateChange: MemorialEditorStateUpdater;
};

const idKey = (value: MemorialId) => String(value);
const textValue = (value: unknown) => typeof value === 'string' ? value : value === undefined || value === null ? '' : String(value);
const boolValue = (value: unknown) => Boolean(value);
const idValue = (value: unknown) => value === undefined || value === null || value === '' ? '' : String(value);
const numberText = (value: unknown) => typeof value === 'number' ? String(value) : textValue(value);
const nullableId = (value: FormValue) => textValue(value).trim() || null;
const nullableText = (value: FormValue) => textValue(value).trim();
const nullableNumber = (value: FormValue) => {
  const text = textValue(value).trim();
  if (!text) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
};
const orderNumber = (value: FormValue) => nullableNumber(value) ?? 0;
const statusValue = (value: FormValue) => textValue(value) as MemorialWorkflowStatus;
const seriesOptionValue = (series: AudioVisualLookup) => idValue(series.id ?? series.slug ?? series.name);

const replaceRecord = (records: SpecialistRecord[], next: SpecialistRecord) =>
  records.map((record) => idKey(record.id) === idKey(next.id) ? next : record);

const appendRecord = (records: SpecialistRecord[], next: SpecialistRecord) =>
  records.some((record) => idKey(record.id) === idKey(next.id))
    ? replaceRecord(records, next)
    : [...records, next];

const removeRecord = (records: SpecialistRecord[], id: MemorialId) =>
  records.filter((record) => idKey(record.id) !== idKey(id));

const collection = (
  state: MemorialEditorState,
  key: CollectionKey,
): SpecialistRecord[] => state[key] as SpecialistRecord[];

const patchCollection = (
  state: MemorialEditorState,
  key: CollectionKey,
  updater: (records: SpecialistRecord[]) => SpecialistRecord[],
): MemorialEditorState => ({
  ...state,
  [key]: updater(collection(state, key)),
});

const commonForm = (record?: SpecialistRecord): FormValues => ({
  content_block: idValue(record?.content_block),
  is_visible: record ? boolValue(record.is_visible) : false,
  order: record ? numberText(record.order) : '0',
  status: record ? record.status : 'DRAFT',
});

const commonWorkflowPayload = (
  values: FormValues,
  memorialId: MemorialId,
  mode: 'create' | 'update',
  includeContentBlock = true,
) => ({
  ...(mode === 'create' ? { memorial: memorialId } : {}),
  ...(includeContentBlock ? { content_block: nullableId(values.content_block) } : {}),
  is_visible: boolValue(values.is_visible),
  order: orderNumber(values.order),
  status: statusValue(values.status),
});

const statusOptions = MEMORIAL_WORKFLOW_STATUSES.map((status) => ({
  label: getMemorialStatusLabel(status),
  value: status,
}));

const galleryCategoryOptions = MEMORIAL_GALLERY_CATEGORIES.map((category) => ({
  label: memorialGalleryCategoryLabels[category],
  value: category,
}));

const arrangementTypeOptions = MEMORIAL_ARRANGEMENT_TYPES.map((type) => ({
  label: memorialArrangementTypeLabels[type],
  value: type,
}));

const workflowFields: FieldConfig[] = [
  { kind: 'number', label: 'Order', name: 'order' },
  { kind: 'select', label: 'Status', name: 'status', options: statusOptions },
  { kind: 'checkbox', label: 'Visible when published', name: 'is_visible' },
  {
    helpText: 'Optional rich text block id that provides the body copy for this structured record.',
    label: 'Content block id',
    name: 'content_block',
  },
];

const contentBlockPreview = (
  block: unknown,
  darkMode: boolean,
) => {
  const contentBlock = block as MemorialRichTextBlock | null | undefined;
  if (!contentBlock) return null;
  const text = memorialBlockPlainText(contentBlock);

  return (
    <div className={`mt-3 rounded-2xl border p-3 text-sm ${portalSurface.mutedSurface(darkMode)}`}>
      <p className="font-bold">{contentBlock.title || contentBlock.section_key}</p>
      {text ? (
        <p className={`mt-1 line-clamp-2 ${portalSurface.softMutedText(darkMode)}`}>
          {text}
        </p>
      ) : null}
    </div>
  );
};

const recordImage = (record: SpecialistRecord, config: PanelConfig) => {
  const asset = config.visualFor?.(record);
  if (!asset) return null;

  return (
    <ResponsiveImage
      alt={config.titleFor(record)}
      asset={asset}
      className="h-20 w-20 rounded-2xl object-cover ring-1 ring-black/10 dark:ring-white/10"
      preset="thumbnail"
    />
  );
};

type RecordingPreviewState = {
  error: string;
  items: AudioVisualItem[];
  series: AudioVisualGroupDetail | AudioVisualLookup | null;
  status: 'idle' | 'loading' | 'ready' | 'error';
};

const previewItemLimit = (value: unknown) => {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) && number > 0 ? Math.min(number, 6) : 3;
};

const RecordingPreviewItem = ({
  darkMode,
  item,
}: {
  darkMode: boolean;
  item: AudioVisualItem;
}) => {
  const duration = formatDuration(item.durationSeconds);
  const date = formatMediaDate(item.publishedAt);
  const meta = [item.speaker, date, duration].filter(Boolean).join(' · ');

  return (
    <Link
      className={`grid gap-3 rounded-2xl border p-3 transition hover:-translate-y-0.5 sm:grid-cols-[6rem_minmax(0,1fr)] ${portalSurface.card(darkMode)}`}
      to={getMediaWatchPath(item)}
    >
      {item.thumbnailUrl ? (
        <img
          alt=""
          className="aspect-video w-full rounded-xl object-cover"
          loading="lazy"
          src={item.thumbnailUrl}
        />
      ) : (
        <span className={`grid aspect-video place-items-center rounded-xl ${portalSurface.iconBadge(darkMode)}`}>
          <PlayCircle size={20} aria-hidden="true" />
        </span>
      )}
      <span className="min-w-0">
        <span className="block truncate text-sm font-black">{item.title}</span>
        {meta ? (
          <span className={`mt-1 block truncate text-xs font-bold ${portalSurface.softMutedText(darkMode)}`}>
            {meta}
          </span>
        ) : null}
      </span>
    </Link>
  );
};

const RecordingSeriesPreview = ({
  darkMode,
  record,
}: {
  darkMode: boolean;
  record: SpecialistRecord;
}) => {
  const recording = record as unknown as MemorialRecordingSection;
  const lookup = memorialRecordingSeriesToLookup(recording);
  const seriesSlug = lookup?.slug || '';
  const limit = previewItemLimit(recording.max_items);
  const [preview, setPreview] = useState<RecordingPreviewState>({
    error: '',
    items: [],
    series: lookup,
    status: lookup ? 'idle' : 'error',
  });

  useEffect(() => {
    if (!lookup || !seriesSlug) {
      setPreview({
        error: 'Select an audio-visual series to preview linked recordings.',
        items: [],
        series: lookup,
        status: 'error',
      });
      return undefined;
    }

    const controller = new AbortController();
    setPreview({ error: '', items: [], series: lookup, status: 'loading' });

    Promise.allSettled([
      fetchAudioVisualSeriesDetail(seriesSlug, controller.signal),
      fetchAudioVisualItemPage({ ordering: 'oldest', pageSize: limit, series: seriesSlug }, controller.signal),
    ])
      .then(([detailResult, pageResult]) => {
        if (controller.signal.aborted) return;
        const detail = detailResult.status === 'fulfilled' ? detailResult.value : null;
        const page = pageResult.status === 'fulfilled' ? pageResult.value : null;
        const items = (page?.items?.length ? page.items : detail?.items || []).slice(0, limit);

        if (!detail && !page) {
          setPreview({
            error: 'Unable to load recording previews right now.',
            items: [],
            series: lookup,
            status: 'error',
          });
          return;
        }

        setPreview({
          error: '',
          items,
          series: detail || lookup,
          status: 'ready',
        });
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setPreview({
          error: err instanceof Error ? err.message : 'Unable to load recording previews right now.',
          items: [],
          series: lookup,
          status: 'error',
        });
      });

    return () => controller.abort();
  }, [limit, seriesSlug]);

  const series = preview.series || lookup;
  const count = series?.itemCount ?? preview.items.length;

  return (
    <div className={`mt-3 rounded-2xl border p-3 text-sm ${portalSurface.mutedSurface(darkMode)}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-bold">{series?.name || 'Recording series'}</p>
        {count ? (
          <span className={`text-xs font-black uppercase tracking-[0.12em] ${portalSurface.softMutedText(darkMode)}`}>
            {count} item{count === 1 ? '' : 's'}
          </span>
        ) : null}
      </div>
      {preview.status === 'loading' ? (
        <p className={`mt-2 text-xs font-bold ${portalSurface.softMutedText(darkMode)}`}>
          Loading linked audio-visual items...
        </p>
      ) : null}
      {preview.error ? (
        <p className={`mt-2 text-xs font-bold ${portalSurface.softMutedText(darkMode)}`}>
          {preview.error}
        </p>
      ) : null}
      {preview.items.length ? (
        <div className="mt-3 grid gap-2">
          {preview.items.map((item) => (
            <RecordingPreviewItem darkMode={darkMode} item={item} key={item.id ?? item.slug} />
          ))}
        </div>
      ) : null}
      {preview.status === 'ready' && !preview.items.length ? (
        <p className={`mt-2 text-xs font-bold ${portalSurface.softMutedText(darkMode)}`}>
          This series is linked, but no public recordings were returned for preview.
        </p>
      ) : null}
    </div>
  );
};

const fieldClass = (darkMode: boolean) =>
  darkMode
    ? 'w-full rounded-2xl border border-white/10 bg-[#171717] px-4 py-3 text-sm text-stone-100 outline-none focus:ring-2 focus:ring-red-800/30'
    : 'w-full rounded-2xl border border-[#eaded0] bg-white px-4 py-3 text-sm text-zinc-950 outline-none focus:ring-2 focus:ring-red-800/30';

const fieldValue = (value: FormValue | undefined) =>
  typeof value === 'boolean' ? value : value ?? '';

const AudioVisualSeriesSelect = ({
  darkMode,
  field,
  onChange,
  value,
}: {
  darkMode: boolean;
  field: FieldConfig;
  onChange: (value: FormValue) => void;
  value: FormValue | undefined;
}) => {
  const [series, setSeries] = useState<AudioVisualLookup[]>([]);
  const [status, setStatus] = useState<'error' | 'idle' | 'loading' | 'ready'>('idle');
  const selectedValue = textValue(fieldValue(value));

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');

    fetchAudioVisualSeries(controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) {
          setSeries(items);
          setStatus('ready');
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus('error');
      });

    return () => controller.abort();
  }, []);

  const hasSelectedOption = series.some((item) => seriesOptionValue(item) === selectedValue);

  if (status === 'error') {
    return (
      <label className="grid gap-2 text-sm font-bold">
        {field.label}
        <input
          className={fieldClass(darkMode)}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Audio-visual series id"
          value={selectedValue}
        />
        <span className={`text-xs font-normal ${portalSurface.softMutedText(darkMode)}`}>
          Series lookup is unavailable. Enter the existing audio-visual series id directly.
        </span>
      </label>
    );
  }

  return (
    <label className="grid gap-2 text-sm font-bold">
      {field.label}
      <select
        className={fieldClass(darkMode)}
        disabled={status === 'loading'}
        onChange={(event) => onChange(event.target.value)}
        value={selectedValue}
      >
        <option value="">No recording series selected</option>
        {selectedValue && !hasSelectedOption ? (
          <option value={selectedValue}>Current series ({selectedValue})</option>
        ) : null}
        {series.map((item) => (
          <option key={item.slug || item.id || item.name} value={seriesOptionValue(item)}>
            {item.name}
          </option>
        ))}
      </select>
      <span className={`text-xs font-normal ${portalSurface.softMutedText(darkMode)}`}>
        {status === 'loading'
          ? 'Loading audio-visual series...'
          : field.helpText || 'Select an existing audio-visual series; recordings are previewed from the media APIs.'}
      </span>
    </label>
  );
};

const SpecialistField = ({
  darkMode,
  field,
  onChange,
  value,
}: {
  darkMode: boolean;
  field: FieldConfig;
  onChange: (value: FormValue) => void;
  value: FormValue | undefined;
}) => {
  const kind = field.kind || 'text';

  if (kind === 'checkbox') {
    return (
      <label className="flex items-center gap-3 rounded-2xl border border-red-900/10 bg-red-950/[0.03] px-4 py-3 text-sm font-bold dark:border-red-200/10 dark:bg-white/[0.04]">
        <input
          checked={Boolean(value)}
          className="size-4 accent-red-800"
          onChange={(event) => onChange(event.target.checked)}
          type="checkbox"
        />
        {field.label}
      </label>
    );
  }

  if (kind === 'audio-series') {
    return (
      <AudioVisualSeriesSelect
        darkMode={darkMode}
        field={field}
        onChange={onChange}
        value={value}
      />
    );
  }

  if (kind === 'textarea') {
    return (
      <label className="grid gap-2 text-sm font-bold">
        {field.label}
        <textarea
          className={`${fieldClass(darkMode)} min-h-24 resize-y`}
          onChange={(event) => onChange(event.target.value)}
          value={textValue(value)}
        />
        {field.helpText ? (
          <span className={`text-xs font-normal ${portalSurface.softMutedText(darkMode)}`}>
            {field.helpText}
          </span>
        ) : null}
      </label>
    );
  }

  if (kind === 'select') {
    return (
      <label className="grid gap-2 text-sm font-bold">
        {field.label}
        <select
          className={fieldClass(darkMode)}
          onChange={(event) => onChange(event.target.value)}
          value={textValue(fieldValue(value))}
        >
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className="grid gap-2 text-sm font-bold">
      {field.label}
      <input
        className={fieldClass(darkMode)}
        onChange={(event) => onChange(event.target.value)}
        required={field.required}
        type={kind}
        value={textValue(fieldValue(value))}
      />
      {field.helpText ? (
        <span className={`text-xs font-normal ${portalSurface.softMutedText(darkMode)}`}>
          {field.helpText}
        </span>
      ) : null}
    </label>
  );
};

const makeConfigs = (): PanelConfig[] => [
  {
    collectionKey: 'ministry_tributes',
    create: (token, payload) =>
      createMemorialMinistryTribute(token, payload as Parameters<typeof createMemorialMinistryTribute>[1]) as Promise<SpecialistRecord>,
    delete: deleteMemorialMinistryTribute,
    descriptionFor: (record) =>
      [textValue(record.speaker_name), textValue(record.speaker_office)].filter(Boolean).join(' · ') || 'No speaker assigned',
    empty: 'No ministry tributes have been linked yet.',
    fields: [
      { label: 'Ministry name', name: 'ministry_name', required: true },
      { label: 'Existing ministry id', name: 'ministry' },
      { label: 'Speaker name', name: 'speaker_name' },
      { label: 'Speaker office', name: 'speaker_office' },
      { label: 'Representative photo media id', name: 'representative_photo' },
      ...workflowFields,
    ],
    icon: <UsersRound size={20} aria-hidden="true" />,
    id: 'ministry_tributes',
    items: (state) => collection(state, 'ministry_tributes'),
    resource: 'ministry-tributes',
    title: 'Ministry tributes',
    titleFor: (record) =>
      textValue(record.display_ministry_name)
      || textValue((record.ministry_detail as { name?: string } | undefined)?.name)
      || textValue(record.ministry_name)
      || 'Ministry tribute',
    toForm: (record) => ({
      ...commonForm(record),
      ministry: idValue(record?.ministry),
      ministry_name: textValue(record?.ministry_name || record?.display_ministry_name),
      representative_photo: idValue(record?.representative_photo),
      speaker_name: textValue(record?.speaker_name),
      speaker_office: textValue(record?.speaker_office),
    }),
    toPayload: (values, memorialId, mode) => ({
      ...commonWorkflowPayload(values, memorialId, mode),
      ministry: nullableId(values.ministry),
      ministry_name: nullableText(values.ministry_name),
      representative_photo: nullableId(values.representative_photo),
      speaker_name: nullableText(values.speaker_name),
      speaker_office: nullableText(values.speaker_office),
    }),
    update: (token, id, payload) =>
      updateMemorialMinistryTribute(token, id, payload as Parameters<typeof updateMemorialMinistryTribute>[2]) as Promise<SpecialistRecord>,
    visualFor: (record) => record.representative_photo_detail as WritingMediaAsset | null | undefined,
  },
  {
    collectionKey: 'personal_tributes',
    create: (token, payload) =>
      createMemorialPersonalTribute(token, payload as Parameters<typeof createMemorialPersonalTribute>[1]) as Promise<SpecialistRecord>,
    delete: deleteMemorialPersonalTribute,
    descriptionFor: (record) =>
      [textValue(record.relationship_to_deceased), textValue(record.author_role)].filter(Boolean).join(' · ') || 'Personal tribute',
    empty: 'No personal tributes have been added yet.',
    fields: [
      { label: 'Author name', name: 'author_name', required: true },
      { label: 'Author role', name: 'author_role' },
      { label: 'Relationship to deceased', name: 'relationship_to_deceased' },
      { label: 'Related ministry name', name: 'related_ministry_name' },
      { label: 'Related ministry id', name: 'related_ministry' },
      { label: 'Author photo media id', name: 'author_photo' },
      ...workflowFields,
    ],
    icon: <BookOpen size={20} aria-hidden="true" />,
    id: 'personal_tributes',
    items: (state) => collection(state, 'personal_tributes'),
    resource: 'personal-tributes',
    title: 'Personal tributes',
    titleFor: (record) => textValue(record.author_name) || 'Personal tribute',
    toForm: (record) => ({
      ...commonForm(record),
      author_name: textValue(record?.author_name),
      author_photo: idValue(record?.author_photo),
      author_role: textValue(record?.author_role),
      related_ministry: idValue(record?.related_ministry),
      related_ministry_name: textValue(record?.related_ministry_name),
      relationship_to_deceased: textValue(record?.relationship_to_deceased),
    }),
    toPayload: (values, memorialId, mode) => ({
      ...commonWorkflowPayload(values, memorialId, mode),
      author_name: nullableText(values.author_name),
      author_photo: nullableId(values.author_photo),
      author_role: nullableText(values.author_role),
      related_ministry: nullableId(values.related_ministry),
      related_ministry_name: nullableText(values.related_ministry_name),
      relationship_to_deceased: nullableText(values.relationship_to_deceased),
    }),
    update: (token, id, payload) =>
      updateMemorialPersonalTribute(token, id, payload as Parameters<typeof updateMemorialPersonalTribute>[2]) as Promise<SpecialistRecord>,
    visualFor: (record) => record.author_photo_detail as WritingMediaAsset | null | undefined,
  },
  {
    collectionKey: 'timeline_events',
    create: (token, payload) =>
      createMemorialTimelineEvent(token, payload as Parameters<typeof createMemorialTimelineEvent>[1]) as Promise<SpecialistRecord>,
    delete: deleteMemorialTimelineEvent,
    descriptionFor: (record) =>
      textValue(record.date_label)
      || [textValue(record.start_year), textValue(record.end_year)].filter(Boolean).join(' - ')
      || textValue(record.event_date)
      || 'Undated',
    empty: 'No timeline events have been created yet.',
    fields: [
      { label: 'Title', name: 'title', required: true },
      { label: 'Date label', name: 'date_label' },
      { kind: 'date', label: 'Event date', name: 'event_date' },
      { kind: 'number', label: 'Start year', name: 'start_year' },
      { kind: 'number', label: 'End year', name: 'end_year' },
      { label: 'Image media id', name: 'image' },
      ...workflowFields,
    ],
    icon: <CalendarDays size={20} aria-hidden="true" />,
    id: 'timeline_events',
    items: (state) => collection(state, 'timeline_events'),
    resource: 'timeline-events',
    title: 'Timeline events',
    titleFor: (record) => textValue(record.title) || 'Timeline event',
    toForm: (record) => ({
      ...commonForm(record),
      date_label: textValue(record?.date_label),
      end_year: numberText(record?.end_year),
      event_date: textValue(record?.event_date).slice(0, 10),
      image: idValue(record?.image),
      start_year: numberText(record?.start_year),
      title: textValue(record?.title),
    }),
    toPayload: (values, memorialId, mode) => ({
      ...commonWorkflowPayload(values, memorialId, mode),
      date_label: nullableText(values.date_label),
      end_year: nullableNumber(values.end_year),
      event_date: nullableText(values.event_date) || null,
      image: nullableId(values.image),
      start_year: nullableNumber(values.start_year),
      title: nullableText(values.title),
    }),
    update: (token, id, payload) =>
      updateMemorialTimelineEvent(token, id, payload as Parameters<typeof updateMemorialTimelineEvent>[2]) as Promise<SpecialistRecord>,
    visualFor: (record) => record.image_detail as WritingMediaAsset | null | undefined,
  },
  {
    collectionKey: 'gallery_items',
    create: (token, payload) =>
      createMemorialGalleryItem(token, payload as Parameters<typeof createMemorialGalleryItem>[1]) as Promise<SpecialistRecord>,
    delete: deleteMemorialGalleryItem,
    descriptionFor: (record) =>
      [textValue(record.taken_at), textValue(record.credit)].filter(Boolean).join(' · ') || `Media asset ${textValue(record.media_asset)}`,
    empty: 'No gallery items have been attached yet.',
    fields: [
      { label: 'Media asset id', name: 'media_asset', required: true },
      { label: 'Caption', name: 'caption' },
      { label: 'Alt text override', name: 'alt_text_override' },
      { kind: 'select', label: 'Category', name: 'category', options: galleryCategoryOptions },
      { label: 'Credit', name: 'credit' },
      { kind: 'date', label: 'Taken at', name: 'taken_at' },
      ...workflowFields.filter((field) => field.name !== 'content_block'),
    ],
    icon: <FileImage size={20} aria-hidden="true" />,
    id: 'gallery_items',
    items: (state) => collection(state, 'gallery_items'),
    resource: 'gallery-items',
    title: 'Gallery items',
    titleFor: (record) => textValue(record.caption) || textValue((record.media_asset_detail as { title?: string } | undefined)?.title) || `Gallery item ${textValue(record.id)}`,
    toForm: (record) => ({
      ...commonForm(record),
      alt_text_override: textValue(record?.alt_text_override),
      caption: textValue(record?.caption),
      category: textValue(record?.category) || 'OTHER',
      credit: textValue(record?.credit),
      media_asset: idValue(record?.media_asset),
      taken_at: textValue(record?.taken_at).slice(0, 10),
    }),
    toPayload: (values, memorialId, mode) => ({
      ...commonWorkflowPayload(values, memorialId, mode, false),
      alt_text_override: nullableText(values.alt_text_override),
      caption: nullableText(values.caption),
      category: textValue(values.category) || 'OTHER',
      credit: nullableText(values.credit),
      media_asset: nullableId(values.media_asset),
      taken_at: nullableText(values.taken_at) || null,
    }),
    update: (token, id, payload) =>
      updateMemorialGalleryItem(token, id, payload as Parameters<typeof updateMemorialGalleryItem>[2]) as Promise<SpecialistRecord>,
    visualFor: (record) => record.media_asset_detail as WritingMediaAsset | null | undefined,
  },
  {
    collectionKey: 'recording_sections',
    create: (token, payload) =>
      createMemorialRecordingSection(token, payload as Parameters<typeof createMemorialRecordingSection>[1]) as Promise<SpecialistRecord>,
    delete: deleteMemorialRecordingSection,
    descriptionFor: (record) => {
      const lookup = memorialRecordingSeriesToLookup(record as unknown as MemorialRecordingSection);
      return [lookup?.name, record.max_items ? `${textValue(record.max_items)} max items` : ''].filter(Boolean).join(' · ') || 'No series linked';
    },
    empty: 'No recording sections have been connected yet.',
    fields: [
      { label: 'Title', name: 'title', required: true },
      {
        helpText: 'Select an existing audio-visual series. Preview items load from audio-visual APIs, not memorial playback fields.',
        kind: 'audio-series',
        label: 'Audio/visual series',
        name: 'audio_visual_series',
      },
      { kind: 'number', label: 'Max items', name: 'max_items' },
      ...workflowFields,
    ],
    icon: <Mic2 size={20} aria-hidden="true" />,
    id: 'recording_sections',
    items: (state) => collection(state, 'recording_sections'),
    resource: 'recording-sections',
    title: 'Recording sections',
    titleFor: (record) => textValue(record.title) || 'Recording section',
    toForm: (record) => ({
      ...commonForm(record),
      audio_visual_series: idValue(record?.audio_visual_series ?? (record?.audio_visual_series_detail as { id?: MemorialId } | undefined)?.id),
      max_items: numberText(record?.max_items),
      title: textValue(record?.title),
    }),
    toPayload: (values, memorialId, mode) => ({
      ...commonWorkflowPayload(values, memorialId, mode),
      audio_visual_series: nullableId(values.audio_visual_series),
      max_items: nullableNumber(values.max_items),
      title: nullableText(values.title),
    }),
    update: (token, id, payload) =>
      updateMemorialRecordingSection(token, id, payload as Parameters<typeof updateMemorialRecordingSection>[2]) as Promise<SpecialistRecord>,
    visualFor: (record) => {
      const series = record.audio_visual_series_detail as { cover_image?: WritingMediaAsset | null; cover_image_detail?: WritingMediaAsset | null } | undefined;
      return series?.cover_image_detail || series?.cover_image;
    },
  },
  {
    collectionKey: 'arrangements',
    create: (token, payload) =>
      createMemorialArrangement(token, payload as Parameters<typeof createMemorialArrangement>[1]) as Promise<SpecialistRecord>,
    delete: deleteMemorialArrangement,
    descriptionFor: (record) =>
      [textValue(record.starts_at), textValue(record.location_name), textValue(record.address)].filter(Boolean).join(' · ') || 'No schedule details',
    empty: 'No arrangements have been added yet.',
    fields: [
      { label: 'Title', name: 'title', required: true },
      { kind: 'select', label: 'Arrangement type', name: 'arrangement_type', options: arrangementTypeOptions },
      { kind: 'datetime-local', label: 'Starts at', name: 'starts_at' },
      { kind: 'datetime-local', label: 'Ends at', name: 'ends_at' },
      { label: 'Location name', name: 'location_name' },
      { kind: 'textarea', label: 'Address', name: 'address' },
      { label: 'Livestream URL', name: 'livestream_url' },
      { label: 'Programme asset id', name: 'programme_asset' },
      { kind: 'checkbox', label: 'Prominent arrangement', name: 'is_prominent' },
      { kind: 'datetime-local', label: 'Display until', name: 'display_until' },
      ...workflowFields,
    ],
    icon: <PlayCircle size={20} aria-hidden="true" />,
    id: 'arrangements',
    items: (state) => collection(state, 'arrangements'),
    resource: 'arrangements',
    title: 'Arrangements',
    titleFor: (record) => textValue(record.title) || 'Arrangement',
    toForm: (record) => ({
      ...commonForm(record),
      address: textValue(record?.address),
      arrangement_type: textValue(record?.arrangement_type) || 'OTHER',
      display_until: textValue(record?.display_until).slice(0, 16),
      ends_at: textValue(record?.ends_at).slice(0, 16),
      is_prominent: boolValue(record?.is_prominent),
      livestream_url: textValue(record?.livestream_url),
      location_name: textValue(record?.location_name),
      programme_asset: idValue(record?.programme_asset),
      starts_at: textValue(record?.starts_at).slice(0, 16),
      title: textValue(record?.title),
    }),
    toPayload: (values, memorialId, mode) => ({
      ...commonWorkflowPayload(values, memorialId, mode),
      address: nullableText(values.address),
      arrangement_type: textValue(values.arrangement_type) || 'OTHER',
      display_until: nullableText(values.display_until) || null,
      ends_at: nullableText(values.ends_at) || null,
      is_prominent: boolValue(values.is_prominent),
      livestream_url: nullableText(values.livestream_url),
      location_name: nullableText(values.location_name),
      programme_asset: nullableId(values.programme_asset),
      starts_at: nullableText(values.starts_at) || null,
      title: nullableText(values.title),
    }),
    update: (token, id, payload) =>
      updateMemorialArrangement(token, id, payload as Parameters<typeof updateMemorialArrangement>[2]) as Promise<SpecialistRecord>,
    visualFor: (record) => record.programme_asset_detail as WritingMediaAsset | null | undefined,
  },
];

const SpecialistRecordCard = ({
  config,
  darkMode,
  onDelete,
  onEdit,
  onWorkflow,
  record,
}: {
  config: PanelConfig;
  darkMode: boolean;
  onDelete: (config: PanelConfig, record: SpecialistRecord) => void;
  onEdit: (config: PanelConfig, record: SpecialistRecord) => void;
  onWorkflow: (config: PanelConfig, record: SpecialistRecord, action: Parameters<typeof runMemorialWorkflowAction>[3]) => void;
  record: SpecialistRecord;
}) => {
  const workflowActions = getAvailableMemorialWorkflowActions(record.status);

  return (
    <article className={`rounded-2xl border p-4 ${portalSurface.card(darkMode)}`}>
      <div className="flex items-start gap-3">
        {recordImage(record, config)}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-serif text-xl leading-tight">{config.titleFor(record)}</h3>
              <p className={`mt-1 text-sm ${portalSurface.softMutedText(darkMode)}`}>
                {config.descriptionFor(record)}
              </p>
            </div>
            <span className="rounded-full border border-red-900/15 bg-red-950/[0.04] px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-red-800 dark:border-red-200/20 dark:bg-red-950/25 dark:text-red-100">
              {getMemorialStatusLabel(record.status)}
            </span>
          </div>
          <p className={`mt-2 text-xs font-bold ${portalSurface.softMutedText(darkMode)}`}>
            Order {record.order || 0} · {record.is_visible ? 'Visible' : 'Hidden'}
          </p>
          {contentBlockPreview(record.content_block_detail, darkMode)}
          {config.id === 'recording_sections' ? (
            <RecordingSeriesPreview darkMode={darkMode} record={record} />
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="inline-flex min-h-9 items-center gap-2 rounded-full border border-red-900/20 px-3 text-xs font-black text-red-800 transition hover:bg-red-950/5 dark:border-red-200/20 dark:text-red-100"
              onClick={() => onEdit(config, record)}
              type="button"
            >
              <Pencil size={14} aria-hidden="true" />
              Edit
            </button>
            {workflowActions.map((action) => (
              <button
                className="inline-flex min-h-9 items-center rounded-full border border-red-900/20 px-3 text-xs font-black text-red-800 transition hover:bg-red-950/5 dark:border-red-200/20 dark:text-red-100"
                key={action}
                onClick={() => onWorkflow(config, record, action)}
                type="button"
              >
                {getMemorialWorkflowActionLabel(action)}
              </button>
            ))}
            <button
              className="inline-flex min-h-9 items-center gap-2 rounded-full border border-red-900/20 px-3 text-xs font-black text-red-800 transition hover:bg-red-950/5"
              onClick={() => onDelete(config, record)}
              type="button"
            >
              <Trash2 size={14} aria-hidden="true" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

const MemorialSpecialistPanelsEditor = ({
  darkMode,
  editorState,
  onEditorStateChange,
}: MemorialSpecialistPanelsEditorProps) => {
  const auth = useAuth();
  const toast = usePortalToast();
  const configs = useMemo(makeConfigs, []);
  const [activeModal, setActiveModal] = useState<ActiveModal | null>(null);
  const [formValues, setFormValues] = useState<FormValues>({});
  const [saving, setSaving] = useState(false);

  const openModal = (config: PanelConfig, record?: SpecialistRecord) => {
    setActiveModal({ config, record });
    setFormValues(config.toForm(record));
  };

  const updateCollection = (
    config: PanelConfig,
    updater: (records: SpecialistRecord[]) => SpecialistRecord[],
  ) => {
    onEditorStateChange((current) => patchCollection(current, config.collectionKey, updater));
  };

  const saveRecord = async () => {
    if (!activeModal || !editorState.page) return;
    const { config, record } = activeModal;
    const missingField = config.fields.find((field) =>
      field.required && !textValue(formValues[field.name]).trim(),
    );
    if (missingField) {
      toast.error(`${missingField.label} is required.`);
      return;
    }

    setSaving(true);
    try {
      const mode = record ? 'update' : 'create';
      const payload = config.toPayload(formValues, editorState.page.id, mode);
      const saved = record
        ? await config.update(auth.accessToken, record.id, payload)
        : await config.create(auth.accessToken, payload);
      updateCollection(config, (records) => appendRecord(records, saved));
      toast.success(`${config.title.slice(0, -1) || config.title} saved.`);
      setActiveModal(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Unable to save ${config.title.toLowerCase()}.`);
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = async (config: PanelConfig, record: SpecialistRecord) => {
    if (!window.confirm(`Delete "${config.titleFor(record)}"?`)) return;
    try {
      await config.delete(auth.accessToken, record.id);
      updateCollection(config, (records) => removeRecord(records, record.id));
      toast.success(`${config.title.slice(0, -1) || config.title} deleted.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Unable to delete ${config.title.toLowerCase()}.`);
    }
  };

  const runWorkflow = async (
    config: PanelConfig,
    record: SpecialistRecord,
    action: Parameters<typeof runMemorialWorkflowAction>[3],
  ) => {
    try {
      const updated = await runMemorialWorkflowAction<SpecialistRecord>(
        auth.accessToken,
        config.resource,
        record.id,
        action,
      );
      updateCollection(config, (records) => replaceRecord(records, updated));
      toast.success(`${getMemorialWorkflowActionLabel(action)} complete.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Workflow action failed.');
    }
  };

  return (
    <section className="grid gap-5 xl:grid-cols-2">
      {configs.map((config) => {
        const items = config.items(editorState);
        return (
          <section
            className={`rounded-3xl border p-5 shadow-lg ${portalSurface.panel(darkMode)}`}
            key={config.id}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className={`grid size-11 place-items-center rounded-2xl ${portalSurface.iconBadge(darkMode)}`}>
                  {config.icon}
                </span>
                <div>
                  <h2 className="font-serif text-2xl leading-tight">{config.title}</h2>
                  <p className={`text-xs font-bold ${portalSurface.softMutedText(darkMode)}`}>
                    {items.length} record{items.length === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
              <button
                className="inline-flex min-h-10 items-center gap-2 rounded-full bg-red-800 px-4 text-sm font-black text-white shadow-lg shadow-red-950/20 transition hover:bg-red-700"
                onClick={() => openModal(config)}
                type="button"
              >
                <Plus size={15} aria-hidden="true" />
                New
              </button>
            </div>
            <div className="mt-5 grid gap-3">
              {items.length ? items.map((record) => (
                <SpecialistRecordCard
                  config={config}
                  darkMode={darkMode}
                  key={record.id}
                  onDelete={(nextConfig, nextRecord) => {
                    void deleteRecord(nextConfig, nextRecord);
                  }}
                  onEdit={openModal}
                  onWorkflow={(nextConfig, nextRecord, action) => {
                    void runWorkflow(nextConfig, nextRecord, action);
                  }}
                  record={record}
                />
              )) : (
                <p className={`rounded-2xl border border-dashed p-4 text-sm ${darkMode ? 'border-white/10 text-stone-400' : 'border-[#eaded0] text-[#786f66]'}`}>
                  {config.empty}
                </p>
              )}
            </div>
          </section>
        );
      })}

      {activeModal ? (
        <PortalModal
          darkMode={darkMode}
          description="Manage order, workflow status, visibility, and the key fields for this memorial child record."
          eyebrow={activeModal.record ? 'Edit record' : 'Create record'}
          footer={
            <div className="flex flex-wrap items-center justify-end gap-3">
              <button
                className={darkMode ? 'rounded-full border border-white/10 px-5 py-3 text-sm font-bold text-stone-200 transition hover:bg-white/10' : 'rounded-full border border-[#eaded0] bg-white px-5 py-3 text-sm font-bold text-zinc-700 transition hover:bg-[#fffaf0]'}
                disabled={saving}
                onClick={() => setActiveModal(null)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-red-800 px-6 text-sm font-black text-white shadow-lg shadow-red-950/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={saving}
                onClick={() => void saveRecord()}
                type="button"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          }
          onClose={() => setActiveModal(null)}
          title={activeModal.config.title}
        >
          <div className="grid gap-4">
            {activeModal.config.fields.map((field) => (
              <SpecialistField
                darkMode={darkMode}
                field={field}
                key={field.name}
                onChange={(value) =>
                  setFormValues((current) => ({ ...current, [field.name]: value }))
                }
                value={formValues[field.name]}
              />
            ))}
          </div>
        </PortalModal>
      ) : null}
    </section>
  );
};

export default MemorialSpecialistPanelsEditor;
