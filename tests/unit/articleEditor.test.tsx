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

  it('renders a Phase 1 editing canvas, toolbar, and status footer', async () => {
    await act(async () => {
      root.render(<ArticleEditor darkMode={false} />);
    });

    expect(container.querySelector('[aria-label="Article body editor"]')).not.toBeNull();
    expect(container.querySelector('[aria-label="Article body"]')).not.toBeNull();
    expect(container.querySelector('[aria-label="Bold"]')).not.toBeNull();
    expect(container.querySelector('[aria-label="Italic"]')).not.toBeNull();
    expect(container.querySelector('[aria-label="Underline"]')).not.toBeNull();
    expect(container.querySelector('[aria-label="Bulleted list"]')).not.toBeNull();
    expect(container.textContent).toContain('Words: 0');
    expect(container.textContent).toContain('Not saved yet');
  });
});
