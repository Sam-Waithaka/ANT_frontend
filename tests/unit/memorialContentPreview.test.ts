import { describe, expect, it } from "vitest";
import {
  defaultMemorialExcerptLimits,
  getMemorialBlockExcerpt,
  getPrimaryBlockImage,
  getResponsiveExcerptLimit,
  shouldCollapseMemorialContent,
  type MemorialViewportSize,
} from "../../src/utils/memorialContentPreview";
import type { MemorialMediaAsset, MemorialRichText } from "../../src/types/memorialPublic";

function richText(overrides: Partial<MemorialRichText> = {}): MemorialRichText {
  return {
    content_html: "",
    content_json: null,
    content_text: "",
    id: "block-1",
    media_embeds: [],
    reading_time_minutes: null,
    scripture_references: [],
    section_key: "LIFE_SERVICE",
    subtitle: "",
    title: "",
    ...overrides,
  };
}

function image(id: number): MemorialMediaAsset {
  return {
    alt_text: `Image ${id}`,
    caption: "",
    height: 600,
    id,
    original_url: `/image-${id}.jpg`,
    title: `Image ${id}`,
    uuid: `image-${id}`,
    variant_map: null,
    width: 900,
  };
}

describe("memorial content preview helpers", () => {
  it("uses content_text before content_html for previews", () => {
    const block = richText({
      content_html: "<p>HTML fallback text</p>",
      content_text: "Canonical plain text",
    });

    expect(getMemorialBlockExcerpt(block)).toBe("Canonical plain text");
  });

  it("falls back to stripped content_html when content_text is empty", () => {
    const block = richText({
      content_html: "<p>HTML &amp; fallback&nbsp;text.</p><script>ignore()</script>",
    });

    expect(getMemorialBlockExcerpt(block)).toBe("HTML & fallback text.");
  });

  it("uses responsive excerpt limits", () => {
    const sizes: MemorialViewportSize[] = ["mobile", "tablet", "desktop"];

    expect(sizes.map((size) => getResponsiveExcerptLimit(size))).toEqual([
      defaultMemorialExcerptLimits.mobile,
      defaultMemorialExcerptLimits.tablet,
      defaultMemorialExcerptLimits.desktop,
    ]);
  });

  it("collapses only content longer than the responsive limit", () => {
    const block = richText({ content_text: "A short remembrance." });
    const longBlock = richText({ content_text: "word ".repeat(80) });

    expect(shouldCollapseMemorialContent(block, "mobile")).toBe(false);
    expect(shouldCollapseMemorialContent(longBlock, "mobile")).toBe(true);
    expect(shouldCollapseMemorialContent(longBlock, "desktop", { desktop: 1000 })).toBe(false);
  });

  it("truncates excerpts at a word boundary", () => {
    const block = richText({ content_text: "This remembrance should stop before splitting the final word." });

    expect(getMemorialBlockExcerpt(block, "mobile", { mobile: 32 })).toBe("This remembrance should stop...");
  });

  it("returns the first media embed image by order", () => {
    const firstImage = image(1);
    const secondImage = image(2);
    const block = richText({
      media_embeds: [
        {
          alt_text_override: "",
          caption_override: "",
          embed_id: "second",
          id: "second",
          media_asset: secondImage,
          order: 2,
          position_hint: "",
        },
        {
          alt_text_override: "",
          caption_override: "",
          embed_id: "first",
          id: "first",
          media_asset: firstImage,
          order: 1,
          position_hint: "",
        },
      ],
    });

    expect(getPrimaryBlockImage(block)).toBe(firstImage);
  });
});