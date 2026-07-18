// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ResourcesDetailPage from "../../src/pages/ResourcesDetailPage";

const mocks = vi.hoisted(() => ({
  fetchPublicResourceDetail: vi.fn(),
}));

vi.mock("../../src/hooks/useTheme", () => ({
  useTheme: () => ({ darkMode: false, toggleTheme: vi.fn() }),
}));

vi.mock("../../src/components/SiteHeader", () => ({
  default: () => <header>Site Header</header>,
}));

vi.mock("../../src/components/SiteFooter", () => ({
  default: () => <footer>Site Footer</footer>,
}));

vi.mock("../../src/services/resourcesApi", () => ({
  fetchPublicResourceDetail: mocks.fetchPublicResourceDetail,
}));

const detail = (overrides: Record<string, unknown> = {}) => ({
  author_attributions: [
    { display_name: "Pastor Jane", id: 1, is_primary: true, order: 0, role: "AUTHOR" },
  ],
  author_display: "Pastor Jane",
  byline: "Pastor Jane",
  canonical_lookup: {
    published_at: "2026-07-17T09:00:00Z",
    slug: "grace-for-today",
  },
  canonical_url: "/resources/grace-for-today",
  categories: [],
  content_html: "<p>Flat cached HTML</p>",
  content_json: {
    root: {
      children: [
        {
          children: [
            {
              text: "Grace teaches us to walk faithfully.",
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
  },
  content_text: "Grace teaches us to walk faithfully.",
  content_version: 1,
  excerpt: "A public article excerpt.",
  id: 10,
  media_embeds: [],
  ministries: [],
  next_article: null,
  og_description: "OG description.",
  og_image_detail: null,
  og_title: "OG title",
  previous_article: null,
  published_at: "2026-07-17T09:00:00Z",
  reading_time_minutes: 6,
  resource_type_detail: { id: 1, name: "Devotional", slug: "devotional" },
  scripture_references: [],
  seo_description: "SEO description.",
  seo_title: "SEO title",
  series: [],
  slug: "grace-for-today",
  slug_variants: [],
  tags: [],
  title: "Grace for Today",
  writing_type: "ARTICLE",
  ...overrides,
});

const renderDetail = async (
  root: Root,
  path = "/resources/grace-for-today",
) => {
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/resources/:slug" element={<ResourcesDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );
    await Promise.resolve();
  });
};

describe("ResourcesDetailPage", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    mocks.fetchPublicResourceDetail.mockReset();
    mocks.fetchPublicResourceDetail.mockResolvedValue(detail());
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("loads a public resource by slug and renders it through the article reader", async () => {
    await renderDetail(root);

    await vi.waitFor(() => expect(container.textContent).toContain("Grace for Today"));
    expect(mocks.fetchPublicResourceDetail).toHaveBeenCalledWith(
      "grace-for-today",
      undefined,
      expect.any(AbortSignal),
    );
    expect(container.querySelector('[aria-label="Published writing"]')).not.toBeNull();
    expect(container.querySelector(".editor-paper-surface-light")).not.toBeNull();
    expect(container.textContent).toContain("A public article excerpt.");
    expect(container.textContent).toContain("Grace teaches us to walk faithfully.");
    expect(container.textContent).not.toContain("Flat cached HTML");
    expect(container.textContent).toContain("Pastor Jane");
    expect(container.textContent).toContain("6 min read");
  });

  it("passes published_at query parameter when present", async () => {
    await renderDetail(
      root,
      "/resources/grace-for-today?published_at=2026-07-17T09%3A00%3A00Z",
    );

    await vi.waitFor(() =>
      expect(mocks.fetchPublicResourceDetail).toHaveBeenCalledWith(
        "grace-for-today",
        "2026-07-17T09:00:00Z",
        expect.any(AbortSignal),
      ),
    );
  });

  it("shows a graceful error when the public detail cannot load", async () => {
    mocks.fetchPublicResourceDetail.mockRejectedValueOnce(new Error("Nope"));

    await renderDetail(root);

    await vi.waitFor(() =>
      expect(container.textContent).toContain("Unable to load this resource right now."),
    );
    expect(container.textContent).toContain("Back to Resources");
  });
});
