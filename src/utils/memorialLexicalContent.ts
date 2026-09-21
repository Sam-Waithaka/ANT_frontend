const supportedMemorialLexicalNodeTypes = new Set([
  "root",
  "paragraph",
  "text",
  "linebreak",
  "heading",
  "quote",
  "list",
  "listitem",
  "link",
  "autolink",
  "church-block",
  "editorial-blockquote",
  "scripture-block",
  "scripture-reference",
  "reflection-block",
  "prayer-block",
  "application-block",
]);

const customRenderableNodeTypes = new Set([
  "church-block",
  "editorial-blockquote",
  "scripture-block",
  "scripture-reference",
  "reflection-block",
  "prayer-block",
  "application-block",
]);

type LexicalRootLike = {
  root: {
    children: unknown[];
    type: "root";
  };
};

function readRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function parseLexicalCandidate(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

export function parseMemorialLexicalContent(value: unknown): LexicalRootLike | null {
  const candidate = readRecord(parseLexicalCandidate(value));
  const root = readRecord(candidate?.root);

  if (root?.type !== "root" || !Array.isArray(root.children)) {
    return null;
  }

  return {
    root: {
      children: root.children,
      type: "root",
    },
  };
}

export function canRenderMemorialLexicalContent(value: unknown) {
  const content = parseMemorialLexicalContent(value);

  if (!content) {
    return false;
  }

  return content.root.children.every(isSupportedMemorialLexicalNode) &&
    content.root.children.some(hasRenderableMemorialLexicalNode);
}

function isSupportedMemorialLexicalNode(node: unknown): boolean {
  const record = readRecord(node);

  if (!record) {
    return false;
  }

  const type = record.type;

  if (typeof type !== "string" || !supportedMemorialLexicalNodeTypes.has(type)) {
    return false;
  }

  const children = record.children;
  return Array.isArray(children) ? children.every(isSupportedMemorialLexicalNode) : true;
}

function hasRenderableMemorialLexicalNode(node: unknown): boolean {
  const record = readRecord(node);

  if (!record) {
    return false;
  }

  const type = record.type;

  if (type === "text") {
    return typeof record.text === "string" && record.text.trim().length > 0;
  }

  if (type === "church-block" && readRecord(record.data)?.kind === "divider") {
    return true;
  }

  if (typeof type === "string" && customRenderableNodeTypes.has(type)) {
    return hasRenderableLexicalData(record.data);
  }

  const children = record.children;
  return Array.isArray(children) ? children.some(hasRenderableMemorialLexicalNode) : false;
}

function hasRenderableLexicalData(value: unknown): boolean {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return true;
  }

  if (Array.isArray(value)) {
    return value.some(hasRenderableLexicalData);
  }

  const record = readRecord(value);
  return record ? Object.values(record).some(hasRenderableLexicalData) : false;
}