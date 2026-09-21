import type { MemorialRichText } from "../types/memorialPublic";

export type MemorialItemWithContent = {
  content?: MemorialRichText | null;
};

export function itemOwnedMemorialBlockIds<TItem extends MemorialItemWithContent>(items: readonly TItem[]) {
  const ownedIds = new Set<string>();

  for (const item of items) {
    const contentId = item.content?.id;

    if (contentId !== undefined && contentId !== null) {
      ownedIds.add(String(contentId));
    }
  }

  return ownedIds;
}

export function filterItemOwnedMemorialBlocks<TItem extends MemorialItemWithContent>(
  blocks: readonly MemorialRichText[],
  items: readonly TItem[],
) {
  const ownedIds = itemOwnedMemorialBlockIds(items);

  // TODO: Remove this temporary public memorial safeguard once the backend guarantees
  // item-owned rich-text content is excluded from section-level blocks[].
  return blocks.filter((block) => !ownedIds.has(String(block.id)));
}