// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WritingNewArticlePage from '../../src/pages/portal/writing/WritingNewArticlePage';

const mocks = vi.hoisted(() => ({
  createWriting: vi.fn(),
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
  default: () => <div aria-label="Mock editor" />,
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

describe('WritingNewArticlePage resource types', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    mocks.createWriting.mockReset();
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
    expect((container.querySelector('button:last-of-type') as HTMLButtonElement).disabled).toBe(true);
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
    await act(async () => (container.querySelector('button:last-of-type') as HTMLButtonElement).click());

    await vi.waitFor(() => expect(mocks.createWriting).toHaveBeenCalled());
    expect(mocks.createWriting).toHaveBeenCalledWith('access-token', expect.objectContaining({
      resource_type: '7',
      status: 'DRAFT',
      title: 'Known By God',
    }));
  });
});

