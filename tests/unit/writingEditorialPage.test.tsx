// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WritingEditorialPage from '../../src/pages/portal/writing/WritingEditorialPage';

const mocks = vi.hoisted(() => ({
  approveWriting: vi.fn(),
  archiveWriting: vi.fn(),
  createWorkflowNote: vi.fn(),
  publishWriting: vi.fn(),
  deleteWorkflowNote: vi.fn(),
  updateWorkflowNote: vi.fn(),
  authPermissions: [
    'writings.view_any_draft_writing',
    'writings.edit_any_writing',
    'writings.review_writing',
    'writings.publish_writing',
  ],
  fetchEditorialQueue: vi.fn(),
  fetchWorkflowNotes: vi.fn(),
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
  archiveWriting: mocks.archiveWriting,
  createWorkflowNote: mocks.createWorkflowNote,
  deleteWorkflowNote: mocks.deleteWorkflowNote,
  fetchEditorialQueue: mocks.fetchEditorialQueue,
  fetchWorkflowNotes: mocks.fetchWorkflowNotes,
  publishWriting: mocks.publishWriting,
  fetchWritings: mocks.fetchWritings,
  updateWorkflowNote: mocks.updateWorkflowNote,
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

const changeField = async (field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, value: string) => {
  await act(async () => {
    const prototype = field instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : field instanceof HTMLSelectElement
        ? HTMLSelectElement.prototype
        : HTMLInputElement.prototype;
    const valueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
    valueSetter?.call(field, value);
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
  });
};

const clickButton = async (label: string) => {
  const button = [...document.body.querySelectorAll('button')].find((item) => item.textContent === label) as HTMLButtonElement | undefined;
  if (!button) throw new Error(`Button not found: ${label}`);
  await act(async () => button.click());
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
    mocks.archiveWriting.mockReset();
    mocks.createWorkflowNote.mockReset();
    mocks.publishWriting.mockReset();
    mocks.deleteWorkflowNote.mockReset();
    mocks.updateWorkflowNote.mockReset();
    mocks.fetchEditorialQueue.mockReset();
    mocks.fetchWorkflowNotes.mockReset();
    mocks.fetchWritings.mockReset();
    mocks.approveWriting.mockResolvedValue({ id: 4 });
    mocks.archiveWriting.mockResolvedValue({ id: 4 });
    mocks.createWorkflowNote.mockResolvedValue({ id: 9 });
    mocks.publishWriting.mockResolvedValue({ id: 4 });
    mocks.deleteWorkflowNote.mockResolvedValue(undefined);
    mocks.updateWorkflowNote.mockResolvedValue({ id: 1 });
    mocks.fetchEditorialQueue.mockResolvedValue({ count: 0, next: null, previous: null, results: [] });
    mocks.fetchWritings.mockResolvedValue({ count: 0, next: null, previous: null, results: [] });
    mocks.fetchWorkflowNotes.mockResolvedValue({ count: 0, next: null, previous: null, results: [] });
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('renders status summary and queue items from the editorial APIs', async () => {
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
    expect(container.textContent).toContain('Writing status landscape');
    expect(mocks.fetchEditorialQueue).toHaveBeenCalledWith('access-token', { page: 1, page_size: 24 }, expect.any(AbortSignal));
    expect(mocks.fetchWritings).toHaveBeenCalledWith('access-token', { page: 1, page_size: 3, status: 'DRAFT' }, expect.any(AbortSignal));
    expect(mocks.fetchWritings).toHaveBeenCalledWith('access-token', { page: 1, page_size: 3, status: 'IN_REVIEW' }, expect.any(AbortSignal));
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



  it('opens editorial notes, loads them by writing id, and renders them chronologically', async () => {
    mocks.fetchEditorialQueue.mockResolvedValueOnce({ count: 1, next: null, previous: null, results: [queueItem()] });
    mocks.fetchWorkflowNotes.mockResolvedValueOnce({
      count: 2,
      next: null,
      previous: null,
      results: [
        { id: 2, writing: 4, note: 'Second note.', action: 'REVIEW', created_by_detail: { id: 2, name: 'Editor Jane' }, created_at: '2026-07-09T08:00:00Z' },
        { id: 1, writing: 4, note: 'First note.', action: 'SUBMIT', created_by_detail: { id: 1, name: 'Author One' }, created_at: '2026-07-09T07:00:00Z' },
      ],
    });

    await renderPage(root);
    await vi.waitFor(() => expect(container.textContent).toContain('Mercy in the Morning'));

    await act(async () => ([...container.querySelectorAll('button')].find((button) => button.textContent === 'View notes') as HTMLButtonElement).click());

    expect(mocks.fetchWorkflowNotes).toHaveBeenCalledWith('access-token', 4);
    await vi.waitFor(() => expect(document.body.textContent).toContain('Notes for Mercy in the Morning'));
    const bodyText = document.body.textContent || '';
    expect(bodyText.indexOf('First note.')).toBeLessThan(bodyText.indexOf('Second note.'));
    expect(bodyText).toContain('Author One');
    expect(bodyText).toContain('Editor Jane');
    expect(bodyText).toContain('SUBMIT');
    expect(bodyText).toContain('REVIEW');
  });

  it('shows an empty notes state in the editorial notes modal', async () => {
    mocks.fetchEditorialQueue.mockResolvedValueOnce({ count: 1, next: null, previous: null, results: [queueItem({ latest_workflow_note: null, workflow_notes_count: 0 })] });
    mocks.fetchWorkflowNotes.mockResolvedValueOnce({ count: 0, next: null, previous: null, results: [] });

    await renderPage(root);
    await vi.waitFor(() => expect(container.textContent).toContain('Mercy in the Morning'));

    await act(async () => ([...container.querySelectorAll('button')].find((button) => button.textContent === 'View notes') as HTMLButtonElement).click());

    await vi.waitFor(() => expect(document.body.textContent).toContain('No editorial notes yet.'));
  });

  it('creates a workflow note and refreshes notes when the user can manage notes', async () => {
    mocks.authPermissions = [...mocks.authPermissions, 'writings.manage_workflow_notes'];
    mocks.fetchEditorialQueue.mockResolvedValueOnce({ count: 1, next: null, previous: null, results: [queueItem()] });
    mocks.fetchWorkflowNotes
      .mockResolvedValueOnce({ count: 0, next: null, previous: null, results: [] })
      .mockResolvedValueOnce({ count: 1, next: null, previous: null, results: [{ id: 9, writing: 4, note: 'New pastoral note.', action: 'REVIEW', created_at: '2026-07-09T09:00:00Z' }] });

    await renderPage(root);
    await vi.waitFor(() => expect(container.textContent).toContain('Mercy in the Morning'));
    await clickButton('View notes');
    await vi.waitFor(() => expect(document.body.textContent).toContain('Add workflow note'));

    await changeField(document.body.querySelector('input[placeholder="Optional action label"]') as HTMLInputElement, 'REVIEW');
    await changeField(document.body.querySelector('textarea[placeholder="Write an editorial note..."]') as HTMLTextAreaElement, 'New pastoral note.');
    await clickButton('Add note');

    expect(mocks.createWorkflowNote).toHaveBeenCalledWith('access-token', { writing: 4, note: 'New pastoral note.', action: 'REVIEW' });
    expect(mocks.fetchWorkflowNotes).toHaveBeenCalledTimes(2);
    await vi.waitFor(() => expect(document.body.textContent).toContain('New pastoral note.'));
  });

  it('hides workflow note mutation controls without manage_workflow_notes permission', async () => {
    mocks.fetchEditorialQueue.mockResolvedValueOnce({ count: 1, next: null, previous: null, results: [queueItem()] });
    mocks.fetchWorkflowNotes.mockResolvedValueOnce({
      count: 1,
      next: null,
      previous: null,
      results: [{ id: 1, writing: 4, note: 'Read-only note.', action: 'REVIEW', created_at: '2026-07-09T08:00:00Z' }],
    });

    await renderPage(root);
    await vi.waitFor(() => expect(container.textContent).toContain('Mercy in the Morning'));
    await clickButton('View notes');

    await vi.waitFor(() => expect(document.body.textContent).toContain('Read-only note.'));
    expect(document.body.textContent).not.toContain('Add workflow note');
    expect([...document.body.querySelectorAll('button')].some((button) => button.textContent === 'Edit note')).toBe(false);
    expect([...document.body.querySelectorAll('button')].some((button) => button.textContent === 'Delete note')).toBe(false);
  });

  it('blocks empty workflow note submission', async () => {
    mocks.authPermissions = [...mocks.authPermissions, 'writings.manage_workflow_notes'];
    mocks.fetchEditorialQueue.mockResolvedValueOnce({ count: 1, next: null, previous: null, results: [queueItem()] });
    mocks.fetchWorkflowNotes.mockResolvedValueOnce({ count: 0, next: null, previous: null, results: [] });

    await renderPage(root);
    await vi.waitFor(() => expect(container.textContent).toContain('Mercy in the Morning'));
    await clickButton('View notes');
    await vi.waitFor(() => expect(document.body.textContent).toContain('Add workflow note'));

    const addButton = [...document.body.querySelectorAll('button')].find((button) => button.textContent === 'Add note') as HTMLButtonElement;
    expect(addButton.disabled).toBe(true);
    expect(mocks.createWorkflowNote).not.toHaveBeenCalled();
  });

  it('edits a workflow note and refreshes notes', async () => {
    mocks.authPermissions = [...mocks.authPermissions, 'writings.manage_workflow_notes'];
    mocks.fetchEditorialQueue.mockResolvedValueOnce({ count: 1, next: null, previous: null, results: [queueItem()] });
    mocks.fetchWorkflowNotes
      .mockResolvedValueOnce({ count: 1, next: null, previous: null, results: [{ id: 1, writing: 4, note: 'Needs work.', action: 'REVIEW', created_at: '2026-07-09T08:00:00Z' }] })
      .mockResolvedValueOnce({ count: 1, next: null, previous: null, results: [{ id: 1, writing: 4, note: 'Ready now.', action: 'APPROVE', created_at: '2026-07-09T08:00:00Z' }] });

    await renderPage(root);
    await vi.waitFor(() => expect(container.textContent).toContain('Mercy in the Morning'));
    await clickButton('View notes');
    await vi.waitFor(() => expect(document.body.textContent).toContain('Needs work.'));

    await clickButton('Edit note');
    const actionInputs = [...document.body.querySelectorAll('input[placeholder="Optional action label"]')] as HTMLInputElement[];
    await changeField(actionInputs[actionInputs.length - 1], 'APPROVE');
    await changeField([...document.body.querySelectorAll('textarea')].find((field) => field.value === 'Needs work.') as HTMLTextAreaElement, 'Ready now.');
    await clickButton('Save note');

    expect(mocks.updateWorkflowNote).toHaveBeenCalledWith('access-token', 1, { note: 'Ready now.', action: 'APPROVE' });
    expect(mocks.fetchWorkflowNotes).toHaveBeenCalledTimes(2);
    await vi.waitFor(() => expect(document.body.textContent).toContain('Ready now.'));
  });

  it('requires confirmation before deleting a workflow note and refreshes after delete', async () => {
    mocks.authPermissions = [...mocks.authPermissions, 'writings.manage_workflow_notes'];
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
    mocks.fetchEditorialQueue.mockResolvedValueOnce({ count: 1, next: null, previous: null, results: [queueItem()] });
    mocks.fetchWorkflowNotes
      .mockResolvedValueOnce({ count: 1, next: null, previous: null, results: [{ id: 1, writing: 4, note: 'Delete me.', action: 'REVIEW', created_at: '2026-07-09T08:00:00Z' }] })
      .mockResolvedValueOnce({ count: 0, next: null, previous: null, results: [] });

    await renderPage(root);
    await vi.waitFor(() => expect(container.textContent).toContain('Mercy in the Morning'));
    await clickButton('View notes');
    await vi.waitFor(() => expect(document.body.textContent).toContain('Delete me.'));

    await clickButton('Delete note');
    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(mocks.deleteWorkflowNote).not.toHaveBeenCalled();

    await clickButton('Delete note');
    expect(mocks.deleteWorkflowNote).toHaveBeenCalledWith('access-token', 1);
    expect(mocks.fetchWorkflowNotes).toHaveBeenCalledTimes(2);
    await vi.waitFor(() => expect(document.body.textContent).toContain('No editorial notes yet.'));
    confirmSpy.mockRestore();
  });


  it('publishes a writing and refreshes the desk', async () => {
    mocks.fetchEditorialQueue
      .mockResolvedValueOnce({ count: 1, next: null, previous: null, results: [queueItem()] })
      .mockResolvedValueOnce({ count: 0, next: null, previous: null, results: [] });

    await renderPage(root);
    await vi.waitFor(() => expect(container.textContent).toContain('Mercy in the Morning'));
    await clickButton('Publish');

    expect(mocks.publishWriting).toHaveBeenCalledWith('access-token', 4);
    expect(mocks.fetchEditorialQueue).toHaveBeenCalledTimes(2);
  });

  it('archives a writing after confirmation and refreshes the desk', async () => {
    mocks.authPermissions = [...mocks.authPermissions, 'writings.archive_writing'];
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValueOnce(true);
    mocks.fetchEditorialQueue
      .mockResolvedValueOnce({ count: 1, next: null, previous: null, results: [queueItem()] })
      .mockResolvedValueOnce({ count: 0, next: null, previous: null, results: [] });

    await renderPage(root);
    await vi.waitFor(() => expect(container.textContent).toContain('Mercy in the Morning'));
    await clickButton('Archive');

    expect(confirmSpy).toHaveBeenCalledWith('Archive this writing?');
    expect(mocks.archiveWriting).toHaveBeenCalledWith('access-token', 4);
    expect(mocks.fetchEditorialQueue).toHaveBeenCalledTimes(2);
    confirmSpy.mockRestore();
  });

  it('calls the editorial queue endpoint with a status filter', async () => {
    mocks.fetchEditorialQueue.mockResolvedValue({ count: 0, next: null, previous: null, results: [] });
    mocks.fetchWritings.mockResolvedValue({ count: 0, next: null, previous: null, results: [] });

    await renderPage(root);
    await vi.waitFor(() => expect(mocks.fetchEditorialQueue).toHaveBeenCalledTimes(1));

    await changeField(document.body.querySelector('#editorial-status-filter') as HTMLSelectElement, 'IN_REVIEW');

    await vi.waitFor(() => expect(mocks.fetchEditorialQueue).toHaveBeenCalledWith('access-token', { page: 1, page_size: 24, status: 'IN_REVIEW' }, expect.any(AbortSignal)));
  });

  it('calls the editorial queue endpoint with search text', async () => {
    mocks.fetchEditorialQueue.mockResolvedValue({ count: 0, next: null, previous: null, results: [] });
    mocks.fetchWritings.mockResolvedValue({ count: 0, next: null, previous: null, results: [] });

    await renderPage(root);
    await vi.waitFor(() => expect(mocks.fetchEditorialQueue).toHaveBeenCalledTimes(1));

    await changeField(document.body.querySelector('#editorial-search-filter') as HTMLInputElement, 'mercy');

    await vi.waitFor(() => expect(mocks.fetchEditorialQueue).toHaveBeenCalledWith('access-token', { page: 1, page_size: 24, search: 'mercy' }, expect.any(AbortSignal)));
  });

  it('resets to page 1 when filters change', async () => {
    mocks.fetchEditorialQueue
      .mockResolvedValueOnce({ count: 2, next: '/v1/writings/editorial-queue/?page=2', previous: null, results: [queueItem({ id: 1, title: 'First Page' })] })
      .mockResolvedValueOnce({ count: 2, next: null, previous: '/v1/writings/editorial-queue/?page=1', results: [queueItem({ id: 2, title: 'Second Page' })] })
      .mockResolvedValueOnce({ count: 1, next: null, previous: null, results: [queueItem({ id: 3, title: 'Filtered Page', status: 'SCHEDULED' })] });

    await renderPage(root);
    await vi.waitFor(() => expect(container.textContent).toContain('First Page'));
    await clickButton('Load more');
    await vi.waitFor(() => expect(container.textContent).toContain('Second Page'));

    await changeField(document.body.querySelector('#editorial-status-filter') as HTMLSelectElement, 'SCHEDULED');

    await vi.waitFor(() => expect(mocks.fetchEditorialQueue).toHaveBeenLastCalledWith('access-token', { page: 1, page_size: 24, status: 'SCHEDULED' }, expect.any(AbortSignal)));
    await vi.waitFor(() => expect(container.textContent).toContain('Filtered Page'));
    expect(container.textContent).not.toContain('First Page');
  });

  it('appends results when loading more', async () => {
    mocks.fetchEditorialQueue
      .mockResolvedValueOnce({ count: 2, next: '/v1/writings/editorial-queue/?page=2', previous: null, results: [queueItem({ id: 1, title: 'First Page' })] })
      .mockResolvedValueOnce({ count: 2, next: null, previous: '/v1/writings/editorial-queue/?page=1', results: [queueItem({ id: 2, title: 'Second Page', status: 'SCHEDULED' })] });

    await renderPage(root);
    await vi.waitFor(() => expect(container.textContent).toContain('First Page'));
    await clickButton('Load more');

    await vi.waitFor(() => expect(container.textContent).toContain('Second Page'));
    expect(container.textContent).toContain('First Page');
    expect(mocks.fetchEditorialQueue).toHaveBeenLastCalledWith('access-token', { page: 2, page_size: 24 }, undefined);
  });

  it('hides load more when the editorial queue has no next page', async () => {
    mocks.fetchEditorialQueue.mockResolvedValueOnce({ count: 1, next: null, previous: null, results: [queueItem()] });

    await renderPage(root);
    await vi.waitFor(() => expect(container.textContent).toContain('Mercy in the Morning'));

    expect([...document.body.querySelectorAll('button')].some((button) => button.textContent === 'Load more')).toBe(false);
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
