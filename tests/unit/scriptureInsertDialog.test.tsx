// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ScriptureInsertDialog from '../../src/components/portal/writing/editor/ScriptureInsertDialog';

const setValue = (element: HTMLInputElement | HTMLTextAreaElement, value: string) => {
  const prototype = element.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, 'value')?.set?.call(element, value);
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
};

describe('ScriptureInsertDialog', () => {
  let container: HTMLDivElement;
  let root: Root;
  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify([]), { status: 200 })));
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });
  it('inserts a manual Scripture snapshot as an inline reference', async () => {
    const onInsert = vi.fn();
    await act(async () => {
      root = createRoot(container);
      root.render(<ScriptureInsertDialog darkMode={false} onClose={() => undefined} onInsert={onInsert} />);
      await Promise.resolve();
    });
    const manualTab = Array.from(container.querySelectorAll('button')).find((button) => button.textContent === 'Manual Scripture Text') as HTMLButtonElement;
    await act(async () => manualTab.click());
    const [reference, version] = Array.from(container.querySelectorAll('input')).filter((input) => (input as HTMLInputElement).type === 'text') as HTMLInputElement[];
    const text = container.querySelector('textarea') as HTMLTextAreaElement;
    const inline = container.querySelector('input[value="inline"]') as HTMLInputElement;
    await act(async () => {
      setValue(reference, 'Psalm 119:105');
      setValue(version, 'AMP');
      setValue(text, 'Your word is a lamp to my feet.');
      inline.click();
    });
    const insert = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Insert Scripture')) as HTMLButtonElement;
    await act(async () => insert.click());
    expect(onInsert).toHaveBeenCalledWith({ display: 'inline', reference: 'Psalm 119:105', source: 'manual', text: 'Your word is a lamp to my feet.', version: 'AMP' });
  });
});

