// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ResourcesPage from '../../src/pages/ResourcesPage';

const mocks = vi.hoisted(() => ({
  fetchResourcesHome: vi.fn(),
  fetchResourcesNavigation: vi.fn(),
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

vi.mock('../../src/services/resourcesApi', () => ({
  fetchResourcesHome: mocks.fetchResourcesHome,
  fetchResourcesNavigation: mocks.fetchResourcesNavigation,
}));

const renderPage = async (root: Root) => {
  await act(async () => {
    root.render(<ResourcesPage />);
    await Promise.resolve();
  });
};

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

describe('ResourcesPage', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    mocks.fetchResourcesHome.mockReset();
    mocks.fetchResourcesNavigation.mockReset();
    mocks.fetchResourcesHome.mockResolvedValue({
      featured_articles: [article({ id: 11, title: 'Featured Mercy', slug: 'featured-mercy' })],
      featured_categories: [],
      featured_series: [{ description: 'A year in the Word.', id: 4, slug: 'project-52', title: 'Project 52', writing_count: 52 }],
      hero_featured: article({ title: 'Hero Resource' }),
      latest_articles: [article({ id: 12, title: 'Latest Grace', slug: 'latest-grace' })],
      ministries: [{ id: 3, name: 'Youth Ministry', slug: 'youth', summary: 'Youth resources', writing_count: 7 }],
      resource_types: [{ id: 1, name: 'Devotional', slug: 'devotional', description: '', is_active: true, is_featured: true, sort_order: 0, writing_count: 2 }],
      scripture_books: [{ abbreviation: 'Ps', id: 19, name: 'Psalms', number: 19, osis_id: 'Ps', testament: 'OT', writing_count: 8 }],
    });
    mocks.fetchResourcesNavigation.mockResolvedValue({
      categories: [],
      category_series_links: [],
      ministries: [{ id: 3, name: 'Youth Ministry', slug: 'youth', summary: 'Youth resources', writing_count: 7 }],
      resource_type_category_links: [],
      resource_types: [
        { id: 1, name: 'Devotional', slug: 'devotional', description: '', is_active: true, is_featured: true, sort_order: 0, writing_count: 2 },
        { id: 2, name: 'Bible Study', slug: 'bible-study', description: '', is_active: true, is_featured: false, sort_order: 1, writing_count: 4 },
      ],
      scripture_books: [{ abbreviation: 'Ps', id: 19, name: 'Psalms', number: 19, osis_id: 'Ps', testament: 'OT', writing_count: 8 }],
      series: [{ description: 'A year in the Word.', id: 4, slug: 'project-52', title: 'Project 52', writing_count: 52 }],
    });
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('loads public resources home and navigation, then renders backend-powered sections', async () => {
    await renderPage(root);

    await vi.waitFor(() => expect(container.textContent).toContain('Hero Resource'));

    expect(mocks.fetchResourcesHome).toHaveBeenCalledWith(expect.any(AbortSignal));
    expect(mocks.fetchResourcesNavigation).toHaveBeenCalledWith({}, expect.any(AbortSignal));
    expect(container.textContent).toContain('All');
    expect(container.textContent).toContain('Devotional');
    expect(container.textContent).toContain('Bible Study');
    expect(container.textContent).toContain('Featured Mercy');
    expect(container.textContent).toContain('Project 52');
    expect(container.textContent).toContain('Psalms');
    expect(container.textContent).toContain('Youth Ministry');
    expect(container.textContent).toContain('Latest Grace');
  });


  it('shows landing skeletons while public resources are loading', async () => {
    mocks.fetchResourcesHome.mockReturnValueOnce(new Promise(() => undefined));
    mocks.fetchResourcesNavigation.mockReturnValueOnce(new Promise(() => undefined));

    await renderPage(root);

    expect(container.querySelector('.animate-pulse')).not.toBeNull();
  });

  it('uses the latest article in the hero when no featured hero is curated', async () => {
    mocks.fetchResourcesHome.mockResolvedValueOnce({
      featured_articles: [],
      featured_categories: [],
      featured_series: [],
      hero_featured: null,
      latest_articles: [article({ id: 44, slug: 'latest-stand-in', title: 'Latest Stand In' })],
      ministries: [],
      resource_types: [],
      scripture_books: [],
    });

    await renderPage(root);

    await vi.waitFor(() => expect(container.textContent).toContain('Latest Stand In'));
    expect(container.textContent).toContain('Latest Resource');
    expect(container.textContent).not.toContain('No featured resource yet.');
  });

  it('shows intentional empty states when public resources arrays are empty', async () => {
    mocks.fetchResourcesHome.mockResolvedValueOnce({
      featured_articles: [],
      featured_categories: [],
      featured_series: [],
      hero_featured: null,
      latest_articles: [],
      ministries: [],
      resource_types: [],
      scripture_books: [],
    });
    mocks.fetchResourcesNavigation.mockResolvedValueOnce({
      categories: [],
      category_series_links: [],
      ministries: [],
      resource_type_category_links: [],
      resource_types: [],
      scripture_books: [],
      series: [],
    });

    await renderPage(root);

    await vi.waitFor(() => expect(container.textContent).toContain('No featured resource yet.'));
    expect(container.textContent).toContain('Resource types will appear here once published resources are categorized.');
    expect(container.textContent).toContain('Featured series will appear here once published writings are curated into collections.');
    expect(container.textContent).toContain('Scripture books will appear here once published articles reference them.');
  });

  it('shows a graceful error when public resources fail to load', async () => {
    mocks.fetchResourcesHome.mockRejectedValueOnce(new Error('Nope'));

    await renderPage(root);

    await vi.waitFor(() => expect(container.textContent).toContain('Unable to load the resources library right now.'));
  });
});
