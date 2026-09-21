import { describe, expect, it } from "vitest";

import { filterItemOwnedMemorialBlocks } from "../../src/utils/memorialPublicBlocks";
import type { MemorialRichText } from "../../src/types/memorialPublic";

const richTextBlock = (id: number | string, title: string, contentText = title): MemorialRichText => ({
  content_html: `<p>${contentText}</p>`,
  content_json: {},
  content_text: contentText,
  id,
  media_embeds: [],
  reading_time_minutes: 1,
  scripture_references: [],
  section_key: "MINISTRY_LEGACY",
  subtitle: "",
  title,
});

describe("filterItemOwnedMemorialBlocks", () => {
  it("does not render item-owned blocks as editorial section blocks", () => {
    const introBlock = richTextBlock(27, "A legacy across our church");
    const itemOwnedBlock = richTextBlock(35, "Pastoral Team tribute");

    const filteredBlocks = filterItemOwnedMemorialBlocks(
      [introBlock, itemOwnedBlock],
      [{ content: itemOwnedBlock, id: "pastoral-team" }],
    );

    expect(filteredBlocks).toEqual([introBlock]);
  });

  it("keeps the item content available for the section-specific item UI", () => {
    const itemOwnedBlock = richTextBlock(39, "John Mwangi reflection");
    const items = [{ author_name: "John Mwangi", content: itemOwnedBlock, id: "john-mwangi" }];

    const filteredBlocks = filterItemOwnedMemorialBlocks([itemOwnedBlock], items);

    expect(filteredBlocks).toEqual([]);
    expect(items[0].content).toBe(itemOwnedBlock);
    expect(items[0].content?.title).toBe("John Mwangi reflection");
  });

  it("keeps standalone introductory blocks visible", () => {
    const introBlock = richTextBlock(28, "In their own words");
    const itemOwnedBlock = richTextBlock(40, "Mary Wanjiku reflection");

    const filteredBlocks = filterItemOwnedMemorialBlocks(
      [introBlock, itemOwnedBlock],
      [{ content: itemOwnedBlock, id: "mary-wanjiku" }],
    );

    expect(filteredBlocks.map((block) => block.id)).toEqual([28]);
  });

  it("keeps multiple standalone blocks when their IDs are not referenced by items", () => {
    const firstStandaloneBlock = richTextBlock(1, "Opening word");
    const secondStandaloneBlock = richTextBlock(2, "Pastoral Team tribute", "Same title and body as an item");
    const itemContentWithDifferentId = richTextBlock(3, "Pastoral Team tribute", "Same title and body as an item");

    const filteredBlocks = filterItemOwnedMemorialBlocks(
      [firstStandaloneBlock, secondStandaloneBlock],
      [{ content: itemContentWithDifferentId, id: "pastoral-team" }],
    );

    expect(filteredBlocks).toEqual([firstStandaloneBlock, secondStandaloneBlock]);
  });

  it("leaves sections without items unchanged", () => {
    const blocks = [richTextBlock(1, "First family acknowledgement"), richTextBlock(2, "Second family acknowledgement")];

    const filteredBlocks = filterItemOwnedMemorialBlocks(blocks, []);

    expect(filteredBlocks).toEqual(blocks);
  });
});