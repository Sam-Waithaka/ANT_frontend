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
  createWritingTag,
  fetchCategories,
  fetchCategorySeriesLinks,
  fetchResourceTypeCategoryLinks,
  fetchResourceTypes,
  fetchSeries,
  fetchWritingTags,
} from '../../../services/writingApi';
import type {
  WritingCategory,
  WritingCategorySeriesLink,
  WritingResourceType,
  WritingResourceTypeCategoryLink,
  WritingSeries,
  WritingTag,
} from '../../../types/writing';
import { canManageTaxonomy } from '../../../utils/permissions';

type TaxonomyKind = 'category' | 'resourceType' | 'series' | 'tag';
type CurationKind = 'categorySeries' | 'resourceCategory';

type LibraryItemForm = {
  active: boolean;
  description: string;
  featured: boolean;
  name: string;
  parent: string;
  slug: string;
  sortOrder: string;
};

type PathwayForm = {
  active: boolean;
  category: string;
  featured: boolean;
  resourceType: string;
  series: string;
  sortOrder: string;
};

const emptyLibraryItemForm = (): LibraryItemForm => ({
  active: true,
  description: '',
  featured: false,
  name: '',
  parent: '',
  slug: '',
  sortOrder: '0',
});

const emptyPathwayForm = (): PathwayForm => ({
  active: true,
  category: '',
  featured: false,
  resourceType: '',
  series: '',
  sortOrder: '0',
});

const toSlug = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

const toSortOrder = (value: string, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const byId = <T extends { id: number | string }>(items: T[], id: number | string) =>
  items.find((item) => String(item.id) === String(id));

const seriesName = (item?: WritingSeries | null) => item?.title || item?.name || item?.slug || 'Series';

const WritingLibraryPage = () => {
  const auth = useAuth();
  const { darkMode } = useTheme();
  const [categories, setCategories] = useState<WritingCategory[]>([]);
  const [categorySeriesLinks, setCategorySeriesLinks] = useState<WritingCategorySeriesLink[]>([]);
  const [curationKind, setCurationKind] = useState<CurationKind>('resourceCategory');
  const [itemForm, setItemForm] = useState<LibraryItemForm>(() => emptyLibraryItemForm());
  const [pathwayForm, setPathwayForm] = useState<PathwayForm>(() => emptyPathwayForm());
  const [resourceTypes, setResourceTypes] = useState<WritingResourceType[]>([]);
  const [resourceTypeCategoryLinks, setResourceTypeCategoryLinks] = useState<WritingResourceTypeCategoryLink[]>([]);
  const [series, setSeries] = useState<WritingSeries[]>([]);
  const [tags, setTags] = useState<WritingTag[]>([]);
  const [message, setMessage] = useState('');
  const [kind, setKind] = useState<TaxonomyKind>('category');

  const load = () => {
    const controller = new AbortController();
    Promise.all([
      fetchResourceTypes(auth.accessToken, controller.signal),
      fetchResourceTypeCategoryLinks(auth.accessToken, controller.signal),
      fetchCategories(auth.accessToken, controller.signal),
      fetchSeries(auth.accessToken, controller.signal),
      fetchWritingTags(auth.accessToken, controller.signal),
      fetchCategorySeriesLinks(auth.accessToken, controller.signal),
    ])
      .then(([types, typeCategoryLinks, nextCategories, nextSeries, nextTags, nextCategorySeriesLinks]) => {
        setResourceTypes(types.results);
        setResourceTypeCategoryLinks(typeCategoryLinks.results);
        setCategories(nextCategories.results);
        setSeries(nextSeries.results);
        setTags(nextTags.results);
        setCategorySeriesLinks(nextCategorySeriesLinks.results);
      })
      .catch(() => setMessage('Unable to load Library taxonomy right now.'));
    return controller;
  };

  useEffect(() => {
    const controller = load();
    return () => controller.abort();
  }, [auth.accessToken]);

  const updateItemForm = <Key extends keyof LibraryItemForm>(key: Key, value: LibraryItemForm[Key]) => {
    setItemForm((current) => ({ ...current, [key]: value }));
  };

  const updatePathwayForm = <Key extends keyof PathwayForm>(key: Key, value: PathwayForm[Key]) => {
    setPathwayForm((current) => ({ ...current, [key]: value }));
  };

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!itemForm.name.trim() || !canManageTaxonomy(auth.permissions)) return;
    const slug = itemForm.slug.trim() || toSlug(itemForm.name);
    const sort_order = toSortOrder(itemForm.sortOrder, 0);

    try {
      if (kind === 'resourceType') {
        await createResourceType(auth.accessToken, {
          description: itemForm.description,
          is_active: itemForm.active,
          is_featured: itemForm.featured,
          name: itemForm.name,
          slug,
          sort_order,
        });
      }

      if (kind === 'category') {
        await createCategory(auth.accessToken, {
          description: itemForm.description,
          is_active: itemForm.active,
          is_featured: itemForm.featured,
          name: itemForm.name,
          parent: itemForm.parent || null,
          slug,
          sort_order,
        });
      }

      if (kind === 'series') {
        await createSeries(auth.accessToken, {
          description: itemForm.description,
          is_active: itemForm.active,
          is_featured: itemForm.featured,
          slug,
          sort_order,
          title: itemForm.name,
        });
      }

      if (kind === 'tag') {
        await createWritingTag(auth.accessToken, {
          name: itemForm.name,
          slug,
        });
      }

      setItemForm(emptyLibraryItemForm());
      setMessage('Library item created.');
      load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to create Library item.');
    }
  };

  const handleCurate = async (event: FormEvent) => {
    event.preventDefault();
    if (!canManageTaxonomy(auth.permissions)) return;
    const canCreateResourceCategoryLink = curationKind === 'resourceCategory' && pathwayForm.resourceType && pathwayForm.category;
    const canCreateCategorySeriesLink = curationKind === 'categorySeries' && pathwayForm.category && pathwayForm.series;

    if (!canCreateResourceCategoryLink && !canCreateCategorySeriesLink) {
      setMessage('Choose both sides of the browse pathway.');
      return;
    }

    try {
      if (canCreateResourceCategoryLink) {
        await createResourceTypeCategoryLink(auth.accessToken, {
          category: pathwayForm.category,
          is_active: pathwayForm.active,
          is_featured: pathwayForm.featured,
          resource_type: pathwayForm.resourceType,
          sort_order: toSortOrder(pathwayForm.sortOrder, resourceTypeCategoryLinks.length + 1),
        });
      }

      if (canCreateCategorySeriesLink) {
        await createCategorySeriesLink(auth.accessToken, {
          category: pathwayForm.category,
          is_active: pathwayForm.active,
          is_featured: pathwayForm.featured,
          series: pathwayForm.series,
          sort_order: toSortOrder(pathwayForm.sortOrder, categorySeriesLinks.length + 1),
        });
      }

      setPathwayForm(emptyPathwayForm());
      setMessage('Browse pathway created.');
      load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to create browse pathway.');
    }
  };

  const inputClass = `w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-red-800/25 ${darkMode ? 'border-white/10 bg-white/5 text-stone-100 placeholder:text-stone-500' : 'border-[#eaded0] bg-white text-zinc-950 placeholder:text-[#8a7d70]'}`;
  const labelClass = `text-[0.68rem] font-black uppercase tracking-[0.18em] ${darkMode ? 'text-red-200' : 'text-red-800'}`;
  const helperClass = `text-xs leading-5 ${portalSurface.softMutedText(darkMode)}`;
  const checkboxClass = `flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-sm font-bold ${darkMode ? 'border-white/10 bg-white/5 text-stone-200' : 'border-[#eaded0] bg-white text-zinc-800'}`;
  const showRichFields = kind !== 'tag';
  const itemNameLabel = kind === 'series' ? 'Series title' : 'Name';
  const itemSlug = itemForm.slug || toSlug(itemForm.name);

  const primaryPanels = [
    { description: 'Broad shelves that shape public resource browsing.', items: resourceTypes.map((item) => item.name), title: 'Resource Types' },
    { description: 'Topics and themes that help readers find related writings.', items: categories.map((item) => item.name), title: 'Categories' },
    { description: 'Curated journeys or ordered collections of writings.', items: series.map((item) => seriesName(item)), title: 'Series' },
    { description: 'Lightweight labels for secondary discovery and search.', items: tags.map((item) => item.name), title: 'Tags' },
  ];

  const curatedResourceCategories = resourceTypeCategoryLinks.map((link) => {
    const resourceType = link.resource_type_detail || byId(resourceTypes, link.resource_type);
    const category = link.category_detail || byId(categories, link.category);
    return `${resourceType?.name || 'Resource Type'} \u2192 ${category?.name || 'Category'}`;
  });

  const curatedCategorySeries = categorySeriesLinks.map((link) => {
    const category = link.category_detail || byId(categories, link.category);
    const linkedSeries = link.series_detail || byId(series, link.series);
    return `${category?.name || 'Category'} \u2192 ${seriesName(linkedSeries)}`;
  });

  const renderItemList = (items: string[], emptyLabel: string) => (
    <div className="mt-4 grid gap-2">
      {items.length
        ? items.map((item) => <span key={item} className={`rounded-2xl px-4 py-3 text-sm ${darkMode ? 'bg-white/5 text-stone-300' : 'bg-white text-zinc-700 ring-1 ring-[#eaded0]'}`}>{item}</span>)
        : <span className={`text-sm ${portalSurface.softMutedText(darkMode)}`}>{emptyLabel}</span>}
    </div>
  );

  return (
    <WritingStudioShell>
      <div className="grid gap-8">
        <section className={`rounded-[2rem] border p-6 shadow-lg sm:p-8 ${portalSurface.panel(darkMode)}`}>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800">Library Architecture</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">Shape how writings are discovered.</h1>
          <p className={`mt-4 max-w-3xl text-sm leading-7 sm:text-base ${portalSurface.mutedText(darkMode)}`}>
            Manage the shelves, topics, series, and tags that help readers browse church writings with clarity and purpose.
          </p>
        </section>

        <div className="grid gap-6 xl:grid-cols-[26rem_1fr]">
          <div className="grid gap-6 self-start">
            <form onSubmit={handleCreate} className={`rounded-3xl border p-6 shadow-lg ${portalSurface.panel(darkMode)}`}>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800">Library Item</p>
              <h2 className="mt-3 font-serif text-4xl">Create library item</h2>
              <p className={`mt-3 text-sm leading-6 ${portalSurface.softMutedText(darkMode)}`}>
                Add the resource shelves, topics, series, and labels readers will use to discover writings.
              </p>
              <div className="mt-6 grid gap-4">
                <label className="grid gap-2">
                  <span className={labelClass}>Item type</span>
                  <select className={inputClass} onChange={(event) => { setKind(event.target.value as TaxonomyKind); setItemForm(emptyLibraryItemForm()); }} value={kind}>
                    <option value="category">Category</option>
                    <option value="resourceType">Resource Type</option>
                    <option value="series">Series</option>
                    <option value="tag">Tag</option>
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className={labelClass}>{itemNameLabel}</span>
                  <input className={inputClass} onChange={(event) => updateItemForm('name', event.target.value)} placeholder={kind === 'series' ? 'Project 52' : 'Prayer'} value={itemForm.name} />
                </label>

                <label className="grid gap-2">
                  <span className={labelClass}>Slug</span>
                  <input className={inputClass} onChange={(event) => updateItemForm('slug', event.target.value)} placeholder={itemSlug || 'prayer'} value={itemForm.slug} />
                  <span className={helperClass}>Leave blank to generate: {itemSlug || 'item-slug'}</span>
                </label>

                {showRichFields ? (
                  <>
                    <label className="grid gap-2">
                      <span className={labelClass}>Description</span>
                      <textarea className={`${inputClass} min-h-28 resize-y`} onChange={(event) => updateItemForm('description', event.target.value)} placeholder="Describe how this helps readers browse the library." value={itemForm.description} />
                    </label>

                    {kind === 'category' ? (
                      <label className="grid gap-2">
                        <span className={labelClass}>Parent category optional</span>
                        <select className={inputClass} onChange={(event) => updateItemForm('parent', event.target.value)} value={itemForm.parent}>
                          <option value="">No parent category</option>
                          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                        </select>
                      </label>
                    ) : null}

                    <label className="grid gap-2">
                      <span className={labelClass}>Sort order</span>
                      <input className={inputClass} inputMode="numeric" onChange={(event) => updateItemForm('sortOrder', event.target.value)} placeholder="0" type="number" value={itemForm.sortOrder} />
                    </label>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className={checkboxClass}>
                        <span>Active</span>
                        <input checked={itemForm.active} onChange={(event) => updateItemForm('active', event.target.checked)} type="checkbox" />
                      </label>
                      <label className={checkboxClass}>
                        <span>Featured</span>
                        <input checked={itemForm.featured} onChange={(event) => updateItemForm('featured', event.target.checked)} type="checkbox" />
                      </label>
                    </div>
                  </>
                ) : null}
              </div>
              <button className="mt-5 rounded-full bg-red-800 px-6 py-3 text-sm font-black text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:opacity-50" disabled={!canManageTaxonomy(auth.permissions)} type="submit">Create</button>
              {message ? <p className="mt-5 text-sm font-bold text-red-800">{message}</p> : null}
            </form>

            <form onSubmit={handleCurate} className={`rounded-3xl border p-6 shadow-lg ${portalSurface.panel(darkMode)}`}>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800">Browse Pathways</p>
              <h2 className="mt-3 font-serif text-4xl">Guide browsing</h2>
              <p className={`mt-3 text-sm leading-6 ${portalSurface.softMutedText(darkMode)}`}>
                Connect broad shelves to relevant topics, and topics to curated series.
              </p>
              <div className="mt-6 grid gap-4">
                <label className="grid gap-2">
                  <span className={labelClass}>Pathway type</span>
                  <select className={inputClass} onChange={(event) => { setCurationKind(event.target.value as CurationKind); setPathwayForm(emptyPathwayForm()); }} value={curationKind}>
                    <option value="resourceCategory">Resource Type {'\u2192'} Category</option>
                    <option value="categorySeries">Category {'\u2192'} Series</option>
                  </select>
                </label>

                {curationKind === 'resourceCategory' ? (
                  <label className="grid gap-2">
                    <span className={labelClass}>Resource type</span>
                    <select className={inputClass} onChange={(event) => updatePathwayForm('resourceType', event.target.value)} value={pathwayForm.resourceType}>
                      <option value="">Choose resource type</option>
                      {resourceTypes.map((resourceType) => <option key={resourceType.id} value={resourceType.id}>{resourceType.name}</option>)}
                    </select>
                  </label>
                ) : null}

                <label className="grid gap-2">
                  <span className={labelClass}>Category</span>
                  <select className={inputClass} onChange={(event) => updatePathwayForm('category', event.target.value)} value={pathwayForm.category}>
                    <option value="">Choose category</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                </label>

                {curationKind === 'categorySeries' ? (
                  <label className="grid gap-2">
                    <span className={labelClass}>Series</span>
                    <select className={inputClass} onChange={(event) => updatePathwayForm('series', event.target.value)} value={pathwayForm.series}>
                      <option value="">Choose series</option>
                      {series.map((item) => <option key={item.id} value={item.id}>{seriesName(item)}</option>)}
                    </select>
                  </label>
                ) : null}

                <label className="grid gap-2">
                  <span className={labelClass}>Sort order</span>
                  <input className={inputClass} inputMode="numeric" onChange={(event) => updatePathwayForm('sortOrder', event.target.value)} placeholder="0" type="number" value={pathwayForm.sortOrder} />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className={checkboxClass}>
                    <span>Active</span>
                    <input checked={pathwayForm.active} onChange={(event) => updatePathwayForm('active', event.target.checked)} type="checkbox" />
                  </label>
                  <label className={checkboxClass}>
                    <span>Featured</span>
                    <input checked={pathwayForm.featured} onChange={(event) => updatePathwayForm('featured', event.target.checked)} type="checkbox" />
                  </label>
                </div>
              </div>
              <button className="mt-5 rounded-full bg-red-800 px-6 py-3 text-sm font-black text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:opacity-50" disabled={!canManageTaxonomy(auth.permissions)} type="submit">Create pathway</button>
            </form>
          </div>

          <div className="grid gap-6">
            <section className={`rounded-[2rem] border p-5 shadow-lg sm:p-6 ${portalSurface.panel(darkMode)}`}>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800">Primary Discovery Layers</p>
                  <h2 className="mt-2 font-serif text-3xl">Shelves, topics, series, and tags</h2>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${darkMode ? 'border-white/10 bg-white/5 text-stone-300' : 'border-[#eaded0] bg-white text-[#786f66]'}`}>{resourceTypes.length + categories.length + series.length + tags.length} items</span>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {primaryPanels.map((panel) => (
                  <section key={panel.title} className={`rounded-3xl border p-5 ${darkMode ? 'border-white/10 bg-white/[0.03]' : 'border-[#eaded0] bg-[#fffaf0]/70'}`}>
                    <h3 className="text-lg font-black">{panel.title}</h3>
                    <p className={`mt-2 text-xs leading-5 ${portalSurface.softMutedText(darkMode)}`}>{panel.description}</p>
                    {renderItemList(panel.items, `No ${panel.title.toLowerCase()} yet.`)}
                  </section>
                ))}
              </div>
            </section>

            <section className={`rounded-[2rem] border p-5 shadow-lg sm:p-6 ${portalSurface.panel(darkMode)}`}>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800">Browse Pathways</p>
                  <h2 className="mt-2 font-serif text-3xl">Editorial connections</h2>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${darkMode ? 'border-white/10 bg-white/5 text-stone-300' : 'border-[#eaded0] bg-white text-[#786f66]'}`}>{curatedResourceCategories.length + curatedCategorySeries.length} pathways</span>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <section className={`rounded-3xl border p-5 ${darkMode ? 'border-white/10 bg-white/[0.03]' : 'border-[#eaded0] bg-[#fffaf0]/70'}`}>
                  <h3 className="text-lg font-black">Resource Type {'\u2192'} Category</h3>
                  <p className={`mt-2 text-xs leading-5 ${portalSurface.softMutedText(darkMode)}`}>Guide readers from a broad resource shelf into relevant topics.</p>
                  {renderItemList(curatedResourceCategories, 'No resource-to-category pathways yet.')}
                </section>
                <section className={`rounded-3xl border p-5 ${darkMode ? 'border-white/10 bg-white/[0.03]' : 'border-[#eaded0] bg-[#fffaf0]/70'}`}>
                  <h3 className="text-lg font-black">Category {'\u2192'} Series</h3>
                  <p className={`mt-2 text-xs leading-5 ${portalSurface.softMutedText(darkMode)}`}>Guide readers from a topic into a curated journey or series.</p>
                  {renderItemList(curatedCategorySeries, 'No category-to-series pathways yet.')}
                </section>
              </div>
            </section>
          </div>
        </div>
      </div>
    </WritingStudioShell>
  );
};

export default WritingLibraryPage;
