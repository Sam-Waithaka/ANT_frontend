import { createApiUrl } from "../services/apiClient";
import type {
  MemorialPublicPayload,
  MemorialPublicSections,
  MemorialRichText,
} from "../types/memorialPublic";

export const ELDER_GEOFFREY_MEMORIAL_ROUTE_SLUG =
  "in-loving-memory-of-elder-geoffrey-kirungu-gicharu";

export const ELDER_GEOFFREY_MEMORIAL_API_SLUG = ELDER_GEOFFREY_MEMORIAL_ROUTE_SLUG;

export const memorialSectionKeys = [
  "hero",
  "official_statement",
  "life_service",
  "ministry_legacy",
  "personal_tributes",
  "leadership_timeline",
  "gallery",
  "recordings",
  "arrangements",
  "family",
  "closing_hope",
] as const satisfies readonly (keyof MemorialPublicSections)[];

type MemorialSectionKey = (typeof memorialSectionKeys)[number];

const createMemorialPublicPagePath = (slug: string) => `/v1/memorial/public/pages/${slug}/`;

export const createMemorialPublicPageUrl = (slug: string) => createApiUrl(createMemorialPublicPagePath(slug));

type MemorialSectionShapeSummary = {
  block_count: number;
  block_fields: string[];
  item_count?: number;
  item_fields?: string[];
};

export type MemorialPayloadShapeSummary = {
  page_fields: string[];
  section_keys: MemorialSectionKey[];
  sections: Record<MemorialSectionKey, MemorialSectionShapeSummary>;
};

export async function getMemorialPage(slug: string): Promise<MemorialPublicPayload | null> {
  const endpoint = createMemorialPublicPageUrl(slug);
  const response = await fetch(endpoint, {
    headers: { Accept: "application/json" },
  });
  const responseText = await response.text();

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Unable to load memorial page from ${endpoint}`);
  }

  try {
    return JSON.parse(responseText) as MemorialPublicPayload;
  } catch (error) {
    throw new Error(`Memorial endpoint returned a non-JSON response from ${endpoint}`, { cause: error });
  }
}

export function summarizeMemorialPayloadShape(
  payload: MemorialPublicPayload,
): MemorialPayloadShapeSummary {
  const sections = memorialSectionKeys.reduce(
    (summary, sectionKey) => {
      const section = payload.sections[sectionKey];
      const blocks = section.blocks;
      const items = "items" in section ? section.items : undefined;

      summary[sectionKey] = {
        block_count: blocks.length,
        block_fields: summarizeFirstBlockFields(blocks),
        ...(Array.isArray(items)
          ? {
              item_count: items.length,
              item_fields: summarizeFirstItemFields(items),
            }
          : {}),
      };

      return summary;
    },
    {} as Record<MemorialSectionKey, MemorialSectionShapeSummary>,
  );

  return {
    page_fields: Object.keys(payload.page),
    section_keys: [...memorialSectionKeys],
    sections,
  };
}

function summarizeFirstBlockFields(blocks: MemorialRichText[]) {
  const firstBlock = blocks[0];

  if (!firstBlock) {
    return [];
  }

  return Object.keys(firstBlock);
}

function summarizeFirstItemFields(items: unknown[]) {
  const firstItem = items[0];

  if (!firstItem || typeof firstItem !== "object") {
    return [];
  }

  return Object.keys(firstItem);
}
