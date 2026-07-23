// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import ResourceCard from '../../src/components/resources/ResourceCard';
import type { PublicWritingCard } from '../../src/types/writing';

const article = (overrides: Partial<PublicWritingCard> = {}): PublicWritingCard => ({
  author_attributions: [{ display_name: 'Pastor Jane', id: 1, is_primary: true, order: 0, role: 'AUTHOR' }],
  author_display: 'Pastor Jane',
  byline: 'Pastor Jane',
  categories: [{ description: 'Wisdom category.', id: 2, is_active: true, is_featured: true, name: 'Wisdom', parent: null, slug: 'wisdom', sort_order: 0, writing_count: 1 }],
  excerpt: 'Wisdom for living faithfully.',
  id: 10,
  ministries: [],
  og_image_detail: null,
  published_at: '2026-07-17T09:00:00Z',
  reading_time_minutes: 6,
  resource_type_detail: { id: 1, name: 'Bible Study', slug: 'bible-study', description: '', is_active: true, is_featured: true, sort_order: 0, writing_count: 2 },
  scripture_references: [],
  seo_description: 'SEO description.',
  seo_title: 'SEO title',
  series: [{ cover_image_detail: null, description: 'A series on Proverbs.', id: 7, slug: 'proverbs', title: 'Book of Proverbs', writing_count: 4 }],
  slug: 'true-security-from-proverbs-21',
  tags: [],
  title: 'True Security from Proverbs 21',
  writing_type: 'ARTICLE',
  ...overrides,
});

const renderCard = async (root: Root, item: PublicWritingCard, variant?: 'compact' | 'feature' | 'masonry' | 'rail') => {
  await act(async () => {
    root.render(<ResourceCard article={item} variant={variant} />);
    await Promise.resolve();
  });
};

describe('ResourceCard', () => {
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

  it('renders an intentional editorial cover when the article has no cover image', async () => {
    await renderCard(root, article());

    expect(container.querySelector('[data-resource-card-cover="editorial"]')).not.toBeNull();
    expect(container.querySelector('[data-editorial-book-object="true"]')).not.toBeNull();
    expect(container.textContent).toContain('Bible Study');
    expect(container.textContent).toContain('Wisdom');
    expect(container.textContent).toContain('Book of Proverbs');
    expect(container.textContent).toContain('True Security from Proverbs 21');
  });


  it('uses the editorial cover as the whole card and supports multiple authors', async () => {
    await renderCard(root, article({
      author_attributions: [
        { display_name: 'Grace W.', id: 2, is_primary: false, order: 1, role: 'AUTHOR' },
        { display_name: 'Samuel Waithaka', id: 1, is_primary: true, order: 0, role: 'AUTHOR' },
      ],
      author_display: 'Fallback Author',
      byline: 'Fallback Byline',
    }));

    expect(container.querySelector('[data-resource-card-mode="editorial-cover-only"]')).not.toBeNull();
    expect(container.textContent).toContain('Samuel Waithaka & Grace W.');
    expect(container.textContent).not.toContain('Fallback Byline');
  });

  it('renders the photography cover path when the article has a cover image', async () => {
    await renderCard(root, article({
      og_image_detail: {
        alt_text: 'Church building',
        caption: '',
        height: 800,
        id: 99,
        original_url: '/media/church.jpg',
        status: 'READY',
        title: 'Church cover',
        uuid: 'image-99',
        variant_map: {},
        variants: [],
        width: 1200,
      },
    }));

    expect(container.querySelector('[data-resource-card-cover="photography"]')).not.toBeNull();
    expect(container.querySelector('img[src="/media/church.jpg"]')).not.toBeNull();
  });

  it('renders image-backed articles as compact masonry cards', async () => {
    await renderCard(root, article({
      og_image_detail: {
        alt_text: 'Church building',
        caption: '',
        height: 800,
        id: 99,
        original_url: '/media/church.jpg',
        status: 'READY',
        title: 'Church cover',
        uuid: 'image-99',
        variant_map: {},
        variants: [],
        width: 1200,
      },
    }), 'masonry');

    expect(container.querySelector('[data-resource-card-mode="masonry-image"]')).not.toBeNull();
    expect(container.querySelector('[data-resource-card-cover="photography"]')).not.toBeNull();
    expect(container.textContent).toContain('True Security from Proverbs 21');
  });
});
