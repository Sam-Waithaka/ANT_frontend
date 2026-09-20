// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import HomeMemorialBanner from "../../src/features/memorial/public/components/HomeMemorialBanner";
import type { MemorialPublicPayload } from "../../src/types/memorialPublic";

const mocks = vi.hoisted(() => ({ getMemorialPage: vi.fn() }));

vi.mock("../../src/api/memorialPublic", () => ({
  ELDER_GEOFFREY_MEMORIAL_API_SLUG: "elder-geoffrey-kirungu-gicharu",
  ELDER_GEOFFREY_MEMORIAL_ROUTE_SLUG: "in-loving-memory-of-elder-geoffrey-kirungu-gicharu",
  getMemorialPage: mocks.getMemorialPage,
}));

const createPayload = (overrides: Partial<MemorialPublicPayload["page"]> = {}) =>
  ({
    page: {
      birth_date: null,
      death_date: null,
      featured_at: null,
      full_name: "Elder Geoffrey Kirungu Gicharu",
      hero_image: null,
      id: 3,
      meta_description: "Memorial page",
      meta_title: "Elder Geoffrey Kirungu Gicharu Memorial",
      portrait_image: {
        alt_text: "Approved portrait of Elder Geoffrey Kirungu",
        caption: "",
        height: 900,
        id: 12,
        original_url: "https://cdn.example.org/original.jpg",
        title: "Portrait",
        uuid: "portrait-uuid",
        variant_map: {
          avif: {
            medium: {
              file_size: 12000,
              format: "avif",
              height: 500,
              id: 101,
              quality: 82,
              size_name: "medium",
              url: "https://cdn.example.org/portrait-medium.avif",
              width: 400,
            },
          },
          webp: {
            medium: {
              file_size: 16000,
              format: "webp",
              height: 500,
              id: 102,
              quality: 82,
              size_name: "medium",
              url: "https://cdn.example.org/portrait-medium.webp",
              width: 400,
            },
          },
        },
        width: 720,
      },
      published_at: "2026-09-19T08:00:00Z",
      role_title: "Chairman, A.I.C Njoro Town Local Church Council",
      slug: "elder-geoffrey-kirungu-gicharu",
      summary:
        "We honour a beloved brother and faithful servant whose leadership left an enduring mark on our fellowship.",
      years_of_service: "Fourteen years of faithful service",
      ...overrides,
    },
    sections: {} as MemorialPublicPayload["sections"],
  }) satisfies MemorialPublicPayload;

describe("HomeMemorialBanner", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    mocks.getMemorialPage.mockReset();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const renderBanner = async (enabled = true, darkMode = false) => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <HomeMemorialBanner darkMode={darkMode} enabled={enabled} />
        </MemoryRouter>,
      );
      await Promise.resolve();
      await Promise.resolve();
    });
  };

  it("renders the published memorial content, portrait, and CTA route", async () => {
    mocks.getMemorialPage.mockResolvedValueOnce(createPayload());

    await renderBanner();

    expect(mocks.getMemorialPage).toHaveBeenCalledWith("elder-geoffrey-kirungu-gicharu");
    expect(container.textContent).toContain("In loving memory");
    expect(container.textContent).toContain("Elder Geoffrey Kirungu Gicharu");
    expect(container.textContent).toContain("Fourteen years of faithful service");
    expect(container.textContent).toContain("View Memorial");
    expect(container.querySelector("section")?.className).toContain("#fffaf2");

    const link = container.querySelector<HTMLAnchorElement>("a");
    expect(link?.getAttribute("href")).toBe("/in-loving-memory-of-elder-geoffrey-kirungu-gicharu");
    expect(link?.className).toContain("min-h-12");

    const image = container.querySelector<HTMLImageElement>("img");
    expect(image?.alt).toBe("Approved portrait of Elder Geoffrey Kirungu");
    expect(image?.src).toBe("https://cdn.example.org/portrait-medium.avif");
  });

  it("uses the dark memorial surface when the site is dark", async () => {
    mocks.getMemorialPage.mockResolvedValueOnce(createPayload());

    await renderBanner(true, true);

    expect(container.querySelector("section")?.className).toContain("#211d1a");
    expect(container.textContent).toContain("Elder Geoffrey Kirungu Gicharu");
  });
  it("uses the text-only layout when no processed portrait is available", async () => {
    mocks.getMemorialPage.mockResolvedValueOnce(createPayload({ portrait_image: null }));

    await renderBanner();

    expect(container.textContent).toContain("Elder Geoffrey Kirungu Gicharu");
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("a")?.getAttribute("href")).toBe(
      "/in-loving-memory-of-elder-geoffrey-kirungu-gicharu",
    );
  });

  it("renders nothing when disabled", async () => {
    await renderBanner(false);

    expect(mocks.getMemorialPage).not.toHaveBeenCalled();
    expect(container.textContent).toBe("");
  });

  it("renders nothing when the public memorial is unavailable", async () => {
    mocks.getMemorialPage.mockResolvedValueOnce(null);

    await renderBanner();

    expect(container.textContent).toBe("");
  });

  it("fails quietly after an API error", async () => {
    mocks.getMemorialPage.mockRejectedValueOnce(new Error("network failed"));

    await renderBanner();

    expect(container.textContent).toBe("");
  });
});