// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WritingMediaEmbedPicker from '../../src/components/portal/writing/media/WritingMediaEmbedPicker';

describe('WritingMediaEmbedPicker', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ results: [] }), { headers: { 'Content-Type': 'application/json' }, status: 200 })));
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  it('opens on Upload for permitted writers and retains a reusable Library tab', async () => {
    await act(async () => {
      root.render(<WritingMediaEmbedPicker accessToken="token" canUpload darkMode={false} onClose={vi.fn()} onSelect={vi.fn().mockResolvedValue(undefined)} />);
    });

    expect(container.textContent).toContain('Drop an image here or choose from your computer');
    expect(container.textContent).toContain('Library');
  });

  it('hides upload controls without media-upload permission', async () => {
    await act(async () => {
      root.render(<WritingMediaEmbedPicker accessToken="token" canUpload={false} darkMode={false} onClose={vi.fn()} onSelect={vi.fn().mockResolvedValue(undefined)} />);
    });

    expect(container.textContent).toContain('Library');
    expect(container.textContent).not.toContain('Drop an image here or choose from your computer');
  });
});
