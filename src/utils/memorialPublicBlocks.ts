import type { MemorialRichText } from "../types/memorialPublic";

export type MemorialItemWithContent = {
  content?: MemorialRichText | null;
};

function itemContentBlockId(item: unknown) {
  if (!item || typeof item !== "object" || !("content" in item)) {
    return null;
  }

  const content = (item as MemorialItemWithContent).content;
  return content?.id === undefined || content.id === null ? null : String(content.id);
}

export function itemOwnedMemorialBlockIds(items: readonly unknown[]) {
  const ownedIds = new Set<string>();

  for (const item of items) {
    const contentId = itemContentBlockId(item);

    if (contentId) {
      ownedIds.add(contentId);
    }
  }

  return ownedIds;
}

export function filterItemOwnedMemorialBlocks(
  blocks: readonly MemorialRichText[],
  items: readonly unknown[],
) {
  const ownedIds = itemOwnedMemorialBlockIds(items);

  // TODO: Remove this temporary public memorial safeguard once the backend guarantees
  // item-owned rich-text content is excluded from section-level blocks[].
  return blocks.filter((block) => !ownedIds.has(String(block.id)));
}