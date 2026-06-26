// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DocumentSettingsPanel from '../../src/components/portal/writing/DocumentSettingsPanel';

const jsonResponse = (payload: unknown) => new Response(JSON.stringify(payload), {
  headers: { 'Content-Type': 'application/json' },
  status: 200,
});

const setSelectValue = (select: HTMLSelectElement, value: string) => {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')?.set;
  setter?.call(select, value);
  select.dispatchEvent(new Event('change', { bubbles: true }));
};

describe('DocumentSettingsPanel', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  it('loads taxonomy options and edits rich metadata for the selected resource type', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({
      categories: [{ id: 2, name: 'Proverbs', slug: 'proverbs' }],
      ministries: [{ id: 5, name: 'Youth Ministry', slug: 'youth' }],
      series: [{ id: 3, slug: 'proverbs-lessons', title: 'Proverbs Lessons' }],
    }));
    vi.stubGlobal('fetch', fetchMock);
    const onCategoryChange = vi.fn();
    const onSeriesIdsChange = vi.fn();
    const onMinistryIdsChange = vi.fn();
    const onTagIdsChange = vi.fn();
    const onAuthorAttributionsChange = vi.fn();

    await act(async () => {
      root = createRoot(container);
      root.render(
        <DocumentSettingsPanel
          actions={[]}
          authorAttributions={[]}
          canManageAuthors
          category=""
          darkMode={false}
          excerpt=""
          onAuthorAttributionsChange={onAuthorAttributionsChange}
          onCategoryChange={onCategoryChange}
          onExcerptChange={() => undefined}
          onMinistryIdsChange={onMinistryIdsChange}
          onResourceTypeChange={() => undefined}
          onSeriesIdsChange={onSeriesIdsChange}
          onTagIdsChange={onTagIdsChange}
          resourceType="1"
          resourceTypes={[{ id: 1, name: 'Bible Study', slug: 'bible-study' }]}
          status="DRAFT"
          tagOptions={[{ id: 8, name: 'Prayer', slug: 'prayer' }]}
        />,
      );
      await Promise.resolve();
    });

    expect(fetchMock).toHaveBeenCalledWith('/v1/resources/navigation/?resource_type_slug=bible-study', expect.anything());
    const articleDetailsToggle = [...container.querySelectorAll('button')].find((button) => button.textContent?.includes('Article details')) as HTMLButtonElement;
    await act(async () => articleDetailsToggle.click());
    expect(container.textContent).toContain('Proverbs Lessons');
    expect(container.textContent).toContain('Youth Ministry');
    expect(container.textContent).toContain('Prayer');

    const detailsCheckboxes = container.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
    await act(async () => detailsCheckboxes[0].click());
    await act(async () => detailsCheckboxes[1].click());
    await act(async () => detailsCheckboxes[2].click());
    expect(onSeriesIdsChange).toHaveBeenCalledWith([3]);
    expect(onMinistryIdsChange).toHaveBeenCalledWith([5]);
    expect(onTagIdsChange).toHaveBeenCalledWith([8]);

    const addAuthor = [...container.querySelectorAll('button')].find((button) => button.textContent?.includes('Add')) as HTMLButtonElement;
    await act(async () => addAuthor.click());
    expect(onAuthorAttributionsChange).toHaveBeenCalledWith([{ display_name: '', role: 'AUTHOR', is_primary: true, order: 0 }]);

    const presentationToggle = [...container.querySelectorAll('button')].find((button) => button.textContent?.includes('Public presentation')) as HTMLButtonElement;
    await act(async () => presentationToggle.click());
    expect(container.textContent).toContain('0 / 200');

    const categorySelect = [...container.querySelectorAll('select')].find((select) => [...select.options].some((option) => option.text === 'Proverbs')) as HTMLSelectElement;
    await act(async () => setSelectValue(categorySelect, '2'));
    expect(onCategoryChange).toHaveBeenCalledWith('2');
  });
});
