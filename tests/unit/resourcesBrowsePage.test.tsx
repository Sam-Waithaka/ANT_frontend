// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ResourcesBrowsePage from '../../src/pages/ResourcesBrowsePage';

const mocks = vi.hoisted(() => ({
  searchPublicWritings: vi.fn(),
}));

vi.mock('../../src/hooks/useTheme', () => ({
  useTheme: () => ({ darkMode: false, toggleTheme: vi.fn() }),
}));

vi.mock('../../src/components/SiteHeader', () => ({
  default: () => <header>Site Header</header>,
}));

vi.mock('../../src/components/SiteFooter', () => ({
  default: () => <footer>Site Footer</footer>,
}));

vi.mock('../../src/services/publicSearchApi', () => ({
  searchPublicWritings: mocks.searchPublicWritings,
}));

const article = (overrides: Record<string, unknown> = {}) => ({
  author_attributions: [{ display_name: 'Pastor Jane', id: 1, is_primary: true, order: 0, role: 'AUTHOR' }],
  author_display: 'Pastor Jane',
  byline: 'Pastor Jane',
  categories: [],
  excerpt: 'A public article excerpt.',
  id: 10,
  ministries: [],
  og_image_detail: null,
  published_at: '2026-07-17T09:00:00Z',
  reading_time_minutes: 6,
  resource_type_detail: { id: 1, name: 'Devotional', slug: 'devotional' },
  scripture_references: [],
  seo_description: 'SEO description.',
  seo_title: 'SEO title',
  series: [],
  slug: 'grace-for-today',
  tags: [],
  title: 'Grace for Today',
  writing_type: 'ARTICLE',
  ...overrides,
});

const renderBrowse = async (root: Root, path: string, route: string, mode: 'book' | 'ministry' | 'series' | 'type') => {
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={route} element={<ResourcesBrowsePage mode={mode} />} />
        </Routes>
      </MemoryRouter>,
    );
    await Promise.resolve();
  });
};

describe('ResourcesBrowsePage', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    mocks.searchPublicWritings.mockReset();
    mocks.searchPublicWritings.mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [article()],
    });
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('loads resource type browse results with resource_type_slug', async () => {
    await renderBrowse(root, '/resources/type/devotional', '/resources/type/:slug', 'type');

    await vi.waitFor(() => expect(container.textContent).toContain('Grace for Today'));
    expect(container.textContent).toContain('Devotional');
    expect(mocks.searchPublicWritings).toHaveBeenCalledWith({ resource_type_slug: 'devotional', page: 1, page_size: 24 }, expect.any(AbortSignal));
  });

  it('loads series browse results with series_slug', async () => {
    await renderBrowse(root, '/resources/series/project-52', '/resources/series/:slug', 'series');

    await vi.waitFor(() => expect(container.textContent).toContain('Grace for Today'));
    expect(container.textContent).toContain('Project 52');
    expect(mocks.searchPublicWritings).toHaveBeenCalledWith({ series_slug: 'project-52', page: 1, page_size: 24 }, expect.any(AbortSignal));
  });

  it('loads scripture book browse results with scripture_book_osis', async () => {
    await renderBrowse(root, '/resources/book/Acts', '/resources/book/:osisId', 'book');

    await vi.waitFor(() => expect(container.textContent).toContain('Grace for Today'));
    expect(container.textContent).toContain('Acts');
    expect(mocks.searchPublicWritings).toHaveBeenCalledWith({ scripture_book_osis: 'Acts', page: 1, page_size: 24 }, expect.any(AbortSignal));
  });

  it('loads ministry browse results with ministry_slug', async () => {
    await renderBrowse(root, '/resources/ministry/youth', '/resources/ministry/:slug', 'ministry');

    await vi.waitFor(() => expect(container.textContent).toContain('Grace for Today'));
    expect(container.textContent).toContain('Youth');
    expect(mocks.searchPublicWritings).toHaveBeenCalledWith({ ministry_slug: 'youth', page: 1, page_size: 24 }, expect.any(AbortSignal));
  });

  it('loads more and appends the next public writings page', async () => {
    mocks.searchPublicWritings
      .mockResolvedValueOnce({ count: 2, next: '/v1/search/writings/?page=2', previous: null, results: [article({ id: 1, title: 'First Resource' })] })
      .mockResolvedValueOnce({ count: 2, next: null, previous: '/v1/search/writings/?page=1', results: [article({ id: 2, title: 'Second Resource', slug: 'second-resource' })] });

    await renderBrowse(root, '/resources/type/devotional', '/resources/type/:slug', 'type');
    await vi.waitFor(() => expect(container.textContent).toContain('First Resource'));

    const button = [...container.querySelectorAll('button')].find((item) => item.textContent?.includes('Load more')) as HTMLButtonElement;
    await act(async () => button.click());

    await vi.waitFor(() => expect(container.textContent).toContain('Second Resource'));
    expect(container.textContent).toContain('First Resource');
    expect(mocks.searchPublicWritings).toHaveBeenLastCalledWith({ resource_type_slug: 'devotional', page: 2, page_size: 24 }, undefined);
  });

  it('shows a skeleton grid while browse results are loading', async () => {
    mocks.searchPublicWritings.mockReturnValueOnce(new Promise(() => undefined));

    await renderBrowse(root, '/resources/type/devotional', '/resources/type/:slug', 'type');

    expect(container.textContent).toContain('Loading resources');
    expect(container.querySelector('.animate-pulse')).not.toBeNull();
  });

  it('shows an intentional empty state when browse results are empty', async () => {
    mocks.searchPublicWritings.mockResolvedValueOnce({ count: 0, next: null, previous: null, results: [] });

    await renderBrowse(root, '/resources/type/devotional', '/resources/type/:slug', 'type');

    await vi.waitFor(() => expect(container.textContent).toContain('No published resources here yet.'));
    expect(container.textContent).toContain('Once published writings are connected to this part of the library, they will appear here.');
  });

  it('shows a graceful error when browse results fail to load', async () => {
    mocks.searchPublicWritings.mockRejectedValueOnce(new Error('Nope'));

    await renderBrowse(root, '/resources/type/devotional', '/resources/type/:slug', 'type');

    await vi.waitFor(() => expect(container.textContent).toContain('Unable to load these resources right now.'));
  });

});
