// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WritingEditorPage from '../../src/pages/portal/writing/WritingEditorPage';

const mocks = vi.hoisted(() => ({
  approveWriting: vi.fn(),
  archiveWriting: vi.fn(),
  authPermissions: [
    'writings.view_any_draft_writing',
    'writings.edit_any_writing',
    'writings.review_writing',
    'writings.publish_writing',
  ],
  createWritingMediaEmbed: vi.fn(),
  createWritingRevision: vi.fn(),
  createWritingScriptureReference: vi.fn(),
  deleteWritingMediaEmbed: vi.fn(),
  deleteWritingScriptureReference: vi.fn(),
  fetchMediaAsset: vi.fn(),
  fetchResourceTypes: vi.fn(),
  fetchWorkflowNotes: vi.fn(),
  fetchWriting: vi.fn(),
  fetchWritingScriptureReferences: vi.fn(),
  fetchWritingTags: vi.fn(),
  publishWriting: vi.fn(),
  returnWritingToDraft: vi.fn(),
  scheduleWriting: vi.fn(),
  submitWritingForReview: vi.fn(),
  unscheduleWriting: vi.fn(),
  updateWriting: vi.fn(),
  updateWritingMediaEmbed: vi.fn(),
  updateWritingScriptureReference: vi.fn(),
}));

vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({ accessToken: 'access-token', permissions: mocks.authPermissions, user: { id: 7 } }),
}));

vi.mock('../../src/hooks/useTheme', () => ({
  useTheme: () => ({ darkMode: false }),
}));

vi.mock('../../src/hooks/useDebouncedWritingSave', () => ({
  useDebouncedWritingSave: () => ({ saveNow: vi.fn().mockResolvedValue(undefined), saveState: 'idle' }),
}));

vi.mock('../../src/components/portal/writing/WritingStudioShell', () => ({
  default: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

vi.mock('../../src/components/portal/writing/DocumentSettingsPanel', () => ({
  default: ({ actions, workflowControl }: { actions: Array<{ disabled?: boolean; label: string; onClick: () => void }>; workflowControl?: React.ReactNode }) => (
    <aside aria-label="Document settings">
      <div data-testid="settings-actions">
        {actions.map((action) => <button disabled={action.disabled} key={action.label} onClick={action.onClick} type="button">{action.label}</button>)}
      </div>
      <section>{workflowControl}</section>
    </aside>
  ),
}));

vi.mock('../../src/components/portal/writing/WritingWorkflowControls', () => ({
  default: ({ canReturnToDraft, canSubmitForReview, canUnschedule, workflowNotes }: { canReturnToDraft: boolean; canSubmitForReview: boolean; canUnschedule: boolean; workflowNotes?: Array<{ note: string }> }) => (
    <section aria-label="Workflow controls">
      <p>submit:{String(canSubmitForReview)}</p>
      <p>return:{String(canReturnToDraft)}</p>
      <p>unschedule:{String(canUnschedule)}</p>
      <div data-testid="workflow-notes">{workflowNotes?.map((note) => <p key={note.note}>{note.note}</p>)}</div>
    </section>
  ),
  WritingPublishingPanel: () => <aside>Publishing panel</aside>,
}));

vi.mock('../../src/components/portal/writing/editor/ArticleEditor', () => ({
  default: () => <section>Article editor</section>,
}));

vi.mock('../../src/components/portal/writing/WritingPreview', () => ({
  default: () => <section>Writing preview</section>,
}));

vi.mock('../../src/components/portal/writing/WritingStatusBadge', () => ({
  default: ({ status }: { status: string }) => <span>{status}</span>,
}));

vi.mock('../../src/components/portal/writing/media/CoverImagePicker', () => ({
  default: () => <div>Cover image picker</div>,
}));

vi.mock('../../src/components/portal/writing/media/WritingMediaEmbedPicker', () => ({
  default: () => <div>Media embed picker</div>,
}));

vi.mock('../../src/services/mediaAssetsApi', () => ({
  fetchMediaAsset: mocks.fetchMediaAsset,
}));

vi.mock('../../src/services/writingApi', () => ({
  approveWriting: mocks.approveWriting,
  archiveWriting: mocks.archiveWriting,
  createWritingMediaEmbed: mocks.createWritingMediaEmbed,
  createWritingRevision: mocks.createWritingRevision,
  createWritingScriptureReference: mocks.createWritingScriptureReference,
  deleteWritingMediaEmbed: mocks.deleteWritingMediaEmbed,
  deleteWritingScriptureReference: mocks.deleteWritingScriptureReference,
  fetchResourceTypes: mocks.fetchResourceTypes,
  fetchWorkflowNotes: mocks.fetchWorkflowNotes,
  fetchWriting: mocks.fetchWriting,
  fetchWritingScriptureReferences: mocks.fetchWritingScriptureReferences,
  fetchWritingTags: mocks.fetchWritingTags,
  publishWriting: mocks.publishWriting,
  returnWritingToDraft: mocks.returnWritingToDraft,
  scheduleWriting: mocks.scheduleWriting,
  submitWritingForReview: mocks.submitWritingForReview,
  unscheduleWriting: mocks.unscheduleWriting,
  updateWriting: mocks.updateWriting,
  updateWritingMediaEmbed: mocks.updateWritingMediaEmbed,
  updateWritingScriptureReference: mocks.updateWritingScriptureReference,
}));

const writing = (overrides: Record<string, unknown> = {}) => ({
  author_attributions: [],
  author_ids: [7],
  categories: [],
  content_json: { root: { children: [], type: 'root' } },
  excerpt: '',
  id: 4,
  is_author: true,
  media_embeds: [],
  ministries: [],
  og_image: null,
  og_image_detail: null,
  reading_time_minutes: 0,
  resource_type: null,
  scheduled_for: null,
  series: [],
  status: 'IN_REVIEW',
  tags: [],
  title: 'Mercy in the Morning',
  updated_at: '2026-07-09T09:00:00Z',
  workflow_notes: [{ id: 99, note: 'Legacy inline note should not be used.', created_at: '2026-07-09T08:00:00Z' }],
  ...overrides,
});

const renderPage = async (root: Root) => {
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={["/portal/writing/4"]}>
        <Routes>
          <Route element={<WritingEditorPage />} path="/portal/writing/:id" />
        </Routes>
      </MemoryRouter>,
    );
    await Promise.resolve();
  });
};

describe('WritingEditorPage workflow context', () => {
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
    Object.values(mocks).forEach((value) => {
      if (typeof value === 'function' && 'mockReset' in value) value.mockReset();
    });
    mocks.fetchResourceTypes.mockResolvedValue({ count: 0, next: null, previous: null, results: [] });
    mocks.fetchWritingTags.mockResolvedValue({ count: 0, next: null, previous: null, results: [] });
    mocks.fetchWriting.mockResolvedValue(writing());
    mocks.fetchWritingScriptureReferences.mockResolvedValue({ count: 0, next: null, previous: null, results: [] });
    mocks.fetchWorkflowNotes.mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [{ id: 1, writing: 4, note: 'Dedicated workflow note.', action: 'REVIEW', created_at: '2026-07-09T09:00:00Z' }],
    });
    mocks.approveWriting.mockResolvedValue(writing({ reviewed_at: '2026-07-09T10:00:00Z' }));
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('loads dedicated workflow notes for the current writing', async () => {
    await renderPage(root);

    await vi.waitFor(() => expect(container.textContent).toContain('Dedicated workflow note.'));
    expect(mocks.fetchWorkflowNotes).toHaveBeenCalledWith('access-token', 4, expect.any(AbortSignal));
    expect(container.textContent).not.toContain('Legacy inline note should not be used.');
  });

  it('shows approve action through editorial permissions and refreshes writing plus notes', async () => {
    mocks.fetchWorkflowNotes
      .mockResolvedValueOnce({ count: 1, next: null, previous: null, results: [{ id: 1, writing: 4, note: 'Before approval.', created_at: '2026-07-09T09:00:00Z' }] })
      .mockResolvedValueOnce({ count: 1, next: null, previous: null, results: [{ id: 2, writing: 4, note: 'After approval.', created_at: '2026-07-09T10:00:00Z' }] });

    await renderPage(root);
    await vi.waitFor(() => expect(container.textContent).toContain('Before approval.'));

    await act(async () => ([...container.querySelectorAll('button')].find((button) => button.textContent === 'Approve') as HTMLButtonElement).click());

    expect(mocks.approveWriting).toHaveBeenCalledWith('access-token', 4);
    expect(mocks.fetchWorkflowNotes).toHaveBeenCalledTimes(2);
    await vi.waitFor(() => expect(container.textContent).toContain('After approval.'));
  });

  it('hides approve action without review permission', async () => {
    mocks.authPermissions = ['writings.view_any_draft_writing', 'writings.edit_any_writing'];

    await renderPage(root);
    await vi.waitFor(() => expect(container.textContent).toContain('Article editor'));

    expect([...container.querySelectorAll('button')].some((button) => button.textContent === 'Approve')).toBe(false);
  });
});
