import type { ReactNode } from 'react';
import { ChevronDown, FileText, Layers3, Plus, Settings2, Sparkles, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchResourcesNavigation } from '../../../services/resourcesApi';
import type { PublicResourceSeries, WritingAuthorAttribution, WritingAuthorRole, WritingCategory, WritingMinistry, WritingResourceType, WritingStatus, WritingTag } from '../../../types/writing';

export type DocumentSettingsAction = {
  disabled?: boolean;
  icon?: ReactNode;
  label: string;
  onClick: () => void;
  variant: 'danger' | 'primary' | 'secondary';
};

type DocumentSettingsPanelProps = {
  actions: DocumentSettingsAction[];
  authorAttributions?: WritingAuthorAttribution[];
  canManageAuthors?: boolean;
  categoryIds?: Array<number | string>;
  coverImageControl?: ReactNode;
  darkMode: boolean;
  disabled?: boolean;
  excerpt: string;
  metadata?: Array<{ label: string; value: string }>;
  ministryIds?: Array<number | string>;
  onAuthorAttributionsChange?: (value: WritingAuthorAttribution[]) => void;
  onCategoryIdsChange: (value: Array<number | string>) => void;
  onExcerptChange: (value: string) => void;
  onMinistryIdsChange?: (value: Array<number | string>) => void;
  onResourceTypeChange: (value: string) => void;
  onSeriesIdsChange?: (value: Array<number | string>) => void;
  onTagIdsChange?: (value: Array<number | string>) => void;
  resourceType: string;
  resourceTypes: WritingResourceType[];
  seriesIds?: Array<number | string>;
  status: WritingStatus;
  tagIds?: Array<number | string>;
  tagOptions?: WritingTag[];
  workflowControl?: ReactNode;
  heading?: string;
  sectionGroup?: 'all' | 'left' | 'right';
};

type SettingsSectionKey = 'actions' | 'basics' | 'details' | 'presentation' | 'workflow';

type CollapsibleSectionProps = {
  children: ReactNode;
  darkMode: boolean;
  description?: string;
  icon?: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  rightAccessory?: ReactNode;
  title: string;
};

const AUTHOR_ROLES: WritingAuthorRole[] = ['AUTHOR', 'CONTRIBUTOR', 'EDITOR', 'REVIEWER', 'COMPILER', 'TRANSLATOR'];
const seriesName = (series: PublicResourceSeries & { name?: string }) => series.title || series.name || series.slug;
const tagName = (tag: WritingTag) => tag.name || tag.slug || String(tag.id);

const statusLabel = (status: WritingStatus) => status
  .replace(/_/g, ' ')
  .toLowerCase()
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

const roleLabel = (role: string) => role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());

const normalizeAuthors = (items: WritingAuthorAttribution[]) => items
  .map((item, index) => ({ ...item, order: index, is_primary: Boolean(item.is_primary) }))
  .filter((item) => item.user !== undefined && item.user !== null || Boolean(item.display_name?.trim()));

const toggleId = (current: Array<number | string>, id: number | string) => {
  const key = String(id);
  return current.some((item) => String(item) === key)
    ? current.filter((item) => String(item) !== key)
    : [...current, id];
};

const CollapsibleSection = ({
  children,
  darkMode,
  description,
  icon,
  isOpen,
  onToggle,
  rightAccessory,
  title,
}: CollapsibleSectionProps) => {
  const sectionClass = darkMode
    ? 'border-white/10 bg-[#080808]/70'
    : 'border-[#eaded0]/80 bg-[#fffaf0]/60';
  const mutedTextClass = darkMode ? 'text-stone-400' : 'text-[#786f66]';

  return (
    <section className={`overflow-hidden rounded-[1.6rem] border ${sectionClass}`}>
      <button
        aria-expanded={isOpen}
        className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left transition hover:bg-red-950/[0.025]"
        onClick={onToggle}
        type="button"
      >
        <span className="min-w-0">
          <span className="flex items-center gap-2 text-[0.68rem] font-black uppercase tracking-[0.18em] text-red-800">
            {icon}
            {title}
          </span>
          {description ? <span className={`mt-2 block text-xs leading-5 ${mutedTextClass}`}>{description}</span> : null}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {rightAccessory}
          <ChevronDown className={`size-4 transition ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </button>
      {isOpen ? <div className="px-4 pb-4">{children}</div> : null}
    </section>
  );
};

const CheckboxGroup = ({
  darkMode,
  disabled,
  emptyLabel,
  label,
  mutedTextClass,
  onChange,
  options,
  selectedIds,
}: {
  darkMode: boolean;
  disabled: boolean;
  emptyLabel: string;
  label: string;
  mutedTextClass: string;
  onChange?: (value: Array<number | string>) => void;
  options: Array<{ id: number | string; label: string }>;
  selectedIds: Array<number | string>;
}) => {
  const selected = new Set(selectedIds.map((id) => String(id)));
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-red-800">{label}</p>
      {options.length ? (
        <div className="mt-3 grid gap-2">
          {options.map((option) => {
            const checked = selected.has(String(option.id));
            return (
              <label key={option.id} className={`flex items-center gap-3 rounded-2xl border px-3 py-2 text-sm font-bold transition ${checked ? 'border-red-800 bg-red-950/[0.05] text-red-800' : darkMode ? 'border-white/10 bg-white/5 text-stone-200' : 'border-[#eaded0] bg-[#fffaf0] text-zinc-800'}`}>
                <input
                  checked={checked}
                  className="size-4 accent-red-800"
                  disabled={disabled || !onChange}
                  onChange={() => onChange?.(toggleId(selectedIds, option.id))}
                  type="checkbox"
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
      ) : <p className={`mt-2 text-xs leading-5 ${mutedTextClass}`}>{emptyLabel}</p>}
    </div>
  );
};

const AuthorAttributionEditor = ({
  authors,
  canManageAuthors,
  darkMode,
  disabled,
  fieldClass,
  mutedTextClass,
  onChange,
}: {
  authors: WritingAuthorAttribution[];
  canManageAuthors: boolean;
  darkMode: boolean;
  disabled: boolean;
  fieldClass: string;
  mutedTextClass: string;
  onChange?: (value: WritingAuthorAttribution[]) => void;
}) => {
  const editable = canManageAuthors && !disabled && Boolean(onChange);
  const updateAuthor = (index: number, patch: Partial<WritingAuthorAttribution>) => {
    const next = authors.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item);
    onChange?.(normalizeAuthors(next));
  };
  const setPrimary = (index: number) => onChange?.(normalizeAuthors(authors.map((item, itemIndex) => ({ ...item, is_primary: itemIndex === index }))));
  const removeAuthor = (index: number) => onChange?.(normalizeAuthors(authors.filter((_, itemIndex) => itemIndex !== index)));
  const addAuthor = () => onChange?.([...authors, { display_name: '', role: 'AUTHOR', is_primary: authors.length === 0, order: authors.length }]);

  return (
    <div className="border-t border-[#eaded0] pt-4 dark:border-white/10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-red-800">Author attributions</p>
          <p className={`mt-1 text-xs leading-5 ${mutedTextClass}`}>{editable ? 'Manage the public byline for this article.' : 'Byline management requires editor permission.'}</p>
        </div>
        {editable ? <button className="inline-flex items-center gap-2 rounded-full bg-red-800 px-3 py-2 text-xs font-black text-white" onClick={addAuthor} type="button"><Plus size={14} /> Add</button> : null}
      </div>

      {authors.length ? (
        <div className="mt-3 grid gap-3">
          {authors.map((author, index) => (
            <div key={`${author.user || 'manual'}-${index}`} className={darkMode ? 'rounded-2xl border border-white/10 bg-white/5 p-3' : 'rounded-2xl border border-[#eaded0] bg-[#fffaf0] p-3'}>
              <label className="grid gap-2 text-sm font-bold">
                Display name
                <input className={`w-full rounded-2xl border px-3 py-2 text-sm outline-none ${fieldClass}`} disabled={!editable} onChange={(event) => updateAuthor(index, { display_name: event.target.value })} placeholder="AIC Njoro Town Editorial Team" value={author.display_name || author.name || ''} />
              </label>
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                <label className="grid gap-2 text-sm font-bold">
                  Role
                  <select className={`w-full rounded-2xl border px-3 py-2 text-sm outline-none ${fieldClass}`} disabled={!editable} onChange={(event) => updateAuthor(index, { role: event.target.value as WritingAuthorRole })} value={author.role || 'AUTHOR'}>
                    {AUTHOR_ROLES.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}
                  </select>
                </label>
                <label className="flex items-end gap-2 pb-2 text-sm font-bold">
                  <input checked={Boolean(author.is_primary)} className="size-4 accent-red-800" disabled={!editable} onChange={() => setPrimary(index)} type="radio" /> Primary
                </label>
              </div>
              {editable ? <button className="mt-3 inline-flex items-center gap-2 rounded-full border border-red-900/20 px-3 py-2 text-xs font-black text-red-800" onClick={() => removeAuthor(index)} type="button"><Trash2 size={14} /> Remove</button> : null}
            </div>
          ))}
        </div>
      ) : <p className={`mt-3 text-xs leading-5 ${mutedTextClass}`}>No author attributions added yet.</p>}
    </div>
  );
};

const DocumentSettingsPanel = ({
  actions,
  authorAttributions = [],
  canManageAuthors = false,
  categoryIds = [],
  coverImageControl,
  darkMode,
  disabled = false,
  excerpt,
  metadata = [],
  ministryIds = [],
  onAuthorAttributionsChange,
  onCategoryIdsChange,
  onExcerptChange,
  onMinistryIdsChange,
  onResourceTypeChange,
  onSeriesIdsChange,
  onTagIdsChange,
  resourceType,
  resourceTypes,
  seriesIds = [],
  status,
  tagIds = [],
  tagOptions = [],
  workflowControl,
  heading = 'Document Settings',
  sectionGroup = 'all',
}: DocumentSettingsPanelProps) => {
  const [categories, setCategories] = useState<WritingCategory[]>([]);
  const [ministries, setMinistries] = useState<WritingMinistry[]>([]);
  const [series, setSeries] = useState<PublicResourceSeries[]>([]);
  const [taxonomyLoading, setTaxonomyLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<SettingsSectionKey, boolean>>({
    actions: false,
    basics: true,
    details: false,
    presentation: false,
    workflow: false,
  });
  const previousTypeSlug = useRef<string | undefined>(undefined);

  const selectedResourceType = useMemo(
    () => resourceTypes.find((type) => String(type.id) === resourceType),
    [resourceType, resourceTypes],
  );
  const selectedCategory = useMemo(
    () => categories.find((item) => categoryIds.some((id) => String(id) === String(item.id))),
    [categories, categoryIds],
  );

  useEffect(() => {
    const resourceTypeSlug = selectedResourceType?.slug;

    if (previousTypeSlug.current && previousTypeSlug.current !== resourceTypeSlug) {
      onCategoryIdsChange([]);
    }
    previousTypeSlug.current = resourceTypeSlug;

    const controller = new AbortController();
    setTaxonomyLoading(true);

    fetchResourcesNavigation(resourceTypeSlug ? { category_slug: selectedCategory?.slug, resource_type_slug: resourceTypeSlug } : {}, controller.signal)
      .then((navigation) => {
        setMinistries(navigation.ministries);
        setCategories(resourceTypeSlug ? navigation.categories : []);
        setSeries(navigation.series);

        if (resourceTypeSlug && categoryIds.length && !categoryIds.every((id) => navigation.categories.some((item) => String(item.id) === String(id)))) {
          onCategoryIdsChange(categoryIds.filter((id) => navigation.categories.some((item) => String(item.id) === String(id))));
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setCategories([]);
          setMinistries([]);
          setSeries([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setTaxonomyLoading(false);
      });

    return () => controller.abort();
  }, [categoryIds, onCategoryIdsChange, selectedCategory?.slug, selectedResourceType?.slug]);

  const selectedSeries = seriesIds
    .map((id) => series.find((item) => String(item.id) === String(id)))
    .filter((item): item is PublicResourceSeries => Boolean(item));

  const moveSeries = (index: number, direction: -1 | 1) => {
    if (!onSeriesIdsChange) return;
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= seriesIds.length) return;
    const next = [...seriesIds];
    const [item] = next.splice(index, 1);
    next.splice(nextIndex, 0, item);
    onSeriesIdsChange(next);
  };
  const toggleSection = (section: SettingsSectionKey) => {
    setOpenSections((current) => ({ ...current, [section]: !current[section] }));
  };

  const shellClass = darkMode
    ? 'border-white/10 bg-[#111111] shadow-black/30'
    : 'border-[#eaded0] bg-[#fffaf0] shadow-zinc-900/8';
  const fieldClass = darkMode
    ? 'border-white/10 bg-[#141414] text-stone-100 placeholder:text-stone-600'
    : 'border-[#eaded0] bg-white text-zinc-950 placeholder:text-[#8a7d70]';
  const mutedTextClass = darkMode ? 'text-stone-400' : 'text-[#786f66]';
  const chipClass = darkMode
    ? 'border-white/10 bg-white/5 text-stone-200'
    : 'border-[#eaded0] bg-white/60 text-[#5f574f]';
  const statusPill = (
    <span className="rounded-full border border-red-900/15 bg-red-950/[0.04] px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.16em] text-red-800">
      {statusLabel(status)}
    </span>
  );
  const showDetails = Boolean(series.length || ministries.length || tagOptions.length || authorAttributions.length || metadata.length);
  const showBasics = sectionGroup === 'all' || sectionGroup === 'left';
  const showPresentation = sectionGroup === 'all' || sectionGroup === 'left';
  const showWorkflow = sectionGroup === 'all' || sectionGroup === 'right';
  const showArticleDetails = sectionGroup === 'all' || sectionGroup === 'right';
  const showActions = sectionGroup === 'all';

  return (
    <aside
      aria-label="Document settings"
      className={`self-start rounded-[2rem] border p-4 shadow-xl xl:sticky xl:top-28 xl:max-h-[calc(100vh-8rem)] xl:overflow-y-auto ${shellClass}`}
    >
      <button
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 rounded-2xl px-1 text-left lg:pointer-events-none"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className={darkMode ? 'grid size-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/5 text-red-300' : 'grid size-10 shrink-0 place-items-center rounded-2xl border border-red-900/10 bg-white text-red-800 shadow-sm'}>
            <Settings2 size={17} />
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-black uppercase tracking-[0.18em] text-red-800">{heading}</span>
            <span className={`mt-1 block truncate text-xs font-medium ${mutedTextClass}`}>
              {statusLabel(status)} &middot; {selectedResourceType?.name || 'Choose resource type'}
            </span>
          </span>
        </span>
        <ChevronDown className={`size-4 shrink-0 transition lg:hidden ${open ? 'rotate-180' : ''}`} />
      </button>

      <div className={`${open ? 'grid' : 'hidden'} mt-5 gap-3 lg:grid`}>
        {showBasics ? <CollapsibleSection
          darkMode={darkMode}
          description="Classify where this writing belongs in the resource library."
          icon={<FileText size={14} />}
          isOpen={openSections.basics}
          onToggle={() => toggleSection('basics')}
          rightAccessory={statusPill}
          title="Article basics"
        >
          <div className={`mb-4 rounded-2xl border px-4 py-3 ${chipClass}`}>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-red-800">Visibility</p>
            <p className={`mt-1 text-xs leading-5 ${mutedTextClass}`}>This article is only visible to editors until it is published.</p>
          </div>

          <div className="grid gap-4">
            <label className="grid gap-2 text-sm font-bold">
              Resource type
              <select
                className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-red-800/25 ${fieldClass}`}
                disabled={disabled}
                onChange={(event) => onResourceTypeChange(event.target.value)}
                value={resourceType}
              >
                <option value="">Choose type</option>
                {resourceTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
              <span className={`text-xs font-normal ${mutedTextClass}`}>Where this writing lives in the public resource library.</span>
            </label>

            <CheckboxGroup
              darkMode={darkMode}
              disabled={disabled || !resourceType || taxonomyLoading}
              emptyLabel={taxonomyLoading ? 'Loading categories...' : 'No curated categories yet.'}
              label="Categories"
              mutedTextClass={mutedTextClass}
              onChange={onCategoryIdsChange}
              options={categories.map((item) => ({ id: item.id, label: item.name }))}
              selectedIds={categoryIds}
            />
          </div>
        </CollapsibleSection> : null}

        {showPresentation ? <CollapsibleSection
          darkMode={darkMode}
          description="Shape how this article appears in cards, previews, and shared surfaces."
          icon={<Sparkles size={14} />}
          isOpen={openSections.presentation}
          onToggle={() => toggleSection('presentation')}
          title="Public presentation"
        >
          <label className="grid gap-2 text-sm font-bold">
            <span>
              Public excerpt <span className={`font-normal ${mutedTextClass}`}>(optional)</span>
            </span>
            <textarea
              aria-describedby="excerpt-count"
              className={`min-h-28 w-full resize-y rounded-2xl border px-4 py-3 text-sm leading-6 outline-none transition focus:ring-2 focus:ring-red-800/25 ${fieldClass}`}
              disabled={disabled}
              maxLength={200}
              onChange={(event) => onExcerptChange(event.target.value)}
              placeholder="A short invitation to read this resource."
              value={excerpt}
            />
            <span className={`flex items-center justify-between gap-3 text-xs font-normal ${mutedTextClass}`} id="excerpt-count">
              <span>Shown in article cards and public previews.</span>
              <span className="shrink-0">{excerpt.length} / 200</span>
            </span>
          </label>

          {coverImageControl ? <div className="mt-5">{coverImageControl}</div> : null}
        </CollapsibleSection> : null}

        {showWorkflow && workflowControl ? (
          <CollapsibleSection
            darkMode={darkMode}
            description="Move this writing through review, scheduling, and publishing readiness."
            icon={<Layers3 size={14} />}
            isOpen={openSections.workflow}
            onToggle={() => toggleSection('workflow')}
            title="Editorial workflow"
          >
            {workflowControl}
          </CollapsibleSection>
        ) : null}

        {showArticleDetails && showDetails ? (
          <CollapsibleSection
            darkMode={darkMode}
            icon={<Layers3 size={14} />}
            isOpen={openSections.details}
            onToggle={() => toggleSection('details')}
            title="Article details"
          >
            <div className="grid gap-5">
              <div>
                <CheckboxGroup darkMode={darkMode} disabled={disabled} emptyLabel="No collections available yet." label="Series / collections" mutedTextClass={mutedTextClass} onChange={onSeriesIdsChange} options={series.map((item) => ({ id: item.id, label: seriesName(item) }))} selectedIds={seriesIds} />
                {selectedSeries.length ? (
                  <div className="mt-3 rounded-2xl border border-[#eaded0] bg-white/60 p-3 dark:border-white/10 dark:bg-white/5">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-red-800">Series order</p>
                    <p className={`mt-1 text-xs leading-5 ${mutedTextClass}`}>This order is sent as series_ids.</p>
                    <ol className="mt-3 grid gap-2">
                      {selectedSeries.map((item, index) => (
                        <li key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[#eaded0] bg-white px-3 py-2 text-sm font-bold dark:border-white/10 dark:bg-black/20">
                          <span>{index + 1}. {seriesName(item)}</span>
                          <span className="flex gap-2">
                            <button className="rounded-full border border-[#eaded0] px-2 py-1 text-[0.68rem] font-black uppercase tracking-[0.12em] text-[#5f574f] disabled:opacity-40 dark:border-white/10 dark:text-stone-200" disabled={disabled || index === 0} onClick={() => moveSeries(index, -1)} type="button">Up</button>
                            <button className="rounded-full border border-[#eaded0] px-2 py-1 text-[0.68rem] font-black uppercase tracking-[0.12em] text-[#5f574f] disabled:opacity-40 dark:border-white/10 dark:text-stone-200" disabled={disabled || index === selectedSeries.length - 1} onClick={() => moveSeries(index, 1)} type="button">Down</button>
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}
              </div>
              <CheckboxGroup darkMode={darkMode} disabled={disabled} emptyLabel="No ministries available yet." label="Ministries" mutedTextClass={mutedTextClass} onChange={onMinistryIdsChange} options={ministries.map((item) => ({ id: item.id, label: item.name }))} selectedIds={ministryIds} />
              <CheckboxGroup darkMode={darkMode} disabled={disabled} emptyLabel="No tags available yet." label="Tags" mutedTextClass={mutedTextClass} onChange={onTagIdsChange} options={tagOptions.map((item) => ({ id: item.id, label: tagName(item) }))} selectedIds={tagIds} />
              <AuthorAttributionEditor authors={authorAttributions} canManageAuthors={canManageAuthors} darkMode={darkMode} disabled={disabled} fieldClass={fieldClass} mutedTextClass={mutedTextClass} onChange={onAuthorAttributionsChange} />

              {metadata.length ? (
                <dl className={`grid gap-3 text-sm ${darkMode ? 'text-stone-300' : 'text-zinc-700'}`}>
                  {metadata.map((item) => (
                    <div key={item.label} className={`rounded-2xl border px-4 py-3 ${chipClass}`}>
                      <dt className="text-xs font-black uppercase tracking-[0.14em] text-red-800">{item.label}</dt>
                      <dd className="mt-1 font-semibold">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
          </CollapsibleSection>
        ) : null}

        {showActions && actions.length ? (
          <CollapsibleSection
            darkMode={darkMode}
            isOpen={openSections.actions}
            onToggle={() => toggleSection('actions')}
            title="Actions"
          >
            <div className="grid gap-3">
              {actions.map((action) => {
                const actionClass = action.variant === 'primary'
                  ? 'bg-red-800 text-white shadow-lg shadow-red-950/20 hover:bg-red-700'
                  : action.variant === 'danger'
                    ? darkMode
                      ? 'border border-red-700/30 bg-red-950/10 text-red-300 hover:bg-red-950/20'
                      : 'border border-red-900/20 bg-white text-red-800 hover:bg-red-950/5'
                    : darkMode
                      ? 'border border-white/15 bg-white/5 text-stone-100 hover:bg-white/10'
                      : 'border border-[#eaded0] bg-white text-zinc-800 hover:border-red-900/25 hover:bg-red-950/[0.03]';

                return (
                  <button
                    key={action.label}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${actionClass}`}
                    disabled={action.disabled}
                    onClick={action.onClick}
                    type="button"
                  >
                    {action.icon}
                    {action.label}
                  </button>
                );
              })}
            </div>
          </CollapsibleSection>
        ) : null}
      </div>
    </aside>
  );
};

export default DocumentSettingsPanel;


