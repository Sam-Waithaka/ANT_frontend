// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import WritingContentRenderer from "../../src/components/writing/WritingContentRenderer";

describe("WritingContentRenderer shared model", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("renders moved custom nodes through the public read-only pipeline", async () => {
    await act(async () => {
      root.render(
        <WritingContentRenderer
          contentJson={{
            root: {
              children: [
                {
                  children: [
                    { text: "The Psalmist wrote ", type: "text", version: 1 },
                    {
                      data: {
                        book_osis: "Ps",
                        chapter_start: 119,
                        display: "inline",
                        display_text: "Psalm 119:11",
                        reference: "Psalm 119:11",
                        source: "library",
                        text: "I have hidden Your word in my heart.",
                        verse_start: 11,
                        version: "BSB",
                      },
                      type: "scripture-reference",
                      version: 1,
                    },
                  ],
                  direction: null,
                  format: "",
                  indent: 0,
                  type: "paragraph",
                  version: 1,
                },
                {
                  data: {
                    authorVoice: "Editor",
                    content: "God meets His people through His Word.",
                    title: "A devotional thought",
                  },
                  type: "reflection-block",
                  version: 1,
                },
                {
                  data: {
                    attribution: "Tim Keller",
                    content: "To be loved and to be known.",
                    context: "On grace",
                  },
                  type: "editorial-blockquote",
                  version: 1,
                },
              ],
              direction: null,
              format: "",
              indent: 0,
              type: "root",
              version: 1,
            },
          }}
          darkMode={false}
        />,
      );
    });

    expect(container.querySelector('[aria-label="Article preview content"]')).not.toBeNull();
    expect(container.textContent).toContain("Psalm 119:11");
    expect(container.textContent).toContain("Reflection");
    expect(container.textContent).toContain("God meets His people through His Word.");
    expect(container.textContent).toContain("Quotation");
    expect(container.textContent).toContain("To be loved and to be known.");
    expect(container.textContent).toContain("Tim Keller");
  });

  it("renders basic paragraphs, headings, and lists after the shared model move", async () => {
    await act(async () => {
      root.render(
        <WritingContentRenderer
          contentJson={{
            root: {
              children: [
                {
                  children: [{ text: "A plain opening paragraph.", type: "text", version: 1 }],
                  direction: null,
                  format: "",
                  indent: 0,
                  type: "paragraph",
                  version: 1,
                },
                {
                  children: [{ text: "A Clear Heading", type: "text", version: 1 }],
                  direction: null,
                  format: "",
                  indent: 0,
                  tag: "h2",
                  type: "heading",
                  version: 1,
                },
                {
                  children: [
                    {
                      checked: undefined,
                      children: [{ text: "First faithful step", type: "text", version: 1 }],
                      direction: null,
                      format: "",
                      indent: 0,
                      type: "listitem",
                      value: 1,
                      version: 1,
                    },
                    {
                      checked: undefined,
                      children: [{ text: "Second faithful step", type: "text", version: 1 }],
                      direction: null,
                      format: "",
                      indent: 0,
                      type: "listitem",
                      value: 2,
                      version: 1,
                    },
                  ],
                  direction: null,
                  format: "",
                  indent: 0,
                  listType: "number",
                  start: 1,
                  tag: "ol",
                  type: "list",
                  version: 1,
                },
              ],
              direction: null,
              format: "",
              indent: 0,
              type: "root",
              version: 1,
            },
          }}
          darkMode={false}
        />,
      );
    });

    expect(container.querySelector('[aria-label="Article preview content"]')).not.toBeNull();
    expect(container.textContent).toContain("A plain opening paragraph.");
    expect(container.textContent).toContain("A Clear Heading");
    expect(container.textContent).toContain("First faithful step");
    expect(container.textContent).toContain("Second faithful step");
  });
});