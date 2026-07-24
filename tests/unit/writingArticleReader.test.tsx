// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import WritingArticleReader from "../../src/components/writing/WritingArticleReader";

describe("WritingArticleReader", () => {
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

  it("renders a published writing through the shared paper surface and read-only content renderer", async () => {
    await act(async () => {
      root.render(
        <WritingArticleReader
          contentJson={{
            root: {
              children: [
                {
                  children: [
                    {
                      text: "Come, let us worship and bow down.",
                      type: "text",
                      version: 1,
                    },
                  ],
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
          }}
          darkMode={false}
          excerpt="A call to worship from Psalm 95."
          title="Psalm 95:6"
        />,
      );
    });

    expect(container.querySelector('[aria-label="Published writing"]')).not.toBeNull();
    expect(container.querySelector('[aria-label="Article preview content"]')).not.toBeNull();
    expect(container.querySelector(".editor-paper-surface-light")).not.toBeNull();
    expect(container.textContent).toContain("Psalm 95:6");
    expect(container.textContent).toContain("A call to worship from Psalm 95.");
    expect(container.textContent).toContain("Come, let us worship and bow down.");
  });

  it("loads the cover image through the shared responsive image path", async () => {
    await act(async () => {
      root.render(
        <WritingArticleReader
          contentJson={{
            root: {
              children: [
                {
                  children: [{ text: "Covered article body", type: "text", version: 1 }],
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
          }}
          coverImage={{
            alt_text: "Church congregation worshipping",
            id: 19,
            title: "Sunday worship",
            url: "/media/sunday-worship.jpg",
          }}
          darkMode={false}
          title="Covered Article"
        />,
      );
    });

    const image = container.querySelector('img[alt="Church congregation worshipping"]') as HTMLImageElement;
    expect(image).not.toBeNull();
    expect(image.getAttribute("loading")).toBe("eager");
    expect(image.getAttribute("fetchpriority") || image.getAttribute("fetchPriority")).toBe("high");
    expect(image.getAttribute("src")).toBe("/media/sunday-worship.jpg");
  });

  it("prefers Lexical JSON over cached HTML while rich HTML is not contract-ready", async () => {
    await act(async () => {
      root.render(
        <WritingArticleReader
          contentJson={{
            root: {
              children: [
                {
                  children: [{ text: "Rich Lexical content", type: "text", version: 1 }],
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
          }}
          darkMode={false}
          title="JSON First"
        />,
      );
    });

    expect(container.textContent).toContain("Rich Lexical content");
    expect(container.textContent).not.toContain("Flat cached HTML");
  });
  it("renders the dark shared paper surface for published reading", async () => {
    await act(async () => {
      root.render(
        <WritingArticleReader
          contentJson={{
            root: {
              children: [
                {
                  children: [{ text: "Dark published content", type: "text", version: 1 }],
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
          }}
          darkMode
          title="Dark Reader"
        />,
      );
    });

    expect(container.querySelector('[aria-label="Published writing"]')).not.toBeNull();
    expect(container.querySelector(".editor-paper-surface-dark")).not.toBeNull();
    expect(container.textContent).toContain("Dark published content");
  });
});
