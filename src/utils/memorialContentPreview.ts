import type { MemorialMediaAsset, MemorialRichText } from "../types/memorialPublic";

export type MemorialViewportSize = "mobile" | "tablet" | "desktop";

export type MemorialExcerptLimitMap = Record<MemorialViewportSize, number>;

export const defaultMemorialExcerptLimits: MemorialExcerptLimitMap = {
  desktop: 420,
  mobile: 180,
  tablet: 280,
};

export function getResponsiveExcerptLimit(
  viewportSize: MemorialViewportSize = "desktop",
  limits: Partial<MemorialExcerptLimitMap> = {},
) {
  return limits[viewportSize] ?? defaultMemorialExcerptLimits[viewportSize];
}

export function getMemorialBlockExcerpt(
  block: MemorialRichText | null | undefined,
  viewportSize: MemorialViewportSize = "desktop",
  limits: Partial<MemorialExcerptLimitMap> = {},
) {
  const limit = getResponsiveExcerptLimit(viewportSize, limits);
  const text = getMemorialBlockPreviewText(block);

  if (text.length <= limit) {
    return text;
  }

  return truncateAtWordBoundary(text, limit);
}

export function shouldCollapseMemorialContent(
  block: MemorialRichText | null | undefined,
  viewportSize: MemorialViewportSize = "desktop",
  limits: Partial<MemorialExcerptLimitMap> = {},
) {
  const limit = getResponsiveExcerptLimit(viewportSize, limits);
  return getMemorialBlockPreviewText(block).length > limit;
}

export function getPrimaryBlockImage(block: MemorialRichText | null | undefined): MemorialMediaAsset | null {
  const embed = [...(block?.media_embeds ?? [])]
    .sort((first, second) => first.order - second.order)
    .find((candidate) => Boolean(candidate.media_asset));

  return embed?.media_asset ?? null;
}

function getMemorialBlockPreviewText(block: MemorialRichText | null | undefined) {
  const contentText = normalizePreviewText(block?.content_text);

  if (contentText) {
    return contentText;
  }

  return normalizePreviewText(stripHtml(block?.content_html ?? ""));
}

function normalizePreviewText(value: string | null | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function truncateAtWordBoundary(text: string, limit: number) {
  if (limit <= 3) {
    return text.slice(0, Math.max(0, limit)).trim();
  }

  const sliced = text.slice(0, limit).trimEnd();
  const lastWhitespaceIndex = sliced.search(/\s+\S*$/);
  const candidate = lastWhitespaceIndex > Math.floor(limit * 0.55)
    ? sliced.slice(0, lastWhitespaceIndex).trimEnd()
    : sliced;

  return `${candidate.replace(/[.,;:!?-]+$/, "")}...`;
}