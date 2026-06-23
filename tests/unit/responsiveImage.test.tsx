// @vitest-environment jsdom

import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import ResponsiveImage from '../../src/components/media/ResponsiveImage';
import { readyMediaVariants, type MediaAsset } from '../../src/services/mediaAssetsApi';

const asset: MediaAsset = {
  alt_text: 'Church frontage',
  caption: '',
  height: 576,
  id: 8,
  original_url: 'https://example.test/original.jpg',
  status: 'ready',
  title: 'Church',
  uuid: 'asset-8',
  variant_map: {
    avif: { small: { format: 'avif', size_name: 'small', status: 'ready', url: 'https://example.test/small.avif', width: 640, height: 360, id: 1, file_size: 1, quality: 55, generated_at: null } },
    jpeg: { small: { format: 'jpeg', size_name: 'small', status: 'ready', url: 'https://example.test/small.jpg', width: 640, height: 360, id: 2, file_size: 1, quality: 82, generated_at: null } },
    webp: { small: { format: 'webp', size_name: 'small', status: 'ready', url: 'https://example.test/small.webp', width: 640, height: 360, id: 3, file_size: 1, quality: 78, generated_at: null } },
  },
  variants: [],
  width: 1024,
};

describe('responsive media rendering', () => {
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

  it('uses only ready variants and keeps sparse maps safe', () => {
    expect(readyMediaVariants(asset, 'webp')).toHaveLength(1);
    expect(readyMediaVariants({ ...asset, status: 'processing' }, 'webp')).toEqual([]);
  });

  it('renders AVIF, WebP, and JPEG fallback sources with layout dimensions', async () => {
    await act(async () => {
      root.render(<ResponsiveImage asset={asset} preset="card" />);
    });

    expect(container.querySelector('source[type="image/avif"]')?.getAttribute('srcset')).toContain('small.avif');
    expect(container.querySelector('source[type="image/webp"]')?.getAttribute('srcset')).toContain('small.webp');
    expect(container.querySelector('img')?.getAttribute('src')).toContain('small.jpg');
    expect(container.querySelector('img')?.getAttribute('width')).toBe('1024');
    expect(container.querySelector('img')?.getAttribute('height')).toBe('576');
  });
});
