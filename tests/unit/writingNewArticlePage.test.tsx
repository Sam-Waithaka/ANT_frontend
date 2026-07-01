// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WritingNewArticlePage from '../../src/pages/portal/writing/WritingNewArticlePage';

const mocks = vi.hoisted(() => ({
  createWriting: vi.fn(),
  createWritingScriptureReference: vi.fn(),
  fetchResourceTypes: vi.fn(),
  fetchWritingTags: vi.fn(),
}));

vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({ accessToken: 'access-token', permissions: ['writings.create_writing'] }),
}));

vi.mock('../../src/hooks/useTheme', () => ({
  useTheme: () => ({ darkMode: false }),
}));

vi.mock('../../src/services/writingApi', () => ({
  createWriting: mocks.createWriting,
  createWritingScriptureReference: mocks.createWritingScriptureReference,
  fetchResourceTypes: mocks.fetchResourceTypes,
  fetchWritingTags: mocks.fetchWritingTags,
}));

vi.mock('../../src/services/mediaAssetsApi', () => ({
  fetchMediaAsset: vi.fn(),
}));

vi.mock('../../src/components/portal/writing/WritingStudioShell', () => ({
  default: ({ children, intro }: { children: React.ReactNode; intro?: React.ReactNode }) => <main>{intro}{children}</main>,
}));

vi.mock('../../src/components/portal/writing/editor/ArticleEditor', () => ({
  default: ({ onChange }: { onChange?: (content: unknown) => void }) => (
    <button
      aria-label="Mock editor"
      onClick={() => onChange?.({
        root: {
          children: [{
            data: {
              book_osis: 'John',
              chapter_start: 3,
              display: 'block',
              display_text: 'John 3:16',
              reference: 'John 3:16',
              source: 'api',
              text: 'For God so loved the world.',
              verse_start: 16,
              version: 'BSB',
            },
            type: 'scripture-block',
          }],
          type: 'root',
          version: 1,
        },
      })}
      type="button"
    />
  ),
}));

vi.mock('../../src/components/portal/writing/WritingPreview', () => ({
  default: () => <div aria-label="Mock preview" />,
}));

vi.mock('../../src/components/portal/writing/media/CoverImagePicker', () => ({
  default: () => <div aria-label="Mock cover image picker" />,
}));

vi.mock('../../src/components/portal/writing/DocumentSettingsPanel', () => ({
  default: ({ actions, onResourceTypeChange, resourceType, resourceTypes }: {
    actions: Array<{ disabled?: boolean; label: string; onClick: () => void }>;
    onResourceTypeChange: (value: string) => void;
    resourceType: string;
    resourceTypes: Array<{ id: number | string; name: string }>;
  }) => (
    <aside aria-label="Document settings">
      <select aria-label="Resource type" onChange={(event) => onResourceTypeChange(event.target.value)} value={resourceType}>
        <option value="">Choose type</option>
        {resourceTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
      </select>
      {actions.map((action) => <button disabled={action.disabled} key={action.label} onClick={action.onClick} type="button">{action.label}</button>)}
    </aside>
  ),
}));

const renderPage = async (root: Root) => {
  await act(async () => {
    root.render(
      <MemoryRouter>
        <WritingNewArticlePage />
      </MemoryRouter>,
    );
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

const getCreateDraftButton = (container: HTMLElement) => (
  Array.from(container.querySelectorAll('button')).find((button) => button.textContent === 'Create draft' || button.textContent === 'Creating draft...') as HTMLButtonElement
);
describe('WritingNewArticlePage resource types', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    mocks.createWriting.mockReset();
    mocks.createWritingScriptureReference.mockReset();
    mocks.createWritingScriptureReference.mockResolvedValue({ id: 21 });
    mocks.fetchResourceTypes.mockReset();
    mocks.fetchWritingTags.mockReset();
    mocks.fetchWritingTags.mockResolvedValue({ count: 0, next: null, previous: null, results: [] });
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('does not offer fake fallback resource types when resource types fail to load', async () => {
    mocks.fetchResourceTypes.mockRejectedValueOnce(new Error('Network failed'));

    await renderPage(root);
    await vi.waitFor(() => expect(container.textContent).toContain('Resource types could not be loaded. Please refresh and try again.'));

    const resourceTypeSelect = container.querySelector('[aria-label="Resource type"]') as HTMLSelectElement;
    expect([...resourceTypeSelect.options].map((option) => option.text)).toEqual(['Choose type']);
    expect(container.textContent).not.toContain('Devotional');
    expect(getCreateDraftButton(container).disabled).toBe(true);
    expect(mocks.createWriting).not.toHaveBeenCalled();
  });

  it('creates a draft only with a real backend resource type id', async () => {
    mocks.fetchResourceTypes.mockResolvedValueOnce({
      count: 1,
      next: null,
      previous: null,
      results: [{ id: 7, name: 'Devotional', slug: 'devotional' }],
    });
    mocks.createWriting.mockResolvedValueOnce({ id: 12, status: 'DRAFT', title: 'Known By God' });

    await renderPage(root);
    await vi.waitFor(() => expect(container.textContent).toContain('Devotional'));

    await changeInput(container.querySelector('input') as HTMLInputElement, 'Known By God');
    await changeSelect(container.querySelector('[aria-label="Resource type"]') as HTMLSelectElement, '7');
    await act(async () => getCreateDraftButton(container).click());

    await vi.waitFor(() => expect(mocks.createWriting).toHaveBeenCalled());
    expect(mocks.createWriting).toHaveBeenCalledWith('access-token', expect.objectContaining({
      resource_type: '7',
      status: 'DRAFT',
      title: 'Known By God',
    }));
    expect(mocks.createWriting.mock.calls[0][1]).not.toHaveProperty('scripture_references');
    expect(mocks.createWritingScriptureReference).not.toHaveBeenCalled();
  });

  it('creates Scripture references after creating the draft', async () => {
    mocks.fetchResourceTypes.mockResolvedValueOnce({
      count: 1,
      next: null,
      previous: null,
      results: [{ id: 7, name: 'Devotional', slug: 'devotional' }],
    });
    mocks.createWriting.mockResolvedValueOnce({ id: 12, status: 'DRAFT', title: 'Known By God' });

    await renderPage(root);
    await vi.waitFor(() => expect(container.textContent).toContain('Devotional'));

    await act(async () => (container.querySelector('[aria-label="Mock editor"]') as HTMLButtonElement).click());
    await changeInput(container.querySelector('input') as HTMLInputElement, 'Known By God');
    await changeSelect(container.querySelector('[aria-label="Resource type"]') as HTMLSelectElement, '7');
    await act(async () => getCreateDraftButton(container).click());

    await vi.waitFor(() => expect(mocks.createWritingScriptureReference).toHaveBeenCalled());
    expect(mocks.createWriting.mock.calls[0][1]).not.toHaveProperty('scripture_references');
    expect(mocks.createWritingScriptureReference).toHaveBeenCalledWith('access-token', {
      book_osis: 'John',
      chapter_end: null,
      chapter_start: 3,
      display_text: 'John 3:16',
      verse_end: null,
      verse_start: 16,
      version: 'BSB',
      writing: 12,
    });
  });
});

