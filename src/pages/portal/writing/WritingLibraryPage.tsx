import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { portalSurface } from '../../../components/portal/portalSurface';
import WritingStudioShell from '../../../components/portal/writing/WritingStudioShell';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import {
  createCategory,
  createCategorySeriesLink,
  createResourceType,
  createResourceTypeCategoryLink,
  createSeries,
  fetchCategories,
  fetchCategorySeriesLinks,
  fetchResourceTypeCategoryLinks,
  fetchResourceTypes,
  fetchSeries,
} from '../../../services/writingApi';
import type {
  WritingCategory,
  WritingCategorySeriesLink,
  WritingResourceType,
  WritingResourceTypeCategoryLink,
  WritingSeries,
} from '../../../types/writing';
import { canManageTaxonomy } from '../../../utils/permissions';

type TaxonomyKind = 'category' | 'resourceType' | 'series';
type CurationKind = 'categorySeries' | 'resourceCategory';

const toSlug = (value: string) => value.toLowerCase().trim().replace(/\s+/g, '-');

const byId = <T extends { id: number | string }>(items: T[], id: number | string) =>
  items.find((item) => String(item.id) === String(id));

const seriesName = (item?: WritingSeries | null) => item?.title || item?.name || item?.slug || 'Collection';

const WritingLibraryPage = () => {
  const auth = useAuth();
  const { darkMode } = useTheme();
  const [categories, setCategories] = useState<WritingCategory[]>([]);
  const [categorySeriesLinks, setCategorySeriesLinks] = useState<WritingCategorySeriesLink[]>([]);
  const [curationKind, setCurationKind] = useState<CurationKind>('resourceCategory');
  const [curationCategory, setCurationCategory] = useState('');
  const [curationResourceType, setCurationResourceType] = useState('');
  const [curationSeries, setCurationSeries] = useState('');
  const [resourceTypes, setResourceTypes] = useState<WritingResourceType[]>([]);
  const [resourceTypeCategoryLinks, setResourceTypeCategoryLinks] = useState<WritingResourceTypeCategoryLink[]>([]);
  const [series, setSeries] = useState<WritingSeries[]>([]);
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [kind, setKind] = useState<TaxonomyKind>('category');

  const load = () => {
    const controller = new AbortController();
    Promise.all([
      fetchResourceTypes(auth.accessToken, controller.signal),
      fetchResourceTypeCategoryLinks(auth.accessToken, controller.signal),
      fetchCategories(auth.accessToken, controller.signal),
      fetchSeries(auth.accessToken, controller.signal),
      fetchCategorySeriesLinks(auth.accessToken, controller.signal),
    ])
      .then(([types, typeCategoryLinks, nextCategories, nextSeries, nextCategorySeriesLinks]) => {
        setResourceTypes(types.results);
        setResourceTypeCategoryLinks(typeCategoryLinks.results);
        setCategories(nextCategories.results);
        setSeries(nextSeries.results);
        setCategorySeriesLinks(nextCategorySeriesLinks.results);
      })
      .catch(() => setMessage('Unable to load Library taxonomy right now.'));
    return controller;
  };

  useEffect(() => {
    const controller = load();
    return () => controller.abort();
  }, [auth.accessToken]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !canManageTaxonomy(auth.permissions)) return;
    const slug = toSlug(name);
    try {
      if (kind === 'resourceType') await createResourceType(auth.accessToken, { name, slug });
      if (kind === 'category') await createCategory(auth.accessToken, { name, slug });
      if (kind === 'series') await createSeries(auth.accessToken, { slug, title: name });
      setName('');
      setMessage('Library item created.');
      load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to create Library item.');
    }
  };

  const handleCurate = async (event: FormEvent) => {
    event.preventDefault();
    if (!canManageTaxonomy(auth.permissions)) return;
    const canCreateResourceCategoryLink = curationKind === 'resourceCategory' && curationResourceType && curationCategory;
    const canCreateCategorySeriesLink = curationKind === 'categorySeries' && curationCategory && curationSeries;

    if (!canCreateResourceCategoryLink && !canCreateCategorySeriesLink) {
      setMessage('Choose both sides of the curation link.');
      return;
    }

    try {
      if (canCreateResourceCategoryLink) {
        await createResourceTypeCategoryLink(auth.accessToken, {
          category: curationCategory,
          is_active: true,
          resource_type: curationResourceType,
          sort_order: resourceTypeCategoryLinks.length + 1,
        });
      }

      if (canCreateCategorySeriesLink) {
        await createCategorySeriesLink(auth.accessToken, {
          category: curationCategory,
          is_active: true,
          series: curationSeries,
          sort_order: categorySeriesLinks.length + 1,
        });
      }

      setMessage('Curation link created.');
      load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to create curation link.');
    }
  };

  const panels = [
    { items: resourceTypes.map((item) => item.name), title: 'Resource Types' },
    { items: categories.map((item) => item.name), title: 'Categories' },
    { items: series.map((item) => seriesName(item)), title: 'Collections' },
    { items: ['Tags placeholder'], title: 'Tags' },
  ];

  const curatedResourceCategories = resourceTypeCategoryLinks.map((link) => {
    const resourceType = link.resource_type_detail || byId(resourceTypes, link.resource_type);
    const category = link.category_detail || byId(categories, link.category);
    return `${resourceType?.name || 'Resource Type'} -> ${category?.name || 'Category'}`;
  });

  const curatedCategorySeries = categorySeriesLinks.map((link) => {
    const category = link.category_detail || byId(categories, link.category);
    const linkedSeries = link.series_detail || byId(series, link.series);
    return `${category?.name || 'Category'} -> ${seriesName(linkedSeries)}`;
  });

  return (
    <WritingStudioShell>
      <div className="grid gap-6 xl:grid-cols-[24rem_1fr]">
        <div className="grid gap-6">
          <form onSubmit={handleCreate} className={`rounded-3xl border p-6 shadow-lg ${portalSurface.panel(darkMode)}`}>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800">Library</p>
            <h2 className="mt-3 font-serif text-4xl">Create taxonomy</h2>
            <p className={`mt-3 text-sm leading-6 ${portalSurface.softMutedText(darkMode)}`}>
              Resource types, categories, and collections are reusable. Curation links decide where they appear.
            </p>
            <select className={`mt-6 w-full rounded-2xl border px-4 py-3 ${darkMode ? 'border-white/10 bg-zinc-950' : 'border-[#eaded0] bg-white'}`} onChange={(event) => setKind(event.target.value as TaxonomyKind)} value={kind}>
              <option value="category">Category</option>
              <option value="resourceType">Resource Type</option>
              <option value="series">Collection</option>
            </select>
            <input className={`mt-4 w-full rounded-2xl border px-4 py-3 outline-none ${darkMode ? 'border-white/10 bg-white/5' : 'border-[#eaded0] bg-white'}`} onChange={(event) => setName(event.target.value)} placeholder="Name" value={name} />
            <button className="mt-5 rounded-full bg-red-800 px-6 py-3 text-sm font-black text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:opacity-50" disabled={!canManageTaxonomy(auth.permissions)} type="submit">Create</button>
            {message ? <p className="mt-5 text-sm font-bold text-red-800">{message}</p> : null}
          </form>

          <form onSubmit={handleCurate} className={`rounded-3xl border p-6 shadow-lg ${portalSurface.panel(darkMode)}`}>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800">Curation Links</p>
            <h2 className="mt-3 font-serif text-4xl">Guide browsing</h2>
            <select className={`mt-6 w-full rounded-2xl border px-4 py-3 ${darkMode ? 'border-white/10 bg-zinc-950' : 'border-[#eaded0] bg-white'}`} onChange={(event) => setCurationKind(event.target.value as CurationKind)} value={curationKind}>
              <option value="resourceCategory">Resource Type {'->'} Category</option>
              <option value="categorySeries">Category {'->'} Collection</option>
            </select>
            {curationKind === 'resourceCategory' ? (
              <select className={`mt-4 w-full rounded-2xl border px-4 py-3 ${darkMode ? 'border-white/10 bg-zinc-950' : 'border-[#eaded0] bg-white'}`} onChange={(event) => setCurationResourceType(event.target.value)} value={curationResourceType}>
                <option value="">Choose resource type</option>
                {resourceTypes.map((resourceType) => <option key={resourceType.id} value={resourceType.id}>{resourceType.name}</option>)}
              </select>
            ) : null}
            <select className={`mt-4 w-full rounded-2xl border px-4 py-3 ${darkMode ? 'border-white/10 bg-zinc-950' : 'border-[#eaded0] bg-white'}`} onChange={(event) => setCurationCategory(event.target.value)} value={curationCategory}>
              <option value="">Choose category</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            {curationKind === 'categorySeries' ? (
              <select className={`mt-4 w-full rounded-2xl border px-4 py-3 ${darkMode ? 'border-white/10 bg-zinc-950' : 'border-[#eaded0] bg-white'}`} onChange={(event) => setCurationSeries(event.target.value)} value={curationSeries}>
                <option value="">Choose collection</option>
                {series.map((item) => <option key={item.id} value={item.id}>{seriesName(item)}</option>)}
              </select>
            ) : null}
            <button className="mt-5 rounded-full bg-red-800 px-6 py-3 text-sm font-black text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:opacity-50" disabled={!canManageTaxonomy(auth.permissions)} type="submit">Create link</button>
          </form>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {panels.map((panel) => (
            <section key={panel.title} className={`rounded-3xl border p-5 shadow-lg ${portalSurface.panel(darkMode)}`}>
              <h3 className="text-lg font-black">{panel.title}</h3>
              <div className="mt-4 grid gap-2">
                {panel.items.length ? panel.items.map((item) => <span key={item} className={`rounded-2xl px-4 py-3 text-sm ${darkMode ? 'bg-white/5 text-stone-300' : 'bg-white text-zinc-700 ring-1 ring-[#eaded0]'}`}>{item}</span>) : <span className={`text-sm ${portalSurface.softMutedText(darkMode)}`}>No items yet.</span>}
              </div>
            </section>
          ))}
          <section className={`rounded-3xl border p-5 shadow-lg ${portalSurface.panel(darkMode)}`}>
            <h3 className="text-lg font-black">Resource Type {'->'} Category</h3>
            <div className="mt-4 grid gap-2">
              {curatedResourceCategories.length ? curatedResourceCategories.map((item) => <span key={item} className={`rounded-2xl px-4 py-3 text-sm ${darkMode ? 'bg-white/5 text-stone-300' : 'bg-white text-zinc-700 ring-1 ring-[#eaded0]'}`}>{item}</span>) : <span className={`text-sm ${portalSurface.softMutedText(darkMode)}`}>No curation links yet.</span>}
            </div>
          </section>
          <section className={`rounded-3xl border p-5 shadow-lg ${portalSurface.panel(darkMode)}`}>
            <h3 className="text-lg font-black">Category {'->'} Collection</h3>
            <div className="mt-4 grid gap-2">
              {curatedCategorySeries.length ? curatedCategorySeries.map((item) => <span key={item} className={`rounded-2xl px-4 py-3 text-sm ${darkMode ? 'bg-white/5 text-stone-300' : 'bg-white text-zinc-700 ring-1 ring-[#eaded0]'}`}>{item}</span>) : <span className={`text-sm ${portalSurface.softMutedText(darkMode)}`}>No curation links yet.</span>}
            </div>
          </section>
        </div>
      </div>
    </WritingStudioShell>
  );
};

export default WritingLibraryPage;








