import type { DragEvent, FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PortalSelect from '../../../components/portal/PortalSelect';
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
  createWritingSeriesItem,
  deleteCategory,
  deleteCategorySeriesLink,
  deleteResourceType,
  deleteResourceTypeCategoryLink,
  deleteSeries,
  deleteWritingSeriesItem,
  deleteWritingTag,
  fetchCategories,
  fetchCategorySeriesLinks,
  fetchResourceTypeCategoryLinks,
  fetchResourceTypes,
  fetchSeries,
  fetchWritingTags,
  fetchWritings,
  reorderWritingSeriesItems,
  updateCategory,
  updateCategorySeriesLink,
  updateResourceType,
  updateResourceTypeCategoryLink,
  updateSeries,
  updateWritingTag,
} from '../../../services/writingApi';
import type {
  WritingCategory,
  WritingCategorySeriesLink,
  WritingResourceType,
  WritingResourceTypeCategoryLink,
  WritingSeries,
  WritingSeriesItem,
  WritingStatus,
  WritingTag,
  Writing,
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

const writingStatuses: Array<{ label: string; value: WritingStatus | 'ALL' }> = [
  { label: 'All statuses', value: 'ALL' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'In review', value: 'IN_REVIEW' },
  { label: 'Scheduled', value: 'SCHEDULED' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Archived', value: 'ARCHIVED' },
];

const assetPreviewUrl = (asset?: Writing['og_image_detail'] | WritingSeries['cover_image']) => {
  if (!asset) return '';
  return asset.url || asset.image || asset.file || '';
};
const seriesName = (item?: WritingSeries | null) => item?.title || item?.name || item?.slug || 'Series';

const WritingLibraryPage = () => {
  const auth = useAuth();
  const { darkMode } = useTheme();
  const [categories, setCategories] = useState<WritingCategory[]>([]);
  const [categorySeriesLinks, setCategorySeriesLinks] = useState<WritingCategorySeriesLink[]>([]);
  const [curationKind, setCurationKind] = useState<CurationKind>('resourceCategory');
  const [editingPrimary, setEditingPrimary] = useState<{ form: LibraryItemForm; id: number | string; kind: TaxonomyKind } | null>(null);
  const [itemForm, setItemForm] = useState<LibraryItemForm>(() => emptyLibraryItemForm());
  const [editingPathway, setEditingPathway] = useState<{ form: PathwayForm; id: number | string; kind: CurationKind } | null>(null);
  const [expandedSeriesId, setExpandedSeriesId] = useState<number | string | null>(null);
  const [draggedSeriesItemId, setDraggedSeriesItemId] = useState<number | string | null>(null);
  const [pathwayForm, setPathwayForm] = useState<PathwayForm>(() => emptyPathwayForm());
  const [resourceTypes, setResourceTypes] = useState<WritingResourceType[]>([]);
  const [resourceTypeCategoryLinks, setResourceTypeCategoryLinks] = useState<WritingResourceTypeCategoryLink[]>([]);
  const [seriesSearchLoading, setSeriesSearchLoading] = useState(false);
  const [seriesSearchQuery, setSeriesSearchQuery] = useState('');
  const [seriesSearchStatus, setSeriesSearchStatus] = useState<WritingStatus | 'ALL'>('ALL');
  const [seriesSearchResults, setSeriesSearchResults] = useState<Writing[]>([]);
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

  const formFromResourceType = (item: WritingResourceType): LibraryItemForm => ({
    active: item.is_active,
    description: item.description || '',
    featured: item.is_featured,
    name: item.name,
    parent: '',
    slug: item.slug,
    sortOrder: String(item.sort_order ?? 0),
  });

  const formFromCategory = (item: WritingCategory): LibraryItemForm => ({
    active: item.is_active,
    description: item.description || '',
    featured: item.is_featured,
    name: item.name,
    parent: item.parent ? String(item.parent) : '',
    slug: item.slug,
    sortOrder: String(item.sort_order ?? 0),
  });

  const formFromSeries = (item: WritingSeries): LibraryItemForm => ({
    active: item.is_active,
    description: item.description || '',
    featured: item.is_featured,
    name: seriesName(item),
    parent: '',
    slug: item.slug,
    sortOrder: String(item.sort_order ?? 0),
  });

  const formFromTag = (item: WritingTag): LibraryItemForm => ({
    ...emptyLibraryItemForm(),
    name: item.name,
    slug: item.slug,
  });

  const formFromResourceCategoryLink = (link: WritingResourceTypeCategoryLink): PathwayForm => ({
    active: link.is_active,
    category: String(link.category),
    featured: link.is_featured,
    resourceType: String(link.resource_type),
    series: '',
    sortOrder: String(link.sort_order ?? 0),
  });

  const formFromCategorySeriesLink = (link: WritingCategorySeriesLink): PathwayForm => ({
    active: link.is_active,
    category: String(link.category),
    featured: link.is_featured,
    resourceType: '',
    series: String(link.series),
    sortOrder: String(link.sort_order ?? 0),
  });

  const updateEditingPrimaryForm = <Key extends keyof LibraryItemForm>(key: Key, value: LibraryItemForm[Key]) => {
    setEditingPrimary((current) => current ? { ...current, form: { ...current.form, [key]: value } } : current);
  };

  const updateEditingPathwayForm = <Key extends keyof PathwayForm>(key: Key, value: PathwayForm[Key]) => {
    setEditingPathway((current) => current ? { ...current, form: { ...current.form, [key]: value } } : current);
  };

  const reloadAfterMutation = (nextMessage: string) => {
    setMessage(nextMessage);
    load();
  };

  const savePrimaryEdit = async () => {
    if (!editingPrimary || !canManageTaxonomy(auth.permissions)) return;
    const form = editingPrimary.form;
    const slug = form.slug.trim() || toSlug(form.name);
    const sort_order = toSortOrder(form.sortOrder, 0);

    try {
      if (editingPrimary.kind === 'resourceType') {
        await updateResourceType(auth.accessToken, editingPrimary.id, {
          description: form.description,
          is_active: form.active,
          is_featured: form.featured,
          name: form.name,
          slug,
          sort_order,
        });
      }

      if (editingPrimary.kind === 'category') {
        await updateCategory(auth.accessToken, editingPrimary.id, {
          description: form.description,
          is_active: form.active,
          is_featured: form.featured,
          name: form.name,
          parent: form.parent || null,
          slug,
          sort_order,
        });
      }

      if (editingPrimary.kind === 'series') {
        await updateSeries(auth.accessToken, editingPrimary.id, {
          description: form.description,
          is_active: form.active,
          is_featured: form.featured,
          slug,
          sort_order,
          title: form.name,
        });
      }

      if (editingPrimary.kind === 'tag') {
        await updateWritingTag(auth.accessToken, editingPrimary.id, {
          name: form.name,
          slug,
        });
      }

      setEditingPrimary(null);
      reloadAfterMutation('Library item updated.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to update Library item.');
    }
  };

  const savePathwayEdit = async () => {
    if (!editingPathway || !canManageTaxonomy(auth.permissions)) return;
    const form = editingPathway.form;

    try {
      if (editingPathway.kind === 'resourceCategory') {
        await updateResourceTypeCategoryLink(auth.accessToken, editingPathway.id, {
          category: form.category,
          is_active: form.active,
          is_featured: form.featured,
          resource_type: form.resourceType,
          sort_order: toSortOrder(form.sortOrder, 0),
        });
      }

      if (editingPathway.kind === 'categorySeries') {
        await updateCategorySeriesLink(auth.accessToken, editingPathway.id, {
          category: form.category,
          is_active: form.active,
          is_featured: form.featured,
          series: form.series,
          sort_order: toSortOrder(form.sortOrder, 0),
        });
      }

      setEditingPathway(null);
      reloadAfterMutation('Browse pathway updated.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to update browse pathway.');
    }
  };
  const confirmDelete = async (label: string, action: () => Promise<null>) => {
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return;

    try {
      await action();
      reloadAfterMutation(`${label} deleted.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : `Unable to delete ${label}. It may already be used by writings.`);
    }
  };

  const deletePrimary = (record: PrimaryRecord) => {
    if (!canManageTaxonomy(auth.permissions)) return;
    if (record.kind === 'resourceType') void confirmDelete(record.title, () => deleteResourceType(auth.accessToken, record.id));
    if (record.kind === 'category') void confirmDelete(record.title, () => deleteCategory(auth.accessToken, record.id));
    if (record.kind === 'series') void confirmDelete(record.title, () => deleteSeries(auth.accessToken, record.id));
    if (record.kind === 'tag') void confirmDelete(record.title, () => deleteWritingTag(auth.accessToken, record.id));
  };

  const deletePathway = (record: PathwayRecord) => {
    if (!canManageTaxonomy(auth.permissions)) return;
    if (record.kind === 'resourceCategory') void confirmDelete(record.title, () => deleteResourceTypeCategoryLink(auth.accessToken, record.id));
    if (record.kind === 'categorySeries') void confirmDelete(record.title, () => deleteCategorySeriesLink(auth.accessToken, record.id));
  };

  const togglePrimary = async (record: PrimaryRecord, field: 'is_active' | 'is_featured') => {
    if (!record.state || !canManageTaxonomy(auth.permissions)) return;
    const nextValue = field === 'is_active' ? !record.state.active : !record.state.featured;

    try {
      if (record.kind === 'resourceType') await updateResourceType(auth.accessToken, record.id, { [field]: nextValue });
      if (record.kind === 'category') await updateCategory(auth.accessToken, record.id, { [field]: nextValue });
      if (record.kind === 'series') await updateSeries(auth.accessToken, record.id, { [field]: nextValue });
      reloadAfterMutation(field === 'is_active' ? 'Active state updated.' : 'Featured state updated.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to update Library item state.');
    }
  };

  const searchSeriesWritings = async () => {
    if (!canManageTaxonomy(auth.permissions)) return;
    setSeriesSearchLoading(true);
    try {
      const page = await fetchWritings(auth.accessToken, { page: 1, page_size: 24, search: seriesSearchQuery.trim() || undefined, status: seriesSearchStatus });
      setSeriesSearchResults(page.results);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to search writings right now.');
    } finally {
      setSeriesSearchLoading(false);
    }
  };

  const addWritingToSeries = async (seriesId: number | string, writingId: number | string, currentItemCount: number) => {
    if (!canManageTaxonomy(auth.permissions)) return;

    try {
      await createWritingSeriesItem(auth.accessToken, {
        order: currentItemCount,
        series: seriesId,
        writing: writingId,
      });
      setSeriesSearchQuery('');
      setSeriesSearchResults([]);
      reloadAfterMutation('Writing added to series.');
    } catch (err) {
      const detail = err instanceof Error ? err.message : '';
      setMessage(detail.toLowerCase().includes('duplicate') || detail.toLowerCase().includes('unique') || detail.includes('400')
        ? 'This writing is already in this series.'
        : detail || 'Unable to add writing to series.');
    }
  };
  const sortSeriesItems = (items: WritingSeriesItem[] = []) =>
    [...items].sort((left, right) => left.order === right.order ? left.writing_title.localeCompare(right.writing_title) : left.order - right.order);

  const reorderSeriesItems = async (seriesId: number | string, items: WritingSeriesItem[], fromIndex: number, toIndex: number) => {
    if (!canManageTaxonomy(auth.permissions) || toIndex < 0 || toIndex >= items.length) return;
    const nextItems = [...items];
    const [movedItem] = nextItems.splice(fromIndex, 1);
    nextItems.splice(toIndex, 0, movedItem);

    try {
      await reorderWritingSeriesItems(auth.accessToken, seriesId, nextItems.map((item, index) => ({ id: item.id, order: index })));
      reloadAfterMutation('Series order updated.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to reorder series items. Refetching the series may be needed.');
      load();
    }
  };

  const dropSeriesItem = async (seriesId: number | string, items: WritingSeriesItem[], targetIndex: number) => {
    if (draggedSeriesItemId === null) return;
    const fromIndex = items.findIndex((item) => String(item.id) === String(draggedSeriesItemId));
    setDraggedSeriesItemId(null);
    if (fromIndex < 0 || fromIndex === targetIndex) return;
    await reorderSeriesItems(seriesId, items, fromIndex, targetIndex);
  };
  const removeSeriesItem = async (item: WritingSeriesItem) => {
    if (!canManageTaxonomy(auth.permissions)) return;
    if (!window.confirm(`Remove ${item.writing_title} from this series?`)) return;

    try {
      await deleteWritingSeriesItem(auth.accessToken, item.id);
      reloadAfterMutation('Writing removed from series.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to remove writing from series.');
    }
  };
  const togglePathway = async (record: PathwayRecord, field: 'is_active' | 'is_featured') => {
    if (!canManageTaxonomy(auth.permissions)) return;
    const nextValue = field === 'is_active' ? !record.active : !record.featured;

    try {
      if (record.kind === 'resourceCategory') await updateResourceTypeCategoryLink(auth.accessToken, record.id, { [field]: nextValue });
      if (record.kind === 'categorySeries') await updateCategorySeriesLink(auth.accessToken, record.id, { [field]: nextValue });
      reloadAfterMutation(field === 'is_active' ? 'Pathway active state updated.' : 'Pathway featured state updated.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to update browse pathway state.');
    }
  };
  const inputClass = `w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-red-800/25 ${darkMode ? 'border-white/10 bg-white/5 text-stone-100 placeholder:text-stone-500' : 'border-[#eaded0] bg-white text-zinc-950 placeholder:text-[#8a7d70]'}`;
  const labelClass = `text-[0.68rem] font-black uppercase tracking-[0.18em] ${darkMode ? 'text-red-200' : 'text-red-800'}`;
  const helperClass = `text-xs leading-5 ${portalSurface.softMutedText(darkMode)}`;
  const checkboxClass = `flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-sm font-bold ${darkMode ? 'border-white/10 bg-white/5 text-stone-200' : 'border-[#eaded0] bg-white text-zinc-800'}`;
  const showRichFields = kind !== 'tag';
  const itemNameLabel = kind === 'series' ? 'Series title' : 'Name';
  const itemSlug = itemForm.slug || toSlug(itemForm.name);

  const recordCardClass = darkMode
    ? 'rounded-2xl border border-white/10 bg-white/[0.04] p-4'
    : 'rounded-2xl border border-[#eaded0] bg-white p-4 shadow-sm shadow-zinc-900/5';
  const metaBadgeClass = darkMode
    ? 'rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[0.68rem] font-bold text-stone-300'
    : 'rounded-full border border-[#eaded0] bg-[#fffaf0] px-2.5 py-1 text-[0.68rem] font-bold text-[#786f66]';
  const activeBadgeClass = darkMode
    ? 'rounded-full border border-green-400/20 bg-green-400/10 px-2.5 py-1 text-[0.68rem] font-black text-green-200'
    : 'rounded-full border border-green-700/15 bg-green-50 px-2.5 py-1 text-[0.68rem] font-black text-green-800';
  const inactiveBadgeClass = darkMode
    ? 'rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[0.68rem] font-bold text-stone-400'
    : 'rounded-full border border-[#eaded0] bg-[#fffaf0] px-2.5 py-1 text-[0.68rem] font-bold text-[#786f66]';
  const featuredBadgeClass = darkMode
    ? 'rounded-full border border-red-400/20 bg-red-950/30 px-2.5 py-1 text-[0.68rem] font-black text-red-200'
    : 'rounded-full border border-red-900/15 bg-red-50 px-2.5 py-1 text-[0.68rem] font-black text-red-800';

  type PrimaryRecord = {
    depth?: number;
    description?: string;
    imageUrl?: string;
    form: LibraryItemForm;
    id: number | string;
    key: string;
    kind: TaxonomyKind;
    meta: string[];
    parent?: string;
    publicHref?: string;
    seriesItems?: WritingSeriesItem[];
    slug?: string;
    state?: { active?: boolean; featured?: boolean };
    title: string;
  };

  type PathwayRecord = {
    active: boolean;
    featured: boolean;
    form: PathwayForm;
    id: number | string;
    key: string;
    kind: CurationKind;
    order: number;
    title: string;
  };

  const descriptionExcerpt = (value?: string) => value?.trim() || 'No description yet.';
  const parentName = (category: WritingCategory) => category.parent ? byId(categories, category.parent)?.name || 'Parent category' : '';

  const orderCategoryRecords = (records: PrimaryRecord[]) => {
    const compareRecords = (left: PrimaryRecord, right: PrimaryRecord) => {
      const leftOrder = toSortOrder(left.form.sortOrder, 0);
      const rightOrder = toSortOrder(right.form.sortOrder, 0);
      return leftOrder === rightOrder ? left.title.localeCompare(right.title) : leftOrder - rightOrder;
    };
    const byParent = new Map<string, PrimaryRecord[]>();
    const byRecordId = new Set(records.map((record) => String(record.id)));
    const roots: PrimaryRecord[] = [];

    records.forEach((record) => {
      const parentId = record.form.parent;
      if (parentId && byRecordId.has(String(parentId))) {
        const key = String(parentId);
        byParent.set(key, [...(byParent.get(key) || []), record]);
      } else {
        roots.push(record);
      }
    });

    const ordered: PrimaryRecord[] = [];
    const appendRecord = (record: PrimaryRecord, depth: number) => {
      ordered.push({ ...record, depth });
      (byParent.get(String(record.id)) || []).sort(compareRecords).forEach((child) => appendRecord(child, depth + 1));
    };

    roots.sort(compareRecords).forEach((record) => appendRecord(record, 0));
    return ordered;
  };

  const primaryPanels: Array<{ description: string; records: PrimaryRecord[]; title: string }> = [
    {
      description: 'Broad shelves that shape public resource browsing.',
      records: resourceTypes.map((item) => ({
        description: item.description,
        form: formFromResourceType(item),
        id: item.id,
        key: String(item.id),
        kind: 'resourceType',
        meta: [`Order ${item.sort_order}`],
        slug: item.slug,
        state: { active: item.is_active, featured: item.is_featured },
        title: item.name,
      })),
      title: 'Resource Types',
    },
    {
      description: 'Topics and themes that help readers find related writings.',
      records: orderCategoryRecords(categories.map((item) => ({
        description: item.description,
        form: formFromCategory(item),
        id: item.id,
        key: String(item.id),
        kind: 'category',
        meta: [`Order ${item.sort_order}`],
        parent: parentName(item),
        slug: item.slug,
        state: { active: item.is_active, featured: item.is_featured },
        title: item.name,
      }))),
      title: 'Categories',
    },
    {
      description: 'Curated journeys or ordered collections of writings.',
      records: series.map((item) => ({
        description: item.description,
        form: formFromSeries(item),
        id: item.id,
        key: String(item.id),
        imageUrl: assetPreviewUrl(item.cover_image),
        kind: 'series',
        meta: [`Order ${item.sort_order}`, `${item.items?.length || 0} writings`],
        seriesItems: item.items || [],
        publicHref: `/resources?series_slug=${encodeURIComponent(item.slug)}`,
        slug: item.slug,
        state: { active: item.is_active, featured: item.is_featured },
        title: seriesName(item),
      })),
      title: 'Series',
    },
    {
      description: 'Lightweight labels for secondary discovery and search.',
      records: tags.map((item) => ({
        form: formFromTag(item),
        id: item.id,
        key: String(item.id),
        kind: 'tag',
        meta: item.writing_count === undefined ? ['Lightweight label'] : [`${item.writing_count} writings`],
        slug: item.slug,
        title: item.name,
      })),
      title: 'Tags',
    },
  ];

  const resourceCategoryRecords: PathwayRecord[] = resourceTypeCategoryLinks.map((link) => {
    const resourceType = link.resource_type_detail || byId(resourceTypes, link.resource_type);
    const category = link.category_detail || byId(categories, link.category);
    return {
      active: link.is_active,
      featured: link.is_featured,
      form: formFromResourceCategoryLink(link),
      id: link.id,
      key: String(link.id),
      kind: 'resourceCategory' as const,
      order: link.sort_order,
      title: `${resourceType?.name || 'Resource Type'} \u2192 ${category?.name || 'Category'}`,
    };
  });

  const categorySeriesRecords: PathwayRecord[] = categorySeriesLinks.map((link) => {
    const category = link.category_detail || byId(categories, link.category);
    const linkedSeries = link.series_detail || byId(series, link.series);
    return {
      active: link.is_active,
      featured: link.is_featured,
      form: formFromCategorySeriesLink(link),
      id: link.id,
      key: String(link.id),
      kind: 'categorySeries' as const,
      order: link.sort_order,
      title: `${category?.name || 'Category'} \u2192 ${seriesName(linkedSeries)}`,
    };
  });

  const renderStateBadges = (state?: PrimaryRecord['state']) => state ? (
    <div className="flex flex-wrap gap-2">
      <span className={state.active ? activeBadgeClass : inactiveBadgeClass}>{state.active ? 'Active' : 'Inactive'}</span>
      {state.featured ? <span className={featuredBadgeClass}>Featured</span> : null}
    </div>
  ) : null;

  const formatStatus = (status?: string) => status ? status.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : 'Unknown';

  const statusBadgeClass = (status?: string) => {
    const base = 'inline-flex rounded-full border px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.12em]';
    if (status === 'PUBLISHED') return `${base} ${darkMode ? 'border-green-400/20 bg-green-400/10 text-green-200' : 'border-green-700/15 bg-green-50 text-green-800'}`;
    if (status === 'IN_REVIEW') return `${base} ${darkMode ? 'border-amber-300/20 bg-amber-300/10 text-amber-100' : 'border-amber-700/15 bg-amber-50 text-amber-800'}`;
    if (status === 'SCHEDULED') return `${base} ${darkMode ? 'border-blue-300/20 bg-blue-300/10 text-blue-100' : 'border-blue-700/15 bg-blue-50 text-blue-800'}`;
    if (status === 'ARCHIVED') return `${base} ${darkMode ? 'border-white/10 bg-white/5 text-stone-400' : 'border-[#eaded0] bg-[#fffaf0] text-[#786f66]'}`;
    return `${base} ${darkMode ? 'border-red-400/20 bg-red-950/30 text-red-200' : 'border-red-900/15 bg-red-50 text-red-800'}`;
  };
  const actionButtonClass = darkMode
    ? 'rounded-full border border-white/10 px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.12em] text-stone-200 transition hover:bg-white/10 disabled:opacity-40'
    : 'rounded-full border border-[#eaded0] px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.12em] text-[#5f574f] transition hover:bg-[#fffaf0] disabled:opacity-40';
  const dangerButtonClass = darkMode
    ? 'rounded-full border border-red-400/20 px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.12em] text-red-200 transition hover:bg-red-950/30 disabled:opacity-40'
    : 'rounded-full border border-red-900/15 px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.12em] text-red-800 transition hover:bg-red-50 disabled:opacity-40';
  const editSurfaceClass = darkMode
    ? 'mt-4 grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4'
    : 'mt-4 grid gap-3 rounded-2xl border border-[#eaded0] bg-[#fffaf0] p-4';
  const renderPrimaryRecordList = (records: PrimaryRecord[], emptyLabel: string) => (
    <div className="mt-4 grid gap-3">
      {records.length ? records.map((record) => {
        const isEditing = editingPrimary?.kind === record.kind && String(editingPrimary.id) === String(record.id);
        const editForm = editingPrimary?.form;
        const richEdit = isEditing && record.kind !== 'tag' && editForm;

        const nestedCardClass = record.depth
          ? `${recordCardClass} ${darkMode ? 'ml-4 border-l-4 border-l-red-300/30' : 'ml-4 border-l-4 border-l-red-800/20'} sm:ml-6`
          : recordCardClass;

        return (
          <article key={record.key} className={nestedCardClass}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="text-sm font-black">{record.title}</h4>
                {record.slug ? <p className={`mt-1 break-all text-xs ${portalSurface.softMutedText(darkMode)}`}>/{record.slug}</p> : null}
              </div>
              {renderStateBadges(record.state)}
            </div>
            {record.parent ? <p className={`mt-3 text-xs font-bold ${darkMode ? 'text-stone-300' : 'text-[#5f574f]'}`}>{record.depth ? 'Nested under' : 'Parent'}: {record.parent}</p> : null}
            <p className={`mt-3 line-clamp-2 text-sm leading-6 ${portalSurface.softMutedText(darkMode)}`}>{descriptionExcerpt(record.description)}</p>
            {record.meta.length ? <div className="mt-3 flex flex-wrap gap-2">{record.meta.map((item) => <span key={item} className={metaBadgeClass}>{item}</span>)}</div> : null}
            {record.kind === 'series' && (record.imageUrl || record.publicHref) ? (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {record.imageUrl ? <img alt="" className="h-14 w-20 rounded-2xl border border-[#eaded0] object-cover dark:border-white/10" src={record.imageUrl} /> : null}
                <div className="flex flex-wrap gap-2">
                  <Link className={actionButtonClass} to={`/portal/writing/library/series/${record.id}`}>Series admin</Link>
                  {record.publicHref ? <Link className={actionButtonClass} target="_blank" to={record.publicHref}>Public preview</Link> : null}
                </div>
              </div>
            ) : null}
            {record.kind === 'series' ? (
              <div className="mt-4">
                <button className={actionButtonClass} onClick={() => setExpandedSeriesId((current) => String(current) === String(record.id) ? null : record.id)} type="button">
                  {String(expandedSeriesId) === String(record.id) ? 'Hide items' : 'Manage items'}
                </button>
                {String(expandedSeriesId) === String(record.id) ? (() => {
                  const orderedItems = sortSeriesItems(record.seriesItems || []);
                  return (
                    <div className={editSurfaceClass}>
                      <div className="grid gap-3 rounded-2xl border border-[#eaded0] bg-white p-3 dark:border-white/10 dark:bg-white/[0.03]">
                        <div>
                          <p className={labelClass}>Add writing</p>
                          <p className={helperClass}>Search existing writings, then add one to the end of this series.</p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <input className={inputClass} onChange={(event) => setSeriesSearchQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); void searchSeriesWritings(); } }} placeholder="Search writings by title..." value={seriesSearchQuery} />
                          <PortalSelect ariaLabel="Writing status" darkMode={darkMode} onChange={(value) => setSeriesSearchStatus(value as WritingStatus | 'ALL')} options={writingStatuses.map((status) => ({ label: status.label, value: status.value }))} value={seriesSearchStatus} />
                          <button className="rounded-full bg-red-800 px-4 py-2 text-xs font-black text-white transition hover:bg-red-700 disabled:opacity-50" disabled={seriesSearchLoading || !canManageTaxonomy(auth.permissions)} onClick={() => void searchSeriesWritings()} type="button">{seriesSearchLoading ? 'Searching...' : 'Search'}</button>
                        </div>
                        {seriesSearchResults.length ? (
                          <div className="grid gap-2">
                            {seriesSearchResults.map((writing) => {
                              const alreadyAdded = orderedItems.some((item) => String(item.writing) === String(writing.id));
                              return (
                                <div key={writing.id} className={darkMode ? 'rounded-2xl border border-white/10 bg-black/20 p-3' : 'rounded-2xl border border-[#eaded0] bg-[#fffaf0] p-3'}>
                                  <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="text-sm font-black">{writing.title}</p>
                                      <span className={statusBadgeClass(writing.status)}>{formatStatus(writing.status)}</span>
                                    </div>
                                    <button className={actionButtonClass} disabled={alreadyAdded || !canManageTaxonomy(auth.permissions)} onClick={() => void addWritingToSeries(record.id, writing.id, orderedItems.length)} type="button">{alreadyAdded ? 'Already added' : 'Add'}</button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>

                      <div>
                        <p className={labelClass}>Current journey</p>
                        <p className={helperClass}>Ordered from the dedicated series item records. Displayed as order + 1.</p>
                      </div>
                      {orderedItems.length ? (
                        <ol className="grid gap-2">
                          {orderedItems.map((item, index) => (
                            <li key={item.id} className={darkMode ? 'rounded-2xl border border-white/10 bg-white/[0.03] p-3' : 'rounded-2xl border border-[#eaded0] bg-white p-3'} draggable onDragEnd={() => setDraggedSeriesItemId(null)} onDragOver={(event: DragEvent<HTMLLIElement>) => event.preventDefault()} onDragStart={() => setDraggedSeriesItemId(item.id)} onDrop={() => void dropSeriesItem(record.id, orderedItems, index)}>
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-sm font-black">{index + 1}. {item.writing_title}</p>
                                  {item.writing_detail?.status ? <span className={statusBadgeClass(item.writing_detail.status as WritingStatus)}>{formatStatus(item.writing_detail.status)}</span> : null}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <button className={actionButtonClass} disabled={index === 0 || !canManageTaxonomy(auth.permissions)} onClick={() => void reorderSeriesItems(record.id, orderedItems, index, index - 1)} type="button">Move up</button>
                                  <button className={actionButtonClass} disabled={index === orderedItems.length - 1 || !canManageTaxonomy(auth.permissions)} onClick={() => void reorderSeriesItems(record.id, orderedItems, index, index + 1)} type="button">Move down</button>
                                  <button className={dangerButtonClass} disabled={!canManageTaxonomy(auth.permissions)} onClick={() => void removeSeriesItem(item)} type="button">Remove</button>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ol>
                      ) : <p className={`text-sm ${portalSurface.softMutedText(darkMode)}`}>No writings in this series yet.</p>}
                    </div>
                  );
                })() : null}
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <button className={actionButtonClass} disabled={!canManageTaxonomy(auth.permissions)} onClick={() => setEditingPrimary({ form: record.form, id: record.id, kind: record.kind })} type="button">Edit</button>
              {record.state ? <button className={actionButtonClass} disabled={!canManageTaxonomy(auth.permissions)} onClick={() => void togglePrimary(record, 'is_active')} type="button">{record.state.active ? 'Deactivate' : 'Activate'}</button> : null}
              {record.state ? <button className={actionButtonClass} disabled={!canManageTaxonomy(auth.permissions)} onClick={() => void togglePrimary(record, 'is_featured')} type="button">{record.state.featured ? 'Unfeature' : 'Feature'}</button> : null}
              <button className={dangerButtonClass} disabled={!canManageTaxonomy(auth.permissions)} onClick={() => deletePrimary(record)} type="button">Delete</button>
            </div>
            {isEditing && editForm ? (
              <div className={editSurfaceClass}>
                <label className="grid gap-2">
                  <span className={labelClass}>{record.kind === 'series' ? 'Series title' : 'Name'}</span>
                  <input className={inputClass} onChange={(event) => updateEditingPrimaryForm('name', event.target.value)} value={editForm.name} />
                </label>
                <label className="grid gap-2">
                  <span className={labelClass}>Slug</span>
                  <input className={inputClass} onChange={(event) => updateEditingPrimaryForm('slug', event.target.value)} value={editForm.slug} />
                </label>
                {richEdit ? (
                  <>
                    <label className="grid gap-2">
                      <span className={labelClass}>Description</span>
                      <textarea className={`${inputClass} min-h-24 resize-y`} onChange={(event) => updateEditingPrimaryForm('description', event.target.value)} value={editForm.description} />
                    </label>
                    {record.kind === 'category' ? (
                      <label className="grid gap-2">
                        <span className={labelClass}>Parent category optional</span>
                        <PortalSelect ariaLabel="Parent category" darkMode={darkMode} onChange={(value) => updateEditingPrimaryForm('parent', value)} options={[{ label: 'No parent category', value: '' }, ...categories.filter((category) => String(category.id) !== String(record.id)).map((category) => ({ label: category.name, value: String(category.id) }))]} value={editForm.parent} />
                      </label>
                    ) : null}
                    <label className="grid gap-2">
                      <span className={labelClass}>Sort order</span>
                      <input className={inputClass} inputMode="numeric" onChange={(event) => updateEditingPrimaryForm('sortOrder', event.target.value)} type="number" value={editForm.sortOrder} />
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className={checkboxClass}>
                        <span>Active</span>
                        <input checked={editForm.active} onChange={(event) => updateEditingPrimaryForm('active', event.target.checked)} type="checkbox" />
                      </label>
                      <label className={checkboxClass}>
                        <span>Featured</span>
                        <input checked={editForm.featured} onChange={(event) => updateEditingPrimaryForm('featured', event.target.checked)} type="checkbox" />
                      </label>
                    </div>
                  </>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <button className="rounded-full bg-red-800 px-4 py-2 text-xs font-black text-white transition hover:bg-red-700" onClick={() => void savePrimaryEdit()} type="button">Save changes</button>
                  <button className={actionButtonClass} onClick={() => setEditingPrimary(null)} type="button">Cancel</button>
                </div>
              </div>
            ) : null}
          </article>
        );
      }) : <span className={`text-sm ${portalSurface.softMutedText(darkMode)}`}>{emptyLabel}</span>}
    </div>
  );
  const renderPathwayRecordList = (records: PathwayRecord[], emptyLabel: string) => (
    <div className="mt-4 grid gap-3">
      {records.length ? records.map((record) => {
        const isEditing = editingPathway?.kind === record.kind && String(editingPathway.id) === String(record.id);
        const editForm = editingPathway?.form;

        return (
          <article key={record.key} className={recordCardClass}>
            <h4 className="text-sm font-black">{record.title}</h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {record.featured ? <span className={featuredBadgeClass}>Featured</span> : null}
              <span className={record.active ? activeBadgeClass : inactiveBadgeClass}>{record.active ? 'Active' : 'Inactive'}</span>
              <span className={metaBadgeClass}>Order {record.order}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className={actionButtonClass} disabled={!canManageTaxonomy(auth.permissions)} onClick={() => setEditingPathway({ form: record.form, id: record.id, kind: record.kind })} type="button">Edit</button>
              <button className={actionButtonClass} disabled={!canManageTaxonomy(auth.permissions)} onClick={() => void togglePathway(record, 'is_active')} type="button">{record.active ? 'Deactivate' : 'Activate'}</button>
              <button className={actionButtonClass} disabled={!canManageTaxonomy(auth.permissions)} onClick={() => void togglePathway(record, 'is_featured')} type="button">{record.featured ? 'Unfeature' : 'Feature'}</button>
              <button className={dangerButtonClass} disabled={!canManageTaxonomy(auth.permissions)} onClick={() => deletePathway(record)} type="button">Delete link</button>
            </div>
            {isEditing && editForm ? (
              <div className={editSurfaceClass}>
                {record.kind === 'resourceCategory' ? (
                  <label className="grid gap-2">
                    <span className={labelClass}>Resource type</span>
                    <PortalSelect ariaLabel="Resource type" darkMode={darkMode} onChange={(value) => updateEditingPathwayForm('resourceType', value)} options={[{ label: 'Choose resource type', value: '' }, ...resourceTypes.map((resourceType) => ({ label: resourceType.name, value: String(resourceType.id) }))]} value={editForm.resourceType} />
                  </label>
                ) : null}
                <label className="grid gap-2">
                  <span className={labelClass}>Category</span>
                  <PortalSelect ariaLabel="Category" darkMode={darkMode} onChange={(value) => updateEditingPathwayForm('category', value)} options={[{ label: 'Choose category', value: '' }, ...categories.map((category) => ({ label: category.name, value: String(category.id) }))]} value={editForm.category} />
                </label>
                {record.kind === 'categorySeries' ? (
                  <label className="grid gap-2">
                    <span className={labelClass}>Series</span>
                    <PortalSelect ariaLabel="Series" darkMode={darkMode} onChange={(value) => updateEditingPathwayForm('series', value)} options={[{ label: 'Choose series', value: '' }, ...series.map((item) => ({ label: seriesName(item), value: String(item.id) }))]} value={editForm.series} />
                  </label>
                ) : null}
                <label className="grid gap-2">
                  <span className={labelClass}>Sort order</span>
                  <input className={inputClass} inputMode="numeric" onChange={(event) => updateEditingPathwayForm('sortOrder', event.target.value)} type="number" value={editForm.sortOrder} />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className={checkboxClass}>
                    <span>Active</span>
                    <input checked={editForm.active} onChange={(event) => updateEditingPathwayForm('active', event.target.checked)} type="checkbox" />
                  </label>
                  <label className={checkboxClass}>
                    <span>Featured</span>
                    <input checked={editForm.featured} onChange={(event) => updateEditingPathwayForm('featured', event.target.checked)} type="checkbox" />
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="rounded-full bg-red-800 px-4 py-2 text-xs font-black text-white transition hover:bg-red-700" onClick={() => void savePathwayEdit()} type="button">Save pathway</button>
                  <button className={actionButtonClass} onClick={() => setEditingPathway(null)} type="button">Cancel</button>
                </div>
              </div>
            ) : null}
          </article>
        );
      }) : <span className={`text-sm ${portalSurface.softMutedText(darkMode)}`}>{emptyLabel}</span>}
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
                  <PortalSelect ariaLabel="Item type" darkMode={darkMode} onChange={(value) => { setKind(value as TaxonomyKind); setItemForm(emptyLibraryItemForm()); }} options={[{ label: 'Category', value: 'category' }, { label: 'Resource Type', value: 'resourceType' }, { label: 'Series', value: 'series' }, { label: 'Tag', value: 'tag' }]} value={kind} />
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
                        <PortalSelect ariaLabel="Parent category" darkMode={darkMode} onChange={(value) => updateItemForm('parent', value)} options={[{ label: 'No parent category', value: '' }, ...categories.map((category) => ({ label: category.name, value: String(category.id) }))]} value={itemForm.parent} />
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
                  <PortalSelect ariaLabel="Pathway type" darkMode={darkMode} onChange={(value) => { setCurationKind(value as CurationKind); setPathwayForm(emptyPathwayForm()); }} options={[{ label: 'Resource Type ' + String.fromCharCode(8594) + ' Category', value: 'resourceCategory' }, { label: 'Category ' + String.fromCharCode(8594) + ' Series', value: 'categorySeries' }]} value={curationKind} />
                </label>

                {curationKind === 'resourceCategory' ? (
                  <label className="grid gap-2">
                    <span className={labelClass}>Resource type</span>
                    <PortalSelect ariaLabel="Resource type" darkMode={darkMode} onChange={(value) => updatePathwayForm('resourceType', value)} options={[{ label: 'Choose resource type', value: '' }, ...resourceTypes.map((resourceType) => ({ label: resourceType.name, value: String(resourceType.id) }))]} value={pathwayForm.resourceType} />
                  </label>
                ) : null}

                <label className="grid gap-2">
                  <span className={labelClass}>Category</span>
                  <PortalSelect ariaLabel="Category" darkMode={darkMode} onChange={(value) => updatePathwayForm('category', value)} options={[{ label: 'Choose category', value: '' }, ...categories.map((category) => ({ label: category.name, value: String(category.id) }))]} value={pathwayForm.category} />
                </label>

                {curationKind === 'categorySeries' ? (
                  <label className="grid gap-2">
                    <span className={labelClass}>Series</span>
                    <PortalSelect ariaLabel="Series" darkMode={darkMode} onChange={(value) => updatePathwayForm('series', value)} options={[{ label: 'Choose series', value: '' }, ...series.map((item) => ({ label: seriesName(item), value: String(item.id) }))]} value={pathwayForm.series} />
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
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${darkMode ? 'border-white/10 bg-white/5 text-stone-300' : 'border-[#eaded0] bg-white text-[#786f66]'}`}>{primaryPanels.reduce((total, panel) => total + panel.records.length, 0)} items</span>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {primaryPanels.map((panel) => (
                  <section key={panel.title} className={`rounded-3xl border p-5 ${darkMode ? 'border-white/10 bg-white/[0.03]' : 'border-[#eaded0] bg-[#fffaf0]/70'}`}>
                    <h3 className="text-lg font-black">{panel.title}</h3>
                    <p className={`mt-2 text-xs leading-5 ${portalSurface.softMutedText(darkMode)}`}>{panel.description}</p>
                    {renderPrimaryRecordList(panel.records, `No ${panel.title.toLowerCase()} yet.`)}
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
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${darkMode ? 'border-white/10 bg-white/5 text-stone-300' : 'border-[#eaded0] bg-white text-[#786f66]'}`}>{resourceCategoryRecords.length + categorySeriesRecords.length} pathways</span>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <section className={`rounded-3xl border p-5 ${darkMode ? 'border-white/10 bg-white/[0.03]' : 'border-[#eaded0] bg-[#fffaf0]/70'}`}>
                  <h3 className="text-lg font-black">Resource Type {'\u2192'} Category</h3>
                  <p className={`mt-2 text-xs leading-5 ${portalSurface.softMutedText(darkMode)}`}>Guide readers from a broad resource shelf into relevant topics.</p>
                  {renderPathwayRecordList(resourceCategoryRecords, 'No resource-to-category pathways yet.')}
                </section>
                <section className={`rounded-3xl border p-5 ${darkMode ? 'border-white/10 bg-white/[0.03]' : 'border-[#eaded0] bg-[#fffaf0]/70'}`}>
                  <h3 className="text-lg font-black">Category {'\u2192'} Series</h3>
                  <p className={`mt-2 text-xs leading-5 ${portalSurface.softMutedText(darkMode)}`}>Guide readers from a topic into a curated journey or series.</p>
                  {renderPathwayRecordList(categorySeriesRecords, 'No category-to-series pathways yet.')}
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

