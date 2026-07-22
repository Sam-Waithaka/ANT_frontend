export type EditorialBindingTone = {
  accent: string;
  border: string;
  glow: string;
  name: string;
  paper: string;
  spine: string;
  text: string;
};

export type EditorialTaxonomyLevel = {
  kind: 'resource' | 'category' | 'series' | 'article';
  label: string;
};

export type EditorialCoverPresentation = {
  palette: EditorialBindingTone;
  taxonomy: EditorialTaxonomyLevel[];
};

export const editorialBindingPalette: EditorialBindingTone[] = [
  {
    accent: '#d2a548',
    border: '#5b1616',
    glow: 'rgba(127, 29, 29, 0.34)',
    name: 'Burgundy',
    paper: '#7f1d1d',
    spine: '#3f0d0d',
    text: '#fff7ed',
  },
  {
    accent: '#c8913f',
    border: '#183527',
    glow: 'rgba(20, 83, 45, 0.3)',
    name: 'Forest',
    paper: '#173b2d',
    spine: '#0c241a',
    text: '#fff7ed',
  },
  {
    accent: '#bf9b4f',
    border: '#17243a',
    glow: 'rgba(30, 58, 138, 0.28)',
    name: 'Navy',
    paper: '#172033',
    spine: '#0a1220',
    text: '#f8fafc',
  },
  {
    accent: '#d1995f',
    border: '#663814',
    glow: 'rgba(124, 45, 18, 0.3)',
    name: 'Copper',
    paper: '#7c3f16',
    spine: '#4a230b',
    text: '#fff7ed',
  },
  {
    accent: '#c6a84f',
    border: '#4d4a1f',
    glow: 'rgba(113, 105, 38, 0.3)',
    name: 'Olive',
    paper: '#5a5627',
    spine: '#302f16',
    text: '#fff7ed',
  },
  {
    accent: '#b89ed3',
    border: '#4b2556',
    glow: 'rgba(88, 28, 135, 0.28)',
    name: 'Plum',
    paper: '#4b285b',
    spine: '#2c1436',
    text: '#faf5ff',
  },
  {
    accent: '#c5b8a4',
    border: '#3f3f3b',
    glow: 'rgba(63, 63, 70, 0.25)',
    name: 'Charcoal',
    paper: '#2d2d2a',
    spine: '#171716',
    text: '#fafaf9',
  },
  {
    accent: '#d1bd8a',
    border: '#74634d',
    glow: 'rgba(120, 113, 108, 0.25)',
    name: 'Deep Stone',
    paper: '#756b5c',
    spine: '#4a4035',
    text: '#fffaf0',
  },
];

export const stableEditorialHash = (value: string | number | null | undefined): number => {
  const input = String(value ?? '').trim().toLowerCase();
  let hash = 5381;

  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << 5) + hash) + input.charCodeAt(index);
    hash &= 0xffffffff;
  }

  return Math.abs(hash);
};

export const getEditorialBindingTone = (seed: string | number | null | undefined): EditorialBindingTone => {
  const fallbackSeed = seed || 'A.I.C Njoro Town Resources';
  return editorialBindingPalette[stableEditorialHash(fallbackSeed) % editorialBindingPalette.length];
};

const hasLabel = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

export const buildEditorialTaxonomy = ({
  categories,
  resourceType,
  series,
  title,
}: {
  categories?: Array<{ name?: string | null }> | null;
  resourceType?: { name?: string | null } | null;
  series?: Array<{ title?: string | null }> | null;
  title: string;
}): EditorialTaxonomyLevel[] => {
  const levels: EditorialTaxonomyLevel[] = [];
  const resourceLabel = resourceType?.name;
  const categoryLabel = categories?.find((category) => hasLabel(category.name))?.name;
  const seriesLabel = series?.find((item) => hasLabel(item.title))?.title;

  if (hasLabel(resourceLabel)) levels.push({ kind: 'resource', label: resourceLabel.trim() });
  if (hasLabel(categoryLabel)) levels.push({ kind: 'category', label: categoryLabel.trim() });
  if (hasLabel(seriesLabel)) levels.push({ kind: 'series', label: seriesLabel.trim() });
  levels.push({ kind: 'article', label: title.trim() || 'Untitled Resource' });

  return levels;
};

export const getEditorialCoverPresentation = ({
  categories,
  resourceType,
  series,
  title,
}: {
  categories?: Array<{ name?: string | null }> | null;
  resourceType?: { name?: string | null } | null;
  series?: Array<{ title?: string | null }> | null;
  title: string;
}): EditorialCoverPresentation => {
  const taxonomy = buildEditorialTaxonomy({ categories, resourceType, series, title });
  const seed = taxonomy.find((level) => level.kind === 'resource')?.label || taxonomy[0]?.label || title;

  return {
    palette: getEditorialBindingTone(seed),
    taxonomy,
  };
};
