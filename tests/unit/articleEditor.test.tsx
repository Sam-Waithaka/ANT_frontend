// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import ArticleEditor from '../../src/components/portal/writing/editor/ArticleEditor';

describe('ArticleEditor', () => {
  let container: HTMLDivElement;
  let root: Root;
  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });
  it('renders the writing canvas with all supported heading and inline formatting controls', async () => {
    await act(async () => { root.render(<ArticleEditor darkMode={false} />); });
    expect(container.querySelector('[aria-label="Article body editor"]')).not.toBeNull();
    expect(container.querySelector('[aria-label="Article body"]')).not.toBeNull();
    ['Bold', 'Italic', 'Underline', 'Strikethrough', 'Superscript', 'Subscript', 'Editorial emphasis', 'Bulleted list'].forEach((label) => {
      expect(container.querySelector(`[aria-label="${label}"]`)).not.toBeNull();
    });
    const blockType = container.querySelector('[aria-label="Block type"]') as HTMLSelectElement;
    expect(Array.from(blockType.options).map((option) => option.text)).toEqual(expect.arrayContaining(['Heading 2', 'Heading 3', 'Heading 4', 'Heading 5', 'Heading 6']));
    expect(container.textContent).toContain('Words: 0');
    expect(container.textContent).toContain('Not saved yet');
  });
});
