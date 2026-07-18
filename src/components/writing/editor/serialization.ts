export type LexicalContentJson = {
  root: {
    children: unknown[];
    direction: 'ltr' | 'rtl' | null;
    format: '' | number;
    indent: number;
    type: 'root';
    version: number;
  };
};

const emptyRoot = () => ({
  children: [{ children: [], direction: null, format: '', indent: 0, type: 'paragraph', version: 1 }],
  direction: null,
  format: '' as const,
  indent: 0,
  type: 'root' as const,
  version: 1,
});

export const createEmptyLexicalContent = (): LexicalContentJson => ({ root: emptyRoot() });

export const normalizeLexicalContent = (value: unknown): LexicalContentJson => {
  let candidate = value;

  if (typeof value === 'string') {
    try {
      candidate = JSON.parse(value) as unknown;
    } catch {
      return createEmptyLexicalContent();
    }
  }

  if (!candidate || typeof candidate !== 'object') return createEmptyLexicalContent();

  const root = (candidate as { root?: unknown }).root;
  if (!root || typeof root !== 'object') return createEmptyLexicalContent();

  const record = root as Record<string, unknown>;
  if (record.type !== 'root' || !Array.isArray(record.children)) return createEmptyLexicalContent();

  return {
    root: {
      children: record.children,
      direction: record.direction === 'ltr' || record.direction === 'rtl' ? record.direction : null,
      format: typeof record.format === 'number' || record.format === '' ? record.format : '',
      indent: typeof record.indent === 'number' ? record.indent : 0,
      type: 'root',
      version: typeof record.version === 'number' ? record.version : 1,
    },
  };
};

export const lexicalContentToText = (content: LexicalContentJson) => {
  const collectText = (node: unknown): string[] => {
    if (!node || typeof node !== 'object') return [];
    const record = node as Record<string, unknown>;
    const text = typeof record.text === 'string' ? [record.text] : [];
    const children = Array.isArray(record.children) ? record.children.flatMap(collectText) : [];
    return [...text, ...children];
  };

  return content.root.children.flatMap(collectText).join(' ').replace(/\s+/g, ' ').trim();
};

export const countLexicalWords = (text: string) => text.trim() ? text.trim().split(/\s+/).length : 0;
