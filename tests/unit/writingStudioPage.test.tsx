// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WritingStudioPage from '../../src/pages/portal/writing/WritingStudioPage';
import type { Writing } from '../../src/types/writing';

const mocks = vi.hoisted(() => ({
  fetchEditorialQueue: vi.fn(),
  fetchWritings: vi.fn(),
  permissions: [] as string[],
}));

vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({ accessToken: 'access-token', permissions: mocks.permissions }),
}));

vi.mock('../../src/hooks/useTheme', () => ({
  useTheme: () => ({ darkMode: false }),
}));

vi.mock('../../src/services/writingApi', () => ({
  fetchEditorialQueue: mocks.fetchEditorialQueue,
  fetchWritings: mocks.fetchWritings,
}));

vi.mock('../../src/components/portal/writing/WritingStudioShell', () => ({
  default: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

const page = <T,>(results: T[], count = results.length) => ({ count, next: null, previous: null, results });

const writing = (overrides: Partial<Writing> = {}): Writing => ({
  content_json: {},
  created_at: '2026-07-10T06:30:00Z',
  id: 4,
  status: 'DRAFT',
  title: 'Do You Know Him?',
  updated_at: '2026-07-10T07:30:00Z',
  ...overrides,
});

const renderPage = async (root: Root) => {
  await act(async () => {
    root.render(
      <MemoryRouter>
        <WritingStudioPage />
      </MemoryRouter>,
    );
  });
};

describe('WritingStudioPage', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    mocks.permissions = [];
    mocks.fetchEditorialQueue.mockReset();
    mocks.fetchWritings.mockReset();
    mocks.fetchWritings
      .mockResolvedValueOnce(page([]))
      .mockResolvedValueOnce(page([]))
      .mockResolvedValueOnce(page([]));
    mocks.fetchEditorialQueue.mockResolvedValue(page([]));
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('renders the editorial mission hero and loads article status summaries', async () => {
    mocks.permissions = ['writings.edit_own_writing'];
    mocks.fetchWritings
      .mockReset()
      .mockResolvedValueOnce(page([writing()], 1))
      .mockResolvedValueOnce(page([]))
      .mockResolvedValueOnce(page([]));

    await renderPage(root);

    await vi.waitFor(() => expect(container.textContent).toContain('Do You Know Him?'));
    expect(container.textContent).toContain('Continue Writing');
    expect(container.querySelector('a[href="/portal/writing/4"]')).not.toBeNull();
    expect(mocks.fetchWritings).toHaveBeenCalledWith('access-token', { page: 1, page_size: 1, status: 'DRAFT' }, expect.any(AbortSignal));
    expect(mocks.fetchWritings).toHaveBeenCalledWith('access-token', { page: 1, page_size: 1, status: 'IN_REVIEW' }, expect.any(AbortSignal));
    expect(mocks.fetchWritings).toHaveBeenCalledWith('access-token', { page: 1, page_size: 1, status: 'PUBLISHED' }, expect.any(AbortSignal));
  });

  it('does not expose create, library, or editorial actions without permission', async () => {
    await renderPage(root);
    await vi.waitFor(() => expect(container.textContent).toContain("You're all caught up."));

    expect(container.textContent).not.toContain('New Article');
    expect(container.textContent).not.toContain('Curate discovery');
    expect(container.textContent).not.toContain('Open Editorial Queue');
    expect(container.textContent).not.toContain('Announcements');
    expect(container.querySelector('a[href="/portal/writing/new"]')).toBeNull();
    expect(container.querySelector('a[href="/portal/writing/library"]')).toBeNull();
    expect(container.querySelector('a[href="/portal/writing/editorial"]')).toBeNull();
    expect(mocks.fetchEditorialQueue).not.toHaveBeenCalled();
  });

  it('prioritizes the editorial queue for reviewers and exposes permitted actions', async () => {
    mocks.permissions = [
      'writings.create_writing',
      'writings.manage_taxonomy',
      'writings.review_writing',
      'writings.view_any_draft_writing',
    ];
    mocks.fetchWritings
      .mockReset()
      .mockResolvedValueOnce(page([writing()], 4))
      .mockResolvedValueOnce(page([writing({ id: 7, status: 'IN_REVIEW', title: 'Submitted Article' })], 2))
      .mockResolvedValueOnce(page([writing({ id: 9, status: 'PUBLISHED', title: 'Published Article' })], 8));
    mocks.fetchEditorialQueue.mockResolvedValueOnce(page([writing({ id: 7, status: 'IN_REVIEW', title: 'Submitted Article' })], 2));

    await renderPage(root);

    await vi.waitFor(() => expect(container.textContent).toContain('2 items awaiting review'));
    expect(container.textContent).toContain('Most recent: Submitted Article');
    expect(container.textContent).toContain('New Article');
    expect(container.textContent).toContain('Curate discovery');
    expect(container.textContent).toContain('Open Editorial Queue');
    expect(container.querySelector('a[href="/portal/writing/new"]')).not.toBeNull();
    expect(container.querySelector('a[href="/portal/writing/library"]')).not.toBeNull();
    expect(container.querySelector('a[href="/portal/writing/editorial"]')).not.toBeNull();
    expect(mocks.fetchEditorialQueue).toHaveBeenCalledWith('access-token', { page: 1, page_size: 1 }, expect.any(AbortSignal));
  });
});
