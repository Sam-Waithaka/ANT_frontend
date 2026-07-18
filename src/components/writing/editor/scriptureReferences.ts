import type { ScriptureData } from './nodes/scriptureTypes';
import type { WritingScriptureReference, WritingScriptureReferencePayload } from '../../../types/writing';

type LexicalLikeNode = {
  children?: unknown;
  data?: ScriptureData;
  type?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === 'object');

const readPositiveNumber = (value: unknown) => {
  const number = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : 0;
  return Number.isFinite(number) && number > 0 ? number : undefined;
};

export const scriptureDataToReferencePayload = (data: ScriptureData): WritingScriptureReferencePayload | null => {
  const book_osis = typeof data.book_osis === 'string' ? data.book_osis.trim() : '';
  const chapter_start = readPositiveNumber(data.chapter_start);
  const verse_start = readPositiveNumber(data.verse_start);

  if (!book_osis || !chapter_start || !verse_start) return null;

  const chapter_end = readPositiveNumber(data.chapter_end) ?? null;
  const verse_end = readPositiveNumber(data.verse_end) ?? null;
  const display_text = (data.display_text || data.reference || '').trim();

  return {
    book_osis,
    chapter_start,
    verse_start,
    chapter_end,
    verse_end,
    version: (data.version || 'BSB').trim() || 'BSB',
    display_text: display_text || `${data.bookLabel || book_osis} ${chapter_start}:${verse_start}${verse_end ? `-${verse_end}` : ''}`,
  };
};

export const scriptureReferenceToNodeData = (reference: WritingScriptureReference, current?: ScriptureData): ScriptureData => ({
  ...current,
  book_osis: reference.book_detail?.osis_id || reference.book,
  bookLabel: reference.book_detail?.name || current?.bookLabel || reference.book,
  chapter_start: reference.chapter_start,
  verse_start: reference.verse_start,
  chapter_end: reference.chapter_end ?? null,
  verse_end: reference.verse_end ?? null,
  display: current?.display || 'block',
  display_text: reference.display_text,
  reference: reference.display_text,
  source: current?.source || 'api',
  sourceId: current?.sourceId,
  text: current?.text || '',
  version: reference.version || current?.version || 'BSB',
  verses: current?.verses,
});

export const scriptureReferenceKey = (reference: WritingScriptureReferencePayload) => [
  reference.book_osis,
  reference.chapter_start,
  reference.verse_start,
  reference.chapter_end ?? '',
  reference.verse_end ?? '',
  reference.version || 'BSB',
].join('|');

export const findWritingScriptureReference = (
  references: WritingScriptureReference[] | undefined,
  data: ScriptureData,
): WritingScriptureReference | undefined => {
  const payload = scriptureDataToReferencePayload(data);
  if (!payload) return undefined;
  const key = scriptureReferenceKey(payload);
  return references?.find((reference) => {
    const referencePayload = scriptureDataToReferencePayload(scriptureReferenceToNodeData(reference));
    return referencePayload ? scriptureReferenceKey(referencePayload) === key : false;
  });
};

const walk = (node: unknown, references: WritingScriptureReferencePayload[]) => {
  if (!isRecord(node)) return;

  const lexicalNode = node as LexicalLikeNode;
  if ((lexicalNode.type === 'scripture-block' || lexicalNode.type === 'scripture-reference') && lexicalNode.data) {
    const reference = scriptureDataToReferencePayload(lexicalNode.data);
    if (reference) references.push(reference);
  }

  if (Array.isArray(lexicalNode.children)) {
    lexicalNode.children.forEach((child) => walk(child, references));
  }
};

export const extractScriptureReferencesFromContent = (content: unknown): WritingScriptureReferencePayload[] => {
  const references: WritingScriptureReferencePayload[] = [];
  const startNode = isRecord(content) && isRecord(content.root) ? content.root : content;
  walk(startNode, references);

  const seen = new Set<string>();
  return references.filter((reference) => {
    const key = scriptureReferenceKey(reference);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

