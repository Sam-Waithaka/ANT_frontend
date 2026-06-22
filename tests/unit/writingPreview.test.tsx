// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import WritingPreview from '../../src/components/portal/writing/WritingPreview';

describe('WritingPreview', () => {
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

  it('renders article metadata and the shared read-only content pipeline', async () => {
    await act(async () => {
      root.render(
        <WritingPreview
          contentJson={{ root: { children: [{ children: [{ text: 'Oh Come Let Us Worship', type: 'text', version: 1 }], direction: null, format: '', indent: 0, type: 'paragraph', version: 1 }], direction: null, format: '', indent: 0, type: 'root', version: 1 } }}
          darkMode={false}
          excerpt="A quiet invitation to worship."
          title="Psalm 95:6"
        />,
      );
    });

    expect(container.querySelector('[aria-label="Article preview"]')).not.toBeNull();
    expect(container.querySelector('[aria-label="Article preview content"]')).not.toBeNull();
    expect(container.textContent).toContain('Psalm 95:6');
    expect(container.textContent).toContain('A quiet invitation to worship.');
  });
});
