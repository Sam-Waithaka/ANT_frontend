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

  it('loads curated categories and shows collection guidance for the selected resource type', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({
      categories: [{ id: 2, name: 'Proverbs', slug: 'proverbs' }],
      series: [{ id: 3, slug: 'proverbs-lessons', title: 'Proverbs Lessons' }],
    }));
    vi.stubGlobal('fetch', fetchMock);
    const onCategoryChange = vi.fn();

    await act(async () => {
      root = createRoot(container);
      root.render(
        <DocumentSettingsPanel
          actions={[]}
          category=""
          darkMode={false}
          excerpt=""
          onCategoryChange={onCategoryChange}
          onExcerptChange={() => undefined}
          onResourceTypeChange={() => undefined}
          resourceType="1"
          resourceTypes={[{ id: 1, name: 'Bible Study', slug: 'bible-study' }]}
          status="DRAFT"
        />,
      );
      await Promise.resolve();
    });

    expect(fetchMock).toHaveBeenCalledWith('/v1/resources/navigation/?resource_type_slug=bible-study', expect.anything());
    expect(container.textContent).toContain('Proverbs Lessons');

    const categorySelect = container.querySelectorAll('select')[2] as HTMLSelectElement;
    await act(async () => setSelectValue(categorySelect, '2'));
    expect(onCategoryChange).toHaveBeenCalledWith('2');
  });
});
