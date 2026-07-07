// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WritingLibraryPage from '../../src/pages/portal/writing/WritingLibraryPage';

const mocks = vi.hoisted(() => ({
  authPermissions: ['writings.manage_taxonomy'],
  createCategory: vi.fn(),
  createCategorySeriesLink: vi.fn(),
  createResourceType: vi.fn(),
  createResourceTypeCategoryLink: vi.fn(),
  createSeries: vi.fn(),
  createWritingTag: vi.fn(),
  createWritingSeriesItem: vi.fn(),
  deleteCategory: vi.fn(),
  deleteCategorySeriesLink: vi.fn(),
  deleteResourceType: vi.fn(),
  deleteResourceTypeCategoryLink: vi.fn(),
  deleteSeries: vi.fn(),
  deleteWritingSeriesItem: vi.fn(),
  deleteWritingTag: vi.fn(),
  fetchCategories: vi.fn(),
  fetchCategorySeriesLinks: vi.fn(),
  fetchResourceTypeCategoryLinks: vi.fn(),
  fetchResourceTypes: vi.fn(),
  fetchSeries: vi.fn(),
  fetchWritingTags: vi.fn(),
  fetchWritings: vi.fn(),
  reorderWritingSeriesItems: vi.fn(),
  updateCategory: vi.fn(),
  updateCategorySeriesLink: vi.fn(),
  updateResourceType: vi.fn(),
  updateResourceTypeCategoryLink: vi.fn(),
  updateSeries: vi.fn(),
  updateWritingTag: vi.fn(),
}));

vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({ accessToken: 'access-token', permissions: mocks.authPermissions }),
}));

vi.mock('../../src/hooks/useTheme', () => ({
  useTheme: () => ({ darkMode: false }),
}));

vi.mock('../../src/components/portal/writing/WritingStudioShell', () => ({
  default: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

vi.mock('../../src/services/writingApi', () => ({
  createCategory: mocks.createCategory,
  createCategorySeriesLink: mocks.createCategorySeriesLink,
  createResourceType: mocks.createResourceType,
  createResourceTypeCategoryLink: mocks.createResourceTypeCategoryLink,
  createSeries: mocks.createSeries,
  createWritingTag: mocks.createWritingTag,
  createWritingSeriesItem: mocks.createWritingSeriesItem,
  deleteCategory: mocks.deleteCategory,
  deleteCategorySeriesLink: mocks.deleteCategorySeriesLink,
  deleteResourceType: mocks.deleteResourceType,
  deleteResourceTypeCategoryLink: mocks.deleteResourceTypeCategoryLink,
  deleteSeries: mocks.deleteSeries,
  deleteWritingSeriesItem: mocks.deleteWritingSeriesItem,
  deleteWritingTag: mocks.deleteWritingTag,
  fetchCategories: mocks.fetchCategories,
  fetchCategorySeriesLinks: mocks.fetchCategorySeriesLinks,
  fetchResourceTypeCategoryLinks: mocks.fetchResourceTypeCategoryLinks,
  fetchResourceTypes: mocks.fetchResourceTypes,
  fetchSeries: mocks.fetchSeries,
  fetchWritingTags: mocks.fetchWritingTags,
  fetchWritings: mocks.fetchWritings,
  reorderWritingSeriesItems: mocks.reorderWritingSeriesItems,
  updateCategory: mocks.updateCategory,
  updateCategorySeriesLink: mocks.updateCategorySeriesLink,
  updateResourceType: mocks.updateResourceType,
  updateResourceTypeCategoryLink: mocks.updateResourceTypeCategoryLink,
  updateSeries: mocks.updateSeries,
  updateWritingTag: mocks.updateWritingTag,
}));

const page = <T,>(results: T[]) => ({ count: results.length, next: null, previous: null, results });

const seedApi = () => {
  mocks.fetchResourceTypes.mockResolvedValue(page([{ id: 1, name: 'Devotional', slug: 'devotional', description: 'Daily writings', sort_order: 1, is_active: true, is_featured: true }]));
  mocks.fetchCategories.mockResolvedValue(page([
    { id: 2, name: 'Prayer', slug: 'prayer', description: 'Prayer writings', parent: null, children: [3], sort_order: 1, is_active: true, is_featured: false },
    { id: 3, name: 'Family Prayer', slug: 'family-prayer', description: 'Household prayer', parent: 2, children: [], sort_order: 2, is_active: false, is_featured: true },
  ]));
  mocks.fetchSeries.mockResolvedValue(page([{ id: 4, title: 'Project 52', slug: 'project-52', description: 'A year journey', sort_order: 1, is_active: true, is_featured: true, items: [{ id: 9, series: 4, writing: 12, writing_title: 'Week One', order: 0 }] }]));
  mocks.fetchWritingTags.mockResolvedValue(page([{ id: 5, name: 'Stewardship', slug: 'stewardship' }]));
  mocks.fetchResourceTypeCategoryLinks.mockResolvedValue(page([{ id: 6, resource_type: 1, resource_type_detail: { id: 1, name: 'Devotional', slug: 'devotional' }, category: 2, category_detail: { id: 2, name: 'Prayer', slug: 'prayer' }, sort_order: 1, is_active: true, is_featured: true }]));
  mocks.fetchCategorySeriesLinks.mockResolvedValue(page([{ id: 7, category: 2, category_detail: { id: 2, name: 'Prayer', slug: 'prayer' }, series: 4, series_detail: { id: 4, title: 'Project 52', slug: 'project-52' }, sort_order: 2, is_active: false, is_featured: false }]));
  mocks.fetchWritings.mockResolvedValue(page([]));
  mocks.createCategory.mockResolvedValue({ id: 30 });
  mocks.createResourceTypeCategoryLink.mockResolvedValue({ id: 31 });
  mocks.createCategorySeriesLink.mockResolvedValue({ id: 32 });
  mocks.createWritingTag.mockResolvedValue({ id: 33 });
};

const renderPage = async (root: Root) => {
  await act(async () => {
    root.render(
      <MemoryRouter>
        <WritingLibraryPage />
      </MemoryRouter>,
    );
    await Promise.resolve();
  });
};

const choosePortalSelect = async (ariaLabel: string, optionText: string, index = 0) => {
  const triggers = [...document.querySelectorAll(`button[aria-label="${ariaLabel}"]`)] as HTMLButtonElement[];
  const trigger = triggers[index];
  if (!trigger) throw new Error(`Missing PortalSelect trigger: ${ariaLabel}`);
  await act(async () => trigger.click());
  const option = [...document.querySelectorAll('[role="option"]')].find((item) => item.textContent === optionText) as HTMLButtonElement | undefined;
  if (!option) throw new Error(`Missing PortalSelect option: ${optionText}`);
  await act(async () => option.click());
};

const openCreateLibraryItemModal = async () => {
  const button = [...document.querySelectorAll('button')].find((item) => item.textContent === 'Create library item') as HTMLButtonElement | undefined;
  if (!button) throw new Error('Missing Create library item button');
  await act(async () => button.click());
};
const changeInput = async (input: HTMLInputElement | HTMLTextAreaElement, value: string) => {
  await act(async () => {
    const proto = input instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    setter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
};

describe('WritingLibraryPage', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    Object.values(mocks).forEach((value) => {
      if (typeof value === 'function' && 'mockReset' in value) value.mockReset();
    });
    mocks.authPermissions = ['writings.manage_taxonomy'];
    seedApi();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('renders all primary discovery layers, real tags, and state badges', async () => {
    await renderPage(root);

    await vi.waitFor(() => expect(container.textContent).toContain('Resource Types'));
    expect(container.textContent).toContain('Categories');
    expect(container.textContent).toContain('Series');
    expect(container.textContent).toContain('Tags');
    expect(container.textContent).toContain('Stewardship');
    expect(container.textContent).not.toContain('Tags coming soon');
    expect(container.textContent).toContain('Active');
    expect(container.textContent).toContain('Inactive');
    expect(container.textContent).toContain('Featured');
    expect(container.textContent).toContain('Devotional ' + String.fromCharCode(8594) + ' Prayer');
    expect(container.textContent).toContain('Prayer ' + String.fromCharCode(8594) + ' Project 52');
  });

  it('disables taxonomy actions without writings.manage_taxonomy', async () => {
    mocks.authPermissions = [];
    await renderPage(root);

    await vi.waitFor(() => expect(container.textContent).toContain('Create library item'));
    const createButton = [...container.querySelectorAll('button')].find((button) => button.textContent === 'Create library item') as HTMLButtonElement;
    const createPathwayButton = [...container.querySelectorAll('button')].find((button) => button.textContent === 'Create pathway') as HTMLButtonElement;
    expect(createButton.disabled).toBe(true);
    expect(createPathwayButton.disabled).toBe(true);
  });

  it('creates a tag from the library item form', async () => {
    await renderPage(root);
    await vi.waitFor(() => expect(container.textContent).toContain('Create library item'));
    await openCreateLibraryItemModal();

    await choosePortalSelect('Item type', 'Tag');
    await changeInput(([...document.querySelectorAll('input')] as HTMLInputElement[]).find((input) => input.placeholder === 'Prayer') as HTMLInputElement, 'Mercy');
    await act(async () => ([...document.querySelectorAll('button')].find((button) => button.textContent === 'Create') as HTMLButtonElement).click());

    expect(mocks.createWritingTag).toHaveBeenCalledWith('access-token', { name: 'Mercy', slug: 'mercy' });
  });

  it('creates a category with a parent category', async () => {
    await renderPage(root);
    await vi.waitFor(() => expect(container.textContent).toContain('Create library item'));
    await openCreateLibraryItemModal();
    await vi.waitFor(() => expect(document.body.textContent).toContain('Parent category optional'));

    const nameInput = ([...document.querySelectorAll('input')] as HTMLInputElement[]).find((input) => input.placeholder === 'Prayer') as HTMLInputElement;
    await changeInput(nameInput, 'Family Discipleship');
    await choosePortalSelect('Parent category', 'Prayer');
    await act(async () => ([...document.querySelectorAll('button')].find((button) => button.textContent === 'Create') as HTMLButtonElement).click());

    expect(mocks.createCategory).toHaveBeenCalledWith('access-token', expect.objectContaining({
      is_active: true,
      is_featured: false,
      name: 'Family Discipleship',
      parent: '2',
      slug: 'family-discipleship',
      sort_order: 0,
    }));
  });

  it('creates resource/category and category/series browse pathways with curation fields', async () => {
    await renderPage(root);
    await vi.waitFor(() => expect(container.textContent).toContain('Guide browsing'));

    await choosePortalSelect('Resource type', 'Devotional');
    await choosePortalSelect('Category', 'Prayer');
    await act(async () => ([...container.querySelectorAll('button')].find((button) => button.textContent === 'Create pathway') as HTMLButtonElement).click());
    expect(mocks.createResourceTypeCategoryLink).toHaveBeenCalledWith('access-token', expect.objectContaining({
      category: '2',
      is_active: true,
      is_featured: false,
      resource_type: '1',
      sort_order: 0,
    }));

    await choosePortalSelect('Pathway type', 'Category ' + String.fromCharCode(8594) + ' Series');
    await choosePortalSelect('Category', 'Prayer');
    await choosePortalSelect('Series', 'Project 52');
    await act(async () => ([...container.querySelectorAll('button')].find((button) => button.textContent === 'Create pathway') as HTMLButtonElement).click());
    expect(mocks.createCategorySeriesLink).toHaveBeenCalledWith('access-token', expect.objectContaining({
      category: '2',
      is_active: true,
      is_featured: false,
      series: '4',
      sort_order: 0,
    }));
  });
});

