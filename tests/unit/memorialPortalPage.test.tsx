// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MemorialPortalPage from '../../src/pages/portal/memorials/MemorialPortalPage';
import type { MemorialPage } from '../../src/types/memorial';

const mocks = vi.hoisted(() => ({
  createMemorialPage: vi.fn(),
  fetchMemorialPages: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock('../../src/hooks/useTheme', () => ({
  useTheme: () => ({ darkMode: false, toggleTheme: vi.fn() }),
}));

vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({ accessToken: 'access-token' }),
}));

vi.mock('../../src/components/portal/PortalToast', () => ({
  usePortalToast: () => ({
    error: mocks.toastError,
    success: mocks.toastSuccess,
  }),
}));

vi.mock('../../src/components/navigation/SiteHeader', () => ({
  default: () => <header>Site header</header>,
}));

vi.mock('../../src/components/navigation/SiteFooter', () => ({
  default: () => <footer>Site footer</footer>,
}));

vi.mock('../../src/services/memorialApi', () => ({
  createMemorialPage: mocks.createMemorialPage,
  fetchMemorialPages: mocks.fetchMemorialPages,
}));

const memorial = (overrides: Partial<MemorialPage> = {}): MemorialPage => ({
  created_at: '2026-09-19T09:00:00Z',
  full_name: 'Rev. Jane Doe',
  id: 1,
  is_visible: false,
  role_title: 'LCC Chairperson',
  slug: 'rev-jane-doe',
  status: 'DRAFT',
  summary: 'Served the church faithfully.',
  updated_at: '2026-09-19T09:00:00Z',
  ...overrides,
});

const page = (items: MemorialPage[], next: string | null = null) => ({
  count: items.length,
  next,
  previous: null,
  results: items,
});

const renderPage = async (root: Root, path = '/portal/memorials') => {
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <MemorialPortalPage />
      </MemoryRouter>,
    );
    await Promise.resolve();
  });
};

const changeInput = async (input: HTMLInputElement, value: string) => {
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    setter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
};

const changeSelect = async (select: HTMLSelectElement, value: string) => {
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')?.set;
    setter?.call(select, value);
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
};

describe('MemorialPortalPage', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    mocks.createMemorialPage.mockReset();
    mocks.fetchMemorialPages.mockReset();
    mocks.fetchMemorialPages.mockResolvedValue(page([memorial()]));
    mocks.toastError.mockReset();
    mocks.toastSuccess.mockReset();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('loads memorial pages and links each page to its editor route', async () => {
    await renderPage(root);

    await vi.waitFor(() => expect(container.textContent).toContain('Rev. Jane Doe'));
    expect(mocks.fetchMemorialPages).toHaveBeenCalledWith('access-token', {
      page: 1,
      page_size: 24,
      search: '',
      status: 'ALL',
    }, expect.any(AbortSignal));
    expect(container.textContent).toContain('LCC Chairperson');
    expect(container.textContent).toContain('Draft');
    expect(container.querySelector('a[href="/portal/memorials/1"]')?.textContent).toContain('Open editor');
  });

  it('applies search and status filters through the memorial API', async () => {
    mocks.fetchMemorialPages.mockResolvedValue(page([]));

    await renderPage(root);
    await vi.waitFor(() => expect(mocks.fetchMemorialPages).toHaveBeenCalledTimes(1));

    await changeInput(container.querySelector('input[placeholder="Search memorial pages"]') as HTMLInputElement, 'Jane');
    await vi.waitFor(() => expect(mocks.fetchMemorialPages).toHaveBeenLastCalledWith('access-token', expect.objectContaining({
      search: 'Jane',
    }), expect.any(AbortSignal)));

    await changeSelect(container.querySelector('[aria-label="Memorial status"]') as HTMLSelectElement, 'PUBLISHED');
    await vi.waitFor(() => expect(mocks.fetchMemorialPages).toHaveBeenLastCalledWith('access-token', expect.objectContaining({
      search: 'Jane',
      status: 'PUBLISHED',
    }), expect.any(AbortSignal)));
  });

  it('creates a draft memorial shell and navigates to the placeholder editor target', async () => {
    mocks.fetchMemorialPages.mockResolvedValue(page([]));
    mocks.createMemorialPage.mockResolvedValue(memorial({ id: 12, slug: 'rev-jane-doe' }));

    await renderPage(root);
    await vi.waitFor(() => expect(container.textContent).toContain('No memorial pages yet'));

    const newButton = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('New Memorial'),
    ) as HTMLButtonElement;
    await act(async () => newButton.click());

    const inputs = Array.from(document.body.querySelectorAll('input')) as HTMLInputElement[];
    await changeInput(inputs.find((input) => input.placeholder === 'Rev. Jane Doe')!, 'Rev. Jane Doe');
    await changeInput(inputs.find((input) => input.placeholder === 'LCC Chairperson, Elder, Pastor...')!, 'LCC Chairperson');
    const createButton = Array.from(document.body.querySelectorAll('button')).find((button) =>
      button.textContent === 'Create shell',
    ) as HTMLButtonElement;
    await act(async () => createButton.click());

    await vi.waitFor(() => expect(mocks.createMemorialPage).toHaveBeenCalled());
    expect(mocks.createMemorialPage).toHaveBeenCalledWith('access-token', {
      full_name: 'Rev. Jane Doe',
      is_visible: false,
      role_title: 'LCC Chairperson',
      slug: 'rev-jane-doe',
      status: 'DRAFT',
    });
    expect(mocks.toastSuccess).toHaveBeenCalledWith('Memorial shell created.');
  });
});
