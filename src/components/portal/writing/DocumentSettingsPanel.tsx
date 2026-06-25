import type { ReactNode } from 'react';
import { ChevronDown, FileText, Layers3, Settings2, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchResourcesNavigation } from '../../../services/resourcesApi';
import type { WritingCategory, WritingResourceType, WritingSeries, WritingStatus } from '../../../types/writing';

export type DocumentSettingsAction = {
  disabled?: boolean;
  icon?: ReactNode;
  label: string;
  onClick: () => void;
  variant: 'danger' | 'primary' | 'secondary';
};

type DocumentSettingsPanelProps = {
  actions: DocumentSettingsAction[];
  category: string;
  coverImageControl?: ReactNode;
  darkMode: boolean;
  disabled?: boolean;
  excerpt: string;
  metadata?: Array<{ label: string; value: string }>;
  onCategoryChange: (value: string) => void;
  onExcerptChange: (value: string) => void;
  onResourceTypeChange: (value: string) => void;
  resourceType: string;
  resourceTypes: WritingResourceType[];
  status: WritingStatus;
  workflowControl?: ReactNode;
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

const seriesName = (series: WritingSeries) => series.title || series.name || series.slug;

const statusLabel = (status: WritingStatus) => status
  .replace(/_/g, ' ')
  .toLowerCase()
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

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
    : 'border-black/10 bg-white/75';
  const mutedTextClass = darkMode ? 'text-stone-400' : 'text-zinc-600';

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

const DocumentSettingsPanel = ({
  actions,
  category,
  coverImageControl,
  darkMode,
  disabled = false,
  excerpt,
  metadata = [],
  onCategoryChange,
  onExcerptChange,
  onResourceTypeChange,
  resourceType,
  resourceTypes,
  status,
  workflowControl,
}: DocumentSettingsPanelProps) => {
  const [categories, setCategories] = useState<WritingCategory[]>([]);
  const [series, setSeries] = useState<WritingSeries[]>([]);
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
    () => categories.find((item) => String(item.id) === category),
    [categories, category],
  );

  useEffect(() => {
    const resourceTypeSlug = selectedResourceType?.slug;

    if (!resourceTypeSlug) {
      setCategories([]);
      setSeries([]);
      previousTypeSlug.current = undefined;
      return;
    }

    if (previousTypeSlug.current && previousTypeSlug.current !== resourceTypeSlug) {
      onCategoryChange('');
    }

    previousTypeSlug.current = resourceTypeSlug;

    const controller = new AbortController();
    setTaxonomyLoading(true);

    fetchResourcesNavigation({ category_slug: selectedCategory?.slug, resource_type_slug: resourceTypeSlug }, controller.signal)
      .then((navigation) => {
        setCategories(navigation.categories);
        setSeries(navigation.series);

        if (category && !navigation.categories.some((item) => String(item.id) === category)) {
          onCategoryChange('');
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setCategories([]);
          setSeries([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setTaxonomyLoading(false);
      });

    return () => controller.abort();
  }, [category, onCategoryChange, selectedCategory?.slug, selectedResourceType?.slug]);

  const toggleSection = (section: SettingsSectionKey) => {
    setOpenSections((current) => ({ ...current, [section]: !current[section] }));
  };

  const shellClass = darkMode
    ? 'border-white/10 bg-[#111111] shadow-black/30'
    : 'border-black/10 bg-[#fffaf0] shadow-zinc-900/8';
  const fieldClass = darkMode
    ? 'border-white/10 bg-[#141414] text-stone-100 placeholder:text-stone-600'
    : 'border-black/10 bg-[#fffaf0] text-zinc-950 placeholder:text-zinc-400';
  const mutedTextClass = darkMode ? 'text-stone-400' : 'text-zinc-600';
  const strongTextClass = darkMode ? 'text-stone-100' : 'text-zinc-950';
  const chipClass = darkMode
    ? 'border-white/10 bg-white/5 text-stone-200'
    : 'border-red-900/10 bg-red-950/[0.03] text-zinc-700';
  const statusPill = (
    <span className="rounded-full border border-red-900/15 bg-red-950/[0.04] px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.16em] text-red-800">
      {statusLabel(status)}
    </span>
  );

  return (
    <aside
      aria-label="Document settings"
      className={`self-start rounded-[2rem] border p-4 shadow-xl lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto ${shellClass}`}
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
            <span className="block text-xs font-black uppercase tracking-[0.18em] text-red-800">Document Settings</span>
            <span className={`mt-1 block truncate text-xs font-medium ${mutedTextClass}`}>
              {statusLabel(status)} · {selectedResourceType?.name || 'Choose resource type'}
            </span>
          </span>
        </span>
        <ChevronDown className={`size-4 shrink-0 transition lg:hidden ${open ? 'rotate-180' : ''}`} />
      </button>

      <div className={`${open ? 'grid' : 'hidden'} mt-5 gap-3 lg:grid`}>
        <CollapsibleSection
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

            <label className="grid gap-2 text-sm font-bold">
              <span>
                Category <span className={`font-normal ${mutedTextClass}`}>(optional)</span>
              </span>
              <select
                className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-red-800/25 ${fieldClass}`}
                disabled={disabled || !resourceType || taxonomyLoading || categories.length === 0}
                onChange={(event) => onCategoryChange(event.target.value)}
                value={category}
              >
                <option value="">
                  {taxonomyLoading ? 'Loading categories...' : categories.length ? 'Choose category' : 'No curated categories yet'}
                </option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
              <span className={`text-xs font-normal ${mutedTextClass}`}>Helps readers find the article in a familiar pastoral lane.</span>
            </label>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
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
        </CollapsibleSection>

        {workflowControl ? (
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

        {(series.length || metadata.length) ? (
          <CollapsibleSection
            darkMode={darkMode}
            icon={<Layers3 size={14} />}
            isOpen={openSections.details}
            onToggle={() => toggleSection('details')}
            title="Article details"
          >
            {series.length ? (
              <div>
                <p className={`text-xs font-bold ${strongTextClass}`}>Available collections</p>
                <p className={`mt-1 text-xs leading-5 ${mutedTextClass}`}>Collections currently available for this resource type.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {series.map((item) => (
                    <span key={item.id || item.slug || seriesName(item)} className={`rounded-full border px-3 py-1 text-xs font-bold ${chipClass}`}>
                      {seriesName(item)}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {metadata.length ? (
              <dl className={`mt-4 grid gap-3 text-sm ${darkMode ? 'text-stone-300' : 'text-zinc-700'}`}>
                {metadata.map((item) => (
                  <div key={item.label} className={`rounded-2xl border px-4 py-3 ${chipClass}`}>
                    <dt className="text-xs font-black uppercase tracking-[0.14em] text-red-800">{item.label}</dt>
                    <dd className="mt-1 font-semibold">{item.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </CollapsibleSection>
        ) : null}

        {actions.length ? (
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
                      : 'border border-black/10 bg-white text-zinc-800 hover:border-red-900/25 hover:bg-red-950/[0.03]';

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
