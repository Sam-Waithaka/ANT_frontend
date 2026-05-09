import type {
  BibleMarkerStatus,
  BibleNoteType,
  BibleResourceType,
} from '../../../types/scripture';

export type ToolKey = 'compare' | 'search' | 'study' | 'resources' | 'glossary' | 'markers' | 'notes';
export type ComparePicker = 'book' | 'chapter' | null;

export const tools: Array<[ToolKey, string]> = [
  ['compare', 'Compare'],
  ['search', 'Search'],
  ['study', 'Study'],
  ['resources', 'Resources'],
  ['glossary', 'Glossary'],
  ['markers', 'Markers'],
  ['notes', 'Notes'],
];

export const resourceTypes: BibleResourceType[] = [
  'preface',
  'copyright',
  'study_help',
  'translation_review',
  'glossary',
  'front_matter',
  'other',
];

export const markerStatuses: BibleMarkerStatus[] = [
  'omitted',
  'empty_marker',
  'source_unavailable',
];

export const noteTypes: BibleNoteType[] = [
  'footnote',
  'cross_reference',
  'textual_variant',
];

export const inputClass =
  'h-11 min-w-0 w-full rounded-full border border-black/10 bg-white px-4 text-sm font-bold text-zinc-950 outline-none placeholder:text-zinc-500 focus:border-red-800 dark:border-white/15 dark:bg-white/10 dark:text-stone-100 dark:placeholder:text-stone-500';

export const formatToolLabel = (value: string) =>
  value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
