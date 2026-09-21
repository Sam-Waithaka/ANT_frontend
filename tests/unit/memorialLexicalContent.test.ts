import { describe, expect, it } from "vitest";
import {
  canRenderMemorialLexicalContent,
  parseMemorialLexicalContent,
} from "../../src/utils/memorialLexicalContent";

const paragraphContent = {
  root: {
    children: [
      {
        children: [{ text: "A faithful memorial paragraph.", type: "text", version: 1 }],
        direction: null,
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      },
    ],
    direction: null,
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
};

describe("memorial Lexical content support", () => {
  it("accepts supported renderable Lexical documents", () => {
    expect(canRenderMemorialLexicalContent(paragraphContent)).toBe(true);
  });

  it("accepts supported renderable Lexical documents serialized as strings", () => {
    expect(canRenderMemorialLexicalContent(JSON.stringify(paragraphContent))).toBe(true);
  });

  it("rejects malformed documents so HTML fallback can render", () => {
    expect(parseMemorialLexicalContent({ root: { children: [], type: "paragraph" } })).toBeNull();
    expect(canRenderMemorialLexicalContent("not json")).toBe(false);
  });

  it("rejects unsupported node types so HTML fallback can render", () => {
    expect(
      canRenderMemorialLexicalContent({
        root: {
          children: [{ type: "unknown-public-node", version: 1 }],
          type: "root",
        },
      }),
    ).toBe(false);
  });

  it("treats image-only church blocks as renderable", () => {
    expect(
      canRenderMemorialLexicalContent({
        root: {
          children: [
            {
              data: { kind: "image", mediaAssetId: 21 },
              type: "church-block",
              version: 1,
            },
          ],
          type: "root",
        },
      }),
    ).toBe(true);
  });

  it("does not render empty supported documents", () => {
    expect(
      canRenderMemorialLexicalContent({
        root: {
          children: [
            {
              children: [],
              type: "paragraph",
            },
          ],
          type: "root",
        },
      }),
    ).toBe(false);
  });
});