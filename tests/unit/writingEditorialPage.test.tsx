// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WritingEditorialPage from '../../src/pages/portal/writing/WritingEditorialPage';

const mocks = vi.hoisted(() => ({
  approveWriting: vi.fn(),
  authPermissions: [
    'writings.view_any_draft_writing',
    'writings.edit_any_writing',
    'writings.review_writing',
    'writings.publish_writing',
  ],
  fetchEditorialQueue: vi.fn(),
  fetchWritings: vi.fn(),
}));

vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    accessToken: 'access-token',
    permissions: mocks.authPermissions,
    user: { id: 7 },
  }),
}));

vi.mock('../../src/hooks/useTheme', () => ({
  useTheme: () => ({ darkMode: false }),
}));

vi.mock('../../src/components/portal/writing/WritingStudioShell', () => ({
  default: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

vi.mock('../../src/services/writingApi', () => ({
  approveWriting: mocks.approveWriting,
  fetchEditorialQueue: mocks.fetchEditorialQueue,
  fetchWritings: mocks.fetchWritings,
}));

const renderPage = async (root: Root) => {
  await act(async () => {
    root.render(
      <MemoryRouter>
        <WritingEditorialPage />
      </MemoryRouter>,
    );
    await Promise.resolve();
  });
};


const queueItem = (overrides: Record<string, unknown> = {}) => ({
  id: 4,
  author_attributions: [{ display_name: 'AIC Editorial Team', is_primary: true }],
  author_ids: [7],
  is_author: true,
  latest_workflow_note: {
    created_at: '2026-07-09T07:00:00Z',
    created_by_detail: { id: 2, name: 'Editor Jane' },
    id: 44,
    note: 'Please tighten the introduction.',
    writing: 4,
  },
  reviewed_at: null,
  status: 'IN_REVIEW',
  submitted_at: '2026-07-09T06:00:00Z',
  title: 'Mercy in the Morning',
  workflow_notes_count: 3,
  ...overrides,
});

describe('WritingEditorialPage', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    mocks.authPermissions = [
      'writings.view_any_draft_writing',
      'writings.edit_any_writing',
      'writings.review_writing',
      'writings.publish_writing',
    ];
    mocks.approveWriting.mockReset();
    mocks.fetchEditorialQueue.mockReset();
    mocks.fetchWritings.mockReset();
    mocks.approveWriting.mockResolvedValue({ id: 4 });
    mocks.fetchEditorialQueue.mockResolvedValue({ count: 0, next: null, previous: null, results: [] });
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('renders queue items from fetchEditorialQueue and does not call fetchWritings', async () => {
    mocks.fetchEditorialQueue.mockResolvedValueOnce({
      count: 1,
      next: null,
      previous: null,
      results: [queueItem()],
    });

    await renderPage(root);

    await vi.waitFor(() => expect(container.textContent).toContain('Mercy in the Morning'));
    expect(container.textContent).toContain('In review');
    expect(container.textContent).toContain('By AIC Editorial Team');
    expect(container.textContent).toContain('3 notes');
    expect(container.textContent).toContain('Please tighten the introduction.');
    expect(container.textContent).toContain('Editor Jane');
    expect(container.textContent).toContain('Your writing');
    expect(mocks.fetchEditorialQueue).toHaveBeenCalledWith('access-token', { page: 1, page_size: 24 }, expect.any(AbortSignal));
    expect(mocks.fetchWritings).not.toHaveBeenCalled();
  });



  it('shows Approve only with review permission', async () => {
    mocks.fetchEditorialQueue.mockResolvedValueOnce({ count: 1, next: null, previous: null, results: [queueItem()] });

    await renderPage(root);

    await vi.waitFor(() => expect(container.textContent).toContain('Mercy in the Morning'));
    expect([...container.querySelectorAll('button')].some((button) => button.textContent === 'Approve')).toBe(true);

    act(() => root.unmount());
    container.innerHTML = '';
    root = createRoot(container);
    mocks.authPermissions = ['writings.view_any_draft_writing', 'writings.publish_writing'];
    mocks.fetchEditorialQueue.mockResolvedValueOnce({ count: 1, next: null, previous: null, results: [queueItem()] });

    await renderPage(root);

    await vi.waitFor(() => expect(container.textContent).toContain('Mercy in the Morning'));
    expect([...container.querySelectorAll('button')].some((button) => button.textContent === 'Approve')).toBe(false);
  });

  it('approves a writing and refreshes the editorial queue', async () => {
    mocks.fetchEditorialQueue
      .mockResolvedValueOnce({ count: 1, next: null, previous: null, results: [queueItem()] })
      .mockResolvedValueOnce({ count: 0, next: null, previous: null, results: [] });

    await renderPage(root);
    await vi.waitFor(() => expect(container.textContent).toContain('Mercy in the Morning'));

    await act(async () => ([...container.querySelectorAll('button')].find((button) => button.textContent === 'Approve') as HTMLButtonElement).click());

    expect(mocks.approveWriting).toHaveBeenCalledWith('access-token', 4);
    expect(mocks.fetchEditorialQueue).toHaveBeenCalledTimes(2);
    await vi.waitFor(() => expect(container.textContent).toContain('No writings need editorial attention.'));
    expect(container.textContent).not.toContain('APPROVED');
  });

  it('shows a friendly approval error and refreshes stale queue state', async () => {
    mocks.approveWriting.mockRejectedValueOnce(new Error('Forbidden'));
    mocks.fetchEditorialQueue
      .mockResolvedValueOnce({ count: 1, next: null, previous: null, results: [queueItem()] })
      .mockResolvedValueOnce({ count: 1, next: null, previous: null, results: [queueItem({ title: 'Still Waiting' })] });

    await renderPage(root);
    await vi.waitFor(() => expect(container.textContent).toContain('Mercy in the Morning'));

    await act(async () => ([...container.querySelectorAll('button')].find((button) => button.textContent === 'Approve') as HTMLButtonElement).click());

    expect(mocks.approveWriting).toHaveBeenCalledWith('access-token', 4);
    expect(mocks.fetchEditorialQueue).toHaveBeenCalledTimes(2);
    expect(container.textContent).toContain('Unable to approve this writing.');
    await vi.waitFor(() => expect(container.textContent).toContain('Still Waiting'));
    expect(container.textContent).not.toContain('APPROVED');
  });

  it('shows a loading state while the queue request is pending', async () => {
    mocks.fetchEditorialQueue.mockReturnValueOnce(new Promise(() => undefined));

    await renderPage(root);

    expect(container.querySelector('.animate-pulse')).not.toBeNull();
  });

  it('shows an intentional empty state', async () => {
    await renderPage(root);

    await vi.waitFor(() => expect(container.textContent).toContain('No writings need editorial attention.'));
  });

  it('shows an error state when the editorial queue fails', async () => {
    mocks.fetchEditorialQueue.mockRejectedValueOnce(new Error('Nope'));

    await renderPage(root);

    await vi.waitFor(() => expect(container.textContent).toContain('Unable to load the editorial queue right now.'));
  });

  it('shows a permission message without calling the queue', async () => {
    mocks.authPermissions = [];

    await renderPage(root);

    expect(container.textContent).toContain('Editorial review requires draft, review, publishing, or archive permissions.');
    expect(mocks.fetchEditorialQueue).not.toHaveBeenCalled();
  });
});
