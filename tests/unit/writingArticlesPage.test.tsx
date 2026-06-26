// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Writing } from '../../src/types/writing';
import WritingArticlesPage from '../../src/pages/portal/writing/WritingArticlesPage';

const mocks = vi.hoisted(() => ({
  fetchWritings: vi.fn(),
}));

vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({ accessToken: 'access-token', permissions: [] }),
}));

vi.mock('../../src/hooks/useTheme', () => ({
  useTheme: () => ({ darkMode: false }),
}));

vi.mock('../../src/services/writingApi', () => ({
  fetchWritings: mocks.fetchWritings,
}));

vi.mock('../../src/components/portal/writing/WritingStudioShell', () => ({
  default: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

vi.mock('../../src/components/portal/writing/WritingArticleCard', () => ({
  default: ({ writing }: { writing: Writing }) => <article>{writing.title}</article>,
}));


const writing = (id: number, title: string): Writing => ({
  content_json: {},
  id,
  status: 'DRAFT',
  title,
});

const renderPage = async (root: Root, initialEntry = '/portal/writing/articles') => {
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <WritingArticlesPage />
      </MemoryRouter>,
    );
  });
};

const changeSelect = async (select: HTMLSelectElement, value: string) => {
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')?.set;
    setter?.call(select, value);
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
};

const changeInput = async (input: HTMLInputElement, value: string) => {
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    setter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
};

describe('WritingArticlesPage pagination', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    mocks.fetchWritings.mockReset();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('initializes the status filter from the URL and fetches page one', async () => {
    mocks.fetchWritings.mockResolvedValueOnce({
      count: 1,
      next: null,
      previous: null,
      results: [writing(1, 'Draft Article')],
    });

    await renderPage(root, '/portal/writing/articles?status=DRAFT');
    await vi.waitFor(() => expect(container.textContent).toContain('Draft Article'));

    expect((container.querySelector('select') as HTMLSelectElement).value).toBe('DRAFT');
    expect(mocks.fetchWritings).toHaveBeenCalledWith('access-token', {
      page: 1,
      page_size: 24,
      search: '',
      status: 'DRAFT',
    }, expect.any(AbortSignal));
  });

  it('shows load more only when next exists and appends the next page with the same filters', async () => {
    mocks.fetchWritings
      .mockResolvedValueOnce({ count: 3, next: '/v1/writings/?page=2', previous: null, results: [writing(1, 'First Article')] })
      .mockResolvedValueOnce({ count: 3, next: null, previous: '/v1/writings/?page=1', results: [writing(1, 'First Article'), writing(2, 'Second Article')] });

    await renderPage(root, '/portal/writing/articles?status=DRAFT');
    await vi.waitFor(() => expect(container.textContent).toContain('First Article'));

    const loadMore = [...container.querySelectorAll('button')].find((button) => button.textContent === 'Load more') as HTMLButtonElement;
    expect(loadMore).toBeTruthy();

    await act(async () => loadMore.click());
    await vi.waitFor(() => expect(container.textContent).toContain('Second Article'));

    expect(mocks.fetchWritings).toHaveBeenLastCalledWith('access-token', {
      page: 2,
      page_size: 24,
      search: '',
      status: 'DRAFT',
    }, expect.any(AbortSignal));
    expect(container.textContent?.match(/First Article/g)).toHaveLength(1);
    expect(container.textContent).not.toContain('Load more');
  });

  it('resets to page one when filters change', async () => {
    mocks.fetchWritings
      .mockResolvedValueOnce({ count: 3, next: '/v1/writings/?page=2', previous: null, results: [writing(1, 'Initial Draft')] })
      .mockResolvedValueOnce({ count: 3, next: null, previous: '/v1/writings/?page=1', results: [writing(2, 'Older Draft')] })
      .mockResolvedValueOnce({ count: 1, next: null, previous: null, results: [writing(3, 'Faith Draft')] })
      .mockResolvedValueOnce({ count: 1, next: null, previous: null, results: [writing(4, 'Published Faith')] });

    await renderPage(root, '/portal/writing/articles?status=DRAFT');
    await vi.waitFor(() => expect(container.textContent).toContain('Initial Draft'));

    const loadMore = [...container.querySelectorAll('button')].find((button) => button.textContent === 'Load more') as HTMLButtonElement;
    await act(async () => loadMore.click());
    await vi.waitFor(() => expect(container.textContent).toContain('Older Draft'));

    await changeInput(container.querySelector('input') as HTMLInputElement, 'faith');
    await vi.waitFor(() => expect(container.textContent).toContain('Faith Draft'));
    expect(mocks.fetchWritings).toHaveBeenLastCalledWith('access-token', {
      page: 1,
      page_size: 24,
      search: 'faith',
      status: 'DRAFT',
    }, expect.any(AbortSignal));
    expect(container.textContent).not.toContain('Older Draft');

    await changeSelect(container.querySelector('select') as HTMLSelectElement, 'PUBLISHED');
    await vi.waitFor(() => expect(container.textContent).toContain('Published Faith'));
    expect(mocks.fetchWritings).toHaveBeenLastCalledWith('access-token', {
      page: 1,
      page_size: 24,
      search: 'faith',
      status: 'PUBLISHED',
    }, expect.any(AbortSignal));
  });
});


