import type { ReactNode } from 'react';
import { ChevronDown, Settings2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchResourcesNavigation } from '../../../services/resourcesApi';
import type { WritingCategory, WritingResourceType, WritingSeries, WritingStatus } from '../../../types/writing';

export type DocumentSettingsAction = { disabled?: boolean; icon?: ReactNode; label: string; onClick: () => void; variant: 'danger' | 'primary' | 'secondary'; };
type DocumentSettingsPanelProps = { actions: DocumentSettingsAction[]; category: string; coverImageControl?: ReactNode; darkMode: boolean; disabled?: boolean; excerpt: string; metadata?: Array<{ label: string; value: string }>; onCategoryChange: (value: string) => void; onExcerptChange: (value: string) => void; onResourceTypeChange: (value: string) => void; resourceType: string; resourceTypes: WritingResourceType[]; status: WritingStatus; workflowControl?: ReactNode; };
const seriesName = (series: WritingSeries) => series.title || series.name || series.slug;

const DocumentSettingsPanel = ({ actions, category, coverImageControl, darkMode, disabled = false, excerpt, metadata = [], onCategoryChange, onExcerptChange, onResourceTypeChange, resourceType, resourceTypes, status, workflowControl }: DocumentSettingsPanelProps) => {
  const [categories, setCategories] = useState<WritingCategory[]>([]);
  const [series, setSeries] = useState<WritingSeries[]>([]);
  const [taxonomyLoading, setTaxonomyLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const previousTypeSlug = useRef<string | undefined>(undefined);
  const selectedResourceType = useMemo(() => resourceTypes.find((type) => String(type.id) === resourceType), [resourceType, resourceTypes]);
  const selectedCategory = useMemo(() => categories.find((item) => String(item.id) === category), [categories, category]);
  useEffect(() => {
    const resourceTypeSlug = selectedResourceType?.slug;
    if (!resourceTypeSlug) { setCategories([]); setSeries([]); previousTypeSlug.current = undefined; return; }
    if (previousTypeSlug.current && previousTypeSlug.current !== resourceTypeSlug) onCategoryChange('');
    previousTypeSlug.current = resourceTypeSlug;
    const controller = new AbortController(); setTaxonomyLoading(true);
    fetchResourcesNavigation({ category_slug: selectedCategory?.slug, resource_type_slug: resourceTypeSlug }, controller.signal)
      .then((navigation) => { setCategories(navigation.categories); setSeries(navigation.series); if (category && !navigation.categories.some((item) => String(item.id) === category)) onCategoryChange(''); })
      .catch(() => { if (!controller.signal.aborted) { setCategories([]); setSeries([]); } })
      .finally(() => { if (!controller.signal.aborted) setTaxonomyLoading(false); });
    return () => controller.abort();
  }, [category, onCategoryChange, selectedCategory?.slug, selectedResourceType?.slug]);
  const surfaceClass = darkMode ? 'border-white/10 bg-[#171717] shadow-black/25' : 'border-black/10 bg-white shadow-zinc-900/5';
  const fieldClass = darkMode ? 'border-white/10 bg-[#080808] text-stone-100' : 'border-black/10 bg-[#fffaf0] text-zinc-950';
  const mutedTextClass = darkMode ? 'text-stone-400' : 'text-zinc-600';
  const dividerClass = darkMode ? 'border-white/10' : 'border-black/10';
  return (
    <aside aria-label="Document settings" className={'self-start rounded-3xl border p-5 shadow-lg lg:sticky lg:top-6 ' + surfaceClass}>
      <button aria-expanded={open} className="flex w-full items-center justify-between gap-3 text-left lg:pointer-events-none" onClick={() => setOpen((current) => !current)} type="button"><span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-red-800"><Settings2 size={15} /> Document Settings</span><ChevronDown className={'size-4 transition lg:hidden ' + (open ? 'rotate-180' : '')} /></button>
      <div className={(open ? 'grid' : 'hidden') + ' mt-5 gap-5 lg:grid'}>
        <label className="grid gap-2 text-sm font-bold">Status<select className={'w-full rounded-2xl border px-4 py-3 text-sm ' + fieldClass} disabled value={status}><option value={status}>{status.replace('_', ' ')}</option></select><span className={'text-xs font-normal ' + mutedTextClass}>This article is only visible to editors until it is published.</span></label>
        <label className="grid gap-2 text-sm font-bold">Resource type<select className={'w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-800/30 ' + fieldClass} disabled={disabled} onChange={(event) => onResourceTypeChange(event.target.value)} value={resourceType}><option value="">Choose type</option>{resourceTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}</select></label>
        <label className="grid gap-2 text-sm font-bold">Category <span className={'font-normal ' + mutedTextClass}>(optional)</span><select className={'w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-800/30 ' + fieldClass} disabled={disabled || !resourceType || taxonomyLoading || categories.length === 0} onChange={(event) => onCategoryChange(event.target.value)} value={category}><option value="">{taxonomyLoading ? 'Loading categories...' : categories.length ? 'Choose category' : 'No curated categories yet'}</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="grid gap-2 text-sm font-bold">Public excerpt <span className={'font-normal ' + mutedTextClass}>(optional)</span><textarea aria-describedby="excerpt-count" className={'min-h-28 w-full resize-y rounded-2xl border px-4 py-3 text-sm leading-6 outline-none focus:ring-2 focus:ring-red-800/30 ' + fieldClass} disabled={disabled} maxLength={200} onChange={(event) => onExcerptChange(event.target.value)} placeholder="A short invitation to read this resource." value={excerpt} /><span className={'text-right text-xs font-normal ' + mutedTextClass} id="excerpt-count">{excerpt.length} / 200</span></label>
        {coverImageControl ? <div>{coverImageControl}</div> : null}{workflowControl ? workflowControl : null}
        {series.length ? <div className={'border-t pt-5 ' + dividerClass}><p className="text-xs font-black uppercase tracking-[0.16em] text-red-800">Available Collections</p><p className={'mt-3 text-sm leading-6 ' + mutedTextClass}>{series.map(seriesName).join(', ')}</p></div> : null}
        {metadata.length ? <dl className={'grid gap-3 border-t pt-5 text-sm ' + dividerClass + ' ' + (darkMode ? 'text-stone-300' : 'text-zinc-700')}>{metadata.map((item) => <div key={item.label}><dt className="font-black">{item.label}</dt><dd className="mt-1">{item.value}</dd></div>)}</dl> : null}
        {actions.length ? <div className={'grid gap-3 border-t pt-5 ' + dividerClass}>{actions.map((action) => { const actionClass = action.variant === 'primary' ? 'bg-red-800 text-white shadow-lg shadow-red-950/20 hover:bg-red-700' : action.variant === 'danger' ? 'border border-red-900/20 text-red-800 hover:bg-red-950/5' : darkMode ? 'border border-white/15 bg-white/10 text-stone-100 hover:bg-[#080808]' : 'border border-red-900/30 bg-white text-red-800 hover:bg-red-950/5'; return <button key={action.label} className={'inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60 ' + actionClass} disabled={action.disabled} onClick={action.onClick} type="button">{action.icon}{action.label}</button>; })}</div> : null}
      </div>
    </aside>
  );
};
export default DocumentSettingsPanel;

